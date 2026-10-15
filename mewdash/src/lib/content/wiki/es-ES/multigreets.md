---
title: Saludos
slug: multigreets
summary: Publica mensajes de bienvenida en hasta treinta canales cuando alguien entra, además de los saludos clásicos de despedida, boost y por MD.
icon: fa-bell
category: Actions
dashboard: /dashboard/multigreets
module: MultiGreets
tags: [greets, multigreets, welcome, join message, goodbye, bye, leave message, boost message, greet dm, webhook, placeholders, saludos, bienvenida, mensaje de entrada, despedida, mensaje de salida, mensaje de boost, saludo por MD]
related: [rolegreets, invites, administration]
---

## Qué hace

Cuando un miembro entra, el bot publica un saludo en cada canal que hayas configurado como saludo. Cada saludo tiene su propio mensaje, su propio temporizador de borrado, su propia identidad de webhook y su propio interruptor para bots. Puedes ejecutarlos todos a la vez o elegir uno al azar en cada entrada.

Los mensajes pasan por el analizador de embeds, así que un saludo puede ser texto simple, un embed completo con botones o una publicación por webhook con nombre y avatar personalizados. Los marcadores rellenan el nombre del miembro, el nombre del servidor, el número de miembros y, si el seguimiento de invitaciones está activado, quién lo invitó.

El sistema anterior de mensaje único sigue existiendo junto a este. Gestiona el mensaje de despedida cuando alguien se va, el anuncio de boost cuando alguien hace boost y un MD de bienvenida. Esos viven en el módulo de Administración y se describen más abajo.

## Por qué usarlo

- Una bienvenida pública en `#general` y una línea discreta de registro en `#staff-joins` a partir de la misma entrada.
- Estilos de saludo distintos por canal, por ejemplo un embed en uno y un "personaje" por webhook en otro.
- Un conjunto de saludos donde a cada miembro nuevo se le asigna uno al azar.
- Una bienvenida corta que se borra sola al cabo de un minuto para que el canal no se llene.
- Un mensaje de despedida o de boost sin configurar nada más.

## Tipos de saludo

El **Tipo de saludo** es de todo el servidor y decide qué ocurre en una entrada.

| Tipo | Etiqueta del panel | Qué ocurre |
| --- | --- | --- |
| MultiGreet | Todos los saludos | Se activan todos los saludos habilitados, en el orden en que se añadieron. Por defecto. |
| RandomGreet | Saludo aleatorio | Se elige un saludo al azar de la lista y se activa. Los saludos desactivados pueden ser elegidos y luego omitidos. |
| Off | Desactivado | No se activa ningún saludo. |

## Qué contiene un saludo

Cada saludo está ligado a un canal. Un canal puede tener hasta cinco saludos, y un servidor puede tener treinta en total. Los saludos se numeran según su posición en la lista, y ese número es el que usan los comandos.

| Campo | Por defecto | Significado |
| --- | --- | --- |
| Canal | el canal que añadiste | Dónde se publica este saludo |
| Mensaje | vacío | Plantilla de texto o embed. Un saludo vacío no envía nada. |
| Eliminar tras | 0 (nunca) | Segundos hasta que el saludo se borra solo |
| Saludar a bots | desactivado | Si el saludo se activa cuando entra una cuenta de bot |
| Webhook | ninguno | Publicar mediante un webhook con nombre y avatar personalizados en lugar de como el bot |
| Activado | sí | Los saludos desactivados se omiten sin eliminarse |

Si se elimina el canal, el saludo se quita la próxima vez que intente activarse. Si se elimina un webhook o el bot pierde permiso para publicar, el saludo pasa a desactivado en lugar de dar error en cada entrada.

## Marcadores

Los saludos se construyen con los conjuntos de marcadores de usuario, servidor y bot. Los marcadores del invitador solo funcionan mientras el seguimiento de invitaciones esté activado en la página de Invitaciones.

