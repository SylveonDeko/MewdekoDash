---
title: Formularios
slug: forms
summary: Crea solicitudes, encuestas, apelaciones de ban y solicitudes de ingreso en el panel, recoge respuestas mediante un enlace compartible y apruébalas o recházalas desde Discord o la cola de respuestas.
icon: fa-clipboard
category: Community
dashboard: /dashboard/forms
module: Forms
tags: [forms, application, survey, questionnaire, ban appeal, join application, review, approve, reject, responses, csv, formularios, solicitud, encuesta, cuestionario, apelación de ban, solicitud de ingreso, revisión, aprobar, rechazar, respuestas]
related: [administration, moderation, rolestates]
---

## Qué hace

El personal crea un formulario en el panel: un nombre, un conjunto de preguntas y reglas sobre quién puede responder y qué ocurre después. Al publicarlo se genera un enlace permanente para compartir. Un miembro abre el enlace, inicia sesión con Discord, rellena las preguntas página a página, revisa sus respuestas y las envía. Su progreso se guarda como borrador mientras escribe, así que puede volver más tarde.

Cada envío se publica como un embed en el canal que elijas, con botones **Aprobar** y **Rechazar** si el formulario necesita una decisión. Los revisores pulsan un botón en Discord o usan la pestaña **Respuestas** del panel. Quien envía recibe un MD con la decisión y las notas, y puede seguirla en cualquier momento en una página de estado.

Los formularios son de tres tipos. Un formulario normal es para miembros. Un formulario de apelación de ban es para personas que están baneadas en ese momento, y aprobarlo les quita el ban. Una solicitud de ingreso es para personas ajenas al servidor, y aprobarla les envía una invitación de un solo uso con los roles esperándolas cuando se unan.

No hay comandos para los formularios. Todo, salvo los dos botones de revisión, ocurre en el panel.

## Por qué usarlo

- Solicitudes de personal, de socios o de eventos con una cola de revisión adecuada en lugar de un montón de MD.
- Un proceso de apelación de ban con periodos de espera, límites de intentos y desbaneo automático al aprobar.
- Una comunidad cerrada donde los solicitantes se examinan antes de recibir una invitación.
- Encuestas de opinión con un tope de respuestas y exportación a CSV.

## Tipos de formulario

| Tipo | Quién puede enviarlo | Al aprobar |
| --- | --- | --- |
| Formulario normal | Miembros, o cualquiera si **Permitir a personas ajenas al servidor** está activado | Solo cambios de rol, si están configurados |
| Apelación de ban | Personas baneadas actualmente del servidor | Se quita el ban |
| Solicitud de ingreso | Personas que no están en el servidor | Se crea una invitación y cualquier **Roles que los esperan al unirse** se guarda como estado de rol, de modo que se aplican cuando la persona se une |

El tipo queda fijo una vez creado el formulario. Las apelaciones de ban y las solicitudes de ingreso siempre pasan por revisión; los formularios normales solo si **Las respuestas requieren aprobación** está activado.

## Preguntas

Las preguntas se añaden en el creador, en **Preguntas**. Los tipos son:

| Tipo | Respuesta | Opciones |
| --- | --- | --- |
| Texto corto | Una línea | Longitud mínima y máxima, hasta 5000 |
| Texto largo | Varias líneas | Mismos límites de longitud |
| Opción múltiple | Una de las opciones indicadas | Hasta 25 opciones |
| Casillas de verificación | Varias opciones | Hasta 25 opciones; **Valor mínimo** y **Valor máximo** limitan cuántas se pueden marcar |
| Menú desplegable | Una opción de una lista | Hasta 25 opciones |
| Número | Un número | Valor mínimo y máximo |
| Correo electrónico | Una dirección de correo válida | |
| URL | Una dirección `http` o `https` | |
| Salto de sección | Nada; empieza una página nueva y puede llevar un título y una introducción | |

