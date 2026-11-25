# 107 — Configuración del rediseño · Tasks

Status: building · Spec: `spec.md` · Plan: `plan.md`

Requiere 104 construido. Revisiones en vivo con backend en `:8000`, servidor sin caché en `:8080`, cuenta
`@example.com` en un perfil aislado de Orca y el simulador del backend (claves por tubería, nunca impresas
ni en archivos `.env`); comparar con `docs/rediseno-maqueta.html`.

## A. Páginas y cliente compartido
- [x] **T01 — Filas de sensor** · FR-1.a, FR-1.b, FR-1.c, FR-1.d, FR-1.e, FR-1.f
  `configuracion.html`/`.js`/`.css`: `.fila-sensor` con `#id`, chip `dot` según plan §2, `.meta`, `.apagado`, `.revisar`; se borra la tarjeta "Modificar fechas de riego".
  *Made when:* con sensores Conectado, Sin señal, Esperando e Inactivo se ven los cuatro colores de chip, la fila inactiva atenuada y "Qué revisar" en ámbar; `grep -c "Modificar fechas de riego" Configuracion/configuracion.html` es 0.
- [x] **T02 — Formulario en una ventana** · FR-2.a, FR-2.b, FR-2.c, FR-2.d, FR-2.e, FR-2.f · after T01
  `configuracion.html`: `<dialog id="dlgSensor">` con el formulario; `configuracion.js`: `showModal()`, títulos de FR-2.a–b, textos de intervalo, `close()` al aceptar, rechazos en `#mensajeFormulario`.
  *Made when:* "Editar" en un sensor abre "Editar sensor #N" con sus valores; 95/90 muestra el rechazo dentro con lo escrito; Escape cierra sin peticiones.
- [x] **T03 — Clave copiable** · FR-3.a, FR-3.b, FR-3.c, FR-3.d · after T01
  `configuracion.html`/`.js`: `.clave` con título y texto de FR-3.a, `copiarClave()` con respaldo de selección, "Listo".
  *Made when:* tras registrar un sensor, "Copiar" cambia a "Copiada" y el portapapeles tiene una cadena de la longitud de la clave (sin imprimirla); con el portapapeles rechazando, la clave queda seleccionada.

— checkpoint: Configuración como la maqueta —

- [ ] **T04 — Revisión en vivo** · FR-1.a, FR-1.b, FR-1.c, FR-1.d, FR-1.e, FR-1.f, FR-2.a, FR-2.b, FR-2.c, FR-2.d, FR-2.e, FR-2.f, FR-3.a, FR-3.b, FR-3.c, FR-3.d
  Casos de plan §5 en claro y oscuro, a 1280 y 390 px; anotados en spec §10.
  *Made when:* `sdd_check.py specs/107-configuracion-rediseno` lista todos los bullets como revisión en vivo.
- [ ] **T05 — Actualizar 102** · —
  `specs/102-sensores-configuracion/spec.md` §10: FR-3.c (texto) reemplazado por 107 FR-3.a y la tarjeta del calendario quitada (107 D1).
  *Made when:* 102 §10 nombra 107.

— checkpoint: spec `built` —

## C. What could change

None yet.

## D. Requirement coverage

| FR | Tareas |
|---|---|
| FR-1 | T01, T04 |
| FR-2 | T02, T04 |
| FR-3 | T03, T04 |

## E. The gates

CI: none defined (no workflow in the repo). Local: `for f in *.js */*.js; do node --check "$f" || exit 1; done`.

## F. Log

2026-11-22 · base · `d488d40`, árbol limpio · sin test command: revisiones en vivo (perfil)
2026-11-22 · T01 · done · `.fila-sensor` con `.id`, chip `dot` (`estadoConexion` devuelve ok/hot/warn/none), `.meta`, `.apagado`, `.revisar`; tarjeta del calendario borrada · en vivo
2026-11-22 · T02 · done · `<dialog id="dlgSensor">` con los campos de 102 en `.field`/`.field-row`; `showModal()`/`close()`; foco al "Editar" tras guardar · en vivo
2026-11-22 · T03 · done · `.clave` con título nuevo, "Copiar" (`navigator.clipboard.writeText`, respaldo `selectAllChildren`) y "Listo" · en vivo
2026-11-22 · round 1 · T01–T03 · gates green; revisión: los números de la ventana desbordaban (`min-width: 0`) y tipo/conexión fijos no se distinguían (`:disabled` atenuado), corregidos; una herramienta imprimió una clave de prueba, reemplazada (spec §10)
