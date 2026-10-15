---
title: Saludos por rol
slug: rolegreets
summary: Envía un mensaje personalizado a un canal cada vez que un miembro reciba un rol concreto, con marcadores, embeds, webhooks y borrado automático.
icon: fa-user
category: Actions
dashboard: /dashboard/rolegreets
module: RoleGreets
tags: [role greet, role greets, welcome, role message, role announcement, verification welcome, webhook greet, saludo por rol, saludos por rol, bienvenida, mensaje de rol, anuncio de rol, bienvenida de verificación, saludo por webhook]
related: [multigreets, embedbuilder, administration]
---

## Qué hace

Un saludo por rol es un mensaje que el bot publica cuando un miembro recibe un rol. El personal elige un rol y un canal, escribe el mensaje, y a partir de ese momento, cada vez que se añada ese rol a alguien, el bot publica el mensaje allí. El mensaje por defecto es `Welcome %user.mention%!`.

El mensaje pasa por el analizador de embeds, así que puede ser texto simple, un embed completo o un embed con botones creado en el editor del panel. Los marcadores rellenan el nombre, el avatar, la fecha de entrada y los datos del servidor del miembro. Cada saludo puede publicarse mediante un webhook con su propio nombre y avatar, y puede eliminarse solo tras un número de segundos determinado.

Los saludos son por rol y por canal. Un rol puede tener hasta diez saludos, cada uno en un canal distinto o con un mensaje distinto, y un saludo puede desactivarse sin borrarlo.

## Por qué usarlo

- Dar la bienvenida al chat principal a los miembros solo cuando superan la verificación y reciben el rol de Verificado.
- Anunciar a los nuevos boosters en un canal de agradecimientos cuando aparece el rol de booster.
- Decirle a alguien que acaba de elegir un rol de juego dónde están sus canales.
- Publicar una lista de incorporación para el staff en el canal del personal cuando se da un rol de moderador.
- Dar la bienvenida a los miembros que reciben un rol de sorteo o de evento con las reglas de ese evento.

## Cómo se activa un saludo

El bot vigila las actualizaciones de miembros y compara los roles antes y después. Por cada rol que se haya añadido, busca los saludos de ese rol y publica cada uno. Los roles que se quitan nunca activan nada. Los bots se omiten a menos que **Saludar a bots** esté activado en ese saludo, y un saludo desactivado se ignora.

Si el canal ya no existe, el saludo se elimina solo. Si un saludo por webhook falla porque el webhook se borró o el bot perdió el permiso, el saludo se desactiva en lugar de eliminarse, así que puedes corregirlo y volver a activarlo.

Con un webhook configurado, el mensaje se envía con el nombre y el avatar del webhook. El borrado automático sigue funcionando: el bot obtiene el mensaje que acaba de enviar y lo elimina tras el retraso.

## Marcadores

Los saludos por rol admiten los grupos de marcadores de usuario, servidor y bot. Los marcadores de canal no están disponibles.

| Marcador | Valor |
| --- | --- |
| `%user.mention%`, `%user%` | Mención del miembro que recibió el rol |
| `%user.name%`, `%username%` | Su nombre de usuario |
| `%user.fullname%` | Nombre de usuario con etiqueta |
| `%user.avatar%` | URL del avatar |
| `%user.banner%` | URL del banner |
| `%user.id%` | ID de usuario |
| `%user.created_date%`, `%user.created_time%` | Fecha y hora de creación de la cuenta |
| `%user.joined_date%`, `%user.joined_time%` | Fecha y hora de entrada al servidor |
| `%server.name%`, `%server%` | Nombre del servidor |
| `%server.members%` | Número de miembros en caché |
| `%server.icon%`, `%server.banner%` | URL del icono y del banner del servidor |
| `%server.boostlevel%`, `%server.boostcount%` | Nivel y número de boosts |
| `%server.time%`, `%time.day%` | Hora del servidor y día de la semana |
| `%bot.name%`, `%bot.avatar%`, `%bot.id%` | Nombre, avatar e ID del bot |

Cuando el seguimiento de invitaciones está activado en el servidor, los marcadores de invitador e invitación de Saludos múltiples (`%inviter.username%`, `%inviter.mention%`, `%inviter.count%`, `%invite.code%`, `%invite.label%` y el resto) también se rellenan a partir del invitador del miembro. Si no se conoce ningún invitador, aparecen como `Unknown`.

> [!EXAMPLE]
> `Welcome to the team, %user.mention%! You are member number %server.members%. Check the pins in this channel first.`

## Ajustes

