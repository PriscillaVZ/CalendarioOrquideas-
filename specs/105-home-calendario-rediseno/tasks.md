# 105 — Home y Calendario del rediseño · Tasks

Status: built · Spec: `spec.md` · Plan: `plan.md`

Requiere 104 construido (sistema en `styles.css`, marco en las páginas). Revisiones en vivo con backend en
`:8000`, servidor sin caché en `:8080`, cuenta `@example.com` en un perfil aislado de Orca; comparar con
`docs/rediseno-maqueta.html`.

## A. Páginas y cliente compartido
- [x] **T01 — Lecturas de Home con estado, rango y antigüedad** · FR-1.a, FR-1.b, FR-1.c, FR-1.d, FR-1.e
  `api.js`: `estadoLectura` movida desde `datos.js`; `home.html`/`home.js`/`home.css`: tarjetas `.lectura` con chip, "Ideal …" y antigüedad.
  *Made when:* con un sensor de temperatura 18–24 °C y una lectura de 25 °C, Home muestra "Calor", "Ideal 18–24 °C · hace N min"; Datos sigue mostrando sus estados.
- [x] **T02 — Próximo riego** · FR-2.a, FR-2.b, FR-2.c, FR-2.d, FR-2.e, FR-2.f · after T01
  `home.js`: riegos con hora, `proximoRiego()`, `textoDia()`, `textoFalta()`, `mostrarProximo()` cada 60 s; tarjeta `.proximo`.
  *Made when:* con riegos a 30 min y mañana, la tarjeta dice "Hoy, HH:MM · Faltan 30 min"; sin riegos futuros, "No hay riegos programados.".
- [x] **T03 — Calendario pequeño y reloj** · FR-3.a, FR-3.b, FR-3.c · after T01
  `styles.css`: `.cal`, `.dia` y estados compartidos; `home.js`: días pasados atenuados; reloj SVG y `#fechaHoy`.
  *Made when:* Home muestra los días anteriores atenuados, el reloj SVG avanzando y "… · hora del dispositivo".

— checkpoint: Home como la maqueta —

- [x] **T04 — Calendario grande con horas y "Hoy"** · FR-3.a, FR-4.a, FR-4.b, FR-4.c, FR-4.d, FR-4.e · after T03
  `index.html`/`calendario.js`: días `button.dia` con `.horas` y `aria-label`; "Hoy"; leyenda; corte de 640 px.
  *Made when:* un día con 19:30 y 08:00 muestra "08:00" sobre "19:30"; su nombre accesible es "N, 2 riegos"; "Hoy" vuelve al mes actual.
- [x] **T05 — Próximos riegos con conteo** · FR-5.a, FR-5.b · after T04
  `calendario.js`: `mostrarProximosRiegos()` con "N programados" y seis filas `.fecha-box`.
  *Made when:* con 8 riegos futuros se lee "8 programados" y 6 filas "Riego a las HH:MM".
- [x] **T06 — Ventana de un día** · FR-6.a, FR-6.b, FR-6.c, FR-6.d, FR-6.e, FR-6.f, FR-6.g, FR-6.h · after T04
  `index.html`: `<dialog id="dlgRiego">`; `calendario.js`: `showModal()`, chips con `aria-pressed`, 08:00 por defecto, `#mensajeRiego`, sin `alert()`.
  *Made when:* `grep -c "alert(" calendario.js` es 0; guardar en un día pasado muestra el rechazo en la ventana abierta; Escape cierra sin peticiones.

— checkpoint: Calendario como la maqueta —

- [x] **T07 — Revisión en vivo** · FR-1.a, FR-1.b, FR-1.c, FR-1.d, FR-1.e, FR-2.a, FR-2.b, FR-2.c, FR-2.d, FR-2.e, FR-2.f, FR-3.a, FR-3.b, FR-3.c, FR-4.a, FR-4.b, FR-4.c, FR-4.d, FR-4.e, FR-5.a, FR-5.b, FR-6.a, FR-6.b, FR-6.c, FR-6.d, FR-6.e, FR-6.f, FR-6.g, FR-6.h
  Casos de plan §5 en claro y oscuro, a 1280 y 390 px; anotados en spec §10.
  *Made when:* `sdd_check.py specs/105-home-calendario-rediseno` lista todos los bullets como revisión en vivo.
- [x] **T08 — Actualizar 002** · —
  `specs/002-calendario-home/spec.md` §10: FR-2.b, FR-2.c, FR-3.a, FR-3.d, FR-3.e, FR-4.b y FR-6.a reemplazados por 105 (con el motivo).
  *Made when:* 002 §10 nombra 105.

— checkpoint: spec `built` —

## C. What could change

None yet.

## D. Requirement coverage

| FR | Tareas |
|---|---|
| FR-1 | T01, T07 |
| FR-2 | T02, T07 |
| FR-3 | T03, T04, T07 |
| FR-4 | T04, T07 |
| FR-5 | T05, T07 |
| FR-6 | T06, T07 |

## E. The gates

CI: none defined (no workflow in the repo). Local: `for f in *.js */*.js; do node --check "$f" || exit 1; done`.

## F. Log

2026-11-21 · base · `388850a`, árbol limpio (CalendarioOrquideas-) · sin test command: revisiones en vivo (perfil)
2026-11-21 · T01 · done · `estadoLectura` movida a `api.js` (estructural); tarjetas `.lectura` con chip, rango y antigüedad · en vivo
2026-11-21 · T02 · done · `proximoRiego`, `textoDia`, `textoFalta`, `mostrarProximo` cada 60 s; `formatearFechaLarga` en `api.js` (también la usa T06) · en vivo
2026-11-21 · T03 · done · `.mes-nav`, `.cal`, `.dia` y `.leyenda` en `styles.css`; las reglas viejas de `.dia` quedan bajo `.dias-calendario` hasta T04; reloj SVG y `#fechaHoy` · en vivo
2026-11-21 · round 1 · T01–T03 · gates green; revisión propia sin hallazgos; la ventana de Orca no dibujaba capturas, se midió en la página
2026-11-21 · T04 · done · días `button.dia` con `.horas`, `data-fecha` y `aria-label`; "Hoy"; reglas viejas del calendario y del modal borradas de `styles.css` · en vivo
2026-11-21 · T05 · done · "N programados" y seis filas `.fecha-box` · en vivo
2026-11-21 · T06 · done · `<dialog id="dlgRiego">` con `novalidate`, chips con `aria-pressed` marcados en su lugar, 08:00 por defecto, errores en `#mensajeRiego`, botones deshabilitados durante la petición, foco al día tras guardar; 0 `alert(` · en vivo
2026-11-21 · round 2 · T04–T06 · gates green; revisión propia: el foco se perdía al rehacer chips y calendario (corregido en T06); singular y error de carga como Proposed en spec §10
2026-11-21 · base round 3 · `364d73c`; sin confirmar: `README.md` y `servidor.py` (guía y servidor sin caché, pedido del dueño)
2026-11-21 · T07 · done · capturas en claro y oscuro a 1280 y 390 px; el campo de hora se ve en el formato del navegador ("08:00 AM" en un navegador en inglés), no se controla desde la página
2026-11-21 · T08 · done · 002 §10 D9 nombra 105
2026-11-21 · round 3 · T07–T08 · gates green; Proposed de la ronda 2 aprobado como D6; spec `built`
