
const { DateTime } = require("luxon");
const axios = require("axios");
require("dotenv").config;
const URL = process.env.URL;

const hoy = new Date();
let dia = hoy.getDate();

let totalRecibos = 0;
let totalFactura = 0;
let totalPresupuesto = 0;

if (dia<10) {
    dia = `0${dia}`
}
let mes = hoy.getMonth() + 1
console.log(mes)

mes = (mes === 0) ? 1 : mes

if (mes<10) {
    mes = `0${mes}`
}
const fechaDeHoy = (`${hoy.getFullYear()}-${mes}-${dia}`)
const buscar = document.querySelector('.buscar');
const contado = document.querySelector('.contado');
const cteCorriente = document.querySelector('.cteCorriente');
const desde =  document.querySelector('#desde')
const hasta =  document.querySelector('#hasta')
desde.value = fechaDeHoy
hasta.value = fechaDeHoy
const tbody =  document.querySelector('.tbody')
let ventas = []
buscar.addEventListener('click',async e=>{
    const desdefecha = new Date(desde.value)
    let hastafecha = DateTime.fromISO(hasta.value).endOf('day');
    let tickets = await axios.get(`${URL}ventas/${desdefecha}/${hastafecha}`)
    tickets = tickets.data;
    let presupuesto = await axios.get(`${URL}presupuesto/${desdefecha}/${hastafecha}`);
    presupuesto = presupuesto.data;
    ventas = [...tickets,...presupuesto];
    contado.focus();
});


desde.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        hasta.focus();
    }
});

hasta.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        buscar.focus();
    }
});

contado.addEventListener('click',e=>{
    const recibos_P = ventas.filter(venta=>venta.tipo_comp === "Recibos_P");
    const recibos = ventas.filter(venta=>venta.tipo_comp === "Recibos");
    const ventasContado = ventas.filter(venta => (venta.tipo_pago === "CD"))
    contado.classList.add('seleccionado');
    cteCorriente.classList.remove('seleccionado');
    listarVentas([...ventasContado,...recibos,...recibos_P]);
})

cteCorriente.addEventListener('click',e=>{
    const ventasContado = ventas.filter(venta => venta.tipo_pago === "CC")
    cteCorriente.classList.add('seleccionado');
    contado.classList.remove('seleccionado');
    listarVentas(ventasContado);
})


function listarVentas(lista) {
    console.log(lista)
    tbody.innerHTML = "";

    lista.sort((a,b)=>{
        if (a.fecha>b.fecha) {
            return 1;
        }else if(a.fecha<b.fecha){
            return -1;
        }
        return 0;
    })

    lista.forEach(venta => {
        let tipo  = "";
        if (venta.tipo_comp === "Presupuesto") {
            tipo = "P";
        }else if(venta.tipo_comp === "Ticket Factura"){
            tipo = "T";
        }else{
            tipo = "R";
        };

        const fecha = new Date(venta.fecha);
        let hoy = fecha.getDate();
        let mes = fecha.getMonth();
        let hours = fecha.getHours();
        let minutes = fecha.getMinutes();
        let seconds = fecha.getSeconds();
        mes = (mes===0) ? mes + 1 : mes;
        mes = (mes<10) ? `0${mes}` : mes;
        hoy = (hoy<10) ? `0${hoy}` : hoy;
        hours = (hours<10) ? `0${hours}` : hours;
        minutes = (minutes<10) ? `0${minutes}` : minutes;
        seconds = (seconds<10) ? `0${seconds}` : seconds;
        let anio = fecha.getFullYear();


        venta.productos.forEach(({objeto,cantidad})=>{
            tbody.innerHTML += `
            <tr>
                <td>${tipo}</td>
                <td>${venta.nro_comp}</td>
                <td>${hoy}/${mes}/${anio} - ${hours}:${minutes}:${seconds}</td>
                <td>${venta.nombreCliente}</td>
                <td>${objeto._id}</td>
                <td>${objeto.descripcion}</td>
                <td>${venta.vendedor.substr(-20,2)}</td>
                <td class= "egreso">${(parseFloat(cantidad)).toFixed(2)}</td>
                <td>${objeto.precio_venta}</td>
                <td>${(objeto.precio_venta*cantidad).toFixed(2)}</td>
            </tr>
        `
        })
        if (venta.tipo_comp === "Recibos" || venta.tipo_comp === "Recibos_P") {
            tbody.innerHTML += `
                <tr>
                    <td>${tipo}</td>
                    <td>${venta.nro_comp}</td>
                    <td>${hoy}/${mes}/${anio} - ${hours}:${minutes}:${seconds}</td>
                    <td>${venta.nombreCliente}</td>
                    <td></td>
                    <td></td>
                    <td>${venta.vendedor}</td>
                    <td></td>
                    <td></td>
                    <td>${venta.precioFinal}</td>
                </tr>
            `
        }
        if (venta.tipo_comp === "Ticket Factura" || venta.tipo_comp === "Nota Credito") {
            totalFactura += venta.precioFinal;
        }else if(venta.tipo_comp === "Presupuesto"){
            totalPresupuesto += venta.precioFinal;
        }else{
            totalRecibos += venta.precioFinal;
        }
        tbody.innerHTML += `
        <tr class="total"><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td class=tdTotal>${parseFloat(venta.precioFinal).toFixed(2)}</td></tr>`
    });

    tbody.innerHTML += `
        <tr class="total">
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td>Presupuesto: </td>
            <td>${totalPresupuesto.toFixed(2)}</td>
        </tr>
        <tr class="total">
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td>Facturas: </td>
            <td>${totalFactura.toFixed(2)}</td>
        </tr>
        <tr class="total">
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td>Recibos: </td>
            <td>${totalRecibos.toFixed(2)}</td>
        </tr>
    `
}


document.addEventListener('keydown',e=>{
    if (e.key === "Escape") {
        window.close()
    }
})