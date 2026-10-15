---
title: Registros de procesos
slug: process-logs
summary: Página del panel solo para propietarios del bot que enumera los procesos que pm2 ejecuta en el equipo del bot y permite leer, seguir, filtrar y descargar sus registros de consola.
icon: fa-rectangle-code
category: Analytics
dashboard: /owner/process-logs
tags: [pm2, logs, console, stdout, stderr, tail, process, crash, stack trace, owner, registros, consola, proceso, fallo, traza de pila, propietario]
related: [performance, analytics, leave-feedback]
---

## Qué hace

Registros de procesos muestra lo que el bot escribe en su consola, directamente desde los archivos de registro que pm2 guarda para él, sin abrir una shell en el servidor. Solo es visible para los propietarios del bot: la barra lateral lo oculta para todos los demás, abrir la URL directamente envía a los no propietarios al inicio del panel, y el propio bot rechaza las peticiones a menos que la cuenta con la que has iniciado sesión sea propietaria.

La página pide a la instancia del bot que has seleccionado su tabla de procesos de pm2. Se listan todos los procesos que pm2 gestiona en ese host, no solo el bot, con su estado, pid, tiempo activo, número de reinicios, CPU y memoria, y el tamaño de sus dos archivos de registro. Elige uno y la página carga las últimas centenas de líneas de su registro stdout, y luego sigue añadiendo líneas nuevas cada dos segundos mientras **Siguiendo** esté activado.

Las líneas conservan los colores que imprime Serilog, y cada línea se etiqueta con su nivel para que puedas ocultar el ruido. Las líneas de continuación, como las trazas de pila, se mantienen unidas a la línea de arriba, así que ocultar info no deja trazas huérfanas.

## Por qué usarlo

- El bot se reinició o falló y quieres ver lo último que dijo antes de caerse, que está en el lado de stderr.
- Un miembro reporta que un comando falla y quieres ver el registro en vivo mientras lo vuelve a intentar.
- Quieres buscar unos miles de líneas recientes por un id de servidor o un mensaje sin entrar por SSH.
- Necesitas el archivo de registro completo para un informe de error y quieres descargarlo.

## Controles

| Control | Qué hace |
| --- | --- |
| Tarjetas de proceso | Una por proceso de pm2 en el host. La tarjeta marcada como **este bot** es la instancia que responde a la petición. Haz clic en una para leer sus registros. |
| **stdout** / **stderr** | Cambia entre el registro de salida del proceso, donde va el registro normal, y su registro de errores, donde aparecen los fallos y los diagnósticos de ejecución. |
| **100** a **2k** | Cuántas líneas cargar al abrir o recargar el registro. El modo de seguimiento mantiene hasta 5000 en la página antes de empezar a descartar las más antiguas. |
| Cuadro de filtro | Oculta cada línea cuyo texto no contenga lo que escribiste. No distingue mayúsculas de minúsculas. |
| **Siguiendo** / **Seguir** | Activa o desactiva las actualizaciones en vivo. Mientras está activado, la página consulta nuevas líneas cada dos segundos y se desplaza con ellas, salvo que hayas subido el scroll. |
| **Ajustar** | Ajusta las líneas largas en lugar de desplazarlas hacia los lados. |
| **Copiar** | Copia las líneas visibles, sin colores, al portapapeles. |
| **Recargar** | Vuelve a leer la cola desde el archivo. |
| **Descargar** | Guarda el archivo de registro completo tal como está en disco, con los códigos de color. El tamaño junto a él es el tamaño actual del archivo. |
| Chips de nivel | **VRB**, **DBG**, **INF**, **WRN**, **ERR** y **FTL**, cada uno con un recuento de líneas etiquetadas cargadas. Haz clic en uno para ocultar o mostrar ese nivel. |

Cuando subes el scroll durante el seguimiento, las líneas nuevas se retienen y un botón en la esquina inferior derecha te indica cuántas están esperando. Haz clic en él para volver abajo y reanudar el desplazamiento con el registro.

> [!NOTE]
> Una sola lectura está limitada a 1 MB. Si las líneas que pediste no caben, la página te indica que se omitieron líneas más antiguas; descarga el archivo para verlo todo.

## Cómo encuentra el bot los registros

El bot ejecuta `pm2 jlist` en su propio host y lee las rutas de los archivos de registro que pm2 informa para cada proceso. Solo lo hace cuando ya hay un daemon de pm2 en ejecución para el mismo usuario, así que nunca inicia uno por accidente. Si pm2 está instalado pero no se puede consultar, la página recurre a los archivos del directorio de registros de pm2 y lo indica. Si no hay pm2 en absoluto, la página lo explica en lugar de mostrar una lista vacía.

En un panel conectado a varias instancias del bot, la lista de procesos pertenece a la instancia seleccionada, ya que cada instancia solo puede ver su propio host.

## Guía de configuración

1. Ejecuta el bot bajo pm2 en su servidor, por ejemplo `pm2 start dotnet --name mewdeko -- Mewdeko.dll`.
2. Inicia sesión en el panel con una cuenta de propietario del bot y abre **Registros de procesos** desde la barra lateral.
3. Elige el proceso marcado como **este bot**, o cualquier otro proceso del host.
4. Deja **Siguiendo** activado para ver el registro en vivo, o desactívalo y usa el filtro y los chips de nivel para revisar lo que está cargado.
5. Cambia a **stderr** después de un fallo para leer lo que imprimió el runtime antes de caerse.

## Consejos y advertencias

- Los registros se leen de archivos, así que un proceso iniciado fuera de pm2 no tiene registros aquí. La salida de consola del propio bot solo aparece si el bot se ejecuta bajo pm2.
- pm2 rota o trunca los archivos cuando ejecutas `pm2 flush` o usas `pm2-logrotate`. La página detecta que el archivo se ha reducido y recarga la cola por su cuenta.
- El filtro y los chips de nivel solo se aplican a las líneas ya cargadas. Carga más líneas o descarga el archivo para buscar más atrás.
- Nada en esta página cambia el bot. No hay forma de reiniciar procesos ni borrar registros desde aquí; eso lo cubren el comando de propietario `restartinstance` y `pm2 flush` en el servidor.
