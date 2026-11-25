# 107 — Configuración del rediseño · Implementation plan

Status: building · Spec: `spec.md` · Reference: `specs/sdd.profile.md`

Referencia visual: `docs/rediseno-maqueta.html`, vista `#configuracion` y `dlgSensor`. Usa el sistema
de 104 (`.panel`, `.chip`, `.btn`, `dialog`, `.field`).

## 1. Module structure

### A. Páginas y cliente compartido

| Archivo | Contiene | FR |
|---|---|---|
| `Configuracion/configuracion.html` | Un `.panel` "Mis sensores" con `.panel-head` (título, descripción y `button#btnNuevoSensor` "+ Registrar sensor"); `#mensajeSensores`; `.clave#claveSensor` con `strong#claveSensorTitulo`, `code#claveSensorValor`, `button#copiarClave`, `button#cerrarClave` ("Listo") y el texto de FR-3.a; `.filas-sensor#listaSensores`; `<dialog id="dlgSensor">` con `form#formSensor` (los campos de hoy, `h2#tituloSensor`, `button.cerrar`, `#ayudaLimites`, `#mensajeFormulario`, "Cancelar"/"Guardar"); se borra la tarjeta "Modificar fechas de riego" | FR-1, FR-2, FR-3 |
| `Configuracion/configuracion.js` | `mostrarSensores()` arma `.fila-sensor` (`.apagado` si inactivo) con `.id`, chip `dot` con la clase de `estadoConexion()`, `.meta`, `.acciones` y `.revisar`; `abrirFormulario()` usa `showModal()` y el título de FR-2.b; tras aceptar, `close()`; `mostrarClave()` con el título nuevo; `copiarClave()` | FR-1, FR-2, FR-3 |
| `Configuracion/configuracion.css` | Solo `.filas-sensor`, `.fila-sensor`, `.meta`, `.acciones`, `.revisar`, `.clave`, `.clave-row` y sus cortes | FR-1, FR-3 |

## 2. Data model

Los mismos de 102 §2 (`GET /sensors`, `GET /conditions`, `POST`/`PATCH /sensors`, `POST /sensors/{id}/ingest-key`).
Nada nuevo en el navegador; la clave vive solo en el `code` hasta "Listo" o recargar (102 FR-3.d).

Estado → chip (FR-1.b):

| `estadoConexion()` | Clase |
|---|---|
| Conectado | `ok` |
| Sin señal | `hot` |
| Esperando la primera lectura | `warn` |
| Inactivo | `none` |

## 3. Surface

| Acción | Llamadas | FR |
|---|---|---|
| Abrir Configuración | `GET /sensors`, `GET /conditions` | FR-1 |
| Guardar en la ventana | `POST /sensors` o `PATCH /sensors/{id}` | FR-2 |
| "Copiar" | ninguna (`navigator.clipboard.writeText`) | FR-3.b |

## 4. Technical decisions

- **D1 — Ventana nativa `<dialog>`** con `showModal()`, como 105 D1. El formulario de hoy se mueve
  adentro sin cambiar sus campos ni `cambiosDelFormulario()`. (FR-2)
- **D2 — `copiarClave()` con `navigator.clipboard.writeText`; si falla, `getSelection().selectAllChildren(code)`.**
  *Por qué:* el portapapeles exige un origen seguro o `localhost`; en otro origen sin HTTPS falla y la
  selección deja copiar con el teclado. (FR-3.b, FR-3.c)
- **D3 — Los rechazos se muestran en `#mensajeFormulario`**, que ya existe, ahora dentro de la ventana. (FR-2.d)

## 5. Test strategy

Revisiones en vivo (perfil) con cuenta `@example.com` en perfil aislado de Orca y sensores de prueba en
los cuatro estados (el simulador del backend con clave por tubería, nunca impresa). Para FR-3.c, el
portapapeles reemplazado en la consola por uno que rechaza. Comparar con la maqueta. Anotadas en spec §10.

| Bullet | Caso (Given / When / Then) | Kind |
|---|---|---|
| FR-1.a | Given el sensor 13 / Then "#13", su nombre y un chip con punto | positive |
| FR-1.b | Given sensores en los cuatro estados / Then verde, rojo, ámbar, gris | positive |
| FR-1.c | Then "Temperatura · Wi-Fi · Cada 1 min · Mín 0 °C · Máx 1 °C" | positive |
| FR-1.d | Given un sensor inactivo / Then su fila atenuada | positive |
| FR-1.e | Given un sensor esperando su primera lectura / Then "Qué revisar" en caja ámbar | positive |
| FR-1.f | Then sin "Modificar fechas de riego" | negative |
| FR-2.a | When "+ Registrar sensor" / Then ventana "Registrar sensor" vacía | event |
| FR-2.b | When "Editar" en el 13 / Then "Editar sensor #13" con sus valores | event |
| FR-2.c | Then los siete textos de intervalo | positive |
| FR-2.d | Given mínimo 95 y máximo 90 / When guardar / Then el rechazo en la ventana abierta con lo escrito | negative |
| FR-2.e | When guardar aceptado / Then la ventana cerrada y la lista leída de nuevo | event |
| FR-2.f | When Escape / Then cerrada y ninguna petición | event |
| FR-3.a | Given un registro aceptado / Then "Sensor N · clave nueva" y el texto de FR-3.a | positive |
| FR-3.b | When "Copiar" / Then "Copiada" y el portapapeles con la clave (verificado sin imprimirla: longitud y comparación) | event |
| FR-3.c | Given el portapapeles rechazando / When "Copiar" / Then la clave seleccionada | negative |
| FR-3.d | When "Listo" / Then la caja oculta | event |

## 6. Build order

1. Filas de sensor con chip, meta, atenuado y caja de qué revisar; quitar la tarjeta del calendario.
2. Formulario en `<dialog>`.
3. Caja de la clave con copiar.
4. Revisión en vivo; actualizar 102.

## 7. Requirement coverage

| FR | Secciones |
|---|---|
| FR-1 | §1, §2, §3, §5 |
| FR-2 | §1, §3, §4 D1, D3, §5 |
| FR-3 | §1, §3, §4 D2, §5 |
