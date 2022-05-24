const fecha = document.querySelector('#fecha');
const codigo = document.querySelector('#codigo');
const nombre = document.querySelector('#nombre');
const empresa = document.querySelector('#empresa');
const codComp = document.querySelector('#codComp');
const tipoComp = document.querySelector('#tipoComp');
const nroComp = document.querySelector('#nroComp');
const comprob = document.querySelector('#comprob');
const gravado = document.querySelector('#gravado');
const ivaNormal = document.querySelector('#ivaNormal');
const ivaReducido = document.querySelector('#ivaReducido');
const total = document.querySelector('#total');
const tipoFactura = document.querySelector('#tipoFactura');
const tipoPago = document.querySelector('#tipoPago');
const codDoc = document.querySelector('#codDoc');
const nroCuit = document.querySelector('#nroCuit');
const condIva = document.querySelector('#condIva');
const cantIva = document.querySelector('#cantIva');
const pago = document.querySelector('#pago');
const facturado = document.querySelector('#facturado');
const hora = document.querySelector('#hora');
const gravado21 = document.querySelector('#gravado21');
const iva21 = document.querySelector('#iva21');
const gravado105 = document.querySelector('#gravado105');
const iva105 = document.querySelector('#iva105');
const diferencia = document.querySelector('#diferencia');

//ponemos la fecha actual por defecto
const date = new Date();
let day = date.getDate();
let month = date.getMonth() + 1;
let year = date.getFullYear();
let hour = date.getHours();
let minuts = date.getMinutes();
let seconds = date.getSeconds();

day = day < 10 ? `0${day}` : day;
month = month === 13 ? 1 : month;
month = month < 10 ? `0${month}` : month;

hour = hour < 10 ? `0${hour}` : hour;
minuts = minuts < 10 ? `0${minuts}` : minuts;
seconds = seconds < 10 ? `0${seconds}` : seconds;

hora.value = `${hour}:${minuts}:${seconds}`
fecha.value = `${year}-${month}-${day}`

//apretamos enter y el foco pasa al input siguiente
fecha.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        codigo.focus();
    }
});

codigo.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        nombre.focus();
    }
});

nombre.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        empresa.focus();
    }
});

empresa.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        codComp.focus();
    }
});

codComp.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        tipoComp.focus();
    }
});

tipoComp.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        nroComp.focus();
    }
});

nroComp.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        comprob.focus();
    }
});

comprob.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        gravado.focus();
    }
});

gravado.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        ivaNormal.focus();
    }
});

ivaNormal.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        ivaReducido.focus();
    }
});

ivaReducido.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        total.focus();
    }
});

total.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        tipoFactura.focus();
    }
});

tipoFactura.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        tipoPago.focus();
    }
});

tipoPago.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        codDoc.focus();
    }
});

codDoc.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        nroCuit.focus();
    }
});

nroCuit.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        condIva.focus();
    }
});

condIva.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        cantIva.focus();
    }
});

cantIva.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        pago.focus();
    }
});

pago.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        facturado.focus();
    }
});

facturado.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        hora.focus();
    }
});

hora.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        gravado21.focus();
    }
});

gravado21.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        iva21.focus();
    }
});

iva21.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        gravado105.focus();
    }
});

gravado105.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        iva105.focus();
    }
});

iva105.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        diferencia.focus();
    }
});