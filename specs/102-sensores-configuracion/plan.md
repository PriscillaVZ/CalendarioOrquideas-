# 102 — Sensores en Configuración · Implementation plan

Status: built · Spec: `spec.md` · Reference: `specs/sdd.profile.md`

## 1. Module structure

### A. Páginas y cliente compartido

| Archivo | Contiene | FR |
|---|---|---|
| `Configuracion/configuracion.html` | Carga `../api.js`; tarjeta "Mis sensores" con `#listaSensores`; formulario `#formSensor` (registrar y editar, con etiquetas); `#claveSensor` para la clave; se quitan "Estado de conexión" simulado y "Frecuencia del registro histórico"; queda "Modificar fechas de riego" | FR-1 a FR-7 |
| `Configuracion/configuracion.js` | `cargarSensores()`, `estadoConexion(sensor, condicion)`, `mostrarSensores()`, `abrirFormulario(sensor?)`, `guardarSensor()`, `cambiarActivo(sensor)`, `nuevaClave(sensor)`, `mostrarClave(id, clave)`. Se borra la simulación y la frecuencia en `localStorage` | FR-1 a FR-7 |
| `Configuracion/configuracion.css` | Fila de sensor, estado de conexión (clases `conectado`/`desconectado` existentes), caja de clave | FR-1, FR-2, FR-3.c |

## 2. Data model

`GET /sensors` (backend 102 FR-2), todos los sensores de la persona por id:

```json
[{ "id": 3, "name": "Humedad banco norte", "type": "humidity", "unit": "%", "connection_type": "wifi",
   "reading_interval_minutes": 15, "min_val": 70.0, "max_val": 90.0, "is_active": true }]
```

`GET /conditions` (backend 103 FR-3), para la última lectura de cada sensor activo: `sensor_id`, `recorded_at`.

`POST /sensors` responde lo mismo que un sensor más `ingest_key`; `POST /sensors/{id}/ingest-key`
responde `{ "ingest_key": "…" }`. La clave solo vive en la variable local que la dibuja (FR-3.d).

Estado de conexión (FR-2), con `ahora` del navegador:

```
!is_active                                   → "Inactivo"
recorded_at == null                          → "Esperando la primera lectura" + qué revisar
ahora - recorded_at <  2 × intervalo         → "Conectado"
si no                                        → "Sin señal" + qué revisar
```

Nada se guarda en el navegador. Las claves viejas `sensorConectado` y `frecuenciaRegistro` de
`localStorage` dejan de leerse.

## 3. Surface

| Acción | Llamadas | FR |
|---|---|---|
| Abrir Configuración | `GET /sensors`, `GET /conditions` en paralelo | FR-1.a, FR-2 |
| Registrar | `POST /sensors` `{name, type, connection_type, reading_interval_minutes, min_val?, max_val?}` (límites vacíos se omiten) | FR-3 |
| Guardar edición | `PATCH /sensors/{id}` con solo lo cambiado; límite vaciado = `null` | FR-4.c, FR-4.d |
| Desactivar / activar | `PATCH /sensors/{id}` `{is_active}` | FR-5 |
| Clave nueva | `POST /sensors/{id}/ingest-key` | FR-6 |

Después de cada acción aceptada se vuelve a leer la lista y las condiciones.

## 4. Technical decisions

- **D1 — Un solo formulario para registrar y editar**, con tipo y conexión deshabilitados al editar.
  *Descartado:* dos formularios: los campos son casi los mismos. (FR-3.a, FR-4.a, FR-4.b)
- **D2 — Al registrar, un límite vacío se omite; al editar, se envía `null`.** *Por qué:* en el registro
  omitir pide el valor por defecto (backend 102 D3); en la edición `null` quita el límite (backend 102
  FR-3). Enviar `null` al registrar también daría el defecto, pero omitirlo es lo que el contrato
  nombra. (FR-3.b, FR-4.d)
- **D3 — "Solo lo cambiado"** se calcula comparando el formulario con el sensor leído. (FR-4.c)
- **D4 — La clave se dibuja con `textContent`** en una caja que se vacía al cerrar el aviso o recargar;
  no pasa por `console`, `localStorage` ni la dirección. (FR-3.c, FR-3.d)
- **D5 — Confirmaciones con `confirm()`**, como el calendario (002 FR-5.a). (FR-5.a, FR-6.a)

