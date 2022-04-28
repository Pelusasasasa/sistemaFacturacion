
const tbody = document.querySelector('.tbody')
let situacion = "blanco";
let Clientes = {}
const axios = require("axios");
require("dotenv").config;
const URL = process.env.URL;

document.addEventListener('keydown',(event) =>{
    if (event.key === "Alt") {
       document.addEventListener('keydown',(e) =>{
           if (e.key === "F9" && situacion === "blanco") {
               mostrarNegro();
               situacion = 'negro';
               mostrarLista(Clientes);
           }
       })
   }
})
document.addEventListener('keydown',(event) =>{
    if (event.key === "Alt") {
       document.addEventListener('keydown',(e) =>{
           if (e.key === "F3" && situacion === "negro") {
               ocultarNegro();
               situacion = 'blanco';
               mostrarLista(Clientes);
           }
       })
   }
 })
const saldoP = document.querySelector('.saldoP')
 const ocultarNegro = ()=>{
    saldoP.classList.add('none')
}

const mostrarNegro = ()=>{
    saldoP.classList.remove('none')
}

const traerSaldo = async()=>{
    Clientes = (await axios.get(`${URL}clientes`)).data;
    Clientes.sort((a,b)=>{
        if (a.cliente<b.cliente) {
            return -1;
        }else if(a.cliente>b.cliente){
            return 0;
        }
        return 0;
    })
    mostrarLista(Clientes)
}
traerSaldo()

const descargar = document.querySelector('.descargar')
const tabla = document.querySelector('#tabla')

descargar.addEventListener('click',e=>{
    descargar.classList.add('none')
    window.print()
    descargar.classList.remove('none')
})

document.addEventListener('keyup',e=>{
    if (e.key === "Escape") {
        window.close()
    }
})

const mostrarLista = (clientes)=>{
    tbody.innerHTML = ""
    clientes.forEach(cliente => {
        if (situacion === "blanco" && parseFloat(cliente.saldo) !== 0) {
            tbody.innerHTML += `
            <tr>
                <td class = "id">${cliente._id}</td>
                <td class ="nombre">${cliente.cliente}</td>
                <td>${cliente.direccion}</td>
                <td>${cliente.cond_iva}</td>
                <td>${cliente.telefono}</td>
                <td>${cliente.saldo}</td>
            </tr>
        `
        }else if(situacion === "negro"){
            tbody.innerHTML += `
                <tr>
                    <td class = "id">${cliente._id}</td>
                    <td>${cliente.cliente}</td>
                    <td>${cliente.direccion}</td>
                    <td>${cliente.cond_iva}</td>
                    <td>${cliente.telefono}</td>
                    <td>${cliente.saldo}</td>
                    <td>${cliente.saldo_p}</td>
                </tr>
            `
        }
    });
}