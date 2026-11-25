# Backlog — trabajo conocido y aún sin especificar

Cuando se escribe la spec de un ítem, se borra de aquí. Cada ítem dice de dónde viene y qué spec lo
tocaría. Las specs 001–002 (as-built) describen lo que ya está conectado; 101–103 (`draft`) cubren las
páginas que faltan. Esto es lo que **no** cubren.

## Despliegue
- **Dirección del backend fija en el código** (`http://localhost:8000`): desplegar exige editar el
  cliente. Hace falta una forma de configurarla por entorno · source: 001 · target: → 001. El backend
  ya acepta los orígenes por configuración (backend `CORS_ORIGINS`).

## Depende del backend (está en su backlog)
- **Sesión de 30 minutos sin renovación**: al vencer se vuelve a iniciar sesión (001 FR-3.b). Renovar el
  token es del backend (backend backlog: refresco de token).
- **Marcar todas las notificaciones leídas, borrarlas, paginarlas** (backend 104 D4) · target: → 103.
- **Actualización en vivo** (WebSocket/SSE) en lugar de consultar cada cierto tiempo (backend 103 D3) ·
  target: → 101, 103.
- **Calendario recurrente** (días de la semana + hora; backend 101 D1) · target: → 002.
- **Borrar riegos y sensores** en lugar de desactivarlos (backend 101 D2, 102 D5) · target: → 002, 102.
- **Promedios por hora o día para los gráficos** (backend 103 §7) · target: → 101.
- **Recuperar contraseña, editar perfil** (backend 001 §7) · target: → 001.

## Pantallas
- **Consejos según la condición fuera de rango** (la maqueta del rediseño: "Ventila o aumenta la sombra"):
  textos de cultivo por tipo y lado que alguien con conocimiento de orquídeas debe validar · source: 106
  §7 · target: → 106 | new spec.

- **Mensajes de alerta del backend con punto decimal**: la alerta dice "27.4 °C fuera de rango (mín 18 °C,
  máx 26 °C)" y la app la muestra tal cual (perfil: los mensajes del backend no se cambian), así que la
  lista de avisos mezcla "27.4" con el "27,4" del resto (104 FR-1.e) · source: 104 T04 · target: → backend 104.

## Sin dueño
- **Pruebas automáticas del frontend**: hoy se verifican con revisiones en vivo en el navegador
  (decisión del dueño, 2026-11-18). Si el proyecto crece, una suite de navegador (p. ej. Playwright).

## Herramientas
- **El servidor de desarrollo deja que el navegador guarde en caché** (`python3 -m http.server` no envía
  `Cache-Control`): una revisión en vivo puede correr el JS anterior sin aviso. Servir con
  `Cache-Control: no-store` (un servidor de 8 líneas) o recargar sin caché · source: 101 round 1 ·
  target: → perfil (*Made when examples*) | unowned.
