# 105 — Home y Calendario del rediseño · Implementation plan

Status: built · Spec: `spec.md` · Reference: `specs/sdd.profile.md`

Referencia visual: `docs/rediseno-maqueta.html`, vistas `#inicio` y `#calendario`, y la ventana
`dlgRiego`. Usa el sistema de 104 (`styles.css`).

## 1. Module structure

### A. Páginas y cliente compartido

| Archivo | Contiene | FR |
|---|---|---|
| `Home/home.html` | `.home-top`: dos `.panel.lectura` (fila con nombre y chip, `.valor`, `small` con rango y antigüedad) y `.panel.proximo` (`.eyebrow`, `.cuando`, `.cuenta`, enlace); `.home-bottom`: panel del calendario (`.mes-nav`, `.cal#calendarioHome`, leyenda) y `.panel.reloj` con el SVG de la maqueta, `#hora` y `#fechaHoy` | FR-1, FR-2, FR-3 |
| `Home/home.js` | `cargarRiegosHome()` guarda también la hora; `mostrarCondicionesHome()` agrega chip (`estadoLectura`), `textoRango()` y `antiguedad()`; `proximoRiego(riegos, ahora)`, `textoDia()`, `textoFalta()` y `mostrarProximo()` cada 60 s; reloj SVG en `actualizarReloj()` | FR-1, FR-2, FR-3 |
| `Home/home.css` | Solo `.home-top`, `.lectura`, `.proximo`, `.home-bottom`, `.reloj` y sus cortes | FR-1 a FR-3 |
| `styles.css` | `.mes-nav`, `.cal`, `.dia` (`hoy`, `pasado`, `riego`), `.cal-grande`, `.horas`, `.leyenda`, `.cal-layout`, `.lista-riegos`, `.fecha-box`, `.chips-dia`, `.ayuda`, `.mensaje-error`; se borran las reglas del calendario y modal de hoy | FR-3.a, FR-4, FR-5, FR-6 |
| `index.html` | `.cal-layout`: panel con `h2` del mes, `.mes-nav` con "Hoy", `.cal.cal-grande#calendario`, leyenda; panel "Próximos riegos" con `#cuentaRiegos` y `ul.lista-riegos#proximosRiegos`; `<dialog id="dlgRiego">` con `#dlgFecha`, `#riegosDelDia` (`.chips-dia`), `#horaRiego`, `#mensajeRiego`, botones | FR-4, FR-5, FR-6 |
| `calendario.js` | `mostrarCalendario()` con días como `button.dia` (clases y `aria-label`, horas en `.horas`); botón "Hoy"; `mostrarProximosRiegos()` con conteo y seis `li`; la ventana con `showModal()`/`close()`; chips con `aria-pressed`; errores en `#mensajeRiego`; se quitan los `alert()` de éxito y error | FR-4, FR-5, FR-6 |
| `api.js` | `estadoLectura(valor, sensor)` se mueve aquí desde `datos.js` (Home y Datos la usan; 101 D6: una sola función) | FR-1.a |
| `Datos/datos.js` | Usa `estadoLectura` de `api.js` (solo se borra la copia) | FR-1.a |

## 2. Data model

`GET /schedules?active_only=true` (backend 101), ya leído por ambas páginas; se usa `irrigation_date`
y `irrigation_time` en hora del invernadero (`"2026-11-19"`, `"08:00:00"`).
`GET /conditions` (backend 103 FR-3), ya leído por Home; se usan `type`, `unit`, `min_val`, `max_val`,
`value`, `recorded_at`.

```
proximoRiego(riegos, ahora):            # FR-2.a; ahora = new Date() del dispositivo (D1)
  candidatos = riegos donde new Date(fecha + "T" + hora) > ahora
  devolver el de menor fecha+hora, o null

textoFalta(minutos):                    # FR-2.c
  < 60          → "Faltan N min"
  < 48 × 60     → "Faltan N h"   (N = minutos / 60 redondeado hacia abajo, mínimo 1)
  si no         → "Faltan N días" (N = minutos / 1440 hacia abajo)

antiguedad(recorded_at, ahora):         # FR-1.d
  < 1 min → "recién"; < 60 min → "hace N min"; < 24 h → "hace N h"; si no → "hace N d"
```

Nada se guarda en el navegador.

## 3. Surface

| Página | Muestra | Llamadas | FR |
|---|---|---|---|
| `Home/home.html` al abrir; condiciones cada 30 s; próximo riego cada 60 s; reloj cada 1 s | Lecturas, próximo riego, calendario, reloj | `GET /conditions`, `GET /schedules?active_only=true` | FR-1, FR-2, FR-3 |
| `index.html` al abrir y tras cada cambio | Calendario grande, próximos riegos | `GET /schedules?active_only=true` | FR-4, FR-5 |
| Ventana de un día | Riegos del día, hora, errores | `POST /schedules`, `PATCH /schedules/{id}` (hora o `is_active:false`) | FR-6 |

## 4. Technical decisions

- **D1 — Ventana nativa `<dialog>` con `showModal()`.** *Por qué:* Escape, el foco atrapado y el fondo
  oscurecido vienen del navegador; el modal de hoy los imita a mano. *Descartado:* mantener `#modalRiego`. (FR-6.h)
