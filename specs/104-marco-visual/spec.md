# 104 — Marco visual del rediseño

Status: built · Supersedes: 001 FR-3.d · Depends on: `001-sesion-cliente-api`, `103-notificaciones`, backend `001-accounts-auth` FR-4.a (`GET /auth/me`)

## 1. Context and objective

El dueño encargó un rediseño de la interfaz: una maqueta navegable con las cinco pantallas (inicio de
sesión, Home, Datos, Calendario, Configuración) con datos de ejemplo. Copia de referencia en
`docs/rediseno-maqueta.html` (artifact `claude.ai/artifact/VrRLUBk5hK3Uc8eMhjY8bU`, versión
1795048182-b9d5). La maqueta cambia dos cosas a la vez: el **marco** que comparten todas las páginas
(paleta clara y oscura, tipografías, barra lateral, encabezado con campana y avatar, componentes) y el
**contenido** de cada página. Este spec cubre el marco y el inicio de sesión; el contenido de cada página
va en 105 (Home y Calendario), 106 (Datos) y 107 (Configuración), que dependen de este.

Lo que la maqueta muestra pero el backend no tiene se resuelve sin inventar datos: el avatar con la
inicial necesita saber quién inició sesión, y eso lo da un servicio nuevo del backend (§9); el nombre
de invernadero de la maqueta no existe en el backend, así que las descripciones no lo usan (D3).

**Objective:** que todas las páginas compartan el marco del rediseño (paleta clara y oscura, tipografías, barra lateral con cierre de sesión, encabezado con título, campana y avatar) y que el inicio de sesión tenga su nueva presentación, sin cambiar lo que cada página hace.

## 2. Users

| Usuario | Relación con esta capacidad |
|---|---|
| Cultivador/a | Navega entre páginas, ve sus avisos y cierra sesión desde el marco común; entra por la pantalla nueva. |
| El backend | Entrega el nombre de la persona para el avatar. |

## 3. User stories

- Como cultivador/a, quiero que todas las páginas se vean y se recorran igual, para no reaprender cada pantalla.
- Como cultivador/a, quiero la interfaz en tema oscuro cuando mi dispositivo lo usa, para no encandilarme de noche en el invernadero.
- Como cultivador/a, quiero ver mi inicial en el encabezado, para saber con qué cuenta entré.
- Como cultivador/a, quiero cerrar sesión desde un enlace con nombre, para no adivinar que el ícono de perfil lo hace.
- Como cultivador/a, quiero usar la interfaz en el teléfono, para revisar el invernadero sin computador.

## 4. Functional requirements

### FR-1 — Apariencia común (no sirve a un RF; presentación de RF1–RF7)
Todas las páginas usan la paleta, las tipografías y los componentes de la maqueta (paneles, botones,
chips de estado, tablas, ventanas), definidos una sola vez. El tema sigue al del sistema: la maqueta trae
ambas paletas. Los colores de estado son los mismos en todas las páginas, así "fuera de rango" se lee
igual en Home, Datos y Configuración. Los números se escriben como en Chile, con coma decimal.
- (a) The app shall dibujar cada página con la paleta, las tipografías y los componentes de la maqueta del rediseño.
- (b) WHILE el sistema de la persona pide tema oscuro, the app shall mostrar la paleta oscura de la maqueta.
- (c) IF las tipografías del rediseño no se pueden descargar, THEN the app shall mostrar el texto con la tipografía del sistema.
- (d) The app shall mostrar los estados con los colores de la maqueta: verde para "En rango" y "Conectado", rojo para "Alta" y "Calor", azul para "Baja" y "Frío", ámbar para las advertencias y gris para lo inactivo o sin datos.
- (e) The app shall escribir los números decimales con coma decimal.
- (f) The app shall marcar con un contorno visible el control que tiene el foco del teclado.

