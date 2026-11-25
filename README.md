# Calendario de Orquídeas

Interfaz web del prototipo del invernadero de orquídeas: calendario de riego, datos de los sensores,
sensores y avisos. Es HTML, CSS y JavaScript sin paso de compilación; los datos vienen de
[Riego Backend](../RiegoBackend) (repositorio aparte).

## Correr en local

Hacen falta dos terminales: una para el backend y otra para el frontend.

**1. Backend** (puerto 8000). La primera vez, sigue la instalación del `README.md` de `RiegoBackend`.
Luego:

```sh
cd ../RiegoBackend
.venv/bin/uvicorn app.main:app --port 8000
```

**2. Frontend** (puerto 8080), desde esta carpeta:

```sh
python3 servidor.py
```

Abre <http://localhost:8080/login.html> y crea una cuenta.

### Por qué `servidor.py` y no `python3 -m http.server`

`http.server` no le dice al navegador que no guarde los archivos, así que el navegador los guarda por su
cuenta. Después de un `git pull` puede mezclar una página nueva con un script viejo: la página queda vacía
o sin estilos, y ni siquiera Ctrl+Shift+R lo arregla siempre. `servidor.py` es el mismo servidor, pero pide
`Cache-Control: no-store`, así cada recarga trae los archivos actuales.

Si ya abriste la aplicación con `http.server` y algo se ve roto, borra una vez la caché del navegador
(o los datos del sitio `localhost:8080`) y recarga.

### Puertos

El backend solo acepta pedidos del frontend en `http://localhost:8080` y `http://127.0.0.1:8080` (su
configuración de CORS). Si el 8080 está ocupado, libéralo; usar otro puerto exige cambiar la configuración
del backend.
