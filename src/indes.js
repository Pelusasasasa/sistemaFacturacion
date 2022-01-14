const { ipcRenderer } = require("electron")
const tipoConexion = require('./config.js')

const Dialogs = require("dialogs");
const Driver = require("driver.js");
const dialogs = Dialogs()
let vendedores = []
ipcRenderer.send('traerUsuarios')
ipcRenderer.on('traerUsuarios',(e,args)=>{
    vendedores = JSON.parse(args)
})

const listaPedidos = document.querySelector('.listaPedidos')
const body = document.querySelector('body')
const emitirComprobante = document.querySelector('.emitirComprobante')
const pedidos = document.querySelector('#pedidos')
const emitirRecibo = document.querySelector('.emitirRecibo')
const resumenCuenta = document.querySelector('.resumenCuenta')
const notaCredito = document.querySelector('.notaCredito')
const productos = document.querySelector('.productos')

const flecha = document.querySelector('.flecha')
listaPedidos.addEventListener('click', (e) =>{
    const handlePedidos = document.querySelector('.handlePedidos')
    handlePedidos.classList.toggle('disable')
    flecha.classList.toggle('abajo')
    flecha.classList.toggle('arriba')
})


productos.addEventListener('click',e=>{
    validacionUsuario("productos/productos.html")
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
    window.location = 'resumenCuenta/resumenCuenta.html'
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
                window.location = `${texto}?vendedor=${vendedor}&acceso=${acceso}&empresa=${empresa}`
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
                    }else if (JSON.parse(args) === "Conexion" ) {
                        (acceso === "0") ? ipcRenderer.send('abrir-ventana',`conexion?${acceso}`) : alert("No tiene permisos")
                    }

                }else{
                    alert("Contraseña incorrecta").then(()=>{
                        validacionUsuario(texto)
                    })
            }}
        })
})