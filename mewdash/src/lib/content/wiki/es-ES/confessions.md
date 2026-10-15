---
title: Confesiones
slug: confessions
summary: Los miembros envían confesiones anónimas que el bot publica como embeds numerados en un canal, con un registro opcional solo para el staff que revela quién envió cada una.
icon: fa-comment
category: Community
dashboard: /dashboard/confessions
module: Confessions
tags: [confessions, confess, anonymous, secrets, confession channel, confession log, blacklist, confesiones, confesar, anónimo, secretos, canal de confesiones, registro de confesiones, lista negra]
related: [administration, moderation]
---

## Qué hace

Un miembro ejecuta `/confess` en el servidor, o envía por MD al bot `.confess <server id> "text"`, y el bot publica su mensaje en el canal de confesiones como un embed con el encabezado "Anonymous confession #N". El nombre del remitente nunca aparece en ese canal. Recibe una confirmación privada, y el número de confesión sube en uno cada vez.

El staff puede definir un canal de registro aparte. Cada confesión se copia allí con la etiqueta y el ID del remitente, el número de confesión y un enlace directo al mensaje publicado. En el pie de cada confesión se indica a los miembros cómo confesar, y en la confirmación se les dice que pueden denunciar a un servidor que abuse de la función.

El staff también puede poner en la lista negra a miembros concretos para que sus confesiones se rechacen, y eliminar confesiones desde el panel, lo que también elimina el mensaje de Discord.

## Por qué usarlo

- Canales de desahogo donde los miembros quieren hablar sin que se vea su nombre.
- Canales de cumplidos o agradecimientos que se mantienen anónimos.
- Cualquier canal anónimo donde el staff aún necesita una forma de rastrear el acoso.

## La publicación de la confesión

Cada confesión es un embed en el canal de confesiones:

| Parte | Contenido |
| --- | --- |
| Línea del autor | `Anonymous confession #N` con el icono del servidor |
| Descripción | El texto de la confesión |
| Imagen | El adjunto, si se envió uno |
| Pie | `Do /confess or dm me .confess <server id> yourconfession to send a confession!` |
| Marca de tiempo | Cuándo se publicó |

La numeración empieza en 1 y continúa desde la última confesión guardada. Eliminar una confesión no renumera las demás.

Los adjuntos se admiten en ambos casos: adjunta un archivo a `/confess` con la opción `attachment`, o adjúntalo al MD cuando uses el comando de texto. Solo se usa el primer adjunto.

## El canal de registro

Cuando se define un **Canal de registro**, cada confesión también genera allí un embed rojo con **Usuario** (etiqueta e ID), **Confesión N** (el texto), un **Enlace al mensaje** y una advertencia sobre el mal uso. Es el único lugar donde se revela el remitente, así que limítalo a personas de confianza.

> [!WARNING]
> El canal de registro existe para que el staff pueda tratar el acoso. Compartir quién envió una confesión es motivo para que los dueños del bot pongan el servidor en la lista negra. Los miembros pueden denunciar abusos con `/confessions report`.

## Lista negra

`confessionblacklist` añade a un miembro a la lista negra del servidor y `confessionunblacklist` lo quita. Los miembros en la lista negra reciben el mensaje «Estás en la lista negra» en lugar de una publicación. La comprobación se hace por ID de usuario.

El panel muestra una **Lista negra de roles** y guarda los IDs de roles en la misma lista. El bot solo compara el ID de usuario del remitente con la lista cuando llega una confesión, así que los roles seleccionados en el panel no impiden actualmente que nadie confiese. Usa los comandos para bloquear a miembros concretos.

## Ajustes

La página **Confesiones** tiene tres pestañas: **Configuración**, **Confesiones** y **Estadísticas**.

| Ajuste | Predeterminado | Qué controla |
| --- | --- | --- |
| Canal de confesiones | ninguno | Dónde se publican las confesiones anónimas; las confesiones están desactivadas hasta que se define |
| Canal de registro (muestra los IDs de usuario) | ninguno | Dónde va la copia identificativa de cada confesión |
| Lista negra de roles | ninguno | Consulta la sección de lista negra de arriba |

**Confesiones** muestra todas las confesiones guardadas, de la más reciente a la más antigua, con su número y fecha. El contenido está oculto hasta que lo expandes, y **Eliminar confesión** la quita de la base de datos y borra el mensaje en Discord si todavía existe.

**Estadísticas** muestra **Confesiones totales**, **Este mes**, **Hoy** y **Último número**.

## Guía de configuración

1. Crea un canal donde el bot tenga los permisos Enviar mensajes e Insertar enlaces, y donde los miembros puedan leer pero idealmente no escribir.
2. Abre **Confesiones** en el panel y elige ese canal como **Canal de confesiones**.
3. Opcionalmente, elige un canal privado del staff como **Canal de registro**.
4. Haz clic en **Guardar configuración**.
5. Ejecuta `/confess` desde una cuenta de miembro y comprueba que el embed aparece con `#1`.
6. Si alguien abusa de la función, búscalo en el canal de registro y ejecuta `confessionblacklist @user`.

## Comandos

Usa estos comandos con el prefijo de tu servidor (`.` a menos que lo hayas cambiado). Las versiones de barra están bajo `/confessions`, excepto `/confess`, que es de nivel superior.

| Comando | Alias | Requiere | Función |
| --- | --- | --- | --- |
| `confess <server id> <"text">` | | Nadie | Solo por MD. Publica una confesión en el servidor indicado; pon el texto de varias palabras entre comillas |
| `confessionchannel [#channel]` | `confesschannel` | Gestionar canales | Define el canal de confesiones, o desactiva las confesiones si no se indica canal |
| `confessionlogchannel [#channel]` | `confesslogchannel`, `confessionlogchnl` | Administrador | Define el canal de registro |
| `confessionblacklist <@user>` | `confessblacklist`, `confessbl` | Gestionar canales | Impide que un miembro confiese |
| `confessionunblacklist <@user>` | `confessunblacklist`, `confessunbl` | Gestionar canales | Permite que un miembro en la lista negra vuelva a confesar |

`/confessions report <server id> <description>` envía a los dueños del bot un informe sobre un servidor que hace mal uso de las confesiones. No tiene equivalente de texto.

## Consejos y trampas

- El bot necesita los permisos Enviar mensajes e Insertar enlaces tanto en el canal de confesiones como en el canal de registro. Los comandos de canal avisan si le faltan, pero guardan el ajuste igualmente.
- El comando de texto `confess` solo funciona por MD y toma la confesión como un único argumento, así que `confess 123456789 "I like pineapple on pizza"` funciona, y la versión sin comillas solo publica la primera palabra. `/confess` en el servidor es más sencillo para los miembros.
- `confess` por MD solo funciona en servidores que compartes con el bot; los demás IDs de servidor se rechazan.
- El comando de texto `confessionlogchannel` sin canal borra el canal de confesiones en lugar del canal de registro. Para borrar el canal de registro, hazlo desde el panel.
- Las confesiones se guardan con el ID de usuario del remitente incluso sin canal de registro, y el panel puede buscar el remitente de una sola confesión. Trata el acceso al panel como solo para el staff.
- Eliminar desde el panel borra el registro guardado, así que la copia del canal de registro es tu único rastro restante.