### FR-2 — Barra lateral (no sirve a un RF)
La barra lateral es la navegación de siempre con la marca nueva y, abajo, el cierre de sesión con
nombre. Antes cerrar sesión era pulsar el ícono de perfil (001 FR-3.d), que nada indicaba; el avatar ya
no cierra sesión.
- (a) The app shall mostrar en cada página con sesión una barra lateral con el logo de la orquídea, el nombre "Orquídeas" y los enlaces "Home", "Datos", "Calendario de Riego" y "Configuración".
- (b) The app shall destacar en la barra lateral el enlace de la página abierta.
- (c) The app shall ofrecer "Cerrar sesión" al pie de la barra lateral.
- (d) WHEN la persona pulsa "Cerrar sesión", the app shall borrar el token guardado y llevar a la pantalla de inicio de sesión.
- (e) WHILE la pantalla mide 640 px de ancho o menos, the app shall mostrar la barra lateral como una franja horizontal sobre el contenido con el logo, los enlaces y "Cerrar sesión".

### FR-3 — Encabezado (no sirve a un RF)
Cada página dice dónde se está y para qué sirve; a la derecha, la campana de avisos (103) y el avatar.
La inicial sale del nombre que el backend tiene de la persona; no se guarda en el navegador (regla 1 del
perfil), se pide al abrir cada página.
- (a) The app shall mostrar en el encabezado el título y la descripción de la página: "Panel principal" / "Resumen de tu invernadero", "Datos ambientales" / "Lecturas de tus sensores", "Calendario de riego" / "Programa, edita o elimina los riegos de tus orquídeas", "Configuración" / "Sensores y ajustes de tu cuenta".
- (b) The app shall mostrar a la derecha del encabezado la campana de avisos y el avatar.
- (c) WHEN se abre una página con sesión, the app shall leer del backend el nombre de la persona.
- (d) The app shall mostrar en el avatar la primera letra del nombre de la persona, en mayúscula.
- (e) IF el backend no entrega el nombre, THEN the app shall mostrar en el avatar un ícono de persona.

### FR-4 — Lista de avisos con el diseño nuevo (RF2, RF4)
Complementa 103: el contenido de la lista no cambia (tipo, mensaje, fecha, leído), cambia cómo se lee.
La hora se acorta a lo que hace falta para ubicarse, y la lista se cierra al pulsar fuera, como cualquier
menú.
- (a) The app shall marcar cada aviso no leído con un punto de color y el texto "No leído", y cada aviso leído con el texto "Leído".
- (b) The app shall mostrar la fecha de cada aviso como "HH:MM" si es de hoy, "Ayer HH:MM" si es de ayer, "DD/MM HH:MM" si es de este año y "DD/MM/AAAA HH:MM" si es anterior.
- (c) WHEN la persona pulsa fuera de la campana y de la lista con la lista abierta, the app shall cerrar la lista.

### FR-5 — Inicio de sesión (no sirve a un RF; habilita RF1–RF7)
Misma función que 001 FR-1 y FR-2, presentada en dos columnas: a un lado qué es la aplicación, al otro el
formulario. Los textos del formulario cambian con el modo, como hoy.
- (a) The app shall mostrar a la izquierda de la pantalla de inicio de sesión el logo, "Riego y clima de tus orquídeas, en un lugar." y "Programa los riegos, mira la humedad y la temperatura del invernadero y recibe un aviso cuando algo sale de rango.".
- (b) The app shall mostrar a la derecha el formulario titulado "Iniciar sesión", con "Entra con tu correo y contraseña.", el botón "Entrar" y "¿No tienes cuenta? Crear cuenta".
- (c) WHEN la persona elige crear cuenta, the app shall titular el formulario "Crear cuenta", con "Solo necesitas tu nombre, correo y una contraseña.", el botón "Crear cuenta" y "¿Ya tienes cuenta? Iniciar sesión".
- (d) WHILE la pantalla mide 720 px de ancho o menos, the app shall mostrar la presentación sobre el formulario.

## 5. Non-functional requirements

- **Language:** todos los textos nuevos en español; números con coma decimal (FR-1.e).
- **Accessibility:** contraste de la maqueta en ambos temas; foco visible (FR-1.f); el enlace activo se
  anuncia como página actual; el avatar es decorativo para lectores de pantalla salvo su inicial; la
  campana mantiene su nombre accesible con el número (103 NFR).
