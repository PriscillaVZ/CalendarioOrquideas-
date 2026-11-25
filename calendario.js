/* =====================================
   CALENDARIO DE RIEGO (spec 002, 105 FR-4 a FR-6)
   El backend decide si una fecha sirve; aquí solo se muestra su respuesta.
===================================== */

const calendario = document.getElementById("calendario");
const mesActual = document.getElementById("mesActual");
const cuentaRiegos = document.getElementById("cuentaRiegos");
const proximosRiegos = document.getElementById("proximosRiegos");

const dlgRiego = document.getElementById("dlgRiego");
const formRiego = document.getElementById("formRiego");
const dlgFecha = document.getElementById("dlgFecha");
const riegosDia = document.getElementById("riegosDia");
const chipsDia = document.getElementById("chipsDia");
const horaRiego = document.getElementById("horaRiego");
const mensajeRiego = document.getElementById("mensajeRiego");
const guardarRiego = document.getElementById("guardarRiego");
const eliminarRiego = document.getElementById("eliminarRiego");

const nombresMeses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

// Primer día del mes que se muestra.

let mesMostrado = primerDiaDelMes(new Date());

function primerDiaDelMes(fecha) {
    return new Date(fecha.getFullYear(), fecha.getMonth(), 1);
}

// "2026-11-19" de una fecha local.

function fechaIso(fecha) {
    return fecha.getFullYear() + "-" +
        String(fecha.getMonth() + 1).padStart(2, "0") + "-" +
        String(fecha.getDate()).padStart(2, "0");
}


/* =====================================
   RIEGOS ACTIVOS DEL BACKEND
===================================== */

// Cada riego: { id, fecha: "AAAA-MM-DD", hora: "HH:MM" }, en orden de fecha y hora.
// Un día puede tener varios riegos.

let riegos = [];

async function cargarRiegos() {

    const entradas = await api("/schedules?active_only=true");

    riegos = entradas
        .map(entrada => ({
            id: entrada.id,
            fecha: entrada.irrigation_date,
            hora: entrada.irrigation_time.slice(0, 5) // "14:30:00" → "14:30"
        }))
        .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
}

function riegosDelDia(fecha) {
    return riegos.filter(riego => riego.fecha === fecha);
}


/* =====================================
   CALENDARIO GRANDE (FR-3.a, FR-4)
===================================== */

function crearCelda(etiqueta, texto, clases) {

    const celda = document.createElement(etiqueta);
    celda.className = clases;
    celda.textContent = texto;
    return celda;
}

function mostrarCalendario() {

    const anio = mesMostrado.getFullYear();
    const mes = mesMostrado.getMonth();

    mesActual.textContent = nombresMeses[mes] + " " + anio;

    const celdas = DIAS_SEMANA.map(dia => crearCelda("div", dia, "dow"));

    // La semana empieza el lunes.

    const espacios = (mesMostrado.getDay() + 6) % 7;

    for (let i = 0; i < espacios; i++) {
        celdas.push(crearCelda("div", "", "dia vacio"));
    }

    const cantidadDias = new Date(anio, mes + 1, 0).getDate();
    const hoy = fechaIso(new Date());

    for (let dia = 1; dia <= cantidadDias; dia++) {

        const fecha = fechaIso(new Date(anio, mes, dia));
        const delDia = riegosDelDia(fecha);

        const boton = crearCelda("button", dia, "dia");
        boton.type = "button";
        boton.dataset.fecha = fecha;
        boton.classList.toggle("hoy", fecha === hoy);
        boton.classList.toggle("pasado", fecha < hoy);
        boton.classList.toggle("riego", delDia.length > 0);

        // "19", "19, 1 riego", "19, 2 riegos" (FR-4.e).

        boton.setAttribute("aria-label", delDia.length === 0 ? String(dia)
            : dia + ", " + delDia.length + (delDia.length === 1 ? " riego" : " riegos"));

        // Las horas, de la más temprana a la más tardía; bajo 640 px son marcas (FR-4.a, FR-4.b).

        if (delDia.length > 0) {
            const horas = document.createElement("div");
            horas.className = "horas";
            horas.append(...delDia.map(riego => crearCelda("span", riego.hora, "")));
            boton.append(horas);
        }

        boton.addEventListener("click", () => abrirVentana(fecha));

        celdas.push(boton);
    }

    calendario.replaceChildren(...celdas);
}

function cambiarMes(cuantos) {
    mesMostrado = new Date(mesMostrado.getFullYear(), mesMostrado.getMonth() + cuantos, 1);
    mostrarCalendario();
}

document.getElementById("mesAnterior").addEventListener("click", () => cambiarMes(-1));
document.getElementById("mesSiguiente").addEventListener("click", () => cambiarMes(1));

// "Hoy" vuelve al mes actual (FR-4.c).

document.getElementById("mesHoy").addEventListener("click", () => {
    mesMostrado = primerDiaDelMes(new Date());
    mostrarCalendario();
});


/* =====================================
   PROXIMOS RIEGOS (FR-5, 002 FR-6)
===================================== */

// Desde hoy, aunque la hora de hoy ya haya pasado (002 D7).

