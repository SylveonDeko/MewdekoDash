---
title: Invitaciones
slug: invites
summary: Atribuye cada entrada a un código de invitación, al enlace personalizado o a una app, cuenta las invitaciones regulares, salidas, falsas y bonus de cada miembro, pon etiquetas a los códigos y consulta el crecimiento, la retención y el origen de las entradas a lo largo del tiempo.
icon: fa-users
category: Community
dashboard: /dashboard/invites
module: Utility
tags: [invites, invite tracking, inviter, who invited, referrals, recruitment, leaderboard, fake invites, bonus invites, retention, vanity, labels, analytics, mass ban, invitaciones, seguimiento de invitaciones, invitador, quién invitó, referidos, reclutamiento, clasificación, invitaciones falsas, invitaciones bonus, retención, URL personalizada, etiquetas, analíticas, baneo masivo]
related: [multigreets, statroles, liveboards, serverstats]
---

## Qué hace

Cuando alguien entra, el bot compara los enlaces de invitación del servidor antes y después de la entrada para averiguar cuál se usó, revisa la URL personalizada si ninguno coincide y registra cómo llegó el miembro: mediante la invitación de otro miembro, la URL personalizada, como bot añadido por OAuth, o de forma desconocida. El invitador recibe una invitación **regular** salvo que la entrada se marque como **falsa**. Cuando el miembro invitado se va, sube el contador de **salidas** del invitador. El personal puede dar invitaciones **bonus**. El total de un miembro es regulares menos salidas menos falsas, más bonus.

Cada entrada registrada se conserva, incluso después de que el miembro se vaya, así que la página puede mostrar la retención (cuántos miembros invitados siguen aquí), las reentradas y qué códigos traen gente que se queda.

## Por qué usarlo

- Organiza un concurso de reclutamiento y paga desde una clasificación que no se puede manipular con cuentas alternativas ni con bucles de entrar y salir.
- Comprueba si una campaña en Twitter, un servidor socio o un enlace de YouTube trae miembros que se quedan, poniendo una etiqueta a cada código.
- Muestra el invitador y el código en el mensaje de bienvenida.
- Encuentra y banea a todos los que trajo un mismo invitador cuando llega un raid a través de un único enlace.

## Cómo se atribuyen las entradas

- El bot necesita **Gestionar servidor** para leer la lista de invitaciones. Sin ese permiso no se registra nada.
- Las entradas se procesan de una en una por servidor. Cuando varias personas usan el mismo código entre dos comprobaciones, el excedente se recuerda y se acredita a las siguientes entradas, así que las ráfagas no se pierden.
- Una entrada por la URL personalizada se registra como **Vanity** sin invitador. Un bot añadido por OAuth se registra como **Bot**.
- Un código con etiqueta y con propietario acredita al propietario, no a quien creó la invitación. Así funcionan los enlaces personales de `invitelink`.

## Detección de falsas

Una entrada se marca como falsa, y el invitador recibe una invitación falsa en lugar de una regular, cuando se cumple cualquiera de estas condiciones:

| Motivo | Cuándo |
| --- | --- |
| Propia | El miembro usó su propia invitación |
| Cuenta nueva | La cuenta es más joven que la **Antigüedad mínima de la cuenta** (0 desactiva la comprobación) |
| Reentrada | El miembro ya se había unido antes y **Contar reentradas** está desactivado |
| Sin avatar | El miembro no tiene avatar y **Marcar miembros sin avatar** está activado |

Los invitadores en la **lista negra**, o que tengan un rol de la lista negra, siguen apareciendo como invitadores pero nunca ganan crédito. Los miembros de la lista de **ocultos** se siguen registrando, pero no aparecen en las clasificaciones.

## Pestañas del panel

