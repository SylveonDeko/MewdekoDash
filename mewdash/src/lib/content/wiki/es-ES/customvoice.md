---
title: Voz personalizada
slug: customvoice
summary: Un canal de entrada que crea un canal de voz temporal para cada miembro, con controles de nombre, límite de usuarios, bitrate, bloqueo, permitir y denegar, y limpieza automática cuando se vacía.
icon: fa-microphone
category: Entertainment
dashboard: /dashboard/customvoice
module: CustomVoice
tags: [custom voice, temporary voice, join to create, voice hub, private voice, voice channels, lock, bitrate, user limit, voz personalizada, voz temporal, unirse para crear, canal de voz privado, canales de voz, bloquear, límite de usuarios]
related: [administration, statchannels]
---

## Qué hace

El personal define un canal de voz como punto de entrada. Cuando un miembro entra en él, el bot crea un canal de voz nuevo para esa persona, con un nombre basado en una plantilla, lo coloca en la categoría configurada y lo mueve a él. Ese miembro es el propietario del canal: puede renombrarlo, definir un límite de usuarios y un bitrate, bloquearlo para que solo puedan entrar los miembros permitidos, permitir o denegar a personas concretas, mantenerlo activo o cedérselo a otra persona.

Cuando sale la última persona, el canal se elimina tras un breve tiempo de espera, salvo que el propietario haya activado mantener activo. Si el propietario se va y otra persona sigue dentro, esa persona puede reclamarlo.

Los miembros pueden guardar preferencias para sus canales, de modo que cada canal que creen empiece con su nombre, límite, bitrate, estado de bloqueo y ajuste de mantener activo preferidos. El personal decide cuáles de estas personalizaciones pueden usar los miembros, define topes para el límite y el bitrate, y puede indicar un rol de administración que puede gestionar cualquier canal personalizado.

## Por qué usarlo

- Dejar de mantener un muro de canales de «Gaming 1» a «Gaming 8»; los miembros crean uno cuando lo necesitan y desaparece después.
- Los miembros que quieren una llamada privada bloquean su canal y permiten solo a sus amigos.
- Los streamers y anfitriones de eventos mantienen un canal activo para que sobreviva mientras se ausentan.
- Los moderadores con el rol de administración pueden renombrar, bloquear o ceder cualquier canal sin necesitar Gestionar canales en todo el servidor.

## El canal de entrada

`setupvoicehub` crea un canal de voz llamado «Create Voice Channel» dentro de una categoría nueva «Custom Voice Channels», deja que todos se conecten pero no hablen y lo registra como canal de entrada. `setvoicehub #channel [category]` usa un canal que ya tienes. La sección **Configuración básica** del panel hace lo mismo con un selector de canal y categoría.

Si **Permitir varios canales por usuario** está desactivado (por defecto), entrar al canal de entrada cuando ya eres propietario de un canal elimina el anterior antes de crear el nuevo.

## Nombres de canal

El **Formato de nombre predeterminado** es una plantilla. El bot sustituye `{0}` por el nombre de usuario del miembro, `{1}` por su discriminador y `{2}` por el nombre del servidor. Por defecto es `{0}'s Channel`. El nombre se recorta para ajustarse a los límites de Discord.

> [!NOTE]
> El texto de ejemplo del panel muestra `{username}'s Channel`, pero el bot solo sustituye `{0}`, `{1}` y `{2}`. Usa la forma numerada.

## Controles del propietario

