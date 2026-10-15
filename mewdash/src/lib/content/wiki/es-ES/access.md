---
title: Acceso al panel
slug: access
summary: Permite que miembros o roles concretos abran el panel de tu servidor y vean o gestionen solo las secciones que elijas, sin convertirlos en administradores de Discord.
icon: fa-key
category: Security
dashboard: /dashboard/access
tags: [dashboard access, permissions, grant, staff, restrict, who can edit, view, manage, managers, delegation, acceso al panel, permisos, conceder, staff, restringir, quién puede editar, ver, gestionar, gestores, delegación]
related: [auditlog, administration]
---

## Qué hace

De forma predeterminada, solo el propietario del servidor y los miembros con el permiso Administrador pueden abrir un servidor en el panel. Acceso al panel te permite ampliar eso. Eliges un miembro o un rol, decides a qué secciones del panel tiene acceso y si cada una es **Ver** o **Gestionar**. A partir de entonces, ese servidor aparece en su lista de servidores del panel y las secciones que has concedido funcionan para esa persona; todo lo demás se rechaza.

La comprobación se hace en la API del bot, no solo en la página web. Cada solicitud que menciona un servidor lleva la identidad del usuario con sesión iniciada. Si es el propietario o un Administrador, la solicitud pasa. Si no, el bot busca a qué sección pertenece la solicitud, trata las lecturas como **Ver** y cualquier cambio como **Gestionar**, y compara eso con el mejor nivel que tiene el usuario directamente o a través de cualquiera de sus roles.

El propietario del servidor también decide quién puede editar la propia lista de acceso. Por defecto, solo el propietario puede hacerlo. El propietario puede nombrar gestores de acceso concretos o activar un interruptor para permitir que cualquiera con Administrador o Gestionar servidor lo haga.

## Por qué usarlo

- Un equipo de la comunidad gestiona sorteos, sugerencias y tickets desde el panel sin tener Administrador en Discord.
- Un rol de moderador tiene **Gestionar** en Moderación y Registros y **Ver** en todo lo demás, así puede consultar pero no cambiar ajustes que no le corresponden.
- Un ayudante de confianza puede editar XP y Monedas, pero nada relacionado con la seguridad.
- El propietario delega el mantenimiento de la lista de acceso en un rol de copropietario sin ceder los controles exclusivos del propietario.

## Niveles de acceso

| Nivel | Permite |
| --- | --- |
| Ninguno | Nada para esa sección; la sección no está concedida |
| Ver | Solo solicitudes de lectura, como abrir la página y cargar sus datos |
| Gestionar | Todo lo que permite Ver, además de crear, editar y eliminar |

Cuando un miembro cumple más de una concesión, por ejemplo una concesión personal y una de rol, gana el nivel más alto de cada sección. Un miembro con al menos una sección concedida ve el servidor en su selector de servidores del panel; un miembro sin ninguna concesión no lo ve.

Los propietarios y Administradores se saltan las concesiones por completo y siempre tienen acceso total.

## Secciones

Las secciones coinciden con la barra lateral del panel. Cada función del selector se asigna a una o más áreas de la API del bot, así que conceder "Administración" cubre los endpoints de Administración y de Protección, y "Moderación" también cubre Protección. El selector agrupa las secciones por categoría de la barra lateral, y las funciones que son infraestructura global del bot y no datos de cada servidor, como Rendimiento, no se pueden conceder.

Cuando una concesión cubre una función asignada a varias áreas, el selector muestra el nivel más bajo que comparten; definir el grupo establece todas sus áreas a la vez.

## Quién puede gestionar la lista de acceso

| Quién | Puede hacer |
| --- | --- |
| Propietario del servidor | Todo: el interruptor de delegación, la lista de gestores y todas las concesiones |
| Gestores de acceso designados | Añadir, editar y quitar concesiones |
| Miembros con Administrador o Gestionar servidor | Añadir, editar y quitar concesiones, solo mientras el interruptor de delegación esté activado |
| Todos los demás | Ven «No puedes gestionar el acceso al panel aquí» |

Los gestores de acceso pueden ser un miembro o un rol. Solo el propietario puede ver o cambiar la lista de gestores y el interruptor de delegación; la API rechaza esas llamadas de cualquier otra persona.

> [!WARNING]
> No es posible conceder **Gestionar** sobre Acceso al panel, porque el controlador de acceso está exento de las comprobaciones de sección. Usa la lista de gestores o el interruptor de delegación para ceder el control de la lista.

## Ajustes

Todo está en la única página Acceso al panel.

| Ajuste | Predeterminado | Qué controla |
| --- | --- | --- |
| Permitir que administradores y miembros con Gestionar servidor gestionen el acceso al panel | Desactivado | En **Ajustes de delegación**. Cuando está activado, los miembros con Administrador y Gestionar servidor pueden editar las concesiones. Solo propietario. |
| Gestores de acceso | ninguno | Miembros o roles designados para editar concesiones. Solo propietario. |
| Concesiones de acceso | ninguno | Una entrada por miembro o rol, con un nivel por sección. Gestores y propietario. |

El formulario **Conceder acceso restringido** toma un tipo de destino (usuario o rol), el destino y un nivel por grupo de funciones. Guardar una segunda concesión para el mismo destino reemplaza la primera. Editar una concesión existente abre el mismo formulario como **Editar concesión de acceso**.

## Guía de configuración

1. Abre **Acceso al panel** en el panel como propietario del servidor.
2. Decide quién mantiene la lista. Activa el interruptor de delegación en **Ajustes de delegación**, o añade un miembro o rol en **Gestores de acceso**.
3. En **Conceder acceso restringido**, elige **Rol** y selecciona el rol de tu staff.
4. Pon **Gestionar** en las funciones que usan a diario y **Ver** en las que solo deben inspeccionar. Deja el resto en **Ninguno**.
5. Pulsa **Conceder acceso**. La concesión aparece en **Concesiones de acceso**.
6. Pide a un miembro con ese rol que inicie sesión en el panel. El servidor debería aparecer ahora en su lista, con solo las páginas concedidas funcionando.

## Comandos

El acceso al panel solo se configura desde el panel; no hay comandos del bot para ello.

## Consejos y trampas

- Las concesiones se comprueban con la lista de miembros en caché del bot, así que un miembro debe estar en el servidor y ser visible para el bot para que su concesión funcione.
- Las concesiones de rol siguen los roles actuales del miembro. Quitar el rol quita el acceso de inmediato.
- Una concesión con todas las secciones en **Ninguno** cuenta como sin concesión y se descarta, y el miembro pierde el servidor en su selector.
- Los Administradores mantienen acceso completo independientemente de lo que digan las concesiones. Para restringir a alguien, quítale primero el Administrador en Discord y luego concédele lo que necesite aquí.
- El proxy del panel adjunta una clave de API compartida a cada solicitud, pero esa clave por sí sola nunca concede acceso a un servidor; siempre se requiere la identidad del usuario con sesión iniciada.
- Los endpoints que no están ligados a un servidor, como la lista global de comandos, no están sujetos a las comprobaciones de sección y siguen funcionando para los usuarios restringidos.
