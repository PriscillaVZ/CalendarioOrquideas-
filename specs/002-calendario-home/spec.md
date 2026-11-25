# 002 — Calendario de riego y Home conectados

Status: as-built · Depends on: `001-sesion-cliente-api`, backend `101-irrigation-schedule`, backend `104-notifications`

## 1. Context and objective

El brief pide que la persona "pueda establecer un calendario de riego para las orquídeas" (RF1) y que
el sistema le recuerde cuándo regar (RF2). La interfaz ya tenía un calendario mensual y una ventana para
programar la hora, pero guardaba los riegos en el navegador, admitía uno por día y avisaba
comparando la hora del navegador. El backend ahora guarda los riegos por persona, admite varios en un
mismo día (backend 101), valida que sean futuros en la hora del invernadero y crea él mismo los
recordatorios (backend 104).

Este spec describe la página del calendario y el calendario pequeño de Home tal como quedaron
conectados en la rama `conexion-backend` (commit `444dbab`).

**Objective:** que la persona vea en un calendario mensual sus riegos guardados en el backend, programe varios por día, cambie su hora o los quite, y reciba en el navegador los recordatorios que el backend crea.

## 2. Users

| Usuario | Relación con esta capacidad |
|---|---|
| Cultivador/a | Programa, cambia y quita riegos; mira el mes y los próximos riegos; recibe avisos. |
| El backend | Guarda los riegos, rechaza los pasados y crea los recordatorios. |

## 3. User stories

- Como cultivador/a, quiero ver el mes con los días que tienen riego marcados, para saber de un vistazo cuándo riego.
- Como cultivador/a, quiero programar más de un riego en el mismo día, para regar mañana y tarde en días de calor.
- Como cultivador/a, quiero cambiar la hora de un riego, para ajustarla sin borrarlo y crearlo de nuevo.
- Como cultivador/a, quiero quitar un riego, para saltarme un día de lluvia.
- Como cultivador/a, quiero una lista de los próximos riegos, para no recorrer mes por mes.
- Como cultivador/a, quiero un aviso del navegador cuando llega la hora, para no tener que mirar la página.
- Como cultivador/a, quiero ver en Home los días con riego, para tener el resumen sin abrir el calendario.

## 4. Functional requirements

### FR-1 — Calendario del mes (RF1)
El mes se muestra de lunes a domingo, con hoy destacado y los días con riego marcados. Los riegos son
los activos de la persona, leídos del backend al abrir la página (regla 1 del perfil); los
desactivados no se marcan porque no van a regarse.
- (a) The app shall mostrar el mes del día de hoy, con las semanas de lunes a domingo y el día de hoy destacado.
- (b) WHEN se abre la página del calendario, the app shall leer del backend los riegos activos de la persona.
- (c) The app shall marcar cada día del mes mostrado que tiene al menos un riego activo.
- (d) WHEN la persona pulsa mes anterior o mes siguiente, the app shall mostrar ese mes con sus días marcados.
- (e) IF el backend no entrega los riegos, THEN the app shall avisar "No se pudieron cargar los riegos: " seguido del mensaje del rechazo.

### FR-2 — Los riegos de un día (RF1)
Pulsar un día abre una ventana con los riegos activos de ese día. Por defecto prepara uno nuevo;
pulsar uno de la lista lo carga para cambiarlo o quitarlo. Varios riegos por día son parte del caso
(backend 101); la ventana los muestra todos.
- (a) WHEN la persona pulsa un día, the app shall mostrar la fecha elegida y la hora de cada riego activo de ese día.
- (b) WHEN la persona pulsa un día, the app shall preparar un riego nuevo: hora vacía, botón "Guardar riego" y sin botón "Eliminar".
- (c) WHEN la persona pulsa un riego de la lista del día, the app shall cargar su hora y mostrar los botones "Actualizar riego" y "Eliminar".
- (d) WHEN la persona pulsa el riego que ya estaba cargado, the app shall volver a preparar un riego nuevo.
- (e) WHEN la persona pulsa cerrar o cancelar, the app shall cerrar la ventana sin enviar nada al backend.

### FR-3 — Programar un riego (RF1)
La interfaz solo exige que haya hora; si la fecha y hora son futuras lo decide el backend en la hora del
invernadero (regla 2 del perfil, backend 101 D4), y su rechazo se muestra tal cual.
- (a) IF la persona guarda sin elegir hora, THEN the app shall pedir "Por favor, selecciona una hora de riego." sin llamar al backend.
- (b) WHEN la persona guarda un riego nuevo, the app shall enviar al backend la fecha del día elegido y la hora elegida.
- (c) WHEN la persona guarda un riego nuevo en un día que ya tiene riegos, the app shall crear un riego más sin cambiar los existentes.
- (d) IF el backend rechaza el riego, THEN the app shall mostrar su mensaje y mantener la ventana abierta.
- (e) WHEN el backend acepta el riego, the app shall cerrar la ventana y volver a leer los riegos del backend.

