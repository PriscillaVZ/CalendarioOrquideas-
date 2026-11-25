# 101 — Datos en tiempo real e historial

Status: built · Depends on: `001-sesion-cliente-api`, backend `102-sensor-registry`, backend `103-sensor-readings`

## 1. Context and objective

El brief pide visualizar "en tiempo real los datos de humedad y temperatura" (RF7), que los sensores
monitoreen la humedad alrededor de las orquídeas (RF4) y un registro histórico de las condiciones (RF5).
La página Datos ya tiene la forma: estado general, tarjetas de humedad y temperatura con su estado, un
gráfico por magnitud y una tabla de registros. Pero todo sale de seis lecturas escritas en el código, con
rangos fijos (75–85 %, 18–24 °C), y las tarjetas de Home muestran 25 °C y 75 % para siempre.

El backend ya guarda las lecturas de cada sensor, entrega la última de cada sensor activo con los
límites de ese sensor, y el historial por sensor y periodo (backend 103). No empuja datos: "tiempo
real" es la última lectura al consultar (backend 103 D3). Este spec cambia los datos de ejemplo por los
del backend sin cambiar la forma de la página.

**Objective:** que la persona vea en Datos y en Home las lecturas reales de sus sensores, su estado frente a los límites de cada sensor, actualizadas solas mientras mira, y el historial de un periodo en gráficos y tabla.

## 2. Users

| Usuario | Relación con esta capacidad |
|---|---|
| Cultivador/a | Mira las condiciones actuales y el historial de su invernadero. |
| Quien presenta el prototipo | Muestra cómo cambian los valores mientras el simulador envía lecturas (backend 105). |
| El backend | Entrega condiciones actuales, límites y lecturas por periodo. |

## 3. User stories

- Como cultivador/a, quiero ver la última humedad y temperatura de cada sensor, para saber cómo está el invernadero ahora.
- Como cultivador/a, quiero que cada valor diga si está bajo, en rango o alto según los límites que puse a ese sensor, para no recordar los rangos.
- Como cultivador/a, quiero una frase que diga si todo está bien o qué sensor no, para decidir sin leer cada tarjeta.
- Como cultivador/a, quiero que la página se actualice sola, para dejarla abierta y verla cambiar.
- Como cultivador/a, quiero ver las lecturas de un periodo en gráficos y en una tabla, para ver tendencias y momentos concretos.
- Como cultivador/a, quiero la humedad y temperatura actuales en Home, para tener el resumen al entrar.

## 4. Functional requirements

### FR-1 — Condiciones actuales (RF7, RF4)
Una tarjeta por sensor activo con su última lectura. El estado se calcula con los límites de ese
sensor, no con rangos fijos, y con la misma regla con que el backend decide sus alertas: límites
incluidos y un límite vacío no limita ese lado (backend 104 D5, FR-2.c). Las palabras de estado son las
que la página ya usaba.
- (a) WHEN se abre la página Datos, the app shall leer del backend las condiciones actuales de los sensores activos de la persona.
- (b) The app shall mostrar por cada sensor activo su nombre, su último valor con su unidad y la fecha y hora de esa lectura.
- (c) IF un sensor activo aún no tiene lecturas, THEN the app shall mostrar "Sin lecturas" en lugar de su valor.
- (d) The app shall mostrar como fuera de rango un valor menor que el mínimo del sensor o mayor que su máximo, y como "En rango" un valor igual a un límite.
- (e) IF un sensor no tiene mínimo o no tiene máximo, THEN the app shall no mostrar fuera de rango por ese lado.
- (f) The app shall nombrar "Baja" y "Alta" los fuera de rango de humedad, y "Frío" y "Calor" los de temperatura.

