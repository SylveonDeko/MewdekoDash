---
title: Administración
slug: administration
summary: Protección automática contra raids, spam, cuentas alt, estafas y canales trampa, roles que se entregan al entrar o que los miembros eligen por su cuenta, excepciones de permisos de Discord para comandos y las operaciones masivas que necesitas en un mal día.
icon: fa-cog
category: Security
dashboard: /dashboard/administration
module: Administration
tags: [admin, anti-raid, anti-spam, anti-alt, anti-pattern, anti-mass-mention, anti-mass-post, honeypot, anti-image-hash, scam images, external apps, user apps, reaction roles, self-assignable roles, auto-assign roles, auto-ban roles, voice channel roles, permission overrides, dpo, mass ban, prune, server recovery, staff role, timezone, cooldowns, administración, protección, canal trampa, imágenes de estafa, apps externas, roles por reacción, roles autoasignables, roles de baneo automático, excepciones de permisos, baneo masivo, purga, recuperación del servidor, rol de staff, zona horaria, enfriamientos]
related: [moderation, permissions, logging, multigreets, settings, auditlog, rolestates]
---

## Qué hace

Administración es el módulo que mantiene un servidor en orden cuando ningún moderador está mirando. Sus sistemas de protección vigilan las entradas y los mensajes, y castigan automáticamente cuando algo parece un raid, una ráfaga de spam, una cuenta alt desechable, una mención masiva, un enlace de estafa pegado en todos los canales, una publicación en un canal trampa o una imagen de estafa conocida. Cada sistema es independiente, tiene su propio castigo y se puede activar o desactivar por separado.

El mismo módulo se encarga de la automatización de roles: roles entregados al entrar, roles que los miembros obtienen por sí mismos con `iam`, roles por reacción, roles ligados a estar en un canal de voz y roles trampa que banean a quien los reciba. También te permite cambiar qué permiso de Discord necesita un comando, definir los roles de staff y de miembro de los que dependen otras funciones, limitar la frecuencia de los comandos y limpiar los mensajes de comandos.

Para los días malos hay operaciones masivas: banear o expulsar a todos los que entraron en los últimos minutos, banear por patrón de nombre, por rol o por avatar, purgar miembros inactivos y un flujo de recuperación del servidor que devuelve un rol de administrador a un propietario verificado.

Todo está en la página **Administración** del panel, repartido en cinco pestañas: **Resumen**, **Sistemas de protección**, **Roles y permisos**, **Automatización y ajustes** y **Operaciones avanzadas**. Casi todos los ajustes tienen también un comando.

## Por qué usarlo

- Los raids de entradas y las oleadas de bots llegan a las 3 de la mañana y quieres que se resuelvan antes de que alguien despierte.
- Una cuenta comprometida está pegando el mismo enlace de phishing en diez canales.
- Los miembros deberían poder elegir sus propios roles de color, región o notificaciones sin ayuda del staff.
- Quieres que `ban` funcione para quien tenga Gestionar mensajes en lugar de Banear miembros, sin tocar los ajustes de roles de Discord.
- Un comando se usa en exceso en general y necesita un enfriamiento.
- Un administrador rebelde le quitó los roles al propietario y necesitas una forma de volver a entrar.

## Castigos

Todos los sistemas de protección tienen una **acción de castigo**. Algunas acciones también requieren una **duración** o un **rol**.

| Acción | Qué ocurre |
| --- | --- |
| Mute | Aplica el rol de silenciado del servidor (texto y voz) |
| ChatMute | Rol de silenciado solo para texto |
| VoiceMute | El servidor silencia al miembro en voz |
| Kick | Expulsa al miembro; puede volver a entrar |
| Softban | Banea y desbanea de inmediato para borrar los mensajes recientes |
| Ban | Banea, o banea temporalmente si indicas una duración |
| Timeout | Aislamiento temporal nativo de Discord; requiere una duración de 28 días como máximo |
| AddRole | Añade el rol que elijas, por ejemplo un rol de cuarentena |
| RemoveRoles | Quita todos los roles |
| Warn | Añade una advertencia mediante el módulo de Moderación |
| Delete | Elimina el mensaje infractor y nada más |
| None | Registra la detección y no toma ninguna acción |

Solo Ban, Mute, ChatMute, VoiceMute, AddRole y Timeout aceptan una duración; en el resto se ignora. Las duraciones se expresan en minutos. El panel permite hasta 10080 (una semana) para Anti-Raid, Anti-Spam, Anti-Mass-Mention y Anti-Pattern, 1440 (un día) para Anti-Mass-Post, Anti-Post-Channel y Anti-Image-Hash, y un año para Anti-Alt. Los castigos se aplican de uno en uno por segundo desde una cola, y el motivo en el registro de auditoría de Discord aparece como "Raiding Protection" o "ImageHash Protection".

