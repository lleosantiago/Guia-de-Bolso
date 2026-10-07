# 5 Dias com Aparecida — site

Site estático com quiz e página de vendas do Guia Prático de Bolso “5 Dias com Aparecida”, por R$ 27,90. O lançamento é em 7 de outubro de 2026. A jornada de cinco dias vai de 8 a 12 de outubro. O PDF do guia é mantido separadamente deste site.

## Arquivos

- `index.html`: quiz e oferta exibida imediatamente após as respostas.
- `venda.html`: versão independente da página de vendas.
- `styles.css`: estilos existentes, incluindo o quiz.
- `script.js`: navegação do quiz e abertura da oferta.
- `sales.css`: aparência exclusiva da nova página de vendas.
- `sales.js`: personalização, datas da campanha e botões de compra.
- `tracking.js`: eventos do Meta Pixel, sem enviar respostas do quiz.
- `images/nossa-senhora-quiz.png`: imagem devocional usada no site.

Os mockups do guia impresso e no celular são construídos em HTML e CSS. Representam uma prévia visual do formato do produto.

## Personalização

As respostas ficam no armazenamento de sessão do navegador. A página usa o nome, a intenção informada e sua categoria para personalizar a comunicação. Quando a categoria é identificada pelo texto, o visitante pode ajustá-la na própria oferta. Intenções privadas não são exibidas. As respostas não são enviadas a servidores nem adicionadas ao link de checkout, e podem ser apagadas pelo visitante.

## Checkout

O link do checkout ainda não foi informado. Os botões apresentam um aviso de compra indisponível nesta prévia. Quando houver um link, preencha `checkoutUrl` em `sales.js` com a URL HTTPS do checkout. Os parâmetros de campanha `utm_*`, `fbclid`, `gclid` e `ttclid` da visita são preservados para esse destino; nome e respostas do quiz não são enviados.

## Rastreamento

As duas páginas carregam o Pixel da Utmify (`6ac5bcd2f50d160d5f7379bc`), o script oficial de UTMs fornecido e o Meta Pixel (`1698121791282770`). O Meta recebe `PageView` ao carregar a página, `QuizStarted` depois que a pessoa inicia o quiz, `QuizCompleted` após a última resposta, `ViewContent` quando a oferta aparece e `InitiateCheckout` somente quando um botão leva a uma URL HTTPS de checkout configurada. Esses eventos não incluem nome, intenção, categoria ou qualquer resposta. O site não dispara `Purchase`: essa confirmação deve vir do checkout após pagamento aprovado.

Antes de publicar, confira no Gerenciador de Eventos da Meta se o mesmo pixel foi conectado à Utmify. Se a Utmify também encaminhar os mesmos eventos à Meta, configure a deduplicação entre navegador e servidor ou escolha uma única origem para cada evento. Teste a URL real do checkout para confirmar o repasse de UTMs e a integração de compras.

## Datas e visualização

O contador usa as datas reais da campanha de 2026 e o horário de Brasília. A comunicação muda quando a jornada começa, quando chega o dia 12 e quando o período termina, sem reiniciar a contagem anualmente.

Abra `index.html` para visualizar e concluir o quiz. O projeto não precisa de etapa de build e pode ser publicado como site estático.
