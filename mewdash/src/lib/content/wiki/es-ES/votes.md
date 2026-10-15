---
title: Votos
slug: votes
summary: Recompensa a los miembros que voten por tu servidor en top.gg con un mensaje de agradecimiento, un contador de votos y roles temporales o permanentes.
icon: fa-thumbs-up
category: Community
dashboard: /dashboard/votes
module: Votes
tags: [votes, top.gg, vote rewards, vote roles, webhook, vote password, leaderboard, votos, recompensas por voto, roles de voto, contraseña de voto, clasificación]
related: [administration, xp]
---

## Qué hace

Esto no es una función de encuestas. Votos registra los votos que recibe tu servidor en top.gg y recompensa a quienes los emiten. Cuando top.gg le dice a Mewdeko que alguien ha votado, el bot registra el voto, publica un agradecimiento en tu canal de votos con el total acumulado de ese miembro y entrega los roles que hayas configurado como recompensa por voto.

Desde el punto de vista del miembro: vota por el servidor en top.gg y aparece un mensaje en el canal de votos que lo menciona y muestra cuántas veces ha votado. Si configuraste roles de voto, recibe esos roles al mismo tiempo, de forma permanente o durante un tiempo determinado.

Desde el punto de vista del personal: configuras un canal de votos, una contraseña de webhook, un mensaje personalizado opcional y hasta diez roles de recompensa. A partir de ahí el bot gestiona cada voto por su cuenta. `votes` y `votesleaderboard` permiten a cualquiera consultar los recuentos.

El vínculo entre top.gg y tu servidor es la contraseña de voto. top.gg la envía en la cabecera Authorization de su llamada webhook, y Mewdeko compara esa cabecera con la contraseña guardada de cada servidor para saber a qué servidor pertenece el voto.

## Por qué usarlo

- Tienes tu servidor listado en top.gg y quieres un agradecimiento visible cada vez que alguien vota.
- Quieres dar a los votantes un rol de «Votante», o un rol de beneficio temporal que caduque a las doce horas.
- Quieres una clasificación mensual de votantes para organizar una recompensa al «mejor votante».
- Quieres que los miembros puedan consultar su propio recuento de votos sin preguntar al personal.

## Cómo se procesa un voto

1. top.gg envía una petición al endpoint webhook `/votes/` del bot, con el ID de Discord del votante y tu contraseña en la cabecera Authorization.
2. El bot busca el servidor cuya contraseña de voto guardada coincide. Si ninguno coincide, el voto se descarta.
3. El voto se guarda con el ID del votante y la hora.
4. Si hay un canal de votos configurado, el bot publica allí el mensaje de agradecimiento. Sin canal de votos no se publica nada y no se dan roles.
5. Cada rol de voto se añade al miembro. Los roles con temporizador se quitan de nuevo cuando el temporizador termina, usando el mismo sistema de roles temporales que los silencios.

> [!WARNING]
> La contraseña es lo único que vincula un voto con tu servidor. Cualquiera que la conozca puede enviar votos falsos. Nunca la pegues en un canal público; el bot la establece a través de un formulario privado por esa razón.

## El mensaje de agradecimiento

Por defecto, el bot envía una mención del votante y un embed titulado «Thanks for voting for <server>», una línea con su total de votos y su avatar como miniatura.

Puedes sustituir esto por tu propio texto o embed usando `votemessage` o el cuadro **Anuncio de voto personalizado** del panel. El texto pasa por el analizador de embeds, así que funciona cualquier cosa que genere el creador de embeds. Ponlo en `-` en el comando, o vacía el cuadro en el panel, para volver al valor por defecto.

### Marcadores

El mensaje personalizado admite el conjunto general de marcadores (de usuario, servidor, canal, bot y tiempo, de la página de marcadores) más dos específicos de votos.

| Marcador | Valor |
| --- | --- |
| `%votestotalcount%` | Cuántas veces ha votado este miembro en total |
| `%votesmonthcount%` | Cuántas veces ha votado en el mes natural actual |
| `%user.mention%`, `%user.name%`, `%user.id%`, `%user.avatar%` | El votante |
| `%server.name%`, `%server.id%`, `%server.icon%`, `%server.members%` | Tu servidor |

> [!EXAMPLE]
> `Thanks %user.mention% for voting! That is vote number %votestotalcount% (%votesmonthcount% this month).`

Ejecutar `votemessage` sin texto muestra una vista previa del mensaje actual tal y como se vería para ti, con tus propios recuentos de votos.

## Roles de voto

Un rol de voto se da a cada votante. Cada rol tiene una duración opcional en segundos; `0` significa que el rol es permanente.

