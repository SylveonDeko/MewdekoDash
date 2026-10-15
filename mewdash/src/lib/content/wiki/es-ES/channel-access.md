---
title: Acceso a canales
slug: channel-access
summary: Condiciona un canal privado a un formulario de solicitud, y deja que los miembros que ya están dentro voten quién entra.
icon: fa-lock
category: Security
dashboard: /dashboard/channel-access
module: ChannelAccess
tags: [channel access, gate, application, apply, vote, private channel, locked channel, inner circle, blacklist, review, acceso a canales, solicitud, solicitar, votar, canal privado, canal bloqueado, círculo interno, lista negra, revisión]
related: [administration, tickets, forms]
---

## Qué hace

El staff pone un "acceso" (gate) en un canal que la mayoría de los miembros no puede ver. Los miembros hacen clic en un botón **Solicitar acceso**, o ejecutan `channelaccessapply`, y rellenan un breve formulario de hasta cinco preguntas. La solicitud se publica como un embed en un canal de revisión con los botones **Aprobar**, **Denegar**, **Abstenerse** (opcional) y **Desglose**.

Las personas que ya pueden ver el canal votan. Cuando llegan suficientes aprobaciones, el solicitante entra, ya sea recibiendo un rol o recibiendo un permiso personal específico en el canal. Suficientes denegaciones, o que se cierre la ventana de votación, lo rechazan. El staff puede forzar cualquiera de los dos resultados en cualquier momento.

Al solicitante se le comunica el resultado por MD si el acceso lo permite, y los solicitantes denegados tienen que esperar a que termine un enfriamiento antes de volver a solicitar. Todo se registra en un canal de registro opcional.

## Por qué usarlo

- Un salón solo para miembros o "círculo interno" donde los miembros actuales deciden quién se une.
- Un canal de adultos verificados donde un pequeño grupo de confianza avala a los recién llegados.
- Canales de intercambio o mercado que quieren una comprobación de sentido común antes de que alguien pueda publicar.
- Cualquier canal en el que quieras una solicitud por escrito sin que el staff tenga que leerlas todas personalmente.

## Accesos

Un acceso es un canal más sus reglas. Cada canal puede tener un acceso. Crear un acceso con un rol lo convierte en un **acceso por rol**; crearlo sin rol lo convierte en un **acceso directo**.

| Modo de concesión | Etiqueta en el panel | Cómo se da el acceso | Quién cuenta como "dentro" |
| --- | --- | --- | --- |
| Rol | Darles un rol | Se añade al solicitante el rol de acceso | Cualquiera que tenga el rol de acceso |
| Permiso de canal | Añadirlos directamente al canal | Se escribe un permiso específico de Ver canal en modo permitir para ese miembro | Cualquiera que pueda ver el canal en ese momento |

Los miembros aprobados nunca se quitan automáticamente. Quita tú el rol o elimina el permiso específico.

## Solicitudes

Antes de abrir una solicitud, el bot comprueba por orden: que el acceso acepta solicitudes, que el miembro no tiene ya acceso, que no está bloqueado, que su cuenta y su entrada al servidor son lo bastante antiguas, que no tiene una solicitud abierta para este acceso y que ha pasado su enfriamiento para volver a solicitar. Si falla cualquier comprobación, se devuelve un mensaje efímero que explica el motivo.

Si el acceso tiene preguntas, se abre un modal con un cuadro por pregunta. Las preguntas están limitadas a 45 caracteres por los límites de los modales de Discord. Los cuadros de respuesta son de una línea (200 caracteres) o de varias líneas (1000 caracteres) y se pueden marcar como obligatorios. Un acceso sin preguntas se envía de inmediato.

El mensaje de revisión va al **Canal de revisión**, o al propio canal con acceso restringido cuando no hay ninguno configurado. Muestra al solicitante, cuándo se creó su cuenta y cuándo se unió, cada pregunta y respuesta, un recuento de votos en vivo y un pie con la hora en que se cierra la votación. Si **Ocultar al solicitante hasta que cierre la votación** está activado, el nombre se sustituye por "Hidden until the vote closes" mientras está pendiente.

### Estados

| Estado | Significado |
| --- | --- |
| Pending | Abierta y en votación |
| Approved | Aprobada, se concedió el acceso |
| Denied | Rechazada por votación, caducidad o el staff |
| Withdrawn | El solicitante la retiró con `channelaccesswithdraw` |
| Expired | Las reglas de caducidad actuales no lo usan; se conserva por el historial |

## Votación

Quién puede votar depende del acceso. Si se ha establecido un **Rol de votantes**, solo pueden votar los miembros con ese rol. Si no, puede votar cualquiera que ya tenga acceso al canal, además de cualquiera con Gestionar roles. Los solicitantes nunca pueden votar en su propia solicitud.