### FR-4 — Cambiar la hora (RF1)
Cambiar es enviar solo la hora nueva del riego cargado; la fecha sigue siendo la del día. Un cambio a
un momento nuevo reinicia su recordatorio en el backend (backend 104 D6).
- (a) WHEN la persona guarda un riego cargado, the app shall enviar al backend solo la hora nueva de ese riego.
- (b) WHEN el backend acepta el cambio, the app shall mostrar "El horario del riego fue actualizado correctamente.".

### FR-5 — Quitar un riego (RF1)
El backend no borra riegos, los desactiva (backend 101 D2); para la persona es "eliminar", porque deja
de verlo y de recibir su recordatorio.
- (a) WHEN la persona pulsa "Eliminar", the app shall pedir confirmación.
- (b) WHEN la persona confirma, the app shall marcar ese riego como inactivo en el backend.
- (c) WHEN el backend acepta, the app shall dejar de mostrar ese riego en el calendario y en los próximos riegos.

### FR-6 — Próximos riegos (RF1)
Junto al calendario, la lista de lo que viene, en el orden del backend (fecha, hora).
- (a) The app shall listar los riegos activos con fecha de hoy o posterior, cada uno con día de la semana, día, mes y hora.
- (b) The app shall ordenar la lista por fecha y luego por hora.
- (c) IF no hay riegos activos con fecha de hoy o posterior, THEN the app shall mostrar "No hay riegos programados.".

### FR-7 — Avisos del navegador (RF2)
El backend crea un recordatorio cuando llega la hora de un riego y una alerta cuando una lectura sale de
rango (backend 104). La interfaz los muestra como notificaciones del navegador mientras la página del
calendario está abierta, y recuerda cuáles ya mostró para no repetirlos. Quedan sin leer en el backend:
leerlos es de 103.
- (a) WHEN la persona guarda un riego y el permiso de notificaciones del navegador no está decidido, the app shall pedir ese permiso.
- (b) WHILE la página del calendario está abierta con permiso concedido, the app shall consultar al backend los avisos no leídos cada 30 segundos.
- (c) WHEN la consulta trae un aviso que este navegador no mostró, the app shall mostrarlo como notificación del navegador con el mensaje del backend.
- (d) The app shall titular "¡Hora de regar tus orquídeas! 🌱" los recordatorios de riego y "Alerta del invernadero ⚠" los demás avisos.
- (e) The app shall mostrar cada aviso como notificación del navegador una sola vez por navegador.

### FR-8 — Calendario de Home (RF1)
Home resume: muestra un calendario pequeño con los mismos riegos, sin editarlos.
- (a) WHEN se abre Home, the app shall leer del backend los riegos activos y marcar los días que tienen al menos uno.
- (b) WHEN la persona pulsa mes anterior o siguiente en Home, the app shall mostrar ese mes con sus días marcados.

## 5. Non-functional requirements

- **Freshness:** el calendario muestra los riegos leídos al abrir la página o tras guardar; un riego
  creado en otra pestaña aparece al recargar. Los avisos llegan a lo más 30 s después de que el backend
  los crea, y el backend los crea a lo más 60 s después de la hora (backend 104).
- **Language:** todos los textos en español; los rechazos del backend sin traducir.
- **Traceability:** FR-1 a FR-6 y FR-8 sirven a RF1; FR-7 a RF2.
- **Accessibility:** la hora se elige con el selector de hora nativo del navegador.

## 6. Edge cases

| Situación | Comportamiento esperado |
|---|---|
| Fecha u hora ya pasada (hora del invernadero) | El backend la rechaza: "La fecha y hora de riego deben ser futuras" (FR-3.d). |
| Dos riegos a la misma hora el mismo día | Ambos se crean; el backend no lo impide (backend 101). |
| Cambiar la hora de un riego cuya fecha ya pasó | El backend lo rechaza por no ser futuro. |
| Permiso de notificaciones bloqueado | Al guardar se avisa que están bloqueadas; no se consultan avisos (§10 Known deviations). |
| Navegador sin notificaciones | Al guardar se avisa "Tu navegador no permite notificaciones."; el riego se guarda igual. |
| Riego de hoy cuya hora ya pasó | Sigue en "Próximos riegos" hasta mañana (la lista filtra por fecha, no por hora). |
| Varias pestañas del calendario abiertas | Cada una consulta avisos; la lista de mostrados es común, así que cada aviso sale una vez. |

## 7. Out of scope

- Riegos recurrentes por día de la semana: backend 101 D1; `specs/backlog.md`.
- Borrar riegos (no desactivar): backend 101 D2; `specs/backlog.md`.
- Lista de avisos dentro de la interfaz y marcarlos leídos: 103.
- Temperatura y humedad de Home (hoy fijas en 25 °C y 75 %): 101.
- El reloj de Home: no usa datos del backend; queda como está.

## 8. Completion criteria

- Los riegos activos de la persona se marcan en el calendario y en Home, y se listan en próximos riegos.
- Se pueden crear dos riegos el mismo día y ambos aparecen en la ventana de ese día.
- Cambiar la hora y quitar un riego se reflejan en el backend y en la pantalla.
- Una fecha pasada muestra el rechazo del backend y no crea nada.
- Con permiso concedido, un recordatorio del backend aparece como notificación del navegador una vez.

