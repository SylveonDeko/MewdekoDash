---
title: Perfil de usuario
slug: userprofile
summary: Da a cada miembro una tarjeta de perfil que el bot puede mostrar en cualquier lugar, con biografía, pronombres, signo zodiacal, cumpleaños, color, imagen y código de amigo de Switch, además de controles de privacidad sobre lo que ven los demás.
icon: fa-user
category: Community
module: UserProfile
tags: [profile, bio, pronouns, pronoundb, zodiac, birthday, privacy, profile colour, profile image, switch friend code, stats opt out, greet dm opt out, perfil, biografía, pronombres, zodiaco, cumpleaños, privacidad, color del perfil, imagen del perfil, código de amigo de Switch]
related: [birthday, switch, afk, help]
---

## Qué hace

Cada miembro tiene un perfil que lo acompaña en todos los servidores en los que está el bot. Ejecutar `profile` lo publica como un embed: el avatar del miembro como miniatura, su biografía como descripción y luego campos para los pronombres, el signo zodiacal, el cumpleaños, cuántos servidores comparte con el bot y su código de amigo de Nintendo Switch si definió uno. Un color personalizado y una imagen grande al final lo completan.

Los miembros rellenan el perfil con unos cuantos comandos `set...`, o desde la página **Mis ajustes** del panel. Nada es específico de un servidor: define tu biografía una vez y se muestra igual en todas partes.

La privacidad está bajo el control del miembro. Un perfil puede hacerse privado para que solo su propietario pueda abrirlo, el cumpleaños puede recortarse a solo el mes u ocultarse por completo, y los miembros pueden excluirse de las estadísticas de comandos y de los MD de bienvenida.

Los pronombres son un poco especiales. Si un miembro no ha definido ninguno con el bot, el bot los busca en PronounDB. Los miembros pueden reemplazarlos con su propio texto, y cualquiera puede denunciar un reemplazo abusivo a los propietarios del bot.

## Por qué usarlo

- Los miembros quieren una tarjeta rápida de "sobre mí" sin un canal de presentaciones dedicado.
- Una comunidad que comparte códigos de amigo de Switch puede tenerlos en un solo lugar en lugar de fijar mensajes.
- Los pronombres se pueden mostrar automáticamente desde PronounDB, así que la mayoría de la gente nunca tiene que escribirlos.
- El staff puede consultar los pronombres de alguien con `pronouns @user` antes de responder.
- Los miembros que no quieren MD de bienvenida ni la recopilación de estadísticas pueden desactivarlos por sí mismos.

## El embed del perfil

`profile` sin argumento muestra tu propio perfil. `profile @user` muestra el de otra persona, salvo que lo haya puesto como privado, en cuyo caso el bot responde que el perfil es privado.

| Parte del embed | De dónde viene |
| --- | --- |
| Título | "Profile for" el usuario |
| Color | `setprofilecolor`, o si no el color predeterminado del bot |
| Miniatura | El avatar de Discord del miembro |
| Descripción | La biografía de `setbio` (solo se muestra si está definida) |
| Pronombres | Tu reemplazo, si no PronounDB, si no "Unspecified" |
| Signo zodiacal | `setzodiac`, si no "Unspecified" |
| Cumpleaños | `setbirthday`, mostrado según el modo de privacidad del cumpleaños, si no "Unspecified" |
| Servidores en común con el bot | En cuántos servidores estáis tú y el bot |
| Código de amigo de Switch | Solo se muestra si está definido |
| Imagen | La URL de `setprofileimage` |

## Campos del perfil

### Biografía

`setbio <text>` acepta hasta 2048 caracteres. Un texto más largo se rechaza. No hay un comando para borrarla; define una biografía corta, como un solo punto, si quieres que desaparezca.

### Signo zodiacal

`setzodiac <sign>` acepta uno de los doce signos occidentales: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces (en inglés). Las mayúsculas no importan. Cualquier otra cosa se rechaza.

### Color e imagen

`setprofilecolor <colour>` acepta un color en cualquier forma que entienda el analizador de colores del bot, como un valor hexadecimal. `setprofileimage <url>` necesita un enlace directo a un archivo de imagen; el bot comprueba que la URL parezca una imagen antes de guardarla y te la muestra de vuelta.