> [!WARNING]
> Anti-Raid, Anti-Alt y Anti-Pattern se ejecutan cuando un miembro entra, y omiten la comprobación por completo cuando la acción es Warn. Elige Kick, Ban, Timeout o un rol para esos tres.

Los miembros con el permiso de Administrador están exentos de todas las protecciones basadas en mensajes. Los bots son ignorados por las protecciones basadas en entradas y por Anti-Spam; las demás tienen un interruptor **Ignorar bots**.

## Sistemas de protección

La pestaña **Sistemas de protección** muestra una tarjeta por sistema con un botón **Activado** o **Desactivado** y, una vez activado, un botón **Configurar** que abre sus ajustes. Al activarlo desde el panel se aplica una configuración inicial; abre **Configurar** y revisa la acción antes de confiar en ella. La pestaña **Resumen** muestra cuántos de los siete sistemas están activos y los lista uno por uno.

### Anti-Raid

Cuenta los miembros que entran dentro de una ventana móvil. Cuando el recuento alcanza el **umbral de usuarios** dentro de la **ventana** (segundos), todos los contados en esa ráfaga son castigados juntos. El comando acepta un umbral de 2 a 30 y una ventana de 2 a 300 segundos; el panel acepta de 1 a 50 y de 1 a 300. AddRole no se admite aquí. Los bots que entran no se cuentan.

> [!EXAMPLE]
> `antiraid 10 10 Ban` banea a todos cuando entran diez cuentas en diez segundos. `antiraid 10 10 Timeout 1h` los aísla durante una hora en su lugar.

### Anti-Spam

Cuenta los mensajes idénticos consecutivos de un mismo miembro, comparados sin distinguir mayúsculas. Cuando el recuento alcanza el **umbral de mensajes** (de 2 a 10 con el comando, de 1 a 20 en el panel), el miembro es castigado y el recuento se reinicia. Un mensaje distinto reinicia el recuento; cada mensaje contado deja de contar tras treinta minutos. Los canales de la lista de **canales ignorados** se omiten, lo que va bien para canales de comandos de bots. Usa `antispam <count> <action> <role>` con AddRole para entregar un rol en su lugar.

### Anti-Alt

Comprueba la antigüedad de cada cuenta que entra. Las cuentas más recientes que la **antigüedad mínima** (en minutos; `antialt 3d Kick` también funciona) son castigadas al instante. Solo se ejecuta al entrar, así que activarlo no analiza a los miembros existentes. El valor inicial del panel es 1440 minutos, un día.

### Anti-Mass-Mention

Cuenta las menciones de usuarios y de roles. Un solo mensaje con al menos el **umbral de menciones** es castigado de inmediato. Por debajo de eso, las menciones se suman por miembro durante la **ventana de tiempo** (segundos), y superar el **máx. de menciones en la ventana** activa el castigo. **Ignorar bots** decide si cuentan los mensajes de bots.

### Anti-Pattern

Puntúa a cada miembro nuevo según indicios de ser una cuenta desechable o un bot, y castiga cuando la puntuación alcanza la **puntuación mínima**. Se ejecuta al entrar y examina la cuenta, no los mensajes.

| Señal | Puntos | Ajuste |
| --- | --- | --- |
| Cuenta creada dentro de la antigüedad máxima | 5 | **Comprobar antigüedad de la cuenta**, **Antigüedad máx. de la cuenta (meses)** |
| Entró poco después de crear la cuenta | 10 si fue hace menos de una hora, 7 si fue hace menos de seis horas, de lo contrario 3 | **Comprobar momento de entrada**, **Horas máx. de entrada** |
| Otros miembros se crearon en la misma hora | 1 por cuenta, hasta 10 | **Comprobar creación en lote** |
| La cuenta aparece desconectada al entrar | 2 | **Comprobar estado desconectado** |
| Cuenta más reciente que el límite de cuenta nueva | 3 | **Comprobar cuentas nuevas**, **Días de cuenta nueva** |
| El nombre de usuario coincide con uno de tus patrones regex | 15 | Patrón con **comprobar nombre de usuario** |
| El nombre visible coincide con uno de tus patrones | 12 | Patrón con **comprobar nombre visible** |

Una coincidencia de patrón castiga en cuanto la puntuación acumulada es igual o superior al mínimo; las demás señales por sí solas también pueden alcanzarlo. Los patrones son expresiones regulares, comparadas sin distinguir mayúsculas con el nombre en minúsculas. Los valores iniciales del panel son puntuación mínima 15, seis meses, 48 horas, siete días y todas las comprobaciones activadas. En el panel, el botón **Patrones** de la tarjeta abre la lista de patrones, donde cada patrón tiene un nombre, la regex y las dos casillas de nombre.

