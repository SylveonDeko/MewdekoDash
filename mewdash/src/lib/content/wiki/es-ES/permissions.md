---
title: Permisos de comandos
slug: permissions
summary: Decide quién puede ejecutar qué comandos y dónde, con una lista ordenada de reglas de permitir y denegar para comandos y módulos aplicadas a todo el servidor, un rol, un canal, una categoría o un solo miembro.
icon: fa-cog
category: Security
dashboard: /dashboard/administration
module: Permissions
tags: [permissions, command permissions, allow, deny, permission role, verbose, disable command, disable module, cooldown, dpo, permission override, blacklist, permisos, permisos de comandos, permitir, denegar, rol de permisos, desactivar comando, desactivar módulo, enfriamiento, excepciones de permisos, lista negra]
related: [administration, help, filter, moderation]
---

## Qué hace

Por defecto, todos los comandos están disponibles para cualquiera a quien se lo permitan los permisos de Discord. Permisos de comandos añade encima una lista de reglas propia del servidor. Cada regla indica si un comando, un módulo o todos los módulos están permitidos o denegados para todo el servidor, un rol, un canal, una categoría o un miembro. Cuando alguien ejecuta un comando, el bot recorre la lista, aplica la primera regla que coincide y deja pasar el comando o lo detiene.

Los comandos bloqueados fallan en silencio salvo que el modo **verbose** esté activado, en cuyo caso el bot responde con el número y el texto de la regla que lo bloqueó. Los comandos de barra siempre reciben una explicación efímera.

Las reglas pueden gestionarlas los administradores o cualquiera que tenga el **rol de permisos** que elijas. La misma lista está en el panel, en **Administración**, en la sección **Automatización y ajustes**, como la tarjeta **Permisos de comandos**.

Junto a esto hay dos herramientas relacionadas. Los enfriamientos de comandos limitan la frecuencia con la que un miembro puede usar un comando en un servidor. Las excepciones de permisos de Discord, en el módulo Administración, sustituyen el permiso de Discord que un comando exige normalmente; por ejemplo, permiten que quienes tienen Gestionar mensajes usen un comando que normalmente necesita Administrador.

## Por qué usarlo

- Mantener los comandos divertidos y NSFW fuera de los canales serios.
- Desactivar el módulo de Música en todas partes excepto en un canal de comandos del bot.
- Dejar que un rol de ayudantes use `warn` sin darles Gestionar mensajes ni Administrador.
- Impedir que un miembro conflictivo use el bot en absoluto.
- Limitar la frecuencia de un comando ruidoso como `roll` a una vez cada diez segundos por miembro.

## Cómo se escribe una regla

Cada regla tiene tres partes.

| Parte | Opciones |
| --- | --- |
| Qué | Un comando, un módulo o todos los módulos |
| Para | Todo el servidor, un rol, un canal, una categoría o un usuario concreto |
| Acción | Permitir o denegar |

Los nombres de comando de la tabla siguiente codifican las dos primeras partes. Las primeras letras eligen el destino (`s` servidor, `r` rol, `c` canal, `ca` categoría, `u` usuario), las últimas eligen el ámbito (`cmd` comando, `mdl` módulo), y las formas `all...mdls` cubren todos los módulos.

| Comando | Regla creada |
| --- | --- |
| `srvrcmd <command> <enable|disable>` | Un comando para todo el servidor |
| `srvrmdl <module> <enable|disable>` | Un módulo para todo el servidor |
| `allsrvrmdls <enable|disable>` | Todos los módulos para todo el servidor |
| `rolecmd <command> <enable|disable> <role>` | Un comando para un rol |
| `rolemdl <module> <enable|disable> <role>` | Un módulo para un rol |
| `allrolemdls <enable|disable> <role>` | Todos los módulos para un rol |
| `chnlcmd <command> <enable|disable> <#channel>` | Un comando en un canal |
| `chnlmdl <module> <enable|disable> <#channel>` | Un módulo en un canal |
| `allchnlmdls <enable|disable> <#channel>` | Todos los módulos en un canal |
| `catcmd <command> <enable|disable> <category>` | Un comando en todos los canales de una categoría |
| `catmdl <module> <enable|disable> <category>` | Un módulo en una categoría |
| `allcatmdls <enable|disable> <category>` | Todos los módulos en una categoría |
| `usrcmd <command> <enable|disable> @user` | Un comando para un miembro |
| `usrmdl <module> <enable|disable> @user` | Un módulo para un miembro |
| `allusrmdls <enable|disable> @user` | Todos los módulos para un miembro |