### Cumpleaños

`setbirthday <date>` guarda una fecha. Los anuncios del módulo de Cumpleaños usan el mismo valor, así que definirlo aquí también lo define allí. Cómo aparece en el perfil depende de `setbirthdayprivacy <mode>`:

| Modo | Lo que muestra el perfil |
| --- | --- |
| `Default` | La fecha completa |
| `MonthOnly` | Solo el nombre del mes |
| `YearOnly` | Solo el año |
| `MonthAndDate` | Mes y día, sin año |
| `Disabled` | "Private" |

### Código de amigo de Switch

`setswitchfc <code>` debe coincidir con `SW-XXXX-XXXX-XXXX` (cuatro dígitos en cada grupo; `SW` no distingue mayúsculas). Ejecútalo sin código para quitarlo de tu perfil. El módulo de Nintendo Switch no tiene relación con este campo; el código es solo para mostrar.

### Privacidad

`setprivacy public` o `setprivacy private`. Los perfiles privados solo los ve su propietario. Por defecto es público.

## Pronombres

`pronouns [@user]` muestra los pronombres tuyos o de otra persona. Orden de búsqueda:

1. El texto que el miembro definió con `setpronouns`.
2. El conjunto de pronombres en inglés del miembro en PronounDB, si vinculó allí su cuenta de Discord. Los conjuntos estándar se muestran en su forma habitual, por ejemplo `he/him`, `Any pronouns` o `Ask me my pronouns`.
3. "Unspecified".

`setpronouns <text>` guarda un reemplazo. Ejecútalo sin texto para ver tu reemplazo actual con dos botones: **Overwrite** abre un formulario para escribir nuevos pronombres y **Borrar** quita el reemplazo para que se vuelva a usar PronounDB.

Cuando los pronombres mostrados provienen del propio reemplazo del miembro (no de PronounDB), la respuesta incluye un botón **Report**. Las denuncias van a un canal que gestionan los propietarios del bot, donde pueden borrar el reemplazo, desactivar los pronombres de ese usuario o ponerlo en la lista negra. Un usuario cuyos pronombres han sido desactivados ve el motivo cada vez que intenta usar los comandos de pronombres.

> [!NOTE]
> El comando de propietario del bot `pronounsforceclear` es la forma de actuar sobre esas denuncias. El staff del servidor no puede borrar los pronombres de otro miembro.

## Exclusiones

- `greetdmoptout` alterna si los servidores que usan los saludos por MD del bot pueden enviarte MD. Solo afecta a los saludos enviados por este bot.
- `userstatsoptout` alterna la recopilación de estadísticas de comandos de tu cuenta. Esto nunca recopila el contenido de los mensajes.
- `deleteuserstatsdata` elimina las estadísticas de comandos ya almacenadas sobre ti tras una confirmación. Se puede ejecutar una vez por hora.

## Ajustes

No hay configuración del lado del servidor. Todo vive en el miembro. La página **Mis ajustes** del panel (`/me`) tiene una sección **Perfil** con un botón **Editar** y una sección de privacidad con interruptores.

| Ajuste | Por defecto | Qué controla |
| --- | --- | --- |
| Biografía | vacía | La descripción de tu perfil |
| Pronombres | vacío (se usa PronounDB) | Tu reemplazo de pronombres |
| Zodiaco | ninguno | Signo zodiacal mostrado en el perfil |
| Cumpleaños | ninguno | La fecha mostrada en el perfil y usada para los anuncios de cumpleaños |
| Zona horaria | UTC | Zona horaria que usa el módulo de Cumpleaños para tu anuncio |
| Código de amigo de Switch | vacío | Campo del código de amigo en el perfil |
| Color del perfil | predeterminado del bot | Color del embed |
| Imagen del perfil | ninguna | Imagen al final del embed |
| Privacidad del perfil | Público | Si otros pueden abrir tu perfil |
| Modo de visualización del cumpleaños | Default | Qué partes del cumpleaños se muestran |
| Bloquear MDs de bienvenida | desactivado | Igual que `greetdmoptout` |
| Bloquear seguimiento de mensajes | desactivado | Igual que `userstatsoptout` |
| Anuncios de cumpleaños | desactivado | Si el módulo de Cumpleaños anuncia tu cumpleaños |

