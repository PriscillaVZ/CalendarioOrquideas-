# 002 — Calendario de riego y Home conectados · Implementation plan

Status: as-built · Spec: `spec.md` · Reference: `specs/sdd.profile.md`

## 1. Module structure

### A. Páginas y cliente compartido

| Archivo | Contiene | FR |
|---|---|---|
| `index.html` | Calendario, ventana `#modalRiego` con `#riegosDelDia`, panel `#listaRiegos`; carga `api.js` y `calendario.js` | FR-1, FR-2, FR-6 |
| `calendario.js` | Estado `riegos`, `fechaEnEdicion`, `riegoEnEdicion`; `cargarRiegos()`, `mostrarCalendario()`, `abrirModal()`, `seleccionarRiego()`, `mostrarRiegosDelDia()`, guardar, eliminar, `mostrarProximosRiegos()`, `comprobarNotificaciones()`, `actualizarPantalla()` | FR-1 a FR-7 |
| `styles.css` | `#riegosDelDia .riego-item` clicable y `.seleccionado` | FR-2.c |
| `Home/home.js` | `cargarRiegosHome()`, `mostrarCalendarioHome()`; el reloj no cambia | FR-8 |
| `Home/home.html` | Carga `../api.js` antes de `home.js` | FR-8 |

## 2. Data model

Respuesta de `GET /schedules?active_only=true` (backend 101 FR-2), ordenada por fecha, hora, id:

```json
[{ "id": 2, "irrigation_date": "2026-12-01", "irrigation_time": "18:00:00", "is_active": true }]
```

En la página cada entrada se vuelve `{ id, fecha: "2026-12-01", hora: "18:00" }` (hora cortada a
`HH:MM`, el formato del selector de hora).

Avisos, `GET /notifications?unread_only=true` (backend 104): se usan `id`, `type`, `message`.

| Clave de `localStorage` | Valor | FR |
|---|---|---|
| `notificacionesEnviadas` | lista de ids de avisos ya mostrados en este navegador | FR-7.e |
| `riegos` | ya no se escribe ni se lee (versión local anterior) | — |

## 3. Surface

| Página | Muestra | Llamadas | FR |
|---|---|---|---|
| `index.html` al abrir | Mes actual con marcas, próximos riegos | `GET /schedules?active_only=true` | FR-1.b, FR-6 |
| Guardar riego nuevo | — | `POST /schedules` `{irrigation_date, irrigation_time}` | FR-3.b, FR-3.c |
| Guardar riego cargado | — | `PATCH /schedules/{id}` `{irrigation_time}` | FR-4.a |
| Eliminar | — | `PATCH /schedules/{id}` `{is_active: false}` | FR-5.b |
| Cada 30 s con permiso | Notificación del navegador | `GET /notifications?unread_only=true` | FR-7.b–e |
| `Home/home.html` al abrir | Calendario pequeño con marcas | `GET /schedules?active_only=true` | FR-8.a |

Tras guardar o eliminar con éxito: cerrar la ventana y `actualizarPantalla()` (vuelve a leer y dibuja).

## 4. Technical decisions

- **D1 — La ventana lista los riegos del día y uno se elige para editar** (`riegoEnEdicion` = id o
  `null`). *Descartado:* una fila editable por riego con sus botones: más marcado para el mismo flujo;
  reutilizar la hora y los botones existentes mantiene la ventana como estaba. (FR-2)
- **D2 — Releer todo tras cada cambio** en vez de parchear la lista local. *Por qué:* son pocos riegos
  y así la pantalla es siempre lo que dice el backend (regla 1). (FR-3.e, FR-5.c)
- **D3 — `PATCH` envía solo lo cambiado** (backend 101 FR-3: un campo omitido no cambia). (FR-4.a, FR-5.b)
- **D4 — Home lee los riegos una vez y dibuja dos veces** (vacío al instante, marcado al llegar). *Por
  qué:* el calendario no espera a la red para aparecer. (FR-8.a)
- **D5 — Avisos con `setInterval` de 30 s**, sin service worker. *Descartado:* push: el backend no lo
  ofrece (backend 104 D1). (FR-7.b)

## 5. Test strategy

Revisiones en vivo en el navegador de Orca (perfil), anotadas en spec §10.

