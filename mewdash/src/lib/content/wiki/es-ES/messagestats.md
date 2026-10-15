---
title: Estadísticas de mensajes
slug: messagestats
summary: Cuenta cuántos mensajes envía cada miembro en cada canal y consulta clasificaciones, desgloses por usuario y por canal, y gráficos de las horas y días más activos.
icon: fa-envelope
category: Analytics
dashboard: /dashboard/messagestats
module: Utility
tags: [message stats, message count, activity, leaderboard, top users, analytics, busiest hours, activity graph, estadísticas de mensajes, recuento de mensajes, actividad, clasificación, mejores usuarios, analíticas, horas más activas, gráfico de actividad]
related: [xp, utility, statchannels]
---

## Qué hace

Una vez activado el recuento de mensajes, el bot registra un recuento por miembro y por canal cada vez que una persona publica un mensaje que cumple la longitud mínima. No se guarda nada sobre el contenido, solo quién lo publicó, dónde y cuándo. Los recuentos se encolan y se escriben en la base de datos por lotes para que los servidores muy activos no ralenticen el bot.

Los miembros pueden pedir sus propios totales con `usermessages`, ver qué canal es el más activo con `channelmessages`, o consultar todo el servidor con `servermessages`. `topusers` muestra una clasificación de los diez primeros con la proporción de mensajes de cada miembro. `activitygraph` genera una imagen de gráfico de barras con los días de la semana o las horas del día más activos.

El panel muestra los mismos números con gráficos, y permite al staff activar o desactivar el recuento, restablecer los recuentos y exportar los datos en CSV o JSON.

## Por qué usarlo

- Encuentra a tus miembros más activos para recompensas, roles o reclutamiento de moderadores.
- Mira qué canales están muertos y cuáles prosperan antes de reorganizar el servidor.
- Elige horarios para eventos usando el gráfico de horas más activas en tu propia zona horaria.
- Detecta bots y cuentas de spam comparando los recuentos de mensajes con la calidad de los mensajes.

## Qué se cuenta

| Regla | Comportamiento |
| --- | --- |
| Recuento activado | No se registra nada hasta que se active `togglemsgcount` o el interruptor del panel |
| Bots | Nunca se cuentan |
| MD | Nunca se cuentan; solo los canales del servidor |
| Longitud mínima | Los mensajes más cortos que **longitud mínima del mensaje** caracteres se omiten; el valor predeterminado es 0, así que todo cuenta |
| Marcas de tiempo | Las horas de los mensajes se guardan durante 90 días para alimentar los gráficos por hora y por día; los totales se guardan indefinidamente |

La longitud mínima admite valores de hasta 4098. Ejecutar `minmsglength` sin número muestra el valor actual.

## Gráficos de actividad

`activitygraph days` necesita datos de los siete días de la semana y mira las últimas cuatro semanas. `activitygraph hours` necesita datos de las 24 horas durante los últimos siete días. Para el gráfico por horas, el bot te pide primero que elijas una zona horaria, ofreciendo una lista de zonas comunes, aceptando cualquier nombre de zona IANA, y cancelando si no respondes. El gráfico se publica como PNG.

## Ajustes

La página Estadísticas de mensajes tiene dos pestañas principales, **Estadísticas** y **Gestión**. Estadísticas contiene **Resumen**, **Mejores usuarios** y **Mejores canales**. Gestión contiene **Ajustes** y **Exportar datos**.

| Ajuste | Predeterminado | Qué controla |
| --- | --- | --- |
| Activar recuento de mensajes | Desactivado | Si se registran los mensajes nuevos |
| Longitud mínima del mensaje | 0 | Control deslizante de 0 a 4098; el mensaje más corto que cuenta |
| Restablecer recuentos de mensajes | | **Restablecer todos los recuentos del servidor** elimina todos los recuentos guardados del servidor tras confirmar |
| Formato de exportación | CSV | Descarga en CSV o JSON de las estadísticas cargadas |
| Incluir estadísticas de usuarios | Activado | Añade las filas de los mejores usuarios a la exportación |
| Incluir estadísticas de canales | Activado | Añade las filas de los mejores canales a la exportación |
| Incluir desglose por horas | Desactivado | Añade las filas de las horas y los días más activos a la exportación |

La pestaña **Resumen** muestra las tarjetas **Mensajes diarios**, **Total de mensajes**, **Última actualización** y **Estado**, el usuario y el canal menos activos, un gráfico de **Actividad en 24 horas** y un gráfico de **Tendencia semanal**. **Mejores usuarios** lista los **Usuarios con más mensajes**, y **Mejores canales** lista los **Canales más activos**.

> [!NOTE]
> La exportación se crea en tu navegador a partir de las estadísticas que ya están cargadas en la página. Las fechas de inicio y fin que introduces se escriben en la cabecera del archivo, pero no filtran las filas.

## Guía de configuración

1. Abre **Estadísticas de mensajes** en el panel, ve a **Gestión** y luego a **Ajustes**.
2. Activa **Activar recuento de mensajes**.
3. Opcionalmente, pon **Longitud mínima del mensaje** en 5, o ejecuta `minmsglength 5` en Discord, para ignorar las respuestas de un solo carácter.
4. Deja que el servidor charle durante un día y luego revisa **Estadísticas** para ver las primeras cifras.
5. Pasada una semana, ejecuta `activitygraph hours` y elige tu zona horaria para ver cuándo está más activo el servidor.

## Comandos

Usa estos comandos con el prefijo de tu servidor (`.` a menos que lo hayas cambiado).

| Comando | Alias | Requiere | Función |
| --- | --- | --- | --- |
| `usermessages [@user]` | `usermsg`, `umsg` | Nadie | Total, canal más y menos activo para ti o para otro miembro |
| `channelmessages [#channel]` | `channelmsg`, `cmsg` | Nadie | Total, miembro más y menos activo en un canal |
| `servermessages` | `servermsg`, `smsg`, `guildmessages`, `guildmsg` | Nadie | Total del servidor con el miembro y el canal más y menos activos |
| `topusers` | `topu` | Nadie | Los diez miembros principales por número de mensajes, con porcentajes |
| `activitygraph [days or hours]` | `actgraph` | Nadie | Gráfico de barras de los días u horas más activos; por defecto, días |
| `minmsglength [number]` | `mmlength`, `minmlength` | Gestionar servidor | Muestra o define la longitud mínima para que un mensaje cuente |
| `togglemsgcount` | `togglemessagecount` | Administrador | Activa o desactiva el recuento |
| `resetmessagecounts [@user] [#channel]` | `rmc`, `resetmsgcounts`, `resetmessages`, `resetcounts` | Gestionar mensajes | Restablece los recuentos de todo el servidor, de un miembro, de un canal o de un miembro en un canal, tras confirmar |

## Consejos y trampas

- El recuento solo empieza desde el momento en que se activa. Los mensajes enviados antes nunca se añaden retroactivamente.
- Todos los comandos de estadísticas y el panel muestran «desactivado» hasta que el recuento esté activado, aunque existan datos antiguos.
- Los recuentos se escriben por lotes de hasta 100 eventos, así que un total puede ir unos segundos por detrás del chat en directo.
- Eliminar un canal no elimina sus recuentos. Usa `resetmessagecounts #channel` antes de borrar el canal si quieres que desaparezcan.
- El gráfico por horas es tan preciso como la zona horaria que elijas. Guarda la zona del servidor con el comando de zona horaria de Administración para que sea coherente entre el staff.
- El sistema de XP tiene su propio seguimiento de actividad y no usa estos recuentos.