### FR-2 — Estado general (RF7)
Una frase resume todos los sensores: si alguno está fuera de rango, lo nombra. Sin sensores o sin
lecturas no hay nada que evaluar, y se dice así en vez de afirmar que todo está bien.
- (a) WHILE cada sensor activo con lectura está en rango, the app shall mostrar "✓ Las condiciones ambientales son adecuadas para las orquídeas.".
- (b) IF algún sensor activo está fuera de rango, THEN the app shall mostrar "⚠ Atención: fuera de rango " seguido de los nombres de esos sensores separados por coma.
- (c) IF la persona no tiene sensores activos, THEN the app shall mostrar "No hay sensores activos. Regístralos en Configuración.".
- (d) IF ningún sensor activo tiene lecturas, THEN the app shall mostrar "Aún no hay lecturas de tus sensores.".

### FR-3 — Actualización periódica (RF7)
El backend no avisa cuando llega una lectura; la página vuelve a preguntar. Si una consulta falla, lo
ya mostrado sigue siendo lo último cierto, así que se conserva y se dice que no se pudo actualizar.
- (a) WHILE la página Datos está abierta, the app shall volver a leer las condiciones actuales y el historial del periodo elegido cada 30 segundos.
- (b) IF una actualización falla, THEN the app shall conservar los datos mostrados y mostrar en la página el mensaje del rechazo.
- (c) WHEN una actualización posterior tiene éxito, the app shall quitar el mensaje del rechazo.

### FR-4 — Historial (RF5)
Las lecturas de un periodo, en un gráfico por magnitud (una serie por sensor, porque una persona puede
tener varios del mismo tipo) y en una tabla. El backend entrega a lo más 1000 lecturas por sensor y
consulta (backend 103); si hay más, se muestran las más recientes y se avisa.
- (a) The app shall ofrecer los periodos "Últimas 24 horas" y "Últimos 7 días", con "Últimas 24 horas" elegido al abrir la página.
- (b) WHEN la persona elige un periodo, the app shall leer del backend las lecturas de cada sensor activo desde el inicio de ese periodo hasta ahora.
- (c) The app shall dibujar un gráfico de humedad y uno de temperatura, con una serie por sensor activo de ese tipo y el tiempo en el eje horizontal.
- (d) The app shall listar las lecturas del periodo de la más reciente a la más antigua, cada una con sensor, valor con unidad, fecha y hora, y estado según FR-1.d.
- (e) IF el backend entrega 1000 lecturas de un sensor para el periodo, THEN the app shall mostrar "Se muestran las últimas 1000 lecturas de " seguido del nombre del sensor.
- (f) IF no hay lecturas en el periodo, THEN the app shall mostrar "No hay lecturas en este periodo." en lugar de la tabla.

### FR-5 — Resumen en Home (RF7)
Home muestra una temperatura y una humedad. Con varios sensores del mismo tipo, la más reciente es la
mejor respuesta a "¿cómo está ahora?".
- (a) WHEN se abre Home, the app shall mostrar la lectura más reciente entre los sensores activos de temperatura y la más reciente entre los de humedad.
- (b) IF no hay lectura de un tipo, THEN the app shall mostrar "--" en el valor de ese tipo.
- (c) WHILE Home está abierta, the app shall volver a leer las condiciones actuales cada 30 segundos.

## 5. Non-functional requirements

- **Freshness:** lo mostrado tiene a lo más 30 s más que la última consulta exitosa; la lectura en sí
  tiene la antigüedad que indica su fecha y hora (el sensor envía cada `reading_interval_minutes`).
- **Language:** textos en español; números con la unidad que entrega el backend (`%`, `°C`).
- **Traceability:** FR-1 sirve a RF7 y RF4; FR-2, FR-3 y FR-5 a RF7; FR-4 a RF5.
- **Accessibility:** el periodo se elige con un control de formulario con etiqueta; el estado se dice
  con palabras, no solo con color.

## 6. Edge cases

