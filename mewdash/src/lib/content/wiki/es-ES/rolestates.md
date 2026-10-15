---
title: Estados de roles
slug: rolestates
summary: Recuerda los roles que tenía un miembro cuando salió del servidor y devuélvelos automáticamente cuando vuelva a entrar.
icon: fa-tag
category: Actions
dashboard: /dashboard/rolestates
module: RoleStates
tags: [role states, role persistence, restore roles, rejoin, saved roles, role backup, transfer roles, estados de roles, persistencia de roles, restaurar roles, reentrada, roles guardados, copia de seguridad de roles, transferir roles]
related: [administration, statusroles]
---

## Qué hace

Cuando los Estados de roles están activados, el bot vigila las salidas de miembros. En el momento en que alguien se va, registra la lista de roles que tenía en ese momento. Si esa persona vuelve a entrar más tarde, el bot le añade de nuevo todos los roles guardados, así que no tiene que pedir al personal que la vuelvan a verificar o a asignar roles.

Desde el punto de vista del miembro, nada cambia al salir. Al volver a entrar, sus roles simplemente están ahí de nuevo, normalmente antes de que termine de leer el canal de bienvenida.

El personal obtiene una lista de roles guardados por miembro que puede revisar, editar o eliminar, una lista de exclusión para los roles que nunca deben restaurarse y una acción masiva de «guardar a todos ahora», para que la función también cubra a los miembros que ya estaban en el servidor antes de activarla.

## Por qué usarlo

- Los miembros verificados que se van por error, o para silenciar notificaciones, vuelven sin perder acceso.
- Los roles de color, de mención y de afición elegidos desde un menú de roles por reacción sobreviven a una reentrada.
- Los servidores con un proceso de verificación manual evitan volver a comprobar a personas que ya fueron aprobadas.
- Puedes elegir a mano los roles que nunca deben volver, como un rol de silencio temporal o un rol de staff.
- Mudanza de una comunidad a un servidor nuevo: los estados de roles pueden transferirse y emparejarse con roles que tengan los mismos nombres.

## Cómo se guarda un estado de roles

Cuando un miembro se va, el bot comprueba:

1. Que los Estados de roles estén activados en el servidor.
2. Que **Ignorar bots** esté desactivado, o que el miembro no sea un bot.
3. Que el miembro no esté en la lista de **Usuarios denegados**.

Si todo eso se cumple, toma los roles actuales del miembro, quita el rol `@everyone` y cualquier rol gestionado (roles de bots, rol de booster, roles de integraciones), y después elimina lo que esté en la lista de **Roles denegados**. Si no queda nada, no se guarda nada. En caso contrario, la nueva lista reemplaza lo que se hubiera guardado antes para ese miembro.

Los baneos se gestionan por separado. Con **Borrar al banear** activado, banear a un miembro elimina su estado guardado, así que desbanearlo y que vuelva a entrar no restaura nada.

## Cómo se restaura un estado de roles

Al entrar, el bot vuelve a comprobar que el módulo esté activado, que no se estén ignorando los bots (si el miembro es un bot) y que el usuario no esté en la lista de denegados. Después añade todos los roles guardados en una sola petición. Los roles que ya no existen o que están por encima del rol más alto del bot hacen que esa petición falle, y el fallo solo se registra.

> [!PERMISSION]
> El bot necesita el permiso Gestionar roles, y su rol más alto debe estar por encima de todos los roles que se espera que devuelva.

### Omitir roles de autoasignación

Si también usas roles de autoasignación del módulo de Administración, un miembro que regresa normalmente recibiría tanto los roles guardados como los de autoasignación. Activar **Omitir autoasignación** con `togglerolestatesskipautoassign` hace que el bot omita los roles de autoasignación para cualquiera que tenga un estado de roles guardado, así que los miembros que regresan solo reciben lo que tenían antes. Este ajuste es solo por comando; no aparece en el panel.

## Gestionar los estados guardados a mano

El personal puede crear o ajustar el estado de un miembro sin esperar a que se vaya:

- `setuserrolestate` reemplaza la lista guardada de un miembro por los roles que indiques. Se eliminan los roles gestionados y `@everyone`.
- `addrolestorolestate` y `removerolesfromrolestate` modifican una lista guardada existente.
- `deleteuserrolestate` olvida por completo a un miembro.
- `saveallrolestates` toma una instantánea de todos los miembros actuales a la vez, aplicando los mismos filtros de bots y denegados que un guardado automático.

El panel añade algo que los comandos no tienen: **Copiar estado de roles**, que toma los roles guardados de un miembro y los aplica directamente a otro miembro que esté ahora en el servidor.

## Transferir a otro servidor

`transferrolestates <serverId>` copia todos los estados guardados del servidor actual a otro servidor en el que esté el bot. Los roles se emparejan por nombre, sin distinguir mayúsculas, y los roles gestionados se omiten. Los miembros cuyos roles guardados no tengan coincidencia por nombre en el servidor destino se omiten. El servidor destino tiene los Estados de roles activados automáticamente si no lo estaban, y hereda los valores de **Ignorar bots** y **Borrar al banear** del origen cuando no tiene ajustes propios.

## Ajustes

La pestaña **Ajustes** de la página de Estados de roles tiene dos subpestañas, **General** y **Lista de denegados**.

