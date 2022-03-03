const { ipcRenderer } = require("electron");
const axios = require("axios");
const { DateTime } = require("luxon");
require("dotenv").config;
const URL = process.env.URL;

const nombre = document.querySelector('.nombre')
const direccion = document.querySelector('.direccion')
const telefono = document.querySelector('.telefono')
const buscador = document.querySelector('#buscador');
const tbody = document.querySelector('.tbody');
const saldoActual = document.querySelector('#saldoActual');
const imprimir = document.querySelector('.imprimir')
const desde = document.querySelector('#desde')
const hasta = document.querySelector('#hasta')
const ocultar = document.querySelector('.seccion-buscador')
const volver = document.querySelector('.volver');

const dateNow = new Date()
let day = dateNow.getDate()
let month = dateNow.getMonth() + 1 
let year = dateNow.getFullYear()

day = day < 10 ? `0${day}`: day;
month = month < 10 ? `0${month}`: month;

const date = `${year}-${month}-${day}`

desde.value = date;
hasta.value = date

let situacion = "blanco";
let listaVentas = [];
let saldo = "saldo";
let cliente = {};


buscador.addEventListener('keypress',e=>{
    if (buscador.value === "" && e.key === "Enter") {
        ipcRenderer.send('abrir-ventana-clientesConSaldo',situacion)
    }
})

document.addEventListener('keydown',(event) =>{
    if (event.key === "Alt") {
        document.addEventListener('keydown',(e) =>{
           if (e.key === "F9" && situacion === "blanco") {
               mostrarNegro();
               situacion = 'negro'
               saldo = "saldo_p"
               listarVentas(listaVentas,situacion)
           }
       })
   }
})

document.addEventListener('keydown',(event) =>{
   if (event.key === "Alt") {
        document.addEventListener('keydown',(e) =>{
          if (e.key === "F3" && situacion === "negro") {
              ocultarNegro();
              situacion = 'blanco'
              saldo = "saldo"
              listarVentas(listaVentas,situacion)
          }
        })
  }
})

const ocultarNegro = ()=>{
    const body = document.querySelector('.seccionResumeCuenta')
    body.classList.remove('mostrarNegro')
    ocultar.classList.remove('mostrarNegro')
    volver.classList.remove('mostrarNegro')

}

const mostrarNegro = ()=>{
    const body = document.querySelector('.seccionResumeCuenta') 
    body.classList.add('mostrarNegro')
    ocultar.classList.add('mostrarNegro')
    volver.classList.add('mostrarNegro')
    
}


ipcRenderer.on('mando-el-cliente',async(e,args)=>{
    cliente = JSON.parse(args)
    nombre.innerHTML = cliente.cliente
    direccion.innerHTML = `${cliente.direccion}-${cliente.localidad}`;
    telefono.innerHTML = cliente.telefono;
    const desdeFecha = new Date(desde.value)
    const hastaFecha = DateTime.fromISO(hasta.value).endOf('day')
    let ventas = await axios.get(`${URL}ventas/cliente/${cliente._id}/${desdeFecha}/${hastaFecha}`)
    ventas = ventas.data;
    let presupuestos = await axios.get(`${URL}presupuesto/cliente/${cliente._id}/${desdeFecha}/${hastaFecha}`);
    presupuestos = presupuestos.data;
    nuevaLista = [];
    listaVentas = [...ventas,...presupuestos];
    listarVentas(listaVentas,situacion)
})

