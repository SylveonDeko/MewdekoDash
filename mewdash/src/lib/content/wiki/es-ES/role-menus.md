---
title: Menús de roles
slug: role-menus
summary: Publica un mensaje con un menú desplegable o botones que los miembros usan para elegir sus propios roles.
icon: fa-list-ul
category: Actions
dashboard: /dashboard/role-menus
module: RoleMenus
tags: [role menus, self roles, dropdown, buttons, pronouns, colors, menús de roles, autoroles, roles propios, menú desplegable, botones, pronombres, colores]
related: [administration, embedbuilder, rolestates]
---

## Qué hace

Un menú de roles es un mensaje en un canal con un **menú desplegable** o una fila de **botones** debajo. Cada opción del menú otorga un rol. Los miembros eligen una opción para obtener el rol y vuelven a elegirla para quitárselo, así que un servidor puede dejar que la gente elija sus pronombres, colores, avisos o regiones sin pedírselo al staff.

Cada menú tiene un nombre (solo lo ve el staff, y es el título del mensaje por defecto), un canal, un mensaje y hasta 25 opciones. Una opción tiene un rol, el nombre que se muestra en el menú, un emoji opcional y una descripción opcional. Las descripciones aparecen bajo cada opción del menú desplegable y en el mensaje por defecto. Los botones también tienen color: azul, gris, verde o rojo.

El mensaje puede ser cualquier cosa que cree el constructor de embeds: texto simple, uno o varios embeds, o ambos. Si lo dejas vacío, el bot publica el nombre del menú con una línea para cada opción.

## Elegir varios o elegir uno

- **Elegir varios** permite a los miembros activar o desactivar cada rol. Dos límites controlan cuántos pueden tener: **Debe conservar al menos** evita que bajen de un número una vez han elegido, y **Puede tener como máximo** limita cuántos pueden tener del menú (sin límite por defecto).
- **Elegir uno** intercambia roles: al elegir una opción nueva se quita la que tenían. Activa **Mantener uno una vez elegido** y los miembros pueden cambiar, pero no pueden quitar su elección.

## Límites

| Límite | Valor |
| --- | --- |
| Menús por servidor | 50 |
| Opciones por menú | 25 |
| Botones por fila | 5 |
| Nombre del menú | 100 caracteres |
| Nombre en el menú | 80 caracteres |
| Descripción | 100 caracteres |
| Texto de ayuda del menú desplegable | 150 caracteres |
| Mensaje de texto simple | 2000 caracteres |

Cada rol solo puede aparecer una vez en un menú. El bot solo puede dar roles por debajo de su rol más alto que no esté gestionado por ninguna integración, y el staff solo puede ofrecer roles por debajo de su propio rol más alto.

## Rol requerido

Un menú puede exigir un rol. Los miembros que no lo tengan reciben una nota privada indicando que necesitan ese rol, y nada cambia.

## Confirmación

Con **Informar a los miembros de lo que cambió** activado, los miembros reciben una nota privada que solo ellos ven, con la lista de roles añadidos y quitados. Si está desactivado, el menú funciona en silencio, aunque los miembros siguen recibiendo una nota privada si algo sale mal, como alcanzar un límite o un rol que el bot no puede dar.

## Editar, pausar y volver a publicar

Guardar una edición reconstruye el mismo mensaje en su lugar. Un mensaje nuevo solo se publica cuando cambia el canal o cuando el mensaje antiguo ya no existe.

**Pausar** atenúa el menú desplegable o los botones en Discord hasta que el menú se reanude. **Publicar de nuevo** publica una copia nueva y elimina el mensaje antiguo, lo que ayuda cuando un menú ha quedado fuera de la vista o alguien lo ha borrado a mano. Si se elimina el canal de un menú, edítalo, elige un canal nuevo y guarda para publicarlo de nuevo.

Eliminar un menú también elimina su mensaje. Los miembros conservan los roles que ya habían elegido.

## Mover configuraciones antiguas

Las configuraciones antiguas de roles por emoji hacían que los miembros añadieran un emoji debajo de un mensaje para obtener un rol. La pestaña **Mover configuraciones antiguas** las enumera. Mover una crea un menú de roles con los mismos roles y emojis, como menú desplegable o botones, en el mismo canal o en otro. Puede copiar el texto y los embeds del mensaje antiguo, y puede retirar la configuración antigua, lo que la detiene y limpia sus emojis. Si el bot publicó el mensaje original, retirarla lo elimina. Una configuración en la que los miembros solo podían tener un rol se convierte en un menú de elegir uno.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `rolemenus` | Enumera todos los menús con su canal, tipo, número de opciones y estado. |
| `rolemenuinfo 3` | Muestra todo sobre un menú. |
| `rolemenucreate #roles dropdown @Role @Role` | Publica un menú nuevo con una opción por rol. |
| `rolemenuadd 3 @Role [emoji] [name]` | Añade un rol a un menú. |
| `rolemenuremove 3 @Role` | Quita un rol de un menú. |
| `rolemenuname 3 Pronouns` | Cambia el nombre de un menú. |
| `rolemenumessage 3 [message\|clear]` | Muestra, establece o borra el mensaje encima de un menú. |
| `rolemenustyle 3 dropdown\|buttons` | Cambia entre menú desplegable y botones. |
| `rolemenumode 3 multi\|exclusive` | Cambia entre elegir varios y elegir uno. |
| `rolemenulimits 3 0 2` | Establece cuántos roles deben conservar y pueden tener los miembros. |
| `rolemenurequire 3 [@Role]` | Establece o borra el rol requerido. |
| `rolemenureply 3 private\|silent` | Activa o desactiva la nota privada. |
| `rolemenupause 3` | Pausa un menú, o lo reanuda si ya está pausado. |
| `rolemenurepost 3 [#channel]` | Publica una copia nueva y elimina el mensaje antiguo. |
| `rolemenudelete 3` | Elimina un menú y su mensaje. |
| `rolemenuimport messageId [dropdown\|buttons]` | Mueve una configuración antigua de roles por emoji a un menú nuevo. |
