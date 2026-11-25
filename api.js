/* =====================================
   CONEXION CON EL BACKEND (RiegoBackend)
===================================== */

const API_URL = "http://localhost:8000";

// login.html vive junto a este archivo, sin importar la carpeta de la página.
const LOGIN_URL = new URL("login.html", document.currentScript.src).href;


function obtenerToken() {
    return localStorage.getItem("token");
}

function cerrarSesion() {
    localStorage.removeItem("token");
    location.href = LOGIN_URL;
}


// Sin sesión, toda página (menos el login) manda al login.

if (!obtenerToken() && !location.pathname.endsWith("/login.html")) {
    cerrarSesion();
}


// "Cerrar sesión" al pie de la barra lateral (spec 104 FR-2.d).

const botonSalir = document.querySelector(".salir");

if (botonSalir) {
    botonSalir.addEventListener("click", cerrarSesion);
}


/* =====================================
   LLAMAR A LA API
===================================== */

// api("/schedules")                                  → GET
// api("/schedules", { method: "POST", body: {...} }) → JSON
// api("/auth/login", { method: "POST", form: {...} }) → formulario

async function api(ruta, { method = "GET", body, form } = {}) {

    const headers = {};

    if (obtenerToken()) {
        headers.Authorization = "Bearer " + obtenerToken();
    }

    let contenido;

    if (form) {
        contenido = new URLSearchParams(form);
    } else if (body !== undefined) {
        headers["Content-Type"] = "application/json";
        contenido = JSON.stringify(body);
    }

    let respuesta;

    try {
        respuesta = await fetch(API_URL + ruta, { method, headers, body: contenido });
    } catch {
        throw new Error("No se pudo conectar con el servidor.");
    }

    // Token vencido o inválido: volver a iniciar sesión.
    // (En el login un 401 es "contraseña incorrecta", no sesión vencida.)

    if (respuesta.status === 401 && !form) {
        cerrarSesion();
    }

    const datos = await respuesta.json().catch(() => null);

    if (!respuesta.ok) {
        throw new Error(mensajeDeError(datos));
    }

    return datos;
}


// FastAPI responde { detail: "texto" } o { detail: [{ msg: "..." }, ...] }.

function mensajeDeError(datos) {

    const detalle = datos && datos.detail;

    if (typeof detalle === "string") {
        return detalle;
    }

    if (Array.isArray(detalle)) {
        return detalle.map(error => error.msg).join(". ");
    }

    return "Ocurrió un error inesperado.";
}


/* =====================================
   NUMEROS CON COMA DECIMAL (spec 104 FR-1.e)
===================================== */

// formatearNumero(27.4) → "27,4"; formatearNumero(68) → "68".

const formatoNumero = new Intl.NumberFormat("es-CL", { maximumFractionDigits: 2 });

function formatearNumero(valor) {
    return formatoNumero.format(valor);
}


// formatearFechaLarga(fecha) → "jueves 19 de noviembre" (spec 105 FR-2.b,
// FR-3.c, FR-6.a). Intl pone una coma tras el día de la semana; la maqueta no.

function formatearFechaLarga(fecha) {
    return fecha.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })
        .replace(",", "");
}


/* =====================================
   ANTIGUEDAD DE UNA LECTURA
===================================== */

// "recién", "hace N min", "hace N h", "hace N d" (spec 105 FR-1.d, 106 FR-1.b).

function antiguedad(iso, ahora) {

    const minutos = Math.floor((ahora - new Date(iso)) / 60000); // ISO o milisegundos

    if (minutos < 1) {
        return "recién";
    }

    if (minutos < 60) {
        return "hace " + minutos + " min";
    }

    if (minutos < 24 * 60) {
        return "hace " + Math.floor(minutos / 60) + " h";
    }

    return "hace " + Math.floor(minutos / 1440) + " d";
}

/* =====================================
   ESTADO DE UNA LECTURA (spec 101 FR-1.d–f, 105 FR-1.a)
===================================== */

// Mismos bordes que las alertas del backend: los límites cuentan como
// "en rango" y un límite vacío no limita ese lado (backend 104 D5).

const NOMBRES_FUERA_DE_RANGO = {
    humidity: { bajo: "Baja", alto: "Alta" },
    temperature: { bajo: "Frío", alto: "Calor" }
};

function estadoLectura(valor, sensor) {

    const nombres = NOMBRES_FUERA_DE_RANGO[sensor.type] || { bajo: "Bajo", alto: "Alto" };

    if (sensor.min_val != null && valor < sensor.min_val) {
        return { texto: nombres.bajo, clase: "frio" };
    }

    if (sensor.max_val != null && valor > sensor.max_val) {
        return { texto: nombres.alto, clase: "calor" };
    }

    return { texto: "En rango", clase: "en-rango" };
}


/* =====================================
   AVATAR DEL ENCABEZADO (spec 104 FR-3.c–e)
===================================== */

// La inicial sale del nombre que tiene el backend; no se guarda en el
// navegador (perfil, regla 1). Sin nombre o con cualquier error queda el
// ícono de persona (plan D6); un 401 ya lo maneja api().

async function mostrarAvatar() {

    const avatar = document.querySelector(".avatar");

    if (!avatar || !obtenerToken()) {
        return;
    }

    try {
        const cuenta = await api("/auth/me");
        const nombre = ((cuenta && cuenta.name) || "").trim();

        if (nombre) {
            avatar.textContent = [...nombre][0].toLocaleUpperCase("es-CL");
        }
    } catch (error) {
        console.error(error);
    }
}

mostrarAvatar();