| Pestaña | Qué muestra |
| --- | --- |
| Crecimiento | Entradas, salidas, crecimiento neto, retención, entradas falsas y orígenes de entrada del último día, semana, mes o de todos los tiempos, un gráfico de entradas y salidas, los principales invitadores y los códigos más usados |
| Clasificación | Todos los invitadores con sus números de regulares, salidas, falsas, bonus y retención, filtrados por periodo o rol, y exportables en CSV. Haz clic en una fila o elige un miembro para ver su desglose, añadir o quitar invitaciones regulares, bonus o falsas, o restablecerlo |
| Miembros | Todas las entradas registradas, filtradas por invitador, código o etiqueta, con cómo llegaron, si se marcaron como falsas y si siguen aquí. Exportable en CSV |
| Códigos y etiquetas | Todos los códigos de invitación del servidor con su creador, canal y usos. Pon una etiqueta a un código y, opcionalmente, un rol que reciban todos los que entren con él, o elimina el código |
| Ajustes | Seguimiento, quitar al salir, contar reentradas, marcar sin avatar, antigüedad mínima, el canal al que apuntan los enlaces personales, el canal de registro de entradas y salidas, las listas negras, los miembros ocultos, y las herramientas de importación y restablecimiento |

## Ajustes

| Ajuste | Por defecto | Qué controla |
| --- | --- | --- |
| Seguir invitaciones | activado | Si las entradas se atribuyen o no |
| Quitar crédito cuando los miembros se van | activado | Suma uno al contador de salidas del invitador, bajando su total, cuando un miembro invitado se va |
| Contar reentradas | activado | Si está desactivado, marca como invitación falsa a un miembro que ya se había unido antes |
| Marcar miembros sin avatar | desactivado | Las entradas de cuentas sin avatar cuentan como falsas |
| Antigüedad mínima de la cuenta | 0 días | Las cuentas más jóvenes que esto se marcan como falsas |
| Canal del enlace personal | canal del sistema | Adonde apuntan las invitaciones creadas con `invitelink` |
| Canal de registro de entradas y salidas | ninguno | Publica un embed en cada entrada y salida indicando quién invitó a quién, con el código, la antigüedad de la cuenta y cualquier marca de falsa |

**Importar usos desde Discord** sube el total regular de cada invitador hasta la suma de usos de sus códigos y nunca lo baja, así que es seguro volver a ejecutarlo tras un reinicio o una instalación nueva. **Restablecer invitadores que se fueron** borra el recuento de todos los que ya no están en el servidor. **Restablecer todo** borra todos los recuentos y el historial de entradas.

## Marcadores de saludo

Cualquier saludo puede usar estos marcadores una vez activado el seguimiento. Los valores desconocidos recurren a `Unknown` o `0`.

| Marcador | Valor |
| --- | --- |
| `%inviter.mention%`, `%inviter.username%`, `%inviter.id%`, `%inviter.avatar%` | El invitador acreditado |
| `%inviter.count%`, `%inviter.regular%`, `%inviter.left%`, `%inviter.fake%`, `%inviter.bonus%` | El recuento del invitador |
| `%invite.code%`, `%invite.url%`, `%invite.uses%`, `%invite.label%`, `%invite.type%`, `%invite.fake%` | La invitación que se usó |
| `%user.joincount%`, `%user.leavecount%` | Cuántas veces este miembro se ha unido y se ha ido |
| `%server.members.ordinal%` | El número de miembros como 1.º, 2.º, 1.204.º |
| `%user.joined.R%`, `%user.created.F%` y los demás estilos de marca de tiempo de Discord t, T, d, D, f, F, R | Fechas de entrada y de creación de la cuenta como marcas de tiempo en vivo |

## Comandos

Ejecuta estos comandos con el prefijo de tu servidor (`.` a menos que lo hayas cambiado). Todos los comandos también existen bajo `/invites`.

