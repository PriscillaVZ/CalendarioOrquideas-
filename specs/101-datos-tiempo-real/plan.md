# 101 — Datos en tiempo real e historial · Implementation plan

Status: built · Spec: `spec.md` · Reference: `specs/sdd.profile.md`

## 1. Module structure

### A. Páginas y cliente compartido

| Archivo | Contiene | FR |
|---|---|---|
| `Datos/datos.html` | Carga `../api.js`; `#estadoGeneral`; `#tarjetasSensores` (reemplaza las dos tarjetas fijas); `<select id="periodo">` con etiqueta; `#avisoDatos` para rechazos y avisos de 1000; los dos `<canvas>`; la tabla con columnas Sensor, Valor, Fecha y hora, Estado | FR-1 a FR-4 |
| `Datos/datos.js` | `estadoLectura(valor, sensor)`; `cargarCondiciones()`; `cargarHistorial(periodo)`; `mostrarTarjetas()`, `mostrarEstadoGeneral()`, `dibujarGraficos()`, `mostrarTabla()`; `actualizar()` cada 30 s. Se borra el arreglo `registros` de ejemplo | FR-1 a FR-4 |
| `Datos/datos.css` | Estilo de `#tarjetasSensores` (rejilla de tarjetas existente) | FR-1.b |
| `Home/home.js` | `cargarCondicionesHome()`: más reciente por tipo en `#temperatura` y `#humedad`; cada 30 s | FR-5 |
| `Home/home.html` | Los valores 25 y 75 se cambian por "--" | FR-5.b |

## 2. Data model

`GET /conditions` (backend 103 FR-3): sensores activos de la persona, ordenados por id.

```json
[{ "sensor_id": 3, "name": "Humedad banco norte", "type": "humidity", "unit": "%",
   "min_val": 70.0, "max_val": 90.0, "value": 92.5, "recorded_at": "2026-11-18T14:02:11.120-03:00" },
 { "sensor_id": 4, "name": "Temperatura", "type": "temperature", "unit": "°C",
   "min_val": 18.0, "max_val": null, "value": null, "recorded_at": null }]
```

`GET /sensors/{id}/readings?start=<ISO con zona>&limit=1000` (backend 103 FR-2): más reciente primero.

```json
[{ "id": 812, "sensor_id": 3, "value": 92.5, "recorded_at": "2026-11-18T14:02:11.120-03:00" }]
```

Estado de una lectura (FR-1.d–f), con los límites de su sensor:

```
si min_val != null y valor < min_val → "bajo"   (Baja | Frío)
si max_val != null y valor > max_val → "alto"   (Alta | Calor)
si no                                → "en-rango" (En rango)
```

Las clases CSS existentes `frio`, `calor`, `en-rango` se reutilizan (bajo → `frio`, alto → `calor`).
No se guarda nada en el navegador.

## 3. Surface

| Página | Muestra | Llamadas | FR |
|---|---|---|---|
| `Datos/datos.html` al abrir y cada 30 s | Estado general, tarjetas, gráficos, tabla | `GET /conditions`; por sensor activo `GET /sensors/{id}/readings?start=…&limit=1000` | FR-1, FR-2, FR-3, FR-4 |
| Cambio de periodo | Gráficos y tabla del periodo | `GET /sensors/{id}/readings?start=…&limit=1000` por sensor | FR-4.b |
| `Home/home.html` al abrir y cada 30 s | Temperatura y humedad actuales | `GET /conditions` | FR-5 |

`start` = ahora − 24 h o − 7 días, como `toISOString()` (UTC, con `Z`: el backend exige zona, backend 103 D4).

## 4. Technical decisions

- **D1 — Una petición de historial por sensor activo.** El backend no tiene historial de varios sensores
  a la vez. *Por qué:* una persona tiene pocos sensores (backend 103 D5). Se piden en paralelo
  (`Promise.all`). (FR-4.b)
- **D2 — Eje horizontal numérico (milisegundos) con etiquetas de hora formateadas.** *Por qué:* cada
  sensor tiene sus propias horas; un eje de categorías no alinea series distintas, y el eje de tiempo de
  Chart.js exige un adaptador de fechas extra. *Descartado:* el adaptador (otra librería, regla 6). (FR-4.c)
- **D3 — Chart.js con versión fija.** Hoy se carga `https://cdn.jsdelivr.net/npm/chart.js` sin versión;
  se fija (p. ej. `chart.js@4.4.1`) para que una versión nueva no cambie la página sola. (FR-4.c)