## 9. Open questions

None.

## 10. Decisions taken

- **D1 — Varios riegos por día** (decisión del dueño, 2026-11-18). *Por qué:* es lo que pide el caso y
  lo que modela el backend (backend 101). *Descartado:* un riego por día, como hacía la versión local.
- **D2 — "Eliminar" desactiva.** *Por qué:* el backend no borra (backend 101 D2). La palabra se mantiene
  porque para la persona el riego desaparece.
- **D3 — La validación de fecha futura es del backend.** La versión local comparaba con la hora del
  navegador. *Por qué:* el backend usa la hora del invernadero (backend 101 D4) y una copia en la
  interfaz se desalinearía (regla 2 del perfil). *Descartado:* mantener ambas.
- **D4 — Los recordatorios los crea el backend; la interfaz solo los muestra.** *Por qué:* el backend
  los crea aunque la página esté cerrada y no se duplican (backend 104 D2). *Descartado:* comparar la
  hora en la página cada 10 s, como antes.
- **D5 — Consultar avisos cada 30 s.** *Por qué:* el backend revisa los riegos cada 60 s; consultar más
  seguido no adelanta nada.
- **D6 — Los avisos mostrados se recuerdan en el navegador por su id**, sin marcarlos leídos en el
  backend. *Por qué:* leerlos es una acción de la persona en la lista de avisos (103), no del sistema.
- **D7 — Próximos riegos filtra por fecha, no por fecha y hora.** *Por qué:* comparar la hora exigiría la
  hora del invernadero, que es del backend; un riego de hoy ya pasado se ve hasta mañana.
- **D8 — FR-7 lo reemplaza 103** (2026-11-18, 103 `built`). FR-7.b–e pasan a 103 FR-4 (los avisos del
  navegador en todas las páginas, desde `notificaciones.js`) y FR-7.a a 103 FR-5 (el permiso se pide desde
  la lista de avisos, no al guardar un riego). *Por qué:* un recordatorio no espera a que la persona abra
  el calendario, y pedir el permiso al guardar interrumpía y, bloqueado, avisaba en cada guardado.
  `calendario.js` ya no tiene ese código.
- **D9 — 105 reemplaza FR-2.b, FR-2.c, FR-3.a, FR-3.d, FR-3.e, FR-4.b y FR-6.a** (2026-11-21, 105 rediseño).
  - FR-2.b → 105 FR-6.c: un riego nuevo propone las 08:00 en vez de la hora vacía (105 D2).
  - FR-2.c → 105 FR-6.d: "Guardar cambios" en vez de "Actualizar riego" (105 D4).
  - FR-3.a, FR-3.d → 105 FR-6.e, FR-6.f: la hora vacía y el rechazo del backend se muestran dentro de la
    ventana, no en una ventana emergente (105 D3).
  - FR-3.e, FR-4.b → 105 FR-6.g: guardar, cambiar o quitar cierra la ventana sin mensaje; el calendario
    muestra el cambio (105 D3). Se conserva la confirmación de FR-5.a.
  - FR-6.a → 105 FR-5: el conteo "N programados" y seis filas con día, mes abreviado, "Riego a las HH:MM"
    y día de la semana.

  *Por qué:* es el rediseño aprobado (`docs/rediseno-maqueta.html`); un error junto al campo se corrige sin
  cerrar nada y un éxito ya se ve en el calendario. D7 sigue para la lista; el próximo riego de Home sí
  compara la hora, con el reloj del dispositivo (105 D1).

### Known deviations

- ~~**Permiso bloqueado avisa en cada guardado** (FR-7.a): con las notificaciones bloqueadas, cada
  guardado muestra "Las notificaciones están bloqueadas..." antes de guardar. Tarea T13.~~ → D8 (103)
- ~~**Los avisos solo llegan con la página del calendario abierta** (FR-7.b): en Home, Datos o
  Configuración no se consultan. Lo resuelve 103, que lleva los avisos a todas las páginas. Tarea T14.~~ → D8 (103)

### Taken while building

- 2026-11-18 · Claude (navegador de Orca, backend local) · FR-1.b: al abrir el calendario se leyeron los
  riegos de la cuenta de prueba. FR-2.a, FR-2.b: el 1 de diciembre mostró su riego de 18:00 con hora
  vacía y "Guardar riego". FR-3.b, FR-3.c, FR-3.e: un riego de 07:00 el mismo día se creó junto al de
  18:00 y ambos se leyeron de nuevo. FR-2.c, FR-4.a: el de 18:00 cargado mostró "Actualizar riego" y
  "Eliminar" y quedó en 19:30. FR-5.a, FR-5.b, FR-5.c: quitar el de 07:00 pidió confirmación y dejó solo
  el de 19:30. FR-3.d: el 1 de octubre mostró "La fecha y hora de riego deben ser futuras" y no creó
  nada. FR-6.a: próximos riegos listó "Martes 1 de Diciembre / Hora: …". FR-8.a, FR-8.b: Home en
  diciembre marcó el día 1.
