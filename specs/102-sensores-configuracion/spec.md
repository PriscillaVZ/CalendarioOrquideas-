# 102 — Sensores en Configuración

Status: built · Depends on: `001-sesion-cliente-api`, backend `102-sensor-registry`, backend `103-sensor-readings`

## 1. Context and objective

El brief pide integrar sensores de humedad que se conecten por Bluetooth o Wi-Fi (RF3) y un registro
histórico "con una frecuencia seleccionada por el usuario" (RF5). La página Configuración tiene hoy un
botón "Simular conexión" que solo cambia un texto en el navegador y un selector de frecuencia que se
guarda en el navegador y nada lee. Ninguno llega a un sensor.

El backend ya registra sensores (tipo, conexión, intervalo de lectura, límites), entrega a cada uno una
clave para enviar lecturas que solo se muestra una vez, permite cambiar su nombre, intervalo y límites,
desactivarlo y darle una clave nueva (backend 102), y sabe cuándo llegó su última lectura (backend 103).
El dispositivo envía lecturas con esa clave; la frecuencia de RF5 es el intervalo de cada sensor (backend
103 D2). El backlog del backend deja a la interfaz "Conectar sensores" con instrucciones si la conexión
falla.

**Objective:** que la persona registre y administre sus sensores desde Configuración, copie la clave al dispositivo, elija cada cuánto mide cada sensor, y vea si cada uno está enviando datos, con qué revisar cuando no.

## 2. Users

| Usuario | Relación con esta capacidad |
|---|---|
| Cultivador/a | Registra sensores, fija su intervalo y límites, los activa o desactiva, ve si envían. |
| Quien instala el dispositivo | Copia el id del sensor y su clave al microcontrolador o al simulador. |
| El backend | Guarda los sensores, emite las claves y recibe las lecturas. |

## 3. User stories

- Como cultivador/a, quiero registrar un sensor con su nombre, tipo y conexión, para empezar a recibir sus lecturas.
- Como quien instala, quiero ver el id y la clave del sensor al registrarlo, para cargarlos en el dispositivo.
- Como cultivador/a, quiero elegir cada cuánto mide cada sensor, para fijar la frecuencia del registro histórico.
- Como cultivador/a, quiero ajustar los límites de un sensor, para que su estado y sus alertas respondan a mis orquídeas.
- Como cultivador/a, quiero ver si cada sensor está enviando datos, y qué revisar si no, para no descubrirlo días después.
- Como cultivador/a, quiero desactivar un sensor que retiré, sin perder su historial.
- Como quien instala, quiero una clave nueva si la anterior se filtró o se perdió.

## 4. Functional requirements

### FR-1 — Mis sensores (RF3)
La lista muestra todos los sensores de la persona, activos e inactivos, con lo que se puede saber de
cada uno. Tipo y conexión se muestran en español; el backend los guarda como palabras clave (backend 102 D1).
- (a) WHEN se abre la página Configuración, the app shall leer del backend los sensores de la persona.
- (b) The app shall mostrar por cada sensor su id, nombre, tipo, conexión, intervalo de lectura en minutos, límites con su unidad y si está activo.
- (c) The app shall nombrar los tipos "Humedad" y "Temperatura", y las conexiones "Wi-Fi" y "Bluetooth".
- (d) IF un sensor no tiene un límite, THEN the app shall mostrar "—" en ese límite.
- (e) IF la persona no tiene sensores, THEN the app shall mostrar "Aún no registras sensores.".

### FR-2 — Estado de conexión (RF3)
Un sensor "conectado" es uno que envía lecturas a tiempo: su última lectura es más reciente que dos de
sus intervalos (un envío perdido no lo marca caído). Cuando no lo está, la persona necesita saber qué
revisar; los motivos posibles son pocos y conocidos (energía, red, clave, intervalo).
- (a) WHILE la última lectura de un sensor activo tiene menos de dos intervalos de antigüedad, the app shall mostrar "Conectado" junto a ese sensor.
- (b) IF la última lectura de un sensor activo tiene dos intervalos de antigüedad o más, THEN the app shall mostrar "Sin señal" junto a ese sensor.
- (c) IF un sensor activo nunca envió una lectura, THEN the app shall mostrar "Esperando la primera lectura" junto a ese sensor.
- (d) WHEN un sensor muestra "Sin señal" o "Esperando la primera lectura", the app shall mostrar junto a él qué revisar: que el dispositivo tenga energía, que esté al alcance de la red Wi-Fi o Bluetooth, que tenga el id del sensor y su clave vigente, y que su envío use la dirección del backend.
- (e) The app shall mostrar "Inactivo" en lugar del estado de conexión de un sensor inactivo.