| Situación | Comportamiento esperado |
|---|---|
| Sensor activo sin lecturas | Tarjeta con "Sin lecturas"; no cuenta para el estado general (FR-1.c, FR-2). |
| Sensor desactivado | No aparece: el backend solo entrega condiciones de sensores activos. Su historial no se muestra. |
| Límite vacío | Ese lado no está fuera de rango (FR-1.e). |
| Valor igual a un límite | "En rango" (FR-1.d). |
| Varios sensores de humedad | Una tarjeta por sensor; una serie por sensor en el gráfico de humedad. |
| Backend caído con la página abierta | Se conserva lo mostrado y se muestra "No se pudo conectar con el servidor." (FR-3.b). |
| Sesión vencida durante la actualización | El cliente lleva al inicio de sesión (001 FR-3.c). |
| Sin sesión | Datos lleva al inicio de sesión (001 FR-3.a). |
| Navegador en otra zona horaria que el invernadero | Fechas y horas se muestran en la hora del navegador (D4). |

## 7. Out of scope

- Registrar sensores, cambiar sus límites y su frecuencia: 102.
- Avisos de lectura fuera de rango: los crea el backend (backend 104); se muestran en 103.
- Empujar lecturas sin consultar (WebSocket/SSE): backend 103 D3; `specs/backlog.md`.
- Promedios por hora o día: backend 103 §7; `specs/backlog.md`.
- Historial de sensores desactivados: unowned.

## 8. Completion criteria

- Con el simulador del backend enviando lecturas, Datos muestra cada sensor con su valor, su hora y su
  estado, y cambia sin recargar.
- Un sensor con un límite cambiado en el backend muestra su estado con el nuevo límite.
- Los gráficos y la tabla muestran las lecturas del periodo elegido.
- Home muestra la temperatura y la humedad actuales en lugar de 25 °C y 75 %.
- No queda en la página ningún dato escrito en el código.

## 9. Open questions

- ~~[NEED CLARIFICATION] (affects FR-3.a, FR-5.c, T06, T09) ¿Cada cuánto se actualizan Datos y Home? Propuesta: 30 s, como los avisos (002 D5). Para una presentación con el simulador a pocos segundos, 30 s puede parecer lento.~~ → D5
- ~~[NEED CLARIFICATION] (affects FR-4.a, T07) ¿Qué periodos ofrece el historial? Propuesta: últimas 24 horas (al abrir) y últimos 7 días. RF5 pide "registro histórico" sin fijar el alcance.~~ → D6

## 10. Decisions taken

- **D1 — El estado se calcula en la interfaz con los límites del backend.** El backend no devuelve un
  estado por lectura. *Por qué:* es una regla de presentación con los límites del sensor y la misma
  regla de bordes que el backend (backend 104 D5); excepción declarada a la regla 2 del perfil.
  *Descartado:* rangos fijos en la página (los de hoy): ignoran los límites que la persona fija (102).
- **D2 — Una tarjeta por sensor**, no una por magnitud. *Por qué:* una persona puede tener varios
  sensores del mismo tipo, cada uno con sus límites.
- **D3 — Home toma la lectura más reciente por tipo.** *Descartado:* promedio: mezcla sensores con
  límites distintos y esconde cuál cambió.
- **D4 — Las fechas y horas se muestran en la hora del navegador.** El backend las entrega con zona
  horaria; el invernadero y quien mira están, en el prototipo, en la misma zona. *Descartado:* convertir
  a la zona del invernadero: la interfaz no la conoce (es un ajuste del backend).
- **D5 — Actualizar cada 30 s** (respuesta del dueño, 2026-11-18). *Por qué:* la misma cadencia que los
  avisos (002 D5); el backend solo tiene datos nuevos cuando un sensor envía. *Descartado:* 10 s (el
  triple de peticiones para una demostración) y 60 s (lento para ver un cambio).
- **D6 — Periodos: últimas 24 horas (al abrir) y últimos 7 días** (respuesta del dueño, 2026-11-18).
  *Descartado:* 30 días (con intervalos cortos topa las 1000 lecturas por sensor) y un rango de fechas
  libre (más pantalla para un prototipo).
