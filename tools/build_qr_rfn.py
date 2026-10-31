"""Gera os dados do QR Code da RFN (WhatsApp).

Uso (precisa de `pip install qrcode pillow`):
    python3 tools/build_qr_rfn.py

- Grava assets/qr-rfn.jpg: imagem fixa, usada enquanto o 3D carrega ou se o aparelho não abrir WebGL.
- Imprime a matriz para colar na constante QR de assets/qr3d.js.
"""
import json
import pathlib

import qrcode
from PIL import Image, ImageDraw

URL = 'https://wa.me/5561994331877'
ROOT = pathlib.Path(__file__).resolve().parent.parent
HOLE = 9       # lado do espaço da logo, em módulos (igual ao 3D)
BORDER = 4
SCALE = 16

q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, border=0)
q.add_data(URL)
q.make(fit=True)
matrix = q.get_matrix()
n = len(matrix)

size = (n + BORDER * 2) * SCALE
img = Image.new('RGB', (size, size), '#f6f3ee')
draw = ImageDraw.Draw(img)
first = (n - HOLE) // 2
for r, row in enumerate(matrix):
    for c, dark in enumerate(row):
        in_hole = first <= r < first + HOLE and first <= c < first + HOLE
        if dark and not in_hole:
            x, y = (c + BORDER) * SCALE, (r + BORDER) * SCALE
            draw.rectangle((x, y, x + SCALE - 1, y + SCALE - 1), fill='#0b0b0d')

logo_side = (HOLE - 1) * SCALE
logo = Image.open(ROOT / 'assets/logo-rfn.jpg').convert('RGB').resize((logo_side, logo_side), Image.LANCZOS)
offset = (size - logo_side) // 2
img.paste(logo, (offset, offset))
img.save(ROOT / 'assets/qr-rfn.jpg', quality=90)

print(json.dumps({'n': n, 'm': [''.join('1' if v else '0' for v in row) for row in matrix]}))
