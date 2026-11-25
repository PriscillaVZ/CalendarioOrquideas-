# 103 — Notificaciones en la app · Implementation plan

Status: built · Spec: `spec.md` · Reference: `specs/sdd.profile.md`

## 1. Module structure

### A. Páginas y cliente compartido

| Archivo | Contiene | FR |
|---|---|---|
| `notificaciones.js` (raíz, nuevo) | Se carga después de `api.js` en cada página con sesión. Inserta la campana `button.campana` antes de `.perfil` y el panel `#panelAvisos`; `leerNoLeidos()` cada 30 s; `abrirLista()`, `marcarLeido(aviso)`, `notificarNuevos(avisos)`, `pedirPermiso()` | FR-1 a FR-5 |
| `styles.css` | Campana, número, panel, aviso no leído | FR-1.b, FR-2.d |
| `index.html`, `Home/home.html`, `Configuracion/configuracion.html` | `<script src="…notificaciones.js">` tras `api.js` | FR-1.b |
| `Datos/datos.html` | Encabezado `header.encabezado` con `.perfil`, como las demás páginas, y el script | FR-1.b |
| `calendario.js` | Se quitan `comprobarNotificaciones()`, su intervalo, `notificacionesEnviadas` y `solicitarPermisoNotificaciones()` (002 FR-7, reemplazado) | FR-4, FR-5 |

## 2. Data model

`GET /notifications` y `GET /notifications?unread_only=true` (backend 104 FR-3), más reciente primero,
a lo más 100:

```json
[{ "id": 17, "type": "irrigation_reminder", "is_read": false,
   "message": "Es hora de regar las orquídeas (01-12-2026 19:30)", "created_at": "2026-12-01T19:30:40-03:00" },
 { "id": 16, "type": "reading_alert", "is_read": true,
   "message": "Humedad banco norte: 92.5 % fuera de rango (mín 70 %, máx 90 %)", "created_at": "2026-12-01T18:02:11-03:00" }]
```

`PATCH /notifications/{id}/read` (backend 104 FR-4) responde el aviso con `is_read: true`.

| Clave de `localStorage` | Valor | FR |
|---|---|---|
| `notificacionesEnviadas` | ids ya mostrados como notificación del navegador (la misma clave de 002) | FR-4.c |

## 3. Surface

| Acción | Llamadas | FR |
|---|---|---|
| Abrir cualquier página con sesión, y cada 30 s | `GET /notifications?unread_only=true` | FR-1, FR-4 |
| Pulsar la campana | `GET /notifications` | FR-2 |
| Pulsar un aviso no leído | `PATCH /notifications/{id}/read` | FR-3 |
| Pulsar "Activar avisos del navegador" | `Notification.requestPermission()` | FR-5.b |

## 4. Technical decisions

- **D1 — Un script compartido que se inserta solo en el encabezado.** *Por qué:* cuatro páginas, un
  comportamiento; copiarlo en cada HTML se desalinea. *Descartado:* marcado de la campana en cada HTML. (FR-1.b)
- **D2 — La campana va antes del ícono de perfil**, que sigue cerrando sesión (001 D3). (FR-1.b)
- **D3 — Errores de la consulta periódica en silencio** (consola), no `alert()`. *Por qué:* con el backend
  caído, una ventana cada 30 s bloquea la página. Los errores de marcar leído sí se muestran. (FR-1.d, FR-3.c)
- **D4 — Una sola lectura periódica alimenta contador y notificaciones del navegador.** (FR-1.d, FR-4.a)

## 5. Test strategy

Revisiones en vivo (perfil). Para tener avisos: un riego a 1–2 minutos (recordatorio, backend 104 FR-1)
y el simulador enviando una lectura fuera de rango (alerta, backend 104 FR-2). Las notificaciones del
navegador se revisan en un navegador con permiso concedido (el de Orca las bloquea). Anotadas en spec §10.

| Bullet | Caso (Given / When / Then) | Kind |
|---|---|---|
| FR-1.a | Given sesión / When se abre Home / Then hay una petición `?unread_only=true` | event |
| FR-1.b | Given 2 no leídos / Then la campana muestra "2" en las cuatro páginas | positive |
| FR-1.c | Given 0 no leídos / Then la campana sin número | negative |
| FR-1.d | Given Home abierta / When el backend crea un recordatorio / Then el número sube en ≤ 30 s | state |
| FR-2.a | Given avisos / When se pulsa la campana / Then la lista, el más reciente arriba | event |
| FR-2.b | Given un recordatorio / Then tipo, mensaje, fecha y hora | positive |
| FR-2.c | Given un recordatorio y una alerta / Then "Recordatorio de riego" y "Alerta de sensor" | positive |
| FR-2.d | Given un no leído / Then dice "Sin leer" | positive |
| FR-2.e | Given una cuenta nueva / Then "No tienes notificaciones." | negative |
| FR-2.f | Given la lista abierta / When se pulsa la campana / Then se cierra | event |
| FR-3.a | Given un no leído / When se pulsa / Then `PATCH /notifications/{id}/read` | event |
| FR-3.b | Given el cambio aceptado / Then sin "Sin leer" y el contador baja en 1 | event |
| FR-3.c | Given el backend detenido / When se pulsa un no leído / Then "No se pudo conectar con el servidor." y sigue "Sin leer" | negative |
| FR-4.a | Given permiso concedido y Configuración abierta / When llega un recordatorio / Then notificación del navegador | state |
| FR-4.b | Given recordatorio y alerta / Then los títulos de FR-4.b | positive |
| FR-4.c | Given un aviso mostrado / When se cambia de página / Then no se repite | positive |
| FR-4.d | Given una notificación / When se pulsa / Then la ventana al frente y la lista abierta | event |
| FR-5.a | Given permiso sin decidir / Then la lista ofrece "Activar avisos del navegador" | state |
| FR-5.b | Given ese botón / When se pulsa / Then el navegador pide permiso | event |
| FR-5.c | Given permiso bloqueado / Then el texto de bloqueo en la lista | negative |
| FR-5.d | Given un navegador sin `Notification` / Then "Este navegador no muestra avisos fuera de la página." | negative |

## 6. Build order

1. Encabezado en Datos.
2. `notificaciones.js`: campana y contador, cargado en las cuatro páginas.
3. Panel con la lista y marcar leído.
4. Notificaciones del navegador y botón de permiso; quitar lo de 002 en `calendario.js`.
5. Revisión en vivo.

## 7. Requirement coverage

| FR | Secciones |
|---|---|
| FR-1 | §1, §2, §3, §4 D1, D2, D3, D4, §5 |
| FR-2 | §1, §2, §3, §5 |
| FR-3 | §1, §2, §3, §4 D3, §5 |
| FR-4 | §1, §2, §3, §4 D4, §5 |
| FR-5 | §1, §3, §5 |