`voicecontrols` publica un panel para el canal en el que estás, que muestra el nombre actual, el límite, el bitrate, el estado de bloqueo y de mantener activo, y quién está dentro, con botones de **Renombrar**, **Límite**, **Bitrate**, **Bloquear**/**Desbloquear**, mantener activo, **Transferir** y un selector de miembros para gestionar quién está dentro. Los botones de las personalizaciones que el servidor ha desactivado aparecen deshabilitados.

Las mismas acciones existen como comandos, y cada uno comprueba que estás en un canal personalizado, que eres su propietario o tienes el rol de administración, y que el servidor permite esa personalización:

| Acción | Comando | Qué hace |
| --- | --- | --- |
| Renombrar | `voicerename <name>` | Renombra el canal, si **Permitir personalizar el nombre** está activado |
| Límite de usuarios | `voicelimit <n>` | Define el límite, con el tope del límite máximo de usuarios del servidor |
| Bitrate | `voicebitrate <kbps>` | Define el bitrate, con el tope del bitrate máximo del servidor |
| Bloquear | `voicelock [true/false]`, `voiceunlock` | Bloqueado deniega conectarse a todos salvo a los miembros permitidos, al propietario y al rol de administración |
| Permitir | `voiceallow @user` | Concede conectarse a un miembro incluso cuando está bloqueado |
| Denegar | `voicedeny @user` | Quita el permiso de conectarse a un miembro y lo desconecta si está dentro |
| Mantener activo | `voicekeepalive [true/false]` | Detiene la limpieza de canales vacíos para este canal |
| Transferir | `voicetransfer @user` | Convierte a otro miembro en propietario y le traspasa los permisos de gestión |
| Reclamar | `voiceclaim` | Cualquier miembro que esté dentro puede quedarse con la propiedad cuando el propietario no está en el canal |

Cuando **Gestionar automáticamente los permisos del canal** está activado, el propietario recibe conectar, hablar, Gestionar canal, Mover miembros, Silenciar miembros y Ensordecer miembros en su canal, los miembros permitidos y denegados reciben los permisos correspondientes y el rol de administración recibe acceso de gestión.

## Limpieza

Con **Eliminar canales cuando estén vacíos** activado (por defecto), un canal sin humanos dentro se programa para su eliminación tras el tiempo de espera de canal vacío. Volver a entrar antes de que se cumpla el temporizador lo cancela. Los canales marcados como mantener activo nunca se eliminan automáticamente. Un barrido en segundo plano cada cinco minutos también elimina los canales que llevan vacíos más que el tiempo de espera, y el botón **Limpiar canales inactivos** del panel elimina los canales inactivos durante el número de horas que elijas.

## Preferencias de los miembros

`voicepreferences` muestra tus preferencias guardadas de formato de nombre, límite de usuarios, bitrate, bloqueo y mantener activo. Cada comando `voiceprefs...` define una, y ejecutarlo sin valor la borra, y `voiceprefsreset` las borra todas. Las preferencias solo se aplican cuando **Recordar preferencias del usuario** está activado, y el límite y el bitrate siguen teniendo el tope de los máximos del servidor. El personal puede ver y editar las preferencias de cualquier miembro desde la pestaña **Preferencias de usuario** mediante su ID de usuario.

## Ajustes

El panel tiene tres pestañas: **Configuración**, **Canales activos** y **Preferencias de usuario**. **Configuración** se divide en **Configuración básica**, **Valores predeterminados del canal** y **Gestión de canales**. `voiceconfig` sin argumentos muestra todos los valores; `voiceconfig <setting> <value>` cambia uno.

| Ajuste | Por defecto | Qué controla |
| --- | --- | --- |
| Canal de entrada | ninguno | El canal de unirse para crear |
| Categoría | ninguna | Dónde se crean los canales nuevos |
| Formato de nombre predeterminado | `{0}'s Channel` | Plantilla para los nombres de canal nuevos (`nameformat`) |
| Límite de usuarios predeterminado | 0 (ilimitado) | Límite de usuarios inicial (`userlimit`) |
| Bitrate predeterminado | 64 kbps | Bitrate inicial (`bitrate`) |
| Eliminar canales cuando estén vacíos | Activado | Elimina los canales en los que no hay nadie (`deleteempty`) |
| Tiempo de espera vacío | 1 | Retraso antes de eliminar un canal vacío (`emptytimeout`); el panel lo etiqueta en segundos y acepta de 5 a 300 |
| Permitir varios canales por usuario | Desactivado | Deja que un miembro sea propietario de varios canales (`multiplechannels`) |
| Recordar preferencias del usuario | Activado | Aplica las preferencias guardadas de los miembros (`persistpreferences`) |
| Gestionar automáticamente los permisos del canal | Activado | Define los permisos del propietario, de permitir, de denegar y del rol de administración (`autopermission`) |
| Permitir personalizar el nombre | Activado | `namechange` |
| Permitir personalizar el límite de usuarios | Activado | `limitchange` |
| Permitir personalizar el bitrate | Activado | `bitratechange` |
| Permitir bloquear el canal | Activado | `locking` |
| Permitir gestión de usuarios | Activado | Comandos de permitir y denegar (`usermanagement`) |
| Límite máximo de usuarios | 99 | Tope para los límites definidos por los miembros (`maxuserlimit`) |
| Bitrate máximo | 96 kbps | Tope para los bitrates definidos por los miembros, también limitado por el nivel de boost del servidor (`maxbitrate`) |
| Rol de administración | ninguno | Rol que puede gestionar cualquier canal personalizado (`adminrole`) |

El **Límite máximo de usuarios**, el **Bitrate máximo** y el **Rol de administración** no tienen control en el panel; defínelos con `voiceconfig`.

La pestaña **Canales activos** enumera todos los canales personalizados en vivo con su propietario y su estado de bloqueo y de mantener activo, te permite bloquear, desbloquear o eliminar uno, y muestra totales de canales creados, activos en la última hora, bloqueados y mantenidos activos. También contiene el botón **Limpiar canales inactivos** y un botón **Desactivar voz personalizada** que apaga el módulo para el servidor.

## Guía de configuración

1. Da al bot Gestionar canales, Mover miembros y Gestionar roles (para los permisos de canal) en la categoría que vayas a usar.
2. Ejecuta `setupvoicehub`, o abre **Voz personalizada** en el panel y elige un canal de entrada y una categoría existentes en **Configuración básica**.
3. Define el **Formato de nombre predeterminado**, el **Límite de usuarios predeterminado** y el **Bitrate predeterminado** en **Valores predeterminados del canal**.
4. En **Gestión de canales**, desactiva las personalizaciones que no quieras que tengan los miembros.
5. Define un **Rol de administración** con `voiceconfig adminrole @Moderators` para que el personal pueda gestionar canales que no son suyos.
6. Entra tú mismo al canal de entrada, ejecuta `voicecontrols` y prueba a renombrar y bloquear el canal.

## Comandos

Ejecútalos con el prefijo de tu servidor (`.` salvo que lo hayas cambiado).

| Comando | Alias | Requiere | Propósito |
| --- | --- | --- | --- |
| `setupvoicehub` | `svh`, `createvoicehub`, `voicesetup` | Gestionar canales | Crea un canal de entrada y una categoría |
| `setvoicehub <#channel> [category]` | `sethub`, `voicehub` | Gestionar canales | Usa un canal existente como canal de entrada |
| `voiceconfig [setting] [value]` | `vcconfig`, `voicesettings`, `vcsettings`, `customvoiceconfig` | Gestionar canales | Muestra o cambia los ajustes del servidor |
| `voicecontrols` | `vcontrols` | Propietario o rol de administración | Panel de control interactivo de tu canal |
| `voicechannels` | `vchannels`, `listvoice`, `customvoices`, `voicelist` | Nadie | Enumera los canales personalizados activos |
| `voicerename <name>` | `vrename`, `renamevoice`, `vcname`, `vcrename` | Propietario o rol de administración | Renombra tu canal |
| `voicelimit <number>` | `vclimit`, `limitvoice`, `vlimit`, `setlimit` | Propietario o rol de administración | Define el límite de usuarios |
| `voicebitrate <kbps>` | `vcbitrate`, `vbitrate`, `setbitrate` | Propietario o rol de administración | Define el bitrate |
| `voicelock [true/false]` | `vclock`, `lockvoice`, `vlock`, `lockvc` | Propietario o rol de administración | Bloquea o desbloquea |
| `voiceunlock` | `vcunlock`, `unlockvoice`, `vunlock`, `unlockvc` | Propietario o rol de administración | Desbloquea |
| `voiceallow @user` | `vcallow`, `allowuser`, `vallow`, `adduser` | Propietario o rol de administración | Deja que un miembro entre a un canal bloqueado |
| `voicedeny @user` | `vcdeny`, `denyuser`, `vdeny`, `removeuser` | Propietario o rol de administración | Bloquea a un miembro y lo desconecta |
| `voiceclaim` | `vcclaim`, `claimvoice`, `vclaim`, `takeover` | Nadie | Toma el control de un canal cuyo propietario se ha ido |
| `voicetransfer @user` | `vctransfer`, `transfervoice`, `vtransfer`, `givevc` | Propietario o rol de administración | Da el canal a otra persona |
| `voicekeepalive [true/false]` | `vckeepalive`, `keepvoice`, `vkeep`, `persist` | Propietario o rol de administración | Exime al canal de la limpieza |
| `voicepreferences` | `vcprefs`, `voiceprefs`, `vprefs`, `myvoice` | Nadie | Muestra tus preferencias guardadas |
| `voiceprefsname [format]` | `vcprefsname`, `vpname`, `prefname`, `namepref` | Nadie | Formato de nombre preferido, vacío lo borra |
| `voiceprefslimit [number]` | `vcprefslimit`, `vplimit`, `preflimit`, `limitpref` | Nadie | Límite de usuarios preferido |
| `voiceprefsbitrate [kbps]` | `vcprefsbitrate`, `vpbitrate`, `prefbitrate`, `bitratepref` | Nadie | Bitrate preferido |
| `voiceprefslock [true/false]` | `vprefslock` | Nadie | Empieza los canales bloqueados |
| `voiceprefskeepalive [true/false]` | `vcprefskeepalive`, `vpkeepalive`, `prefkeepalive`, `keeppref` | Nadie | Empieza los canales con mantener activo |
| `voiceprefsreset` | `vcprefsreset`, `vprefsreset`, `resetprefs`, `clearprefs` | Nadie | Borra todas las preferencias |

## Consejos y advertencias

- El bot necesita Gestionar canales en la categoría, Mover miembros para colocar al creador en el canal nuevo y Gestionar roles para escribir permisos de canal.
- El bitrate máximo se limita a lo que permite el nivel de boost del servidor, así que un ajuste de 384 en un servidor sin boosts se reduce automáticamente.
- Bloquear deniega conectarse al rol everyone. Los miembros con Administrador o con un rol que ya tenga un permiso explícito de conectarse pueden seguir entrando.
- El temporizador de canal vacío que se ejecuta cuando sale el último miembro trata el valor del tiempo de espera como segundos, mientras que la visualización de la configuración y el barrido de cinco minutos lo tratan como minutos. Con el valor por defecto de 1, el canal desaparece casi de inmediato una vez vacío.
- Los canales con mantener activo nunca se limpian automáticamente. Usa la pestaña **Canales activos** o `voicechannels` para encontrar los olvidados.
- Reclamar solo funciona mientras el propietario original no está conectado al canal.
