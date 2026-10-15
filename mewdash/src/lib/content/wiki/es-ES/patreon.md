---
title: Patreon
slug: patreon
summary: Conecta una campaña de Patreon, da a tus mecenas roles de Discord que coincidan con su nivel y publica un agradecimiento mensual con cifras en vivo de mecenas e ingresos.
icon: fa-heart
category: Community
dashboard: /dashboard/patreon
module: Patreon
tags: [patreon, supporters, patrons, donations, premium, tier roles, role sync, announcement, oauth, mecenas, donaciones, niveles, roles por nivel, sincronización de roles, anuncio]
related: [administration, utility]
---

## Qué hace

El propietario de un servidor que gestiona una campaña de Patreon la vincula al bot iniciando sesión con su cuenta de creador. A partir de ahí, el bot obtiene los niveles y los mecenas de la campaña, los mantiene sincronizados y puede entregar roles de Discord según cuánto aporta cada mecenas. Cuando Patreon conoce la cuenta de Discord de un mecenas, el vínculo es automático; de lo contrario, el staff puede vincular a un miembro con un usuario de Patreon a mano.

Una vez al mes, el día que elijas, el bot puede publicar un anuncio en un canal agradeciendo a los mecenas. El mensaje puede ser texto simple o un embed y puede incluir cifras en vivo como el número de mecenas activos, los ingresos mensuales y cuántas personas se unieron este mes. También hay un comando de reconocimiento que publica una mención para cualquiera que se haya hecho mecenas en la última semana.

El panel gestiona todo el flujo: conectar, ver mecenas y niveles, asignar niveles a roles y editar los ajustes del anuncio. Los comandos cubren lo mismo además de estadísticas y clasificaciones en el chat.

## Por qué usarlo

- Los mecenas deberían recibir un rol de color y acceso a canales solo para mecenas sin que el staff revise Patreon a mano.
- Los niveles cambian los roles automáticamente cuando alguien mejora, baja de nivel o deja de aportar.
- Quieres una publicación recurrente de "gracias a nuestros 40 mecenas" que se mantenga exacta sin editar los números.
- El staff quiere ver rápidamente quién apoya y en qué nivel desde dentro de Discord.

## Conectar una campaña

La conexión usa el flujo OAuth de Patreon. La tarjeta **Conecta tu Patreon** del panel, o el comando `patreonsync`, exclusivo del propietario del bot, genera un enlace "Authorize with Patreon". Inicia sesión con la cuenta que es propietaria de la campaña, aprueba el acceso solicitado y Patreon te devuelve a la página de Patreon del panel. El bot intercambia el código por tokens, guarda la primera campaña que encuentra y ejecuta de inmediato una sincronización completa de niveles y mecenas.

La cuenta que uses debe ser propietaria de una campaña. Si no tiene ninguna, la devolución de llamada falla con "No Patreon campaigns found for this user".

La pestaña **Resumen** del panel muestra el estado de la conexión con el **ID de la campaña**, la **Última sincronización** y **El token caduca**, además de tarjetas resumen con los **Mecenas** activos, los **Ingresos** mensuales y el **Creador de la campaña**. Los tokens se renuevan automáticamente cuando caducan; las **Acciones rápidas** de la misma pestaña son **Sincronizar todos los datos**, **Sincronizar roles**, **Enviar anuncio** y **Volver a iniciar sesión**. Volver a iniciar sesión desconecta la campaña: borra los tokens pero conserva los ajustes de canal, mensaje y asignaciones para que puedas reconectar. La cabecera de la página también tiene los botones **Actualizar datos** y **Sincronizar mecenas**.

> [!NOTE]
> La integración con Patreon tiene que estar activada por el anfitrión del bot. Si el bot no tiene un ID de cliente de Patreon configurado, el botón de conexión y `patreonsync` informan de que la integración no está configurada.

## Mecenas y sincronización

Una sincronización obtiene a todos los miembros de la campaña con su importe de aportación, su estado y, cuando el mecenas ha conectado Discord a Patreon, su ID de usuario de Discord. Los mecenas activos son los que Patreon informa como activos o con una aportación vigente. La pestaña **Mecenas** los lista con **Nombre** (y correo cuando Patreon proporciona uno), **Aportación**, **Se unió** y **Estado**, y el botón **Sincronizar mecenas** de la parte superior de la página actualiza la lista.

`patreonsupporters` muestra en el chat hasta 15 mecenas activos con su aportación y su mención de Discord, `patreontop [count]` clasifica del 1 al 20 principales por aportación, `patreonstats` resume el número de mecenas, el número de vinculados, los ingresos totales y medios y el número de niveles, y `patreonanalytics` añade antiguos mecenas, ingresos totales históricos, nuevos mecenas este mes y la distribución por niveles.