Con comandos, `patternadd <regex> [name] [checkUsername] [checkDisplayName]` añade uno y `patternconfig <setting> <value>` ajusta `accountage`, `maxaccountage`, `jointiming`, `maxjoinhours`, `batchcreation`, `offlinestatus`, `newaccounts`, `newaccountdays` o `minimumscore`. `patternconfig` a secas muestra los valores actuales y cuántas veces se ha activado el sistema.

### Anti-Mass-Post

Detecta a un miembro que publica el mismo contenido, o uno parecido, en varios canales en rápida sucesión: el clásico "pegar el enlace de estafa en todas partes" que Anti-Spam no detecta porque los mensajes están repartidos.

Para cada miembro, el bot guarda los últimos cincuenta mensajes dentro de la **ventana de tiempo** (de 10 a 600 segundos). Un mensaje se compara con los anteriores y cuenta como similar cuando se parece en al menos un 80 % según la distancia de edición, sin distinguir mayúsculas. Cuando existen mensajes similares en al menos el **umbral de canales** (de 2 a 20) de canales distintos, el miembro es castigado. Los mensajes de menos de veinte caracteres se ignoran.

**Comprobar solo enlaces** está activado por defecto: solo se rastrean los mensajes que contienen un enlace. Se respetan los usuarios, roles y canales ignorados. Por defecto se elimina el mensaje que lo activó y se envía un MD al miembro explicando el motivo.

### Anti-Post-Channel

Configura **canales trampa**. Marca uno o varios canales en los que los miembros reales no tienen motivo para escribir, normalmente ocultos al final de la lista de canales con un nombre de advertencia. Cualquiera que publique allí es tratado como un bot o una cuenta comprometida: el mensaje se elimina, el autor recibe un MD y se aplica el castigo. Los administradores están exentos, y puedes añadir **roles ignorados** y **usuarios ignorados** (por ID).

El bot también mantiene actualizado un **embed de estado** en un canal de estado: el canal donde ejecutaste `antipostchannel` o, cuando se activa desde el panel, el primer canal trampa que atrape a alguien. El embed muestra la acción, el número de canales trampa, el total de capturas y los últimos diez miembros atrapados.

### Anti-Image-Hash

Bloquea imágenes concretas según su aspecto, de modo que una nueva subida redimensionada, recomprimida, iluminada, reflejada o con un borde añadido siga coincidiendo. Cada imagen bloqueada se guarda como un hash perceptual junto con su imagen reflejada y, si tiene un borde sólido, una copia sin el borde. Los archivos adjuntos publicados (y los embeds, si **comprobar imágenes incrustadas** está activado) se procesan con hash de la misma manera y se comparan.

- **Tolerancia de coincidencia** (de 0 a 64, por defecto 31) es cuánto puede diferir una imagen publicada y seguir contando. Bájala si se atrapa una imagen inocente; súbela solo si se cuelan estafas.
- **Detectar copias con borde** quita un borde sólido de una imagen publicada antes de compararla. Las copias reflejadas siempre se detectan.
- Las imágenes demasiado lisas para identificarse con fiabilidad nunca se comparan ni se aceptan como bloqueo, porque coincidirían con imágenes que no tienen relación.
- Las imágenes de más de 8 MB no se descargan ni se procesan con hash. El límite se puede fijar entre 1 y 32 MB mediante la API, pero ni la tarjeta del panel ni ningún comando lo exponen.
- Cada imagen bloqueada puede llevar su propia acción, duración y rol, que sustituyen los valores predeterminados del sistema. **Solo eliminar** quita la imagen sin castigar a quien la publicó.
- Los roles y canales ignorados se omiten; el autor recibe un MD por defecto.

**Bloquear imágenes de estafa conocidas** activa una lista predefinida incluida con el bot, actualmente las imágenes falsas de casinos cripto y de sorteos de MrBeast que circulan por Discord. La tarjeta muestra cuántas imágenes hay en la lista y cuántas publicaciones ha detectado en tu servidor.

Para bloquear tu propia imagen en el panel, suelta o sube el archivo, o pega su URL, ponle una etiqueta, elige opcionalmente una acción para esa imagen y guarda. Con comandos, ejecuta `blockimage [action] [name]` adjuntando la imagen, respondiendo a un mensaje que la contenga o pegando el enlace. `blockedimages` lista todo con el número de detecciones, `unblockimage <id>` quita una e `imagehash` muestra el hash de una imagen sin bloquearla.

> [!TIP]
> Activa primero Anti-Post-Channel y la lista de imágenes de estafa conocidas. Ninguno produce falsos positivos en el chat normal, y juntos atrapan la mayor parte de la actividad de estafa automatizada.

### Anti-External App

