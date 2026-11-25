# 105 — Home y Calendario del rediseño

Status: built · Supersedes: 002 FR-2.b, FR-2.c, FR-3.a, FR-3.d, FR-3.e, FR-4.b, FR-6.a · Depends on: `104-marco-visual`, `002-calendario-home`, `101-datos-tiempo-real`

## 1. Context and objective

La maqueta del rediseño (`docs/rediseno-maqueta.html`, 104 §1) cambia Home y el Calendario de riego más
allá del marco. Home pasa de dos números sueltos y un calendario a un resumen: temperatura y humedad con
su estado y su rango ideal, el próximo riego con cuánto falta, el calendario del mes y un reloj. El
Calendario muestra en cada día las horas de sus riegos, la lista de próximos riegos con su conteo, y
programa, cambia y quita riegos en una ventana que muestra sus errores adentro en vez de ventanas
emergentes.

Las reglas de los riegos no cambian (002: varios por día, el backend decide si una fecha es futura,
"eliminar" desactiva). Lo nuevo es el **próximo riego**: decidir cuál viene y cuánto falta exige
comparar fecha **y hora** con ahora. 002 D7 lo evitaba porque la hora del invernadero es la del backend;
el dueño eligió usar el reloj del dispositivo (D1), igual que el reloj de Home.

**Objective:** que Home resuma el estado del invernadero y el próximo riego de un vistazo, y que el Calendario muestre las horas de cada día y gestione los riegos en una ventana sin mensajes emergentes, como en la maqueta.

## 2. Users

| Usuario | Relación con esta capacidad |
|---|---|
| Cultivador/a | Mira el resumen en Home; programa, cambia y quita riegos en el Calendario. |
| El backend | Entrega riegos y condiciones actuales; acepta o rechaza cada cambio. |

## 3. User stories

- Como cultivador/a, quiero ver en Home si la temperatura y la humedad están en su rango ideal, para saber si tengo que hacer algo sin abrir Datos.
- Como cultivador/a, quiero ver cuándo es el próximo riego y cuánto falta, para organizar mi día.
- Como cultivador/a, quiero ver las horas de riego en cada día del calendario, para no abrir cada día.
- Como cultivador/a, quiero que un error al guardar aparezca en la misma ventana, para corregir sin cerrar avisos.

## 4. Functional requirements

### FR-1 — Lecturas en Home (RF7, RF4)
Las dos tarjetas siguen mostrando la lectura más reciente de cada tipo (101 FR-5), ahora con el estado de
esa lectura según los límites de su sensor (101 FR-1.d–f), el rango ideal de ese sensor y cuánto hace que
llegó: un número sin fecha puede ser de ayer.
- (a) The app shall mostrar en la tarjeta de cada tipo el estado de la lectura más reciente según los límites de su sensor.
- (b) The app shall mostrar en la tarjeta de cada tipo el rango del sensor de esa lectura como "Ideal <mín>–<máx> <unidad>".
- (c) IF el sensor de la lectura no tiene mínimo o no tiene máximo, THEN the app shall mostrar "Ideal hasta <máx> <unidad>" o "Ideal desde <mín> <unidad>", y "Sin límites" si no tiene ninguno.
- (d) The app shall mostrar junto al rango la antigüedad de la lectura: "recién" bajo un minuto, "hace N min" bajo una hora, "hace N h" bajo un día y "hace N d" desde un día.
- (e) IF no hay lectura de un tipo, THEN the app shall mostrar en su tarjeta el estado "Sin lecturas" sin rango ni antigüedad.

### FR-2 — Próximo riego (RF1)
El riego activo más cercano que aún no llega, con su día en palabras y lo que falta. Se calcula con el
reloj del dispositivo (D1) y se recalcula solo: la tarjeta abierta toda la mañana no debe seguir
anunciando un riego ya pasado.
- (a) The app shall mostrar en Home el riego activo más cercano cuya fecha y hora, según el reloj del dispositivo, aún no llega.
- (b) The app shall nombrar el día del próximo riego "Hoy", "Mañana" o con día de la semana, número y mes ("jueves 19 de noviembre"), seguido de su hora.
- (c) The app shall mostrar lo que falta como "Faltan N min" bajo una hora, "Faltan N h" bajo dos días y "Faltan N días" desde dos días.
- (d) IF no hay riegos activos que aún no llegan, THEN the app shall mostrar "No hay riegos programados." en la tarjeta.
- (e) The app shall ofrecer en la tarjeta "Ver calendario →", que abre el Calendario de riego.
- (f) WHILE Home está abierta, the app shall recalcular el próximo riego y lo que falta cada minuto.