- **Freshness:** el nombre del avatar se lee al abrir cada página; un cambio de nombre se ve en la
  siguiente página que se abre.
- **Security:** el nombre no se guarda en el navegador (regla 1 del perfil).
- **Traceability:** FR-4 sirve a RF2 y RF4; FR-1, FR-2, FR-3 y FR-5 no sirven a un RF (presentación y sesión).

## 6. Edge cases

| Situación | Comportamiento esperado |
|---|---|
| Backend sin el servicio del nombre (aún no existe) | Avatar con ícono de persona (FR-3.e); nada más falla. |
| Nombre que empieza con minúscula o tilde ("álvaro") | "Á" (FR-3.d). |
| Nombre vacío o solo espacios | Ícono de persona (FR-3.e). |
| Sin conexión a las tipografías (sin internet, red bloqueada) | Tipografía del sistema (FR-1.c); el resto igual. |
| Sesión vencida al leer el nombre | El cliente lleva al inicio de sesión (001 FR-3.c). |
| Pantalla de 640 px o menos | Barra horizontal arriba, con "Cerrar sesión" visible (FR-2.e, D4). |
| Lista de avisos abierta y se pulsa otro control del encabezado (periodo en Datos) | Se cierra la lista (FR-4.c) y el control actúa. |

## 7. Out of scope

- El contenido de Home y Calendario (105), Datos (106) y Configuración (107).
- Elegir tema claro u oscuro dentro de la aplicación: la maqueta no lo ofrece; unowned.
- Editar el perfil o el nombre: backend 001 §7; `specs/backlog.md`.
- Un nombre de invernadero o varios invernaderos: el backend no los tiene; unowned.
- Pasar a una sola página con navegación interna como la maqueta: plan D1.

## 8. Completion criteria

- Las cuatro páginas y el inicio de sesión se ven como la maqueta, en tema claro y oscuro, a 1280 px y a 390 px de ancho.
- "Cerrar sesión" en la barra lateral cierra la sesión; el avatar muestra la inicial cuando el backend da el nombre, y un ícono si no.
- La lista de avisos dice "No leído", muestra la hora corta y se cierra al pulsar fuera.

## 9. Open questions

- ~~[NEED CLARIFICATION] (affects FR-3.c, FR-3.d, FR-3.e, T03) El backend no dice quién inició sesión: ¿qué muestra el avatar? Propuesta: pedir al backend un servicio con el nombre; mientras no exista, un ícono.~~ → D2
- ~~[NEED CLARIFICATION] (affects FR-3.c, FR-3.d, T03) ¿Qué spec y FR del backend define `GET /auth/me` y con qué forma responde? Pedido a la sesión del backend el 2026-11-19; hasta la respuesta, T03 construye solo FR-3.e (ícono) y FR-3.c–d quedan sin construir.~~ → D7

## 10. Decisions taken

- **D1 — El rediseño se divide en un marco (104) y un spec por página (105–107).** *Por qué:* el marco
  es requisito de las demás y se puede revisar solo; cada página cambia su contenido con reglas propias
  (próximo riego, barra de rango, ventana de sensor) que se construyen y revisan por separado.
  *Descartado:* un solo spec para todo (más de 30 tareas sin un punto intermedio para ver el avance).
- **D2 — El avatar muestra la inicial del nombre que da el backend** (respuesta del dueño, 2026-11-19).
  Se pidió a la sesión del backend `GET /auth/me`. *Por qué:* la regla 1 del perfil deja el nombre en el
  backend. *Descartado:* un ícono fijo para siempre; sacar el correo del token (depende de lo que el token
  traiga por casualidad).
- **D3 — Las descripciones no nombran un invernadero.** La maqueta dice "Invernadero principal · datos de
  ejemplo"; el backend no tiene invernaderos. Home dice "Resumen de tu invernadero" y Datos "Lecturas de
  tus sensores". *Por qué:* no mostrar un dato que nadie ingresó.