Los miembros pueden añadir apps a su propia cuenta de Discord y usarlas en cualquier servidor, incluso en uno al que la app nunca se añadió. Los mensajes de esas apps se publican con el nombre de la app, así que las demás protecciones, que miran quién envió un mensaje, nunca ven al miembro que está detrás. Anti-External App lee qué miembro ejecutó la app y actúa contra él.

Un mensaje cuenta como infracción cuando:

- menciona al menos el **límite de menciones** de usuarios y roles (por defecto 5), o menciona a everyone o here,
- contiene un enlace de invitación de Discord mientras **eliminar enlaces de invitación** está activado,
- o proviene de un miembro que ha ejecutado apps más veces que los **mensajes de apps permitidos** dentro de la ventana (por defecto 5 en 10 segundos).

Poner un límite en 0 desactiva esa comprobación. Cuando un mensaje infringe una regla, se elimina y el miembro que ejecutó la app recibe el castigo, un aislamiento de una hora por defecto. **Solo eliminar** quita el mensaje sin castigar a nadie. Las apps que se añadieron al propio servidor se dejan en paz, igual que los administradores del servidor.

> [!TIP]
> El permiso **Usar apps externas** de Discord es un buen complemento. Los miembros que no lo tienen aún pueden usar sus apps, pero solo ellos ven las respuestas. Niégalo para `@everyone` y permítelo para un rol de confianza o con nivel, y las cuentas nuevas o desechables no podrán publicar mediante apps.

## Roles

Estas tarjetas están en la pestaña **Roles y permisos**.

### Roles de asignación automática

Roles entregados a cada miembro en el momento en que entra, con una lista aparte para bots. Los miembros que aún completan la selección de membresía reciben sus roles cuando son aprobados. Si Role States está configurado para omitir la asignación automática en miembros con un estado de rol guardado, los miembros que regresan conservan sus roles anteriores. `autoassignrole <role>` activa o quita un rol de la lista; ejecútalo solo para ver la lista.

### Roles autoasignables

Roles que los miembros pueden darse con `iam <role>` y quitarse con `iamnot <role>`. Los roles se ordenan en **grupos** numerados (el grupo 0 es "Sin grupo"), y los grupos pueden tener nombre. El **modo exclusivo** es un interruptor de todo el servidor: cuando está activado, tomar un rol de un grupo quita cualquier otro rol que tengas de ese grupo, lo cual es ideal para colores o regiones. Un rol puede requerir un **nivel** de XP mínimo. **Elimina los mensajes de iam** borra tanto el comando como la respuesta tras tres segundos para mantener limpio el canal.

### Roles por reacción

Asocia emojis a roles en un mensaje existente. Los miembros hacen clic en el emoji para obtener el rol y lo quitan para perderlo. Cada mensaje puede marcarse como **Exclusivo** para que un miembro solo pueda tener un rol de él. Discord permite veinte reacciones por mensaje, y el panel las cuenta por ti. Si añades a un mensaje que ya tiene roles por reacción, se amplía la configuración existente.

Con comandos, `reactionroles [messageId] [excl] <role> <emoji> ...` configura los pares; omite el ID del mensaje para usar el mensaje que está justo encima de tu comando. `reactionroleslist` muestra cada configuración con un índice y `reactionrolesremove <index>` elimina una.

### Roles de canal de voz

Vincula un rol a un canal de voz. Los miembros reciben el rol al entrar en el canal y lo pierden al salir. Úsalo para abrir un canal de texto solo a las personas que están actualmente en una llamada.

### Roles de baneo automático

Cualquier rol de esta lista es un cable trampa: en el momento en que un miembro lo obtiene, es baneado. El motivo es por defecto "Auto-ban role assigned" a menos que establezcas uno con `autobanrolereason`. Combínalo con un rol por reacción en un mensaje oculto para atrapar a los bots que se autoasignan roles. El número de días de mensajes eliminados sigue el ajuste de purga de baneos del módulo de Moderación.

## Excepciones de permisos y permisos de comandos

Las **excepciones de permisos** reemplazan el permiso de Discord que un comando comprueba normalmente. Añade una excepción para `ban` que requiera Gestionar mensajes y cualquiera con Gestionar mensajes podrá ejecutarlo; añade una que requiera Administrador y solo los administradores podrán. Cuando se indican varios permisos, el usuario necesita todos. Con comandos, `dpo <command> <permission> [permission...]` define una, `dpo <command>` sin permisos la quita, `dpol` las lista y `dpor` borra todo tras una confirmación. También se aceptan nombres de chat triggers personalizados.

La tarjeta **Permisos de comandos** de la misma pestaña es el sistema de permisos de comandos basado en reglas: permitir o denegar un comando, un módulo o todo para un usuario, rol, canal, categoría o todo el servidor, evaluado de arriba abajo. Tiene su propio artículo, consulta `permissions`.

## Ajustes del servidor

