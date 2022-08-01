const { ipcRenderer } = require("electron");
const sweet = require('sweetalert2');
const axios = require("axios");
const { DateTime } = require("luxon");
require("dotenv").config;
const URL = process.env.URL;

const nombre = document.querySelector('.nombre')
const direccion = document.querySelector('.direccion')
const telefono = document.querySelector('.telefono')
const buscador = document.querySelector('#buscador');
const tbody = document.querySelector('.tbody');
const imprimir = document.querySelector('.imprimir')
const desde = document.querySelector('#desde')
const ocultar = document.querySelector('.seccion-buscador')
const volver = document.querySelector('.volver');
const saldoImprimir = document.querySelector('.saldoImprimir');
const nombreCliente = document.querySelector('#nombreCliente');


const dateNow = new Date()
let day = dateNow.getDate()
let month = dateNow.getMonth() + 1 
let year = dateNow.getFullYear()

day = day < 10 ? `0${day}`: day;
month = month < 10 ? `0${month}`: month;

const date = `${year}-${month}-01`;
desde.value = date;

let situacion = "blanco";
let listaVentas = [];
let saldo = "saldo";
let cliente = {};
saldoAnterior_P = 0;
saldoAnterior = 0;

desde.addEventListener('keypress',e=>{
    if ((e.key === "Enter")) {
        buscador.focus();
    }
})

buscador.addEventListener('keypress',async e=>{
    if (e.key === "Enter") {
        if (buscador.value === "") {
            ipcRenderer.send('abrir-ventana-clientesConSaldo',situacion)
        }else{
            cliente = (await axios.get(`${URL}clientes/clienteConSaldo/${buscador.value.toUpperCase()}`)).data;
            if (cliente !== "") {
                buscador.value = cliente._id;
                nombreCliente.value = cliente.cliente;
                ponerDatos(cliente);
            }else{
                await sweet.fire({
                    title:"Cliente No encontrado"
                })
            }
        }
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
const ponerDatos = async(cliente)=>{
    nombre.innerHTML = cliente.cliente + "&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp" + cliente._id
    direccion.innerHTML = `${cliente.direccion}-${cliente.localidad}`;
    telefono.innerHTML = cliente.telefono;
    let cuentas = (await axios.get(`${URL}cuentaHisto/cliente/${cliente._id}`)).data;
    let ventasAnteriores = cuentas.filter(e=>e.fecha < desde.value);
    //Aca vemos si ya debia algo del progama viejo
    ventasAnteriores = ventasAnteriores.reverse();
    const primerHistoP = ventasAnteriores.find(venta =>venta.tipo_comp === "Presupuesto" || venta.tipo_comp === "Recibos_P");
    const primerHisto = ventasAnteriores.find(venta =>venta.tipo_comp === "Ticket Factura" || venta.tipo_comp === "Recibos"  || venta.tipo_comp === "Nota Credito");
    saldoAnterior_P = primerHistoP ? primerHistoP.saldo : 0;
    saldoAnterior = primerHisto ? primerHisto.saldo : 0;
    cuentas = cuentas.filter(e=> {
        return (e.fecha >= desde.value)
    });
    nuevaLista = [];
    listaVentas = cuentas;

    listarVentas(listaVentas,situacion,saldoAnterior,saldoAnterior_P)
}

ipcRenderer.on('mando-el-cliente',async(e,args)=>{
    cliente = (await axios.get(`${URL}clientes/id/${args}`)).data;
    ponerDatos(cliente)
})

function listarVentas(ventas,situacion,saldoAnterior,saldoAnterior_P) {
    tbody.innerHTML = "";
    const aux = (situacion === "blanco") ? "Ticket Factura" : "Presupuesto";
    let listaAux = ventas;
    if (aux === "Presupuesto") {
       listaAux = listaAux.filter(e=>{
            return (e.tipo_comp === aux || e.tipo_comp === "Recibos_P")
        })
    }else{
        listaAux = listaAux.filter(e=>{
            return (e.tipo_comp === aux || e.tipo_comp === "Recibos" || e.tipo_comp === "Nota Credito")
        })
    };
    
    let saldoAnteriorFinal = situacion === "blanco" ? saldoAnterior : saldoAnterior_P;
        tbody.innerHTML += `<tr><td></td><td></td><td></td><td></td><td>Saldo Anterior</td><td>${saldoAnteriorFinal.toFixed(2)}</td></tr>`
        listaAux = situacion==="negro" ? listaAux.filter(venta=> (venta.tipo_comp !== "Recibos_P" || venta.haber !== 0)) : listaAux.filter(venta=> (venta.tipo_comp !== "Recibos" || venta.haber !== 0))
        listaAux.forEach(venta => {
            const fecha = new Date(venta.fecha);
            const dia = fecha.getDate();
            const mes = fecha.getMonth() + 1;
            const anio = fecha.getUTCFullYear();
            let comprobante = venta.tipo_comp;

            if (venta.tipo_comp === "Ticket Factura") {
                comprobante = cliente.cond_iva === "Inscripto" ? "Factura A" : "Factura B";
            }else if(venta.tipo_comp === "Nota Credito"){
                comprobante = cliente.cond_iva === "Inscripto" ? "Nota Credito A" : "Nota Credito B";
            }else if(venta.tipo_comp === "Recibos"){
                comprobante = cliente.cond_iva === "Inscripto" ? "Recibos A" : "Recibos B"
            }

            tbody.innerHTML += `
                <tr>
                    <td>${dia}/${mes}/${anio}</td>
                    <td>${comprobante}</td>
                    <td>${venta.nro_comp}</td>
                    <td>${(venta.debe === 0.00) ?  "" : venta.debe.toFixed(2)}</td>
                    <td>${(venta.haber === 0.00) ? "" : venta.haber.toFixed(2)}</td>
                    <td>${(venta.saldo).toFixed(2)}</td>
                </tr>
            `

        });
        console.log(cliente)
        if (cliente[saldo] === undefined) {
            saldoImprimir.innerHTML = "0.00"
        }else{
            saldoImprimir.innerHTML = (parseFloat(cliente[saldo])).toFixed(2);
        }
}

imprimir.addEventListener('click',e=>{
    const header = document.querySelector('header')
    volver.classList.add('disable');
    ocultar.classList.add('disable');
    header.classList.add('m-0');
    header.classList.add('p-0');
    window.print()
    location.reload();
})