Hacer clic en un botón registra un voto. Hacer clic en un botón distinto lo cambia. Hacer clic otra vez en el mismo botón lo quita. El recuento se actualiza en el mensaje tras cada cambio.

La solicitud se resuelve en cuanto las aprobaciones alcanzan **Aprobaciones necesarias** o las denegaciones alcanzan **Denegaciones necesarias**. Poner cualquiera de los umbrales en 0 desactiva ese lado, así que un acceso con **Denegaciones necesarias** en 0 solo puede ser denegado por el staff o por caducidad.

**Desglose** muestra quién votó en qué sentido, solo para los votantes. Con **Ocultar quién votó qué** activado, solo los miembros con Gestionar roles pueden verlo.

### Cuando se cierra la ventana

Cada minuto se ejecuta una comprobación en segundo plano de las solicitudes que han superado su **Ventana de votación**. Lo que ocurre se configura por acceso:

| Opción | Etiqueta en el panel | Resultado |
| --- | --- | --- |
| Deny | Denegar la solicitud | La solicitud se deniega. Predeterminado. |
| Majority | La opción con más votos | Se aprueba si las aprobaciones superan a las denegaciones; si no, se deniega |
| StayOpen | Dejarla abierta para el staff | No ocurre nada hasta que el staff la resuelva |

Establece **Ventana de votación** en 0 para no tener límite de tiempo.

## Bloquear solicitantes

El staff puede bloquear a un usuario de un acceso o de todos los accesos del servidor. Los usuarios bloqueados reciben "You are blocked from applying for this channel" cuando lo intentan. Los bloqueos tienen un motivo opcional que se muestra en la lista negra.

## Ajustes

La página **Acceso a canales** tiene tres pestañas: **Accesos**, **Solicitudes** y **Bloqueados**.

**Accesos** lista todos los accesos con un interruptor **Aceptando solicitudes**, y se expande para mostrar sus ajustes, **Preguntas de la solicitud** y un publicador del **Panel de solicitud**. Los valores por defecto de abajo se aplican a los accesos nuevos.

| Ajuste | Predeterminado | Qué controla |
| --- | --- | --- |
| Canal bloqueado | obligatorio | El canal con acceso restringido |
| Cómo entra la gente | Darles un rol | Acceso por rol o acceso directo |
| Rol concedido al aprobar | ninguno | El rol de acceso, para accesos por rol |
| Aprobaciones necesarias | 3 | Aprobaciones con las que se resuelve como aprobada; 0 lo desactiva |
| Denegaciones necesarias | 3 | Denegaciones con las que se resuelve como denegada; 0 lo desactiva |
| Ventana de votación (horas) | 72 | Tiempo antes de que se ejecute la regla de caducidad; 0 para sin límite |
| Cuando se cierra la ventana | Denegar la solicitud | Una de las tres opciones de caducidad |
| Canal de revisión | el propio canal con acceso restringido | Dónde se publican las solicitudes para votar |
| Canal de registro | sin registro | Dónde se registran las nuevas solicitudes y los resultados |
| Rol de votantes | todos los que tengan el rol de acceso | Restringe la votación a un rol |
| Mencionar rol en nuevas solicitudes | sin mención | Rol que se menciona cuando llega una solicitud |
| Antigüedad mín. de la cuenta (días) | 0 | Rechaza las cuentas más recientes que esto |
| Tiempo mín. en el servidor (días) | 0 | Rechaza a los miembros que se unieron más recientemente que esto |
| Espera para volver a solicitar (horas) | 168 | Espera tras una denegación o caducidad antes de volver a solicitar |
| Ofrecer un botón de abstención | activado | Añade un botón Abstenerse al mensaje de revisión |
| Ocultar al solicitante hasta que cierre la votación | desactivado | Solicitante anónimo mientras está pendiente |
| Ocultar quién votó qué | desactivado | Desglose solo para Gestionar roles |
| Enviar MD al solicitante con la decisión | activado | Envía el resultado por MD |

**Solicitudes** lista las solicitudes filtradas por acceso y estado, con el recuento y los botones **Aprobar** y **Denegar** para las pendientes. **Bloqueados** lista a los usuarios bloqueados por ámbito y te permite **Bloquear** a alguien de un acceso o de **Cada acceso**, con un motivo opcional.

## Guía de configuración