Estas tarjetas están en la pestaña **Automatización y ajustes**.

| Ajuste | Por defecto | Qué controla |
| --- | --- | --- |
| **Rol de staff** | ninguno | El rol que otras funciones tratan como staff |
| **Rol de miembro** | ninguno | El rol tratado como "miembro"; `prunemembers` puede incluir a quienes lo tengan |
| **Zona horaria del servidor** | UTC | Zona horaria usada siempre que el bot muestra horas locales |
| **Enfriamiento de comandos** | ninguno | Límite de frecuencia por comando en segundos, de 1 a 90 000 |
| **Excepciones de permisos** | ninguno | Permiso de Discord que requiere cada comando (ver arriba) |
| **Canal de voz de juegos** | ninguno | Cuando un miembro de este canal de voz empieza a jugar, el bot lo mueve al canal de voz cuyo nombre coincide con el juego |
| **Borrar mensaje al usar comando** | desactivado | Elimina el mensaje que invocó el comando tras ejecutarlo, con excepciones por canal de Activar, Desactivar o Heredar |
| **Exclusión de estadísticas** | incluido | Detiene las estadísticas de uso de comandos en este servidor; **Eliminar estadísticas** borra lo almacenado |

## Operaciones avanzadas

La pestaña **Operaciones avanzadas** contiene tres tarjetas. Cada operación masiva pide confirmación y luego se ejecuta sin más comprobaciones.

### Mensaje de baneo personalizado

El mensaje que un miembro recibe por MD cuando es baneado, creado en el editor de embeds. Es la misma plantilla que usa el comando de baneo del módulo de Moderación.

### Recuperación del servidor

Una forma de devolver un rol de Administrador al propietario después de que un administrador comprometido lo haya quitado. Se guardan dos secretos para el servidor: una **clave de recuperación** y una **clave de dos factores**.

- Si ejecutas `/serverrecovery server-recover` como propietario del servidor cuando no hay nada configurado, se generan ambas: una clave de recuperación que se te envía por MD y un secreto de autenticador que se muestra como código QR. Confirma con un código de tu app de autenticación para terminar.
- Una vez configurado, a cualquiera que ejecute `/serverrecovery server-recover`, introduzca la clave de recuperación y después un código de autenticador válido se le da un rol nuevo llamado "Recovered Server Owner Role" con Administrador, situado justo debajo del rol más alto del bot.
- `/serverrecovery clear-server-recover` elimina las claves guardadas tras una confirmación, igual que **Eliminar configuración de recuperación** en el panel.

La tarjeta del panel también puede guardar claves directamente: genera o escribe una clave de recuperación de al menos dieciséis caracteres y una clave de dos factores. El bot verifica los códigos con esa clave de dos factores como secreto de autenticador (TOTP), así que introduce un secreto base32 que hayas añadido a una app de autenticación, no una contraseña normal.

> [!PERMISSION]
> El propio bot debe tener Administrador para que la recuperación funcione, y su rol más alto debe estar lo bastante arriba como para que un rol justo por debajo siga estando por encima de las personas de las que estás recuperando el servidor.

### Operaciones masivas

| Operación | Qué hace |
| --- | --- |
| **Purgar usuarios inactivos** | La purga de miembros de Discord para miembros inactivos durante el número de días indicado (de 1 a 30) |
| **Baneo masivo de usuarios** | Banea una lista pegada de IDs de usuario con un solo motivo; la eliminación de mensajes sigue el ajuste de purga de baneos de Moderación |
| **Renombrado masivo de usuarios** | Establece el apodo de cada miembro según un patrón donde `{username}` se sustituye por su nombre de usuario, por ejemplo `[AFK] {username}`; los miembros a los que el bot no puede renombrar se omiten |
| **Purgar hasta un mensaje** | Elimina todos los mensajes posteriores a un ID de mensaje dado en un canal, uno por uno |

Los comandos añaden formas de elegir a quién banear: `banunder 10m` banea a todos los que entraron en los últimos diez minutos (`-p` muestra primero una vista previa de la lista, `-accage 1d` exige además que la cuenta tenga menos de un día), `kickunder` hace lo mismo con una expulsión, `nameban <regex>` banea los nombres de usuario que coinciden con un patrón tras una vista previa, `baninrole <role>` banea a todos los que tengan un rol y `banbyhash <avatarHash>` banea a todos los miembros que usen un avatar determinado. Todos piden confirmación.

## Guía de configuración