| Comando | Alias | Requiere | Función |
| --- | --- | --- | --- |
| `invites [@user]` | | Nadie | El total de un miembro con el desglose de regulares, salidas, falsas y bonus, y su posición |
| `whoinvited [@user]` | `invitedby` | Nadie | Quién invitó a un miembro, el código y si la entrada se marcó como falsa |
| `invitedusers [@user]` | `userinvites` | Nadie | Todos los que invitó un miembro, con fechas de entrada y marcas |
| `invitedbycode <code>` | | Nadie | Todos los que entraron con un código |
| `invitedbylabel <label>` | | Nadie | Todos los que entraron con un código con etiqueta |
| `inviteleaderboard [AllTime/Daily/Weekly/Monthly] [@role]` | `inviteslb` | Nadie | La clasificación de un periodo, opcionalmente de un solo rol |
| `invitestats [range]` | `growthstats` | Nadie | Entradas, salidas, neto, retención, entradas falsas, orígenes, principales invitadores y códigos |
| `invitecodes [@user]` | `mycodes` | Nadie | Los códigos de invitación de un miembro y sus usos |
| `invitelink` | `findlink`, `mylink` | Nadie | Tu enlace personal permanente, creado si no tienes uno |
| `addinvites`, `removeinvites`, `addbonusinvites`, `removebonusinvites`, `addfakeinvites`, `removefakeinvites <@user> <amount>` | | Gestionar servidor | Ajustar el recuento de un miembro |
| `resetinvites <@user>` o `resetinvites Server` o `resetinvites LeftMembers` | | Gestionar servidor; Administrador para todo el servidor | Restablecer recuentos |
| `syncinvites [@user]` | | Gestionar servidor | Importar usos desde Discord |
| `deleteinvite <code>` | `delinvite` | Gestionar servidor | Eliminar un código |
| `purgeinvites [maxUses] [#channel]` | | Gestionar servidor | Eliminar todos los códigos sin etiqueta usados como máximo esa cantidad de veces |
| `inviteblacklist <@user or @role>` | `invbl` | Gestionar servidor | Activar o desactivar si alguien puede ganar crédito |
| `invitehide <@user>` | `invhide` | Gestionar servidor | Activar o desactivar si alguien aparece en las clasificaciones |
| `inviteexclusions` | | Gestionar servidor | Listar las listas negras y los miembros ocultos |
| `invitelabelset <code> <label>`, `invitelabelrole <code> [@role]`, `invitelabelremove <code>`, `invitelabels` | | Gestionar servidor | Gestionar etiquetas |
| `inviteexport [range]`, `invitedexport [@user]` | | Gestionar servidor | Exportaciones en CSV |
| `invitemassban <@user> [reason]`, `invitemassbancode <code> [reason]` | | Banear miembros | Banear a todos los que siguen aquí y que fueron invitados por un miembro o mediante un código, tras confirmación |
| `invitesettings`, `toggleinvitetracking`, `toggleremoveinviteonleave`, `togglecountrejoins`, `togglefakenoavatar`, `setminaccountage <days>`, `invitelinkchannel [#channel]`, `invitelogchannel [#channel]` | | Gestionar servidor | Ajustes |

## Consejos y advertencias

- Los miembros que se unieron antes de activar el seguimiento, o mientras el bot estaba desconectado, no tienen registro de entrada. Ejecuta **Importar usos desde Discord** una vez para cargar los totales regulares con los recuentos propios de Discord.
- Las entradas falsas nunca bajan un total cuando el miembro se va; solo las regulares pasan a ser invitaciones de salida.
- Un miembro que se va y vuelve obtiene un nuevo registro de entrada. Con **Contar reentradas** activado, el invitador vuelve a ganar una invitación regular, lo que anula la invitación de salida anterior.
- La retención en la clasificación solo cuenta las entradas que el bot ha registrado, así que empieza en 100 % y se ajusta a medida que se acumula historial.
- Los roles de estadísticas pueden recompensar recuentos de invitaciones, y los tableros en vivo pueden fijar la clasificación de invitaciones en un canal.