| Marcador | Valor |
| --- | --- |
| `%user%`, `%user.mention%` | Mención del miembro nuevo |
| `%user.name%`, `%username%` | Nombre de usuario |
| `%user.fullname%`, `%userfull%` | Etiqueta completa |
| `%user.id%`, `%id%` | ID de usuario |
| `%user.avatar%`, `%useravatar%` | URL del avatar |
| `%user.banner%` | URL del banner |
| `%user.created_date%`, `%user.created_time%` | Cuándo se creó la cuenta |
| `%user.joined_date%`, `%user.joined_time%` | Cuándo entró a este servidor |
| `%server%`, `%server.name%` | Nombre del servidor |
| `%server.id%`, `%sid%` | ID del servidor |
| `%server.icon%`, `%server.banner%` | URL del icono y del banner |
| `%server.members%`, `%members%` | Número de miembros |
| `%server.boostlevel%`, `%server.boostcount%` | Nivel de boost y número de boosts |
| `%server.time%`, `%server.timestamp.longdatetime%` | Hora actual, simple o como marca de tiempo de Discord |
| `%bot.name%`, `%bot.id%`, `%bot.avatar%` | Sobre el propio bot |
| `%inviter.username%`, `%inviter.mention%`, `%inviter.id%`, `%inviter.avatar%` | La persona cuya invitación se usó, o `Unknown` |
| `%inviter.count%`, `%inviter.regular%`, `%inviter.left%`, `%inviter.fake%`, `%inviter.bonus%` | El recuento de invitaciones del invitador |
| `%invite.code%`, `%invite.url%`, `%invite.uses%`, `%invite.label%`, `%invite.type%` | La invitación que se usó, su etiqueta y si fue una invitación, el enlace personalizado o una app |
| `%user.joincount%`, `%user.leavecount%` | Cuántas veces ha entrado y salido este miembro |
| `%server.members.ordinal%` | Número de miembros como 1.º, 2.º, 1204.º |
| `%user.joined.R%`, `%user.created.F%` (y los estilos t, T, d, D, f) | Momentos de entrada y de creación de la cuenta como marcas de tiempo de Discord |

> [!EXAMPLE]
> `Welcome %user.mention% to %server%! You are member #%server.members%.`

La lista completa de marcadores de servidor, canal y bot está en la página de marcadores. Los marcadores de canal no se rellenan en los saludos.

## Los comandos clásicos de saludo, despedida y boost

Son anteriores a los multi saludos y viven en el módulo de Administración. Son un mensaje cada uno, guardado en la configuración del servidor, y se activan desde el canal en el que ejecutes el comando.

| Mensaje | Se activa cuando | Marcadores |
| --- | --- | --- |
| Bye | Un miembro se va | Conjuntos de usuario, servidor y bot, además de marcadores de canal. `%user%` menciona al miembro que se fue. |
| Boost | Un miembro empieza a hacer boost, o vuelve a hacerlo | Conjuntos de usuario, canal, servidor, bot y gif |
| Saludo por MD | Un miembro entra, enviado como mensaje privado | Conjuntos de usuario, canal, servidor, bot y gif |

Ejecutar `bye` o `boost` activa o desactiva ese mensaje y define el canal como aquel en el que lo escribiste. `byedel` y `boostdel` definen un temporizador de autoborrado en segundos; `boostdel` está limitado a 600. Los comandos de mensaje sin texto muestran el mensaje actual. `leavehook` envuelve el mensaje de despedida en un webhook con nombre y avatar personalizados, y `leavehook disable` lo quita.

Los MD de saludo requieren cuidado. El bot te pide confirmación antes de activarlos, salvo que sea un bot verificado, porque los MD masivos de bots no verificados pueden hacer que el bot sea marcado. Cualquier miembro puede bloquear estos MD para sí mismo con `greetdmoptout`, o con el interruptor de MD de bienvenida en su propia página de perfil del panel.

No existe un comando clásico de saludo en canal. Usa un multi saludo para las bienvenidas en canales.

## Ajustes

Todo está en la página Saludos del panel.

| Ajuste | Por defecto | Qué controla |
| --- | --- | --- |
| Tipo de saludo | Todos los saludos | Todos los saludos, Saludo aleatorio o Desactivado |
| Añadir nuevo saludo | | Elige un canal y luego haz clic en **Añadir saludo** |
| Mensaje de bienvenida | vacío | El constructor de embeds para un saludo. Admite contenido, hasta diez embeds y componentes. |
| Eliminar tras | Nunca | Introduce un tiempo como `1m30s` o `45s` |
| Webhook | Sin configurar | Nombre del webhook y URL de avatar opcional |
| Saludar a bots | desactivado | Se activa también para cuentas de bots |
| Activado | sí | Desactiva un saludo sin eliminarlo |

Los mensajes de despedida, boost y saludo por MD no están en esta página. Defínelos con los comandos anteriores.

## Guía de configuración

1. Abre **Saludos** en el panel y deja el **Tipo de saludo** en **Todos los saludos**.
2. En **Añadir nuevo saludo**, elige el canal de bienvenida y haz clic en **Añadir saludo**.
3. En la nueva tarjeta, abre **Mensaje de bienvenida** y crea tu mensaje usando los marcadores anteriores. Guárdalo.
4. Opcionalmente, define **Eliminar tras**, añade un nombre y un avatar de **Webhook**, y activa **Saludar a bots** si quieres que se anuncien las entradas de bots.
5. Repite con los demás canales. Cambia a **Saludo aleatorio** si añadiste varios al mismo canal y quieres variedad.
6. Para un mensaje de despedida, ejecuta `byemsg Goodbye %user%, we will miss you` en el canal que quieras y luego `bye` para activarlo.
7. Para un mensaje de boost, ejecuta `boostmsg Thanks for boosting, %user%!` y luego `boost`.
8. Prueba con `byetest` y `boosttest`. Los multi saludos tienen vista previa: ejecuta `multigreetmessage 1` y pulsa **Vista previa**.

