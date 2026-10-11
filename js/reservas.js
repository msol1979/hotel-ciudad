// Variable global para almacenar los datos de las habitaciones
let habitacionesJSON = [];

// Selección de Elementos del DOM
const selectHabitacion = document.getElementById("habitacion");
const inputPrecio = document.getElementById("precio_noche");
const txtDescripcion = document.getElementById("descripcion");

const inputNombre = document.getElementById("nombre");
const inputEmail = document.getElementById("email");
const inputDni = document.getElementById("dni");
const inputNacimiento = document.getElementById("fecha_nacimiento");
const inputIngreso = document.getElementById("fecha_ingreso");
const inputEgreso = document.getElementById("fecha_egreso");
const inputHuespedes = document.getElementById("huespedes");
const inputNoches = document.getElementById("noches");

const inputTarjeta = document.getElementById("tarjeta");
const logoTarjeta = document.getElementById("logo-tarjeta");
const inputCvv = document.getElementById("cvv");
const inputVencimiento = document.getElementById("vencimiento_tarjeta");

const checkboxSeguro = document.getElementById("seguro");
const spanTotal = document.getElementById("total-pagar");
const errorGeneral = document.getElementById("error-general");
const btnSubmit = document.getElementById("btn-submit");
const sectionResumen = document.getElementById("resumen-reserva");
const form = document.getElementById("form-reservas");

// Inicialización Automática al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
    configurarMinFechas();
    agregarEventosValidacion();
    
    // Carga asincrónica real desde el archivo JSON
    await cargarDatosJSON();
    
    validarFormulario();
});

// Función para leer habitaciones.json
async function cargarDatosJSON() {
    try {
        const respuesta = await fetch("json/habitaciones.json");
        if (!respuesta.ok) {
            throw new Error(`Error al leer el archivo: ${respuesta.status}`);
        }
        habitacionesJSON = await respuesta.json();
        
        cargarHabitaciones();
        actualizarDetallesHabitacion();
    } catch (error) {
        console.error("Hubo un problema al cargar habitaciones.json:", error);
        errorGeneral.textContent = "Error del sistema: No se pudieron cargar los datos del hotel.";
    }
}

// Carga las habitaciones dentro del <select>
function cargarHabitaciones() {
    selectHabitacion.innerHTML = "";
    habitacionesJSON.forEach(hab => {
        const option = document.createElement("option");
        option.value = hab.id;
        option.textContent = `${hab.tipo_habitacion} (ID: ${hab.id}) - $${hab.precio_noche}/noche`;
        selectHabitacion.appendChild(option);
    });
}

// Actualiza campos readonly y placeholders basándose en la selección actual
function actualizarDetallesHabitacion() {
    const habSeleccionada = habitacionesJSON.find(hab => hab.id == selectHabitacion.value);
    if (habSeleccionada) {
        inputPrecio.value = habSeleccionada.precio_noche;
        txtDescripcion.value = `${habSeleccionada.descripcion} Servicios: ${habSeleccionada.servicios.join(", ")}.`;
        inputHuespedes.max = habSeleccionada.capacidad_maxima;
        inputHuespedes.placeholder = `1 a ${habSeleccionada.capacidad_maxima}`;
    }
    calcularTotal();
    validarFormulario();
}

// Restricción de fechas mínimas
function configurarMinFechas() {
    const hoy = new Date().toISOString().split("T")[0];
    inputIngreso.min = hoy;
    inputEgreso.min = hoy;
}

// Control visual de clases de validación
function mostrarError(input, spanId, mensaje) {
    input.classList.remove("exito");
    input.classList.add("error");
    const errorSpan = document.getElementById(spanId);
    if (errorSpan) {
        errorSpan.textContent = mensaje;
        errorSpan.style.color = "#e74c3c";
    }
    return false;
}

function mostrarExito(input, spanId) {
    input.classList.remove("error");
    input.classList.add("exito");
    const errorSpan = document.getElementById(spanId);
    if (errorSpan) errorSpan.textContent = "";
    return true;
}

