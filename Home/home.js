/* =====================================
   RELOJ DIGITAL Y ANALOGICO (spec 105 FR-3.b, FR-3.c)
===================================== */

const dosCifras = numero => String(numero).padStart(2, "0");

// Doce marcas; las de 12, 3, 6 y 9 más largas y gruesas.

document.getElementById("marcasReloj").innerHTML = Array.from({ length: 12 }, (_, i) =>
    `<line x1="50" y1="8" x2="50" y2="${i % 3 ? 11 : 14}" stroke-width="${i % 3 ? 1.2 : 2.2}"
        transform="rotate(${i * 30} 50 50)"/>`).join("");

function girar(id, grados) {
    document.getElementById(id).setAttribute("transform", `rotate(${grados} 50 50)`);
}

function actualizarReloj() {

    const ahora = new Date();

    const horas = ahora.getHours();
    const minutos = ahora.getMinutes();
    const segundos = ahora.getSeconds();

    document.getElementById("horaActual").textContent =
        dosCifras(horas) + ":" + dosCifras(minutos) + ":" + dosCifras(segundos);

    document.getElementById("fechaHoy").textContent =
        formatearFechaLarga(ahora) + " · hora del dispositivo";

    girar("manecillaHora", (horas % 12) * 30 + minutos * 0.5);
    girar("manecillaMinuto", minutos * 6 + segundos * 0.1);
    girar("manecillaSegundo", segundos * 6);
}

actualizarReloj();

setInterval(actualizarReloj, 1000);


/* =====================================
   RIEGOS ACTIVOS DEL BACKEND
===================================== */

// { fecha: "2026-11-19", hora: "08:00" }, en hora del invernadero.

let riegosHome = [];

async function cargarRiegosHome() {

    const entradas = await api("/schedules?active_only=true");

    riegosHome = entradas.map(entrada => ({
        fecha: entrada.irrigation_date,
        hora: entrada.irrigation_time.slice(0, 5)
    }));
}

// "2026-11-19" de una fecha local.

function fechaIso(fecha) {
    return fecha.getFullYear() + "-" + dosCifras(fecha.getMonth() + 1) + "-" + dosCifras(fecha.getDate());
}


/* =====================================
   PROXIMO RIEGO (spec 105 FR-2)
===================================== */

// Con el reloj del dispositivo (spec D1): "2026-11-19T08:00" sin zona es hora local.

function momentoRiego(riego) {
    return new Date(riego.fecha + "T" + riego.hora);
}

function proximoRiego(riegos, ahora) {

    return riegos
        .filter(riego => momentoRiego(riego) > ahora)
        .sort((a, b) => momentoRiego(a) - momentoRiego(b))[0] || null;
}

// "Hoy", "Mañana" o "jueves 19 de noviembre" (FR-2.b).

function textoDia(fecha, ahora) {

    const manana = new Date(ahora);
    manana.setDate(ahora.getDate() + 1);

    if (fecha === fechaIso(ahora)) {
        return "Hoy";
    }

    if (fecha === fechaIso(manana)) {
        return "Mañana";
    }

    return formatearFechaLarga(new Date(fecha + "T00:00"));
}

// Minutos redondeados hacia arriba: nunca dice "Faltan 0 min" (FR-2.c).

function textoFalta(minutos) {

    if (minutos < 60) {
        return "Faltan " + minutos + " min";
    }

    if (minutos < 48 * 60) {
        return "Faltan " + Math.floor(minutos / 60) + " h";
    }

    return "Faltan " + Math.floor(minutos / 1440) + " días";
}

// Se recalcula con los riegos ya leídos (plan D6).

function mostrarProximo() {

    const ahora = new Date();
    const proximo = proximoRiego(riegosHome, ahora);
    const cuenta = document.getElementById("proxCuenta");

    if (!proximo) {
        document.getElementById("proxCuando").textContent = "No hay riegos programados.";
        cuenta.textContent = "";
        return;
    }

    document.getElementById("proxCuando").textContent =
        textoDia(proximo.fecha, ahora) + ", " + proximo.hora;

    cuenta.textContent = textoFalta(Math.ceil((momentoRiego(proximo) - ahora) / 60000));
}

setInterval(mostrarProximo, 60 * 1000);


/* =====================================
   CALENDARIO DE RIEGO HOME (spec 105 FR-3.a)
===================================== */

const calendarioHome = document.getElementById("calendarioHome");

const mesActualHome = document.getElementById("mesActualHome");

const fechaHoy = new Date();

let mesHome = fechaHoy.getMonth();

let anioHome = fechaHoy.getFullYear();

const nombresMeses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function crearCelda(texto, clases) {

    const celda = document.createElement("div");
    celda.className = clases;
    celda.textContent = texto;
    return celda;
}