Si la cuenta de Discord de un mecenas no está asociada en Patreon, usa `patreonlink @member <patreonUserId>` para vincularlo manualmente. El ID de usuario de Patreon es el ID numérico de la cuenta de Patreon del mecenas; la lista de mecenas del panel no lo muestra.

## Asignación de niveles a roles

Cada nivel de Patreon puede asignarse a un rol de Discord. En la pestaña **Asignación de niveles**, elige un **Nivel de Patreon** y un **Rol de Discord** y guarda. La lista **Niveles disponibles** muestra cada nivel publicado con su precio y si está asignado. En el chat, `patreontiermap <tierId> @role` hace lo mismo; obtén los ID de nivel con `patreonroles`.

La sincronización de roles está desactivada hasta que la actives con `patreonrolesync` o con la casilla **Activar sincronización de roles**. Cuando está activada, el bot calcula qué rol debería tener un mecenas: el nivel asignado de mayor precio cuyo importe sea igual o inferior a su aportación. Cualquier otro rol de Patreon asignado que tenga se quita, y se añade el rol objetivo. Un mecenas que deja de aportar pierde todos los roles asignados.

La sincronización ocurre cuando se vincula a un miembro y cuando ejecutas `patreonsyncall` o la acción de sincronizar roles del panel. Solo se pueden sincronizar los mecenas con un ID de Discord conocido.

> [!PERMISSION]
> El bot necesita Gestionar roles y su propio rol debe estar por encima de todos los roles asignados. Los roles por encima del bot se omiten.

## Anuncios mensuales

Define un canal con `patreonch #channel` o con el selector **Canal de anuncios**, y un día con `patreonday <1..28>` o **Día del anuncio (1-28)**. El día está limitado a 28 para que febrero nunca se salte un mes. Los anuncios están desactivados hasta que ejecutes `patreontoggle` o marques **Activar anuncios**.

El bot comprueba cada hora. El día elegido, si aún no ha anunciado este mes, publica y registra la hora. Si el bot estaba desconectado ese día, se pone al día al iniciar siempre que el día ya haya pasado este mes. `patreonannounce` publica uno de inmediato, lo que también cuenta como la publicación de este mes.

Sin un mensaje personalizado, el bot publica un agradecimiento predeterminado que incluye el número de mecenas activos y los ingresos mensuales. Define el tuyo con `patreonmsg <text or embed code>` o con el editor del mensaje del anuncio del panel. El texto pasa por el analizador de embeds. Usa `-` para volver al predeterminado.

### Marcadores

Funcionan en el mensaje del anuncio junto con los marcadores habituales de servidor y canal.

| Marcador | Valor |
| --- | --- |
| `%month%` | Nombre del mes actual |
| `%year%` | Año actual |
| `%patreon.link%` | `https://patreon.com` |
| `%supporter.count%` | Mecenas activos |
| `%supporter.total%` | Todos los mecenas registrados alguna vez |
| `%supporter.new%` | Nuevos mecenas este mes |
| `%supporter.former%` | Antiguos mecenas |
| `%supporter.linked%` | Mecenas con una cuenta de Discord vinculada |
| `%revenue.monthly%` | Aportaciones mensuales actuales |
| `%revenue.average%` | Aportación media |
| `%revenue.lifetime%` | Ingresos totales históricos |
| `%growth.new%` | Nuevos mecenas este mes |
| `%top.supporter.name%` | Mecenas con mayor aportación |
| `%top.supporter.amount%` | Su aportación |
| `%patron.name%` | Mecenas con mayor aportación, igual que `%top.supporter.name%` |
| `%patron.tier%` | El nivel en el que está ese mecenas, o "Unknown" si Patreon no ha informado de ninguno |
| `%patron.amount%` | Su aportación mensual, igual que `%top.supporter.amount%` |
| `%tiers.count%` | Número de niveles |
| `%tier.popular%` | Nivel con más mecenas |
| `%tier.popular.count%` | Cuántos hay en él |
| `%supporters.summary%` | Frase ya hecha sobre el número de mecenas |
| `%revenue.summary%` | Frase ya hecha sobre los ingresos |
| `%growth.summary%` | Frase ya hecha sobre el crecimiento |

> [!EXAMPLE]
> `It's %month%! Thanks to %supporters.summary%%revenue.summary%!%growth.summary%` se muestra como "It's December! Thanks to our 25 incredible supporters who help us raise $150/month! We gained 3 new supporters this month!" (las frases de resumen las genera el bot en inglés).

## Reconocer a los nuevos mecenas

`patreonrecognize [#channel]` publica un embed de bienvenida para los mecenas cuya aportación empezó en los últimos siete días, hasta cinco por ejecución, en el canal indicado o en el actual. Es un comando manual, no una tarea programada, así que ejecútalo después de una sincronización. Ejecutarlo dos veces publica a las mismas personas dos veces.

