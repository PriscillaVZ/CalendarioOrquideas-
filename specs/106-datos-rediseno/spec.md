# 106 — Datos del rediseño

Status: built · Supersedes: 101 FR-1.c, FR-4.a · Depends on: `104-marco-visual`, `101-datos-tiempo-real`

## 1. Context and objective

La maqueta del rediseño (`docs/rediseno-maqueta.html`, vista `#datos`) reorganiza Datos sin cambiar de
dónde salen los datos (101: condiciones actuales y lecturas por sensor, cada 30 s). Cambia cómo se leen:
el estado general es una franja de color con la antigüedad de la última lectura; cada sensor muestra
dónde cae su valor dentro de sus límites en una barra; los gráficos dibujan el rango ideal como una
franja; el periodo se elige con dos botones en el encabezado; la tabla dice cuántas lecturas hay.

Este spec también resuelve un defecto anotado en el backlog durante 103: con cero o una lectura, el eje
de tiempo de los gráficos mostraba fechas sin sentido. Ahora el eje cubre siempre el periodo elegido.

**Objective:** que Datos muestre de un vistazo qué sensores están fuera de su rango y cuánto, con barras, franjas y colores de estado como en la maqueta, y con un eje de tiempo que siempre cubre el periodo elegido.

## 2. Users

| Usuario | Relación con esta capacidad |
|---|---|
| Cultivador/a | Revisa el estado actual, el historial y los rangos de sus sensores. |
| El backend | Entrega condiciones actuales y lecturas por sensor (101). |

## 3. User stories

- Como cultivador/a, quiero ver en una barra dónde está cada valor respecto de sus límites, para saber si está cerca de salirse.
- Como cultivador/a, quiero ver el rango ideal dibujado en el gráfico, para saber cuánto tiempo estuvo fuera.
- Como cultivador/a, quiero que el gráfico muestre siempre las últimas 24 horas o 7 días completos, para leer cuándo pasó algo aunque haya pocas lecturas.

## 4. Functional requirements

### FR-1 — Estado general (RF7)
Los textos de 101 FR-2 se mantienen; cambia la forma: una franja del color del estado con la antigüedad
de la lectura más reciente, para saber si "todo en rango" es de ahora o de hace horas.
- (a) The app shall mostrar el estado general de 101 FR-2 en una franja verde si todos los sensores con lectura están en rango, roja si alguno está fuera de rango y gris si no hay sensores activos o lecturas.
- (b) The app shall mostrar en la franja "Última lectura hace N min" con la antigüedad de la lectura más reciente entre los sensores activos, con las formas de 105 FR-1.d.
- (c) IF ningún sensor activo tiene lecturas, THEN the app shall mostrar la franja sin antigüedad.

### FR-2 — Periodo en el encabezado (RF5)
Reemplaza la lista desplegable de 101 FR-4.a: dos botones en el encabezado de Datos, uno presionado. Los
periodos y su efecto (101 FR-4.b) no cambian.
- (a) The app shall ofrecer en el encabezado de Datos los botones "24 horas" y "7 días", con "24 horas" presionado al abrir la página.
- (b) WHEN la persona pulsa un periodo, the app shall marcarlo como presionado y soltar el otro.
- (c) The app shall mostrar junto al título de cada gráfico la unidad y el periodo: "% · últimas 24 h", "°C · últimos 7 días".

### FR-3 — Tarjetas de sensor (RF7, RF4)
Cada tarjeta de 101 FR-1 suma el tipo, el estado como chip y una barra de rango. La barra pinta la franja
entre los límites del sensor y marca el último valor; un límite vacío deja la franja abierta hacia ese
lado, porque ese lado no genera alertas (101 FR-1.e).
- (a) The app shall mostrar en la tarjeta de cada sensor su nombre, su tipo como "Humedad relativa" o "Temperatura", su estado como chip y su último valor en números grandes con su unidad.
- (b) The app shall dibujar en cada tarjeta una barra con la franja entre el mínimo y el máximo del sensor y un marcador en la posición de su último valor.
- (c) The app shall mostrar bajo la barra "mín <valor> <unidad>" y "máx <valor> <unidad>".
- (d) IF el sensor no tiene mínimo o no tiene máximo, THEN the app shall extender la franja hasta ese extremo de la barra y mostrar "sin mínimo" o "sin máximo".
- (e) The app shall mostrar al pie de la tarjeta "Última lectura DD/MM HH:MM:SS".
- (f) IF el sensor no tiene lecturas, THEN the app shall mostrar "--" como valor, el chip "Sin lecturas", la barra sin marcador y "Esperando la primera lectura" al pie.

