const { ipcRenderer } = require("electron")


ipcRenderer.send('abrir-menu');
const axios = require("axios");
require("dotenv").config;
const URL = process.env.URL;
let vendedores = [];
const traerVendedores = async()=>{
    vendedores = (await axios.get(`${URL}usuarios`)).data;
};
traerVendedores();

const listaPedidos = document.querySelector('.listaPedidos')
const body = document.querySelector('body')
const emitirComprobante = document.querySelector('.emitirComprobante')
const pedidos = document.querySelector('#pedidos');
const emitirRecibo = document.querySelector('.emitirRecibo');
const resumenCuenta = document.querySelector('.resumenCuenta');
const notaCredito = document.querySelector('.notaCredito');
const productos = document.querySelector('.productos');
const clientes = document.querySelector('.clientes');
const flecha = document.querySelector('.flecha')

listaPedidos.addEventListener('click', (e) =>{
    const handlePedidos = document.querySelector('.handlePedidos')
    handlePedidos.classList.toggle('disable')
    flecha.classList.toggle('abajo')
    flecha.classList.toggle('arriba')
})


productos.addEventListener('click',e=>{
    validacionUsuario("productos/productos.html");
})

clientes.addEventListener('click',e=>{
    validacionUsuario("clientes/clientes.html")
})

emitirComprobante.addEventListener('click',e=>{
    validacionUsuario("emitirComprobante/emitirComprobante.html")
})

pedidos.addEventListener('click',e=>{
    validacionUsuario("pedidos/pedidos.html")
})

emitirRecibo.addEventListener('click',e=>{
    validacionUsuario("emitirRecibo/emitirRecibo.html")
})

resumenCuenta.addEventListener('click',e=>{
    window.location = 'resumenCuenta/resumenCuenta.html';
    ipcRenderer.send('cerrar-menu');
})

notaCredito.addEventListener('click',e=>{
    validacionUsuario("emitirComprobante/emitirNotaCredito.html")
})


body.addEventListener('keydown',e=>{
    if (e.key === "F1") {
        validacionUsuario("emitirComprobante/emitirComprobante.html")
    }else if (e.key === "F2") {
        window.location = "productos/productos.html";
    }else if(e.key === "F4"){
        validacionUsuario("pedidos/pedidos.html")
    }else if(e.key === "F3"){
        window.location = "clientes/clientes.html"
    }
})

let vendedor
let acceso
let empresa
const sweet = require('sweetalert2');
async function validacionUsuario(texto) {
    sweet.fire({
                title:"Contrase??a",
                input:"password",
                showCancelButton: true,
                width:600,
                size:"2rem",
                confirmButtonText: 'Aceptar',
                inputAttributes:{
                    autofocus: "on"
                }
             })
             .then(async ({value})=>{
                console.log(value)
                if (value === "" || value === undefined) {
                    location.reload();
                }else{
                    vendedores.forEach(e=>{
                        value === e._id && (vendedor=e.nombre)
                        value === e._id && (acceso = e.acceso)
                        value === e._id && (empresa = e.empresa)
                    })
                    if(vendedor !== undefined){ 
                        window.location = `${texto}?vendedor=${vendedor}&acceso=${acceso}&empresa=${empresa}`;
                        ipcRenderer.send('cerrar-menu');
                    }else{
                        await sweet.fire({
                            title:"Contrase??a incorrecta"
                        })
                        validacionUsuario(texto)
                    }
                }
       })
       .catch(()=>{
        location.reload()
       })
}

ipcRenderer.on("validarUsuario",(e,args)=>{

        sweet.fire({
            title: "Contrase??a",
            input: "password",
            showCancelButton:true,
            confirmButtonText:"Aceptar"
        }).then(async ({isConfirmed,value})=>{
            if (isConfirmed && value !== "") {
                const usuario = (await axios.get(`${URL}usuarios/${value}`)).data;
                let vendedor;
                let acceso;
                if (usuario !== "") {
                    vendedor = usuario.nombre;
                    acceso = usuario.acceso;
                    if (JSON.parse(args) === "ValidarUsuario") {
                        ipcRenderer.send('abrir-ventana',`usuarios?${acceso}?${vendedor}`)
                    }else if(JSON.parse(args) === "aumPorPorcentaje"){
                        (acceso === "0") ? ipcRenderer.send('abrir-ventana',`conexion?${acceso}`) : await sweet.fire({title:"No tiene permisos"})
                    }else if(JSON.parse(args) === "arreglarSaldo"){
                        if (acceso !== "0") {
                            sweet.fire({
                                title:"No tiene permisos",

                            })
                        }else{
                            ipcRenderer.send('abrir-ventana',`clientes/arreglarSaldo.html`);
                        }
                        
                    }
                }else{
                    sweet.fire({title:"Contrase??a Incorrecta"})
                }
            }
        })
})

const salir = document.querySelector('.salir');
salir.addEventListener('click',async e=>{
    sweet.fire({
        title:"Desea Salir ?",
        showCancelButton:true,
        confirmButtonText:"Aceptar",
    }).then(({isConfirmed}) =>{
        if (isConfirmed) {
            window.close();
        }
    })
})