| Bullet | Caso (Given / When / Then) | Kind |
|---|---|---|
| FR-1.a | Given hoy 18-11-2026 / When se abre el calendario / Then "Noviembre 2026", lunes primero, día 18 con clase `hoy` | positive |
| FR-1.b | Given riegos en el backend / When se abre / Then `riegos` tiene sus fechas y horas | event |
| FR-1.c | Given un riego el 1-12 / When se ve diciembre / Then el día 1 tiene clase `programado` | positive |
| FR-1.d | Given noviembre / When se pulsa ">" / Then "Diciembre 2026" con sus marcas | event |
| FR-1.e | Given el backend apagado / When se abre / Then aviso "No se pudieron cargar los riegos: No se pudo conectar con el servidor." | negative |
| FR-2.a | Given dos riegos el 1-12 / When se pulsa el 1 / Then la ventana lista ambas horas | event |
| FR-2.b | Given la ventana abierta / Then hora vacía, "Guardar riego", sin "Eliminar" | event |
| FR-2.c | Given la ventana / When se pulsa "Hora: 18:00" / Then hora 18:00, "Actualizar riego", "Eliminar" | event |
| FR-2.d | Given 18:00 cargado / When se pulsa de nuevo / Then hora vacía, "Guardar riego" | event |
| FR-2.e | Given la ventana / When "Cancelar" / Then se cierra y el backend no recibe nada | event |
| FR-3.a | Given la ventana sin hora / When "Guardar riego" / Then "Por favor, selecciona una hora de riego." | negative |
| FR-3.b | Given 1-12 / When se guarda 07:00 / Then `POST /schedules` con 2026-12-01 y 07:00 | event |
| FR-3.c | Given 1-12 con 18:00 / When se guarda 07:00 / Then ambos riegos existen | event |
| FR-3.d | Given 1-10-2026 / When se guarda 10:00 / Then "La fecha y hora de riego deben ser futuras", ventana abierta | negative |
| FR-3.e | Given un guardado aceptado / Then la ventana se cierra y la lista se vuelve a leer | event |
| FR-4.a | Given 18:00 cargado / When se cambia a 19:30 y se guarda / Then `PATCH` con solo `irrigation_time` | event |
| FR-4.b | Given el cambio aceptado / Then "El horario del riego fue actualizado correctamente." | event |
| FR-5.a | Given 07:00 cargado / When "Eliminar" / Then pide confirmación | event |
| FR-5.b | Given la confirmación / Then `PATCH` con `is_active: false` | event |
| FR-5.c | Given la desactivación aceptada / Then 07:00 no está en el calendario ni en próximos | event |
| FR-6.a | Given riegos futuros / Then "Martes 1 de Diciembre / Hora: 19:30" | positive |
| FR-6.b | Given riegos 2-12 08:00 y 1-12 19:30 / Then 1-12 aparece primero | positive |
| FR-6.c | Given ningún riego futuro / Then "No hay riegos programados." | negative |
| FR-7.a | Given permiso sin decidir / When se guarda / Then el navegador pide permiso | event |
| FR-7.b | Given permiso concedido / When pasan 30 s / Then hay una petición `GET /notifications?unread_only=true` | state |
| FR-7.c | Given un recordatorio nuevo en el backend / When llega la consulta / Then aparece la notificación | event |
| FR-7.d | Given un recordatorio y una alerta / Then sus títulos son los de FR-7.d | positive |
| FR-7.e | Given un aviso ya mostrado / When se recarga la página / Then no vuelve a aparecer | positive |
| FR-8.a | Given un riego el 1-12 / When se abre Home y se va a diciembre / Then el día 1 tiene clase `riego` | event |
| FR-8.b | Given Home en noviembre / When ">" / Then "Diciembre 2026" | event |

## 6. Build order

1. `cargarRiegos()` y adaptar `mostrarCalendario()` a la lista del backend.
2. Ventana: `#riegosDelDia`, `seleccionarRiego()`, `mostrarRiegosDelDia()`.
3. Guardar (POST / PATCH) y eliminar (PATCH `is_active`).
4. Próximos riegos desde hoy.
5. Avisos desde el backend.
6. Home: `cargarRiegosHome()`.
7. Revisión en vivo.

## 7. Requirement coverage

| FR | Secciones |
|---|---|
| FR-1 | §1, §2, §3, §5 |
| FR-2 | §1, §3, §4 D1, §5 |
| FR-3 | §1, §3, §4 D2, §5 |
| FR-4 | §1, §3, §4 D3, §5 |
| FR-5 | §1, §3, §4 D2, D3, §5 |
| FR-6 | §1, §3, §5 |
| FR-7 | §1, §2, §3, §4 D5, §5 |
| FR-8 | §1, §3, §4 D4, §5 |