### FR-3 — Calendario y reloj de Home (RF1)
El calendario pequeño es el de 002 FR-8 con la apariencia nueva; el reloj, analógico y digital, ahora
también dice la fecha.
- (a) The app shall atenuar en los calendarios los días anteriores a hoy.
- (b) The app shall mostrar en Home la hora del dispositivo con segundos y un reloj analógico, actualizados cada segundo.
- (c) The app shall mostrar bajo la hora la fecha de hoy con día de la semana, seguida de "· hora del dispositivo".

### FR-4 — Calendario de riego (RF1)
Cada día muestra las horas de sus riegos activos (antes solo una marca), así el mes se lee sin abrir
días. En pantallas angostas no caben: queda la marca.
- (a) The app shall mostrar en cada día del calendario grande la hora de cada riego activo de ese día, de la más temprana a la más tardía.
- (b) WHILE la pantalla mide 640 px de ancho o menos, the app shall mostrar cada riego de un día como una marca sin hora.
- (c) The app shall ofrecer "Hoy", que muestra el mes actual.
- (d) The app shall mostrar bajo el calendario "Toca un día para programar, editar o eliminar un riego.".
- (e) The app shall nombrar cada día para lectores de pantalla con su número y, si tiene riegos, cuántos.

### FR-5 — Próximos riegos (RF1)
Reemplaza la forma de 002 FR-6.a; el orden y el mensaje sin riegos (002 FR-6.b–c) siguen.
- (a) The app shall mostrar junto a "Próximos riegos" cuántos riegos activos con fecha de hoy o posterior hay, como "N programados".
- (b) The app shall listar los primeros seis, cada uno con el número del día, el mes abreviado, "Riego a las HH:MM" y el día de la semana.

### FR-6 — Ventana de un día (RF1)
La ventana de 002 FR-2 a FR-5 con la apariencia nueva. Los riegos del día son botones de hora; uno
elegido se puede cambiar o quitar. Un riego nuevo propone las 08:00. Los errores se muestran dentro de
la ventana y los éxitos no interrumpen: el calendario cambia a la vista.
- (a) WHEN la persona pulsa un día, the app shall abrir la ventana "Programar riego" con la fecha como "jueves 19 de noviembre".
- (b) IF el día tiene riegos activos, THEN the app shall mostrar "Ya programados este día (toca uno para editarlo):" y un botón con la hora de cada uno.
- (c) WHEN la ventana prepara un riego nuevo, the app shall proponer la hora 08:00, el botón "Guardar riego" y ningún botón "Eliminar".
- (d) WHEN la persona pulsa la hora de un riego del día, the app shall marcarla como elegida, cargar su hora y mostrar los botones "Guardar cambios" y "Eliminar".
- (e) IF la persona guarda con la hora vacía, THEN the app shall mostrar en la ventana "Por favor, selecciona una hora de riego." sin llamar al backend.
- (f) IF el backend rechaza guardar o eliminar, THEN the app shall mostrar su mensaje dentro de la ventana y dejarla abierta.
- (g) WHEN el backend acepta guardar o eliminar, the app shall cerrar la ventana sin mensaje emergente.
- (h) WHEN la persona pulsa "Cancelar", "×" o la tecla Escape, the app shall cerrar la ventana sin enviar nada al backend.

## 5. Non-functional requirements

- **Freshness:** próximo riego y lo que falta, recalculados cada minuto (FR-2.f); lecturas cada 30 s
  (101 FR-5.c); reloj cada segundo.
- **Language:** fechas con nombres en español ("jueves 19 de noviembre", "nov").
- **Accessibility:** cada día del calendario grande es un botón con nombre (FR-4.e); la ventana se cierra
  con Escape y devuelve el foco al día pulsado; las horas elegidas se anuncian como presionadas.
- **Traceability:** FR-1 sirve a RF7 y RF4; FR-2 a FR-6 a RF1.

## 6. Edge cases

| Situación | Comportamiento esperado |
|---|---|
| Un riego de hoy cuya hora ya pasó | No es el próximo (FR-2.a); sigue en "Próximos riegos" hasta mañana (002 D7, FR-5). |
| Dispositivo en otra zona horaria que el invernadero | El próximo riego y lo que falta se corren en la diferencia (D1). |
| Dos riegos a la misma hora el mismo día | Ambos en el día y en la lista; el próximo es cualquiera de los dos. |
| Más de seis próximos riegos | Se ven seis; el conteo dice el total (FR-5). |
| Lectura más reciente de un sensor sin límites | "Sin límites" y estado "En rango" (101 FR-1.e). |
| Pulsar un día pasado | Se abre la ventana; guardar lo rechaza el backend con su mensaje dentro (FR-6.f). |
| Backend caído al guardar | "No se pudo conectar con el servidor." dentro de la ventana (001 FR-4.c). |