| Ajuste | Por defecto | Qué controla |
| --- | --- | --- |
| Estados de roles | Desactivado | Interruptor general para guardar y restaurar |
| Borrar al banear | Desactivado | Elimina el estado guardado de un miembro cuando se le banea |
| Ignorar bots | Desactivado | No guardar ni restaurar roles de cuentas de bots |
| Guardar estados actuales | botón | Toma una instantánea de los roles de todos los miembros actuales ahora |
| Roles denegados | ninguno | Roles que nunca se guardan y, por tanto, nunca se restauran |
| Usuarios denegados | ninguno | Miembros cuyos roles nunca se guardan ni se restauran |

La pestaña **Gestión** contiene **Gestionar roles de usuario** (añadir o quitar roles seleccionados del estado guardado de un miembro) y **Copiar estado de roles**. La pestaña **Estados de roles** muestra todos los estados guardados con el nombre, el ID y los roles de cada miembro, y permite ver los detalles o eliminar una entrada.

## Configuración paso a paso

1. Asegúrate de que el rol del bot esté por encima de todos los roles que quieras que restaure.
2. Abre **Estados de roles** en el panel y activa **Estados de roles** en **Ajustes**, **General**.
3. Activa **Ignorar bots** a menos que quieras recordar específicamente los roles de los bots.
4. Decide sobre **Borrar al banear**. Déjalo desactivado si quieres que los miembros desbaneados recuperen sus roles.
5. En **Lista de denegados**, añade los roles de staff, los roles de castigo y cualquier rol temporal a **Roles denegados**.
6. Pulsa **Guardar todo** en **Guardar estados actuales** para que los miembros existentes queden cubiertos desde hoy.
7. Revisa la pestaña **Estados de roles** para confirmar que la instantánea se ha llenado.

## Comandos

Ejecuta estos comandos con el prefijo de tu servidor (`.` a menos que lo hayas cambiado). Todos los comandos de este módulo requieren Administrador.

| Comando | Alias | Requiere | Función |
| --- | --- | --- | --- |
| `togglerolestates` | `trs` | Administrador | Activar o desactivar los Estados de roles |
| `viewrolestatessettings` | `vrss` | Administrador | Mostrar los ajustes actuales y las listas de denegados |
| `viewuserrolestates` | `viewrolestates`, `vurs` | Administrador | Recorrer todos los estados guardados por páginas |
| `saveallrolestates` | `saveserverstates`, `backuprolestates` | Administrador | Tomar una instantánea de todos los miembros actuales |
| `transferrolestates <serverId>` | `copyrolestates`, `moverolestates` | Administrador | Copiar los estados a otro servidor, emparejando roles por nombre |
| `togglerolestatesignorebots` | `trsib` | Administrador | Activar o desactivar ignorar cuentas de bots |
| `togglerolestatesclearonban` | `trscob` | Administrador | Activar o desactivar borrar el estado al banear |
| `togglerolestatesskipautoassign` | `trssaa`, `rsskipautoassign` | Administrador | Activar o desactivar omitir roles de autoasignación para miembros con un estado guardado |
| `rolestatesadddenyrole @role...` | `rsadr` | Administrador | Añadir roles a la lista de denegados |
| `rolestatesremovedenyrole @role...` | `rsrra` | Administrador | Quitar roles de la lista de denegados |
| `rolestatesadddenyuser @user...` | `rsadu` | Administrador | Añadir miembros a la lista de denegados |
| `rolestatesremovedenyuser @user...` | `rolestatesremoveadduser`, `rsrau` | Administrador | Quitar miembros de la lista de denegados |
| `setuserrolestate @user @role...` | `surs` | Administrador | Reemplazar los roles guardados de un miembro |
| `addrolestorolestate @user @role...` | `arsrs` | Administrador | Añadir roles al estado guardado de un miembro |
| `removerolesfromrolestate @user @role...` | `rrfrs` | Administrador | Quitar roles del estado guardado de un miembro |
| `deleteuserrolestate @user` | `dur` | Administrador | Olvidar el estado guardado de un miembro |

Los equivalentes de barra están bajo `/rolestates`.

## Consejos y advertencias

- Nada se guarda para los miembros que ya estaban en el servidor cuando activaste la función hasta que se vayan, o hasta que ejecutes **Guardar todo**. Ejecútalo una vez justo después de la configuración.
- Solo las salidas activan un guardado. Las expulsiones cuentan como salidas. Los baneos también cuentan como salidas, y el estado se elimina de nuevo si **Borrar al banear** está activado.
- La restauración usa una única llamada para añadir roles. Un rol que falte o que esté demasiado alto hace que toda la restauración falle en silencio, así que mantén actualizada la lista de denegados cuando borres o reordenes roles.
- Los roles gestionados (roles de integraciones de bots, el rol de booster) nunca se guardan. Discord los asigna por sí mismo.
- `viewuserrolestates` muestra tres miembros por página.
- Tanto `setuserrolestate` como `deleteuserrolestate` aceptan a un usuario que ya se ha ido, así que puedes corregir un estado antes de que alguien vuelva a entrar.
- Los Usuarios denegados solo afectan a los guardados y restauraciones automáticos. Los comandos manuales y **Copiar estado de roles** siguen funcionando con esos miembros.
