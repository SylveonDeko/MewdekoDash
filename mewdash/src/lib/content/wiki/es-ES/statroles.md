---
title: Roles de estadísticas
slug: statroles
summary: Roles que los miembros ganan por estar activos durante un periodo y que pierden cuando dejan de estarlo, según umbrales, mejores posiciones, mejores porcentajes o rachas diarias de mensajes, voz, juegos, invitaciones, tiempo en el servidor o antigüedad de la cuenta.
icon: fa-trophy
category: Community
dashboard: /dashboard/statroles
module: StatRoles
tags: [stat roles, statroles, activity roles, active member role, inactive role, top chatter role, voice role, invite rewards, message rewards, streak, statbot, roles de estadísticas, roles de actividad, rol de miembro activo, rol de inactivo, rol de mayor charlatán, rol de voz, recompensas por invitaciones, recompensas por mensajes, racha, estadísticas]
related: [serverstats, xp, invites, liveboards]
---

## Qué hace

Los roles de nivel de XP son de un solo sentido: una vez ganados, se conservan para siempre. Un rol de estadísticas se reevalúa según una programación. Los miembros que cumplen la condición reciben el rol, y los que dejan de cumplirla lo pierden, así que un rol de "miembro activo" significa activo *ahora*. Hazlo permanente si quieres el comportamiento anterior, o invierte la condición para marcar a los miembros inactivos.

## Condiciones

Cada rol de estadísticas mide una cosa durante un periodo y aplica un límite.

| Medir | Qué se cuenta |
| --- | --- |
| Mensajes | Mensajes en el periodo, opcionalmente solo en los canales elegidos |
| Minutos de voz | Tiempo en voz durante el periodo, respetando los estados de voz que excluiste en Estadísticas de actividad |
| Minutos en un juego | Tiempo en un juego o app concreta, o en cualquiera, durante el periodo. Necesita el seguimiento de juegos activado |
| Invitaciones | El total neto de invitaciones del miembro |
| Días en el servidor | Desde que el miembro se unió |
| Antigüedad de la cuenta | Desde que se creó la cuenta |

| Límite | Quién cumple |
| --- | --- |
| Umbral | Entre un mínimo y un máximo opcional |
| Mejor rango | Clasificado entre dos posiciones, por ejemplo el top 10 |
| Mejor porcentaje | En el X por ciento superior de los miembros clasificados, por ejemplo el top 5 % |
| Racha diaria | Alcanza un mínimo por día en al menos N días dentro del periodo, por ejemplo 5 mensajes en 7 de los últimos 7 días |

El periodo va de 1 a 90 días, o de todo el tiempo para cualquier cosa que no sea una racha. Los empates comparten posición.

## Filtros y opciones

| Opción | Qué hace |
| --- | --- |
| Contar solo en los canales | Limita los mensajes o la voz a los canales elegidos |
| Roles requeridos | Un miembro necesita al menos uno para ser tenido en cuenta |
| Roles excluidos | Un miembro que tenga cualquiera de ellos nunca se tiene en cuenta |
| Miembros ignorados | Nunca se conceden ni se quitan a estos miembros |
| Grupo | Los roles de estadísticas que comparten grupo conservan solo el nivel más alto que cumple un miembro, así que Bronce, Plata y Oro no se acumulan |
| Permanente | Nunca se quita una vez ganado |
| Invertir | Los miembros que *no* cumplen reciben el rol |
| Incluir bots | Tener en cuenta las cuentas de bots |
| Evaluar cada | Con qué frecuencia se ejecuta la regla, como mínimo cada 10 minutos, cada 3 horas por defecto |
| Anunciar en / enviar MD al miembro | Publica un mensaje cuando se concede o se quita el rol, usando `%user%`, `%role%`, `%action%` (obtenido o perdido), `%value%` y `%stat%` |

## Panel

La pestaña **Roles de estadísticas** enumera todas las reglas con su condición, programación y última ejecución, y te permite activar, desactivar, editar, eliminar, **previsualizar** o **ejecutar** cada una. Una vista previa muestra quién ganaría y quién perdería el rol sin cambiar nada. Ejecutar la aplica de inmediato; las ejecuciones manuales están limitadas a una cada diez minutos por servidor.

La pestaña **Crear / Editar** es el formulario para todo lo anterior.

## Comandos

Ejecuta estos comandos con el prefijo de tu servidor (`.` a menos que lo hayas cambiado). Todos los comandos también existen bajo `/statrole`.

| Comando | Alias | Requiere | Función |
| --- | --- | --- | --- |
| `statroleadd <@role> <stat> <minimum> [days] [name]` | `sradd` | Gestionar roles | Una regla de umbral |
| `statroletop <@role> <stat> <topEnd> [days] [name]` | `srtop` | Gestionar roles | Una regla de mejor rango para los puestos del 1 al topEnd |
| `statrolepercent <@role> <stat> <percent> [days] [name]` | `srpercent` | Gestionar roles | Una regla de mejor porcentaje |
| `statrolestreak <@role> <stat> <perDay> <requiredDays> [days] [name]` | `srstreak` | Gestionar roles | Una regla de racha diaria |
| `statrolelist` | `statroles` | Nadie | Todas las reglas |
| `statroleinfo <id>` | `srinfo` | Nadie | Una regla completa |
| `statroleset <id> <setting> <value>` | `srset` | Gestionar roles | Cambia name, min, max, lookback, topstart, topend, days, permanent, invert, bots, group, interval, notifychannel, notifydm, message o activity |
| `statrolefilter <id> <#channel, @role [true], or @user>` | `srfilter` | Gestionar roles | Activa o desactiva un filtro de canal, un rol requerido (o un rol excluido con `true`), o un miembro ignorado |
| `statroletoggle <id>` | `srtoggle` | Gestionar roles | Activa o desactiva |
| `statrolepreview <id>` | `srpreview` | Gestionar roles | Quién ganaría y quién perdería |
| `statrolerun <id>` | `srrun` | Gestionar roles | Aplica ahora |
| `statroleremove <id>` | `srremove` | Gestionar roles | Elimina la regla; los miembros conservan lo que tienen |

## Consejos y advertencias

- El rol más alto del bot debe estar por encima del rol gestionado, y necesita el permiso Gestionar roles.
- Cada rol de Discord solo puede ser gestionado por un rol de estadísticas. Elimina la regla anterior antes de asignar otra al mismo rol.
- Una regla con un mínimo de 0 y sin máximo afectaría a todos; ponle un máximo o usa la inversión a propósito.
- Los miembros que han desactivado las estadísticas de actividad no tienen mensajes, voz ni tiempo de juego, así que nunca cumplen esas medidas.
- Previsualiza antes de activar una regla en un servidor grande. Los cambios de roles se espacian para respetar los límites de frecuencia, así que una regla que afecta a miles de miembros tarda unos minutos en aplicarse.