- **D7 — 106 reemplaza FR-1.c y FR-4.a** (2026-11-21, 106 rediseño).
  - FR-1.c → 106 FR-3.f: un sensor sin lecturas muestra "--", el chip "Sin lecturas", la barra de rango sin
    marcador y "Esperando la primera lectura".
  - FR-4.a → 106 FR-2: el periodo se elige con los botones "24 horas" y "7 días" en el encabezado, en vez de
    la lista "Periodo:"; los periodos (D6) y su efecto (FR-4.b) no cambian.

  *Por qué:* es el rediseño aprobado (`docs/rediseno-maqueta.html`); el periodo afecta a gráficos y tabla,
  así que va arriba y no junto a la tabla. 106 también suma la franja de color con la antigüedad (FR-1), la
  barra de rango (FR-3), el rango ideal y el eje del periodo completo en los gráficos (FR-4), y el conteo con
  chips en la tabla (FR-5).

### Taken while building

- 2026-11-18 · Claude (navegador de Orca, backend local, simulador del backend cada 5 s; cuenta de
  prueba con sensores de humedad 7 y 8, temperatura 9 y 10, el 10 sin lecturas) · round 1:
  FR-1.a, FR-1.b: Datos pidió `/conditions` y mostró una tarjeta por sensor activo con nombre, valor
  con unidad y fecha y hora. FR-1.c: "Temperatura exterior" mostró "Sin lecturas". FR-1.d–f: en la
  consola de Datos, `estadoLectura` dio 90→"En rango", 92.5→"Alta", 99 sin máximo→"En rango",
  50→"Baja", 30→"Calor", 10→"Frío"; en vivo, 25.2 °C con máximo 24 mostró "Calor". FR-2.b: en vivo,
  "⚠ Atención: fuera de rango Temperatura invernadero". FR-2.a, FR-2.c, FR-2.d: con
  `mostrarEstadoGeneral()` sobre listas de condiciones sustituidas en la consola (todas en rango, ninguna,
  sin lecturas) — no con esos estados reales en el backend.
- 2026-11-18 · Claude (mismo entorno; 1100 lecturas del sensor 8 sembradas en la base de desarrollo entre
  6 y 2 días atrás) · round 2: FR-4.a: "Periodo:" con "Últimas 24 horas" elegido y "Últimos 7 días".
  FR-4.b: con 24 h la tabla tuvo 177 filas (solo del simulador); con 7 días, 1120, la más antigua del
  13/11. FR-4.d: la primera fila fue la lectura más reciente, con sensor, valor con unidad, fecha y hora,
  y estado; todas en orden descendente. FR-4.e: con 7 días, "Se muestran las últimas 1000 lecturas de
  Humedad banco sur.". FR-4.f: con `lecturas = []` en la consola, "No hay lecturas en este periodo." y la
  tabla oculta. FR-3.a: la hora de una tarjeta pasó de 15:51:12 a 15:51:42 sin recargar. FR-3.b: con el
  backend detenido, "No se pudo conectar con el servidor." y las 4 tarjetas y 231 filas conservadas.
  FR-3.c: con el backend de vuelta, el aviso desapareció. FR-4.c: gráfico de humedad con dos series
  ("Humedad banco norte", "Humedad banco sur") y de temperatura con una por sensor, eje horizontal de
  fecha y hora (captura).
- 2026-11-18 · Claude (mismo entorno) · round 3: FR-5.a: Home mostró 20.9 °C y 71 % de `/conditions`,
  en lugar de 25 y 75; con dos sensores de temperatura sustituidos en la consola (20 a las 10:00, 23.5 a
  las 10:05) mostró 23.5. FR-5.b: en esa misma prueba, sin sensor de humedad, mostró "--". FR-5.c: pasó
  de 21.2 °C / 71 % a 20.8 °C / 71.5 % en 31 s sin recargar.
