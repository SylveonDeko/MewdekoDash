---
title: Nintendo Switch
slug: switch
summary: Busca códigos de error de Nintendo Switch, conviértelos entre decimal y hexadecimal, busca en la wiki de switchbrew.org y obtén un desglose legible de un archivo de registro de Ryujinx.
icon: fa-gamepad-modern
category: Entertainment
module: Switch
tags: [switch, nintendo, error code, ryujinx, emulator, log, switchbrew, homebrew, hex, código de error, emulador, registro, hexadecimal]
related: [userprofile, help]
---

## Qué hace

El módulo Switch es un kit de herramientas de soporte para servidores dedicados al homebrew y la emulación de Nintendo Switch. Cuando alguien publica un error como `2168-0002`, un ayudante ejecuta `err 2168-0002` y el bot responde con el módulo al que pertenece el error, lo que se sabe sobre él y un enlace a la página de soporte de Nintendo cuando existe.

Dos pequeños convertidores transforman la forma `NNNN-NNNN` en el valor hexadecimal bruto que se usa en el código, y viceversa. `switchbrew` busca en la wiki de switchbrew.org para que la gente pueda encontrar páginas de SVC, códigos de resultado o hardware sin salir de Discord.

La función más importante es el analizador de registros de Ryujinx. Un usuario adjunta su `Ryujinx.log`, alguien ejecuta `analyselog` sobre él o como respuesta a él, y el bot genera un embed con el juego, la versión del emulador, el hardware, cada ajuste relevante, el último error, los mods y trucos instalados, y una lista de notas que señalan configuraciones incorrectas habituales.

No hay nada que configurar ni nada que se guarde. Todos los comandos están abiertos a todo el mundo.

## Por qué usarlo

- Un canal de soporte recibe a diario la misma pregunta de "qué significa 2811-5001".
- La solución de problemas de Ryujinx empieza leyendo el registro, y la mayoría de la gente no sabe qué buscar.
- Los desarrolladores quieren la forma hexadecimal de un error para buscarla en el código fuente.
- Cualquiera puede abrir una página de switchbrew.org desde Discord.

## Búsqueda de códigos de error

`err <code>` acepta cualquiera de las dos formas:

- `NNNN-NNNN`, donde el primer grupo empieza por 2 (por ejemplo `2168-0002`). El número de módulo es el primer grupo menos 2000 y la descripción es el segundo grupo.
- Un valor hexadecimal con el prefijo `0x`, por ejemplo `0x2A2`. Los nueve bits bajos son el módulo y el resto es la descripción.

La respuesta muestra el código en ambas formas, el nombre y número del módulo, el número de descripción y una explicación. La explicación se busca en este orden: una descripción conocida para el código exacto, una página de soporte de Nintendo para el código exacto, una descripción para el rango en el que cae el código dentro de su módulo, y si no, «desconocido». Los códigos conocidos se muestran con el color normal, y los desconocidos con el color de error.

Algunos códigos no siguen el patrón, como `2-AAB6A-3400`. Esos se comparan exactamente con una lista corta y se informan con el juego al que pertenecen.

`err2hex <NNNN-NNNN>` muestra el valor hexadecimal. `hex2err <hex>` muestra la forma con guion; el prefijo `0x` es opcional.

## Búsqueda en Switchbrew

`switchbrew <query>` consulta la API de búsqueda de la wiki y devuelve las cinco coincidencias principales con un enlace y un fragmento de hasta 200 caracteres cada una. `svc` es un alias, así que `svc SetThreadPriority` resulta natural.

## Análisis de registros de Ryujinx

`analyselog` busca un adjunto `.log` o `.txt` en tu mensaje. Si no hay ninguno, y tu mensaje es una respuesta, usa el adjunto del mensaje al que respondiste y acredita a su autor en el pie. El embed se titula con el nombre del juego y contiene:

| Campo | Contenido |
| --- | --- |
| Información general | Versión de Ryujinx, firmware, CPU, GPU, RAM, sistema operativo |
| Ajustes del sistema | Backend de audio, modo acoplado o portátil, PPTC, caché de shaders, VSync, hipervisor (solo macOS) |
| Ajustes gráficos | Backend gráfico, escala de resolución, filtrado anisotrópico, relación de aspecto, recomprimir texturas |
| Errores | El último bloque de error del registro, o «sin errores» |
| Mods | Cada mod con ExeFS o RomFS, truncado con un recuento si hay muchos |
| Trucos | Cada truco, truncado de la misma forma |
| Notas | Problemas detectados y consejos |

Las notas cubren cosas como una colisión o corrupción de la caché de shaders, un hash de volcado incorrecto, claves desactualizadas, firmware que falta, errores de permisos de archivos, una partida guardada que falta, servicios que faltan, Vulkan sin memoria, el perfil de usuario predeterminado, ningún mando configurado, una GPU Intel o AMD que debería usar Vulkan, Rosetta en Apple silicon, el backend de audio ficticio, PPTC o la caché de shaders desactivados, RAM ampliada, el gestor de memoria por software, ignorar servicios que faltan, VSync desactivado, comprobaciones de integridad del sistema de archivos desactivadas, hilos del backend desactivados y compilaciones personalizadas. Cada nota tiene un marcador de gravedad que va de informativo a crítico.

Si el archivo no se puede descargar o no es un registro de Ryujinx, el bot indica que el registro no es válido.

## Ajustes

Este módulo no tiene ajustes ni página en el panel.

## Guía de configuración

1. Asegúrate de que el bot pueda leer el historial de mensajes y adjuntar archivos en tu canal de soporte.
2. Pide a los usuarios que adjunten su `Ryujinx.log` directamente a un mensaje.
3. Un ayudante responde a ese mensaje con `analyselog`.
4. Para códigos de error, ejecuta `err <code>` y comparte el enlace de soporte si se muestra uno.
5. Opcionalmente, añade un activador de chat o un mensaje fijado que recuerde a la gente estos dos comandos.

## Comandos

Usa estos comandos con el prefijo de tu servidor (`.` a menos que lo hayas cambiado).

| Comando | Alias | Requiere | Función |
| --- | --- | --- | --- |
| `err <code>` | `nxerr`, `serr` | Nadie | Explica un código de error de Switch en forma con guion o hexadecimal |
| `err2hex <NNNN-NNNN>` | `e2h` | Nadie | Convierte un código con guion a hexadecimal |
| `hex2err <hex>` | `h2e` | Nadie | Convierte hexadecimal a la forma con guion |
| `switchbrew <query>` | `sb`, `svc` | Nadie | Busca en switchbrew.org |
| `analyselog` | `analyzelog`, `analyselogs`, `analyzelogs`, `analyze`, `analyse` | Nadie | Analiza un registro de Ryujinx adjunto |

## Consejos y trampas

- La forma con guion debe tener exactamente cuatro dígitos, un guion y cuatro dígitos, empezando por 2. Los códigos con letras solo pasan por la lista de casos especiales.
- Los registros deben adjuntarse como `.log` o `.txt`; un registro pegado en un bloque de código no se lee.
- El analizador lee el archivo completo, así que pide el registro de la sesión en la que ocurrió el problema y no el de un inicio nuevo.
- La búsqueda en switchbrew.org es una petición en directo; si el sitio va lento, el comando también irá lento.
- Los miembros pueden guardar su código de amigo de Switch en su perfil con `setswitchfc`, que forma parte del módulo Perfil de usuario.