1. Abre **Administración** en el panel y ve a **Sistemas de protección**.
2. Activa **Anti-raid**, pulsa **Configurar** y define un umbral y una ventana que se ajusten a tu ritmo normal de entradas. Elige Kick o Ban como acción.
3. Crea un canal oculto en el que solo publicarían bots, activa **Anti-publicación en canal** y añádelo en **Canales trampa**.
4. Activa **Anti-hash de imagen** y pulsa **Bloquear imágenes de estafa conocidas**.
5. Activa **Anti-publicación masiva** con los tres canales en sesenta segundos por defecto y solo enlaces.
6. En **Roles y permisos**, añade tu rol de miembro a **Roles de asignación automática** para los usuarios normales y configura un grupo de colores con **Añadir rol autoasignable**; después activa el **Modo exclusivo**.
7. En **Automatización y ajustes**, define el **Rol de staff**, el **Rol de miembro** y la **Zona horaria del servidor**.
8. En **Operaciones avanzadas**, configura la **Recuperación del servidor** mientras todo está tranquilo.
9. Revisa **Resumen**: lista todos los sistemas de protección y si están activos.

## Comandos

Ejecútalos con el prefijo de tu servidor (`.` salvo que lo hayas cambiado). Los comandos de protección ejecutados sin argumentos desactivan ese sistema.

### Protección

| Comando | Alias | Requiere | Para qué sirve |
| --- | --- | --- | --- |
| `antiraid [threshold] [seconds] [action] [duration]` | | Administrador | Configurar o desactivar Anti-Raid |
| `antispam [count] [action] [duration or role]` | | Administrador | Configurar o desactivar Anti-Spam |
| `antialt [minAge] [action] [duration or role]` | | Administrador | Configurar o desactivar Anti-Alt |
| `antimassmention [threshold] [window] [max] [ignoreBots] [action] [duration or role]` | `amm`, `massmention`, `stopmassmention` | Administrador | Configurar o desactivar Anti-Mass-Mention |
| `antipattern [action] [duration or role]` | `apattern` | Administrador | Configurar o desactivar Anti-Pattern |
| `patternadd <regex> [name] [checkUsername] [checkDisplayName]` | `padd` | Administrador | Añadir un patrón de nombre |
| `patternremove <id>` | `premove`, `prem` | Administrador | Quitar un patrón por ID |
| `patternlist` | `plist` | Administrador | Listar patrones |
| `patternconfig [setting] [value]` | `pconfig` | Administrador | Mostrar o cambiar los ajustes de puntuación de Anti-Pattern |
| `antimasspost [channels] [seconds] [action] [duration]` | | Administrador | Configurar o desactivar Anti-Mass-Post |
| `antipostchannel [action] [duration]` | | Administrador | Configurar o desactivar los canales trampa; el canal actual pasa a ser el canal de estado |
| `antipostchanneladd <#channel>` | | Administrador | Añadir un canal trampa |
| `antipostchannelremove <#channel>` | | Administrador | Quitar un canal trampa |
| `antiimagehash [action] [tolerance] [duration]` | `aih` | Administrador | Configurar o desactivar Anti-Image-Hash |
| `antiexternalapp [action] [mentions] [messages] [duration]` | `aea`, `antiuserapp` | Administrador | Configurar o desactivar Anti-External App |
| `blockimage [action] [name]` | `banimage` | Administrador | Bloquear la imagen adjunta, respondida o enlazada |
| `unblockimage <id>` | `unbanimage` | Administrador | Quitar una imagen bloqueada |
| `blockedimages` | `blockedimagelist` | Administrador | Listar las imágenes bloqueadas con el número de detecciones |
| `imagehash [url]` | | Administrador | Mostrar el hash de una imagen |
| `antiimagehashpreset` | `aihpreset`, `blockcommonscams` | Administrador | Activar o desactivar la lista de imágenes de estafa conocidas |
| `antiimagehashignore <role or #channel>` | `aihignore` | Administrador | Activar o quitar la exención de un rol o canal |

### Roles