- **D4 — Los gráficos se actualizan en lugar de recrearse** (`chart.data = …; chart.update()`). *Por qué:*
  recrear cada 30 s pierde el estado de la leyenda y parpadea. (FR-3.a)
- **D5 — `actualizar()` no se superpone**: si la anterior no terminó, la siguiente espera al próximo
  turno. (FR-3.a)
- **D6 — Una sola función de estado** para tarjetas, tabla y estado general. (FR-1.d, FR-2, FR-4.d)

## 5. Test strategy

Revisiones en vivo en el navegador de Orca (perfil), con dos sensores registrados (uno de cada tipo) y
el simulador del backend (`tools/sensor_sim.py`) enviando lecturas; anotadas en spec §10.

| Bullet | Caso (Given / When / Then) | Kind |
|---|---|---|
| FR-1.a | Given sesión / When se abre Datos / Then hay una petición a `/conditions` | event |
| FR-1.b | Given un sensor con lectura 92.5 % / Then su tarjeta dice nombre, "92.5 %" y la hora | positive |
| FR-1.c | Given un sensor sin lecturas / Then su tarjeta dice "Sin lecturas" | negative |
| FR-1.d | Given límites 70–90 / Then 92.5 es fuera de rango y 90 es "En rango" | positive |
| FR-1.e | Given máximo vacío / When llega 99 / Then "En rango" | negative |
| FR-1.f | Given humedad 50 y temperatura 30 con límites por defecto / Then "Baja" y "Calor" | positive |
| FR-2.a | Given todos en rango / Then "✓ Las condiciones ambientales son adecuadas para las orquídeas." | state |
| FR-2.b | Given "Humedad banco norte" fuera de rango / Then "⚠ Atención: fuera de rango Humedad banco norte" | negative |
| FR-2.c | Given ningún sensor activo / Then "No hay sensores activos. Regístralos en Configuración." | negative |
| FR-2.d | Given sensores sin lecturas / Then "Aún no hay lecturas de tus sensores." | negative |
| FR-3.a | Given Datos abierta y el simulador enviando / When pasan 30 s / Then el valor cambia sin recargar | state |
| FR-3.b | Given Datos con datos / When se detiene el backend y pasan 30 s / Then los datos siguen y aparece "No se pudo conectar con el servidor." | negative |
| FR-3.c | Given el aviso de FR-3.b / When el backend vuelve / Then el aviso desaparece | event |
| FR-4.a | Given Datos / Then el periodo dice "Últimas 24 horas" y ofrece "Últimos 7 días" | positive |
| FR-4.b | Given lecturas de hace 3 días / When se elige 7 días / Then aparecen; con 24 h, no | event |
| FR-4.c | Given dos sensores de humedad / Then el gráfico de humedad tiene dos series | positive |
| FR-4.d | Given lecturas / Then la primera fila es la más reciente, con sensor, valor, fecha y hora, estado | positive |
| FR-4.e | Given un sensor con más de 1000 lecturas en 7 días / Then "Se muestran las últimas 1000 lecturas de …" | negative |
| FR-4.f | Given ninguna lectura en 24 h / Then "No hay lecturas en este periodo." | negative |
| FR-5.a | Given dos sensores de temperatura / Then Home muestra el valor de la lectura más reciente | event |
| FR-5.b | Given ningún sensor de humedad / Then Home muestra "--" en humedad | negative |
| FR-5.c | Given Home abierta y el simulador enviando / When pasan 30 s / Then el valor cambia | state |

## 6. Build order

1. Cargar `api.js` en Datos; borrar `registros` de ejemplo.
2. `estadoLectura()` y tarjetas desde `/conditions`.
3. Estado general.
4. Selector de periodo, historial por sensor, tabla.
5. Gráficos con series por sensor; Chart.js con versión fija.
6. `actualizar()` cada 30 s con aviso de rechazo.
7. Home desde `/conditions`.
8. Revisión en vivo.

## 7. Requirement coverage

| FR | Secciones |
|---|---|
| FR-1 | §1, §2, §3, §4 D6, §5 |
| FR-2 | §1, §2, §4 D6, §5 |
| FR-3 | §1, §3, §4 D4, D5, §5 |
| FR-4 | §1, §2, §3, §4 D1, D2, D3, §5 |
| FR-5 | §1, §3, §5 |