## 5. Test strategy

Revisiones en vivo en el navegador de Orca (perfil), con el simulador del backend para las conexiones;
anotadas en spec §10.

| Bullet | Caso (Given / When / Then) | Kind |
|---|---|---|
| FR-1.a | Given sesión / When se abre Configuración / Then hay una petición a `/sensors` | event |
| FR-1.b | Given un sensor / Then su fila muestra id, nombre, tipo, conexión, "15 min", "70 % – 90 %", Activo | positive |
| FR-1.c | Given `humidity`/`wifi` / Then "Humedad" y "Wi-Fi" | positive |
| FR-1.d | Given máximo vacío / Then "—" en máximo | negative |
| FR-1.e | Given una cuenta nueva / Then "Aún no registras sensores." | negative |
| FR-2.a | Given el simulador enviando cada minuto con intervalo 1 / Then "Conectado" | state |
| FR-2.b | Given el simulador detenido hace más de 2 intervalos / Then "Sin señal" | negative |
| FR-2.c | Given un sensor recién registrado / Then "Esperando la primera lectura" | negative |
| FR-2.d | Given "Sin señal" / Then se ve la lista de qué revisar | event |
| FR-2.e | Given un sensor inactivo / Then "Inactivo" y sin lista de qué revisar | positive |
| FR-3.a | Given el formulario / Then nombre, tipo, conexión, intervalo, mínimo y máximo con etiqueta | positive |
| FR-3.b | Given el formulario / Then el texto de límite vacío está junto a los límites | positive |
| FR-3.c | Given un registro aceptado / Then id y clave con "Cópiala en el dispositivo: no se volverá a mostrar." | event |
| FR-3.d | Given un registro aceptado / Then ningún valor de `localStorage` contiene la clave | positive |
| FR-3.e | Given mínimo 95 y máximo 90 / When se registra / Then "El límite inferior no puede ser mayor que el superior" y el formulario conserva lo escrito | negative |
| FR-3.f | Given un registro aceptado / Then el sensor aparece en la lista | event |
| FR-3.g | Given el formulario al registrar y al editar / Then el intervalo ofrece 1, 5, 15, 30, 60, 120 y 360 min | positive |
| FR-4.a | Given "Editar" / Then nombre, intervalo, mínimo y máximo editables | event |
| FR-4.b | Given "Editar" / Then tipo y conexión deshabilitados | event |
| FR-4.c | Given solo el nombre cambiado / When se guarda / Then el `PATCH` lleva solo `name` | event |
| FR-4.d | Given el máximo vaciado / When se guarda / Then el `PATCH` lleva `max_val: null` y la lista muestra "—" | event |
| FR-4.e | Given mínimo mayor que máximo / When se guarda / Then el rechazo se muestra | negative |
| FR-5.a | Given un sensor activo / When "Desactivar" / Then pide confirmación con el aviso | event |
| FR-5.b | Given la confirmación / Then el sensor queda "Inactivo" | event |
| FR-5.c | Given un sensor inactivo / When "Activar" / Then deja de decir "Inactivo" | event |
| FR-6.a | Given "Clave nueva" / Then pide confirmación avisando que la anterior deja de funcionar | event |
| FR-6.b | Given la confirmación / Then se muestra la clave nueva; el simulador con la vieja recibe "Clave de sensor inválida" | event |
| FR-7.a | Given Configuración / Then no hay "Simular conexión" ni selector de frecuencia global | positive |

## 6. Build order

1. Cargar `api.js`; quitar simulación y frecuencia global.
2. Lista desde `/sensors` con estado de conexión desde `/conditions`.
3. Formulario de registro y caja de clave.
4. Edición con solo lo cambiado.
5. Activar / desactivar y clave nueva.
6. Revisión en vivo con el simulador.

## 7. Requirement coverage

| FR | Secciones |
|---|---|
| FR-1 | §1, §2, §3, §5 |
| FR-2 | §1, §2, §3, §5 |
| FR-3 | §1, §2, §3, §4 D1, D2, D4, §5 |
| FR-4 | §1, §3, §4 D1, D2, D3, §5 |
| FR-5 | §1, §3, §4 D5, §5 |
| FR-6 | §1, §2, §3, §4 D4, D5, §5 |
| FR-7 | §1, §2, §6 |
