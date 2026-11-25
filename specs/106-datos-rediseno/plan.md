# 106 — Datos del rediseño · Implementation plan

Status: built · Spec: `spec.md` · Reference: `specs/sdd.profile.md`

Referencia visual: `docs/rediseno-maqueta.html`, vista `#datos`. Usa el sistema de 104 y `estadoLectura`
en `api.js` (105 T01).

## 1. Module structure

### A. Páginas y cliente compartido

| Archivo | Contiene | FR |
|---|---|---|
| `Datos/datos.html` | En `.head-tools`, antes del avatar: `div.periodo[role=group]` con `button#p24` y `button#p168` (`aria-pressed`); se quita el `<select id="periodo">`; `.estado#estadoGeneral` con `.pulse`, texto y `small#antiguedad`; `.sensores#tarjetasSensores`; `.graficos` con dos `.panel.chart` (`small.per`, `<canvas>`, `.leyenda#leyendaHum/#leyendaTemp`); panel "Registro histórico" con `small#conteo` y `.tabla` | FR-1 a FR-5 |
| `Datos/datos.js` | `mostrarEstadoGeneral()` pone la clase de color y la antigüedad; botones de periodo en lugar del `change` del select; `mostrarTarjetas()` con tipo, chip, `barraRango(sensor)` y pie; `dibujarGrafico()` con la franja y `min`/`max` del eje = inicio del periodo / ahora; colores leídos de las variables CSS; `mostrarTabla()` con chips y conteo | FR-1 a FR-5 |
| `Datos/datos.css` | Solo `.estado`, `.periodo`, `.sensores`, `.sensor`, `.rango`, `.rango-labels`, `.graficos`, `.chart`, `.tabla` y sus cortes | FR-1 a FR-5 |

## 2. Data model

Los mismos datos de 101 §2 (`GET /conditions`, `GET /sensors/{id}/readings`). Nada nuevo en el navegador.

Escala de la barra de rango (FR-3.b, FR-3.d):

```
humedad:      escala = [0, 100]
temperatura:  lo = min(min_val, valor) ; hi = max(max_val, valor)   (se omiten los null)
              sin ningún número → [0, 40]
              margen = max((hi − lo) / 2, 2) ; escala = [lo − margen, hi + margen]
posición(v)   = (v − escala.inicio) / (escala.fin − escala.inicio), recortada a [0, 1]
franja        = [posición(min_val) o 0 si null, posición(max_val) o 1 si null]
marcador      = posición(valor), ausente sin lectura
```

Franja del gráfico (FR-4.a): dos series extra de Chart.js en `max_val` y `min_val` constantes sobre el
periodo, la segunda con `fill: "-1"` y el color `--band`; sin borde ni puntos ni leyenda propia.

## 3. Surface

| Página | Muestra | Llamadas | FR |
|---|---|---|---|
| `Datos/datos.html` al abrir y cada 30 s | Franja, tarjetas, gráficos, tabla | las de 101 §3 | FR-1, FR-3, FR-4, FR-5 |
| Botón de periodo | Gráficos y tabla del periodo | las de 101 §3 | FR-2 |

## 4. Technical decisions

- **D1 — Se queda Chart.js** (101 D3) y la franja son dos series rellenas. *Por qué:* ya dibuja varias
  series por tipo con el eje numérico de 101 D2; la maqueta dibuja SVG a mano porque tiene una serie fija.
  *Descartado:* reemplazarlo por SVG propio (reescribir ejes, escalas y varias series) o un plugin de
  anotaciones (otra librería, regla 6). (FR-4.a)
- **D2 — Eje fijo con `scales.x.min`/`max`** = inicio del periodo / ahora en milisegundos. (FR-4.c)
- **D3 — Los colores de Chart.js salen de las variables CSS** (`getComputedStyle(document.documentElement)`)
  en cada dibujo. *Por qué:* así siguen al tema oscuro (104 FR-1.b) sin una segunda paleta en JavaScript.
  Humedad en `--brand-2`, temperatura en `--orchid`; con varios sensores de un tipo, el mismo color con
  menos opacidad para cada serie siguiente. (FR-4)
- **D4 — La barra de rango es HTML y CSS** (`.rango` con `i` para la franja y `b` para el marcador, como la
  maqueta), con un `aria-label` de texto. (FR-3.b)

## 5. Test strategy

Revisiones en vivo (perfil) con cuenta `@example.com` en perfil aislado de Orca, sensores de prueba con
límites distintos y el simulador del backend (la clave nunca se imprime ni va a un archivo `.env`: se
pasa de la página al proceso por tubería, como en 103). Comparar con la maqueta. Anotadas en spec §10.

| Bullet | Caso (Given / When / Then) | Kind |
|---|---|---|
| FR-1.a | Given todos en rango / uno fuera / sin sensores / Then franja verde / roja / gris | positive |
| FR-1.b | Given la última lectura hace 2 min / Then "Última lectura hace 2 min" | positive |
| FR-1.c | Given sensores sin lecturas / Then franja sin antigüedad | negative |
| FR-2.a | Given Datos / Then "24 horas" presionado | positive |
| FR-2.b | When "7 días" / Then presionado, "24 horas" suelto y el historial de 7 días | event |
| FR-2.c | Given 7 días / Then "% · últimos 7 días" y "°C · últimos 7 días" | positive |
| FR-3.a | Given un sensor de humedad / Then nombre, "Humedad relativa", chip y valor grande | positive |
| FR-3.b | Given 68 % con 60–80 / Then franja 60–80 y marcador en 68 | positive |
| FR-3.c | Then "mín 60 %" y "máx 80 %" | positive |
| FR-3.d | Given sin máximo / Then franja hasta el extremo derecho y "sin máximo" | negative |
| FR-3.e | Then "Última lectura 19/11 10:47:12" | positive |
| FR-3.f | Given un sensor sin lecturas / Then "--", "Sin lecturas", sin marcador, "Esperando la primera lectura" | negative |
| FR-4.a | Given un sensor de temperatura 18–24 / Then franja 18–24 y "Rango ideal" | state |
| FR-4.b | Given dos de humedad con límites distintos / Then sin franja ni leyenda | negative |
| FR-4.c | Given una sola lectura / Then el eje de hace 24 h a ahora | positive |
| FR-5.a | Given 24 lecturas / Then "24 lecturas" | positive |
| FR-5.b | Given una fila "Calor" / Then chip rojo | positive |

## 6. Build order

1. Franja de estado con color y antigüedad.
2. Periodo en el encabezado.
3. Tarjetas con barra de rango.
4. Gráficos: franja, eje del periodo, colores del tema.
5. Tabla con conteo y chips.
6. Revisión en vivo; actualizar 101.

## 7. Requirement coverage

| FR | Secciones |
|---|---|
| FR-1 | §1, §3, §5 |
| FR-2 | §1, §3, §5 |
| FR-3 | §1, §2, §3, §4 D4, §5 |
| FR-4 | §1, §2, §3, §4 D1, D2, D3, §5 |
| FR-5 | §1, §3, §5 |
