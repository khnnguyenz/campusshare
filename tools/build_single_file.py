import re, os
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
site = os.path.join(root, 'site')
html = open(os.path.join(site, 'index.html'), encoding='utf8').read()
def read(p): return open(os.path.join(site, p), encoding='utf8').read()
html = re.sub(r'<link rel="stylesheet" href="(css/[^"]+)">\n?', lambda m: '<style>\n' + read(m.group(1)) + '</style>\n', html)
def js(m):
    code = read(m.group(1))
    assert '</script' not in code
    return '<script>\n' + code + '\n</script>\n'
html = re.sub(r'<script src="(js/[^"]+)"></script>\n?', js, html)
os.makedirs(os.path.join(root, 'dist'), exist_ok=True)
open(os.path.join(root, 'dist', 'index.html'), 'w', encoding='utf8').write(html)
print('Đã tạo dist/index.html')
