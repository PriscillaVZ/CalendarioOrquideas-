/* =====================================
   PANTALLA CONFIGURACION (spec 102)
   Los sensores vienen del backend; la frecuencia del registro
   histórico es el intervalo de lectura de cada sensor (102 D1).
===================================== */


/* =====================================
   AYUDAS DE PANTALLA
===================================== */

// Los nombres de sensores los escribe la persona: siempre textContent,
// nunca innerHTML.

function crearElemento(etiqueta, texto, clase) {

    const elemento = document.createElement(etiqueta);

    elemento.textContent = texto;

    if (clase) {
        elemento.className = clase;
    }

    return elemento;
}

const mensajeSensores = document.getElementById("mensajeSensores");

function mostrarMensaje(texto) {

    mensajeSensores.textContent = texto;

    mensajeSensores.hidden = !texto;
}


/* =====================================
   MIS SENSORES (FR-1)
===================================== */

const NOMBRES_TIPO = { humidity: "Humedad", temperature: "Temperatura" };

const NOMBRES_CONEXION = { wifi: "Wi-Fi", bluetooth: "Bluetooth" };

let sensores = [];

let ultimaLectura = {}; // id de sensor → fecha de su última lectura (solo activos)

async function cargarSensores() {

    const [lista, condiciones] = await Promise.all([api("/sensors"), api("/conditions")]);

    sensores = lista;

    ultimaLectura = Object.fromEntries(
        condiciones.map(condicion => [condicion.sensor_id, condicion.recorded_at])
    );
}


/* =====================================
   ESTADO DE CONEXION (FR-2)
===================================== */

// Conectado = su última lectura tiene menos de dos intervalos: un envío
// perdido no lo marca caído (102 D6). La clase es la del chip: verde,
// rojo, ámbar o gris (107 FR-1.b, plan §2).

function estadoConexion(sensor) {

    if (!sensor.is_active) {
        return { texto: "Inactivo", clase: "none", revisar: false };
    }

    const fecha = ultimaLectura[sensor.id];

    if (!fecha) {
        return { texto: "Esperando la primera lectura", clase: "warn", revisar: true };
    }

    const antiguedad = Date.now() - Date.parse(fecha);

    if (antiguedad < 2 * sensor.reading_interval_minutes * 60 * 1000) {
        return { texto: "Conectado", clase: "ok", revisar: false };
    }

    return { texto: "Sin señal", clase: "hot", revisar: true };
}

function listaQueRevisar(sensor) {

    const lista = document.createElement("ul");

    const alcance = sensor.connection_type === "bluetooth"
        ? "Que esté al alcance por Bluetooth."
        : "Que esté al alcance de la red Wi-Fi.";

    [
        "Que el dispositivo tenga energía.",
        alcance,
        "Que tenga el id de este sensor (" + sensor.id + ") y su clave vigente; si pediste una clave nueva, cárgala.",
        "Que envíe las lecturas a la dirección del backend: " + API_URL
    ].forEach(texto => lista.appendChild(crearElemento("li", texto)));

    // Caja ámbar dentro de la fila (107 FR-1.e).

    const caja = crearElemento("div", "", "revisar");
    caja.append(crearElemento("strong", "Qué revisar"), lista);

    return caja;
}

function textoLimite(valor, unidad) {

    return valor === null ? "—" : formatearNumero(valor) + " " + unidad;
}

const listaSensores = document.getElementById("listaSensores");

function mostrarSensores() {

    if (sensores.length === 0) {

        listaSensores.replaceChildren(crearElemento("p", "Aún no registras sensores.", "sin-sensores"));

        return;
    }

    listaSensores.replaceChildren(...sensores.map(function(sensor) {

        const estado = estadoConexion(sensor);

        // "#13 Nombre [● Conectado]" (107 FR-1.a); el chip dice el estado en texto.

        const titulo = document.createElement("h3");
        titulo.append(
            crearElemento("span", "#" + sensor.id, "id"),
            crearElemento("span", sensor.name),
            crearElemento("span", estado.texto, "chip dot " + estado.clase)
        );

        const meta = crearElemento("div", "", "meta");
        meta.append(...[
            NOMBRES_TIPO[sensor.type] || sensor.type,
            NOMBRES_CONEXION[sensor.connection_type] || sensor.connection_type,
            "Cada " + sensor.reading_interval_minutes + " min",
            "Mín " + textoLimite(sensor.min_val, sensor.unit),
            "Máx " + textoLimite(sensor.max_val, sensor.unit)
        ].map(texto => crearElemento("span", texto)));

        const datos = document.createElement("div");
        datos.append(titulo, meta);

        const editar = botonAccion("Editar", () => abrirFormulario(sensor));
        editar.dataset.sensor = sensor.id; // para devolverle el foco al guardar

        const acciones = crearElemento("div", "", "acciones");
        acciones.append(
            editar,
            botonAccion(sensor.is_active ? "Desactivar" : "Activar", () => cambiarActivo(sensor)),
            botonAccion("Clave nueva", () => nuevaClave(sensor))
        );

        // Un sensor inactivo se atenúa (107 FR-1.d).

        const fila = crearElemento("div", "", "fila-sensor" + (sensor.is_active ? "" : " apagado"));
        fila.append(datos, acciones);

        if (estado.revisar) {
            fila.append(listaQueRevisar(sensor));
        }

        return fila;
    }));
}