### FR-3 — Registrar un sensor (RF3, RF5)
El formulario pide lo que el backend necesita. Los límites son opcionales: vacíos toman los del tipo, que
decide el backend (backend 102 D3, regla 2 del perfil). La clave se muestra una vez, con el id, porque es
lo que el dispositivo necesita, y nunca se guarda en el navegador (regla 4 del perfil).
- (a) The app shall pedir para un sensor nuevo nombre, tipo, conexión e intervalo de lectura, y ofrecer mínimo y máximo opcionales.
- (b) The app shall indicar junto a los límites que un límite vacío toma el valor por defecto del tipo.
- (c) WHEN el backend acepta el registro, the app shall mostrar el id del sensor y su clave con el texto "Cópiala en el dispositivo: no se volverá a mostrar.".
- (d) The app shall no guardar en el navegador ninguna clave de sensor.
- (e) IF el backend rechaza el registro, THEN the app shall mostrar su mensaje y conservar lo escrito en el formulario.
- (f) WHEN el backend acepta el registro, the app shall volver a leer la lista de sensores.
- (g) The app shall ofrecer como intervalo de lectura, al registrar y al editar, 1, 5, 15, 30, 60, 120 y 360 minutos.

### FR-4 — Cambiar un sensor (RF5, RF3)
Se cambian nombre, intervalo y límites; tipo y conexión no cambian (backend 102 D6) y se muestran sin
poder editarse. Vaciar un límite lo quita. El intervalo es la frecuencia del registro histórico de RF5.
- (a) WHEN la persona edita un sensor, the app shall ofrecer cambiar su nombre, intervalo de lectura, mínimo y máximo.
- (b) WHEN la persona edita un sensor, the app shall mostrar su tipo y su conexión sin permitir cambiarlos.
- (c) WHEN la persona guarda un sensor editado, the app shall enviar al backend solo los campos que cambiaron.
- (d) WHEN la persona guarda un límite vaciado, the app shall pedir al backend que ese límite quede sin valor.
- (e) IF el backend rechaza el cambio, THEN the app shall mostrar su mensaje y conservar lo escrito.

### FR-5 — Activar y desactivar (RF3)
Los sensores no se borran, se desactivan (backend 102 D5): un sensor inactivo no registra lecturas
(backend 103 D6) pero su historial queda.
- (a) WHEN la persona pide desactivar un sensor activo, the app shall pedir confirmación avisando que dejará de registrar lecturas.
- (b) WHEN la persona confirma la desactivación, the app shall marcar el sensor como inactivo en el backend.
- (c) WHEN la persona pide activar un sensor inactivo, the app shall marcarlo como activo en el backend.

### FR-6 — Clave nueva (RF3)
Una clave nueva invalida la anterior al instante (backend 103 FR-1.c); el dispositivo deja de enviar hasta
recibir la nueva, por eso se confirma.
- (a) WHEN la persona pide una clave nueva, the app shall pedir confirmación avisando que la clave anterior deja de funcionar.
- (b) WHEN el backend entrega la clave nueva, the app shall mostrarla con el id del sensor y el texto de FR-3.c.

### FR-7 — Fin de la simulación local (RF3, RF5)
El botón "Simular conexión" y el selector de frecuencia global no llegan a ningún sensor; quedarse
mostraría una conexión y una frecuencia que no existen.
- (a) The app shall no ofrecer "Simular conexión" ni una frecuencia de registro global; la frecuencia es el intervalo de cada sensor (FR-4.a).

## 5. Non-functional requirements

- **Security:** la clave de un sensor solo aparece en pantalla en la respuesta que la trae; no queda en
  el almacenamiento del navegador, en la consola ni en la dirección de la página.
