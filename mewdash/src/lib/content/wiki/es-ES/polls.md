---
title: Encuestas
slug: polls
summary: Publica encuestas con botones en un canal, restringe quién puede votar, prográmalas con antelación, reutiliza plantillas y revisa los resultados.
icon: fa-chart-simple
category: Community
dashboard: /dashboard/polls
module: Games
tags: [poll, vote, survey, question, yes no, multiple choice, anonymous, scheduled poll, poll template, encuesta, votación, sondeo, pregunta, sí o no, opción múltiple, anónima, encuesta programada, plantilla de encuesta]
related: [votes, games]
---

## Qué hace

El personal publica una pregunta con de dos a veinticinco opciones. El bot envía un embed con un botón por opción, o un menú de selección cuando hay más de cinco, y los miembros votan haciendo clic. El embed muestra el recuento y el porcentaje en vivo de cada opción. Debajo de las opciones hay tres botones de gestión: **Estadísticas**, **Cerrar** y **Eliminar**.

Los miembros pueden cambiar su voto haciendo clic en otra opción, o quitarlo haciendo clic de nuevo en la misma, salvo que los cambios de voto estén desactivados para esa encuesta. Cada respuesta del bot a un clic es privada para quien votó, así que el canal se mantiene limpio.

Las encuestas se pueden cerrar a mano, pueden caducar por sí solas tras una duración determinada, y pueden programarse para publicarse en una fecha posterior. Las plantillas guardan una pregunta y sus opciones para volver a publicar la misma encuesta con un solo comando. El panel añade analíticas, exportación en CSV y JSON, y la comparación lado a lado de encuestas.

## Por qué usarlo

- Elegir una fecha o un juego para el próximo evento de la comunidad.
- Hacer una comprobación rápida de sí o no antes de cambiar una norma.
- Hacer una pregunta delicada de forma anónima para que nadie vea quién votó qué.
- Permitir que solo voten un rol de staff o un rol de booster en las decisiones que les afectan.
- Publicar la misma encuesta semanal cada lunes desde una plantilla, o programarla con antelación.

## Tipos de encuesta

| Tipo | Cómo se vota |
| --- | --- |
| Sí / No | Dos opciones fijas, Sí y No. Se crea con `poll` y `/poll yesno`. |
| Opción única | Una opción por miembro. Es el valor por defecto de `pollc`, las plantillas y el panel. |
| Opción múltiple | Los miembros pueden elegir varias opciones. Con seis o más opciones, el menú de selección permite la selección múltiple. |
| Anónima | Los votos se guardan sin mostrar quién votó en las estadísticas ni en las exportaciones. |
| Restringida por rol | Solo pueden votar los miembros que tengan alguno de los roles permitidos. Los demás reciben una respuesta privada de «no permitido». Solo desde el panel. |

Cada encuesta también tiene estos interruptores individuales, todos activados por defecto: **Permitir cambiar el voto**, **Mostrar resultados en vivo** y **Mostrar barras de progreso**.

## Votación, cierre y caducidad

- Un voto en una encuesta cerrada o caducada se rechaza con un mensaje privado.
- Si los cambios de voto están desactivados, un segundo clic se rechaza con el mensaje «ya has votado».
- Los botones **Cerrar** y **Eliminar** funcionan para quien creó la encuesta y para cualquiera con el permiso Gestionar mensajes. Eliminar pide que escribas `DELETE` en un formulario de confirmación, y después borra la encuesta y su mensaje.
- **Estadísticas** muestra el total de votos, los votantes únicos y el desglose por opción, de forma privada para quien hizo clic.
- La caducidad se comprueba cada cinco minutos. Cuando una encuesta caduca, sus botones se eliminan y el pie cambia para indicar que ha caducado.
- Las encuestas programadas se comprueban cada minuto. Una encuesta programada debe ser futura y estar a no más de treinta días. Puede tener una duración en minutos, después de la cual la encuesta publicada caduca.

## Plantillas

Una plantilla guarda un nombre, una pregunta y sus opciones. `polltemplate <name>` publica la plantilla como una encuesta de opción única. Las plantillas se listan con `polltemplates`, se crean y eliminan con `/poll create-template` y `/poll delete-template`, o se gestionan en la pestaña **Plantillas** del panel, que también permite exportarlas e importarlas como archivo. Una plantilla admite como máximo veinticinco opciones.

## Ajustes

La página de Encuestas tiene cinco pestañas: **Encuestas**, **Crear**, **Programadas**, **Plantillas** y **Analíticas**.

