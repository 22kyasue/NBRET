"""Synthetic in-process API checks; no socket, actual tool or credential."""
from contextlib import asynccontextmanager

import httpx
import pytest

from unified_agent import CommandRun, SQLiteRunMonitor
from unified_agent.monitor_web import create_app


@asynccontextmanager
async def client_for(database):
    app = create_app(database, poll_interval=0.001)
    async with app.router.lifespan_context(app):
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app), base_url='http://synthetic.invalid'
        ) as client:
            yield client


@pytest.mark.asyncio
async def test_retained_synthetic_fields_are_served_without_auth(tmp_path):
    database = tmp_path / 'synthetic.db'
    monitor = SQLiteRunMonitor(database)
    run = monitor.start_run(
        run_id='synthetic-only', backend='scripted', workspace=tmp_path,
        prompt='SYNTHETIC_PROMPT_SECRET_DO_NOT_USE',
        metadata={'synthetic_key': 'SYNTHETIC_METADATA_DO_NOT_USE'},
    )
    run.record(CommandRun(command='inert-event-only', exit_code=0,
                          output='SYNTHETIC_OUTPUT_SECRET_DO_NOT_USE'))
    run.finish(status='succeeded')
    monitor.close()
    async with client_for(database) as client:
        detail = await client.get('/api/runs/synthetic-only')
        assert detail.status_code == 200
        assert detail.json()['run']['prompt'] == 'SYNTHETIC_PROMPT_SECRET_DO_NOT_USE'
        assert detail.json()['run']['metadata']['synthetic_key'] == 'SYNTHETIC_METADATA_DO_NOT_USE'
        events = await client.get('/api/runs/synthetic-only/events')
        assert events.json()['events'][0]['payload']['output'] == 'SYNTHETIC_OUTPUT_SECRET_DO_NOT_USE'
        assert detail.headers['cache-control'] == 'no-store'
        assert 'access-control-allow-origin' not in detail.headers
        assert 'content-security-policy' in detail.headers
        assert (await client.post('/api/runs/synthetic-only')).status_code == 405