La misma página también tiene un interruptor que desactiva la obtención de pronombres para tu cuenta.

## Guía de configuración

1. Ejecuta `setbio Hi, I run the art channel.` para añadir una descripción.
2. Ejecuta `setpronouns she/her`, o sáltatelo si tu cuenta de PronounDB ya está vinculada a Discord.
3. Ejecuta `setbirthday 1998-04-12` y luego `setbirthdayprivacy MonthAndDate` si no quieres que se muestre el año.
4. Ejecuta `setprofilecolor #ff66aa` y `setprofileimage https://example.com/banner.png` para dar estilo al embed.
5. Añade `setswitchfc SW-1234-5678-9012` si quieres que la gente te encuentre en Switch.
6. Ejecuta `profile` para comprobar el resultado. Si prefieres que nadie más lo vea, ejecuta `setprivacy private`.

## Comandos

Ejecútalos con el prefijo de tu servidor (`.` salvo que lo hayas cambiado). Existen versiones de barra para la mayoría con nombres como `/profile`, `/setbio`, `/setcolor`, `/setbirthday`, `/setbirthdayprivacy`, `/setswitchfriendcode`, `/setprofileimage`, `/setprivacy`, `/setzodiac`, `/pronouns`, `/setpronouns`, `/statsoptout` y `/deletestatsdata`.

| Comando | Alias | Requiere | Para qué sirve |
| --- | --- | --- | --- |
| `profile [@user]` | `userprofile` | Nadie | Mostrar tu perfil o el de otra persona |
| `setbio <text>` | | Nadie | Definir tu biografía, hasta 2048 caracteres |
| `setpronouns [text]` | `pronounsset` | Nadie | Definir un reemplazo de pronombres, o verlo con botones de borrar y sobrescribir |
| `pronouns [@user]` | `getpronouns` | Nadie | Mostrar pronombres, con un botón de denuncia en los reemplazos |
| `setzodiac <sign>` | | Nadie | Definir tu signo zodiacal |
| `setprofilecolor <colour>` | | Nadie | Definir el color del embed |
| `setprofileimage <url>` | | Nadie | Definir la imagen mostrada en el perfil |
| `setbirthday <date>` | | Nadie | Definir tu cumpleaños |
| `setbirthdayprivacy <mode>` | | Nadie | `Default`, `MonthOnly`, `YearOnly`, `MonthAndDate` o `Disabled` |
| `setprivacy <Public|Private>` | `profilepricvacy` | Nadie | Hacer el perfil público o privado |
| `setswitchfc [code]` | `setfc`, `setswitchfriendcode`, `setfriendcode` | Nadie | Definir o borrar tu código de amigo de Switch |
| `greetdmoptout` | `gdmoptout` | Nadie | Activar o desactivar la recepción de saludos por MD de este bot |
| `userstatsoptout` | `ustatsoptout` | Nadie | Activar o desactivar la recopilación de estadísticas de comandos |
| `deleteuserstatsdata` | `deluserstatsdata` | Nadie | Eliminar tus estadísticas de comandos almacenadas (una vez por hora) |
| `pronounsforceclear <@user or id> <true|false> <reason>` | `pnfc` | Propietario del bot | Borrar los pronombres de un miembro y opcionalmente desactivarlos |

## Consejos y advertencias

- El perfil es global. Cambiarlo en un servidor lo cambia en todas partes.
- `setbirthday` lee la fecha con el analizador de fechas del bot, así que un formato inequívoco como `1998-04-12` es lo más seguro.
- Si la URL de la imagen del perfil deja de funcionar, el embed se sigue enviando pero Discord no muestra ninguna imagen. Define una URL nueva para arreglarlo.
- Las búsquedas en PronounDB necesitan que el miembro haya vinculado su cuenta de Discord en pronoundb.org. Sin eso, el perfil dice "Unspecified" hasta que ejecuten `setpronouns`.
- Los perfiles privados siguen respondiendo a `profile @user`, pero con un error que indica que el perfil es privado, para que la gente sepa que existe uno.
- `deleteuserstatsdata` solo elimina las estadísticas de comandos. Los campos del perfil se borran sobrescribiéndolos.