- **D4 — "Cerrar sesión" se ve también en pantallas angostas.** La maqueta lo esconde bajo 640 px y deja
  sin forma de salir en el teléfono, porque el avatar ya no cierra sesión. *Por qué:* salir es una
  función, no un adorno.
- **D5 — El tema oscuro sigue al sistema, sin selector.** *Por qué:* la maqueta trae la paleta oscura pero
  ningún control para elegirla; agregar uno es trabajo nuevo que nadie pidió (§7).
- **D6 — "No leído" reemplaza a "Sin leer"** como texto de un aviso pendiente (103 FR-2.d pide un texto,
  no fija la palabra). *Por qué:* es la palabra de la maqueta.

- **D7 — El nombre sale de backend 001 FR-4.a** (respuesta de la sesión del backend, 2026-11-19):
  `GET /auth/me` con el token responde la cuenta (id, nombre, correo, fecha de creación), nunca la
  contraseña; sin token o con uno inválido o vencido, rechazo de sesión (backend 001 FR-3.b–d), que el
  cliente ya maneja (001 FR-3.c).

- **D8 — La barra lateral queda fija a la ventana** (`position: sticky`, alto de la
  ventana). La maqueta la deja crecer con la página, y en páginas largas "Cerrar sesión" (FR-2.c) quedaba
  bajo el pliegue. *Por qué:* salir debe estar a la vista (mismo motivo que D4). Propuesta en round 1,
  aprobada por el dueño el 2026-11-21. Bajo 640 px la barra deja de ser fija (franja de FR-2.e).

### Taken while building

- 2026-11-20, Claude (round 1), navegador de Orca (perfil aislado "pruebas-103"), backend local, cuenta
  `camila.104@example.com` ("camila prueba"), 1280 px: FR-1.a (marco en las cuatro páginas), FR-1.b
  (fondo `rgb(16, 26, 21)` con el sistema en oscuro; `data-theme="light"` → `rgb(242, 245, 241)`),
  FR-2.a–d, FR-3.a–e (avatar "C"; con `/auth/me` abortado, ícono). Falta 390 px, tipografías bloqueadas,
  chips y foco: T08.
- 2026-11-21, Claude (round 2), mismo perfil y cuenta, estáticos en :8080: FR-4.a–c (alerta real de
  hoy "04:51 · No leído" con punto; aviso leído de ayer renderizado con la función de la página, "Ayer
  14:12 · Leído", porque el backend no crea avisos con fecha pasada; clic del mouse fuera cierra),
  FR-5.a–d (1280 px y 390 px), FR-2.e (390 px, "Cerrar sesión" visible), FR-1.e (27,4 en Home, Datos
  y gráfico; 26,5 en Configuración).
- 2026-11-21, Claude (round 3, T08), perfil aislado, cuenta `alvaro.104@example.com` ("álvaro prueba") con
  dos sensores (27,4 °C sobre 26,5; 68 % en 60–80): barrido de las cuatro páginas en tema claro y oscuro
  (`data-theme`) a 1280 y 390 px, 16 combinaciones — FR-1.a, FR-1.b (fondos `rgb(242, 245, 241)` y
  `rgb(16, 26, 21)`), FR-2.a–c, FR-2.e (salir visible y sin scroll horizontal en todas), FR-3.a–b y FR-3.d
  (avatar "Á", caso de la tilde); FR-1.d ("Calor" `rgb(181, 65, 45)` sobre `rgb(253, 229, 223)`, "En rango"
  y "Conectado" `rgb(39, 103, 68)` sobre `rgb(224, 240, 228)`, y sus pares oscuros; frío/baja, advertencia
  e inactivo leídos en las hojas: variables `--cold-*`, `--warn-*`, gris); FR-1.c (Google Fonts abortadas
  en el navegador → ninguna fuente web cargada, texto visible con la del sistema); FR-1.f (Tab: enlace
  "Datos" con contorno blanco de 2 px en la barra, campana y "Desactivar" con contorno verde de 2 px).