// Validaciones individuales
function validarNombre() {
    const valor = inputNombre.value.trim();
    if (valor === "") {
        return mostrarError(inputNombre, "error-nombre", "El nombre no puede estar vacío.");
    }
    if (!valor.includes(" ")) {
        return mostrarError(inputNombre, "error-nombre", "Debe ingresar nombre y apellido (separados por un espacio).");
    }
    return mostrarExito(inputNombre, "error-nombre");
}

function validarEmail() {
    const valor = inputEmail.value.trim();
    const regexEmailCom = /^[^\s@]+@[^\s@]+\.[^\s@]*com$/;
    
    if (valor === "") {
        return mostrarError(inputEmail, "error-email", "El correo no puede estar vacío.");
    }
    if (!valor.includes("@")) {
        return mostrarError(inputEmail, "error-email", "El correo debe contener un '@'.");
    }
    if (!regexEmailCom.test(valor)) {
        return mostrarError(inputEmail, "error-email", "El correo debe terminar obligatoriamente en '.com'.");
    }
    return mostrarExito(inputEmail, "error-email");
}

function validarDni() {
    const valor = inputDni.value.trim();
    const regexSoloNumeros = /^\d+$/;

    if (valor === "") {
        return mostrarError(inputDni, "error-dni", "El DNI no puede estar vacío.");
    }
    if (!regexSoloNumeros.test(valor)) {
        return mostrarError(inputDni, "error-dni", "El DNI debe contener únicamente números.");
    }
    if (valor.length !== 8) {
        return mostrarError(inputDni, "error-dni", "El DNI debe tener exactamente 8 dígitos.");
    }
    return mostrarExito(inputDni, "error-dni");
}