| Comando | Alias | Requiere | Para qué sirve |
| --- | --- | --- | --- |
| `autoassignrole [role]` | `aar` | Gestionar roles | Activar o quitar un rol al entrar, o listarlos |
| `autoassignbotrole [role]` | `aabr` | Gestionar roles | Lo mismo para bots |
| `asar [group] <role>` | | Gestionar roles | Hacer un rol autoasignable, opcionalmente en un grupo |
| `rsar <role>` | | Gestionar roles | Quitar un rol autoasignable |
| `lsar` | | Nadie | Listar los roles autoasignables por grupo |
| `sargn <group> [name]` | | Gestionar roles | Poner nombre a un grupo, o borrar su nombre |
| `togglexclsar` | `tesar` | Gestionar roles | Activar o desactivar el modo exclusivo |
| `rolelevelreq <level> <role>` | `rlr` | Gestionar roles | Exigir un nivel de XP para un rol |
| `adsarm` | | Gestionar mensajes | Activar o desactivar el borrado de los mensajes de `iam` |
| `iam <role>` | | Nadie | Darte a ti mismo un rol autoasignable |
| `iamnot <role>` | `iamn` | Nadie | Quitarte uno |
| `reactionroles [messageId] [excl] <role> <emoji>...` | `rero` | Gestionar roles | Configurar roles por reacción en un mensaje |
| `reactionroleslist` | `reroli` | Gestionar roles | Listar las configuraciones de roles por reacción |
| `reactionrolesremove <index>` | `rerorm` | Gestionar roles | Quitar una configuración por índice |
| `vcrole [voiceChannel] [role]` | | Gestionar roles | Vincular un rol a un canal de voz (el actual si se omite); sin rol, quita el vínculo |
| `vcrolerm <channelId>` | | Gestionar roles | Quitar un vínculo por ID de canal |
| `vcrolelist` | | Nadie | Listar los roles de canal de voz |
| `autobanroleadd <role>` | `abra` | Administrador | Añadir un rol trampa |
| `autobanroleremove <role>` | `abrr` | Administrador | Quitar uno |
| `autobanrolelist` | `abrl` | Administrador | Listar los roles trampa y sus motivos |
| `autobanrolereason <role> [reason]` | `abreason` | Administrador | Mostrar, definir o borrar el motivo del baneo |
| `setrole <role> <user> [time]` | `sr`, `giverole` | Gestionar roles | Dar un rol, opcionalmente por un tiempo limitado |
| `removerole <role> <user>` | `rr` | Gestionar roles | Quitar un rol |
| `removeallroles <user>` | `rar` | Gestionar roles | Quitar todos los roles |
| `createrole [name]` | `cr` | Gestionar roles | Crear un rol |
| `deleterole <role>` | `dr` | Gestionar roles | Eliminar un rol |
| `renamerole <role> <name>` | `renr` | Gestionar roles | Renombrar un rol |
| `rolehoist <role>` | `rh` | Gestionar roles | Activar o desactivar mostrar el rol por separado |
| `rolecolor <role> [color]` | `roleclr` | Nadie para ver, Gestionar roles para definir | Mostrar o definir el color de un rol |

Los comandos `autobanrole` también están disponibles como comandos de barra `/autobanrole list`, `add`, `remove` y `reason`.

### Permisos y ajustes

| Comando | Alias | Requiere | Para qué sirve |
| --- | --- | --- | --- |
| `dpo <command> [permission...]` | | Administrador | Definir o quitar una excepción de permiso |
| `dpol` | `dpoli` | Administrador | Listar excepciones |
| `dpor` | | Administrador | Borrar todas las excepciones |
| `staffrole [role]` | | Administrador | Mostrar o definir el rol de staff |
| `staffroledisable` | | Administrador | Borrar el rol de staff |
| `memberrole <role>` | | Administrador | Mostrar o definir el rol de miembro |
| `delmsgoncmd [list, server, or channel <enable, disable, inherit> [#channel]]` | `dmc` | Administrador | Mostrar, activar o crear excepciones del borrado de mensajes de comandos |
| `gamevoicechannel` | `gvc` | Administrador | Activar o desactivar tu canal de voz actual como canal de voz de juegos |
| `timezone [id]` | | Nadie para ver, Administrador para definir | Mostrar o definir la zona horaria del servidor |
| `timezones` | | Nadie | Listar los ID de zona horaria disponibles |
| `prefix [new]` | | Nadie para ver, Administrador para definir | Mostrar o cambiar el prefijo de comandos |
| `languageset <name>` | `langset` | Administrador | Definir el idioma del servidor, o `default` |
| `langsetdefault [name]` | `langsetd` | Nadie para ver, propietario del bot para definir | Mostrar o definir el idioma predeterminado de todo el bot |
| `languageslist` | `langli` | Nadie | Listar los idiomas admitidos |
| `guildstatsoptout` | `gstatsoptout` | Administrador | Activar o desactivar las estadísticas de comandos de este servidor |
| `deleteguildstatsdata` | `delguildstatsdata` | Administrador | Eliminar las estadísticas almacenadas, una vez por hora |

### Operaciones masivas y utilidades

