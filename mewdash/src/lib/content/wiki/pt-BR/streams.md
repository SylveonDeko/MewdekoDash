---
title: Alertas de transmissão
slug: streams
summary: Siga streamers na Twitch, YouTube, Kick e Picarto e publique um anúncio em um canal à sua escolha quando eles entrarem ao vivo ou ficarem offline.
icon: fa-video
category: Community
dashboard: /dashboard/streams
module: Searches
tags: [streams, stream alerts, go live, live notifications, twitch, youtube, kick, picarto, trovo, streamadd, streamtemplate, transmissões, alertas de transmissão, início de live, notificações de live]
related: [twitch, utility, administration]
---

## O que faz

A equipe cola a URL de uma transmissão e escolhe um canal do Discord. O bot então consulta a plataforma desse streamer e, quando a transmissão passa de offline para online, publica uma mensagem de início de live no canal escolhido. Por padrão, é um embed com o nome do streamer com link para a transmissão, o título da transmissão, o jogo ou categoria, o número de espectadores, o avatar do streamer e uma imagem de prévia.

Você pode substituir o embed padrão pela sua própria mensagem. Há um modelo para todo o servidor que se aplica a todas as transmissões seguidas, e cada transmissão também pode ter sua própria mensagem de online e sua própria mensagem de offline. Todas aceitam os placeholders `%stream.*%` listados abaixo e podem ser texto simples ou um embed completo criado no editor de embeds do painel.

Os avisos de offline vêm desativados por padrão. Ative-os e o bot também publica quando uma transmissão seguida termina, usando a mensagem de offline da transmissão se houver uma, senão o modelo do servidor, senão o embed padrão mostrando "Offline".

> [!NOTE]
> Os Alertas de transmissão anunciam transmissões de outras pessoas no seu Discord. O recurso separado Bot da Twitch conecta o bot ao seu próprio chat da Twitch para comandos, timers e eventos. Veja o artigo do Bot da Twitch para isso.

## Por que usar

- Um servidor de comunidade quer um canal de "ao vivo agora" que acende sempre que um de seus criadores começa a transmitir.
- O Discord de um streamer quer uma menção automática com o título e a categoria para que ninguém precise publicá-la manualmente.
- Um servidor de esports ou de eventos segue vários canais de torneio na Twitch e na Kick em um só lugar.
- Um servidor quer um aviso limpo de "transmissão encerrada" para que a publicação de início de live não pareça desatualizada.

## Plataformas compatíveis

O bot escolhe a plataforma pela URL que você informa. Somente URLs que correspondem a um destes padrões podem ser seguidas.

| Plataforma | Formato da URL | Observações |
| --- | --- | --- |
| Twitch | `twitch.tv/username` | Usa a API Helix da Twitch. Título, jogo, espectadores, avatar e prévia são todos preenchidos. |
| YouTube | `youtube.com/@handle` ou `youtube.com/channel/ID` | Lido por scraping da página ao vivo do canal, então os dados podem ser menos completos que os da Twitch. Uma URL com ID de canal é convertida para o handle. |
| Kick | `kick.com/slug` | Usa a API pública da Kick. O placeholder de avatar é preenchido com a imagem do banner do canal. |
| Picarto | `picarto.tv/name` | Usa a API da Picarto. |

Trovo e Facebook aparecem na lista de plataformas do painel e nos dados armazenados, mas não há um verificador de URL funcional para o Trovo nem um provedor para o Facebook no código atual, então essas URLs são rejeitadas quando você tenta segui-las.

## Como a verificação funciona

O bot mantém um rastreador por plataforma e pergunta a cada plataforma o estado de cada canal seguido em um ciclo, pausando três segundos entre as rodadas. Uma transmissão é anunciada como online na primeira vez em que é vista ao vivo depois de estar offline.

Ficar offline é tratado com mais cuidado porque a Twitch às vezes informa uma breve queda de offline durante uma transmissão ao vivo. Uma transmissão precisa ser vista offline em duas verificações consecutivas antes de o aviso de offline ser enviado. Se ela voltar a ficar online nesse intervalo, nada é publicado.

A cada trinta minutos, o bot procura transmissões cujas consultas à plataforma falham há mais de doze horas, por exemplo um canal excluído ou renomeado, e as remove de todos os servidores que as seguiam.

Se o canal de notificação de uma transmissão seguida foi excluído, a transmissão é descartada na próxima vez que alguém executar `streamlist`.

## A mensagem que ele envia

Quando uma transmissão muda de estado, o bot escolhe uma mensagem nesta ordem:

1. A **Mensagem de online** ou **Mensagem de offline** da própria transmissão, a que corresponder ao novo estado.
2. O modelo da **Mensagem global de transmissão** do servidor.
3. O embed integrado.

Uma mensagem por transmissão que não seja um JSON de embed válido é publicada como texto simples acima do embed integrado. Um modelo global que não seja JSON de embed é publicado como texto simples sozinho. As mensagens que são JSON de embed válido, que é o que o construtor de embeds do painel produz, são enviadas exatamente como projetadas, incluindo botões.

O embed integrado tem o nome do streamer como título com link, o título da transmissão como linha de autor, um campo **Status** mostrando Online ou Offline, um campo **Viewers**, um campo **Transmitindo** para o jogo ou categoria, o avatar como miniatura e a prévia como imagem grande. Ele é verde enquanto está ao vivo e vermelho quando está offline.

### Placeholders

Somente este conjunto é substituído nas mensagens de transmissão. Os placeholders gerais de servidor e usuário da página de placeholders não estão disponíveis aqui.

