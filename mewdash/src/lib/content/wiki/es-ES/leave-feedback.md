---
title: Comentarios de salida
slug: leave-feedback
summary: Cuando un servidor quita el bot, su propietario recibe un MD preguntando el motivo. Las respuestas se recogen en una página del panel solo para propietarios.
icon: fa-comments
category: Analytics
dashboard: /owner/leave-feedback
tags: [leave feedback, kick feedback, why removed, churn, exit survey, owner only, bot owner, comentarios de salida, comentarios de expulsión, por qué se quitó, abandono, encuesta de salida, solo propietario, propietario del bot]
related: [invites]
---

## Qué hace

Cada vez que el bot es expulsado de un servidor o sale de él, envía al propietario del servidor un MD breve. El MD tiene un menú desplegable con motivos comunes, un botón **Escribir algo** que abre un cuadro de texto, y un botón **No, gracias**. Responder es opcional, y el MD lo indica.

Cada respuesta se guarda con el nombre del servidor, su número de miembros, su propietario y el tiempo que el bot llevaba en él. Si hay un canal de informes configurado, también se publica allí un embed resumen, que se actualiza si el propietario añade un comentario más tarde.

Es una función a nivel de bot. No hay ajustes por servidor, y la página del panel solo aparece para el propietario del bot.

> [!NOTE]
> Solo el propietario del bot puede ver la página de Comentarios de salida. Los demás usuarios del panel no la tienen en la barra lateral y no pueden abrirla.

## Por qué usarlo

- Descubrir si los servidores se van por funciones que faltan, confusión al configurar o problemas de fiabilidad.
- Detectar servidores que solo añadieron el bot para probarlo, para poder ignorar sus salidas.
- Contactar con propietarios que escribieron un comentario y dejaron sus datos de contacto.
- Medir con qué frecuencia los propietarios se molestan en responder.

## El mensaje

El MD se titula "¡Lamentamos verte partir!" y explica que el bot acaba de ser quitado del servidor indicado. El menú desplegable ofrece estos motivos, en este orden:

| Clave del motivo | Mostrado al propietario |
| --- | --- |
| `not_needed` | Ya no lo necesitábamos |
| `confusing` | Demasiado confuso de configurar |
| `missing_features` | Faltan funciones que queríamos |
| `unreliable` | Estaba roto o no era fiable |
| `other_bot` | Nos pasamos a otro bot |
| `temporary` | Es temporal, lo vuelvo a añadir |
| `testing` | Solo estaba probando algo |

Elegir un motivo lo guarda de inmediato y vuelve a ofrecer el cuadro de texto. El cuadro de texto es un campo de párrafo único, "¿Qué podríamos haber hecho mejor?", limitado a 1000 caracteres. **No, gracias** marca el registro como descartado y nunca se informa.

Reglas para que no resulte molesto:

- A un servidor se le pregunta como máximo una vez cada treinta días, sin importar cuántas veces añada y quite el bot.
- Si los MD del propietario están cerrados, no se guarda nada.
- No se envía nada cuando la función está desactivada.

## Estados

Cada registro termina en uno de tres estados, por los que filtra el panel.

| Estado | Significado |
| --- | --- |
| Respondido | El propietario eligió un motivo o escribió un comentario |
| Descartado | El propietario pulsó **No, gracias** |
| Sin respuesta | Se envió el MD y todavía no ha llegado nada |

## Ajustes

La página tiene dos pestañas, **Respuestas** y **Ajustes**.

| Ajuste | Por defecto | Qué controla |
| --- | --- | --- |
| Preguntar a los propietarios por qué se quitó el bot | activado | Si se envía el MD o no |
| ID del canal de informes | vacío | Canal que recibe un embed resumen por cada respuesta. Si está vacío, se usa el canal de registro de entradas/salidas del bot. |

Debajo del campo de canal, la página muestra a qué canal y servidor corresponde el ID y si el bot puede acceder a él.

La pestaña **Respuestas** tiene seis contadores, **Solicitudes enviadas**, **Respondidas**, **Con comentario**, **Descartadas**, **Sin respuesta** y **Tasa de respuesta**, un desglose de **Motivos indicados**, y una tabla con las columnas **Salida**, **Servidor**, **Motivo** y **Estado**. Puedes filtrar por motivo y por estado (el filtro de estado también tiene una opción **Dejó un comentario**), buscar por nombre de servidor o texto del comentario, abrir una fila para leer el comentario completo, y eliminar un registro. **Tasa de respuesta** cuenta juntas las solicitudes respondidas y descartadas.

## Guía de configuración

1. Inicia sesión en el panel con la cuenta del propietario del bot y abre **Comentarios de salida**.
2. En la pestaña **Ajustes**, comprueba que **Preguntar a los propietarios por qué se quitó el bot** esté activado. Viene activado por defecto.
3. Pega un ID de canal en **ID del canal de informes** y haz clic en **Guardar canal**, o déjalo vacío para usar el canal de entradas/salidas.
4. Quita el bot de un servidor de prueba que seas propietario y responde al MD.
5. Revisa la pestaña **Respuestas** y el canal de informes para ver la entrada.

## Comandos

Esta función es solo para el panel. No hay comandos del bot; los propietarios responden mediante los botones y el menú desplegable del MD.

## Consejos y advertencias

- El bot solo envía MD a la persona que Discord indica como propietario del servidor, no a quien lo expulsó.
- El enfriamiento de treinta días es por servidor, así que un servidor que vuelve a añadir el bot y lo quita de nuevo dentro de ese plazo no recibe la pregunta dos veces.
- El embed resumen se envía al canal configurado, o al canal de registro de entradas/salidas de las credenciales del bot cuando no hay ninguno configurado. Si no existe ninguno de los dos, las respuestas se siguen guardando y son visibles en la página.
- Eliminar un registro desde el panel no elimina el embed que ya se publicó en el canal de informes.