| Comando | Alias | Requiere | Para qué sirve |
| --- | --- | --- | --- |
| `banunder <time> [-p or -accage <time>]` | | Administrador | Banear a todos los que entraron dentro del tiempo indicado |
| `kickunder <time> [-p]` | | Administrador | Expulsar a todos los que entraron dentro del tiempo indicado |
| `nameban <regex>` | `nban` | Administrador | Banear a los miembros cuyo nombre de usuario coincida, con vista previa |
| `baninrole <role> [reason]` | | Administrador | Banear a todos los que tengan un rol |
| `banbyhash <avatarHash>` | `bbh` | Administrador | Banear a todos los que tengan un hash de avatar determinado |
| `prunemembers <time> [yes]` | `memberprune` | Administrador | Purgar miembros inactivos durante ese número de días; `yes` incluye el rol de miembro |
| `setnick [user] <nickname>` | | Gestionar apodos | Cambiar el apodo de un miembro, o el del propio bot |
| `deafen <users...>` | `deaf` | Ensordecer miembros | Ensordecer en el servidor |
| `undeafen <users...>` | `undef` | Ensordecer miembros | Deshacerlo |
| `creatxtchanl <name>` | `ctch` | Gestionar canales | Crear un canal de texto |
| `deltxtchanl <#channel>` | `dtch` | Gestionar canales | Eliminar un canal de texto |
| `creatvoichanl <name>` | `cvch` | Gestionar canales | Crear un canal de voz |
| `delvoichanl <channel>` | `dvch` | Gestionar canales | Eliminar un canal de voz |
| `settopic [topic]` | `st` | Gestionar canales | Definir el tema del canal actual |
| `setchanlname <name>` | `schn` | Gestionar canales | Renombrar el canal actual |
| `renamechannel <channel> <name>` | `channelrename` | Gestionar canales | Renombrar cualquier canal |
| `nsfwtoggle` | `nsfw`, `nsfwtgl` | Gestionar canales | Activar o desactivar la marca NSFW del canal actual |
| `edit [#channel] <messageId> <text>` | | Gestionar mensajes en ese canal | Editar uno de los mensajes del bot |
| `delete [#channel] <messageId> [time]` | `del` | Gestionar mensajes en ese canal | Eliminar un mensaje ahora o tras un retraso de hasta siete días |
| `setguildavatar [url]` | `sgav`, `setgav` | Gestionar servidor | Definir el icono del servidor desde una URL o un archivo adjunto |
| `setguildbanner [url]` | `sgbanner`, `setgbanner` | Gestionar servidor | Definir el banner del servidor |
| `setguildbio <text>` | `sgbio`, `setgbio` | Gestionar servidor | Definir la descripción del servidor |

La recuperación del servidor es solo con comandos de barra: `/serverrecovery server-recover` y `/serverrecovery clear-server-recover`. La mayoría de los demás comandos anteriores también tienen equivalentes de barra bajo `/protection`, `/administration`, `/channel`, `/purge-members`, `/delmsgoncmd`, `/voice`, `/perm-override` y `/roles`.

### Comandos de registros y de bienvenida

El módulo también contiene los comandos de registros (`log`, `logcategory`, `logevents`, `logignore`, `logignorelist`, `commandlogchannel`, todos de Administrador, además del grupo de barra `/log`) y los comandos clásicos de bienvenida (`greetdm`, `greetdmmsg`, `greetdmtest`, `bye`, `byemsg`, `byedel`, `byetest`, `leavehook`, `boost`, `boostmsg`, `boostdel`, `boosttest`, todos de Gestionar servidor). Están documentados en los artículos `logging` y `multigreets`.

## Consejos y advertencias

- El rol del bot debe estar por encima de cualquier rol que entregue, quite o por el que banee, y necesita Banear miembros, Expulsar miembros, Gestionar roles o Moderar miembros según los castigos que elijas. Las acciones de silenciado necesitan un rol de silenciado, que el bot crea la primera vez que se usa.
- Los comandos solo aceptan hasta un día (`1d`) para las duraciones de Anti-Raid y Anti-Spam, y Timeout nunca puede superar los 28 días.
- Anti-Spam solo cuenta repeticiones idénticas. Un miembro que envía diez mensajes distintos rápidamente no es spam para él; de eso se encargan Anti-Mass-Post y Anti-Mass-Mention.
- Anti-Mass-Post con **Comprobar solo enlaces** activado ignora todo lo que no tenga un enlace. Desactívalo para atrapar copypasta, a costa de más falsos positivos en servidores muy activos.
- La comprobación de creación en lote de Anti-Pattern obtiene la lista completa de miembros en cada entrada, lo que es lento en servidores muy grandes.
- Una imagen bloqueada añadida a partir de un hash en lugar de la imagen en sí solo detecta copias exactas; vuelve a añadirla desde la imagen para cubrir las versiones reflejadas y con borde.
- Activar una protección desde el panel aplica valores iniciales. Abre **Configurar** y confirma la acción, sobre todo antes de elegir Ban.
- Los comandos de asignación automática, autoasignación y roles por reacción rechazan los roles iguales o superiores a tu rol más alto, salvo que seas el propietario.
- Los roles por reacción se pierden si el mensaje se elimina; `reactionroleslist` muestra qué configuraciones apuntan a un mensaje eliminado.
- El renombrado masivo afecta a todos los miembros que el bot puede renombrar, incluido el staff por debajo de su rol. Ten un plan para volver a renombrarlos.
- `delete` y `edit` solo funcionan con mensajes que el bot puede ver, y `edit` solo con los propios mensajes del bot.
