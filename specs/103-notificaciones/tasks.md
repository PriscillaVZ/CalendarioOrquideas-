# 103 — Notificaciones en la app · Tasks

Status: built · Spec: `spec.md` · Plan: `plan.md`

Las revisiones en vivo necesitan el backend en
`:8000`, `python3 -m http.server 8080` y una sesión; para tener avisos, un riego a 1–2 minutos y el
simulador del backend con una lectura fuera de rango.

## A. Páginas y cliente compartido
- [x] **T01 — Encabezado en Datos** · FR-1.b
  `Datos/datos.html`: `header.encabezado` con título y `.perfil`, como las demás páginas (también da el cierre de sesión de 001 FR-3.d).
  *Made when:* `grep -c 'class="perfil"' Datos/datos.html` es 1.
- [x] **T02 — Campana y contador** · FR-1.a, FR-1.b, FR-1.c, FR-1.d · after T01
  `notificaciones.js`: inserta la campana antes de `.perfil`, lee no leídos al abrir y cada 30 s; las cuatro páginas lo cargan tras `api.js`; `styles.css`.
  *Made when:* con un aviso sin leer, la campana muestra "1" en Home, Calendario, Datos y Configuración.

— checkpoint: el contador se ve en todas las páginas —

- [x] **T03 — Lista de avisos** · FR-2.a, FR-2.b, FR-2.c, FR-2.d, FR-2.e, FR-2.f · after T02
  `notificaciones.js`: `#panelAvisos`, `abrirLista()` con `GET /notifications`; `styles.css`.
  *Made when:* pulsar la campana lista un recordatorio con "Recordatorio de riego", fecha y hora, y "Sin leer".
- [x] **T04 — Marcar como leído** · FR-3.a, FR-3.b, FR-3.c · after T03
  `notificaciones.js`: `marcarLeido(aviso)` con `PATCH`, actualiza el aviso y el contador.
  *Made when:* pulsar un aviso sin leer baja el contador en 1 y `GET /notifications?unread_only=true` ya no lo trae.
- [x] **T05 — Notificaciones del navegador en todas las páginas** · FR-4.a, FR-4.b, FR-4.c, FR-4.d · after T02
  `notificaciones.js`: `notificarNuevos()` con `notificacionesEnviadas`; `calendario.js`: quitar `comprobarNotificaciones()` y su intervalo.
  *Made when:* `grep -n "comprobarNotificaciones" calendario.js` no encuentra nada y, con permiso, un recordatorio aparece estando en Configuración.
- [x] **T06 — Pedir el permiso desde la lista** · FR-5.a, FR-5.b, FR-5.c, FR-5.d · after T03
  `notificaciones.js`: botón y textos de FR-5; `calendario.js`: quitar `solicitarPermisoNotificaciones()` (002 FR-7.a; 002 T13 deja de aplicar).
  *Made when:* con el permiso sin decidir, la lista ofrece "Activar avisos del navegador"; guardar un riego ya no pide permiso.

— checkpoint: avisos completos en todas las páginas —

- [x] **T07 — Revisión en vivo** · FR-1.a, FR-1.b, FR-1.c, FR-1.d, FR-2.a, FR-2.b, FR-2.c, FR-2.d, FR-2.e, FR-2.f, FR-3.a, FR-3.b, FR-3.c, FR-4.a, FR-4.b, FR-4.c, FR-4.d, FR-5.a, FR-5.b, FR-5.c, FR-5.d
  Casos de plan §5; las notificaciones del navegador en un navegador con permiso. Anotarlos en spec §10.
  *Made when:* `sdd_check.py specs/103-notificaciones` lista todos los bullets como revisión en vivo.
- [x] **T08 — Actualizar 002** · —
  `specs/002-calendario-home/spec.md`: marcar FR-7.b–e como reemplazados por 103 y FR-7.a por 103 FR-5 (§10, con el motivo).
  *Made when:* 002 §10 nombra 103 como reemplazo de FR-7.

— checkpoint: spec `built` —

## C. What could change
- [ ] **T09 — Revisar las notificaciones en un navegador real con permiso** · FR-4.a, FR-4.b, FR-4.d
  El navegador de Orca las bloquea; se revisaron con `Notification` sustituido. Falta ver la ventana del sistema y su clic.
  *Made when:* en Chrome o Firefox con permiso, un recordatorio sale como ventana del sistema con su título y al pulsarla se abre la lista.

## D. Requirement coverage

| FR | Tareas |
|---|---|
| FR-1 | T01, T02, T07 |
| FR-2 | T03, T07 |
| FR-3 | T04, T07 |
| FR-4 | T05, T07 |
| FR-5 | T06, T07 |

## E. The gates

CI: none defined (no workflow in the repo). Local: `for f in *.js */*.js; do node --check "$f" || exit 1; done`.

## F. Log

- 2026-11-18 · base · `7c37c6c`, árbol limpio · modo round; fixture: cuenta nueva `avisos…@example.com` (contraseña aleatoria, no guardada) en un perfil aislado del navegador de Orca (la pestaña principal tiene la sesión del dueño: no se toca), riegos 7 y 8, sensor 13
- 2026-11-18 · T01 · done · encabezado con `.perfil` en Datos (`grep -c` = 1); título a `.encabezado h1` en `datos.css`
- 2026-11-18 · T02 · done · `notificaciones.js` cargado en las cuatro páginas; "2" en las cuatro (en vivo); sube sin recargar
- 2026-11-18 · round 1 · T01–T02 · gates green; floor limpio (no hay pruebas); FR-1 en §10; D6 anotada (grupo campana + perfil, `datos.css` fuera de plan §1)
- 2026-11-18 · T03 · done · panel con la lista (más reciente arriba, tipo, mensaje, fecha y hora, "Sin leer"/"Leído"); cierra con la campana y con Escape
- 2026-11-18 · T04 · done · `PATCH` al pulsar un no leído; contador 3 → 2; rechazo con `fetch` caído deja "Sin leer"
- 2026-11-18 · T05 · done · `notificarNuevos()` en la lectura periódica; ids releídos de `localStorage` en cada consulta y `tag` por aviso; `calendario.js` sin `comprobarNotificaciones` (grep vacío); en Datos salió solo el 73
- 2026-11-18 · T06 · done · botón y textos de FR-5; guardar un riego ya no pide permiso (0 pedidos con permiso sin decidir)
- 2026-11-18 · round 2 · T03–T06 · gates green; floor limpio; revisión sin desvíos. Nota: a las 21:35:44 la pestaña de prueba se recargó y el aviso 72 quedó leído sin acción de las revisiones (probablemente un clic en la pestaña); se repitió FR-4.a con el riego 10
- 2026-11-18 · T07 · done · todos los bullets en spec §10; FR-4 con `Notification` sustituido → §C T09 para un navegador real
- 2026-11-18 · T08 · done · 002 §10 D8 nombra 103 como reemplazo de FR-7; 002 T13 y T14 cerradas por 103
- 2026-11-18 · round 3 · T07–T08 · gates green; spec `built`