function mostrarCalendarioHome() {

    mesActualHome.textContent = nombresMeses[mesHome] + " " + anioHome;

    const celdas = DIAS_SEMANA.map(dia => crearCelda(dia, "dow"));

    // La semana empieza el lunes.

    const espacios = (new Date(anioHome, mesHome, 1).getDay() + 6) % 7;

    for (let i = 0; i < espacios; i++) {
        celdas.push(crearCelda("", "dia vacio"));
    }

    const cantidadDias = new Date(anioHome, mesHome + 1, 0).getDate();
    const hoy = fechaIso(fechaHoy);

    for (let dia = 1; dia <= cantidadDias; dia++) {

        const fecha = fechaIso(new Date(anioHome, mesHome, dia));
        const celda = crearCelda(dia, "dia");

        celda.classList.toggle("hoy", fecha === hoy);
        celda.classList.toggle("pasado", fecha < hoy);

        if (riegosHome.some(riego => riego.fecha === fecha)) {
            celda.classList.add("riego");
            celda.title = "Día programado para riego";
        }

        celdas.push(celda);
    }

    calendarioHome.replaceChildren(...celdas);
}

document.getElementById("mesAnteriorHome").addEventListener("click", function() {

    mesHome--;

    if (mesHome < 0) {
        mesHome = 11;
        anioHome--;
    }

    mostrarCalendarioHome();
});

document.getElementById("mesSiguienteHome").addEventListener("click", function() {

    mesHome++;

    if (mesHome > 11) {
        mesHome = 0;
        anioHome++;
    }

    mostrarCalendarioHome();
});

mostrarCalendarioHome();

cargarRiegosHome()
    .then(() => {
        mostrarCalendarioHome();
        mostrarProximo();
    })
    .catch(error => console.error("No se pudieron cargar los riegos:", error));


/* =====================================
   TEMPERATURA Y HUMEDAD ACTUALES (spec 101 FR-5, 105 FR-1)
===================================== */

// Con varios sensores del mismo tipo, la lectura más reciente es la
// mejor respuesta a "¿cómo está ahora?" (spec 101 D3); su estado y su
// rango son los de ese mismo sensor (105 D5).

function lecturaMasReciente(condiciones, tipo) {

    return condiciones
        .filter(sensor => sensor.type === tipo && sensor.value !== null)
        .sort((a, b) => Date.parse(b.recorded_at) - Date.parse(a.recorded_at))[0];
}

// Las clases de estadoLectura() son las de Datos; Home usa los chips de 104.

const CHIP_ESTADO = { "en-rango": "ok", calor: "hot", frio: "cold" };

// "Ideal 18–24 °C", "Ideal hasta 24 °C", "Ideal desde 18 °C" o "Sin límites" (FR-1.b, FR-1.c).

function textoRango(sensor) {

    const minimo = sensor.min_val != null ? formatearNumero(sensor.min_val) : null;
    const maximo = sensor.max_val != null ? formatearNumero(sensor.max_val) : null;

    if (minimo !== null && maximo !== null) {
        return "Ideal " + minimo + "–" + maximo + " " + sensor.unit;
    }

    if (maximo !== null) {
        return "Ideal hasta " + maximo + " " + sensor.unit;
    }

    if (minimo !== null) {
        return "Ideal desde " + minimo + " " + sensor.unit;
    }

    return "Sin límites";
}

function mostrarLectura(lectura, idValor, idEstado, idDetalle) {

    const estado = document.getElementById(idEstado);

    if (!lectura) {
        document.getElementById(idValor).textContent = "--";
        estado.className = "chip none";
        estado.textContent = "Sin lecturas";
        document.getElementById(idDetalle).textContent = "";
        return;
    }

    const resultado = estadoLectura(lectura.value, lectura);

    document.getElementById(idValor).textContent = formatearNumero(lectura.value);
    estado.className = "chip " + CHIP_ESTADO[resultado.clase];
    estado.textContent = resultado.texto;
    document.getElementById(idDetalle).textContent =
        textoRango(lectura) + " · " + antiguedad(lectura.recorded_at, new Date());
}

function mostrarCondicionesHome(condiciones) {

    mostrarLectura(lecturaMasReciente(condiciones, "temperature"),
        "temperatura", "estadoTemperatura", "detalleTemperatura");

    mostrarLectura(lecturaMasReciente(condiciones, "humidity"),
        "humedad", "estadoHumedad", "detalleHumedad");
}

// Si la consulta falla se conservan los valores mostrados.

async function cargarCondicionesHome() {

    try {
        mostrarCondicionesHome(await api("/conditions"));
    } catch (error) {
        console.error("No se pudieron leer las condiciones:", error);
    }
}

cargarCondicionesHome();

setInterval(cargarCondicionesHome, 30 * 1000);
