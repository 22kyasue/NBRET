import hashlib
import json
from pathlib import Path
import tarfile

receipts = json.loads(Path('docs/research/assessment-evidence/sdk-source-download-receipt.json').read_text())
for item in receipts:
    source = Path(item['path'])
    assert hashlib.sha256(source.read_bytes()).hexdigest() == item['sha256']
    destination = source.parent / (item['name'] + '-' + item['version'] + '-source')
    destination.mkdir(exist_ok=False)
    with tarfile.open(source) as archive:
        for member in archive.getmembers():
            resolved = (destination / member.name).resolve()
            assert resolved.is_relative_to(destination.resolve())
            assert member.isfile() or member.isdir(), 'no links/devices permitted'
        archive.extractall(destination, filter='data')
    print(destination)