| Placeholder | Valor |
| --- | --- |
| `%stream.name%` | Nome de exibição do streamer, ou `Unknown` |
| `%stream.username%` | Nome de login ou handle do streamer |
| `%stream.url%` | Link direto para a transmissão, sempre com `https://` |
| `%stream.title%` | Título atual da transmissão, ou `No title` |
| `%stream.game%` | Jogo ou categoria, ou `No category` |
| `%stream.viewers%` | Número de espectadores com separadores de milhar, ou `-` quando offline |
| `%stream.platform%` | Nome da plataforma, como `Twitch` ou `Youtube` |
| `%stream.avatar%` | URL do avatar do streamer |
| `%stream.preview%` | URL da prévia ou miniatura da transmissão |
| `%stream.status%` | `Online` ou `Offline`, cada um precedido por um círculo colorido |
| `%stream.channelid%` | ID do canal específico da plataforma, quando a plataforma fornece um |

> [!EXAMPLE]
> Um modelo global simples: `%stream.name% is live on %stream.platform% playing %stream.game%: %stream.title% %stream.url%`

## Configurações

A página de Notificações de transmissão tem quatro abas: **Transmissões**, **Seguir transmissão**, **Configurações** e **Estatísticas**.

| Configuração | Padrão | O que controla |
| --- | --- | --- |
| Canal de notificações | nenhum | O canal para onde vão os alertas de uma nova transmissão, escolhido em **Seguir transmissão** |
| URL da transmissão | nenhuma | O link a seguir, em **Seguir transmissão** |
| Mensagem de online | nenhuma | Mensagem por transmissão quando ela entra ao vivo, editada no cartão da transmissão em **Transmissões** |
| Mensagem de offline | nenhuma | Mensagem por transmissão quando ela termina, editada no mesmo cartão |
| Mensagem global de transmissão | nenhuma | Modelo do servidor inteiro usado quando uma transmissão não tem mensagem própria, em **Configurações** |
| Notificações de offline | desativado | Se o bot publica quando as transmissões seguidas ficam offline, em **Configurações** |

**Transmissões** lista todas as transmissões seguidas com sua plataforma, canal e a data em que foram adicionadas, com um botão de excluir em cada cartão e um botão **Limpar tudo**. **Estatísticas** mostra o total de transmissões, streamers únicos, canais com notificações, plataformas em uso e uma divisão por plataforma.

Um servidor pode seguir no máximo dez transmissões. Adicionar uma décima primeira falha.

## Passo a passo de configuração

1. Abra **Alertas de transmissão** no painel e vá para a aba **Seguir transmissão**.
2. Escolha o **Canal de notificações**, cole a **URL da transmissão** e clique em **Seguir transmissão**.
3. Em **Configurações**, crie uma **Mensagem global de transmissão** no editor de embeds usando os placeholders acima e clique em **Salvar mensagem**. Pule esta etapa para manter o embed integrado.
4. Ative **Notificações de offline** se quiser também publicações de "transmissão encerrada".
5. De volta em **Transmissões**, abra o cartão de uma transmissão para dar a ela sua própria **Mensagem de online** ou **Mensagem de offline** se precisar de algo diferente do modelo global.
6. Teste com `streamcheck <url>` para confirmar que o bot consegue ler a transmissão e depois aguarde o próximo início de live.

## Comandos

Execute-os com o prefixo do seu servidor (`.`, a menos que você o tenha alterado).

| Comando | Aliases | Requer | Finalidade |
| --- | --- | --- | --- |
| `streamadd <url>` | `sta`, `stadd` | Gerenciar mensagens | Seguir uma transmissão e enviar seus alertas para o canal atual |
| `streamremove <index>` | `strm` | Gerenciar mensagens | Deixar de seguir a transmissão nessa posição em `streamlist` |
| `streamsclear` | `stclear` | Administrador | Deixar de seguir todas as transmissões do servidor |
| `streamlist` | `stl`, `streamslist` | Ninguém | Lista paginada das transmissões seguidas com seus números, plataformas e canais |
| `streamoffline` | `sto`, `stoff` | Gerenciar mensagens | Alternar as notificações de offline |
| `streammessage <index> <message>` | `stm`, `stmsg` | Gerenciar mensagens | Definir a mensagem de online de uma transmissão; uma mensagem vazia a redefine |
| `streamofflinemessage <index> <message>` | `stofmsg`, `stoffline` | Gerenciar mensagens | Definir a mensagem de offline de uma transmissão; uma mensagem vazia a redefine |
| `streamtemplate [template]` | `stt`, `sttemplate` | Gerenciar mensagens | Mostrar o modelo global e os placeholders, definir um novo ou `reset` para limpá-lo |
| `streamcheck <url>` | `stc` | Ninguém | Informar se uma transmissão está ao vivo agora e seu número de espectadores |

## Dicas e armadilhas

- `streamadd` usa o canal em que você o executa. Use o painel se quiser escolher um canal diferente.
- Os números das transmissões vêm de `streamlist` e começam em 1. Eles mudam quando uma transmissão é removida, então confira a lista antes de remover por número.
- O bot precisa de Enviar mensagens e Inserir links no canal de notificações. Os alertas para um canal que ele não consegue ver são ignorados com uma entrada no log.
- Se o seu servidor tem o Bot da Twitch conectado com um canal de início de live definido para o mesmo canal da Twitch, essa integração assume e os Alertas de transmissão ficam em silêncio para ele, para que você não receba duas publicações.
- Os dados do YouTube são obtidos por scraping, e não lidos de uma API. Títulos, categorias e números de espectadores podem estar ausentes ou aparecer como `Live Stream`.
- As transmissões cujas consultas continuam falhando por doze horas são removidas automaticamente. Se um streamer renomear o canal, siga a nova URL.