### FR-4 — Gráficos (RF5, RF7)
Los gráficos de 101 FR-4.c (uno por tipo, una serie por sensor) dibujan además el rango ideal, que solo
es uno cuando todos los sensores del tipo comparten límites; si no, una franja mentiría para alguno.
El eje horizontal cubre el periodo completo, con o sin lecturas.
- (a) WHILE todos los sensores activos de un tipo tienen el mismo mínimo y el mismo máximo, the app shall dibujar en su gráfico la franja entre esos límites con la leyenda "Rango ideal".
- (b) IF los sensores activos de un tipo tienen límites distintos, THEN the app shall dibujar su gráfico sin franja ni leyenda de rango.
- (c) The app shall extender el eje horizontal de cada gráfico desde el inicio del periodo elegido hasta el momento de la consulta.

### FR-5 — Registro histórico (RF5)
La tabla de 101 FR-4.d con el conteo de lecturas y el estado como chip de color.
- (a) The app shall mostrar junto a "Registro histórico" el número de lecturas del periodo como "N lecturas".
- (b) The app shall mostrar el estado de cada lectura de la tabla como chip con el color de su estado.

## 5. Non-functional requirements

- **Freshness:** igual que 101 (cada 30 s); la antigüedad de la franja se recalcula en cada actualización.
- **Accessibility:** los botones de periodo se anuncian como presionados o no; la barra de rango tiene un
  texto equivalente ("68 %, entre 60 y 80 %"); los gráficos conservan su nombre accesible por tipo y periodo.
- **Language:** textos en español; números con coma decimal (104 FR-1.e).
- **Traceability:** FR-1 sirve a RF7; FR-2 y FR-5 a RF5; FR-3 a RF7 y RF4; FR-4 a RF5 y RF7.

## 6. Edge cases

| Situación | Comportamiento esperado |
|---|---|
| Valor fuera de los límites | El marcador queda fuera de la franja, dentro de la barra (plan §2). |
| Sensor sin ningún límite | La franja ocupa toda la barra; "sin mínimo" y "sin máximo". |
| Ninguna lectura en el periodo | Gráficos vacíos con el eje del periodo completo (FR-4.c); "No hay lecturas en este periodo." (101 FR-4.f); "0 lecturas". |
| Un sensor de un tipo | Franja con sus límites (FR-4.a). |
| Dos sensores de humedad 70–90 y 60–80 | Gráfico de humedad sin franja (FR-4.b); cada tarjeta con su barra. |
| Más de 1000 lecturas de un sensor | Aviso de 101 FR-4.e; el conteo suma lo mostrado. |

## 7. Out of scope

- Consejos según la condición (la maqueta dice "Ventila o aumenta la sombra"): textos de cultivo nuevos
  que nadie validó; `specs/backlog.md`.
- Promedios por hora o día: backend 103 §7; `specs/backlog.md`.
- Home, Calendario y Configuración: 105 y 107.

## 8. Completion criteria

- Datos se ve como la vista `#datos` de la maqueta, en claro y oscuro, a 1280 y 390 px.
- Cada sensor tiene su barra de rango; los gráficos tienen franja cuando corresponde y el eje del periodo completo, también con cero o una lectura.

## 9. Open questions

None.

## 10. Decisions taken

- **D1 — La franja de estado dice "Última lectura hace …"** y no "Actualizado hace …" como la maqueta.
  *Por qué:* lo que importa es la edad del dato, y la página se actualiza cada 30 s: "Actualizado" diría
  siempre "recién" aunque el sensor lleve horas sin enviar.
- **D2 — Sin consejos de cultivo en la franja** (§7). *Por qué:* la maqueta los trae como ejemplo; un
  consejo equivocado hace daño y nadie los validó.
- **D3 — Franja del gráfico solo con límites comunes** (FR-4.a–b). *Por qué:* con límites distintos no
  hay un rango ideal único que dibujar.
- **D4 — El eje cubre el periodo completo** (FR-4.c). Resuelve el ítem del backlog "Gráficos de Datos con
  0 o 1 lectura" (source: 103 round 1), borrado del backlog al escribir este spec.

### Taken while building

**Revisión en vivo, ronda 1 (T01–T03)** — Claude, 2026-11-21, navegador de Orca (perfil aislado), backend en
`:8000`, cuenta `alvaro.104@example.com` con sensores de temperatura 18–24 °C (25 °C), humedad 60–80 % (68 %)
y "Temperatura vivero" desde 18 °C sin máximo y sin lecturas; capturas en oscuro a 1280 px y claro a 390 px.
- FR-1.a: con el sensor de temperatura fuera de rango, franja roja "⚠ Atención: fuera de rango Temperatura
  invernadero"; con valores en rango, verde con el texto de 101 FR-2.a; sin lecturas y sin sensores, gris con
  los textos de 101 FR-2.d y FR-2.c.
