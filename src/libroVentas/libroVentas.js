const { ipcRenderer } = require("electron");

const axios = require("axios");
const { DateTime } = require("luxon");
const XLSX = require('xlsx');
require("dotenv").config;
const URL = process.env.URL;

const fecha = new Date()
let dia = fecha.getDate()
let mes = fecha.getMonth() + 1;
const anio = fecha.getFullYear();

mes = (mes === 13) ? (mes=1) : mes;
mes = (mes < 10) ? (mes = `0${mes}`) : mes;
dia = (dia<10) ? (dia = `0${dia}`) : dia;


//varaibles globales del total
let totalGlobalGravado21Nota = 0;
let totalGlobalIva21Nota = 0;
let totalGlobalGravado105Nota = 0;
let totalGlobalIva105Nota = 0;
let totalGlobalNota = 0;
let totalGlobalGravado21Factura = 0;
let totalGlobalIva21Factura = 0;
let totalGlobalGravado105Factura = 0;
let totalGlobalIva105Factura = 0;
let totalGlobalFactura = 0;

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
const exportar =  document.querySelector('.exportar');

desde.value = fechaAyer;
hasta.value = fechaHoy;

let ventasExportar = [];

buscar.addEventListener('click',async e=>{
    tbody.innerHTML = "";
    const desdeFecha = new Date(desde.value)
    let hastaFecha = DateTime.fromISO(hasta.value).endOf('day');
    let ventas = (await axios.get(`${URL}ventas/${desdeFecha}/${hastaFecha}`)).data;
    ventas = ventas.filter(venta=>venta.tipo_comp !== "Recibos");
    ventas = ventas.filter(venta => venta.tipo_comp !== "Recibos_P");
    ventasExportar = ventas;
    ventasTraidas(ventas);
})

const ventasTraidas = async (ventas)=>{
    
    //Ordenamos la ventas por fecha
    ventas.sort((a,b)=>{
        if (a.fecha > b.fecha) {
            return 1
        }
        if (a.fecha < b.fecha) {
            return -1
        }
        return 0
    });
    let ultimoDia = new Date((ventas[ventas.length - 1].fecha)).getDate();
    let diaVentaAnterior = new Date((ventas[0].fecha)).getDate();
    let mesDelDiaAnterior = new Date((ventas[0].fecha)).getMonth() + 1;
    mesDelDiaAnterior = mesDelDiaAnterior === 13 ? 1 : mesDelDiaAnterior
    // diaVentaAnterior = diaVentaAnterior < 10 ? `0${diaVentaAnterior}` : diaVentaAnterior;
    let ventasHoy = [];
   for await(let venta of ventas){
        if ((new Date(venta.fecha).getDate() > diaVentaAnterior) || (new Date(venta.fecha).getDate() < diaVentaAnterior && new Date(venta.fecha).getMonth + 1 !== mesDelDiaAnterior)) {
            ventasHoy.length !== 0 && await listar(ventasHoy,diaVentaAnterior)
            ventasHoy = [];
            diaVentaAnterior = new Date(venta.fecha).getDate();
            ventasHoy.push(venta);
        }else{
            ventasHoy.push(venta);
        }
    };
    const ventasUltimoDia = ventas.filter(venta => new Date(venta.fecha).getDate() === ultimoDia);
    await listar(ventasUltimoDia);
    tbody.innerHTML += `
        <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td>TOTAL MENSUAL</td>
            <td>${(totalGlobalGravado21Factura-totalGlobalGravado21Nota).toFixed(2)}</td>
            <td>${(totalGlobalIva21Factura-totalGlobalIva21Nota).toFixed(2)}</td>
            <td>${(totalGlobalGravado105Factura-totalGlobalGravado105Nota).toFixed(2)}</td>
            <td>${(totalGlobalIva105Factura-totalGlobalIva105Nota).toFixed(2)}</td>
            <td>${(totalGlobalFactura-totalGlobalNota).toFixed(2)}</td>
        </tr>

        <tr >
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td  class="borde">TOTAL Nota Credito</td>
            <td  class="borde">${totalGlobalGravado21Nota.toFixed(2)}</td>
            <td  class="borde">${totalGlobalIva21Nota.toFixed(2)}</td>
            <td  class="borde">${totalGlobalGravado105Nota.toFixed(2)}</td>
            <td  class="borde">${totalGlobalIva105Nota.toFixed(2)}</td>
            <td  class="borde">${totalGlobalNota.toFixed(2)}</td>
        </tr>

        <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td  class="borde">TOTAL Facturas</td>
            <td  class="borde">${totalGlobalGravado21Factura.toFixed(2)}</td>
            <td  class="borde">${totalGlobalIva21Factura.toFixed(2)}</td>
            <td  class="borde">${totalGlobalGravado105Factura.toFixed(2)}</td>
            <td  class="borde">${totalGlobalIva105Factura.toFixed(2)}</td>
            <td  class="borde">${totalGlobalFactura.toFixed(2)}</td>
        </tr>
        <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td class="borde">Gravado</td>
            <td class="borde">Iva 21%</td>
            <td class="borde">Iva 10.5%</td>
            <td class="borde">Total</td>
        </tr>
        <tr>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td class="borde">${(totalGlobalGravado105Factura + totalGlobalGravado21Factura - totalGlobalGravado105Nota - totalGlobalGravado21Nota).toFixed(2)}</td>
            <td class="borde">${(totalGlobalIva21Factura - totalGlobalIva21Nota).toFixed(2)}</td>
            <td class="borde">${(totalGlobalIva105Factura - totalGlobalIva105Nota).toFixed(2)}</td>
            <td class="borde">${((totalGlobalGravado105Factura + totalGlobalGravado21Factura - totalGlobalGravado105Nota - totalGlobalGravado21Nota)+(totalGlobalIva21Factura - totalGlobalIva21Nota)+(totalGlobalIva105Factura - totalGlobalIva105Nota)).toFixed(2)}</td>
        </tr>
    `
}