- **Language:** textos en español; los rechazos del backend sin traducir.
- **Freshness:** el estado de conexión se calcula al abrir la página y al volver a leer la lista
  (tras un cambio); no se actualiza solo.
- **Traceability:** FR-1, FR-2, FR-5, FR-6 sirven a RF3; FR-3, FR-4 y FR-7 a RF3 y RF5.
- **Accessibility:** cada campo con etiqueta; el estado de conexión con palabras, no solo color.

## 6. Edge cases

| Situación | Comportamiento esperado |
|---|---|
| Mínimo mayor que el máximo | El backend responde "El límite inferior no puede ser mayor que el superior"; se muestra (FR-3.e, FR-4.e). |
| Intervalo de 0 o negativo | El backend lo rechaza; se muestra su mensaje. |
| Nombre de más de 100 caracteres | El campo no admite más (límite del backend). |
| Sensor reactivado | Vuelve a "Esperando la primera lectura" o "Sin señal" según su última lectura. |
| Clave nueva con el dispositivo encendido | El dispositivo recibe rechazos hasta cargar la nueva; el sensor pasa a "Sin señal". |
| Cerrar la página sin copiar la clave | No se puede recuperar; se pide una clave nueva (FR-6). |
| Intervalo cambiado | El dispositivo lo recibe en su siguiente envío (backend 103 D2); el estado usa el intervalo nuevo. |

## 7. Out of scope

- Emparejar por Bluetooth o configurar el Wi-Fi del dispositivo: firmware (backend backlog).
- Más tipos de sensor o de conexión: backend 102 D1; backend backlog.
- Borrar sensores: backend 102 D5; `specs/backlog.md`.
- Ver lecturas e historial: 101.
- La tarjeta "Modificar fechas de riego" (enlace al calendario): queda como está.

## 8. Completion criteria

- Un sensor registrado desde Configuración recibe lecturas del simulador del backend con el id y la
  clave mostrados, y pasa a "Conectado".
- Detener el simulador deja el sensor en "Sin señal" tras dos intervalos, con qué revisar.
- Cambiar el intervalo y los límites se refleja en el backend y en Datos (101).
- Desactivar y activar funcionan; una clave nueva deja inservible la anterior.
- No queda "Simular conexión" ni el selector de frecuencia global, y `localStorage` no tiene claves.

## 9. Open questions

- ~~[NEED CLARIFICATION] (affects FR-3.a, FR-4.a, T04, T05) ¿El intervalo se elige de una lista o se escribe en minutos? Propuesta: lista 1, 5, 15, 30, 60, 120 y 360 minutos (las de hoy más 1 y 5 para probar con el simulador). El backend acepta cualquier número entero de minutos desde 1.~~ → D5
- ~~[NEED CLARIFICATION] (affects FR-2.a, FR-2.b, T03) ¿Desde cuándo un sensor está "Sin señal"? Propuesta: dos intervalos sin lectura (un envío perdido no lo marca caído).~~ → D6

## 10. Decisions taken

- **D1 — La frecuencia de RF5 es el intervalo de cada sensor.** *Por qué:* el backend la guarda por
  sensor y la devuelve al dispositivo en cada envío (backend 103 D2). *Descartado:* el selector global
  de hoy: se guardaba en el navegador y nada lo leía.
- **D2 — El estado de conexión sale de la última lectura** (backend 103 FR-3), no de un "ping" del
  dispositivo. *Por qué:* el backend no tiene otra señal; una lectura reciente es la prueba de que el
  dispositivo funciona de punta a punta (energía, red, clave).
- **D3 — La clave se muestra con el id del sensor.** *Por qué:* el dispositivo necesita ambos para
  enviar (backend 103 FR-1); mostrar solo la clave obligaría a buscar el id en otra parte.
- **D4 — Los límites por defecto no se escriben en la interfaz.** *Por qué:* son del backend (backend 102
  D3); el formulario dice que vacío toma el del tipo y la lista muestra el valor que quedó.
- **D5 — El intervalo se elige de una lista: 1, 5, 15, 30, 60, 120 y 360 minutos** (respuesta del dueño,
  2026-11-18; FR-3.g). *Por qué:* son las opciones que la página ya ofrecía más 1 y 5 para probar con el
  simulador. *Descartado:* un número libre: el backend lo acepta, pero una lista evita "7 minutos" por
  error de tipeo.
