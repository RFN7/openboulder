"""Gera a prévia sem marca do site (para aprovação do cliente)."""
import re, sys, pathlib

src = pathlib.Path(sys.argv[1])
out = pathlib.Path(sys.argv[2])
(out / 'assets').mkdir(parents=True, exist_ok=True)
html = src.read_text(encoding='utf-8')

# ---------- imagens: placeholders SVG sem marca ----------
INK, CREAM, GOLD, RUST, BLUE, OLIVE = '#0f0f0f', '#ffebb4', '#c08d42', '#812300', '#628cff', '#666026'
SIZES = {
    'adesivos': (876, 1190, 'Cartela de adesivos'), 'brasao-dourado': (1070, 1390, 'Brasão do evento'),
    'brasao': (1070, 1340, 'Brasão do evento'), 'camiseta-rocha': (1800, 1005, 'Foto da camiseta'), 'camiseta-frente': (1272, 1408, 'Foto da camiseta'),
    'ecobag': (1800, 1005, 'Foto da ecobag'), 'inscricoes': (1100, 1240, 'Arte de inscrições'),
    'poster': (1400, 1128, 'Pôster oficial'), 'regatas': (1800, 1005, 'Foto das regatas'),
}

def holds(w, h):
    import random
    r = random.Random(w * h)
    cols = [RUST, OLIVE, BLUE, GOLD]
    shapes = []
    for _ in range(14):
        x, y, s = r.uniform(.06, .94) * w, r.uniform(.08, .92) * h, r.uniform(.03, .07) * min(w, h)
        shapes.append(f'<ellipse cx="{x:.0f}" cy="{y:.0f}" rx="{s*1.3:.0f}" ry="{s:.0f}" fill="{r.choice(cols)}" opacity=".55" transform="rotate({r.randint(0,180)} {x:.0f} {y:.0f})"/>')
    return ''.join(shapes)

def art(w, h, label):
    fs = min(w, h) * .075
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">
<rect width="{w}" height="{h}" fill="{INK}"/>{holds(w, h)}
<rect x="{w*.04:.0f}" y="{h*.04:.0f}" width="{w*.92:.0f}" height="{h*.92:.0f}" rx="24" fill="none" stroke="{GOLD}" stroke-width="6" stroke-dasharray="22 14"/>
<text x="50%" y="47%" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="{fs:.0f}" fill="{CREAM}">{label}</text>
<text x="50%" y="{h*.47 + fs*1.2:.0f}" text-anchor="middle" font-family="Courier New,monospace" font-weight="700" font-size="{fs*.42:.0f}" letter-spacing="4" fill="{GOLD}">ARTE FINAL NA VERSÃO OFICIAL</text>
</svg>'''

for name, (w, h, label) in SIZES.items():
    (out / 'assets' / f'{name}.svg').write_text(art(w, h, label), encoding='utf-8')

(out / 'assets' / 'logo.svg').write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 620" width="1400" height="620">
<rect width="1400" height="620" fill="{INK}"/>
<text x="40" y="300" font-family="Georgia,serif" font-weight="900" font-size="230" fill="{CREAM}">OPEN</text>
<text x="40" y="540" font-family="Georgia,serif" font-weight="900" font-size="230" fill="{CREAM}">BOULDER</text>
<text x="1080" y="300" font-family="Courier New,monospace" font-weight="700" font-size="120" fill="{GOLD}">2026</text>
</svg>''', encoding='utf-8')
(out / 'assets' / 'faixa.svg').write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 322" width="1400" height="322">
<rect width="1400" height="322" fill="{INK}"/>
<path d="M60 60 H1340 L1290 161 L1340 262 H60 L110 161 Z" fill="{BLUE}" stroke="{CREAM}" stroke-width="8"/>
<text x="700" y="200" text-anchor="middle" font-family="Georgia,serif" font-weight="900" font-size="110" fill="{INK}">CLIMB DAS ANTIGAS</text>
</svg>''', encoding='utf-8')
html = re.sub(r'assets/([\w-]+)\.jpg', r'assets/\1.svg', html)

# ---------- textos: tira marca, CNPJ, endereço ----------
REPL = [
    ('SOF SUL QUADRA 11 CONJUNTO B LOJA 70, Zona Industrial Guará, Brasília DF, CEP 71.215-257', '[endereço da empresa]'),
    ('SOF Sul, Quadra 11, Conjunto B, Loja 70<br>Zona Industrial Guará · Brasília – DF<br>CEP 71215-257', '[Endereço da academia]<br>Brasília – DF'),
    ('31.288.290/0001-44', '00.000.000/0000-00'),
    ('DFM Esportes LTDA', '[Razão social]'),
    ('“Eleva Academia de Escalada”', '“[nome da academia]”'),
    ('Eleva Academia de Escalada', 'Academia de Escalada'),
    ('8 anos de Eleva', '8 anos da academia'), ('evento da Eleva', 'evento da academia'),
    ('Eleva Open Boulder', 'Open Boulder'), ('Open Boulder Eleva', 'Open Boulder'),
    ('Aluno Eleva', 'Aluno da academia'), ('aluno Eleva', 'aluno da academia'),
    ('Eleva · Guará, Brasília', 'Academia · Brasília'), ('Eleva · Guará', 'Na academia'),
    ('na casa da comunidade: a Academia de Escalada, no Guará', 'na casa da comunidade: a própria academia'),
    ('Guará — Brasília', 'Brasília'), ('no Guará', 'em Brasília'), ('Guará', 'Brasília'),
    ('na recepção da Eleva', 'na recepção da academia'), ('Na recepção da Eleva', 'Na recepção da academia'),
    ('Retirada na Eleva', 'Retirada na academia'), ('Diarista Eleva', 'Diarista da academia'),
    ('<div class="sponsor main">Eleva</div>', '<div class="sponsor main">Academia</div>'),
    ('https://www.instagram.com/elevaescalada/', 'https://www.instagram.com/'), ('@elevaescalada', '@suaacademia'),
    ('Você é aluno Eleva?', 'Você é aluno da academia?'),
]
for a, b in REPL:
    html = html.replace(a, b)
html = re.sub(r'\bEleva\b', 'Academia', html)

# mapa embutido não carrega no artifact: troca por um bloco de aviso
html = re.sub(r'<div class="map"><iframe.*?</iframe></div>',
              '<div class="map" style="display:grid;place-items:center;text-align:center;padding:30px;font:700 13px var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--gold)">Mapa do local<br>entra na versão oficial</div>', html, flags=re.S)
html = re.sub(r'href="https://www\.google\.com/maps/search/[^"]*"', 'href="https://www.google.com/maps"', html)
html = re.sub(r'href="https://waze\.com/ul[^"]*"', 'href="https://waze.com"', html)

# ---------- WhatsApp: na prévia mostra a mensagem em vez de enviar ----------
html = html.replace("whatsapp: '5561991812748'", "whatsapp: ''")
# prévia nunca grava no banco: sem url, salvar() devolve { preview: true }
html = re.sub(r"supabase: \{ url: '[^']*', key: '[^']*' \}", "supabase: { url: '', key: '' }", html)
html = html.replace('https://rfn7.github.io/openboulder/', '')
html = html.replace(
    "function openWa(text){ window.open(waLink(text), '_blank', 'noopener'); }",
    "function openWa(text){ $('#wa-msg').textContent=text; $('#wa-preview').classList.add('open'); }")
html = html.replace(
    "$$('[data-wa]').forEach(a=>{ a.href=waLink(a.dataset.wa); a.target='_blank'; a.rel='noopener'; });",
    "$$('[data-wa]').forEach(a=>a.addEventListener('click',e=>{ e.preventDefault(); openWa(a.dataset.wa); }));\n"
    "$('#wa-close').addEventListener('click',()=>$('#wa-preview').classList.remove('open'));")
html = html.replace("toast('Abrimos o WhatsApp. Envie a mensagem e o comprovante ✓');", '')
modal = '''<div class="wa-modal" id="wa-preview" role="dialog" aria-modal="true" aria-labelledby="wa-title"><div class="wa-box">
  <h3 id="wa-title">Mensagem que vai para o WhatsApp</h3>
  <p>Na versão oficial, este botão abre o WhatsApp da organização com o texto abaixo já preenchido.</p>
  <pre id="wa-msg"></pre>
  <button class="btn block" id="wa-close" type="button">Entendi</button>
