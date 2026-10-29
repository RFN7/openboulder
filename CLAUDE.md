# Eleva Open Boulder 2026 · Climb das Antigas

Site do campeonato de boulder da Eleva Academia de Escalada. Página única, estática, sem backend.

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | Site real, com a marca. Todo o conteúdo editável fica no objeto `CONFIG`, no início do `<script>`. |
| `original-backup.html` | Versão original do cliente ("Um dia para subir junto"). Não editar. |
| `assets/*.jpg` | Artes do Estúdio Avoada: logo, faixa, brasão, brasão dourado, pôster, inscrições, camiseta na rocha, regatas, ecobag, adesivos. |
| `tools/build_preview.py` | Gera a prévia **sem marca** para aprovação do cliente. |
| `docs/ARQUITETURA.md` | Arquitetura: camadas, modelo de dados, fluxos, decisões, riscos e evolução. Atualizar quando a estrutura mudar. |

## Prévia para o cliente (sem marca)

- Link: https://claude.ai/artifact/Lqr4Rrw1KBo6zXLdSNEqqF (compartilhado com o cliente em 28/10/2026)
- Para regerar depois de mudar o `index.html`:
  `python3 tools/build_preview.py index.html <pasta-de-saida>` e publicar `<pasta-de-saida>/index.html` com os `assets/*.svg` no mesmo link.
- A prévia troca: nome Eleva → "academia", artes → imagens provisórias, endereço/CNPJ/Pix/Instagram → textos de exemplo, mapa → aviso, WhatsApp → janela que mostra a mensagem.
- **Nunca** publicar a versão com marca, CNPJ e Pix como Artifact.
- Toda mudança no site real deve ser replicada na prévia (rodar o script e republicar).

## Banco de dados (valores atuais do `CONFIG`)

### Evento
- Data: sábado, 12/12/2026, a partir das 08h (`evento: '2026-12-12T08:00:00-03:00'`)
- Local: Eleva Academia de Escalada · SOF Sul, Quadra 11, Conjunto B, Loja 70 · Zona Industrial Guará · Brasília–DF · CEP 71215-257
- Empresa: DFM Esportes LTDA · CNPJ 31.288.290/0001-44
- Pix: chave CNPJ 31.288.290/0001-44
- Instagram: @elevaescalada
- Arte: Estúdio Avoada
- Tema: edição especial de 8 anos de Eleva, estilo Climb das Antigas
- Imagens: `assets/*.jpg` receberam nitidez (unsharp mask); as originais estão em `assets/originais/`

### Lotes (fonte: PDF "ELEVA - ROMERO", recebido em 28/10/2026; valores em R$)
| Lote | Período | Geral c/ camiseta | Aluno c/ camiseta | Geral s/ camiseta | Aluno s/ camiseta |
|---|---|---|---|---|---|
| Promocional | 29/10 (só esse dia) | 110 | 100 | — | — |
| 1º lote | 31/10 a 09/11 | 130 | 120 | 90 | 80 |
| 2º lote | 10/11 a 24/11 | 145 | 135 | 105 | 95 |
| 3º lote | 25/11 a 11/12 | 160 | 150 | 120 | 110 |
| Lote final | 12/12 até 12h | 175 | 165 | 140 | 125 |

- O promocional é **só com camiseta**: o formulário trava a opção "sem camiseta".
- Em 30/10 nenhum lote está aberto. O site mostra "1º lote abre em 31/10" e aceita a inscrição com esse aviso. **Confirmar com o cliente se o intervalo é intencional.**
- **Só a camiseta**, sem inscrição: R$ 90 em qualquer lote.
- Modelos de camiseta: Camiseta com manga e Camiseta regata (P, M, G, GG), Cropped com manga e Cropped regata (tamanho U), Infantil regata (8 a 12 anos).
- Pagamento: Pix (CNPJ) ou débito, crédito, dinheiro ou Pix na recepção. Em todas as opções é preciso enviar o comprovante.

### Categorias (todas com divisão Masculino e Feminino)
| # | Grupo | Categoria | Descrição |
|---|---|---|---|
| 01 | Festival | Infantil | Para as nossas pequenas grandes máquinas |
| 02 | Festival | Funfarra | Para você que só quer se divertir, sem competir |
| 03 | Adulto | Iniciante | Pretos, verdes e rosas |
| 04 | Adulto | Intermediário | Laranjas, roxos, amarelos e alguns brancos |
| 05 | Adulto | Master | Amarelos, azuis, vermelhos e brancos |
| 06 | 40+ | Sênior | Quem manda boulders há mais tempo; galera das antigas oficial |
| 07 | Acessível | Paraclimb | Quem tem alguma deficiência física |

Removido a pedido: card "Vou só assistir". A entrada da torcida é livre.

### Loja (R$)
| Produto | Preço | Opções |
|---|---|---|
| Camiseta oficial | 90 | 5 modelos (ver Lotes) · tamanhos conforme o modelo |
| Ecobag Open Boulder | 60 | — |
| Cartela de adesivos (9) | 20 | — |
| Pôster A3 | 45 | — |
| Kit Antigas (camiseta/regata + ecobag + adesivos) | 150 (de 170) | Camiseta, Regata preta, Regata caramelo · P, M, G, GG |

A loja foi retirada em 28/10/2026. Fica só a camiseta preta (R$ 90), na seção Camiseta e na inscrição.

### Programação
| Horário | Atividade |
|---|---|
| 08h00 – 09h30 | Festival Infantil e entrega de medalhas |
| 09h40 – 14h40 | Festival Adulto (bateria única, sorteios) |
| 14h45 – 17h45 | DJ Jess Ullun / remontagem dos boulders da final |
| 17h30 – 18h30 | Isolamento e briefing técnico |
| 18h40 – 20h20 | Etapa final do campeonato (DJ) |
| 20h45 | Resultados e premiação (DJ) |
| 21h15 | Happy hour |