- **D6 — "Sin señal" desde dos intervalos sin lectura** (respuesta del dueño, 2026-11-18; FR-2.a, FR-2.b).
  *Por qué:* un envío perdido no marca caído al sensor. *Descartado:* un intervalo (parpadea con la red)
  y tres (tarda en notar un sensor muerto).

### Taken while building

- 2026-11-18 · Claude (navegador de Orca, backend local, simulador del backend; cuenta de prueba con
  sensores 7–10 de 101) · round 1: FR-7.a: Configuración sin "Simular conexión" ni frecuencia global,
  solo "Mis sensores" y "Modificar fechas de riego". FR-1.a, FR-1.b, FR-1.c: la lista leyó `/sensors` y
  mostró "#7 · Humedad banco norte" con "Humedad · Wi-Fi · Intervalo: 1 min · Mín: 70 % · Máx: 90 % ·
  Activo" (y "Bluetooth", "Temperatura", "°C" en los demás). FR-1.d: con el máximo del 10 vaciado por la
  API, "Máx: —". FR-1.e: con `sensores = []` en la consola, "Aún no registras sensores.". FR-2.a: con el
  simulador enviando, 7–9 "Conectado". FR-2.c, FR-2.d: el 10, sin lecturas, "Esperando la primera
  lectura" con los 4 puntos de qué revisar (energía, Wi-Fi, id 10 y clave vigente, dirección
  `http://localhost:8000`). FR-2.b: con el simulador detenido a las 16:30:59, a las 16:33:10 (dos
  intervalos de 1 min) 7–9 pasaron a "Sin señal" con qué revisar.
- 2026-11-18 · Claude (mismo entorno) · round 2: FR-3.a, FR-3.b, FR-3.g: "Registrar sensor" abrió el
  formulario con Nombre, Tipo, Conexión, Intervalo de lectura (1, 5, 15, 30, 60, 120, 360), Mínimo y
  Máximo, y "Si dejas un límite vacío, se usa el valor por defecto del tipo.". FR-3.e: mínimo 95 y máximo
  90 mostraron "El límite inferior no puede ser mayor que el superior" con el formulario abierto y lo
  escrito conservado. FR-3.c: con los límites vacíos se registró el sensor 11 y se mostró "Sensor 11 ·
  clave:" con la clave (43 caracteres, no copiada aquí) y "Cópiala en el dispositivo: no se volverá a
  mostrar."; el simulador del backend con esa clave recibió "201 aceptada". FR-3.d: ningún valor de
  `localStorage` contenía la clave, tampoco tras la clave nueva. FR-3.f: el 11 apareció en la lista con
  70 %–90 %; repetido tras corregir el botón (sensor 12, temperatura, Bluetooth). FR-4.a, FR-4.b:
  "Editar" en el 11 mostró sus valores con Tipo y Conexión deshabilitados y la ayuda de límite vacío de
  edición. FR-4.c: cambiar solo el nombre envió `{"name": "Humedad maceta"}`. FR-4.d: vaciar el máximo
  envió `{"max_val": null}`, la lista mostró "Máx: —" y `GET /sensors/11` dio `max_val` null. FR-4.e:
  95/90 al editar mostró el rechazo y conservó lo escrito. FR-5.a: "Desactivar" preguntó
  "¿Desactivar «Humedad maceta»? Dejará de registrar lecturas."; cancelar no cambió nada. FR-5.b: al
  confirmar, "Inactivo" y botón "Activar"; el simulador recibió "403 Sensor inactivo". FR-2.e: el sensor
  inactivo mostró "Inactivo" sin qué revisar. FR-5.c: "Activar", sin confirmación, lo devolvió a
  "Conectado". FR-6.a: "Clave nueva" preguntó "¿Generar una clave nueva para «Humedad maceta»? La clave
  anterior deja de funcionar.". FR-6.b: al confirmar se mostró la clave nueva con "Sensor 11"; el
  simulador con la clave anterior recibió "401 Clave de sensor inválida" y se detuvo.
