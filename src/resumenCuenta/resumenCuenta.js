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

let situacion = "blanco";
let listaVentas = [];
let saldo = "saldo";
let cliente = {};
saldoAnterior_P = 0;
saldoAnterior = 0;


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
               listarVentas(listaVentas,situacion,saldoAnterior,saldoAnterior_P)
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
              listarVentas(listaVentas,situacion,saldoAnterior,saldoAnterior_P)
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
    let cuentas = (await axios.get(`${URL}cuentaHisto/cliente/${cliente._id}`)).data;
    let ventasAnteriores = cuentas.filter(e=>e.fecha < desde.value);
     await ventasAnteriores.forEach(e=>{
        if (e.tipo_comp !== "Recibos_P" && e.tipo_comp !== "Presupuesto") {
            saldoAnterior = (e.tipo_comp === "Ticket Factura" ? (saldoAnterior + e.debe ):  (saldoAnterior - e.haber));
        }
        if (e.tipo_comp !== "Ticket Factura" && e.tipo_comp !== "Recibos") {
            console.log(e.debe);
            console.log(e.haber);
            saldoAnterior_P = e.tipo_comp === "Presupuesto" ? (saldoAnterior_P + e.debe ) : (saldoAnterior_P - e.haber);
        }
    })
    cuentas = cuentas.filter(e=> {
        return (e.fecha >= desde.value)
    });
    nuevaLista = [];
    listaVentas = cuentas;
    console.log(saldoAnterior_P)
    listarVentas(listaVentas,situacion,saldoAnterior,saldoAnterior_P)
})

function listarVentas(ventas,situacion,saldoAnterior,saldoAnterior_P) {
    console.log(saldoAnterior_P)
    tbody.innerHTML = "";
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
    let saldoAnteriorFinal = situacion === "blanco" ? saldoAnterior : saldoAnterior_P;
        tbody.innerHTML += `<tr><td></td><td></td><td></td><td></td><td>Saldo Anterior</td><td>${saldoAnteriorFinal}</td></tr>`
        listaAux.forEach(venta => {
            const fecha = new Date(venta.fecha);
            const dia = fecha.getDate();
            const mes = fecha.getMonth() + 1;
            const anio = fecha.getUTCFullYear();
           
            tbody.innerHTML += `
                <tr>
                    <td>${dia}/${mes}/${anio}</td>
                    <td>${venta.tipo_comp === "Recibos_P" ? "Recibos" : venta.tipo_comp}</td>
                    <td>${venta.nro_comp}</td>
                    <td>${(venta.debe === 0.00) ?  "" : venta.debe.toFixed(2)}</td>
                    <td>${(venta.haber === 0.00) ? "" : venta.haber.toFixed(2)}</td>
                    <td>${(venta.saldo).toFixed(2)}</td>
                </tr>
            `

        });
        if (cliente[saldo] === undefined) {
            saldoActual.value = "0";
        }else{
            saldoActual.value = (parseFloat(cliente[saldo])).toFixed(2);
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