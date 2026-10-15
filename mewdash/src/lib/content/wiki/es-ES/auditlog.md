---
title: Registro de auditoría
slug: auditlog
summary: Un registro de quién usó el panel de tu servidor, qué miró y qué cambió, guardado durante noventa días.
icon: fa-clipboard-check
category: Security
dashboard: /dashboard/auditlog
tags: [audit, history, accountability, dashboard access, who changed, log, changes, before and after, auditoría, historial, responsabilidad, acceso al panel, quién cambió, registro, cambios, antes y después]
related: [logging, administration, channel-access]
---

## Qué hace

Cada solicitud que el panel envía al bot para tu servidor se registra asociada a la cuenta de Discord que había iniciado sesión. La página Registro de auditoría convierte eso en una línea de tiempo: quién abrió los ajustes de XP, quién editó el mensaje de bienvenida, quién eliminó un activador de chat y cuáles eran los valores antes y después.

Es independiente del registro de auditoría de Discord y de la función Registros. El registro de Discord cubre las acciones realizadas dentro de Discord. Los Registros de Mewdeko publican en los canales que elijas eventos del servidor como entradas, ediciones y cambios de roles. El Registro de auditoría del panel solo cubre el panel.

No hay que activar nada. Las entradas se escriben desde el momento en que alguien inicia sesión en el panel y abre tu servidor, y caducan a los noventa días.

## Por qué usarlo

- Varias personas tienen acceso al panel y quieres saber quién desactivó Anti-raid la semana pasada.
- Se cambió un ajuste y nadie lo admite.
- Quieres tener un rastro antes de dar acceso al panel a un equipo de staff más amplio.
- Necesitas confirmar que un cambio que pediste a alguien se hizo de verdad y qué sustituyó.

## Qué se registra

Cada entrada incluye:

- **Cuándo**: la hora de la solicitud, guardada en UTC y mostrada en tu propia zona horaria en la página.
- **Usuario**: el nombre de usuario y el ID de Discord tomados del inicio de sesión del panel, no de nada que haya escrito el usuario.
- **Acción**: una de las acciones de la tabla siguiente.
- **Sección**: el área del panel, mostrada con un nombre amigable como "Sistema AFK", "Activadores" o "Protección".
- **Endpoint**: la solicitud exacta, por ejemplo `PUT Afk/123/settings`, mostrada en letra pequeña debajo de la sección.
- **Cambios**: para cualquier acción que no sea una consulta, los valores que se enviaron o cambiaron. Expande la entrada con **Detalles** para verlos.

El bot también guarda con cada entrada la cadena de user agent del navegador.

### Acciones

La acción se decide según el tipo de solicitud que hizo el panel.

| Acción | Se registra cuando |
| --- | --- |
| Consultado | El panel leyó datos (una solicitud GET). Cada carga de página genera estas entradas. |
| Creado | Se añadió algo (una solicitud POST). |
| Actualizado | Se cambió algo existente (una solicitud PUT o PATCH). |
| Eliminado | Se quitó algo (una solicitud DELETE). |
| Accedido | Reservado para el inicio de sesiones del panel. El filtro lo ofrece, pero la versión actual nunca escribe entradas con esta acción. |

### Conjuntos de cambios

Las consultas no guardan datos de cambios. Para todo lo demás, el bot guarda uno de estos dos documentos:

- **Diferencia antes y después**: cuando la sección del panel toma una instantánea del ajuste antes de cambiarlo, la entrada solo enumera los campos que cambiaron, cada uno con su valor anterior y su valor nuevo. La mayoría de páginas de ajustes funcionan así.
- **Cuerpo de la solicitud**: cuando no se tomó ninguna instantánea, la entrada guarda lo que envió el panel, sin valor anterior.

Cualquier campo cuyo nombre contenga `token`, `secret`, `password`, `apikey`, `api_key`, `authorization` o `clientsecret` se sustituye por `[redacted]` antes de guardarse, así las credenciales nunca acaban en el registro.

