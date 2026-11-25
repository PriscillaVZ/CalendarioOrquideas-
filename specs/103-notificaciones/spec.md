# 103 — Notificaciones en la app

Status: built · Supersedes: 002 FR-7.b–e · Depends on: `001-sesion-cliente-api`, `002-calendario-home`, backend `104-notifications`

## 1. Context and objective

El brief pide que el sistema recuerde cuándo regar "a través de notificaciones" (RF2), y el backend
además avisa cuando una lectura sale del rango de su sensor (backend 104, RF4). El backend crea esos
avisos aunque nadie tenga la página abierta y los guarda como una lista por persona, con leídos y no
leídos (backend 104 D1). Hoy la interfaz solo los muestra como notificación del navegador, y solo con la
página del calendario abierta (002 FR-7); no hay dónde verlos después, ni forma de marcarlos leídos, ni
señal de que hay algo pendiente.

**Objective:** que en cualquier página la persona vea cuántos avisos tiene sin leer, abra la lista, los marque leídos, y reciba la notificación del navegador de cada aviso nuevo sin importar qué página tiene abierta.

## 2. Users

| Usuario | Relación con esta capacidad |
|---|---|
| Cultivador/a | Ve sus recordatorios de riego y alertas de sensores, los marca leídos. |
| El backend | Crea los avisos (recordatorios, alertas), los lista y guarda si están leídos. |

## 3. User stories

- Como cultivador/a, quiero ver en el encabezado cuántos avisos no he leído, para saber si algo pasó sin abrir nada.
- Como cultivador/a, quiero ver la lista de mis avisos con su fecha, para revisar lo que pasó mientras no miraba.
- Como cultivador/a, quiero marcar un aviso como leído, para que el contador refleje solo lo pendiente.
- Como cultivador/a, quiero la notificación del navegador en cualquier página, para no tener que dejar el calendario abierto.
- Como cultivador/a, quiero activar las notificaciones del navegador cuando yo decida, para que no me las pidan al guardar un riego.

## 4. Functional requirements

### FR-1 — Contador de no leídos (RF2, RF4)
Una campana en el encabezado de cada página con el número de avisos sin leer. El backend no empuja
avisos; la página pregunta, con la misma cadencia que ya usaba el calendario (002 D5).
- (a) WHEN se abre una página con sesión, the app shall leer del backend los avisos no leídos de la persona.
- (b) The app shall mostrar en el encabezado de cada página el número de avisos no leídos.
- (c) IF no hay avisos no leídos, THEN the app shall mostrar la campana sin número.
- (d) WHILE una página con sesión está abierta, the app shall volver a leer los avisos no leídos cada 30 segundos.

### FR-2 — Lista de avisos (RF2, RF4)
La lista son los 100 avisos más recientes que entrega el backend (backend 104 D4). Cada uno dice qué es y
cuándo ocurrió; los no leídos se distinguen.
- (a) WHEN la persona pulsa la campana, the app shall mostrar los avisos de la persona del más reciente al más antiguo.
- (b) The app shall mostrar por cada aviso su tipo, su mensaje y la fecha y hora en que se creó.
- (c) The app shall nombrar los tipos "Recordatorio de riego" y "Alerta de sensor".
- (d) The app shall distinguir los avisos no leídos de los leídos con un texto, no solo con color.
- (e) IF la persona no tiene avisos, THEN the app shall mostrar "No tienes notificaciones.".
- (f) WHEN la persona pulsa la campana con la lista abierta, the app shall cerrar la lista.

### FR-3 — Marcar como leído (RF2, RF4)
Leer es una acción de la persona (002 D6): pulsar un aviso no leído lo marca leído en el backend.
- (a) WHEN la persona pulsa un aviso no leído, the app shall marcarlo como leído en el backend.
- (b) WHEN el backend acepta, the app shall mostrar ese aviso como leído y restar uno al contador.
- (c) IF el backend rechaza el cambio, THEN the app shall mostrar su mensaje y dejar el aviso como no leído.

### FR-4 — Notificaciones del navegador en todas las páginas (RF2)
Reemplaza 002 FR-7.b–e: lo mismo, pero en cada página con sesión y no solo en el calendario. La lista
de avisos ya mostrados es la misma del navegador, así que un aviso no se repite al cambiar de página.
- (a) WHILE una página con sesión está abierta con permiso del navegador concedido, WHEN la lectura de no leídos trae un aviso que este navegador no mostró, the app shall mostrarlo como notificación del navegador con el mensaje del backend.
- (b) The app shall titular "¡Hora de regar tus orquídeas! 🌱" los recordatorios de riego y "Alerta del invernadero ⚠" los demás avisos.
- (c) The app shall mostrar cada aviso como notificación del navegador una sola vez por navegador.
- (d) WHEN la persona pulsa una notificación del navegador, the app shall traer su ventana al frente y abrir la lista de avisos.

