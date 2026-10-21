# ARTEX local subscription bridge

Windowsでログイン済みのCodex CLI（ChatGPT契約）とClaude Code（Claude契約）を、ARTEXのLLMプロファイルとして利用するローカルアダプターです。各CLIの正規の認証を使用します。認証トークンを読み出したり、外部APIへコピーしたりしません。

## 起動

前提: Node.js、ログイン済みの `codex` と `claude`、Docker上のARTEX。

ARTEXリポジトリから:

```powershell
powershell -NoProfile -File tools/local-cli-bridge/start.ps1
docker compose -p synapse-artex -f compose.local up -d
```

ブリッジは `127.0.0.1:18789` のみで待ち受けます。PC再起動後は再度起動してください。`work/cli-bridge` はGit対象外で、ブリッジ専用の認証キー・PID・診断ログを置きます。認証キーはサブスクの認証情報とは別です。

## ARTEX設定

画面: http://localhost:18787/system/llm/

| 設定 | Codex | Claude |
|---|---|---|
| Format | OpenAI | OpenAI |
| Model | `local-codex` | `local-claude` |
| Base URL | `http://host.docker.internal:18789/v1` | 同左 |
| API key | `work/cli-bridge/token` の内容 | 同左 |
| Streaming output | OFF | OFF |
| Exclude from rotation | ON | ON |

利用するプロファイルの「Set active」で既定を切り替えます。チャット入力欄の下の「Change」でも会話ごとに選択できます。自動ローテーションを除外し、意図せず別契約に切り替わることを防ぎます。

## 動作と制限

- ARTEXの履歴とツール定義をCLIへ送り、構造化された応答をOpenAI形式の `tool_calls` に変換します。ツール実行はARTEXが担当します。
- APIの完全互換ではありません。テキストとツール呼び出しを扱い、画像入力は未対応です。未知のツール引数Schemaは明示的に拒否します。
- 返答はCLIの処理完了後に表示します。SSE互換出力もバッファ済みで、リアルタイムのトークン配信ではありません。
- 既存サブスクの利用上限が適用されます。APIキーを使う有料APIへの自動フォールバックはありません。
- 各プロバイダーは同時に1件処理し、最大4件を待機させます。標準タイムアウトは120秒です。ARTEX自身の接続テストは30秒制限なので、CLIの初回起動が遅いと失敗する場合があります。
- Claudeは標準ツールとMCPを無効化します。Codexは個人設定を除外し、read-only sandboxとツール制限を指定します。CodexにCLI全ツールを一括無効化するスイッチはなく、CLIイベントにネイティブツール実行が現れた場合は応答を拒否します。

## 検証

```powershell
node --test tools/local-cli-bridge/*.test.mjs
```

実サブスクを使うツール往復テスト（各プロバイダーに2回リクエスト）:

```powershell
node tools/local-cli-bridge/smoke.mjs
```

2026-10-21実機確認:

- 単体テスト14件成功。
- CodexとClaudeで「ツール呼び出し → その後に生成したランダム値をツール結果として入力 → 最終回答に同じ値を取得」に成功。所要時間はそれぞれ約12秒・8秒。
- ARTEXのChat画面で `Codex connection successful` / `Claude connection successful` の実応答を確認。会話ごとの「Change」で切り替え確認。
- 既定プロファイルはCodex。検証用会話2件は画面に残しています。
- 自動ペネトレーションテスト全体や外部ターゲットへの攻撃はこの接続検証に含みません。

公式の非対話実行インターフェースを使用:
[Codex](https://learn.chatgpt.com/docs/non-interactive-mode) /
[Claude Code](https://code.claude.com/docs/en/headless)。
