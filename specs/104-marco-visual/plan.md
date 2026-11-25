# 104 — Marco visual del rediseño · Implementation plan

Status: built · Spec: `spec.md` · Reference: `specs/sdd.profile.md`

Referencia visual: `docs/rediseno-maqueta.html` (la maqueta copiada; se abre en el navegador). Los
valores de color, tipografía, radios y medidas se toman de su `<style>` tal cual.

## 1. Module structure

### A. Páginas y cliente compartido

| Archivo | Contiene | FR |
|---|---|---|
| `styles.css` | Se reescribe como el sistema del rediseño: variables de la maqueta en `:root` (claras), las oscuras en `@media (prefers-color-scheme: dark)` y en `:root[data-theme="dark"]`; base (`body`, títulos, `:focus-visible`); marco (`.app`, `.sidebar`, `.logo`, `.salir`, `main`, `.wrap`, `.head`, `.head-tools`, `.icon-btn`, `.count`, `.avatar`, `.avisos`); componentes (`.panel`, `.panel-head`, `.chip` y sus estados `ok`/`hot`/`cold`/`warn`/`none`, `.btn`, `.btn.primary`, `.btn.danger`, `.valor`, tablas, `dialog`, `.field`, `.dlg-head`, `.dlg-foot`); los cortes de 980, 720 y 640 px del marco. Las reglas propias del calendario de hoy salen a 105 | FR-1, FR-2.e, FR-4 |
| `index.html`, `Home/home.html`, `Datos/datos.html`, `Configuracion/configuracion.html` | `<link>` a Google Fonts (Bricolage Grotesque 500/700, Inter 400/500/600); marco nuevo: `aside.sidebar` con el SVG del logo, `nav` con `aria-current` en la página abierta y `button.salir`; `header.head` con `h1`, `p` de descripción y `div.head-tools` con `div.avatar` | FR-1.a, FR-2, FR-3.a, FR-3.b |
| `Home/home.css`, `Datos/datos.css`, `Configuracion/configuracion.css` | Se borran sus copias de barra lateral, encabezado, `.perfil` y estilos generales; quedan solo las reglas de su contenido (las reescriben 105–107) | FR-1.a |
| `api.js` | `button.salir` cierra sesión (reemplaza el clic en `.perfil`); `mostrarAvatar()`: `GET /auth/me` → inicial o ícono; `formatearNumero(valor, decimales)` con `Intl.NumberFormat("es-CL")`, compartido por las páginas | FR-2.d, FR-3.c–e, FR-1.e |
| `notificaciones.js` | La campana se inserta antes de `.avatar` dentro de `.head-tools`, con el SVG de la maqueta y clases `icon-btn`/`count`; el panel usa `.avisos` con `header`; cada aviso con `.pip`, `.tipo` ("tipo · hora" y "No leído"/"Leído") y `.msg`; `formatearFechaAviso()` con las cuatro formas de FR-4.b; clic fuera de `.head-tools` cierra | FR-4 |
| `login.html` | Dos columnas `.login-art` / `.login-form` con los textos de FR-5; carga la fuente y `styles.css`; su script de hoy cambia solo los textos del modo | FR-5 |
| `Home/home.js`, `Datos/datos.js`, `Configuracion/configuracion.js` | Los valores con decimales pasan por `formatearNumero()` | FR-1.e |

## 2. Data model

`GET /auth/me` (backend 001 FR-4.a), la misma forma que `POST /auth/register`:

```json
{ "id": 3, "name": "Camila Rojas", "email": "camila@example.com", "created_at": "2026-11-18T21:27:40-03:00" }
```

Se usa solo `name`. Con `name` vacío, un backend anterior sin el servicio (404) o cualquier otro error, ícono (FR-3.e).
Un 401 lo maneja el cliente (001 FR-3.c). No se guarda nada nuevo en el navegador.

Variables de la maqueta (extracto; la lista completa está en su `<style>`):

| Variable | Claro | Oscuro | Uso |
|---|---|---|---|
| `--bg` / `--surface` / `--sunken` / `--line` | `#f2f5f1` / `#fff` / `#e9efe8` / `#dbe4da` | `#101a15` / `#17241d` / `#1d2d25` / `#2a3d33` | fondos y bordes |
| `--fg` / `--muted` | `#1d3a2c` / `#5f7468` | `#e3eee6` / `#93a99b` | texto |
| `--brand` / `--brand-2` / `--orchid` | `#214d3b` / `#397b59` / `#a8508f` | `#0d1611` / `#5aa57d` / `#d886c2` | barra, primario, acento |
| `--ok-*` / `--hot-*` / `--cold-*` / `--warn-*` | verde / rojo / azul / ámbar | sus versiones oscuras | chips de estado (FR-1.d) |
| `--font-display` / `--font-body` | Bricolage Grotesque / Inter, con `system-ui` detrás | igual | FR-1.c |

## 3. Surface

| Página | Muestra | Llamadas | FR |
|---|---|---|---|
| Las cuatro páginas con sesión, al abrir | Marco, título, descripción, avatar | `GET /auth/me` | FR-1, FR-2, FR-3 |
| Pulsar "Cerrar sesión" | Inicio de sesión | ninguna (borra el token) | FR-2.d |
| Lista de avisos | Diseño nuevo | las de 103 | FR-4 |
| `login.html` | Dos columnas | las de 001 | FR-5 |

## 4. Technical decisions

- **D1 — Se mantienen las páginas separadas.** La maqueta es una sola página que cambia de vista con
  `#inicio`, `#datos`…; aquí cada página sigue siendo su HTML. *Por qué:* `api.js` ya redirige sin
  sesión, cada página carga solo su script, y una sola página obligaría a reescribir los cuatro scripts
  sin que ningún FR lo pida. *Descartado:* el enrutador por `#` de la maqueta. (FR-2)