Los disparadores de chat cuentan como comandos: indica el número o el texto del disparador donde se espera el nombre de un comando.

> [!EXAMPLE]
> `srvrmdl nsfw disable` y luego `chnlmdl nsfw enable #adult` bloquea el módulo NSFW en todas partes excepto en un canal.

## Orden de las reglas

`listperms` muestra la lista numerada desde 1. La regla 1 siempre es «permitir todos los módulos para todo el servidor» y no se puede editar ni eliminar; es la opción de respaldo cuando nada más coincide.

Las reglas nuevas se añaden al final de la lista. Cuando se ejecuta un comando, el bot comprueba las reglas empezando por el número más alto y avanzando hacia la regla 1, y decide la primera regla cuyo destino y ámbito coinciden. Eso significa que gana la regla coincidente añadida más recientemente, por lo que funciona el ejemplo anterior: el permitir del canal se añadió después del denegar del servidor.

`moveperm <from> <to>` cambia la posición de una regla y renumera todo, así que puedes subir o bajar una excepción respecto a una regla más amplia sin volver a crearla. `removeperm <number>` elimina una regla. `resetperms` borra la lista hasta dejar solo la regla 1 y requiere Administrador.

El panel enumera las mismas reglas con flechas para subir y bajar y un botón de eliminar por regla.

## Modo verbose

`verbose` activa o desactiva que un comando de texto bloqueado reciba un mensaje de error con el nombre de la regla que lo bloquea, como «permission 4 (`.chnlmdl nsfw disable #general`) prevents this». Está desactivado por defecto. Con él desactivado, los comandos bloqueados se ignoran en silencio, lo cual es lo adecuado para la mayoría de los servidores y evita que los miembros anden probando lo que no pueden ejecutar. Los comandos de barra siempre responden con el motivo, de forma efímera, sea cual sea este ajuste.

## Quién puede cambiar las reglas

Todos los comandos de este módulo pasan por una puerta adicional. Los administradores siempre pueden usarlos. Cualquier otra persona necesita el **rol de permisos** definido con `permrole <role>`. Sin él, a los no administradores se les dice que necesitan permisos de administrador (solo si verbose está activado) y el comando se detiene. `permrole` sin argumento muestra el rol actual; `permrole reset` lo borra. No se puede usar el rol `@everyone`.

`resetperms` y `permrole` en sí siempre requieren además Administrador.

## Enfriamientos

`cmdcooldown <command> [time]` define un enfriamiento por miembro para un comando en este servidor, desde 1 segundo hasta 90000 segundos (25 horas). No indiques tiempo, o indica `0s`, para borrarlo. `allcmdcooldowns` enumera los enfriamientos actuales. Se suman a cualquier enfriamiento integrado que ya tenga un comando.

## Excepciones de permisos de Discord

El módulo Administración puede sustituir el permiso de Discord que requiere un comando. `dpo <command> <permissions...>` hace que el comando requiera los permisos indicados en lugar del suyo integrado, por ejemplo `dpo purge ManageMessages`. Ejecuta `dpo <command>` sin permisos para quitar la excepción, `dpol` para enumerarlas y `dpor` para borrarlas todas tras una confirmación. Los tres requieren Administrador.

Una excepción sustituye solo el requisito integrado de Discord. Las reglas de permisos de comandos anteriores se siguen aplicando, y la página del comando de `help <command>` muestra el requisito original tachado con la excepción al lado.

## El menú rápido en la ayuda

