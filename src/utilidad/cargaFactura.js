const axios = require("axios");
require("dotenv").config;
const URL = process.env.URL;

const fecha = document.querySelector('#fecha');
const nombre = document.querySelector('#nombre');
const codComp = document.querySelector('#codComp');
const puntoVenta = document.querySelector('#puntoVenta');
const nroComp = document.querySelector('#nroComp');
const gravado = document.querySelector('#gravado');
const total = document.querySelector('#total');
const totalIva = document.querySelector('#totalIva');
const tipoPago = document.querySelector('#tipoPago');
const codDoc = document.querySelector('#codDoc');
const nroCuit = document.querySelector('#nroCuit');
const condIva = document.querySelector('#condIva');
const cantIva = document.querySelector('#cantIva');
const gravado21 = document.querySelector('#gravado21');
const iva21 = document.querySelector('#iva21');
const gravado105 = document.querySelector('#gravado105');
const iva105 = document.querySelector('#iva105');
const diferencia = document.querySelector('#diferencia');
const empresa = document.querySelector('#empresa');
const guardar = document.querySelector('.guardar');
const cancelar = document.querySelector('.cancelar');

//ponemos la fecha actual por defecto y la hora
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

fecha.value = `${year}-${month}-${day}`

//ponemos el total despues de sacar el focus de gravado y el total de iva
gravado.addEventListener('blur',()=>{
    let gravadoInput = (gravado.value) === "" ? 0 : parseFloat(gravado.value);
    let ivaInput = (totalIva.value) === "" ? 0 : parseFloat(totalIva.value);
    total.value = gravadoInput + ivaInput;
});

totalIva.addEventListener('blur',()=>{
    let gravadoInput = (gravado.value) === "" ? 0 : parseFloat(gravado.value);
    let ivaInput = (totalIva.value) === "" ? 0 : parseFloat(totalIva.value);
    total.value = gravadoInput + ivaInput;
});

guardar.addEventListener('click',async ()=>{
    const venta = {};
    venta.cliente = "9999";
    venta.fecha = new Date(fecha.value);
    venta.nombreCliente = nombre.value;
    venta.cod_comp = codComp.value;
    venta.tipo_comp = verTipoComprobante(codComp.value);
    venta.comprob = puntoVenta.value.padStart(4,'0') + "-" + nroComp.value.padStart(8,'0');
    venta.nro_comp = venta.comprob;
    venta.precioFinal = total.value;
    venta.cod_doc = codDoc.value;
    venta.dnicuit = nroCuit.value;
    venta.condIva = condIva.value;
    venta.cant_iva = cantIva.value === "" ? 0 : cantIva.value;
    venta.gravado21 = gravado21.value === "" ? 0 : gravado21.value;
    venta.gravado105 = gravado105.value === "" ? 0 : gravado105.value;
    venta.iva21 = iva21.value === "" ? 0 : iva21.value;
    venta.iva105 = iva105.value === "" ? 0 : iva105.value;
    venta.empresa = empresa.value;
    await axios.post(`${URL}ventas`,venta);
});

const verTipoComprobante = (codigo)=>{
    if (codigo === "1" || codigo === "6") {
        return "Ticket Factura"
    }else if(codigo === "3" || codigo === "8"){
        return "Nota Credito"
    }
}

//apretamos enter y el foco pasa al input siguiente
fecha.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        nombre.focus();
    }
});

nombre.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        codComp.focus();
    }
});

codComp.addEventListener('keypress',e=>{
    e.preventDefault();
    if (e.key==="Enter") {
        puntoVenta.focus();
    }
});

puntoVenta.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        nroComp.focus();
    }
});

nroComp.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        gravado.focus();
    }
});

gravado.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        totalIva.focus();
    }
});

totalIva.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        codDoc.focus();
    }
});

codDoc.addEventListener('keypress',e=>{
    e.preventDefault();
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
    e.preventDefault();
    if (e.key==="Enter") {
        cantIva.focus();
    }
});

cantIva.addEventListener('keypress',e=>{
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

diferencia.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        empresa.focus();
    }
});

empresa.addEventListener('keypress',e=>{
    e.preventDefault();
    if (e.key==="Enter") {
        guardar.focus();
    }
});

gravado.addEventListener('focus',e=>{
    gravado.select();
});

nroComp.addEventListener('focus',e=>{
    nroComp.select();
});

totalIva.addEventListener('focus',e=>{
    totalIva.select();
});

nroCuit.addEventListener('focus',e=>{
    nroCuit.select();
});

cantIva.addEventListener('focus',e=>{
    cantIva.select();
});

gravado21.addEventListener('focus',e=>{
    gravado21.select();
});

iva21.addEventListener('focus',e=>{
    iva21.select();
});

gravado105.addEventListener('focus',e=>{
    gravado105.select();
});

iva105.addEventListener('focus',e=>{
    iva105.select();
});
diferencia.addEventListener('focus',e=>{
    diferencia.select();
});
nombre.addEventListener('focus',e=>{
    nombre.select();
});