function mostrarProximosRiegos() {

    const hoy = fechaIso(new Date());
    const proximos = riegos.filter(riego => riego.fecha >= hoy);

    cuentaRiegos.textContent = proximos.length + (proximos.length === 1 ? " programado" : " programados");

    if (proximos.length === 0) {
        proximosRiegos.replaceChildren(crearCelda("li", "No hay riegos programados.", "vacio"));
        return;
    }

    proximosRiegos.replaceChildren(...proximos.slice(0, 6).map(riego => {

        const fecha = new Date(riego.fecha + "T00:00");

        const caja = crearCelda("div", "", "fecha-box");
        caja.append(
            crearCelda("b", fecha.getDate(), ""),
            crearCelda("small", fecha.toLocaleDateString("es-CL", { month: "short" }).replace(".", ""), "")
        );

        const texto = document.createElement("div");
        texto.append(
            crearCelda("strong", "Riego a las " + riego.hora, ""),
            crearCelda("span", fecha.toLocaleDateString("es-CL", { weekday: "long" }), "")
        );

        const fila = document.createElement("li");
        fila.append(caja, texto);
        return fila;
    }));
}


/* =====================================
   VENTANA DE UN DIA (FR-6)
===================================== */

let fechaEnEdicion = null;

let riegoEnEdicion = null; // id del riego elegido; null = riego nuevo

function mostrarMensajeRiego(texto) {
    mensajeRiego.textContent = texto;
    mensajeRiego.hidden = !texto;
}

function abrirVentana(fecha) {

    fechaEnEdicion = fecha;
    dlgFecha.textContent = formatearFechaLarga(new Date(fecha + "T00:00"));

    mostrarChips();
    seleccionarRiego(null);
    dlgRiego.showModal();
}

// null prepara un riego nuevo a las 08:00 (D2); un id carga ese riego (FR-6.c, FR-6.d).

function seleccionarRiego(id) {

    riegoEnEdicion = id;

    const elegido = riegos.find(riego => riego.id === id);

    horaRiego.value = elegido ? elegido.hora : "08:00";
    guardarRiego.textContent = elegido ? "Guardar cambios" : "Guardar riego";
    eliminarRiego.hidden = !elegido;

    mostrarMensajeRiego("");

    // Se marca en su lugar, sin rehacer los chips: el foco sigue en el que se tocó.

    for (const chip of chipsDia.children) {
        chip.setAttribute("aria-pressed", String(chip.dataset.id === String(id)));
    }
}

function mostrarChips() {

    const delDia = riegosDelDia(fechaEnEdicion);

    riegosDia.hidden = delDia.length === 0;

    chipsDia.replaceChildren(...delDia.map(riego => {

        const chip = crearCelda("button", riego.hora, "");
        chip.type = "button";
        chip.dataset.id = riego.id;

        // Un segundo toque vuelve a "riego nuevo".

        chip.addEventListener("click", () =>
            seleccionarRiego(riego.id === riegoEnEdicion ? null : riego.id));

        return chip;
    }));
}

// Cancelar, × y Escape (nativo de <dialog>) cierran sin llamar al backend (FR-6.h).

document.getElementById("cerrarRiego").addEventListener("click", () => dlgRiego.close());
document.getElementById("cancelarRiego").addEventListener("click", () => dlgRiego.close());

// Mientras el backend responde, los botones esperan: un doble clic no programa dos riegos.

async function enviar(peticion) {

    guardarRiego.disabled = eliminarRiego.disabled = true;
    mostrarMensajeRiego("");

    try {
        await peticion();
    } catch (error) {
        mostrarMensajeRiego(error.message); // FR-6.f: la ventana queda abierta
        return;
    } finally {
        guardarRiego.disabled = eliminarRiego.disabled = false;
    }

    dlgRiego.close(); // FR-6.g: el calendario muestra el cambio, sin mensaje
    await actualizarPantalla();

    // El calendario se rehízo: el foco vuelve al día pulsado (spec §5, Accessibility).

    const dia = calendario.querySelector(`[data-fecha="${fechaEnEdicion}"]`);

    if (dia) {
        dia.focus();
    }
}

formRiego.addEventListener("submit", evento => {

    evento.preventDefault();

    const hora = horaRiego.value;

    if (!hora) {
        mostrarMensajeRiego("Por favor, selecciona una hora de riego."); // FR-6.e
        return;
    }

    enviar(() => riegoEnEdicion !== null
        ? api("/schedules/" + riegoEnEdicion, { method: "PATCH", body: { irrigation_time: hora } })
        : api("/schedules", { method: "POST", body: { irrigation_date: fechaEnEdicion, irrigation_time: hora } }));
});

// Quitar no se deshace desde la interfaz: se pregunta antes (spec D3).
// El backend no borra riegos: los desactiva y dejan de mostrarse.

eliminarRiego.addEventListener("click", () => {

    if (!confirm("¿Estás seguro de que deseas eliminar este riego?")) {
        return;
    }

    enviar(() => api("/schedules/" + riegoEnEdicion, { method: "PATCH", body: { is_active: false } }));
});


/* =====================================
   INICIAR
===================================== */

async function actualizarPantalla() {

    try {
        await cargarRiegos();
    } catch (error) {
        mostrarCalendario();
        cuentaRiegos.textContent = "";
        proximosRiegos.replaceChildren(crearCelda("li", "No se pudieron cargar los riegos: " + error.message, "mensaje-error"));
        return;
    }

    mostrarCalendario();
    mostrarProximosRiegos();
}

actualizarPantalla();
