from unified_agent import TurnCompleted, UnifiedAgent
from unified_agent.skills import make_skill
import pytest


class InertBackend:
    name = 'scripted'

    def __init__(self):
        self.calls = 0

    async def stream(self, prompt, opts):
        self.calls += 1
        yield TurnCompleted(success=True, final_text='synthetic-only')


@pytest.mark.asyncio
async def test_default_symlink_failure_is_returned_before_backend(tmp_path):
    source = tmp_path / 'source'
    make_skill(source, 'synthetic-skill', 'Synthetic fixture only.', 'Inert fixture.')
    backend = InertBackend()
    agent = UnifiedAgent(backend, workspace=tmp_path / 'workspace', skills_dir=source)
    result = await agent.run('inert synthetic prompt')
    print('DEFAULT_RESULT_ERROR:', result.error)
    assert not result.success
    assert backend.calls == 0
    assert '1314' in result.error  # This receipt is specific to this Windows principal.


@pytest.mark.asyncio
async def test_explicit_copy_preparation_reaches_backend(tmp_path):
    source = tmp_path / 'source'
    make_skill(source, 'synthetic-skill', 'Synthetic fixture only.', 'Inert fixture.')
    backend = InertBackend()
    agent = UnifiedAgent(backend, workspace=tmp_path / 'workspace',
                         skills_dir=source, skills_install_mode='copy')
    result = await agent.run('inert synthetic prompt')
    assert result.success
    assert backend.calls == 1
    assert (tmp_path / 'workspace/.agents/skills/synthetic-skill/SKILL.md').is_file()