El texto de la pregunta está limitado a 500 caracteres, los textos de ejemplo a 200 y cualquier respuesta a 4000 caracteres. Cada pregunta puede tener una URL de imagen y puede marcarse como obligatoria. Una pregunta también puede ser obligatoria solo cuando una respuesta anterior cumple una condición.

### Inserción de respuestas

Activa la inserción de respuestas en una pregunta y escribe `{{Q12}}` en su texto o texto de ejemplo, donde 12 es el ID de una pregunta anterior. Se inserta la respuesta anterior, recortada a 100 caracteres. Si no se respondió, aparece entre corchetes el texto de la pregunta. Una pregunta solo puede insertar respuestas de las preguntas que tiene encima.

### Condiciones

Cada pregunta puede mostrarse solo cuando se cumple una condición. Las preguntas ocultas se omiten en la página, y cualquier respuesta enviada para ellas se descarta en el servidor.

| Tipo de condición | Se muestra cuando |
| --- | --- |
| Según respuestas | Una respuesta anterior coincide: **Es igual a**, **No es igual a**, **Contiene**, **Mayor que** o **Menor que** |
| Según roles | El miembro tiene **Cualquiera**, **Todos** o **Ninguno** de los roles elegidos |
| Antigüedad en el servidor | El miembro lleva en el servidor al menos N días, o su cuenta tiene al menos N días |
| Boost/Nitro | El miembro está haciendo boost. La comprobación de Nitro es una estimación a partir de los datos de avatar y boost. |
| Según permisos | El miembro tiene todos los permisos elegidos |
| Varias condiciones | Varias filas combinadas. Las filas del mismo grupo deben cumplirse todas (Y); si se cumple cualquier grupo, se muestra la pregunta (O). |

Las comparaciones de texto ignoran las mayúsculas. Mayor que y menor que comparan números.

## Quién puede enviarlo

El formulario rechaza a las personas, con un motivo, en este orden: sigue siendo un borrador, no acepta respuestas, no ha llegado a **Se abre el**, ha pasado **Se cierra el**, la cuenta es más reciente que la **Antigüedad mínima de la cuenta de Discord**, el tope de **Total de respuestas aceptadas** está lleno, la persona ya respondió y las respuestas múltiples están desactivadas, no tiene el **Rol necesario para enviar** y, por último, la regla del tipo indicada arriba.

**Dejar que los rechazados lo intenten de nuevo** significa que una respuesta rechazada ya no cuenta como «ya respondió». Si **Exigir captcha** está activado, aparece una comprobación de Cloudflare Turnstile en el paso de revisión.

Las apelaciones de ban añaden sus propios límites en **Límites de apelación**: una espera tras el ban (medida desde la entrada del registro de auditoría del ban), un número máximo de apelaciones, una espera entre apelaciones y **Un rechazo es definitivo**. Una apelación que sigue pendiente bloquea una nueva.

## Rellenar un formulario

La página pública requiere iniciar sesión con Discord. Las respuestas se guardan como borrador aproximadamente un segundo y medio después de la última pulsación de tecla y al pasar a la página siguiente. Si vuelves en un plazo de 30 días, se restaura el borrador con un banner «We brought back what you had already written» y un botón **Empezar de nuevo**.

Una barra de progreso muestra las preguntas respondidas. La última página termina con **Revisar y continuar**, que enumera todas las respuestas con un enlace **Editar**, y luego **Confirmar y enviar**. Después, la página muestra tu **Mensaje tras el envío** (o uno predeterminado por tipo) y un enlace **Consulta tu estado**. La página de estado también enlaza a **Mis envíos** en `/forms/submissions`, que enumera todas las respuestas no anónimas que ha hecho el usuario con sesión iniciada en todos los servidores.

Quienes envían pueden editar sus respuestas desde la página de estado mientras la respuesta siga pendiente, siempre que el formulario no sea anónimo y no se haya cerrado. Las respuestas anteriores se conservan como revisiones. Quien envía no tiene forma de retirar una respuesta.

## Qué ocurre al enviar

