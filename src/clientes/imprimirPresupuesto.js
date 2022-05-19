const {ipcRenderer} = require('electron');
const axios = require('axios');
require('dotenv').config
const URL = process.env.URL;

const puntoVenta = document.querySelector('#puntoVenta');
const numero = document.querySelector('#numero');

const aceptar = document.querySelector('.aceptar');
const cancelar = document.querySelector('.cancelar');

aceptar.addEventListener('click',async e=>{
    let punto = puntoVenta.value.padStart(4,'0');
    let numeroVenta = numero.value.padStart(8,'0');
    const comprobante = punto + "-" + numeroVenta;
    let tipoVenta = ""
    if (punto === "0001" || punto === "0002" || punto === "0003" ) {
        tipoVenta = "Presupuesto";
    }else if(punto === "0004"){
        tipoVenta = "Recibos_P";
    }else if(punto === "0005"){
        tipoVenta = "Ticket Factura";
    }

    let venta = (await axios.get(`${URL}presupuesto/${comprobante}`)).data;
    console.log(venta)
    if (!venta) {
         venta = (await axios.get(`${URL}ventas/venta/ventaUnica/${comprobante}/${tipoVenta}`)).data[0];
    }
    console.log(venta)
    const cliente = (await axios.get(`${URL}clientes/id/${venta.cliente}`)).data;
    ipcRenderer.send('imprimir-venta',[venta,cliente,false,1,"imprimir-comprobante","valorizado"])
});

puntoVenta.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        numero.focus();
    }
});

numero.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        aceptar.focus();
    }
});

cancelar.addEventListener('click',e=>{
    window.close()
})