const listar = async (ventas,diaVentaAnterior)=>{
    let cliente;
    let cond_iva;
    let totalgravado21 = 0;
    let totalgravado105 = 0;
    let totaliva21 = 0;
    let totaliva105 = 0;
    let total = 0

    ventas.sort((a,b)=>{
        if (a.tipo_comp > b.tipo_comp) {
            return 1
        }
        if (a.tipo_comp < b.tipo_comp) {
            return -1
        }
        return 0
    });
    let tipo_comp = ventas[0].tipo_comp;

   for await (let venta of ventas){
        let fecha = new Date(venta.fecha)
        let day = fecha.getDate();
        let month = fecha.getMonth() + 1;
        month = (month===13) ? month + 1 : month;
        day = (day < 10) ? `0${day}` : day;
        month = (month < 10) ? `0${month}` : month;
        let year = fecha.getFullYear();
        
        let cliente = (await axios.get(`${URL}clientes/id/${venta.cliente}`)).data
        cond_iva = (cliente.cond_iva) ? (cliente.cond_iva) : "Consumidor Final";
        gravado105 = venta.gravado105;
        gravado21 = venta.gravado21;
        iva105 = venta.iva105;
        iva21 = venta.iva21;

        
        tbody.innerHTML += await `
            <tr>
                <td>${day}/${month}/${year}</td>
                <td class = "inicio">${venta.nombreCliente}</td>
                <td class = "inicio">${cond_iva}</td>
                <td class = "inicio">${venta.dnicuit ? venta.dnicuit : "00000000"}</td>
                <td class = "inicio">${venta.tipo_comp}</td>
                <td>${venta.nro_comp}</td>
                <td class = "final">${gravado21}</td>
                <td class = "final">${iva21}</td>
                <td class = "final">${gravado105}</td>
                <td class = "final">${iva105}</td>
                <td class = "final">${venta.precioFinal}<td>
            </tr>
        `
        const indexSiguiente = ventas.indexOf(venta) + 1;

        let ventaSiguiente = ventas.find(venta=>ventas.indexOf(venta) === indexSiguiente);
        
        if (venta.tipo_comp === tipo_comp) {
            totalgravado21 +=  venta.gravado21
            totaliva21 +=  venta.iva21
            totalgravado105 +=  venta.gravado105
            totaliva105 +=  venta.iva105
            total +=  venta.precioFinal
        }
        ventaSiguiente = ventaSiguiente ? ventaSiguiente : {}; 
            if (ventaSiguiente.tipo_comp !== tipo_comp) {
                tbody.innerHTML += await `
                <tr class="oscuro">
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>Totales Diarios</td>
                    <td class = "final">${venta.tipo_comp}</td>
                    <td class = "final">${totalgravado21.toFixed(2)}</td>
                    <td class = "final">${totaliva21.toFixed(2)}</td>
                    <td class = "final">${totalgravado105.toFixed(2)}</td>
                    <td class = "final">${totaliva105.toFixed(2)}</td>
                    <td class = "final">${total.toFixed(2)}</td>
                    </tr>
                `
                if (tipo_comp === "Ticket Factura") {
                    totalGlobalGravado105Factura += totalgravado105;
                    totalGlobalGravado21Factura += totalgravado21;
                    totalGlobalIva105Factura += totaliva105;
                    totalGlobalIva21Factura += totaliva21;
                    totalGlobalFactura += total;
                }else{
                    totalGlobalGravado105Nota += totalgravado105;
                    totalGlobalGravado21Nota += totalgravado21;
                    totalGlobalIva105Nota += totaliva105;
                    totalGlobalIva21Nota += totaliva21;
                    totalGlobalNota += total;
                }
                tipo_comp = ventaSiguiente.tipo_comp;
                total = 0
                totalgravado21 = 0
                totaliva21 = 0
                totalgravado105 = 0
                totaliva105 = 0
        }
    };
}

exportar.addEventListener('click',e=>{
    ipcRenderer.send('elegirPath');
    let path = "";
    ipcRenderer.on('mandoPath',(e,args)=>{
        path = args
    
        let wb = XLSX.utils.book_new();

        wb.props = {
            Title: "LibroVentas",
            subject: "test",
            Author: "Electro Avenida"
        };

        let newWS = XLSX.utils.json_to_sheet(ventasExportar);

        XLSX.utils.book_append_sheet(wb,newWS,'LibroVentas');
        XLSX.writeFile(wb,path);
    })
    
});