</div></div>
<div class="toast" id="toast"'''
html = html.replace('<div class="toast" id="toast"', modal, 1)
css = '''
    .preview-bar{background:var(--blue);color:var(--ink);text-align:center;font:700 12px/1.4 var(--mono);letter-spacing:.06em;text-transform:uppercase;padding:9px max(16px,env(safe-area-inset-right,0px)) 9px max(16px,env(safe-area-inset-left,0px));border-bottom:2px solid var(--ink)}
    .wa-modal{position:fixed;inset:0;z-index:90;background:rgba(15,15,15,.75);display:none;place-items:center;padding:20px}
    .wa-modal.open{display:grid}
    .wa-box{background:var(--paper);color:var(--text);border:2px solid var(--ink);border-radius:18px;padding:24px;width:min(520px,100%);max-height:86vh;overflow:auto;box-shadow:8px 8px 0 var(--rust)}
    .wa-box h3{font:400 22px var(--display);margin:0 0 6px}
    .wa-box p{margin:0 0 14px;font-size:14px;color:var(--muted)}
    .wa-box pre{white-space:pre-wrap;word-break:break-word;background:#e7ffdb;border:1.5px solid var(--ink);border-radius:12px;padding:14px;font:400 13px/1.5 var(--body);margin:0 0 16px}
  </style>'''
html = html.replace('  </style>', css, 1)
html = html.replace('<header class="topbar">',
    '<div class="preview-bar">Prévia para aprovação · logos, artes, endereço, Pix e WhatsApp entram na versão oficial</div>\n<header class="topbar">', 1)

# ---------- esqueleto: o publish já envolve a página ----------
html = re.sub(r'<title>.*?</title>', '<title>Open Boulder 2026</title>', html)
for pat in [r'<!doctype html>\s*', r'<html[^>]*>\s*', r'</html>\s*', r'<head>\s*', r'</head>\s*', r'<body>\s*', r'</body>\s*',
            r'\s*<meta charset[^>]*>', r'\s*<meta name="viewport"[^>]*>', r'\s*<meta name="theme-color"[^>]*>',
            r'\s*<meta name="description"[^>]*>', r'\s*<meta property="og:[^>]*>', r'\s*<link rel="icon"[^>]*>']:
    html = re.sub(pat, '', html, flags=re.I)
html = html.replace('body{margin:0;background:var(--paper)', ':root{color-scheme:light}\n    body{margin:0;background:var(--paper)', 1)

(out / 'index.html').write_text(html.strip() + '\n', encoding='utf-8')
left = re.findall(r'.{30}(?:Eleva|DFM|31\.288|elevaescalada|SOF Sul|5561991812748|supabase\.co|sb_publishable).{30}', html, flags=re.I)
print('restos de marca:', left or 'nenhum')
