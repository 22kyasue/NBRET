"""Static lock metadata inventory; does not import/install reviewed packages.

Full-file parsing is not full source-reading credit or resolver/runtime evidence.
"""
import datetime
import hashlib
import json
from pathlib import Path
import sys
import tomllib

source = Path(r"C:/Users/kotar/.codex/research/agentdojo-20261017/uv.lock")
raw = source.read_bytes()
lock = tomllib.loads(raw.decode("utf-8"))
packages = lock["package"]
rows = []
for package in packages:
    rows.append({
        "name": package["name"],
        "version": package["version"],
        "source": package["source"],
        "dependencies": package.get("dependencies", []),
        "optional_dependencies": package.get("optional-dependencies", {}),
        "dev_dependencies": package.get("dev-dependencies", {}),
        "metadata": package.get("metadata", {}),
        "sdist": package.get("sdist"),
        "wheel_count": len(package.get("wheels", [])),
    })
receipt = {
    "at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    "method": "Python standard-library tomllib static parsing only",
    "source": str(source),
    "source_sha256": hashlib.sha256(raw).hexdigest(),
    "source_commit": "089ed468cf3ed0322acc66b0211f26d9d90dbf60",
    "parser": sys.version,
    "lock_version": lock.get("version"),
    "lock_revision": lock.get("revision"),
    "requires_python": lock.get("requires-python"),
    "resolution_markers": lock.get("resolution-markers", []),
    "packages": rows,
    "limitations": [
        "Metadata inventory, not line-by-line reading credit",
        "No dependency marker resolution, installation or package import",
        "No claim these packages were installed in earlier research receipts",
        "Distribution hashes do not establish license or code correctness",
        "Wheel entries remain in the original hashed lock, not repeated here",
    ],
}
destination = Path(sys.argv[1])
with destination.open("x", encoding="utf-8", newline="\n") as stream:
    json.dump(receipt, stream, indent=2)
    stream.write("\n")
focus = {"agentdojo", "deepdiff", "orderly-set", "pydantic", "pydantic-core", "openai", "anthropic", "tenacity"}
print(json.dumps({"receipt": str(destination), "focus": [r for r in rows if r["name"] in focus]}, indent=2))