function validarMayorEdad() {
    const valor = inputNacimiento.value;
    if (valor === "") {
        return mostrarError(inputNacimiento, "error-nacimiento", "Debe ingresar su fecha de nacimiento.");
    }
    
    const fechaNac = new Date(valor);
    const hoy = new Date();
    
    if (isNaN(fechaNac.getTime())) {
        return mostrarError(inputNacimiento, "error-nacimiento", "Fecha de nacimiento inválida.");
    }

    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const diferenciaMeses = hoy.getMonth() - fechaNac.getMonth();
    
    if (diferenciaMeses < 0 || (diferenciaMeses === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--;
    }

    if (edad < 18) {
        return mostrarError(inputNacimiento, "error-nacimiento", "Debe ser mayor de edad (18 años o más).");
    }
    return mostrarExito(inputNacimiento, "error-nacimiento");
}

function validarFechasEstadia() {
    const fIngresoVal = inputIngreso.value;
    const fEgresoVal = inputEgreso.value;
    const hoy = new Date();
    hoy.setHours(0,0,0,0);

    if (fIngresoVal === "") {
        return mostrarError(inputIngreso, "error-ingreso", "Debe seleccionar una fecha de ingreso.");
    }
    const fIngreso = new Date(fIngresoVal);
    if (fIngreso < hoy) {
        return mostrarError(inputIngreso, "error-ingreso", "La fecha no puede ser anterior a hoy.");
    }
    mostrarExito(inputIngreso, "error-ingreso");

    if (fEgresoVal === "") {
        return mostrarError(inputEgreso, "error-egreso", "Debe seleccionar una fecha de egreso.");
    }
    const fEgreso = new Date(fEgresoVal);
    if (fEgreso <= fIngreso) {
        return mostrarError(inputEgreso, "error-egreso", "La fecha de egreso debe ser posterior a la de ingreso.");
    }
    return mostrarExito(inputEgreso, "error-egreso");
}

function validarHuespedes() {
    const valor = parseInt(inputHuespedes.value, 10);
    const habSeleccionada = habitacionesJSON.find(hab => hab.id == selectHabitacion.value);

    if (isNaN(valor)) {
        return mostrarError(inputHuespedes, "error-huespedes", "Ingrese la cantidad de huéspedes.");
    }
    if (valor < 1 || valor > 6) {
        return mostrarError(inputHuespedes, "error-huespedes", "La cantidad debe ser entre 1 y 6.");
    }
    if (habSeleccionada && valor > habSeleccionada.capacidad_maxima) {
        return mostrarError(inputHuespedes, "error-huespedes", `Permite un máximo de ${habSeleccionada.capacidad_maxima} huéspedes.`);
    }
    return mostrarExito(inputHuespedes, "error-huespedes");
}

function validarNoches() {
    const valor = parseInt(inputNoches.value, 10);
    if (isNaN(valor) || valor < 1) {
        return mostrarError(inputNoches, "error-noches", "Debe ingresar al menos 1 noche.");
    }
    return mostrarExito(inputNoches, "error-noches");
}

// Reconocimiento de Tarjetas usando las imágenes correspondientes
function detectarTarjeta() {
    // Buscamos los elementos de forma global en todo el HTML
    const inputTarjeta = document.getElementById("tarjeta");
    const logoTarjeta = document.getElementById("logo-tarjeta");

    // Si por alguna razón no se encuentran en el HTML, salimos de la función para evitar errores
    if (!inputTarjeta || !logoTarjeta) return;

    const numero = inputTarjeta.value.trim();
    const esVisa = /^4/.test(numero);
    const esMasterCard = /^5[1-5]/ .test(numero);

    if (esVisa) {
        // Volvemos a la ruta relativa que te funcionaba antes de romper el HTML
        logoTarjeta.src = "recursos_adicionales/logo-visa.png";
        logoTarjeta.alt = "Visa";
        logoTarjeta.style.display = "block";
    } else if (esMasterCard) {
        logoTarjeta.src = "recursos_adicionales/tarjeta-mastercard.png";
        logoTarjeta.alt = "MasterCard";
        logoTarjeta.style.display = "block";
    } else {
        logoTarjeta.style.display = "none";
        logoTarjeta.src = "";
    }
}

function validarTarjeta() {
    const valor = inputTarjeta.value.trim();
    const regexTarjeta = /^\d{16}$/;

    if (valor === "") {
        return mostrarError(inputTarjeta, "error-tarjeta", "Ingrese el número de tarjeta.");
    }
    if (!regexTarjeta.test(valor)) {
        return mostrarError(inputTarjeta, "error-tarjeta", "Debe contener exactamente 16 dígitos.");
    }
    return mostrarExito(inputTarjeta, "error-tarjeta");
}

function validarCvv() {
    const valor = inputCvv.value.trim();
    const regexCvv = /^\d{3,4}$/;

    if (valor === "") {
        return mostrarError(inputCvv, "error-cvv", "Ingrese el código CVV.");
    }
    if (!regexCvv.test(valor)) {
        return mostrarError(inputCvv, "error-cvv", "El CVV debe tener 3 o 4 dígitos.");
    }
    return mostrarExito(inputCvv, "error-cvv");
}

function validarVencimiento() {
    const valor = inputVencimiento.value.trim();
    if (valor === "") {
        return mostrarError(inputVencimiento, "error-vencimiento", "Ingrese la fecha de vencimiento.");
    }

    const regexVencimiento = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!regexVencimiento.test(valor)) {
        return mostrarError(inputVencimiento, "error-vencimiento", "Use el formato MM/AA (Ej: 12/28).");
    }

    const [mesStr, anioStr] = valor.split("/");
    const mesIngresado = parseInt(mesStr, 10);
    const anioIngresado = 2000 + parseInt(anioStr, 10);

    const hoy = new Date();
    const anioActual = hoy.getFullYear();
    const mesActual = hoy.getMonth() + 1;

    if (anioIngresado < anioActual || (anioIngresado === anioActual && mesIngresado < mesActual)) {
        return mostrarError(inputVencimiento, "error-vencimiento", "La tarjeta ya está vencida.");
    }
    return mostrarExito(inputVencimiento, "error-vencimiento");
}

// Cálculo del Total a Pagar
function calcularTotal() {
    const precio = parseFloat(inputPrecio.value) || 0;
    const noches = parseInt(inputNoches.value, 10) || 0;
    let total = precio * noches;

    if (checkboxSeguro.checked) {
        total = total * 1.15;
    }

    spanTotal.textContent = Math.round(total).toLocaleString("es-AR");
}

