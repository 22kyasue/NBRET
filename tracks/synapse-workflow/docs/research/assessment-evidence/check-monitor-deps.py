from importlib import metadata
import json

result = {}
for name in ('httpx', 'starlette', 'anyio', 'uvicorn'):
    try:
        result[name] = metadata.version(name)
    except metadata.PackageNotFoundError:
        result[name] = None
print(json.dumps(result))
