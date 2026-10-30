"""Build a reproducible unsigned store/developer ZIP; never includes signing keys."""
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED
import json

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'manifest.json').read_text())
files = {'manifest.json', manifest['background']['service_worker'], 'detector.js',
         'popup.js', 'popup.css', 'options.js', manifest['options_page'],
         manifest['action']['default_popup'], *manifest['icons'].values()}
for script in manifest['content_scripts']:
    files.update(script['js'])
    files.update(script['css'])
output = root.parent / 'dist' / f'wokra-{manifest["version"]}.zip'
output.parent.mkdir(exist_ok=True)
with ZipFile(output, 'w', compression=ZIP_DEFLATED) as archive:
    for name in sorted(files):
        entry = ZipInfo(name, date_time=(2020, 1, 1, 0, 0, 0))
        entry.compress_type = ZIP_DEFLATED
        entry.external_attr = 0o100644 << 16
        archive.writestr(entry, (root / name).read_bytes())
print(output)