`help <command>` muestra a los administradores un botón de permisos. Abre un menú rápido para ese comando que muestra las reglas que lo afectan, avisa de reglas redundantes (dos reglas con el mismo destino y ámbito), ofrece resolverlas y te permite añadir reglas de permitir y denegar para el comando o restablecer sus permisos sin salir de la página de ayuda.

## Controles del propietario del bot

Tres grupos de comandos están restringidos a los propietarios del bot y afectan a todos los servidores: los permisos globales (`globalmodule`, `globalcommand`, `globalpermlist`, `resetglobalperms`) desactivan un módulo o comando en todas partes, y la lista negra (`userblacklist`, `channelblacklist`, `serverblacklist`, `manualblacklistcheck`) hace que el bot deje de responder a un usuario, canal o servidor por completo. Un módulo desactivado globalmente muestra un globo y una cruz en el menú de ayuda.

## Ajustes

En el panel, abre **Administración**, luego la sección **Automatización y ajustes** y después la tarjeta **Permisos de comandos**.

| Ajuste | Por defecto | Qué controla |
| --- | --- | --- |
| Permisos detallados | desactivado | Avisar a los usuarios cuando una regla bloquea un comando |
| Rol de permisos | ninguno | Los miembros con este rol pueden editar reglas mediante comandos |
| Reglas | solo la regla 1 | La lista ordenada; añade con **Acción**, **Qué** y **Para**, y luego un módulo, comando, rol, canal, categoría o ID de usuario |

La tarjeta también muestra el número de reglas personalizadas y si el modo verbose está activado. La tarjeta **Excepciones de permisos** de la misma sección gestiona las excepciones de permisos de Discord: elige un comando del bot y el **Permiso de Discord requerido** que debería necesitar en lugar del suyo integrado.

## Guía de configuración

1. Decide la forma: normalmente «todo permitido y unas pocas cosas denegadas» o «todo denegado y luego permitido en los canales del bot».
2. Para la segunda forma, ejecuta `allsrvrmdls disable` y luego `allchnlmdls enable #bot-commands`.
3. Mantén la moderación funcionando para el personal: `rolemdl moderation enable @Mods` y `rolemdl administration enable @Mods`.
4. Ejecuta `listperms` y léela de abajo arriba, ya que ese es el orden que usa el bot. Usa `moveperm` si una excepción está por debajo de la regla que debería sobrescribir.
5. Da `permrole @Mods` al personal de confianza para que puedan ajustar reglas sin Administrador.
6. Activa `verbose` mientras pruebas para ver qué regla se activa y luego desactívalo de nuevo.

## Comandos

Ejecútalos con el prefijo de tu servidor (`.` salvo que lo hayas cambiado). Las versiones de barra están en `/permissions`, por ejemplo `/permissions servercommand`.

