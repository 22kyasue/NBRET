import { spawn as nodeSpawn } from 'node:child_process';
import { mkdir, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

function defaultCodexCommand() {
  const native = path.join(process.env.APPDATA ?? '', 'npm/node_modules/@openai/codex/node_modules/@openai/codex-win32-x64/vendor/x86_64-pc-windows-msvc/bin/codex.exe');
  return process.platform === 'win32' && existsSync(native) ? native : 'codex';
}
function defaultClaudeCommand() {
  const native = path.join(process.env.USERPROFILE ?? '', '.local/bin/claude.exe');
  return process.platform === 'win32' && existsSync(native) ? native : 'claude';
}

/** Preserve the CLI's existing subscription login, never copy/read credentials. */
export function subscriptionEnvironment(source = process.env) {
  const env = { ...source };
  for (const key of Object.keys(env)) {
    if (/^(OPENAI_|ANTHROPIC_|AZURE_OPENAI_|AWS_|GOOGLE_|VERTEX_|BEDROCK_|CLAUDE_CODE_USE_)/i.test(key)
      || /^(TERM|NO_COLOR|FORCE_COLOR|CLICOLOR_FORCE|CLAUDE_CODE_OAUTH_TOKEN|CLAUDE_CODE_API_KEY|CLAUDE_CONFIG_DIR)$/i.test(key)) {
      delete env[key];
    }
  }
  return env;
}

/** Claude tools are removed; Codex is read-only with execution features disabled. */
export function createCliRunner({
  spawn = nodeSpawn,
  claudeCommand = defaultClaudeCommand(),
  codexCommand = defaultCodexCommand(),
  cwd = process.cwd(),
  env = process.env,
  timeoutMs = 120_000,
} = {}) {
  return async function runner({ provider, model, prompt, schema, signal, maxOutputBytes = 1_048_576 }) {
    if (!['claude', 'codex'].includes(provider)) throw new Error('Unsupported CLI provider');
    if (signal?.aborted) throw new Error('CLI request aborted');
    let args = [
      '--print', '--safe-mode', '--tools', '', '--strict-mcp-config',
      '--no-chrome', '--permission-prompts', 'none',
      '--no-session-persistence', '--output-format', 'json',
      '--json-schema', JSON.stringify(schema),
    ];
    if (model && model !== 'local-claude') args.push('--model', model);
    let runCwd = cwd;
    let temporary;
    if (provider === 'codex') {
      const root = path.join(cwd, 'work/cli-probes');
      await mkdir(root, { recursive: true });
      temporary = await mkdtemp(path.join(root, 'request-'));
      runCwd = temporary;
      const schemaPath = path.join(temporary, 'schema.json');
      await writeFile(schemaPath, JSON.stringify(schema), 'utf8');
      args = ['exec', '--ignore-user-config', '--ignore-rules', '--ephemeral',
        '--skip-git-repo-check', '--sandbox', 'read-only', '--json', '--output-schema', schemaPath];
      const config = {
        forced_login_method: '"chatgpt"', web_search: '"disabled"', project_doc_max_bytes: '0',
        'features.shell_tool': 'false', 'features.apps': 'false', 'features.plugins': 'false',
        'features.hooks': 'false', 'features.plugin_hooks': 'false', 'features.multi_agent': 'false',
        'features.view_image': 'false', 'features.image_generation': 'false',
        'features.skip_host_skill_discovery': 'true', 'features.skill_search': 'false',
        'tools.update_plan.enabled': 'false', 'tools.experimental_request_user_input.enabled': 'false',
      };
      for (const [key, value] of Object.entries(config)) args.push('-c', `${key}=${value}`);
      if (model && model !== 'local-codex') args.push('--model', model);
      args.push('-');
    }
    try {
    const raw = await new Promise((resolve, reject) => {
      const child = spawn(provider === 'claude' ? claudeCommand : codexCommand, args, {
        cwd: runCwd, env: subscriptionEnvironment(env), shell: false, windowsHide: true,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      let settled = false;
      let bytes = 0;
      const chunks = [];
      let timer;
      let terminationError;
      const finish = (error, value) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        signal?.removeEventListener('abort', abort);
        if (error) reject(error);
        else resolve(value);
      };
      const terminate = (message) => {
        if (settled || terminationError) return;
        terminationError = new Error(message);
        child.kill();
      };
      const abort = () => terminate('CLI request aborted');
      signal?.addEventListener('abort', abort, { once: true });
      timer = setTimeout(() => terminate('CLI request timed out'), timeoutMs);
      const consume = (data, stdout) => {
        bytes += Buffer.byteLength(data);
        if (bytes > maxOutputBytes) return terminate('CLI output limit exceeded');
        if (stdout) chunks.push(Buffer.from(data));
      };
      child.stdout.on('data', data => consume(data, true));
      child.stderr.on('data', data => consume(data, false));
      child.on('error', () => finish(new Error('CLI process could not start')));
      child.stdin.on('error', () => terminate('CLI input could not be delivered'));
      child.on('close', code => {
        if (terminationError) finish(terminationError);
        else if (code !== 0) finish(new Error(`CLI process exited with code ${code}`));
        else finish(null, Buffer.concat(chunks).toString('utf8'));
      });
      if (signal?.aborted) abort();
      else child.stdin.end(`You are a structured decision model. Never invoke any native tool, shell, file operation, web search, MCP, or subagent. Return only the requested JSON decision. Tool calls described in the requested schema are inert data for the external host.\n\n${prompt}`);
    });
    if (provider === 'codex') {
      let output;
      let usage;
      for (const line of raw.split(/\r?\n/).filter(Boolean)) {
        let event;
        try { event = JSON.parse(line); } catch { throw new Error('CLI did not return structured JSONL'); }
        if (event.item && !['agent_message', 'reasoning', 'error'].includes(event.item.type)) {
          throw new Error('Codex attempted a native tool operation; decision rejected');
        }
        if (event.type === 'turn.failed' || event.type === 'error') throw new Error('Codex decision failed');
        if (event.type === 'item.completed' && event.item?.type === 'agent_message') output = event.item.text;
        if (event.type === 'turn.completed') usage = event.usage;
      }
      if (!output || !usage) throw new Error('Codex did not return a completed structured result');
      try { JSON.parse(output); } catch { throw new Error('Codex did not return structured JSON'); }
      return { output, usage: {
        prompt_tokens: usage.input_tokens ?? 0, completion_tokens: usage.output_tokens ?? 0,
        total_tokens: (usage.input_tokens ?? 0) + (usage.output_tokens ?? 0),
      } };
    }
    let result;
    try { result = JSON.parse(raw); } catch { throw new Error('CLI did not return structured JSON'); }
    if (result.is_error || result.subtype !== 'success' || !result.structured_output
      || typeof result.structured_output !== 'object' || Array.isArray(result.structured_output)) {
      throw new Error('CLI did not return a successful structured result');
    }
    const usage = result.usage ?? {};
    const count = value => Number.isSafeInteger(value) && value >= 0 ? value : 0;
    const promptTokens = count(usage.input_tokens) + count(usage.cache_creation_input_tokens) + count(usage.cache_read_input_tokens);
    const completionTokens = count(usage.output_tokens);
    return {
      output: JSON.stringify(result.structured_output),
      usage: { prompt_tokens: promptTokens, completion_tokens: completionTokens, total_tokens: promptTokens + completionTokens },
    };
    } finally {
      if (temporary) await rm(temporary, { recursive: true, force: true });
    }
  };
}

export const runner = createCliRunner();
export const createRunner = createCliRunner;