function listarVentas(ventas,situacion) {
    ventas.sort(function(a,b){
        console.log(a.fecha > b.fecha)
        if (a.fecha > b.fecha) {
            return 1
        }else if(a.fecha < b.fecha){
            return -1
        }
        return 0
    });
    ventas = ventas.filter(venta=>venta.tipo_pago !== "CD")
    ventas = ventas.filter(venta => {
        if (((venta.tipo_comp === "Presupuesto" || venta.tipo_comp === "Ticket Factura"))) {
            return venta
        }else if((venta.pagado === true) && (venta.tipo_comp === "Recibos" || venta.tipo_comp === "Recibos_P")){
            return venta
        }
    })
    console.log(ventas)
    tbody.innerHTML = ""
    const aux = (situacion === "blanco") ? "Ticket Factura" : "Presupuesto";
    let listaAux = ventas;
    if (aux === "Presupuesto") {
       listaAux = listaAux.filter(e=>{
            return (e.tipo_comp === aux || e.tipo_comp === "Recibos_P")
        })
    }else{
        listaAux = listaAux.filter(e=>{
            return (e.tipo_comp === aux || e.tipo_comp === "Recibos")
        })
    }
    let saldoAnterior = 0
    console.log(listaAux)
    listaAux.forEach(venta =>{
        if (situacion === "negro") {
            saldoAnterior += (venta.tipo_comp === "Presupuesto") ? venta.precioFinal: 0
            let abonado = venta.abonado !== "" ? parseFloat(venta.abonado) : 0
            abonado = venta.precioFinal > parseFloat(venta.abonado) ? 0 : abonado
            saldoAnterior -= (venta.tipo_comp === "Recibos_P") ? venta.precioFinal  - abonado: 0
            console.log(saldoAnterior);
        }else{
            saldoAnterior += (venta.tipo_comp === "Ticket Factura") ? venta.precioFinal: 0
            let abonado = venta.abonado !== "" ? parseFloat(venta.abonado) : 0
            abonado = venta.precioFinal > parseFloat(venta.abonado) ? 0 : abonado
            saldoAnterior -= (venta.tipo_comp === "Recibos") ? venta.precioFinal  - abonado: 0
            console.log(saldoAnterior);
        }
    })
    parseFloat(saldoAnterior.toFixed(2))
    if (situacion === "negro") {
        saldoAnterior = (cliente.saldo_p - saldoAnterior).toFixed(2);
    }else{
        saldoAnterior = (cliente.saldo - saldoAnterior).toFixed(2);
    }
    

        tbody.innerHTML += `<tr><td></td><td></td><td></td><td></td><td>Saldo Anterior</td><td>${saldoAnterior}</td></tr>`
        listaAux.forEach(venta => {
            let haber = 0;
            let debe = 0
            if (situacion === "negro") {
                debe = (venta.tipo_comp === "Presupuesto" && venta.tipo_pago === "CC") ? (parseFloat(venta.precioFinal)) : 0;
                haber = (venta.tipo_comp === "Recibos_P") ? (parseFloat(venta.precioFinal)) : 0;
            }else{
                debe = (venta.tipo_comp === "Ticket Factura" && venta.tipo_pago === "CC") ? (parseFloat(venta.precioFinal)) : 0
                haber =  (venta.tipo_comp === "Recibos") ? (parseFloat(venta.precioFinal)) : 0
            }

            let saldito = parseFloat(saldoAnterior) - haber + debe;
            saldoAnterior = parseFloat(saldoAnterior) - haber + debe;
            const fecha = new Date(venta.fecha);
            const dia = fecha.getDate();
            const mes = fecha.getMonth() + 1;
            const anio = fecha.getUTCFullYear();
           
            
            tbody.innerHTML += `
                <tr>
                    <td>${dia}/${mes}/${anio}</td>
                    <td>${venta.tipo_comp === "Recibos_P" ? "Recibos" : venta.tipo_comp}</td>
                    <td>${venta.nro_comp}</td>
                    <td>${(debe === 0.00) ?  "" : debe.toFixed(2)}</td>
                    <td>${(haber === 0.00) ? "" : haber.toFixed(2)}</td>
                    <td>${(saldito).toFixed(2)}</td>
                </tr>
            `

        });
        if (cliente[saldo] === undefined) {
            saldoActual.value === "0";
        }else{
            saldoActual.value = cliente[saldo];
        }
}

imprimir.addEventListener('click',e=>{
    const header = document.querySelector('header')
    volver.classList.add('disable')
    ocultar.classList.add('disable')
    header.classList.add('m-0')
    header.classList.add('p-0')
    window.print()
    location.reload();
})