function botonAccion(texto, alPulsar) {

    const boton = crearElemento("button", texto, "btn");

    boton.type = "button";

    boton.addEventListener("click", alPulsar);

    return boton;
}


/* =====================================
   CLAVE DEL SENSOR (FR-3.c, FR-3.d)
===================================== */

// La clave solo vive en la caja que la muestra: nunca en el navegador,
// la consola ni la dirección (regla 4 del perfil).

const claveSensor = document.getElementById("claveSensor");

const claveSensorValor = document.getElementById("claveSensorValor");

const copiarClave = document.getElementById("copiarClave");

function mostrarClave(idSensor, clave) {

    document.getElementById("claveSensorTitulo").textContent = "Sensor " + idSensor + " · clave nueva";

    claveSensorValor.textContent = clave;

    copiarClave.textContent = "Copiar";

    claveSensor.hidden = false;

    copiarClave.focus();
}

// Al portapapeles del sistema; si el navegador no deja (sin HTTPS fuera de
// localhost), la clave queda seleccionada para copiarla a mano (107 FR-3.b–c, plan D2).

copiarClave.addEventListener("click", async function() {

    try {
        await navigator.clipboard.writeText(claveSensorValor.textContent);
        copiarClave.textContent = "Copiada";
    } catch {
        getSelection().selectAllChildren(claveSensorValor);
    }
});

document.getElementById("cerrarClave").addEventListener("click", function() {

    claveSensorValor.textContent = "";

    claveSensor.hidden = true;
});


/* =====================================
   FORMULARIO: REGISTRAR O EDITAR UN SENSOR (FR-3, FR-4)
===================================== */

const dlgSensor = document.getElementById("dlgSensor");

const formSensor = document.getElementById("formSensor");

const campos = {
    nombre: document.getElementById("nombreSensor"),
    tipo: document.getElementById("tipoSensor"),
    conexion: document.getElementById("conexionSensor"),
    intervalo: document.getElementById("intervaloSensor"),
    minimo: document.getElementById("minSensor"),
    maximo: document.getElementById("maxSensor")
};

const mensajeFormulario = document.getElementById("mensajeFormulario");

function mostrarMensajeFormulario(texto) {

    mensajeFormulario.textContent = texto;

    mensajeFormulario.hidden = !texto;
}

let sensorEnEdicion = null; // null = registrar uno nuevo

// Sin sensor: registrar. Con sensor: editar su nombre, intervalo y límites;
// tipo y conexión se ven pero no cambian (backend 102 D6).

function abrirFormulario(sensor = null) {

    sensorEnEdicion = sensor;

    formSensor.reset();

    campos.intervalo.querySelectorAll("option.fuera-de-lista").forEach(opcion => opcion.remove());

    campos.tipo.disabled = sensor !== null;

    campos.conexion.disabled = sensor !== null;

    document.getElementById("tituloSensor").textContent =
        sensor ? "Editar sensor #" + sensor.id : "Registrar sensor";

    document.getElementById("ayudaLimites").textContent = sensor
        ? "Si dejas un límite vacío, el sensor queda sin ese límite."
        : "Si dejas un límite vacío, se usa el valor por defecto del tipo.";

    if (sensor) {

        // Un intervalo fuera de la lista (creado por la API) se muestra igual,
        // para no cambiarlo sin querer.

        if (![...campos.intervalo.options].some(o => Number(o.value) === sensor.reading_interval_minutes)) {

            const opcion = new Option(
                "Cada " + sensor.reading_interval_minutes + " minutos", sensor.reading_interval_minutes
            );

            opcion.className = "fuera-de-lista"; // se quita al volver a abrir el formulario

            campos.intervalo.add(opcion);
        }

        campos.nombre.value = sensor.name;
        campos.tipo.value = sensor.type;
        campos.conexion.value = sensor.connection_type;
        campos.intervalo.value = sensor.reading_interval_minutes;
        campos.minimo.value = sensor.min_val ?? "";
        campos.maximo.value = sensor.max_val ?? "";
    }

    mostrarMensajeFormulario("");

    dlgSensor.showModal();

    campos.nombre.focus();
}