1. Se conceden los roles de **Roles dados al enviar** y el **Rol mientras espera revisión**.
2. Si **Dónde se publican las respuestas** está definido, se publica allí un embed que muestra al usuario (o «Anonymous (login required)»), la hora y hasta 20 respuestas, mencionando a **Mencionar cuando llegue una respuesta**. Se adjuntan botones de Aprobar y Rechazar cuando el formulario se revisa.
3. Si **Enviar a un webhook** está definido, el mismo embed se publica en ese webhook, sin los botones. Cuando la respuesta se aprueba o se rechaza más tarde, también llega al webhook un segundo mensaje con el resultado, el revisor y el motivo. La URL debe ser un webhook de Discord; cualquier otra se ignora con un aviso en el registro del bot, y un webhook que falla nunca bloquea el envío.
4. La respuesta aparece en la pestaña **Respuestas** con el estado Pendiente de revisión.

Los formularios anónimos no guardan ningún ID de usuario, así que no pueden cambiar roles y sus respuestas no se pueden editar.

## El proceso de revisión

Las respuestas pasan de Pendiente de revisión a Aprobada o Rechazada. **Quién puede aprobar o rechazar** indica un rol; cualquiera con Gestionar servidor o Administrador siempre puede decidir. Si no hay un rol de revisor definido, quienes tienen los roles de aprobación también pueden decidir.

En Discord, **Aprobar** decide al instante. **Rechazar** abre una ventana modal que pide un motivo, obligatorio porque se envía a quien lo envió. En cualquier caso, el embed cambia de color, gana un campo **Aprobado** o **Rechazado** con el revisor y la hora, el motivo si lo hay, y pierde sus botones. En el panel, la misma decisión se toma desde la cola con un cuadro **Notas para el remitente**.

Al decidir, el bot:

- Añade y quita los roles de **Añadir al aprobar**, **Quitar al aprobar**, **Añadir al rechazar** y **Quitar al rechazar**, y siempre quita el rol de espera de revisión. Un rol que aparece en ambos lados se quita.
- Quita el ban al usuario en una apelación de ban aprobada, o crea la invitación para una solicitud de ingreso aprobada.
- Envía un MD a quien lo envió con «Your response was approved» o «Your response was not accepted» con las notas, tu **Mensaje tras el envío** al aprobar y la invitación. Si el MD falla, el embed y la cola lo indican.

Los emotes de los botones de revisión vienen del formulario, luego de los **Valores predeterminados del servidor** de la pestaña **Ajustes** y, por último, de una marca de verificación y una cruz sencillas.

## Versiones

Cada guardado de un formulario conserva una versión, hasta las últimas 20. **Historial de versiones** muestra cada una con una comparación de ajustes y preguntas y un botón **Restaurar**. Restaurar vuelve a crear las preguntas con IDs nuevos y reescribe las condiciones y la inserción de respuestas para que coincidan.

## Ajustes

La página de **Formularios** tiene las pestañas **Formularios**, **Crear** y **Ajustes**, además de **Editar** y **Respuestas** cuando se selecciona un formulario. Las pestañas Crear y Editar comparten un mismo panel de ajustes.