- **D2 — Errores en `#mensajeRiego` dentro de la ventana**, con `role="alert"`. (FR-6.e, FR-6.f)
- **D3 — La confirmación de quitar sigue con `confirm()`** (002 FR-5.a; spec D3). *Por qué:* una
  pregunta de sí o no no necesita otra ventana propia.
- **D4 — `estadoLectura` pasa a `api.js`.** *Por qué:* Home la necesita y 101 D6 pide una sola función de
  estado. (FR-1.a)
- **D5 — El calendario compartido va en `styles.css`.** *Por qué:* Home y Calendario dibujan el mismo
  mes con las mismas clases; hoy cada hoja tiene su copia. (FR-3.a, FR-4)
- **D6 — Lo que falta se recalcula con los riegos ya leídos**, sin volver a pedirlos cada minuto.
  *Por qué:* los riegos solo cambian cuando la persona los cambia, y eso pasa en otra página. (FR-2.f)

## 5. Test strategy

Revisiones en vivo (perfil) con una cuenta `@example.com` en un perfil aislado de Orca, comparando con
la maqueta. Para lo que falta y el día en palabras: riegos a 30 min, mañana, en 3 días y en 10 días;
para la antigüedad, el simulador o una lectura enviada (sin imprimir la clave). Pantalla angosta con un
`<iframe>` de 390 px. Anotadas en spec §10.

| Bullet | Caso (Given / When / Then) | Kind |
|---|---|---|
| FR-1.a | Given una lectura de 25 °C con límites 18–24 / Then chip "Calor" | positive |
| FR-1.b | Given límites 18–24 °C / Then "Ideal 18–24 °C" | positive |
| FR-1.c | Given sin máximo / Then "Ideal desde 18 °C"; sin ninguno, "Sin límites" | negative |
| FR-1.d | Given una lectura de hace 2 min / Then "hace 2 min" | positive |
| FR-1.e | Given ningún sensor de humedad / Then "--" y "Sin lecturas" sin rango | negative |
| FR-2.a | Given riegos hoy ya pasado y mañana 08:00 / Then el de mañana | positive |
| FR-2.b | Given riegos de hoy, mañana y en 10 días / Then "Hoy", "Mañana", "domingo 29 de noviembre" | positive |
| FR-2.c | Given 30 min, 15 h y 3 días / Then "Faltan 30 min", "Faltan 15 h", "Faltan 3 días" | positive |
| FR-2.d | Given ningún riego futuro / Then "No hay riegos programados." | negative |
| FR-2.e | When "Ver calendario →" / Then `index.html` | event |
| FR-2.f | Given un riego a 2 min y Home abierta / When pasa su hora / Then muestra el siguiente sin recargar | state |
| FR-3.a | Given el mes actual / Then días anteriores atenuados | positive |
| FR-3.b | Given Home / Then hora con segundos que avanza, y manecillas | state |
| FR-3.c | Given Home / Then "miércoles 18 de noviembre · hora del dispositivo" | positive |
| FR-4.a | Given dos riegos 19:30 y 08:00 el 19 / Then "08:00" sobre "19:30" en el 19 | positive |
| FR-4.b | Given 390 px / Then marcas sin hora | state |
| FR-4.c | Given diciembre mostrado / When "Hoy" / Then noviembre | event |
| FR-4.d | Then el texto bajo el calendario | positive |
| FR-4.e | Given el 19 con 2 riegos / Then nombre accesible "19, 2 riegos" | positive |
| FR-5.a | Given 8 riegos futuros / Then "8 programados" | positive |
| FR-5.b | Then 6 filas con día, mes abreviado, "Riego a las 08:00" y día de la semana | positive |
| FR-6.a | When se pulsa el 19 / Then "Programar riego" y "jueves 19 de noviembre" | event |
| FR-6.b | Given el 19 con 08:00 / Then el texto y un botón "08:00" | positive |
| FR-6.c | Given un día vacío / Then 08:00, "Guardar riego", sin "Eliminar" | positive |
| FR-6.d | When "08:00" / Then presionado, hora 08:00, "Guardar cambios" y "Eliminar" | event |
| FR-6.e | Given la hora borrada / When guardar / Then el texto en la ventana y ninguna petición | negative |
| FR-6.f | Given un día pasado / When guardar / Then el mensaje del backend en la ventana, abierta | negative |
| FR-6.g | When guardar aceptado / Then la ventana cerrada, sin `alert`, el día con la hora | event |
| FR-6.h | When Escape / Then cerrada y ninguna petición | event |

## 6. Build order

1. `estadoLectura` a `api.js`; lecturas de Home con chip, rango y antigüedad.
2. Próximo riego.
3. Calendario pequeño y reloj de Home.
4. Calendario grande con horas, "Hoy" y cortes.
5. Próximos riegos con conteo.
6. Ventana `<dialog>` con errores dentro.
7. Revisión en vivo; actualizar 002.

## 7. Requirement coverage

| FR | Secciones |
|---|---|
| FR-1 | §1, §2, §3, §4 D4, §5 |
| FR-2 | §1, §2, §3, §4 D6, §5 |
| FR-3 | §1, §3, §4 D5, §5 |
| FR-4 | §1, §3, §4 D5, §5 |
| FR-5 | §1, §3, §5 |
| FR-6 | §1, §3, §4 D1, D2, D3, §5 |