// Sin argumentos: el evento del clic no es un sensor.
document.getElementById("btnNuevoSensor").addEventListener("click", () => abrirFormulario());

// Cancelar, × y Escape (nativo de <dialog>) cierran sin enviar nada (107 FR-2.f).

document.getElementById("cancelarSensor").addEventListener("click", () => dlgSensor.close());

document.getElementById("cerrarSensor").addEventListener("click", () => dlgSensor.close());

// Un límite vacío se omite: el backend pone el del tipo (102 D4).

function sensorDelFormulario() {

    const cuerpo = {
        name: campos.nombre.value,
        type: campos.tipo.value,
        connection_type: campos.conexion.value,
        reading_interval_minutes: Number(campos.intervalo.value)
    };

    if (campos.minimo.value !== "") {
        cuerpo.min_val = Number(campos.minimo.value);
    }

    if (campos.maximo.value !== "") {
        cuerpo.max_val = Number(campos.maximo.value);
    }

    return cuerpo;
}

// Al editar se envía solo lo que cambió; un límite vaciado va como null,
// que quita el límite (backend 102 FR-3).

function cambiosDelFormulario(sensor) {

    const formulario = {
        name: campos.nombre.value,
        reading_interval_minutes: Number(campos.intervalo.value),
        min_val: campos.minimo.value === "" ? null : Number(campos.minimo.value),
        max_val: campos.maximo.value === "" ? null : Number(campos.maximo.value)
    };

    return Object.fromEntries(
        Object.entries(formulario).filter(([campo, valor]) => valor !== sensor[campo])
    );
}

formSensor.addEventListener("submit", async function(evento) {

    evento.preventDefault();

    let creado = null;

    try {

        if (sensorEnEdicion) {

            const cambios = cambiosDelFormulario(sensorEnEdicion);

            if (Object.keys(cambios).length > 0) {
                await api("/sensors/" + sensorEnEdicion.id, { method: "PATCH", body: cambios });
            }

        } else {

            creado = await api("/sensors", { method: "POST", body: sensorDelFormulario() });
        }

    } catch (error) {

        // Dentro de la ventana, con lo escrito, para corregirlo (102 FR-3.e, FR-4.e; 107 FR-2.d).

        mostrarMensajeFormulario(error.message);

        return;
    }

    dlgSensor.close(); // 107 FR-2.e

    const editado = sensorEnEdicion;

    await actualizarPantalla();

    // La lista se rehízo: el foco va a la clave nueva o al "Editar" que abrió la ventana.

    if (creado) {
        mostrarClave(creado.id, creado.ingest_key);
    } else if (editado) {
        const boton = listaSensores.querySelector(`[data-sensor="${editado.id}"]`);

        if (boton) {
            boton.focus();
        }
    }
});


/* =====================================
   ACTIVAR, DESACTIVAR Y CLAVE NUEVA (FR-5, FR-6)
===================================== */

// Desactivar no borra: el sensor deja de registrar y su historial queda
// (backend 102 D5, 103 D6).

async function cambiarActivo(sensor) {

    if (sensor.is_active && !confirm(
        "¿Desactivar «" + sensor.name + "»? Dejará de registrar lecturas."
    )) {
        return;
    }

    try {

        await api("/sensors/" + sensor.id, { method: "PATCH", body: { is_active: !sensor.is_active } });

    } catch (error) {

        mostrarMensaje(error.message);

        return;
    }

    await actualizarPantalla();
}

// Una clave nueva invalida la anterior al instante (backend 103 FR-1.c).

async function nuevaClave(sensor) {

    if (!confirm(
        "¿Generar una clave nueva para «" + sensor.name + "»? La clave anterior deja de funcionar."
    )) {
        return;
    }

    let respuesta;

    try {

        respuesta = await api("/sensors/" + sensor.id + "/ingest-key", { method: "POST" });

    } catch (error) {

        mostrarMensaje(error.message);

        return;
    }

    mostrarClave(sensor.id, respuesta.ingest_key);

    await actualizarPantalla();
}


/* =====================================
   INICIAR PANTALLA CONFIGURACION
===================================== */

async function actualizarPantalla() {

    try {

        await cargarSensores();

        mostrarMensaje("");

    } catch (error) {

        mostrarMensaje("No se pudieron cargar los sensores: " + error.message);

        return;
    }

    mostrarSensores();
}

actualizarPantalla();