## 7. Out of scope

- Datos y Configuración: 106 y 107.
- La hora del invernadero desde el backend: el dueño eligió el reloj del dispositivo (D1); unowned si se
  necesita.
- Riegos recurrentes: backend 101 D1; `specs/backlog.md`.

## 8. Completion criteria

- Home muestra las dos lecturas con estado, rango y antigüedad, el próximo riego con lo que falta, el calendario y el reloj con fecha, como la maqueta.
- El Calendario muestra las horas en cada día, "Hoy", la lista con conteo, y programa, cambia y quita riegos sin ventanas emergentes salvo la confirmación de quitar.

## 9. Open questions

- ~~[NEED CLARIFICATION] (affects FR-2.a, FR-2.c, FR-2.f, T03) ¿Con qué hora se calcula el próximo riego y lo que falta? Propuesta: el reloj del dispositivo.~~ → D1

## 10. Decisions taken

- **D1 — El próximo riego usa el reloj del dispositivo** (respuesta del dueño, 2026-11-19). *Por qué:* el
  reloj de Home ya es el del dispositivo y la persona usa la aplicación en la zona del invernadero; pedir
  la hora al backend es un cambio que no paga. *Costo:* desde otra zona horaria el cálculo se corre. Las
  reglas de futuro siguen siendo del backend (002 D3). *Descartado:* la zona del backend; no mostrar lo
  que falta.
- **D2 — Un riego nuevo propone las 08:00** (reemplaza 002 FR-2.b, hora vacía). *Por qué:* es lo que hace
  la maqueta y la hora más usada; la regla de hora vacía (FR-6.e) queda para quien la borra.
- **D3 — Sin ventanas emergentes para éxitos ni errores** (reemplaza 002 FR-3.a, FR-3.d, FR-3.e y FR-4.b
  en su forma). *Por qué:* el calendario muestra el cambio, y un error junto al campo se corrige sin
  cerrar nada. *Se conserva:* la confirmación antes de quitar (002 FR-5.a), porque quitar no se deshace
  desde la interfaz.
- **D4 — "Guardar cambios" reemplaza a "Actualizar riego"** (002 FR-2.c). *Por qué:* es el texto de la
  maqueta.
- **D5 — El estado y el rango de Home son los del sensor de la lectura más reciente.** *Por qué:* con
  varios sensores de un tipo, Home muestra una lectura (101 FR-5.a); su estado tiene que ser el de esa
  misma lectura.

### Taken while building

**Revisión en vivo, ronda 1 (T01–T03)** — Claude, 2026-11-21, navegador de Orca (perfil aislado), backend en
`:8000`, cuenta `alvaro.104@example.com`; tamaños y colores medidos en la página porque la ventana de Orca no
dibujaba capturas.
- FR-1.a, FR-1.b: sensor de temperatura 18–24 °C con una lectura de 25 °C → chip "Calor" (rojo de la maqueta
  en claro y oscuro), "Ideal 18–24 °C"; humedad 60–80 % con 68 % → "En rango", "Ideal 60–80 %". Límites con
  decimales: "Ideal 18,5–26,5 °C".
- FR-1.c: `textoRango` da "Ideal desde 18 °C", "Ideal hasta 24 °C" y "Sin límites".
- FR-1.d: la lectura recién enviada dice "recién" y cinco minutos después "hace 5 min"; la de humedad
  "hace 3 h"; `antiguedad` a 2, 59, 61 min, 23 h 59, 24 h y 72 h da "hace 2 min", "hace 59 min", "hace 1 h",
  "hace 23 h", "hace 1 d", "hace 3 d".
- FR-1.e: sin condiciones, ambas tarjetas "--" y "Sin lecturas", sin rango ni antigüedad.
- FR-2.a: con riegos de hoy a las 21:34 y de mañana a las 08:00 (21:04), la tarjeta dice "Hoy, 21:34";
  con un riego de hoy ya pasado y otro mañana, `proximoRiego` elige el de mañana.
- FR-2.b: "Hoy", "Mañana" y "domingo 29 de noviembre".
- FR-2.c: "Faltan 29 min" en vivo; `textoFalta` da "Faltan 1 min", "Faltan 59 min", "Faltan 1 h",
  "Faltan 15 h", "Faltan 47 h", "Faltan 2 días", "Faltan 3 días".