## Comandos

Ejecútalos con el prefijo de tu servidor (`.` salvo que lo hayas cambiado). Los comandos de multi saludos también están disponibles como `/multigreets add`, `/multigreets remove` y así sucesivamente.

| Comando | Alias | Requiere | Para qué sirve |
| --- | --- | --- | --- |
| `multigreetadd [#channel]` | `mgadd`, `mga` | Administrador | Añadir un saludo para un canal, por defecto el actual |
| `multigreetremove <number or #channel>` | `mgrem`, `mgrm`, `mgr` | Administrador | Quitar un saludo por número, o todos los saludos de un canal tras confirmar |
| `multigreetmessage <number> [message]` | `mgmsg`, `mgm` | Administrador | Definir el texto o embed del saludo; sin mensaje, ofrece una vista previa o la plantilla sin procesar |
| `multigreetdelete <number> <time or seconds>` | `mgdel`, `mgd` | Administrador | Temporizador de autoborrado, por ejemplo `1m` o `60`; `0` lo desactiva |
| `multigreetdisable <number> <true or false>` | `mgdisable`, `mgdis` | Administrador | `true` desactiva el saludo, `false` lo activa |
| `multigreetgreetbots <number> <true or false>` | `multigreetbots`, `mggb` | Administrador | Si este saludo se activa para bots |
| `multigreetwebhook <number> [name] [avatar url]` | `mgwebhook`, `mghook`, `mgh` | Administrador | Crear un webhook para el saludo; sin nombre, lo quita |
| `multigreettype <multigreet, randomgreet or off>` | `mgtype`, `mgt` | Administrador | Cambiar el tipo de saludo de todo el servidor |
| `multigreetlist` | `mglist`, `mgl` | Administrador | Recorrer todos los saludos con sus ajustes |
| `bye` | | Gestionar servidor | Activar o desactivar el mensaje de despedida en este canal |
| `byemsg [text]` | | Gestionar servidor | Mostrar o definir el mensaje de despedida |
| `byedel [seconds]` | | Gestionar servidor | Temporizador de autoborrado de la despedida, 30 por defecto |
| `byetest [@user]` | | Gestionar servidor | Enviar el mensaje de despedida como prueba |
| `leavehook [#channel] [name] [image url] [text]` | `byehook` | Gestionar servidor | Enviar las despedidas mediante un webhook, o `leavehook disable` |
| `boost` | | Gestionar servidor | Activar o desactivar el mensaje de boost en este canal |
| `boostmsg [text]` | `boostmessage` | Gestionar servidor | Mostrar o definir el mensaje de boost |
| `boostdel [seconds]` | `boostdelete` | Gestionar servidor | Temporizador de autoborrado del boost, de 0 a 600, 30 por defecto |
| `boosttest [@user]` | `testboost` | Gestionar servidor | Enviar el mensaje de boost como prueba |
| `greetdm` | | Gestionar servidor | Activar o desactivar el MD de bienvenida |
| `greetdmmsg [text]` | | Gestionar servidor | Mostrar o definir el texto del MD de bienvenida |
| `greetdmtest [@user]` | | Gestionar servidor | Enviar el MD de bienvenida como prueba |
| `greetdmoptout` | `gdmoptout` | Nadie | Dejar de recibir MD de bienvenida de este bot en cualquier lugar |

## Consejos y advertencias

- `multigreetdelete` necesita que el bot tenga Gestionar mensajes, y `multigreetwebhook` y `leavehook` necesitan Gestionar webhooks.
- Los números de los saludos son posiciones en la lista, así que quitar uno desplaza los números de todos los que van después. Ejecuta `multigreetlist` antes de editar.
- La opción `off` de `multigreettype`, `/multigreets type` y el botón **Desactivado** del panel establecen el mismo tipo de saludo, así que cualquiera de ellos apaga el sistema sin eliminar tus saludos.
- Los marcadores de invitación esperan hasta cinco segundos a que la entrada se atribuya antes de que salga el saludo, así que el invitador es correcto incluso cuando entran varias personas a la vez.
- El MD de bienvenida solo funciona si el miembro permite MD de miembros del servidor. Los MD fallidos se ignoran.
- Los Saludos de rol son una función aparte que se activa cuando se da un rol en lugar de al entrar.