| Comando | Alias | Requiere | Propósito |
| --- | --- | --- | --- |
| `listperms` | `lp` | Administrador o rol de permisos | Muestra la lista numerada de reglas |
| `verbose [true|false]` | `v` | Administrador o rol de permisos | Activa o desactiva los mensajes de comando bloqueado |
| `permrole [role|reset]` | `pr` | Administrador | Muestra, define o restablece el rol de permisos |
| `removeperm <number>` | `rp` | Administrador o rol de permisos | Elimina una regla |
| `moveperm <from> <to>` | `mp` | Administrador o rol de permisos | Reordena las reglas |
| `resetperms` | | Administrador | Elimina todas las reglas |
| `srvrcmd <command> <enable|disable>` | `sc` | Administrador o rol de permisos | Regla de comando, todo el servidor |
| `srvrmdl <module> <enable|disable>` | `sm` | Administrador o rol de permisos | Regla de módulo, todo el servidor |
| `allsrvrmdls <enable|disable>` | `asm` | Administrador o rol de permisos | Todos los módulos, todo el servidor |
| `rolecmd <command> <enable|disable> <role>` | `rc` | Administrador o rol de permisos | Regla de comando para un rol |
| `rolemdl <module> <enable|disable> <role>` | `rm` | Administrador o rol de permisos | Regla de módulo para un rol |
| `allrolemdls <enable|disable> <role>` | `arm` | Administrador o rol de permisos | Todos los módulos para un rol |
| `chnlcmd <command> <enable|disable> <#channel>` | `cc` | Administrador o rol de permisos | Regla de comando en un canal |
| `chnlmdl <module> <enable|disable> <#channel>` | `cm` | Administrador o rol de permisos | Regla de módulo en un canal |
| `allchnlmdls <enable|disable> <#channel>` | `acm` | Administrador o rol de permisos | Todos los módulos en un canal |
| `catcmd <command> <enable|disable> <category>` | `cac` | Administrador o rol de permisos | Regla de comando en una categoría |
| `catmdl <module> <enable|disable> <category>` | `cam` | Administrador o rol de permisos | Regla de módulo en una categoría |
| `allcatmdls <enable|disable> <category>` | `acamds` | Administrador o rol de permisos | Todos los módulos en una categoría |
| `usrcmd <command> <enable|disable> @user` | `uc` | Administrador o rol de permisos | Regla de comando para un miembro |
| `usrmdl <module> <enable|disable> @user` | `um` | Administrador o rol de permisos | Regla de módulo para un miembro |
| `allusrmdls <enable|disable> @user` | `aum` | Administrador o rol de permisos | Todos los módulos para un miembro |
| `cmdcooldown <command> [time]` | `cmdcd` | Administrador o rol de permisos | Define o borra un enfriamiento |
| `allcmdcooldowns` | `acmdcds` | Administrador o rol de permisos | Enumera los enfriamientos |
| `discordpermoverride <command> [permissions...]` | `dpo` | Administrador | Define o quita una excepción de permisos de Discord |
| `discordpermoverridelist` | `dpol`, `dpoli` | Administrador | Enumera las excepciones |
| `discordpermoverridereset` | `dpor` | Administrador | Borra todas las excepciones |
| `globalmodule <module>` | `gmod` | Propietario del bot | Activa o desactiva un módulo en todas partes |
| `globalcommand <command>` | `gcmd` | Propietario del bot | Activa o desactiva un comando en todas partes |
| `globalpermlist` | `gpl`, `lgp`, `globalperms`, `listglobalperms` | Propietario del bot | Enumera los bloqueos globales |
| `resetglobalperms` | | Propietario del bot | Borra los bloqueos globales |
| `userblacklist <add|remove> <user> [reason]` | `ubl` | Propietario del bot | Añade un usuario a la lista negra |
| `channelblacklist <add|remove> <id> [reason]` | `cbl` | Propietario del bot | Añade un canal a la lista negra |
| `serverblacklist <add|remove> <server> [reason]` | `sbl` | Propietario del bot | Añade un servidor a la lista negra |
| `manualblacklistcheck` | `manualblcheck`, `mbc` | Propietario del bot | Vuelve a aplicar la lista negra |

## Consejos y advertencias

- `resetperms` está exento de la comprobación de reglas para que siempre puedas recuperarte de una regla que lo bloqueó todo, siempre que seas administrador.
- Las reglas coinciden con el nombre canónico del comando, así que `srvrcmd clear disable` y `srvrcmd purge disable` son la misma regla. Usa el primer nombre de `help <command>`.
- Una regla para «todos los módulos» también cubre el módulo Permisos. Si deniegas todo a un rol, los miembros que solo tienen ese rol tampoco podrán ejecutar `listperms`.
- Las reglas de categoría usan la categoría padre del canal en el momento en que se ejecuta el comando; los hilos heredan de su canal padre.
- Las excepciones de permisos de Discord cambian qué permiso de Discord se requiere, no a quién permiten las reglas. Úsalas juntas: una excepción para bajar el listón y luego una regla para restringir dónde.
- Las reglas de permisos nunca se aplican en MD.
- El panel etiqueta las opciones de destino como Todo el servidor, Un rol, Un canal, Una categoría y Un usuario concreto; la opción de usuario acepta un ID de usuario pegado.
