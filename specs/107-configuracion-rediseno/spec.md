# 107 — Configuración del rediseño

Status: building · Supersedes: 102 FR-3.c (texto de la clave) · Depends on: `104-marco-visual`, `102-sensores-configuracion`

## 1. Context and objective

La maqueta del rediseño (`docs/rediseno-maqueta.html`, vista `#configuracion` y la ventana `dlgSensor`)
reorganiza "Mis sensores" sin cambiar lo que se puede hacer (102: registrar, editar, activar, desactivar,
pedir clave nueva, ver el estado de conexión). Cada sensor es una fila con su estado como chip; el
formulario se abre en una ventana; la clave recién entregada se puede copiar con un botón. La tarjeta
"Modificar fechas de riego" desaparece: el Calendario está en la barra lateral.

Lo que la maqueta propone y choca con el backend se deja como lo define 102: un límite vacío al registrar
toma el valor por defecto del tipo (backend 102 D3), así que la ayuda de la maqueta ("Deja un límite
vacío si ese lado no debe generar alertas") solo vale al editar (D2); y el tipo y la conexión no se
cambian al editar (102 FR-4.b).

**Objective:** que Configuración muestre los sensores como filas con su estado de color, registre y edite en una ventana, y deje copiar la clave con un botón, como en la maqueta.

## 2. Users

| Usuario | Relación con esta capacidad |
|---|---|
| Cultivador/a | Registra y mantiene sus sensores; copia la clave al dispositivo. |
| El backend | Guarda los sensores, entrega la clave una vez y la última lectura de cada uno. |

## 3. User stories

- Como cultivador/a, quiero ver de un vistazo qué sensor no está enviando, para ir a revisarlo.
- Como cultivador/a, quiero registrar un sensor en una ventana, para no perder de vista la lista.
- Como cultivador/a, quiero copiar la clave con un botón, para no equivocarme al transcribirla al dispositivo.

## 4. Functional requirements

### FR-1 — Filas de sensor (RF3)
Los datos de 102 FR-1 y FR-2 en una fila por sensor: id, nombre, estado de conexión como chip con punto
de color, y una línea con sus datos. Un sensor inactivo se atenúa; "qué revisar" va en una caja de
advertencia dentro de su fila.
- (a) The app shall mostrar cada sensor en una fila con "#<id>", su nombre y su estado de conexión (102 FR-2) como chip con punto.
- (b) The app shall colorear el chip "Conectado" en verde, "Sin señal" en rojo, "Esperando la primera lectura" en ámbar e "Inactivo" en gris.
- (c) The app shall mostrar bajo el nombre el tipo, la conexión, "Cada N min", "Mín <límite>" y "Máx <límite>".
- (d) The app shall atenuar la fila de un sensor inactivo.
- (e) The app shall mostrar "Qué revisar" (102 FR-2.d) en una caja ámbar dentro de la fila del sensor.
- (f) The app shall no mostrar en Configuración la tarjeta "Modificar fechas de riego".

### FR-2 — Formulario en una ventana (RF3, RF5)
El formulario de 102 FR-3 y FR-4 se abre en una ventana sobre la lista. Los campos, las reglas y lo que
se envía no cambian; cambia dónde aparecen el título y los errores.
- (a) WHEN la persona pulsa "+ Registrar sensor", the app shall abrir una ventana "Registrar sensor" con el formulario vacío.
- (b) WHEN la persona pulsa "Editar" en un sensor, the app shall abrir la ventana titulada "Editar sensor #<id>" con los valores del sensor.
- (c) The app shall nombrar los intervalos "Cada 1 minuto", "Cada 5 minutos", "Cada 15 minutos", "Cada 30 minutos", "Cada 1 hora", "Cada 2 horas" y "Cada 6 horas".
- (d) IF el backend rechaza el registro o el cambio, THEN the app shall mostrar su mensaje dentro de la ventana y dejarla abierta con lo escrito.
- (e) WHEN el backend acepta el registro o el cambio, the app shall cerrar la ventana.
- (f) WHEN la persona pulsa "Cancelar", "×" o la tecla Escape, the app shall cerrar la ventana sin enviar nada al backend.

### FR-3 — La clave (RF3)
La clave se muestra una sola vez (102 FR-3.c, FR-6.b) y ahora se puede copiar con un botón. Copiar usa el
portapapeles del sistema; la clave sigue sin guardarse en el navegador (102 FR-3.d).
- (a) The app shall mostrar la clave en una caja titulada "Sensor <id> · clave nueva" con el texto "Cárgala en el dispositivo ahora. No se volverá a mostrar.".
- (b) WHEN la persona pulsa "Copiar", the app shall copiar la clave al portapapeles y cambiar el botón a "Copiada".
- (c) IF el navegador no permite copiar, THEN the app shall seleccionar el texto de la clave para copiarlo a mano.
- (d) WHEN la persona pulsa "Listo", the app shall ocultar la caja de la clave.

## 5. Non-functional requirements

- **Security:** la clave no se guarda en el navegador ni se escribe en la consola (102 FR-3.d, regla 4 del
  perfil); el portapapeles es una acción de la persona.
- **Accessibility:** la ventana se cierra con Escape y devuelve el foco al botón que la abrió; los chips
  dicen su estado en texto, no solo en color; la caja de la clave se anuncia al aparecer.
- **Language:** textos en español; límites con coma decimal (104 FR-1.e).
- **Traceability:** FR-1 y FR-3 sirven a RF3; FR-2 a RF3 y RF5.

## 6. Edge cases

| Situación | Comportamiento esperado |
|---|---|
| Rechazo "El límite inferior no puede ser mayor que el superior" | Dentro de la ventana, con lo escrito (FR-2.d). |
| Copiar en una página sin permiso de portapapeles | La clave queda seleccionada (FR-3.c). |
| Cerrar la ventana a medio escribir | Se pierde lo escrito, nada se envía (FR-2.f). |
| Intervalo guardado fuera de la lista (p. ej. 10 min por la API) | La ventana lo muestra como opción extra, como hoy (102 T05). |
| Sensor inactivo con "qué revisar" pendiente | Solo "Inactivo", sin caja (102 FR-2.e). |

## 7. Out of scope

- Borrar sensores: backend 102 D5; `specs/backlog.md`.
- "Ajustes de tu cuenta" (la descripción del encabezado los nombra): no hay ajustes de cuenta que mostrar;
  editar el perfil está en el backlog (backend 001 §7).
- Home, Calendario y Datos: 105 y 106.

## 8. Completion criteria

- Configuración se ve como la vista `#configuracion` de la maqueta, en claro y oscuro, a 1280 y 390 px.
- Registrar, editar, activar, desactivar y pedir clave nueva funcionan como en 102, con el formulario en una ventana y la clave copiable.

## 9. Open questions

None.

## 10. Decisions taken

- **D1 — Se quita la tarjeta "Modificar fechas de riego"** (102 §10 la conservaba). *Por qué:* la maqueta no
  la tiene y el Calendario está a un clic en la barra lateral.
- **D2 — La ayuda de los límites sigue a 102.** Al registrar: "Si dejas un límite vacío, se usa el valor por
  defecto del tipo." (102 FR-3.b); al editar, la de 102 para un límite vaciado. *Por qué:* la frase de la
  maqueta ("si ese lado no debe generar alertas") es falsa al registrar: el backend pone el límite por
  defecto (backend 102 D3), y mostrarla haría registrar sensores que alertan cuando la persona creía que no.
- **D3 — El tipo y la conexión siguen sin poder cambiarse al editar** (102 FR-4.b), aunque la maqueta los
  deja editables. *Por qué:* el backend no los cambia; un campo editable que se ignora engaña.
- **D4 — "Cárgala en el dispositivo ahora. No se volverá a mostrar."** reemplaza el texto de 102 FR-3.c.
  *Por qué:* es el texto de la maqueta y dice lo mismo.
- **D5 — "Sin señal" en rojo.** La maqueta no muestra ese estado; rojo es el color de lo que falla (104
  FR-1.d).

### Taken while building

**Revisión en vivo, ronda 1 (T01–T03)** — Claude, 2026-11-22, navegador de Orca (perfil aislado), backend en
`:8000`, cuenta `alvaro.104@example.com` con sensores 15 (lectura recién enviada), 16 (última lectura de hace
horas), 17 (sin lecturas) y 18 (desactivado); peticiones contadas envolviendo `fetch` en la página; capturas
en claro y oscuro a 1280 px y en claro a 390 px.
- FR-1.a: "#15 Temperatura invernadero" con chip con punto "Conectado".
- FR-1.b: chips "Conectado" verde, "Sin señal" rojo, "Esperando la primera lectura" ámbar e "Inactivo" gris,
  en claro y oscuro.
- FR-1.c: "Temperatura · Wi-Fi · Cada 15 min · Mín 18 °C · Máx 24 °C"; sin máximo, "Máx —".
- FR-1.d: la fila del sensor 18 con opacidad 0,65.
- FR-1.e: "Qué revisar" en caja ámbar dentro de las filas 16 y 17; no en la 18 (inactiva, 102 FR-2.e).
- FR-1.f: la página no tiene "Modificar fechas de riego"; `grep -c` en el HTML da 0.
- FR-2.a: "+ Registrar sensor" abre "Registrar sensor" con el nombre vacío, "Cada 1 hora" y la ayuda de 102
  FR-3.b.
- FR-2.b: "Editar" en el 15 abre "Editar sensor #15" con nombre, 18 y 24, "Cada 15 minutos", y tipo y
  conexión fijos (atenuados).
- FR-2.c: los siete textos, de "Cada 1 minuto" a "Cada 6 horas".
- FR-2.d: mínimo 95 y máximo 90 → "El límite inferior no puede ser mayor que el superior" dentro de la
  ventana abierta, con 95 y 90 escritos.
- FR-2.e: cambiar el nombre a "Temperatura invernadero norte" envía un PATCH, cierra la ventana, la fila
  muestra el nombre nuevo y el foco vuelve a su "Editar".
- FR-2.f: "Cancelar", "×" y Escape cierran sin peticiones; con Escape el foco vuelve al "Editar" que la abrió.
- FR-3.a: registrar "Sensor prueba 107" muestra "Sensor 19 · clave nueva" con "Cárgala en el dispositivo
  ahora. No se volverá a mostrar." y el foco en "Copiar"; `localStorage` solo guarda `token`.
- FR-3.b: un clic real en "Copiar" cambia el botón a "Copiada"; pegado en un campo temporal, el portapapeles
  tenía una cadena de 43 caracteres igual a la clave.
- FR-3.c: con `navigator.clipboard.writeText` rechazando y una clave falsa, "Copiar" deja el texto
  seleccionado y el botón sin cambiar.
- FR-3.d: "Listo" oculta la caja y vacía la clave.
- Cortes: a 390 px las filas pasan a una columna, la ventana mide 354 px sin scroll lateral.

**Incidente en la revisión:** al pegar con `orca keypress`, la herramienta imprimió una instantánea de la
página con la clave del sensor de prueba 19. La clave se reemplazó en el acto (`POST
/sensors/19/ingest-key`), así que la impresa ya no sirve; la nueva no se imprimió.