En la página, los booleanos se muestran como Activado y Desactivado, las listas como "3 elementos", las cadenas vacías como "vacío" y los valores ausentes como "ninguno". Los nombres de los campos se convierten en etiquetas legibles.

> [!NOTE]
> Las entradas "Consultado" son la mayoría del registro, porque cada página del panel lee los ajustes al abrirse. Filtra por Creado, Actualizado o Eliminado cuando busques un cambio.

### Lo que no se registra

- Lo que se hace con comandos en Discord. Esas acciones aparecen en el registro de auditoría de Discord donde actuó el bot, y en Registros si lo tienes configurado.
- Las solicitudes que no estaban asociadas a un usuario con sesión iniciada en el panel.
- Abrir la propia página Registro de auditoría, Comentarios de salida, y algunos endpoints de infraestructura y de sondeo como el estado del bot, el rendimiento, la información del sistema y la gestión de instancias.
- Algunos endpoints excluidos explícitamente: la imagen de avatar de persona que se sirve al constructor de embeds, la comprobación de "debería mostrarse" del asistente de configuración y la baliza de visualización de página del panel.

## Cómo leer la página

Abre **Registro de auditoría** en la sección Seguridad del panel. La lista muestra primero las entradas más recientes, cincuenta por página, con los botones **Anterior** y **Siguiente** y un recuento del total de entradas.

Dos filtros aparecen encima de la lista:

| Filtro | Qué hace |
| --- | --- |
| **Acción** | Muestra solo las entradas Consultado, Creado, Actualizado, Eliminado o Accedido. |
| **Sección** | Muestra solo un área del panel. Las opciones se generan con las secciones presentes en las entradas cargadas actualmente. |

**Actualizar** vuelve a cargar la lista. Cambiar un filtro lleva de nuevo a la primera página.

En un ordenador, cada entrada es una fila con un botón **Detalles** cuando tiene datos de cambios. En un teléfono, las entradas se muestran como tarjetas con un botón **Mostrar detalles**.

> [!EXAMPLE]
> Filtra **Acción** por Actualizado y **Sección** por Protección para ver cada vez que alguien cambió un sistema de protección, y luego expande una fila para ver qué campos cambiaron y de qué valor a cuál.

## Retención

Las entradas se guardan durante **noventa días**. Una tarea de limpieza se ejecuta una vez al día, empezando cinco minutos después de que el bot se conecte, y elimina todo lo que sea más antiguo. No hay exportación, así que si necesitas un registro más allá de ese periodo, guárdalo antes de que caduque.

## Quién puede verlo

La página solo está disponible para las personas que pueden iniciar sesión en el panel y son miembros de tu servidor. El propietario del servidor y cualquiera con el permiso Administrador siempre pueden abrirla. Cualquier otra persona necesita al menos acceso **Ver** a la sección **Registro de auditoría** en Acceso al panel, que se concede por usuario o por rol.

> [!PERMISSION]
> Como el usuario se toma del token de inicio de sesión del panel, nadie puede hacer que aparezca una entrada a nombre de otra persona.

## Consejos y trampas

- El filtro de sección solo muestra las secciones que aparecen en la página que estás viendo. Si una sección no aparece en el desplegable, puede que siga existiendo en páginas posteriores; quita el filtro de acción y pasa de página, o filtra antes por acción.
- Las marcas de tiempo se muestran en la zona horaria del navegador que ve la página, no en la zona horaria del servidor de los ajustes de Administración.
- Una entrada "Creado" significa que se hizo una solicitud POST, que el panel también usa para algunos interruptores y actualizaciones. Lee la línea del endpoint y los detalles para ver lo que pasó realmente.
- Las entradas cuyos detalles muestran valores sin valor anterior provienen de una sección que no toma instantáneas de su estado previo. Verás lo que se envió, pero no lo que sustituyó.
- El registro es por servidor. Cambiar de servidor en el panel también cambia el registro.
