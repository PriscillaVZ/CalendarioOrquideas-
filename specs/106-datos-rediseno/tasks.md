# 106 — Datos del rediseño · Tasks

Status: built · Spec: `spec.md` · Plan: `plan.md`

Requiere 104 construido y `estadoLectura` en `api.js` (105 T01). Revisiones en vivo con backend en
`:8000`, servidor sin caché en `:8080`, cuenta `@example.com` en un perfil aislado de Orca y el simulador
del backend (claves por tubería, nunca impresas); comparar con `docs/rediseno-maqueta.html`.

## A. Páginas y cliente compartido
- [x] **T01 — Franja de estado** · FR-1.a, FR-1.b, FR-1.c
  `datos.html`/`datos.js`/`datos.css`: `.estado` con clase de color, `.pulse` y "Última lectura hace …".
  *Made when:* con un sensor fuera de rango la franja es roja y dice "Última lectura hace N min"; sin sensores, gris y sin antigüedad.
- [x] **T02 — Periodo en el encabezado** · FR-2.a, FR-2.b, FR-2.c · after T01
  `datos.html`: `.periodo` con dos botones en `.head-tools`; `datos.js`: `aria-pressed` y recarga del historial; `small.per` de cada gráfico.
  *Made when:* `grep -c '<select id="periodo"' Datos/datos.html` es 0; pulsar "7 días" lo deja presionado y los gráficos dicen "últimos 7 días".
- [x] **T03 — Tarjetas con barra de rango** · FR-3.a, FR-3.b, FR-3.c, FR-3.d, FR-3.e, FR-3.f · after T01
  `datos.js`: `mostrarTarjetas()` con tipo, chip, `barraRango()` (escala de plan §2) y pie; `datos.css`: `.sensor`, `.rango`.
  *Made when:* un sensor 60–80 % con 68 % muestra la franja y el marcador en su lugar; uno sin máximo, la franja hasta el borde y "sin máximo"; uno sin lecturas, "Esperando la primera lectura".

— checkpoint: estado y tarjetas como la maqueta —

- [x] **T04 — Gráficos con franja y eje del periodo** · FR-4.a, FR-4.b, FR-4.c · after T02
  `datos.js`: series de la franja con `fill: "-1"`, `scales.x.min/max` del periodo, colores de las variables CSS.
  *Made when:* con un sensor de temperatura 18–24 hay franja y "Rango ideal"; con dos de humedad de límites distintos, no; con una sola lectura el eje va de hace 24 h a ahora.
- [x] **T05 — Tabla con conteo y chips** · FR-5.a, FR-5.b · after T02
  `datos.js`: `#conteo` "N lecturas", estado como `.chip`.
  *Made when:* la tabla muestra "N lecturas" igual al número de filas y chips de color.

— checkpoint: Datos como la maqueta —

- [x] **T06 — Revisión en vivo** · FR-1.a, FR-1.b, FR-1.c, FR-2.a, FR-2.b, FR-2.c, FR-3.a, FR-3.b, FR-3.c, FR-3.d, FR-3.e, FR-3.f, FR-4.a, FR-4.b, FR-4.c, FR-5.a, FR-5.b
  Casos de plan §5 en claro y oscuro, a 1280 y 390 px; anotados en spec §10.
  *Made when:* `sdd_check.py specs/106-datos-rediseno` lista todos los bullets como revisión en vivo.
- [x] **T07 — Actualizar 101** · —
  `specs/101-datos-tiempo-real/spec.md` §10: FR-1.c y FR-4.a reemplazados por 106 (con el motivo).
  *Made when:* 101 §10 nombra 106.

— checkpoint: spec `built` —

## C. What could change

None yet.

## D. Requirement coverage

| FR | Tareas |
|---|---|
| FR-1 | T01, T06 |
| FR-2 | T02, T06 |
| FR-3 | T03, T06 |
| FR-4 | T04, T06 |
| FR-5 | T05, T06 |

## E. The gates

CI: none defined (no workflow in the repo). Local: `for f in *.js */*.js; do node --check "$f" || exit 1; done`.

## F. Log

2026-11-21 · base · `38113a9`, árbol limpio · sin test command: revisiones en vivo (perfil)
2026-11-21 · T01 · done · `.estado` con clase ok/hot/none, `.pulse`, `#textoEstado` y "Última lectura …"; `antiguedad` movida de `home.js` a `api.js` (estructural) y ahora acepta ISO o milisegundos · en vivo
2026-11-21 · T02 · done · `.periodo` con `#p24`/`#p168` y `aria-pressed`; sin `<select id="periodo">`; `small.per` en cada gráfico · en vivo
2026-11-21 · T03 · done · `.sensor` con tipo, chip, `barraRango()` y pie; la escala de temperatura usa mín, máx y valor juntos (el pseudocódigo de plan §2 dejaba la franja fuera de la escala con un solo límite); `formatearFechaHora` sin coma ("21/11 21:04:40") · en vivo
2026-11-21 · round 1 · T01–T03 · gates green; a 390 px la franja partía el punto del texto (corregido en `datos.css`); la tabla conserva su chip viejo bajo `td .estado` hasta T05
2026-11-21 · T04 · done · franja con dos series (`fill: "-1"`, o `"start"`/`"end"` con un lado vacío), `scales.x.min/max` del periodo, marcas en horas locales con `afterBuildTicks`, colores de `--brand-2`/`--orchid`/`--band`/`--muted`/`--line`, punto para una sola lectura, `aria-label` por periodo · en vivo
2026-11-21 · T05 · done · `#conteo` "N lecturas", estado como `.chip`, valor en `td.num`; tabla en `.tabla` de `styles.css` · en vivo
2026-11-21 · round 2 · T04–T05 · gates green; revisión propia: una sola lectura no se veía y las marcas caían en horas sueltas (corregidos en T04); el cambio de tema llega a los gráficos en la siguiente actualización (≤ 30 s), aceptable (plan D3: colores en cada dibujo); Proposed en spec §10
2026-11-21 · base round 3 · `35730ef`, árbol limpio
2026-11-21 · T06 · done · capturas en claro a 1280 y oscuro a 390 px; el resto de combinaciones en las rondas 1 y 2
2026-11-21 · T07 · done · 101 §10 D7 nombra 106
2026-11-21 · round 3 · T06–T07 · gates green; Proposed de la ronda 2 aprobado como D5; spec `built`
