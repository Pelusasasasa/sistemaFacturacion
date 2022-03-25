const { ipcRenderer } = require("electron")

const Afip = require('@afipsdk/afip.js');
const afip = new Afip({ CUIT: 27165767433 });

const tipoConexion = require('./config.js');
ipcRenderer.send('abrir-menu');
const axios = require("axios");
require("dotenv").config;
const URL = process.env.URL;
const Dialogs = require("dialogs");
const dialogs = Dialogs()
let vendedores = []
const traerVendedores = async()=>{
    vendedores = await axios.get(`${URL}usuarios`);
    vendedores=vendedores.data;
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

const min = document.querySelector('#min');
min.addEventListener('click',e=>{
    ipcRenderer.send('minimizar');
})

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
function validacionUsuario(texto) {
    dialogs.promptPassword("Contraseña").then(value=>{
        if (value === undefined) {
            location.reload()
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
                alert("Contraseña incorrecta")
                validacionUsuario(texto)
            }
        }
       })
       .catch(()=>{
        location.reload()
       })
}

ipcRenderer.on("validarUsuario",(e,args)=>{

        dialogs.promptPassword("Contraseña",value=>{
            if (value === undefined) {
                location.reload();
            }else{
                vendedores.forEach(e=>{
                    value === e._id && (vendedor=e.nombre)
                    value === e._id && (acceso = e.acceso)
                    
                })
                if(vendedor !== undefined){ 
                    if (JSON.parse(args) === "ValidarUsuario") {
                        ipcRenderer.send('abrir-ventana',`usuarios?${acceso}?${vendedor}`)
                    }else if (JSON.parse(args) === "aumPorPorcentaje" ) {
                        (acceso === "0") ? ipcRenderer.send('abrir-ventana',`conexion?${acceso}`) : alert("No tiene permisos")
                    }

                }else{
                    alert("Contraseña incorrecta").then(()=>{
                        validacionUsuario(texto)
                    })
            }}
        })
})

const salir = document.querySelector('.salir');
salir.addEventListener('click',async e=>{
    const lastVoucher = await afip.ElectronicBilling.getLastVoucher(5,1); //Devuelve el número del último comprobante creado para el punto de venta 1 y el tipo de comprobante 6 (Factura B)
    console.log(lastVoucher);

    const voucherInfo = await afip.ElectronicBilling.getVoucherInfo(16,5,1); //Devuelve la información del comprobante 1 para el punto de venta 1 y el tipo de comprobante 6 (Factura B)

        if(voucherInfo === null){
            console.log('El comprobante no existe');
        }
        else{
            console.log('Esta es la información del comprobante:');
            console.log(voucherInfo);
        }
    // window.close();
})