- FR-1.b: "Última lectura hace 1 h" (la más reciente de los tres sensores, de las 21:04).
- FR-1.c: sin lecturas y sin sensores, la franja no tiene antigüedad.
- FR-2.a: al abrir, "24 horas" presionado y "7 días" suelto, en el encabezado.
- FR-2.b: "7 días" queda presionado, "24 horas" se suelta y el historial se vuelve a pedir; de vuelta a
  "24 horas", al revés.
- FR-2.c: "% · últimas 24 h" y "°C · últimas 24 h"; con 7 días, "% · últimos 7 días" y "°C · últimos 7 días".
- FR-3.a: "Humedad invernadero", "Humedad relativa", chip "En rango", "68 %" en números grandes; la de
  temperatura con chip "Calor" rojo.
- FR-3.b: humedad 60–80 con 68 → franja de 60 % a 80 % de la barra y marcador en 68 %; temperatura 18–24 con
  25 → franja de 25 % a 67,9 % y marcador en 75 %; un valor de 105 % queda en el borde (100 %).
- FR-3.c: "mín 60 %" / "máx 80 %", "mín 18 °C" / "máx 24 °C".
- FR-3.d: el sensor sin máximo pinta la franja hasta el borde derecho y dice "sin máximo"; uno sin límites,
  franja completa y "21,5 °C, sin límites" como texto equivalente.
- FR-3.e: "Última lectura 21/11 21:04:40".
- FR-3.f: el sensor sin lecturas muestra "--", chip "Sin lecturas", barra sin marcador y "Esperando la
  primera lectura".
- Cortes: a 390 px la franja deja el punto junto al texto y la antigüedad debajo; sin scroll lateral. La barra
  tiene texto equivalente ("68 %, entre 60 y 80 %").

**Revisión en vivo, ronda 2 (T04–T05)** — Claude, 2026-11-21, mismo entorno; capturas en claro y oscuro a
1280 px y en claro a 390 px.
- FR-4.a: humedad con un solo sensor 60–80 % → franja de 60 a 80 y "Rango ideal" bajo el gráfico; si los dos
  de temperatura comparten 18–24, también aparece su franja.
- FR-4.b: temperatura con 18–24 y 18–sin máximo → sin franja ni leyenda.
- FR-4.c: en 24 horas el eje va de "20/11 23:44" a "21/11 23:44" con marcas 00:00, 04:00 … 20:00; en 7 días,
  de "14/11 23:45" a "21/11 23:45" con marcas 15/11 … 21/11; con cero lecturas el eje sigue cubriendo el
  periodo; la única lectura de humedad del día se ve como punto.
- FR-5.a: "3 lecturas" con tres filas; sin lecturas, "0 lecturas" y "No hay lecturas en este periodo.".
- FR-5.b: "Calor" con chip rojo y "En rango" con chip verde, los colores de 104 en ambos temas.
- Accesibilidad: cada gráfico se nombra "Humedad en las últimas 24 horas" / "… en los últimos 7 días".

- **D5 — Franja abierta, singular y marcas del eje** (propuesta de la ronda 2, aprobada por el dueño el
  2026-11-21). Con límites comunes y un lado vacío, la franja del gráfico llega hasta ese borde, como la
  barra de FR-3.d; sin ningún límite no hay franja. "1 lectura" en singular (como 105 D6). Las marcas del eje
  caen en horas redondas locales (cada 4 h en 24 horas, cada medianoche en 7 días) y una serie de una sola
  lectura se dibuja como punto. *Por qué:* un lado vacío no genera alertas (101 FR-1.e); las marcas
  automáticas caían en horas como 13:53, y una línea de un solo punto no se ve.

**Revisión en vivo, ronda 3 (T06)** — Claude, 2026-11-21, capturas comparadas con la vista `#datos` de la
maqueta: claro a 1280 px (franja roja, periodo en el encabezado, tres tarjetas con barra, gráficos con franja
en humedad y sin ella en temperatura, tabla con chips y "3 lecturas") y oscuro a 390 px (gráficos apilados,
marcas 00:00 … 20:00, tabla con scroll propio, sin scroll de la página). Junto con las rondas 1 y 2, cada
bullet de FR-1 a FR-5 queda revisado en claro y oscuro, a 1280 y 390 px.