// Validación y Habilitación del Formulario Completo
function validarFormulario() {
    if (habitacionesJSON.length === 0) return;

    const esNombreValido = validarNombre();
    const esEmailValido = validarEmail();
    const esDniValido = validarDni();
    const esMayorEdad = validarMayorEdad();
    const sonFechasValidas = validarFechasEstadia();
    const esHuespedValido = validarHuespedes();
    const esNocheValida = validarNoches();
    const esTarjetaValida = validarTarjeta();
    const esCvvValido = validarCvv();
    const esVencimientoValido = validarVencimiento();

    const todoValido = esNombreValido && esEmailValido && esDniValido && 
                       esMayorEdad && sonFechasValidas && esHuespedValido && 
                       esNocheValida && esTarjetaValida && esCvvValido && esVencimientoValido;

    if (!todoValido) {
        errorGeneral.textContent = "Por favor, complete todos los campos correctamente para habilitar la confirmación.";
        btnSubmit.disabled = true;
        sectionResumen.style.display = "none";
    } else {
        errorGeneral.textContent = "";
        btnSubmit.disabled = false;
        generarResumen();
    }
}

// Construcción del Resumen Final
function generarResumen() {
    const habSeleccionada = habitacionesJSON.find(hab => hab.id == selectHabitacion.value);
    if (!habSeleccionada) return;
    
    sectionResumen.innerHTML = `
        <h3>Resumen de su Reserva</h3>
        <p><strong>Huésped:</strong> ${inputNombre.value}</p>
        <p><strong>DNI:</strong> ${inputDni.value}</p>
        <p><strong>Habitación:</strong> ${habSeleccionada.tipo_habitacion} (ID: ${habSeleccionada.id})</p>
        <p><strong>Fechas:</strong> Del ${inputIngreso.value} al ${inputEgreso.value} (${inputNoches.value} noches)</p>
        <p><strong>Huéspedes:</strong> ${inputHuespedes.value}</p>
        <p><strong>Seguro Opcional:</strong> ${checkboxSeguro.checked ? "Sí (+15% Aplicado)" : "No"}</p>
        <h4>Monto Total: $${spanTotal.textContent}</h4>
    `;
    sectionResumen.style.display = "block";
}

// Configuración de Event Listeners
function agregarEventosValidacion() {
    inputNombre.addEventListener("input", () => { validarNombre(); validarFormulario(); });
    inputEmail.addEventListener("input", () => { validarEmail(); validarFormulario(); });
    inputDni.addEventListener("input", () => { validarDni(); validarFormulario(); });
    inputNacimiento.addEventListener("change", () => { validarMayorEdad(); validarFormulario(); });
    
    selectHabitacion.addEventListener("change", actualizarDetallesHabitacion);
    
    inputIngreso.addEventListener("change", () => { validarFechasEstadia(); validarFormulario(); });
    inputEgreso.addEventListener("change", () => { validarFechasEstadia(); validarFormulario(); });
    inputHuespedes.addEventListener("input", () => { validarHuespedes(); validarFormulario(); });
    
    inputNoches.addEventListener("input", () => { 
        validarNoches(); 
        calcularTotal(); 
        validarFormulario(); 
    });
    
    inputTarjeta.addEventListener("input", () => { 
        detectarTarjeta();
        validarTarjeta(); 
        validarFormulario(); 
    });
    
    inputCvv.addEventListener("input", () => { validarCvv(); validarFormulario(); });
    
    inputVencimiento.addEventListener("input", (e) => {
        let valor = e.target.value.replace(/\D/g, "");
        if (valor.length > 2) {
            e.target.value = valor.slice(0, 2) + "/" + valor.slice(2, 4);
        } else {
            e.target.value = valor;
        }
        validarVencimiento();
        validarFormulario();
    });
    
    checkboxSeguro.addEventListener("change", () => { 
        calcularTotal(); 
        validarFormulario(); 
    });
}

// Envío del Formulario
form.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("¡Felicidades! Su reserva ha sido confirmada.");
});