1. Haz privado el canal en Discord y, para un acceso por rol, crea el rol que podrá verlo.
2. Abre **Acceso a canales** en el panel y usa **Abrir solicitudes para un canal**. Elige el **Canal bloqueado**, escoge **Cómo entra la gente** y selecciona el rol si hace falta.
3. Expande el acceso. Establece un **Canal de revisión** para que las solicitudes no acaben en el canal bloqueado, y un **Canal de registro** si quieres un historial.
4. Ajusta **Aprobaciones necesarias**, **Denegaciones necesarias** y la **Ventana de votación** según cuántos votantes esperes.
5. En **Preguntas de la solicitud**, añade hasta cinco preguntas. Marca **Obligatoria** y **Respuesta de varias líneas** según haga falta.
6. En **Panel de solicitud**, elige dónde debe ir el botón y haz clic en **Publicar panel**.
7. Solicita desde una cuenta de prueba, vota desde un miembro que tenga acceso y comprueba que el solicitante entra.

## Comandos

Ejecútalos con el prefijo de tu servidor (`.` salvo que lo hayas cambiado). Las versiones con barra están bajo `/channelaccess`.

| Comando | Alias | Requiere | Para qué sirve |
| --- | --- | --- | --- |
| `channelaccesssetup <#channel> [@role]` | `casetup` | Gestionar roles | Crea un acceso; omite el rol para un acceso directo |
| `channelaccessremove <#channel>` | `caremove` | Gestionar roles | Elimina un acceso con sus preguntas e historial |
| `channelaccesslist` | `calist` | Nadie | Lista los accesos con umbrales, ventana y estado |
| `channelaccessconfig <#channel> [setting] [value]` | `caconfig` | Gestionar roles | Cambia un ajuste; ejecútalo sin ajuste para ver la lista |
| `channelaccesspanel <#channel> [#target]` | `capanel` | Gestionar roles | Publica el botón de solicitud, en el canal actual por defecto |
| `channelaccessquestionadd <#channel> <question>` | `caqadd` | Gestionar roles | Añade una pregunta obligatoria de varias líneas |
| `channelaccessquestionremove <#channel> <position>` | `caqremove` | Gestionar roles | Quita una pregunta por su número en la lista |
| `channelaccessquestionlist <#channel>` | `caqlist` | Gestionar roles | Muestra las preguntas por orden |
| `channelaccessapply <#channel>` | `caapply` | Nadie | Publica el botón de solicitud para ti |
| `channelaccesswithdraw <id>` | `cawithdraw` | Nadie | Retira tu propia solicitud abierta |
| `channelaccesshistory [@user]` | `cahistory` | Nadie | Tu historial de solicitudes; los demás usuarios requieren Gestionar roles |
| `channelaccesspending [#channel]` | `capending` | Nadie | Lista las solicitudes abiertas, opcionalmente de un acceso |
| `channelaccessapprove <id> [reason]` | `caapprove` | Gestionar roles | Aprueba sin importar los votos |
| `channelaccessdeny <id> [reason]` | `cadeny` | Gestionar roles | Deniega sin importar los votos |
| `channelaccessblacklistadd <@user> [#channel]` | `cabladd` | Gestionar roles | Bloquea de un acceso, o de todos si no indicas canal |
| `channelaccessblacklistremove <@user> [#channel]` | `cablremove` | Gestionar roles | Levanta un bloqueo; indica el mismo canal en el que se estableció |
| `channelaccessblacklist` | `cablacklist` | Gestionar roles | Lista los usuarios bloqueados |

Los ajustes que acepta `channelaccessconfig` son `enabled`, `approvals`, `denials`, `votehours`, `onexpiry` (`deny`, `majority`, `stayopen`), `reviewchannel`, `logchannel`, `voterrole`, `pingrole`, `anonymousapplicant`, `anonymousvotes`, `allowabstain`, `minaccountage`, `minserverage`, `reapplycooldown` y `dmondecision`.

> [!EXAMPLE]
> `caconfig #inner-circle approvals 5` y luego `caconfig #inner-circle onexpiry majority`.

## Consejos y trampas habituales

- El bot necesita Gestionar roles para los accesos por rol y Gestionar canales (con permiso para editar los permisos específicos de ese canal) para los accesos directos. Su rol más alto debe estar por encima del rol de acceso.
- Si no se establece un **Canal de revisión**, las solicitudes se publican dentro del canal bloqueado. Eso funciona para "los miembros votan a los recién llegados", pero establece un canal aparte si quieres que voten los miembros del staff.
- Las preguntas añadidas por comando son siempre obligatorias y de varias líneas. Usa el panel para hacer una pregunta opcional o de una línea, o para darle un texto de marcador.
- Eliminar un acceso borra de forma permanente sus preguntas, solicitudes y votos.
- Los miembros que abandonan el servidor antes de que termine la votación no reciben acceso aunque hayan sido aprobados.
- Los resultados por votación y caducidad solo se envían por MD en las aprobaciones y denegaciones. Las solicitudes retiradas no reciben MD.
- Un usuario bloqueado debe desbloquearse con el mismo ámbito con el que se hizo el bloqueo. Un bloqueo de todo el servidor no se levanta con un desbloqueo que nombre un canal.