| Ajuste | Por defecto | Qué controla |
| --- | --- | --- |
| Pregunta | ninguna | El título de la encuesta |
| Tipo de encuesta | Opción única | Uno de los cinco tipos de arriba |
| Canal | ninguno | Dónde se publica la encuesta |
| Opciones | dos en blanco | De dos a veinticinco opciones, cada una de hasta 100 caracteres. Oculto para Sí / No |
| Roles que pueden votar | ninguno | Visible en las encuestas restringidas por rol |
| Duración (minutos) | abierta hasta que se cierre | De 1 a 20160 minutos. Se aplica al programar la encuesta |
| Programar para más tarde | ninguna | Una fecha y hora. Déjalo vacío para publicar ahora |
| Permitir cambiar el voto | activado | Si un miembro puede cambiar o quitar su voto |
| Mostrar resultados en vivo | activado | Si los recuentos se muestran mientras la encuesta está abierta |
| Mostrar barras de progreso | activado | Si se dibujan barras junto a los recuentos |
| Guardar también como plantilla | desactivado | Guarda la pregunta y las opciones con el **Nombre de la plantilla** |

La pestaña **Encuestas** lista las encuestas con una casilla **Incluir encuestas cerradas**. Al expandir una encuesta se muestran los votantes únicos, la participación, la hora punta y la hora de creación, y se ofrece **Cerrar encuesta**. **Programadas** te permite **Cancelar encuesta** de una pendiente. **Analíticas** muestra las encuestas de este mes, los votos emitidos, la media de votos por encuesta, el tipo favorito y un gráfico de encuestas por día.

## Configuración paso a paso

1. Abre **Encuestas** en el panel y ve a la pestaña **Crear**.
2. Escribe la **Pregunta**, elige un **Tipo de encuesta** y el **Canal**.
3. Rellena las **Opciones**. Usa el botón de eliminar para quitar las sobrantes; se necesitan al menos dos.
4. En una encuesta restringida por rol, elige los **Roles que pueden votar**.
5. Opcionalmente, marca **Guardar también como plantilla** y ponle un nombre.
6. Pulsa el botón de enviar. La encuesta se publica de inmediato, o queda en cola en la pestaña **Programadas** si pusiste una hora.
7. Sigue los resultados en la pestaña **Encuestas** y luego pulsa **Cerrar encuesta** cuando termines.

> [!TIP]
> Para una votación rápida en el canal no necesitas el panel. `poll Should we add a movie night?` publica una encuesta Sí / No en segundos.

## Comandos

Ejecuta estos comandos con el prefijo de tu servidor (`.` a menos que lo hayas cambiado).

| Comando | Alias | Requiere | Función |
| --- | --- | --- | --- |
| `poll <question>` | `ppoll` | Gestionar mensajes | Publicar una encuesta Sí / No |
| `pollc <question;option1;option2;...>` | | Gestionar mensajes | Publicar una encuesta de opción única con de dos a veinticinco opciones |
| `pollm <question;option1;option2;...>` | | Gestionar mensajes | Publicar una encuesta de opción múltiple |
| `polla <question;option1;option2;...>` | | Gestionar mensajes | Publicar una encuesta anónima |
| `polltemplate <name>` | `ptemplate` | Gestionar mensajes | Publicar una encuesta desde una plantilla guardada |
| `polltemplates` | `ptemplates` | Nadie | Listar las plantillas del servidor |

Los comandos de barra bajo `/poll` añaden `create` (hasta diez opciones, con los interruptores de anónima y de opción múltiple), `close`, `stats`, `list`, `create-template` y `delete-template`. `close`, `create-template` y `delete-template` requieren el permiso Gestionar mensajes.

## Consejos y advertencias

- El bot necesita Enviar mensajes e Insertar enlaces en el canal de encuestas. Los comandos de texto también borran tu mensaje de comando, lo que requiere que el bot tenga el permiso Gestionar mensajes.
- Las opciones se separan por punto y coma, así que una opción no puede contener ninguno.
- Las etiquetas de los botones muestran el texto de la opción solo si tiene doce caracteres o menos; las opciones más largas muestran solo su número, con el texto completo en el embed.
- La duración la aplica el programador. Una encuesta publicada de inmediato permanece abierta hasta que alguien la cierre, así que prográmala con un minuto de antelación si necesitas una caducidad automática.
- Una encuesta cerrada se puede ver y exportar desde el panel marcando **Incluir encuestas cerradas**; una encuesta eliminada desaparece.
- Las encuestas restringidas por rol comprueban los roles en el momento de votar, así que los miembros que pierdan el rol ya no podrán votar, pero su voto anterior se mantiene.
