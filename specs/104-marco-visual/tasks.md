# 104 — Marco visual del rediseño · Tasks

Status: built · Spec: `spec.md` · Plan: `plan.md`

Las revisiones en vivo necesitan el backend en `:8000`, el servidor sin caché en `:8080` y una cuenta
`@example.com` en un perfil aislado del navegador de Orca (la pestaña principal tiene la sesión del
dueño). Comparar siempre con `docs/rediseno-maqueta.html`.

## A. Páginas y cliente compartido
- [x] **T01 — Sistema visual en `styles.css`** · FR-1.a, FR-1.b, FR-1.c, FR-1.d, FR-1.f
  `styles.css` reescrito con las variables claras y oscuras, base, `:focus-visible` y componentes de la maqueta; `<link>` de Google Fonts en las cuatro páginas y `login.html`.
  *Made when:* `grep -c -- "--brand-2" styles.css` ≥ 3 y en Home `getComputedStyle(document.body).fontFamily` empieza con "Inter".
- [x] **T02 — Barra lateral y "Cerrar sesión"** · FR-2.a, FR-2.b, FR-2.c, FR-2.d · after T01
  `aside.sidebar` nueva en las cuatro páginas con `aria-current`; `api.js`: `button.salir` cierra sesión; se quita `.perfil` de los HTML y de `api.js`.
  *Made when:* `grep -c 'class="perfil"' index.html */*.html` da 0 en todos y pulsar "Cerrar sesión" termina en `login.html` sin token.
- [x] **T03 — Encabezado con título, descripción y avatar** · FR-3.a, FR-3.b, FR-3.c, FR-3.d, FR-3.e · after T02
  `header.head` con los textos de FR-3.a y `.avatar`; `api.js`: `mostrarAvatar()` con `GET /auth/me` (backend 001 FR-4.a).
  *Made when:* el avatar muestra la inicial del nombre de la cuenta de prueba, y con `api` forzado a fallar en `/auth/me` (consola) muestra el ícono.

— checkpoint: marco común en las cuatro páginas —

- [x] **T04 — Lista de avisos con el diseño nuevo** · FR-4.a, FR-4.b, FR-4.c · after T03
  `notificaciones.js`: campana antes de `.avatar` con el SVG y `.count`; aviso con `.pip`, "No leído"/"Leído", `formatearFechaAviso()` de cuatro formas; clic fuera cierra.
  *Made when:* con un aviso de hoy y uno de ayer la lista dice "HH:MM" y "Ayer HH:MM", y un clic en el contenido la cierra.
- [x] **T05 — Inicio de sesión en dos columnas** · FR-5.a, FR-5.b, FR-5.c · after T01
  `login.html`: `.login-art` y `.login-form` con los textos de FR-5; el script cambia los textos al alternar el modo.
  *Made when:* `login.html` muestra la presentación y "Entrar"; "Crear cuenta" cambia a "¿Ya tienes cuenta? Iniciar sesión"; entrar sigue abriendo Home.
- [x] **T06 — Pantallas angostas y hojas de página sin duplicados** · FR-2.e, FR-5.d, FR-1.a · after T02, T05
  Cortes de 980/720/640 px del marco en `styles.css`; `home.css`, `datos.css`, `configuracion.css` sin barra, encabezado ni `.perfil`.
  *Made when:* en un `<iframe>` de 390 px Home muestra la franja con "Cerrar sesión" y `login.html` la presentación arriba; `grep -c "sidebar\|\.perfil" Home/home.css Datos/datos.css Configuracion/configuracion.css` da 0.
- [x] **T07 — Coma decimal** · FR-1.e · after T01
  `api.js`: `formatearNumero()`; `home.js`, `datos.js`, `configuracion.js` lo usan para valores y límites.
  *Made when:* una lectura de 27.4 se ve "27,4" en Home, Datos y en los límites de Configuración.

— checkpoint: marco completo —

- [x] **T08 — Revisión en vivo** · FR-1.a, FR-1.b, FR-1.c, FR-1.d, FR-1.e, FR-1.f, FR-2.a, FR-2.b, FR-2.c, FR-2.d, FR-2.e, FR-3.a, FR-3.b, FR-3.c, FR-3.d, FR-3.e, FR-4.a, FR-4.b, FR-4.c, FR-5.a, FR-5.b, FR-5.c, FR-5.d
  Casos de plan §5 en tema claro y oscuro, a 1280 y 390 px; anotados en spec §10.
  *Made when:* `sdd_check.py specs/104-marco-visual` lista todos los bullets como revisión en vivo.
- [x] **T09 — Actualizar 001 y 103** · —
  `specs/001-sesion-cliente-api/spec.md` §10: FR-3.d reemplazado por 104 FR-2.d; `specs/103-notificaciones/spec.md` §10: "No leído" y la hora corta de 104 FR-4.
  *Made when:* 001 §10 y 103 §10 nombran 104.

— checkpoint: spec `built` —

## C. What could change

None yet.

## D. Requirement coverage

| FR | Tareas |
|---|---|
| FR-1 | T01, T06, T07, T08 |
| FR-2 | T02, T06, T08 |
| FR-3 | T03, T08 |
| FR-4 | T04, T08 |
| FR-5 | T05, T06, T08 |

