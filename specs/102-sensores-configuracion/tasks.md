# 102 — Sensores en Configuración · Tasks

Status: built · Spec: `spec.md` · Plan: `plan.md`

Las revisiones en vivo
necesitan el backend en `:8000`, `python3 -m http.server 8080`, una sesión, y el simulador del backend
(`../RiegoBackend/tools/sensor_sim.py`) para las conexiones. Nunca pegar una clave real en un spec ni en
el registro de tareas.

## A. Páginas y cliente compartido
- [x] **T01 — Configuración usa el cliente, sin simulación** · FR-7.a
  `Configuracion/configuracion.html`: `<script src="../api.js">`; quitar "Estado de conexión" simulado y "Frecuencia del registro histórico"; `Configuracion/configuracion.js`: quitar su código y `localStorage`.
  *Made when:* sin token, abrir Configuración termina en `login.html`, y `grep -n "localStorage" Configuracion/configuracion.js` no encuentra nada.
- [x] **T02 — Lista de sensores** · FR-1.a, FR-1.b, FR-1.c, FR-1.d, FR-1.e · after T01
  `configuracion.html`: tarjeta "Mis sensores" con `#listaSensores`; `configuracion.js`: `cargarSensores()`, `mostrarSensores()`; `configuracion.css`.
  *Made when:* un sensor creado con `POST /sensors` aparece con "Humedad", "Wi-Fi", su intervalo y límites; una cuenta nueva ve "Aún no registras sensores.".
- [x] **T03 — Estado de conexión** · FR-2.a, FR-2.b, FR-2.c, FR-2.d, FR-2.e · after T02
  `configuracion.js`: `estadoConexion()` con `/conditions` según plan §2; lista de qué revisar.
  *Made when:* con el simulador enviando, el sensor dice "Conectado"; recién registrado dice "Esperando la primera lectura" con qué revisar.

— checkpoint: Configuración muestra los sensores reales y si envían —

- [x] **T04 — Registrar un sensor y mostrar su clave** · FR-3.a, FR-3.b, FR-3.c, FR-3.d, FR-3.e, FR-3.f, FR-3.g · after T02
  `configuracion.html`: `#formSensor`, `#claveSensor`; `configuracion.js`: `abrirFormulario()`, `guardarSensor()` (POST, límites vacíos omitidos), `mostrarClave()`.
  *Made when:* registrar un sensor muestra id y clave; el simulador con esos datos recibe 201; `Object.values(localStorage).some(v => v.includes(clave))` es `false`.
- [x] **T05 — Editar un sensor** · FR-4.a, FR-4.b, FR-4.c, FR-4.d, FR-4.e · after T04
  `configuracion.js`: `abrirFormulario(sensor)` con tipo y conexión deshabilitados; `PATCH` con lo cambiado; límite vacío = `null`.
  *Made when:* vaciar el máximo deja "—" en la lista y `GET /sensors/{id}` devuelve `max_val: null`.
- [x] **T06 — Activar, desactivar y clave nueva** · FR-5.a, FR-5.b, FR-5.c, FR-6.a, FR-6.b · after T02
  `configuracion.js`: `cambiarActivo()`, `nuevaClave()` con `confirm()`.
  *Made when:* tras "Clave nueva", el simulador con la clave anterior recibe "Clave de sensor inválida"; desactivar deja "Inactivo".

— checkpoint: sensores administrados de punta a punta —

- [x] **T07 — Revisión en vivo** · FR-1.a, FR-1.b, FR-1.c, FR-1.d, FR-1.e, FR-2.a, FR-2.b, FR-2.c, FR-2.d, FR-2.e, FR-3.a, FR-3.b, FR-3.c, FR-3.d, FR-3.e, FR-3.f, FR-3.g, FR-4.a, FR-4.b, FR-4.c, FR-4.d, FR-4.e, FR-5.a, FR-5.b, FR-5.c, FR-6.a, FR-6.b, FR-7.a
  Casos de plan §5 en el navegador de Orca; anotarlos en spec §10 *Taken while building* sin copiar claves.
  *Made when:* `sdd_check.py specs/102-sensores-configuracion` lista todos los bullets como revisión en vivo.

— checkpoint: spec `built` —

## C. What could change

None yet.

## D. Requirement coverage

| FR | Tareas |
|---|---|
| FR-1 | T02, T07 |
| FR-2 | T03, T07 |
| FR-3 | T04, T07 |
| FR-4 | T05, T07 |
| FR-5 | T06, T07 |
| FR-6 | T06, T07 |
| FR-7 | T01, T07 |

## E. The gates

CI: none defined (no workflow in the repo). Local: `for f in *.js */*.js; do node --check "$f" || exit 1; done`.

## F. Log

- 2026-11-18 · base · `ed24005`, árbol limpio · modo round; fixture de 101: cuenta `datos…@example.com`, sensores 7–10 (7, 8, 9 con el simulador cada 5 s, intervalo 1 min; 10 sin lecturas)
- 2026-11-18 · T01 · done · carga `../api.js`; sin token va a `login.html` (en vivo); sin `localStorage`; quedan solo "Modificar fechas de riego" (FR-7.a en vivo)
- 2026-11-18 · T02 · done · lista desde `/sensors` (en vivo #7–10 con tipo, conexión, intervalo, límites, Activo; "Máx: —" tras vaciar el del 10 por API); "Aún no registras sensores." por consola. Nota: la pestaña tenía la sesión de otra cuenta (sensores 1–6 "string"); solo se leyó, y las revisiones siguen con la cuenta de prueba
- 2026-11-18 · T03 · done · estado de conexión desde `/conditions` con umbral de 2 intervalos y qué revisar; en vivo Conectado → Sin señal al detener el simulador; Esperando en el 10
- 2026-11-18 · round 1 · T01–T03 · gates green; FR-1, FR-2.a–d, FR-7 en §10 (FR-2.e con T06); revisión sin desvíos
- 2026-11-18 · T04 · done · formulario de registro y caja de clave; en vivo: rechazo 95/90 conserva lo escrito; sensor 11 registrado, su clave aceptada por el simulador (201), no está en `localStorage`
- 2026-11-18 · T05 · done · edición con tipo/conexión deshabilitados, `PATCH` solo con lo cambiado, límite vacío = `null`; un intervalo fuera de la lista se muestra para no cambiarlo sin querer
- 2026-11-18 · T06 · done · desactivar (confirmación, 403 en el simulador), activar sin confirmación, clave nueva (confirmación, la vieja da 401)
- 2026-11-18 · round 2 · T04–T06 · revisión: 2 errores hallados y corregidos en la ronda — (1) el botón "Registrar sensor" pasaba el evento del clic como sensor y abría el formulario en modo edición (`PATCH /sensors/undefined`); (2) la opción de intervalo fuera de la lista quedaba para registros siguientes. Ambos revisados de nuevo en vivo
- 2026-11-18 · T07 · done · todos los bullets en spec §10
- 2026-11-18 · round 3 · T07 · gates green; todos los bullets con revisión en vivo; spec `built`