## Ajustes

El panel tiene cuatro pestañas: **Resumen**, **Mecenas**, **Asignación de niveles** y **Configuración**.

| Ajuste | Por defecto | Qué controla |
| --- | --- | --- |
| Canal de anuncios | ninguno | Dónde va la publicación mensual; ninguno significa que los anuncios están desactivados |
| Día del anuncio (1-28) | ninguno | Día del mes en el que se publica; los anuncios no se activan hasta que se define uno |
| Mensaje del anuncio | agradecimiento integrado | Texto o embed personalizado con los marcadores anteriores |
| Activar anuncios | desactivado | Si se envía la publicación mensual |
| Activar sincronización de roles | desactivado | Si los roles asignados se aplican a los mecenas |
| Asignaciones de niveles | ninguna | Qué rol concede cada nivel |

## Guía de configuración

1. Abre **Patreon** en el panel y haz clic en el botón de conectar. Inicia sesión con la cuenta del propietario de la campaña y aprueba el acceso.
2. Espera a la primera sincronización y comprueba que la pestaña **Mecenas** muestre a tus mecenas.
3. En **Asignación de niveles**, asigna cada nivel a un rol. Crea primero los roles y coloca el rol del bot por encima de ellos.
4. Marca **Activar sincronización de roles** y luego ejecuta `patreonsyncall` para aplicar los roles a todos los que ya están vinculados.
5. En **Configuración**, elige el **Canal de anuncios** y el **Día del anuncio**, escribe un mensaje con los marcadores y marca **Activar anuncios**.
6. Ejecuta `patreonannounce` una vez para ver el resultado en el canal.

## Comandos

Ejecútalos con el prefijo de tu servidor (`.` salvo que lo hayas cambiado).

| Comando | Alias | Requiere | Para qué sirve |
| --- | --- | --- | --- |
| `patreonsync` | `ptsync` | Propietario del bot | Publicar el enlace de autorización OAuth |
| `patreonch [#channel]` | `ptch` | Administrador | Mostrar o definir el canal de anuncios |
| `patreondisable` | `ptdisable` | Administrador | Borrar el canal, desactivando los anuncios |
| `patreonmsg [text]` | `ptmsg` | Administrador | Mostrar o definir el mensaje del anuncio, `-` para restablecerlo |
| `patreonday [day]` | `ptday` | Administrador | Mostrar o definir el día del mes |
| `patreontoggle` | `pttoggle` | Administrador | Activar o desactivar los anuncios |
| `patreonconfig` | `ptconfig` | Administrador | Mostrar el estado, canal, día, mensaje y última publicación |
| `patreonannounce` | `ptannounce` | Administrador | Enviar el anuncio ahora |
| `patreonhelp` | `pthelp` | Nadie | Lista de marcadores y resumen de comandos |
| `patreonsupporters` | `ptsupporters` | Administrador | Listar los mecenas activos |
| `patreontop [count]` | `pttop` | Nadie | Mecenas principales por aportación |
| `patreonstats` | `ptstats` | Administrador | Resumen de mecenas e ingresos |
| `patreonanalytics` | `ptanalytics` | Administrador | Analíticas detalladas |
| `patreonlink <user> <patreonUserId>` | `ptlink` | Administrador | Vincular a un miembro con un usuario de Patreon |
| `patreonrolesync` | `ptrolesync` | Gestionar roles | Activar o desactivar la sincronización automática de roles |
| `patreontiermap <tierId> <role>` | `pttiermap` | Gestionar roles | Asignar un nivel a un rol |
| `patreonroles` | `ptroles` | Administrador | Listar los niveles con sus ID y roles |
| `patreonsyncall` | `ptsyncall` | Gestionar roles | Aplicar roles a todos los mecenas vinculados |
| `patreonrecognize [#channel]` | `ptrecognize` | Administrador | Mencionar a los mecenas de los últimos siete días |

## Consejos y advertencias

- Solo los mecenas que conectaron Discord en su perfil de Patreon, o que fueron vinculados con `patreonlink`, pueden recibir roles.
- La sincronización de roles elige un rol por mecenas, el mejor nivel que cubre su aportación. No se admite acumular varios roles de nivel.
- Los anuncios se publican como máximo una vez por mes natural. Ejecutar `patreonannounce` el día 3 significa que la publicación programada del día 15 se omite ese mes.
- El día del anuncio está en UTC.
- El anuncio mensual trata de toda la campaña, así que `%patron.name%`, `%patron.tier%` y `%patron.amount%` describen al mecenas activo con mayor aportación en lugar de a cada mecenas por turno. Usa `patreonrecognize` para menciones por mecenas.
- Reconectar con una cuenta de Patreon distinta cambia la campaña pero conserva las asignaciones antiguas, así que revisa después la pestaña **Asignación de niveles**.
