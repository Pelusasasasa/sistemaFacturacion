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
    tbody.innerHTML = "";
    const desdeFecha = new Date(desde.value)
    let hastaFecha = DateTime.fromISO(hasta.value).endOf('day');
    let ventas = (await axios.get(`${URL}ventas/${desdeFecha}/${hastaFecha}`)).data;
    ventas = ventas.filter(venta=>venta.tipo_comp !== "Recibos");
    ventas = ventas.filter(venta => venta.tipo_comp !== "Recibos_P");
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
    
    let diaVentaAnterior = new Date((ventas[0].fecha)).getDate();
    diaVentaAnterior = diaVentaAnterior < 10 ? `0${diaVentaAnterior}` : diaVentaAnterior;
    let ventasHoy = [];
   for await(let venta of ventas){
        
        if (new Date(venta.fecha).getDate() === diaVentaAnterior + 1) {
            console.log(ventasHoy)
            await listar(ventasHoy,diaVentaAnterior)
            ventasHoy = [];
            diaVentaAnterior = new Date(venta.fecha).getDate();
            ventasHoy.push(venta);
        }else{
            ventasHoy.push(venta);
        }
    };
     listar(ventasHoy)
}

const listar = async (ventas,diaVentaAnterior)=>{
    let cliente;
    let cond_iva;
    let totalgravado21 = 0;
    let totalgravado105 = 0;
    let totaliva21 = 0;
    let totaliva105 = 0;
    let total = 0
    let tamanioVentas = ventas.length - 1;
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
                <td class = "inicio">${cliente.cuit}</td>
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
                tipo_comp = ventaSiguiente.tipo_comp;
                total = 0
                totalgravado21 = 0
                totaliva21 = 0
                totalgravado105 = 0
                totaliva105 = 0
        }
    };
}