| Ajuste | Por defecto | Qué controla |
| --- | --- | --- |
| Nombre | vacío, obligatorio | Título del formulario, hasta 255 caracteres |
| Descripción | vacío | Se muestra bajo el título y en las vistas previas de enlaces de Discord |
| Dónde se publican las respuestas | ninguno | Canal del embed de envío; vacío mantiene las respuestas solo en el panel |
| Mensaje tras el envío | ninguno | Texto de la página de confirmación y del MD de aprobación |
| Borrador | activado en formularios nuevos | No se pueden enviar respuestas a los borradores |
| Aceptando respuestas | activado | Desactívalo para cerrar sin eliminar |
| Rol necesario para enviar | Cualquiera en el servidor | Restringe por rol |
| Antigüedad mínima de la cuenta de Discord | Sin límite | Días |
| Permitir a personas ajenas al servidor | desactivado | Solo formularios normales |
| Enviar de forma anónima | desactivado | No registra a quien envía |
| Se abre el, Se cierra el | ninguno | Ventana; un anuncio de lanzamiento necesita una hora de apertura |
| Total de respuestas aceptadas | Sin límite | Tope entre todos |
| Permitir más de una respuesta por persona | desactivado | |
| Dejar que los rechazados lo intenten de nuevo | desactivado | |
| Exigir captcha | desactivado | Turnstile en el paso de revisión |
| Anunciar la apertura en, Mencionar con el anuncio, Texto del anuncio | ninguno | Embed de lanzamiento con una cuenta atrás del cierre, enviado en aproximadamente un minuto desde **Se abre el** o al publicar |
| Mencionar cuando llegue una respuesta | ninguno | Rol mencionado con cada envío |
| Roles dados al enviar | ninguno | Se conceden de inmediato |
| Rol mientras espera revisión | ninguno | Se quita al decidir |
| Enviar a un webhook | ninguno | URL de webhook de Discord que también recibe cada embed de envío y cada decisión de aprobar o rechazar |
| Las respuestas requieren aprobación | desactivado | Añade revisión a un formulario normal |
| Quién puede aprobar o rechazar | Solo Gestionar servidor | Rol de revisor |
| Emote del botón de aprobar, Emote del botón de rechazar | predeterminado del servidor | |
| Añadir/Quitar al aprobar, Añadir/Quitar al rechazar | ninguno | Cambios de rol al decidir |
| Un rechazo es definitivo, Espera tras el ban, Apelaciones permitidas, Espera entre apelaciones | desactivado, Sin espera, Ilimitadas, Sin espera | Solo apelaciones de ban |
| Veces que se puede usar la invitación, La invitación caduca tras (segundos), Roles que los esperan al unirse | 1, 86400, ninguno | Solo solicitudes de ingreso |

Los ajustes que no se aplican al tipo del formulario se descartan al guardar.

## Guía de configuración

1. Abre **Formularios** en el panel y pulsa **Crear**.
2. Elige el **Tipo de formulario**. No se puede cambiar después.
3. Rellena el **Nombre** y la **Descripción**, y elige **Dónde se publican las respuestas**.
4. En **Preguntas**, añade preguntas, marca las obligatorias y usa **Añadir página** para dividir los formularios largos.
5. Define quién puede enviarlo y, si quieres un paso de revisión, activa **Las respuestas requieren aprobación** y elige **Quién puede aprobar o rechazar**.
6. Pulsa **Guardar formulario**. Usa **Vista previa** en la tarjeta del formulario para recorrerlo como administrador.
7. Pulsa **Publicar** en la tarjeta, luego **Copiar enlace** y publica el enlace donde lo encontrarán los solicitantes.
8. Vigila la pestaña **Respuestas**, o el canal de envíos, y decide cada respuesta.

## Comandos

Los formularios no tienen comandos de texto ni de barra. La única interacción en Discord son los botones **Aprobar** y **Rechazar** de cada embed de envío.

## Consejos y advertencias

- El bot necesita Gestionar roles, y su rol debe estar por encima de todos los roles que un formulario da o quita. Los roles por encima del bot, los roles gestionados y everyone se omiten en silencio.
- Las apelaciones de ban necesitan Ver registro de auditoría para la comprobación de «espera tras el ban». Quitar el ban necesita Banear miembros, y las invitaciones de las solicitudes de ingreso necesitan Crear invitación en un canal visible para todos.
- El embed de envío muestra como máximo 20 respuestas; la respuesta completa está en el panel.
- **Exportar CSV** en la pestaña Respuestas incluye una columna por pregunta, con las respuestas de selección múltiple separadas por punto y coma.
- El filtro de respuestas y la página forman parte de la URL, así que puedes guardar en marcadores «solo pendientes» y compartirlo con los revisores.
- Los borradores nunca se validan, así que un borrador restaurado aún puede fallar la validación al enviarlo.
- Los formularios caducados se cierran con una comprobación que se ejecuta cada minuto; la elegibilidad también se comprueba al enviar, así que nada se cuela entretanto.
