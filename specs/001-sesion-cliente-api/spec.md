# 001 — Sesión y cliente de la API

Status: as-built · Depends on: backend `001-accounts-auth`

## 1. Context and objective

La interfaz nació guardando todo en el navegador. El backend (Riego Backend) es ahora la fuente de los
datos, y casi todo lo que ofrece exige saber quién pide: cada riego, sensor y aviso pertenece a una
persona (backend 001, regla 1 de su perfil). Por eso la interfaz necesita una puerta de entrada (crear
cuenta, iniciar sesión), recordar la sesión mientras dure, y tratar igual en todas las páginas tres
situaciones que se repiten: no hay sesión, la sesión venció, y el backend rechazó lo pedido con un
mensaje que la persona debe leer.

Este spec describe ese comportamiento tal como está hoy en la rama `conexion-backend` (commit
`444dbab`). Lo que cada página hace con los datos es de su propio spec (002, 101–103).

**Objective:** que una persona entre con su cuenta, use todas las páginas con esa sesión y, si la sesión falta o vence, vuelva a la entrada sin perder el rumbo.

## 2. Users

| Usuario | Relación con esta capacidad |
|---|---|
| Cultivador/a | Crea su cuenta, inicia y cierra sesión. |
| Cada página de la interfaz | Pide datos al backend con la sesión y recibe sus rechazos como texto. |
| El backend | Emite el token de sesión, lo exige y responde los rechazos en español. |

## 3. User stories

- Como cultivador/a, quiero crear mi cuenta desde la interfaz, para no depender de nadie que la cree por mí.
- Como cultivador/a, quiero iniciar sesión con mi correo y contraseña, para ver solo mis riegos y sensores.
- Como cultivador/a, quiero que al vencer mi sesión la interfaz me lleve a iniciar sesión, para no quedarme mirando una página que ya no carga nada.
- Como cultivador/a, quiero leer en español por qué no se guardó algo, para corregirlo.
- Como cultivador/a, quiero cerrar sesión, para que otra persona use el mismo navegador.

## 4. Functional requirements

### FR-1 — Iniciar sesión (no sirve a un RF; habilita RF1–RF7)
La persona entra con su correo y contraseña; el backend devuelve un token que la interfaz guarda y
envía en cada petición. Tras entrar se va a Home, la página que resume todo. Un rechazo se muestra bajo
el formulario, no en una ventana emergente, para que la persona corrija sin perder lo escrito.
- (a) WHEN la persona envía un correo y una contraseña que el backend acepta, the app shall guardar en el navegador el token de sesión que el backend devuelve.
- (b) WHEN el backend acepta el inicio de sesión, the app shall abrir la página Home.
- (c) IF el backend rechaza el correo o la contraseña, THEN the app shall mostrar bajo el formulario el mensaje del backend ("Email o contraseña incorrectos").

### FR-2 — Crear cuenta (no sirve a un RF; habilita RF1–RF7)
La misma pantalla alterna entre entrar y crear cuenta; crear cuenta pide además el nombre y, si el
backend la acepta, entra de inmediato con los mismos datos: nadie quiere escribir dos veces la clave
recién inventada.
- (a) WHEN la persona elige crear cuenta, the app shall pedir el nombre además del correo y la contraseña.
- (b) WHEN el backend acepta el registro, the app shall iniciar sesión con el mismo correo y contraseña.
- (c) IF el backend rechaza el registro, THEN the app shall mostrar bajo el formulario el mensaje del backend.
- (d) The app shall limitar el nombre a 100 caracteres y el correo a 150 caracteres.

### FR-3 — Páginas que exigen sesión (no sirve a un RF)
Sin token, una página solo mostraría errores; con un token vencido (dura 30 minutos, backend 001), lo
mismo. En ambos casos la interfaz lleva a iniciar sesión. Cerrar sesión es borrar el token: el backend
no revoca tokens (backend 001 §7).
- (a) IF no hay token guardado, THEN the app shall llevar a la pantalla de inicio de sesión al abrir una página que pide datos al backend.
- (b) IF el backend responde que la sesión no es válida a una petición que no es el inicio de sesión, THEN the app shall borrar el token guardado.
- (c) IF el backend responde que la sesión no es válida a una petición que no es el inicio de sesión, THEN the app shall llevar a la pantalla de inicio de sesión.
- (d) WHEN la persona pulsa el ícono de perfil del encabezado, the app shall borrar el token guardado y llevar a la pantalla de inicio de sesión.

### FR-4 — Rechazos legibles (no sirve a un RF)
El backend escribe sus rechazos en español (perfil del backend, NFR Language); la interfaz los muestra
tal cual en vez de inventar los suyos (regla 2 del perfil). Hay dos formas de rechazo y una tercera
situación: que el backend ni siquiera responda.
- (a) IF el backend rechaza una petición con un mensaje, THEN the app shall mostrar ese mensaje sin cambios.
- (b) IF el backend rechaza una petición con una lista de errores de validación, THEN the app shall mostrar los mensajes de la lista unidos por ". ".
- (c) IF el backend no responde, THEN the app shall mostrar "No se pudo conectar con el servidor.".
- (d) IF el backend rechaza una petición sin mensaje legible, THEN the app shall mostrar "Ocurrió un error inesperado.".