### FR-5 — Activar las notificaciones del navegador (RF2)
El permiso se pide desde la lista, cuando la persona lo decide, y si está bloqueado se dice ahí en vez
de con una ventana emergente en cada guardado (002 §10 Known deviations).
- (a) WHILE el permiso del navegador no está decidido, the app shall ofrecer en la lista el botón "Activar avisos del navegador".
- (b) WHEN la persona pulsa "Activar avisos del navegador", the app shall pedir el permiso al navegador.
- (c) IF el permiso está bloqueado, THEN the app shall mostrar en la lista "Los avisos del navegador están bloqueados; actívalos en la configuración del navegador.".
- (d) IF el navegador no admite notificaciones, THEN the app shall mostrar en la lista "Este navegador no muestra avisos fuera de la página.".

## 5. Non-functional requirements

- **Freshness:** el contador y las notificaciones del navegador llegan a lo más 30 s después de que el
  backend crea el aviso (el backend crea los recordatorios a lo más 60 s después de la hora, backend 104).
- **Language:** textos en español; los mensajes de los avisos son los del backend.
- **Accessibility:** la campana es un botón con nombre accesible que incluye el número ("3 avisos sin
  leer"); la lista se abre y cierra con teclado.
- **Traceability:** FR-1, FR-2 y FR-3 sirven a RF2 y RF4; FR-4 y FR-5 a RF2.

## 6. Edge cases

| Situación | Comportamiento esperado |
|---|---|
| Más de 100 avisos | La lista muestra los 100 más recientes (backend 104 D4); el contador cuenta los no leídos de esos 100. |
| Aviso ya leído pulsado | No se envía nada (FR-3.a es solo para no leídos). |
| Dos pestañas abiertas | Ambas consultan; la notificación del navegador sale una vez (FR-4.c). Marcar leído en una se ve en la otra a la siguiente lectura. |
| Sesión vencida durante la consulta | El cliente lleva al inicio de sesión (001 FR-3.c). |
| Backend caído | El contador conserva el último número; no se muestra error cada 30 s. |
| Permiso concedido después de llegar avisos | Los no leídos aún no mostrados salen en la siguiente lectura (FR-4.a). |

## 7. Out of scope

- Marcar todos como leídos, borrar o paginar avisos: backend 104 D4; `specs/backlog.md`.
- Notificaciones push con la página cerrada, o por correo: backend 104 D1; backend backlog.
- Avisos de "volvió al rango" o "sensor sin señal": backend 104 §7.

## 8. Completion criteria

- En las cuatro páginas el encabezado muestra la campana con el número de no leídos.
- La lista muestra recordatorios y alertas con su fecha y hora, y marcar uno leído baja el contador.
- Un recordatorio nuevo aparece como notificación del navegador estando en Home, Datos o Configuración.
- El permiso se pide desde la lista, no al guardar un riego.

## 9. Open questions

- ~~[NEED CLARIFICATION] (affects FR-2.a, FR-2.f, T03) ¿La lista es un panel que se abre desde la campana en cualquier página, o una página propia en el menú lateral? Propuesta: panel desde la campana; una página nueva obliga a dejar lo que se estaba mirando.~~ → D5

## 10. Decisions taken

- **D1 — Los avisos del navegador pasan del calendario a todas las páginas** (reemplaza 002 FR-7.b–e).
  *Por qué:* un recordatorio no espera a que la persona abra el calendario.
- **D2 — Mostrar una notificación del navegador no marca el aviso leído.** *Por qué:* la persona puede no
  haberla visto (pantalla bloqueada); leer es pulsarlo en la lista (002 D6).
- **D3 — El permiso se pide desde la lista** y no al guardar un riego. *Por qué:* pedirlo al guardar
  interrumpe y, bloqueado, avisa en cada guardado (002 §10 Known deviations). 002 FR-7.a queda mientras
  103 no esté `built`.
- **D4 — Contador con el filtro de no leídos del backend** (backend 104 FR-3), no contando la lista
  completa. *Por qué:* la consulta de cada 30 s trae solo lo pendiente.
- **D5 — La lista es un panel que se abre desde la campana** en cualquier página (respuesta del dueño,
  2026-11-18). *Por qué:* no obliga a dejar lo que se estaba mirando. *Descartado:* una página propia en
  el menú lateral.

### Taken while building

- **D6 — La campana y el perfil van juntos en `.encabezado-acciones`** (round 1). El encabezado reparte
  sus hijos con `space-between`: una campana suelta quedaría al medio. `notificaciones.js` mueve el
  perfil dentro del grupo (su clic de cierre de sesión, de `api.js`, se conserva). En Datos el título
  pasa a `.encabezado h1` en `Datos/datos.css`, sin margen propio (fuera de plan §1; consecuencia de T01).
  **Reemplazada por 104** (2026-11-21): la campana va dentro de `.head-tools`, antes del avatar (104
  FR-3.b); `.encabezado-acciones` y `.perfil` ya no existen.
- **Cambios de 104 sobre este spec** (2026-11-21): un aviso pendiente dice "No leído" en vez de "Sin leer"
  (104 FR-4.a, D6; FR-2.d sigue pidiendo un texto); la fecha de cada aviso se acorta según su antigüedad
  (104 FR-4.b) en lugar de "DD-MM-AAAA, HH:MM" (FR-2.b sigue pidiendo fecha y hora); la lista se cierra
  también con un clic fuera (104 FR-4.c, además de FR-2.f y Escape).
- 2026-11-18 · Claude (navegador de Orca en un perfil aislado, backend local; cuenta de prueba nueva
  `avisos…@example.com`, riegos a las 21:29 y 21:30, sensor 13 con límites 0–1 °C y una lectura de 25 °C)
  · round 1: FR-1.a: al abrir Home hubo una petición a `/notifications?unread_only=true`. FR-1.c: sin
  avisos, la campana sin número y nombre "Avisos: ninguno sin leer". FR-1.d: con Home abierta desde las
  21:28 y sin recargar, al crear el backend el recordatorio (21:29:26) y la alerta (21:29:21) la campana
  pasó a "2" ("2 avisos sin leer"). FR-1.b: Home, Calendario, Datos y Configuración mostraron "2", la
  campana antes del ícono de perfil.
- 2026-11-18 · Claude (mismo entorno; el navegador de Orca bloquea las notificaciones, así que para FR-4 y
  FR-5.a–b se sustituyó `window.Notification` en la página por uno que registra lo que se le pide: el
  código de la app corre sin cambios, lo que no se ve es la ventana del sistema) · round 2: FR-2.a: pulsar
  la campana abrió la lista con el 21:30 arriba, luego el 21:29 y la alerta de 21:29:21. FR-2.b, FR-2.c,
  FR-2.d: "Recordatorio de riego · Sin leer · Es hora de regar las orquídeas (18-11-2026 21:30) ·
  18-11-2026, 21:30" y "Alerta de sensor · Sin leer · Temperatura prueba: 25 °C fuera de rango (mín 0 °C,
  máx 1 °C)". FR-5.c: con el permiso real de Orca (`denied`), "Los avisos del navegador están bloqueados;
  actívalos en la configuración del navegador.". FR-3.c: con `fetch` fallando solo para el `PATCH` (lo
  mismo que ve `api.js` con el backend caído), "No se pudo conectar con el servidor.", el aviso siguió
  "Sin leer" y el contador en 3. FR-3.a, FR-3.b: pulsar el aviso 68 envió `PATCH /notifications/68/read`;
  pasó a "Leído", el contador bajó de 3 a 2 y `?unread_only=true` ya no lo trajo; un aviso leído no es
  botón. FR-2.f: pulsar la campana con la lista abierta la cerró (`aria-expanded` false); Escape también,
  devolviendo el foco a la campana. FR-5.a, FR-5.b: en Configuración, con permiso sin decidir, la lista
  ofreció "Activar avisos del navegador"; pulsarlo pidió el permiso una vez. FR-4.b: al concederlo salieron
  "¡Hora de regar tus orquídeas! 🌱 — Es hora de regar las orquídeas (18-11-2026 21:29)" y "Alerta del
  invernadero ⚠ — Temperatura prueba: 25 °C fuera de rango…"; siguieron sin leer en el backend (D2).
  FR-4.d: pulsar la notificación llamó a `window.focus()`, la cerró y abrió la lista. FR-4.a, FR-4.c: en
  Datos, abierta 9 min sin recargar y con permiso, el recordatorio 73 (creado 21:44:26) salió a las
  21:44:47 con la consulta periódica; 66 y 67, ya mostrados en Configuración, no se repitieron, y el
  contador subió a 3. FR-5.d: sin `Notification`, "Este navegador no muestra avisos fuera de la página.".
  FR-2.e: una cuenta nueva `vacio…@example.com` vio "No tienes notificaciones." y la campana sin número.
  002 FR-7.a reemplazado: guardar el riego 11 en el calendario con permiso sin decidir no pidió permiso.

