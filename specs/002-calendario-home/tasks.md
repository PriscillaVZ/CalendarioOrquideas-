# 002 — Calendario de riego y Home conectados · Tasks

Status: as-built · Spec: `spec.md` · Plan: `plan.md`

Reconstrucción de cómo se construyó (commit `444dbab`). Las revisiones en vivo necesitan el backend en
`:8000`, `python3 -m http.server 8080` en la raíz del repo y una sesión iniciada (001).

## A. Páginas y cliente compartido
- [x] **T01 — Leer los riegos del backend** · FR-1.b, FR-1.e
  `calendario.js`: `cargarRiegos()` pide `/schedules?active_only=true` y los convierte a `{id, fecha, hora}`; `actualizarPantalla()` avisa si falla.
  *Made when:* `grep -n "async function cargarRiegos" calendario.js` lo encuentra y `node --check calendario.js` pasa.
- [x] **T02 — Marcar días con riego** · FR-1.a, FR-1.c, FR-1.d · after T01
  `calendario.js`: `mostrarCalendario()` sin cambios de dibujo; marca con `riegos.some(r => r.fecha === fecha)`.
  *Made when:* con un riego el 1-12, diciembre muestra el día 1 con clase `programado`.
- [x] **T03 — Lista de riegos del día en la ventana** · FR-2.a, FR-2.b, FR-2.c, FR-2.d, FR-2.e
  `index.html`: `#riegosDelDia`; `calendario.js`: `abrirModal()`, `seleccionarRiego()`, `mostrarRiegosDelDia()`, `cerrarVentana()` limpia `riegoEnEdicion`; `styles.css`: `.seleccionado`.
  *Made when:* pulsar un día con dos riegos lista ambas horas; pulsar una muestra "Actualizar riego".

— checkpoint: el calendario muestra los riegos del backend —

- [x] **T04 — Guardar riego nuevo o cambiar su hora** · FR-3.a, FR-3.b, FR-3.c, FR-3.d, FR-3.e, FR-4.a, FR-4.b · after T03
  `calendario.js`: sin `riegoEnEdicion` hace `POST /schedules`; con él, `PATCH` con `irrigation_time`. Se quitó la validación de fecha pasada local.
  *Made when:* dos riegos el mismo día quedan en `/schedules`; una fecha pasada muestra el rechazo del backend.
- [x] **T05 — Eliminar = desactivar** · FR-5.a, FR-5.b, FR-5.c · after T03
  `calendario.js`: confirma y hace `PATCH {is_active: false}`; relee.
  *Made when:* tras eliminar, el riego no aparece en `/schedules?active_only=true` ni en la pantalla.
- [x] **T06 — Próximos riegos desde hoy** · FR-6.a, FR-6.b, FR-6.c · after T01
  `calendario.js`: `mostrarProximosRiegos()` filtra `fecha >= hoy`, en el orden del backend.
  *Made when:* sin riegos futuros se lee "No hay riegos programados.".

— checkpoint: programar, cambiar y quitar riegos —

- [x] **T07 — Avisos del navegador desde el backend** · FR-7.a, FR-7.b, FR-7.c, FR-7.d, FR-7.e · after T01
  `calendario.js`: `comprobarNotificaciones()` pide `/notifications?unread_only=true` cada 30 s y recuerda ids en `notificacionesEnviadas`.
  *Made when:* `grep -n "unread_only=true" calendario.js` lo encuentra.
- [x] **T08 — Home lee los riegos del backend** · FR-8.a, FR-8.b
  `Home/home.html`: carga `../api.js`; `Home/home.js`: `cargarRiegosHome()` y redibuja.
  *Made when:* Home en diciembre marca el día 1 con un riego ese día.
- [x] **T09 — Revisión en vivo** · FR-1.b, FR-2.a, FR-2.b, FR-2.c, FR-3.b, FR-3.c, FR-3.d, FR-3.e, FR-4.a, FR-5.a, FR-5.b, FR-5.c, FR-6.a, FR-8.a, FR-8.b
  Navegador de Orca; anotada en spec §10 (2026-11-18).
  *Made when:* la entrada de §10 *Taken while building* existe.

— checkpoint: calendario y Home conectados —

## C. What could change
- [ ] **T10 — Revisar en vivo los bullets que faltan** · FR-1.a, FR-1.c, FR-1.d, FR-1.e, FR-2.d, FR-2.e, FR-3.a, FR-4.b, FR-6.b, FR-6.c
  Casos de plan §5 sin revisión; anotarlos en spec §10.
  *Made when:* esos bullets aparecen en §10 *Taken while building*.
- [ ] **T11 — Revisar en vivo los avisos del navegador** · FR-7.a, FR-7.b, FR-7.c, FR-7.d, FR-7.e
  El navegador de Orca bloquea notificaciones; revisarlos en un navegador con permiso concedido (p. ej. con `tools/sensor_sim.py` del backend para provocar una alerta).
  *Made when:* §10 cita FR-7.a–e.
- [ ] **T12 — Quitar código de la versión local** · —
  `calendario.js`: nada lee ni escribe `localStorage.riegos`; confirmar y borrar la clave vieja de navegadores de prueba si molesta.
  *Made when:* `grep -rn '"riegos"' --include=*.js .` no encuentra nada.
- [x] **T13 — Avisar una sola vez del permiso bloqueado** · FR-7.a
  `calendario.js`: `solicitarPermisoNotificaciones()` muestra el aviso de bloqueo en cada guardado. Avisar una vez por sesión o mostrarlo en la página.
  *Made when:* con el permiso bloqueado, dos guardados seguidos muestran el aviso una vez.
  Cerrada por 103 T06: guardar ya no pide permiso (spec §10 D8).
- [x] **T14 — Avisos en todas las páginas** · FR-7.b
  Lo hace 103 (sus avisos del navegador reemplazan FR-7.b–e de este spec).
  *Made when:* 103 está `built`. Cerrada: 103 `built` el 2026-11-18 (spec §10 D8).

## D. Requirement coverage

| FR | Tareas |
|---|---|
| FR-1 | T01, T02, T09, T10 |
| FR-2 | T03, T09, T10 |
| FR-3 | T04, T09, T10 |
| FR-4 | T04, T09, T10 |
| FR-5 | T05, T09 |
| FR-6 | T06, T09, T10 |
| FR-7 | T07, T11, T13, T14 |
| FR-8 | T08, T09 |

## E. The gates

CI: none defined (no workflow in the repo). Local: `for f in *.js */*.js; do node --check "$f" || exit 1; done`.

## F. Log

- 2026-11-18 · T01–T08 · hechas · commit `444dbab` en `conexion-backend`, antes del spec.
- 2026-11-18 · T09 · hecha · revisión en vivo en el navegador de Orca.
