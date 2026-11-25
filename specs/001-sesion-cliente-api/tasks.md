# 001 — Sesión y cliente de la API · Tasks

Status: as-built · Spec: `spec.md` · Plan: `plan.md`

Reconstrucción de cómo se construyó (commit `444dbab`). *Made when:* son revisiones que se pueden correr
hoy: `node --check` para que el script se lea, `grep` para ubicar la definición, y la revisión en vivo
con el backend en `:8000` y `python3 -m http.server 8080` en la raíz del repo.

## A. Páginas y cliente compartido
- [x] **T01 — Token y cierre de sesión** · FR-3.b, FR-3.d
  `api.js`: `obtenerToken()` lee `localStorage.token`; `cerrarSesion()` lo borra y va a `LOGIN_URL`.
  *Made when:* `grep -n "function cerrarSesion" api.js` lo encuentra y `node --check api.js` pasa.
- [x] **T02 — Petición con token y cuerpo** · FR-1.a
  `api.js`: `api(ruta, {method, body, form})` pone `Authorization: Bearer`, JSON o formulario.
  *Made when:* `grep -n "async function api" api.js` lo encuentra.
- [x] **T03 — Rechazos legibles** · FR-4.a, FR-4.b, FR-4.c, FR-4.d
  `api.js`: `mensajeDeError()` lee `detail` (texto o lista); `fetch` caído da "No se pudo conectar con el servidor.".
  *Made when:* en la consola de una página con sesión, `api("/schedules", {method: "POST", body: {}})` rechaza con los `msg` unidos.
- [x] **T04 — Sesión vencida** · FR-3.b, FR-3.c · after T01
  `api.js`: un 401 que no viene del formulario de inicio de sesión llama a `cerrarSesion()`.
  *Made when:* con `localStorage.token = "x"`, recargar `index.html` termina en `login.html`.
- [x] **T05 — Redirección sin token e ícono de perfil** · FR-3.a, FR-3.d · after T01
  `api.js`: al cargar, sin token y fuera de `login.html` llama a `cerrarSesion()`; `.perfil` cierra sesión al pulsarlo.
  *Made when:* sin token, abrir `index.html` termina en `login.html`.

— checkpoint: el cliente se carga en cualquier página y redirige sin sesión —

- [x] **T06 — Formulario de inicio de sesión** · FR-1.a, FR-1.b, FR-1.c · after T02
  `login.html`: correo y contraseña; envía el formulario `username`/`password`, guarda el token, abre Home; el rechazo va a `#mensajeLogin`.
  *Made when:* entrar con una cuenta abre `Home/home.html`; con otra contraseña aparece "Email o contraseña incorrectos".
- [x] **T07 — Modo crear cuenta** · FR-2.a, FR-2.b, FR-2.c, FR-2.d · after T06
  `login.html`: "Crear cuenta" muestra Nombre (`maxlength` 100, correo 150), registra y entra.
  *Made when:* registrar un correo `@example.com` nuevo abre Home; repetirlo muestra "El email ya está registrado".
- [x] **T08 — Páginas conectadas cargan el cliente** · FR-3.a · after T05
  `index.html`, `Home/home.html`: `<script src="api.js">` (o `../api.js`) antes del script de la página.
  *Made when:* `grep -n "api.js" index.html Home/home.html` muestra ambas.

— checkpoint: entrar, usar el calendario y Home, cerrar sesión —

- [x] **T09 — Revisión en vivo** · FR-1.a, FR-1.b, FR-1.c, FR-3.a, FR-4.a
  Navegador de Orca contra el backend local; anotada en spec §10 (2026-11-18).
  *Made when:* la entrada de §10 *Taken while building* existe.

## C. What could change
- [ ] **T10 — Reintento tras registro aceptado** · FR-2.b
  `login.html`: si el registro se aceptó y el inicio de sesión falló, el siguiente envío vuelve a registrar. Pasar a modo entrar tras un registro aceptado.
  *Made when:* con el backend detenido justo después de registrar, reenviar intenta solo entrar.
- [ ] **T11 — Datos y Configuración exigen sesión; Datos con encabezado** · FR-3.a, FR-3.d
  `Datos/datos.html`, `Configuracion/configuracion.html` no cargan `api.js` (lo hacen 101 T01 y 102 T01); Datos no tiene `.perfil` (lo agrega 103 T01).
  *Made when:* sin token, abrir `Datos/datos.html` termina en `login.html`, y Datos tiene el ícono de perfil.
- [ ] **T12 — Revisar en vivo los bullets que faltan** · FR-2.a, FR-2.b, FR-2.c, FR-2.d, FR-3.b, FR-3.c, FR-3.d, FR-4.b, FR-4.c, FR-4.d
  Correr los casos de plan §5 que no se revisaron y anotarlos en spec §10.
  *Made when:* `sdd_check.py specs/001-sesion-cliente-api` no lista bullets sin revisión.

## D. Requirement coverage

| FR | Tareas |
|---|---|
| FR-1 | T02, T06, T09 |
| FR-2 | T07, T10, T12 |
| FR-3 | T01, T04, T05, T08, T11, T12 |
| FR-4 | T03, T09, T12 |

## E. The gates

CI: none defined (no workflow in the repo). Local: `for f in *.js */*.js; do node --check "$f" || exit 1; done`.

## F. Log

- 2026-11-18 · T01–T08 · hechas · commit `444dbab` en `conexion-backend`, antes del spec.
- 2026-11-18 · T09 · hecha · revisión en vivo en el navegador de Orca.