La página de Saludos por rol tiene un formulario **Añadir nuevo saludo por rol** en la parte superior y una tarjeta por cada saludo debajo.

| Ajuste | Por defecto | Qué controla |
| --- | --- | --- |
| Rol | ninguno | El rol que activa el saludo |
| Canal | ninguno | Dónde se publica el mensaje |
| Mensaje | `Welcome %user.mention%!` | Abre el editor de embeds |
| Tiempo de eliminación (segundos, 0 para nunca) | 0 | Retraso del borrado automático |
| URL del webhook (opcional) | ninguna | Publicar mediante un webhook en lugar del bot |
| Saludar a bots | desactivado | Saluda también a las cuentas de bots que reciban el rol |
| Activado | sí | Interruptor en la tarjeta; los saludos desactivados no hacen nada |

## Configuración paso a paso

1. Abre **Saludos por rol** en el panel.
2. En **Añadir nuevo saludo por rol**, elige el **Rol** y el **Canal**, y luego haz clic en **Añadir saludo por rol**.
3. En la nueva tarjeta, haz clic en el cuadro del mensaje para abrir el editor y escribe tu saludo con los marcadores de arriba.
4. Configura el **Tiempo de eliminación** si el canal debe mantenerse ordenado, y pega una **URL del webhook** si quieres un nombre y un avatar personalizados.
5. Guarda la tarjeta, luego dale el rol a una cuenta de prueba y revisa el canal.
6. Usa el interruptor de la tarjeta para pausar un saludo, o el botón de eliminar para quitarlo.

> [!TIP]
> En Discord, `rolegreetmessage 1` sin texto muestra el mensaje actual y ofrece un botón **Vista previa** que lo renderiza con tus propios datos.

## Comandos

Ejecuta estos comandos con el prefijo de tu servidor (`.` a menos que lo hayas cambiado). Los saludos se numeran según su posición en `rolegreetlist`.

| Comando | Alias | Requiere | Función |
| --- | --- | --- | --- |
| `rolegreetadd <@role> [#channel]` | `rgadd`, `rga` | Administrador | Añadir un saludo para un rol, en el canal actual si no se indica ninguno |
| `rolegreetlist` | `rglist`, `rgl` | Administrador | Recorrer todos los saludos con sus ajustes |
| `rolegreetmessage <id> [message]` | `rgmsg`, `rgm` | Administrador | Establecer el mensaje, o mostrarlo y previsualizarlo sin texto |
| `rolegreetremove <id or @role>` | `rgrem`, `rgrm`, `rgr` | Administrador | Eliminar un saludo por número, o todos los saludos de un rol tras confirmar |
| `rolegreetdelete <id> <time or seconds>` | `rgdel`, `rgd` | Administrador | Retraso de borrado automático, por ejemplo `30s` o `30`; `0` lo desactiva |
| `rolegreetdisable <id> <true/false>` | `rgdisable`, `rgdis` | Administrador | Desactivar o reactivar un saludo |
| `rolegreetgreetbots <id> <true/false>` | `rolegreetbots`, `rggb` | Administrador | Si los bots activan el saludo |
| `rolegreetwebhook <id> [name] [avatar url]` | `rgwebhook`, `rghook`, `rgh` | Administrador | Crear un webhook en el canal del saludo con ese nombre y avatar, o eliminarlo si no se indica nombre |

Los comandos de barra están bajo `/rolegreets` con las mismas acciones: `add`, `remove`, `removerole`, `message`, `delete`, `disable`, `greetbots`, `webhook` y `list`.

## Consejos y advertencias

- El bot necesita Enviar mensajes e Insertar enlaces en el canal del saludo, Gestionar mensajes allí para el borrado automático, y Gestionar webhooks para crear un webhook con `rolegreetwebhook`.
- El límite es de diez saludos por rol, no por servidor. El comando de añadir rechaza el undécimo.
- Los saludos se activan con cualquier adición de rol, incluidos los de roles por reacción, recompensas de nivel y otros bots, así que un rol que se añade y se quita con frecuencia llenará el canal de mensajes.
- Si el analizador de embeds no genera nada, por ejemplo con un mensaje que solo tiene espacios en blanco, no se envía nada.
- `rolegreetremove` con un rol elimina todos los saludos de ese rol tras una confirmación de sí/no; con un número elimina solo ese, de inmediato.
- Los números cambian cuando se elimina un saludo. Vuelve a ejecutar `rolegreetlist` antes de editar por número.
- Los saludos por rol son independientes de los saludos de entrada de la página de Saludos múltiples. Usa Saludos múltiples para las personas que entran al servidor y los saludos por rol para los roles que se obtienen después.