### Dados da inscrição (o que o formulário envia pelo WhatsApp)
Nome, CPF (validado), nascimento, WhatsApp, e-mail, categoria, masculino/feminino, vínculo (aluno com plano / diarista / outra academia), kit (modelo e tamanho), lote, total, forma de pagamento, observações e aceite do termo.
Cada inscrição e cada pedido de camiseta avulsa é gravado no Supabase (ver abaixo). O WhatsApp foi retirado do site em 28/10/2026.

## Banco de dados (Supabase) e publicação
- Projeto Supabase: `eleva-open-boulder` (id `tkewhxjfmjcorhsfiuen`, São Paulo). O portal-alunos-rfn foi **pausado** em 28/10/2026 para liberar a vaga do plano grátis.
- Tabela `public.eleva_inscricoes`: `tipo` ('inscricao' ou 'camiseta'), dados pessoais, categoria, naipe, vínculo, camiseta (modelo/tamanho), lote, valor, pagamento, caminho do comprovante, `status` ('pendente' → 'confirmado'/'cancelado').
- RLS: o site (chave publishable) **só insere**, sempre com status 'pendente'. Ler e confirmar só pelo painel do Supabase.
- Bucket privado `comprovantes` (até 5 MB; jpg, png, webp, heic, pdf): o site só envia.
- Existe um arquivo de teste de 14 bytes em `comprovantes/camiseta/00000000-...0001.pdf`; pode apagar pelo painel.
- Código: https://github.com/RFN7/openboulder (público). Site real: https://rfn7.github.io/openboulder/ (GitHub Pages, atualiza a cada push na `main`).
- Endereço antigo (rfn7.github.io/eleva-open-boulder) redireciona para o novo pelo repositório RFN7/eleva-open-boulder, que só tem páginas de redirecionamento. Não apagar: o QR Code antigo usa esse endereço.

## Estoque de camisetas e painel (29/10/2026)
- Tabela `eleva_estoque` (modelo × tamanho), valores da planilha do cliente: total 91. Croppeds têm P/M/G/GG; infantil é "8 a 10 anos".
- Disponível = estoque − pedidos com camiseta não cancelados (view `eleva_estoque_status`; o site lê pela função `eleva_estoque_disponivel`).
- Trigger `eleva_baixa_estoque` trava o item e recusa a venda quando esgota ("ESGOTADO: ..."). Cancelar devolve ao estoque; reativar um cancelado só se houver estoque.
- Painel da organização: `admin.html` (https://rfn7.github.io/openboulder/admin.html). Login por e-mail e senha do Supabase Auth; só entra quem está em `eleva_organizadores`.
- Criar acesso: inserir usuário em `auth.users` + `auth.identities` com senha temporária (crypt/bf) e o e-mail em `eleva_organizadores`. A pessoa troca a senha no botão "Trocar senha".
- Relatório: aba Relatórios do painel baixa .xlsx por lote (Resumo, Inscrições, Camisetas avulsas). Envio automático por e-mail **pendente**: falta o e-mail de destino e um serviço de envio.
- Dandara (28/10): Guará → SOF Sul, Infantil → Curumim (só categoria), Deli Deli na programação, lotes só por data, patrocinadores fora até ter todos.

## Pendências
- Aguardando aprovação do cliente na prévia.
- Patrocinadores: 3 espaços ainda com "Sua marca aqui".
- Regulamento: sai no Instagram @elevaescalada em 05/12.
- Hospedagem do site real: a definir com o cliente.

## Sugestões de entradas e saídas (fluxo de caixa do evento)

Valores são referência para planejamento; ajustar com os números reais.

### Entradas (receitas)
- **Inscrições por lote.** Receita = inscritos × preço do lote. Ex.: 100 inscritos no 1º lote com camiseta, metade alunos, dá 50 × 120 + 50 × 130 = R$ 12.500.
- **Só camiseta.** R$ 90 por peça vendida sem inscrição.
- **Loja oficial.** Camisetas, regatas, ecobags, adesivos, pôsteres e o Kit Antigas, também vendidos na recepção e no dia.
- **Patrocínio.** Cotas por tamanho de logo (camiseta, parede, redes), por exemplo ouro, prata e apoio.
- **Bar e comida no dia.** Venda própria ou percentual de um food truck ou cervejaria parceira.
- **Permutas.** Prêmios, bebidas ou equipamentos em troca de exposição de marca (não entram no caixa, mas reduzem saídas).

### Saídas (despesas)
- Produção de camisetas, regatas, ecobags, adesivos e pôsteres (pedir mínimo e prazo ao fornecedor).
- Arte e identidade visual (Estúdio Avoada).
- Premiação: medalhas, troféus e brindes das 7 categorias × 2 naipes (14 pódios, 42 premiados).
- Setters e montagem dos boulders, agarras novas e limpeza da parede.
- Juízes, staff e voluntários (alimentação e camiseta).
- Som, DJ ou banda e iluminação para a final.
- Comida e bebida para o happy hour, se não for terceirizado.
- Primeiros socorros ou ambulância e seguro do evento.
- Taxas de pagamento (débito e crédito na recepção).
- Divulgação: impulsionamento no Instagram e impressão de banners.
- Hospedagem e domínio do site.

### Controle sugerido
Uma planilha com abas **Entradas** e **Saídas** e as colunas: data, descrição, categoria, valor, forma de pagamento, comprovante (sim/não). Na aba **Inscrições**, uma linha por mensagem recebida no WhatsApp com os campos do formulário e o status do pagamento.
