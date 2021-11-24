const { ipcRenderer } = require("electron")
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

listaPedidos.addEventListener('click', (e) =>{
    const handlePedidos = document.querySelector('.handlePedidos')
    handlePedidos.classList.toggle('disable')
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


body.addEventListener('keydown',e=>{
    if (e.key === "F1") {
        validacionUsuario("emitirComprobante/emitirComprobante.html")
    }else if (e.key === "F2") {
        window.open = "emitirComprobante/productos.html"
    }else if(e.key === "F4"){
        validacionUsuario("pedidos/pedidos.html")
    }
})

let vendedor
function validacionUsuario(texto) {
    dialogs.promptPassword("Contraseña").then(value=>{
        vendedores.forEach(e=>{
            value === e._id && (vendedor=e.nombre)
        })

        if(typeof vendedor !== "undefined"){ 
             window.location = `${texto}?vendedor=${vendedor}`
        }else{
            dialogs.alert("Contraseña incorrecta").then(()=>{
                validacionUsuario(texto)
            })
            document.querySelector('.ok').focus()

        }
       })
       .catch(()=>{
        location.reload()
       })
}