## E. The gates

CI: none defined (no workflow in the repo). Local: `for f in *.js */*.js; do node --check "$f" || exit 1; done`.

## F. Log

2026-11-20 · round 1 base · `b3d390f` (work tree clean) · backend :8000 con CORS_ORIGINS de :8081 (8080 lo ocupa otro proyecto), estáticos en :8081
2026-11-20 · T01 · done · live: `--brand-2` 18 veces en styles.css; Home con fuente "Inter, system-ui…" y `document.fonts.check` verdadero; paleta oscura (sistema) y clara (`data-theme`). Además, para que el tema funcione ya: quitadas de home/datos/configuracion.css las copias de body, barra, encabezado y `.perfil` (mitad de T06) y sus colores fijos pasados a variables; las reglas de la campana (103) y del calendario quedan al final de styles.css con variables, hasta T04 y 105
2026-11-20 · T02 · done · live: "Cerrar sesión" termina en /login.html con token null; `class="perfil"` 0 en las cuatro páginas. Barra fija a la ventana (sticky) para que "Cerrar sesión" se vea en páginas largas → D8 propuesta
2026-11-20 · T03 · done · live: cuenta "camila prueba" → avatar "C"; con `**/auth/me` abortado en el navegador → ícono de persona; títulos y descripciones de FR-3.a en las cuatro páginas; campana movida antes de `.avatar` (FR-3.b, una línea en notificaciones.js)
2026-11-20 · round 1 · T01–T03 · gates green (node --check); sdd_check: bullets de T01–T03 citados como revisión en vivo; floor: sin pruebas en el repo, nada borrado ni suprimido; revisión: hace lo que piden FR-1.a–b, FR-2.a–d, FR-3.a–e, más la limpieza de hojas de página adelantada de T06 (anotada en T01) y D8 propuesta
2026-11-21 · round 2 base · `b3d390f` + ronda 1 sin commit (13 archivos) · backend :8000 con su configuración normal, estáticos en :8080
2026-11-21 · T04 · done · live: alerta real (sensor 14, lectura 27,4 fuera de 18–26) → "Alerta de sensor · 04:51 | No leído" con punto orquídea; aviso leído de ayer renderizado con `crearAviso` de la página (el backend no crea avisos con fecha pasada) → "Ayer 14:12 | Leído"; clic del mouse en el contenido cierra la lista y `aria-expanded` vuelve a false. `formatearFechaAviso` probada en node con las cuatro formas y el cruce de año ("Ayer 23:00" el 1 de enero). Reglas de la campana de 103 reemplazadas en styles.css
2026-11-21 · T05 · done · live: dos columnas con la presentación y el formulario (FR-5.a–b); "Crear cuenta" → "Crear cuenta / Solo necesitas tu nombre, correo y una contraseña. / ¿Ya tienes cuenta? Iniciar sesión" y el campo Nombre; volver deja los textos de entrar; entrar abre /Home/home.html con token. Estilos del login en su `<style>`, como antes
2026-11-21 · T06 · done · live a 390 px (viewport móvil de Orca): Home con franja de logo y "Cerrar sesión" arriba (salir en y=12, visible) y enlaces debajo con scroll propio, sin scroll horizontal de la página; login con la presentación arriba (termina en y=366) y el formulario debajo (y=437). `grep -c "sidebar\|\.perfil"` en las tres hojas: 0 (limpieza hecha en T01). El corte de 980 px de la maqueta es del contenido (grillas de Home y Datos): queda para 105–106
2026-11-21 · T07 · done · live: lectura 27.4 → "27,4" en Home, "27,4 °C" en la tarjeta y la tabla de Datos, ejes del gráfico "26,0 / 26,5 / 27,0" (`locale: "es-CL"` de Chart.js), y "Máx: 26,5 °C" en Configuración (máximo del sensor de prueba cambiado a 26,5 por la API)
2026-11-21 · round 2 · T04–T07 · gates green (node --check); sdd_check: bullets de T04–T07 citados como revisión en vivo (FR-1.c, FR-1.d, FR-1.f quedan para T08); floor: sin pruebas en el repo, nada borrado ni suprimido; revisión: hace lo que piden FR-4, FR-5, FR-2.e, FR-1.e; hallazgo al backlog: mensajes de alerta del backend con punto decimal (→ backend 104)
2026-11-21 · round 3 base · `0df8003` (work tree clean) · backend :8000, estáticos :8080
2026-11-21 · T08 · done · barrido de 16 combinaciones (4 páginas × 2 temas × 2 anchos) sin fallos; FR-1.c con las fuentes abortadas, FR-1.f con Tab real; anotado en spec §10. Cuenta de prueba nueva porque la contraseña de la anterior se perdió con el scratchpad
2026-11-21 · T09 · done · 001 §10 D3: reemplazada por 104 FR-2.c–d (FR-3.d sustituido); 103 §10: D6 reemplazada por 104 FR-3.b, y los cambios de 104 sobre FR-2.b, FR-2.d y FR-2.f anotados
2026-11-21 · round 3 · T08–T09 · gates green (node --check); sdd_check: los 23 bullets citados como revisión en vivo; floor: sin pruebas en el repo, solo cambios de specs en esta ronda; D8 aprobada por el dueño; spec `built`