- Hasta diez roles de voto por servidor.
- No se puede añadir el rol `@everyone`.
- Un rol no se puede añadir dos veces; usa `voteroleedit` para cambiar su duración.
- Los roles temporales se quitan automáticamente cuando pasa su duración.
- Si el bot no puede asignar un rol (por ejemplo, porque el rol está por encima del rol más alto del bot), omite ese rol en silencio.

## Recuentos de votos y clasificación

`votes` muestra los votos de un miembro este mes y en total, con su avatar. `votesleaderboard` ordena a todos los del servidor por total de votos, doce por página. Pasa `true` para ordenar solo por los votos de este mes. Ambas cifras «mes» comparan el mes natural, no los últimos treinta días.

## Ajustes

La página de Votos tiene tres pestañas: **Configuración**, **Roles de voto** y **Estadísticas**.

| Ajuste | Por defecto | Qué controla |
| --- | --- | --- |
| Canal de anuncios de votos | ninguno | Dónde se publican los mensajes de agradecimiento. Sin este canal no pasa nada |
| Contraseña de la API (para webhooks) | ninguna | El secreto que top.gg debe enviar en su cabecera Authorization |
| Anuncio de voto personalizado | embed por defecto | Tu propio mensaje, con los marcadores de arriba. Vacío usa el valor por defecto |
| Rol a conceder | ninguno | Un rol que se añade a cada votante (pestaña Roles de voto) |
| Duración (segundos, 0 para permanente) | 0 | Cuánto dura un rol de voto antes de que se quite |

La pestaña **Estadísticas** muestra el total de votos, el número de roles de voto, el recuento del mayor votante y una clasificación de los diez primeros.

## Configuración paso a paso

1. Abre **Votos** en el panel y quédate en **Configuración**.
2. Elige un **Canal de anuncios de votos**. Sin uno, los votos se registran pero no se publica nada y no se dan roles.
3. Introduce una **Contraseña de la API**. Hazla larga y aleatoria; trátala como una clave de API.
4. Opcionalmente, escribe un **Anuncio de voto personalizado** con los marcadores de arriba y pulsa **Guardar configuración**.
5. En la página de tu servidor en top.gg, abre la sección de webhooks. Pon como URL del webhook el endpoint `/votes/` de tu bot y como valor de Authorization la misma contraseña.
6. En **Roles de voto**, elige un **Rol a conceder** y una **Duración**, y luego pulsa **Añadir rol de voto**. Repite para hasta diez roles.
7. Asegúrate de que el rol del bot esté por encima de todos los roles de voto en la lista de roles.
8. Usa el botón de webhook de prueba de top.gg, o espera a un voto real, y revisa el canal de votos.

## Comandos

Ejecuta estos comandos con el prefijo de tu servidor (`.` a menos que lo hayas cambiado).

| Comando | Alias | Requiere | Función |
| --- | --- | --- | --- |
| `votechannel <#channel>` | | Gestionar servidor | Establecer el canal de los mensajes de agradecimiento |
| `votemessage [text]` | `votemsg` | Gestionar servidor | Previsualizar, establecer o restablecer (`-`) el mensaje personalizado |
| `votepassword` | `votepass` | Gestionar servidor | Establecer la contraseña del webhook mediante un formulario privado |
| `voteroleadd <@role> [time]` | `vra` | Gestionar servidor | Añadir un rol de voto, opcionalmente con duración, por ejemplo `voteroleadd @Voter 12h` |
| `voteroleedit <@role> <time>` | `vre` | Gestionar servidor | Cambiar cuánto dura un rol de voto |
| `voteroleremove <@role>` | `vrr` | Gestionar servidor | Quitar un rol de voto |
| `voteroleslist` | `vrl` | Gestionar servidor | Listar los roles de voto y sus duraciones |
| `voterolesclear` | `vrc` | Gestionar servidor | Quitar todos los roles de voto, tras confirmación |
| `votes [@user]` | | Nadie | Mostrar los votos mensuales y totales de un miembro |
| `votesleaderboard [true]` | `voteslb` | Nadie | Clasificar a los votantes por total, o por este mes con `true` |

Los mismos comandos existen como comandos de barra bajo `/votes`.

## Consejos y advertencias

- Solo se admiten los votos de servidores de top.gg. No hay integración con otras listas de bots, y esta función no crea encuestas.
- Sin canal de votos no hay mensaje ni roles, aunque el voto sí se cuenta.
- El bot necesita el permiso Gestionar roles, y su rol debe estar por encima de cada rol de voto, o las recompensas fallan en silencio.
- Los roles de voto temporales usan el mismo sistema de roles temporales que los silencios temporales y aparecen en el registro de auditoría con el motivo "Vote Role".
- `voteroleedit` busca el rol solo por su ID, así que úsalo únicamente con roles que hayas añadido de verdad en este servidor.
- Cambiar la contraseña no invalida los votos antiguos, pero top.gg dejará de coincidir hasta que también actualices la cabecera en su lado.
