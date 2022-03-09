const { ipcRenderer } = require("electron");
const axios = require("axios");
const { DateTime } = require("luxon");
require("dotenv").config;
const URL = process.env.URL;

const fecha = new Date()
let dia = fecha.getDate()
let mes = fecha.getMonth() + 1;
mes = (mes === 13) ? (mes=1) : mes;
mes = (mes < 10) ? (mes = `0${mes}`) : mes;
dia = (dia<10) ? (dia = `0${dia}`) : dia;
const anio = fecha.getFullYear();

let ultimoDiaMesAnterior = (new Date(anio,mes-1,0))
ultimoDiaMesAnterior=ultimoDiaMesAnterior.getDate()

let ultimoDia = (new Date(anio,mes,0))
ultimoDia = ultimoDia.getDate();

let mesAyer = ((mes-1) === 0) ? 12 : mes-1;
mesAyer = mesAyer < 10 ? `0${mesAyer}` : mes
const anioAyer = (mes === "01") ? (anio-1) : anio;

const fechaAyer = `${anioAyer}-${mesAyer}-${ultimoDiaMesAnterior}`

const fechaHoy = `${anio}-${mes}-${ultimoDia}`


const desde = document.querySelector('#desde');
const hasta = document.querySelector('#hasta');
const tbody = document.querySelector('.tbody');
const buscar =  document.querySelector('.buscar');

desde.value = fechaAyer;
hasta.value = fechaHoy;

let listaTicketFactura = []
let listaNotaCredito = []

buscar.addEventListener('click',async e=>{

    const desdeFecha = new Date(desde.value)
    let hastaFecha = DateTime.fromISO(hasta.value).endOf('day')
    let ventas = await axios.get(`${URL}ventas/${desdeFecha}/${hastaFecha}`)
    ventas = ventas.data
    let presupuesto = await axios.get(`${URL}presupuesto/${desdeFecha}/${hastaFecha}`)
    presupuesto = presupuesto.data;
    ventasTraidas([...ventas,...presupuesto]);
})

const ventasTraidas = (ventas)=>{
    ventas = ventas.filter(venta => venta.tipo_comp !== "Presupuesto" || venta.tipo_comp !== "Recibos" || venta.tipo_comp !== "Recibos_P");
    listaTicketFactura = ventas.filter(venta=>venta.tipo_comp === "Ticket Factura");
    listaNotaCredito = ventas.filter(venta=>venta.tipo_comp !== "Ticket Factura");
    (listaNotaCredito.length > 0) && listar(listaNotaCredito);
    listar(listaTicketFactura);
}

const listar = (ventas)=>{
    let cliente;
    let cond_iva;
    let totalgravado21 = 0;
    let totalgravado105 = 0;
    let totaliva21 = 0;
    let totaliva105 = 0;
    let total = 0
    let diaVentaAnterior = new Date((ventas[0].fecha)).getDate();
    diaVentaAnterior = diaVentaAnterior < 10 ? `0${diaVentaAnterior}` : diaVentaAnterior;
    let tamanioVentas = ventas.length - 1;
    ventas.sort((a,b)=>{
        if (a.tipo_comp > b.tipo_comp) {
            return 1
        }
        if (a.tipo_comp < b.tipo_comp) {
            return -1
        }
        return 0
    })
    ventas.forEach(async venta => {
        let fecha = new Date(venta.fecha)
        let day = fecha.getDate();
        let month = fecha.getMonth();
        month = (month===0) ? month + 1 : month;
        day = (day < 10) ? `0${day}` : day;
        month = (month < 10) ? `0${month}` : month;
        let year = fecha.getFullYear();
        
        let cliente = await axios.get(`${URL}clientes/id/${venta.cliente}`)
        cliente = cliente.data
        cond_iva = (cliente.cond_iva) ? (cliente.cond_iva) : "Consumidor Final";


        if (venta.tipo_comp !== "Ticket Factura") {
            gravado105 = 0;
            gravado21 = 0;
            iva105 = 0;
            iva21 = 0;
        }else{
            gravado105 = venta.gravado105;
            gravado21 = venta.gravado21;
            iva105 = venta.iva105;
            iva21 = venta.iva21;
        }
        tbody.innerHTML += await `
            <tr>
                <td>${day}/${month}/${year}</td>
                <td>${venta.nombreCliente}</td>
                <td>${cond_iva}</td>
                <td>${cliente.cuit}</td>
                <td>${venta.tipo_comp}</td>
                <td>${venta.nro_comp}</td>
                <td>${gravado21}</td>
                <td>${iva21}</td>
                <td>${gravado105}</td>
                <td>${iva105}</td>
                <td>${venta.precioFinal}<td>
            </tr>
        `
        if (diaVentaAnterior === day && (ventas.indexOf(venta) !== tamanioVentas)) {
            totalgravado21 +=  venta.gravado21
            totaliva21 +=  venta.iva21
            totalgravado105 +=  venta.gravado105
            totaliva105 +=  venta.iva105
            total +=  venta.precioFinal
        }else{

            if ((ventas.indexOf(venta) === tamanioVentas) && ventas.tipo_comp === "Ticket Factura") {
                totalgravado105 += venta.gravado105;
                totalgravado21 += venta.gravado21;
                totaliva105 += venta.ivatotaliva105;
                totaliva21 += venta.iva21;
            }
            tbody.innerHTML += await `
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>Totales Diarios</td>
                    <td>${venta.tipo_comp}</td>
                    <td>${totalgravado21}</td>
                    <td>${totaliva21}</td>
                    <td>${totalgravado105}</td>
                    <td>${totaliva105}</td>
                    <td>${total}</td>
                    
                </tr>
            `
            diaVentaAnterior = day
            totalgravado21 = 0
            totaliva21 = 0
            totalgravado105 = 0
            totaliva105 = 0
        }
       
    });
}