- FR-2.d: una cuenta con solo riegos pasados muestra "No hay riegos programados.".
- FR-2.e: "Ver calendario →" lleva a `index.html`.
- FR-2.f: con un riego a las 21:10 y Home abierta, a las 21:10:14 la tarjeta pasó sola a "Hoy, 21:34 ·
  Faltan 24 min", sin recargar.
- FR-3.a: en noviembre los 20 días anteriores al 21 se ven atenuados (`--muted`); el 21 con borde de hoy.
- FR-3.b: hora con segundos que avanza y manecillas del SVG que giran cada segundo.
- FR-3.c: "sábado 21 de noviembre · hora del dispositivo".
- Cortes: a 1280 px, tres columnas arriba y dos abajo, como la maqueta; a 390 px, una columna y sin scroll
  lateral. Datos sigue mostrando "Calor" y "En rango" con `estadoLectura` desde `api.js`.

**Revisión en vivo, ronda 2 (T04–T06)** — Claude, 2026-11-21, mismo entorno; peticiones contadas envolviendo
`fetch` en la página.
- FR-3.a: en el calendario grande, los 20 días anteriores al 21 atenuados (`--muted`) en claro y oscuro.
- FR-4.a: el 25 con riegos a las 19:30 y 08:00 muestra "08:00" sobre "19:30" (etiquetas `--brand-2`).
- FR-4.b: a 390 px cada riego es una marca de 32×5 px sin texto; sin scroll lateral.
- FR-4.c: desde diciembre, "Hoy" vuelve a noviembre de 2026.
- FR-4.d: "Toca un día para programar, editar o eliminar un riego." bajo el calendario.
- FR-4.e: nombres accesibles "25, 2 riegos", "2, 1 riego" y "3".
- FR-5.a: con diez riegos de hoy en adelante, "10 programados"; tras quitar uno, "9 programados".
- FR-5.b: seis filas, la primera "21 NOV · Riego a las 21:10 · sábado" (el riego de hoy ya pasado sigue, 002 D7).
- FR-6.a: el 25 abre "Programar riego" con "miércoles 25 de noviembre".
- FR-6.b: "Ya programados este día (toca uno para editarlo):" y botones "08:00" y "19:30".
- FR-6.c: un día vacío propone 08:00, "Guardar riego" y ningún "Eliminar".
- FR-6.d: tocar "19:30" la marca presionada, carga 19:30 y muestra "Guardar cambios" y "Eliminar"; con
  teclado, el foco queda en el botón tocado.
- FR-6.e: con la hora borrada, "Por favor, selecciona una hora de riego." en la ventana y ninguna petición.
- FR-6.f: guardar el 19 (pasado) deja la ventana abierta con "La fecha y hora de riego deben ser futuras";
  con `/schedules` bloqueado, "No se pudo conectar con el servidor.".
- FR-6.g: cambiar 19:30 a 20:15 (un PATCH), quitar ese riego (`confirm`, un PATCH `is_active:false`) y
  programar el 30 a las 08:00 (un POST) cierran la ventana sin `alert` y el día cambia a la vista;
  `grep -c "alert(" calendario.js` da 0.
- FR-6.h: "Cancelar", "×" y Escape cierran sin peticiones; con Escape el foco vuelve al día pulsado. Tras
  guardar o quitar, el calendario se rehace y el foco vuelve también al día.
- Cortes: a 1280 px, calendario y lista en dos columnas como la maqueta; a 390 px, una columna y la ventana
  de 354 px dentro de la pantalla.

- **D6 — Singular y error de carga** (propuesta de la ronda 2, aprobada por el dueño el 2026-11-21). "1
  programado" (FR-5.a) y "1 riego" en el nombre accesible (FR-4.e) van en singular; si los riegos no se
  pueden leer, el error se muestra en la lista de próximos riegos en vez de una ventana emergente. *Por qué:*
  "1 programados" es un error de español, y D3 quita las ventanas emergentes de esta página también al cargar.

**Revisión en vivo, ronda 3 (T07)** — Claude, 2026-11-21, capturas del navegador de Orca (perfil aislado)
comparadas con la maqueta: Home claro a 1280 px (tres tarjetas arriba, calendario con días pasados atenuados
y el 21 con borde, reloj con fecha), Calendario oscuro a 1280 px (horas en cada día, lista "10
programados" con seis filas) y su ventana abierta con "08:00" presionado, "Guardar cambios" y "Eliminar";
Calendario claro y Home oscuro a 390 px (marcas sin hora, una columna, sin scroll lateral). Junto con las
rondas 1 y 2, cada bullet de FR-1 a FR-6 queda revisado en claro y oscuro, a 1280 y 390 px.