## 5. Non-functional requirements

- **Security:** la contraseña solo viaja en la petición de inicio de sesión o registro; nunca se guarda
  en el navegador. El token se guarda en el almacenamiento del navegador (D2).
- **Language:** todo texto propio de la interfaz está en español; los mensajes del backend se muestran
  sin traducir porque ya lo están.
- **Accessibility:** cada campo del formulario tiene su etiqueta; el formulario se envía con Enter.
- **Traceability:** ningún FR sirve a un RF del brief por sí mismo; todos habilitan RF1–RF7, que exigen
  datos por persona.

## 6. Edge cases

| Situación | Comportamiento esperado |
|---|---|
| Correo con mayúsculas | Se envía tal cual; el backend lo normaliza a minúsculas (backend 001). |
| Correo ya registrado | El backend responde "El email ya está registrado"; se muestra bajo el formulario (FR-2.c). |
| Registro aceptado, inicio de sesión falla después | Se muestra el mensaje del inicio de sesión; volver a enviar intenta registrar otra vez (§10 Known deviations). |
| Token vencido con una página abierta | La siguiente petición recibe "sesión no válida" y la interfaz lleva al inicio de sesión (FR-3.b, FR-3.c). |
| Abrir login.html con sesión vigente | Se muestra el formulario; entrar de nuevo reemplaza el token. |
| Backend apagado | "No se pudo conectar con el servidor." (FR-4.c). |
| Rechazo de validación con varios campos | Los mensajes se unen en una sola línea (FR-4.b). |

## 7. Out of scope

- Recuperar contraseña, editar perfil, renovar el token: backend 001 §7; `specs/backlog.md`.
- Configurar la dirección del backend por entorno: `specs/backlog.md` (Despliegue).
- Lo que cada página muestra: 002, 101, 102, 103.
- Política de contraseñas: el backend no tiene (backend 001 §7); la interfaz no inventa una (regla 2).

## 8. Completion criteria

- Una persona nueva crea su cuenta y queda dentro, en Home, sin escribir sus datos dos veces.
- Un correo o contraseña equivocados muestran el mensaje del backend bajo el formulario.
- Abrir una página con datos sin sesión lleva al inicio de sesión.
- Un token vencido o alterado lleva al inicio de sesión en la siguiente petición.
- Pulsar el ícono de perfil cierra la sesión.

## 9. Open questions

None.

## 10. Decisions taken

- **D1 — Un solo cliente para todas las páginas** (regla 3 del perfil). Pone el token, convierte los
  rechazos en texto y trata la sesión vencida. *Descartado:* llamar al backend desde cada página: el
  token y la forma del rechazo son iguales en todas, y una página que se salta el cliente se salta
  también FR-3.
- **D2 — El token se guarda en el almacenamiento local del navegador.** Sobrevive a cerrar la pestaña
  y lo leen todas las páginas, que son archivos separados. *Descartado:* una cookie: exigiría que el
  backend la emita y la acepte (hoy usa token Bearer, backend 001). *Riesgo aceptado:* cualquier script
  de la página puede leerlo; la interfaz no carga scripts de terceros salvo Chart.js desde su CDN.
- **D3 — Cerrar sesión desde el ícono de perfil.** El ícono ya estaba en el encabezado de todas las
  páginas y no hacía nada. *Descartado:* un botón nuevo en cada encabezado: más marcado para lo mismo.
  **Reemplazada por 104 FR-2.c–d** (2026-11-21): se cierra sesión con "Cerrar sesión" al pie de la barra
  lateral; el ícono de perfil pasa a ser el avatar con la inicial (104 FR-3) y ya no cierra sesión.
  FR-3.d de este spec queda sustituido por 104 FR-2.d.
- **D4 — Tras entrar se va a Home**, no a la página que se quería abrir. *Por qué:* la sesión dura 30
  minutos y las páginas son pocas; recordar el destino es código para un caso raro.
- **D5 — Un 401 en el inicio de sesión no es "sesión vencida"** sino "datos incorrectos" (FR-1.c). El
  cliente distingue el inicio de sesión porque es la única petición que se envía como formulario
  (backend 001).

### Known deviations

- **Registro + inicio de sesión no se reintenta por partes** (FR-2.b): si el registro se acepta y el
  inicio de sesión falla (backend caído entre ambas), volver a enviar intenta registrar de nuevo y el
  backend responde "El email ya está registrado". Tarea T10.
- **Datos y Configuración no exigen sesión** (FR-3.a): esas páginas aún no usan el cliente; se abren sin
  sesión con datos de ejemplo. Lo corrigen 101 y 102. Tarea T11.
- **Datos no tiene encabezado** (FR-3.d): sin ícono de perfil no se puede cerrar sesión desde esa
  página. Lo agrega 103 T01. Tarea T11.

### Taken while building

- 2026-11-18 · Claude (navegador de Orca, backend local con CORS) · FR-3.a: abrir `index.html` sin token
  llevó a `login.html`. FR-1.c: contraseña equivocada mostró "Email o contraseña incorrectos" bajo el
  formulario. FR-1.a, FR-1.b: con la contraseña correcta quedó un token guardado y se abrió Home.
  FR-4.a: el rechazo "La fecha y hora de riego deben ser futuras" se mostró sin cambios.
