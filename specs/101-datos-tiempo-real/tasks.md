# 101 — Datos en tiempo real e historial · Tasks

Status: built · Spec: `spec.md` · Plan: `plan.md`

Las revisiones en vivo necesitan el backend
en `:8000`, `python3 -m http.server 8080`, una sesión con un sensor de humedad y uno de temperatura
(102 o `POST /sensors`) y el simulador del backend enviando lecturas.

## A. Páginas y cliente compartido
- [x] **T01 — Datos usa el cliente, sin datos de ejemplo** · FR-1.a
  `Datos/datos.html`: `<script src="../api.js">` antes de `datos.js`; `Datos/datos.js`: borrar el arreglo `registros`.
  *Made when:* sin token, abrir `Datos/datos.html` termina en `login.html`, y `grep -n "registros = \[" Datos/datos.js` no encuentra nada.
- [x] **T02 — Estado de una lectura** · FR-1.d, FR-1.e, FR-1.f
  `Datos/datos.js`: `estadoLectura(valor, sensor)` → `{texto, clase}` según plan §2.
  *Made when:* en la consola de Datos, `estadoLectura(90, {type:"humidity", min_val:70, max_val:90}).texto` es "En rango" y con 92.5 es "Alta".
- [x] **T03 — Tarjetas por sensor** · FR-1.a, FR-1.b, FR-1.c · after T02
  `Datos/datos.html`: `#tarjetasSensores` en lugar de las dos tarjetas; `Datos/datos.js`: `cargarCondiciones()`, `mostrarTarjetas()`; `Datos/datos.css`.
  *Made when:* con dos sensores, Datos muestra dos tarjetas con nombre, valor, hora y estado; uno sin lecturas dice "Sin lecturas".
- [x] **T04 — Estado general** · FR-2.a, FR-2.b, FR-2.c, FR-2.d · after T03
  `Datos/datos.js`: `mostrarEstadoGeneral()` con los cuatro casos.
  *Made when:* con un sensor fuera de rango aparece "⚠ Atención: fuera de rango <nombre>".

— checkpoint: Datos muestra las condiciones actuales reales —

- [x] **T05 — Periodo e historial en tabla** · FR-4.a, FR-4.b, FR-4.d, FR-4.e, FR-4.f · after T03
  `Datos/datos.html`: `<select id="periodo">` con etiqueta, `#avisoDatos`, columnas nuevas; `Datos/datos.js`: `cargarHistorial()`, `mostrarTabla()`.
  *Made when:* la tabla lista lecturas del simulador, la más reciente primero; elegir "Últimos 7 días" vuelve a pedir con otro `start`.
- [x] **T06 — Actualización cada 30 s** · FR-3.a, FR-3.b, FR-3.c · after T05
  `Datos/datos.js`: `actualizar()` sin superponerse; rechazo en `#avisoDatos`, se limpia al tener éxito.
  *Made when:* con el simulador enviando, el valor de una tarjeta cambia sin recargar; con el backend detenido aparece "No se pudo conectar con el servidor." y los datos siguen.
- [x] **T07 — Gráficos por magnitud con serie por sensor** · FR-4.c · after T05
  `Datos/datos.html`: Chart.js con versión fija; `Datos/datos.js`: `dibujarGraficos()` crea una vez y luego `update()`; eje numérico con etiquetas de hora.
  *Made when:* con dos sensores de humedad, el gráfico de humedad muestra dos series con leyenda por nombre.

— checkpoint: Datos completa con historial y actualización —

- [x] **T08 — Home con condiciones actuales** · FR-5.a, FR-5.b, FR-5.c
  `Home/home.html`: "--" en lugar de 25 y 75; `Home/home.js`: `cargarCondicionesHome()` cada 30 s.
  *Made when:* Home muestra el valor de la tarjeta más reciente de cada tipo en Datos; sin sensor de humedad muestra "--".
