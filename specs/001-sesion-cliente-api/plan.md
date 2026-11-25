# 001 — Sesión y cliente de la API · Implementation plan

Status: as-built · Spec: `spec.md` · Reference: `specs/sdd.profile.md`

## 1. Module structure

### A. Páginas y cliente compartido

| Archivo | Contiene | FR |
|---|---|---|
| `api.js` | `API_URL`, `LOGIN_URL`; `obtenerToken()`, `cerrarSesion()`; la redirección sin token al cargar; el ícono de perfil como cierre de sesión; `api(ruta, {method, body, form})`; `mensajeDeError(datos)` | FR-3, FR-4, FR-1.a (envío) |
| `login.html` | Formulario con modo entrar / crear cuenta y su script en línea | FR-1, FR-2 |
| `index.html`, `Home/home.html` | Cargan `api.js` antes del script de la página | FR-3.a |

`LOGIN_URL` se calcula desde la dirección de `api.js` (`new URL("login.html", document.currentScript.src)`),
así una página en `Home/` y otra en la raíz llegan al mismo `login.html` sin rutas relativas propias.

## 2. Data model

Respuestas del backend que se leen (backend 001):

| Petición | Campos usados |
|---|---|
| `POST /auth/login` (formulario `username`, `password`) | `access_token` |
| `POST /auth/register` (JSON `name`, `email`, `password`) | ninguno; solo que fue aceptado |
| Cualquier rechazo | `detail`: texto, o lista de `{msg}` (validación) |

```json
{ "access_token": "<token>", "token_type": "bearer" }
{ "detail": "Email o contraseña incorrectos" }
{ "detail": [{ "loc": ["body", "email"], "msg": "value is not a valid email address", "type": "value_error" }] }
```

Lo que guarda el navegador:

| Clave de `localStorage` | Valor | FR |
|---|---|---|
| `token` | el `access_token` | FR-1.a, FR-3 |

## 3. Surface

| Página | Muestra | Llamadas al backend | FR |
|---|---|---|---|
| `login.html` | Formulario entrar / crear cuenta, mensaje de rechazo | `POST /auth/register` (JSON), `POST /auth/login` (formulario) | FR-1, FR-2 |
| Toda página que carga `api.js` | Redirige a `login.html` sin token; ícono de perfil = cerrar sesión | — | FR-3.a, FR-3.d |
| Cliente `api()` | — | Cualquiera, con `Authorization: Bearer <token>` | FR-3.b, FR-3.c, FR-4 |

Flujo de `api()`:

```
headers.Authorization = "Bearer " + token            si hay token
form  → cuerpo URLSearchParams (solo el inicio de sesión)
body  → cuerpo JSON + Content-Type: application/json
fetch falla           → Error("No se pudo conectar con el servidor.")        FR-4.c
401 y no es form      → cerrarSesion(): borra token, va a LOGIN_URL           FR-3.b, FR-3.c
!ok                   → Error(mensajeDeError(json))                            FR-4.a, FR-4.b, FR-4.d
ok                    → json
```

## 4. Technical decisions

- **D1 — `fetch` del navegador, sin librería.** *Descartado:* axios u otra: una función de 40 líneas
  cubre token, cuerpo y errores (regla 6). (FR-3, FR-4)
- **D2 — El inicio de sesión se reconoce por `form`.** Es la única petición de formulario (backend 001
  usa el formulario estándar de OAuth2). *Descartado:* comparar la ruta `/auth/login`: acopla el cliente
  a una ruta. (FR-1.c, FR-3.b)
- **D3 — La redirección sin token se hace al cargar `api.js`,** antes que el script de la página, y se
  salta en `login.html`. *Descartado:* que cada página la llame: la olvidaría alguna. (FR-3.a)
- **D4 — Límites de largo en el formulario (`maxlength`)** iguales a las columnas del backend. *Por qué:*
  el backend responde 500 a un nombre de más de 100 caracteres (backend backlog); el límite en el
  campo evita el error mientras el backend no lo valide. Es una ayuda de pantalla, no la regla (regla 2).
  (FR-2.d)
- **D5 — Mensajes de rechazo bajo el formulario en `login.html`, `alert()` en las demás páginas.** Así
  estaban las páginas antes de la conexión. (FR-1.c, FR-2.c, FR-4)

## 5. Test strategy

Sin pruebas automáticas (perfil: revisiones en vivo). Cada caso se revisa en el navegador de Orca con el
backend en `:8000` y la interfaz en `:8080`, y se anota en spec §10 *Taken while building*.

| Bullet | Caso (Given / When / Then) | Kind |
|---|---|---|
| FR-1.a | Given una cuenta / When se entra con sus datos / Then `localStorage.token` existe | event |
| FR-1.b | Given una cuenta / When se entra / Then la dirección es `Home/home.html` | event |
| FR-1.c | Given una cuenta / When se entra con otra contraseña / Then "Email o contraseña incorrectos" bajo el formulario | negative |
| FR-2.a | Given login.html / When se pulsa "Crear cuenta" / Then aparece el campo Nombre | event |
| FR-2.b | Given un correo nuevo / When se registra / Then se abre Home con token guardado | event |
| FR-2.c | Given un correo ya registrado / When se registra otra vez / Then "El email ya está registrado" | negative |
| FR-2.d | Given el formulario / When se escriben 120 caracteres en Nombre / Then quedan 100 | positive |
| FR-3.a | Given sin token / When se abre `index.html` / Then se está en `login.html` | negative |
| FR-3.b | Given un token alterado / When el calendario pide los riegos / Then `localStorage.token` ya no existe | negative |
| FR-3.c | Given un token alterado / When el calendario pide los riegos / Then se está en `login.html` | negative |
| FR-3.d | Given una sesión / When se pulsa 👤 / Then sin token y en `login.html` | event |
| FR-4.a | Given un riego en fecha pasada / When se guarda / Then se muestra "La fecha y hora de riego deben ser futuras" | negative |
| FR-4.b | Given `api("/schedules", {method:"POST", body:{}})` en la consola / Then el error une los `msg` con ". " | negative |
| FR-4.c | Given el backend apagado / When se entra / Then "No se pudo conectar con el servidor." | negative |
| FR-4.d | Given una respuesta de error sin JSON / Then "Ocurrió un error inesperado." | negative |

## 6. Build order

1. `api.js`: token, `cerrarSesion`, `api()`, `mensajeDeError`.
2. Redirección sin token e ícono de perfil, en `api.js`.
3. `login.html`: formulario, modo crear cuenta, envío.
4. Cargar `api.js` en `index.html` y `Home/home.html`.
5. Revisión en vivo.

## 7. Requirement coverage

| FR | Secciones |
|---|---|
| FR-1 | §1, §2, §3, §4 D2, D5, §5 |
| FR-2 | §1, §2, §3, §4 D4, D5, §5 |
| FR-3 | §1, §2, §3, §4 D2, D3, §5 |
| FR-4 | §1, §2, §3, §4 D1, D5, §5 |