- **D2 — El marco va escrito en cada HTML**, como hoy la barra lateral. *Por qué:* se ve sin esperar a
  ningún script y son cuatro copias de un bloque que cambia poco. Solo la campana se inserta por script
  (103 D1), ahora antes del avatar. *Descartado:* insertar todo el marco con JavaScript. (FR-2, FR-3)
- **D3 — Tipografías desde Google Fonts con `display=swap`** y `system-ui` como respaldo. *Por qué:* es
  como las carga la maqueta y no agrega herramientas (regla 6 del perfil). *Costo:* cada visita avisa a
  Google la dirección IP. *Descartado:* servir los archivos desde el repo (posible sin compilación si se
  quiere evitar ese costo). (FR-1.c)
- **D4 — Un solo `styles.css` con el sistema**, y las hojas de cada página solo con su contenido.
  *Por qué:* hoy `home.css`, `datos.css` y `configuracion.css` copian barra, encabezado y perfil, y ya
  difieren entre sí (45 px vs 46 px del perfil). (FR-1.a)
- **D5 — `formatearNumero()` vive en `api.js`**, el único script que cargan todas las páginas. *Por qué:*
  un archivo más por página para una función no se paga. (FR-1.e)
- **D6 — El avatar lo llena `api.js`**, que ya maneja la sesión; un error de `/auth/me` deja el ícono sin
  mensaje (no es una función que la persona pidió). (FR-3.c–e)
- **D7 — Mientras 105–107 no estén construidos, el contenido de cada página puede verse a medio
  rediseñar.** *Por qué:* el marco se construye primero porque los demás lo usan.

## 5. Test strategy

Revisiones en vivo (perfil) en el navegador de Orca, perfil aislado con una cuenta `@example.com`, contra
el backend local, comparando con `docs/rediseno-maqueta.html` abierta al lado. Tema oscuro: con
`document.documentElement.dataset.theme = "dark"` (la misma paleta que usa `prefers-color-scheme`).
Pantalla angosta: una página de prueba en el scratchpad con la página en un `<iframe>` de 390 px.
Tipografías caídas: con la petición a `fonts.googleapis.com` bloqueada (o la regla `@import`/`<link>`
quitada en la consola). Anotadas en spec §10.

| Bullet | Caso (Given / When / Then) | Kind |
|---|---|---|
| FR-1.a | Given cada página / Then colores, tipografías, paneles, botones y chips como la maqueta | positive |
| FR-1.b | Given tema oscuro / Then fondo `#101a15` y textos claros | state |
| FR-1.c | Given las tipografías bloqueadas / Then el texto en la tipografía del sistema, sin cajas vacías | negative |
| FR-1.d | Given un chip "Calor" y uno "Conectado" / Then rojo y verde de la maqueta | positive |
| FR-1.e | Given una lectura 27.4 / Then "27,4" | positive |
| FR-1.f | Given Tab sobre un enlace y un botón / Then contorno visible | positive |
| FR-2.a | Given cada página / Then logo, "Orquídeas" y los cuatro enlaces | positive |
| FR-2.b | Given Datos abierta / Then "Datos" destacado y `aria-current` | positive |
| FR-2.c | Given cada página / Then "Cerrar sesión" al pie | positive |
| FR-2.d | Given sesión / When "Cerrar sesión" / Then sin token y en `login.html` | event |
| FR-2.e | Given 390 px / Then franja horizontal con "Cerrar sesión" | state |
| FR-3.a | Given cada página / Then su título y descripción | positive |
| FR-3.b | Given cada página / Then campana y avatar a la derecha | positive |
| FR-3.c | Given el backend con `/auth/me` / When se abre Home / Then una petición a `/auth/me` | event |
| FR-3.d | Given el nombre "camila" / Then "C" | positive |
| FR-3.e | Given el backend sin `/auth/me` / Then ícono de persona | negative |
| FR-4.a | Given un aviso no leído y uno leído / Then punto y "No leído"; "Leído" | positive |
| FR-4.b | Given avisos de hoy 16:47, ayer 14:12, 03/02 y 2025 / Then "16:47", "Ayer 14:12", "03/02 09:00", "03/02/2025 09:00" | positive |
| FR-4.c | Given la lista abierta / When clic en el contenido / Then se cierra | event |
| FR-5.a | Given `login.html` / Then la presentación a la izquierda con sus dos textos | positive |
| FR-5.b | Given `login.html` / Then "Iniciar sesión", "Entrar", "¿No tienes cuenta? Crear cuenta" | positive |
| FR-5.c | When "Crear cuenta" / Then los textos del modo crear | event |
| FR-5.d | Given 390 px / Then la presentación arriba del formulario | state |

## 6. Build order

1. `styles.css` con variables, base y componentes; la fuente en las páginas.
2. Barra lateral y "Cerrar sesión".
3. Encabezado con título, descripción y avatar (ícono primero; inicial cuando exista `/auth/me`).
4. Lista de avisos con el diseño nuevo.
5. Inicio de sesión.
6. Cortes angostos; borrar los duplicados de las hojas de página.
7. Coma decimal en las páginas.
8. Revisión en vivo; actualizar 001 y 103.

## 7. Requirement coverage

| FR | Secciones |
|---|---|
| FR-1 | §1, §2, §4 D3, D4, D5, D7, §5 |
| FR-2 | §1, §3, §4 D1, D2, §5 |
| FR-3 | §1, §2, §3, §4 D2, D6, §5 |
| FR-4 | §1, §3, §5 |
| FR-5 | §1, §3, §5 |