- [x] **T09 — Revisión en vivo** · FR-1.a, FR-1.b, FR-1.c, FR-1.d, FR-1.e, FR-1.f, FR-2.a, FR-2.b, FR-2.c, FR-2.d, FR-3.a, FR-3.b, FR-3.c, FR-4.a, FR-4.b, FR-4.c, FR-4.d, FR-4.e, FR-4.f, FR-5.a, FR-5.b, FR-5.c
  Casos de plan §5 en el navegador de Orca; anotarlos en spec §10 *Taken while building*.
  *Made when:* `sdd_check.py specs/101-datos-tiempo-real` lista todos los bullets como revisión en vivo.

— checkpoint: spec `built` —

## C. What could change

None yet.

## D. Requirement coverage

| FR | Tareas |
|---|---|
| FR-1 | T01, T02, T03, T09 |
| FR-2 | T04, T09 |
| FR-3 | T06, T09 |
| FR-4 | T05, T07, T09 |
| FR-5 | T08, T09 |

## E. The gates

CI: none defined (no workflow in the repo). Local: `for f in *.js */*.js; do node --check "$f" || exit 1; done`.

## F. Log

- 2026-11-18 · base · `550eb42`, árbol limpio · modo round; fixture: cuenta `datos…@example.com`, sensores 7–10 (7, 8, 9 con el simulador cada 5 s; 10 sin lecturas)
- 2026-11-18 · T01 · done · Datos carga `../api.js`; sin token va a `login.html` (revisado en vivo); sin `registros`. Nota: http.server no envía cabeceras de caché, el navegador sirvió el HTML viejo hasta cargar con `?v=`
- 2026-11-18 · T02 · done · `estadoLectura()`; consola: 90→En rango, 92.5→Alta, 99 sin máx→En rango, 50→Baja, 30→Calor, 10→Frío
- 2026-11-18 · T03 · done · tarjetas desde `/conditions` (en vivo: 3 con valor, hora y estado; "Temperatura exterior" con "Sin lecturas"); `#avisoDatos` adelantado de T05 para los rechazos; hora en 24 h
- 2026-11-18 · T04 · done · estado general; en vivo la rama "fuera de rango", las otras tres por consola
- 2026-11-18 · round 1 · T01–T04 · gates green (`node --check`); FR-1, FR-2 en §10; revisión sin hallazgos; backlog: caché del servidor de desarrollo
- 2026-11-18 · T05 · done · periodo 24 h / 7 días, tabla Sensor/Valor/Fecha y hora/Estado; en vivo: 24 h 177 filas, 7 días 1120 con el aviso de 1000 del sensor 8 (lecturas antiguas sembradas en la base de desarrollo); "No hay lecturas" por consola
- 2026-11-18 · T06 · done · `actualizar()` cada 30 s sin superponerse; en vivo: la hora pasó de 15:51:12 a 15:51:42 sin recargar; backend detenido → "No se pudo conectar con el servidor." con 4 tarjetas y 231 filas conservadas; al volver, el aviso se fue
- 2026-11-18 · T07 · done · Chart.js fijo en 4.4.1 (el CDN sin versión daba 4.6.1); humedad 2 series, temperatura una por sensor; se actualizan sin recrearse
- 2026-11-18 · round 2 · T05–T07 · gates green; FR-3, FR-4 en §10; revisión sin desvíos (techo conocido: hasta 1000 filas por sensor redibujadas cada 30 s con 7 días)
- 2026-11-18 · T08 · done · Home desde `/conditions`, la más reciente por tipo, cada 30 s; en vivo 21.2 → 20.8 °C sin recargar; FR-5.a/b también con datos de consola
- 2026-11-18 · T09 · done · todos los bullets en spec §10 *Taken while building*
- 2026-11-18 · round 3 · T08–T09 · gates green; todos los bullets con revisión en vivo en §10; spec `built`; revisión de Home sin desvíos
