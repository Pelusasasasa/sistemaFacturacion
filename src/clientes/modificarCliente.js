const { ipcRenderer } = require("electron")

const nombre = document.querySelector('#nombre')
const localidad = document.querySelector('#localidad')
const direccion = document.querySelector('#direccion')
const telefono = document.querySelector('#telefono')
const provincia = document.querySelector('#provincia')
const cod_postal = document.querySelector('#cod_postal')
const email = document.querySelector('#email')
const dnicuit = document.querySelector('#dnicuit')
const conIva = document.querySelector('#conIva')
const limite = document.querySelector('#limite')
const moroso = document.formularioCliente.moroso
const condicionFacturacion = document.querySelector('#condicionFacturacion')
const observaciones = document.querySelector('#observaciones')
let _id = ""
let condicion

ipcRenderer.on('datos-clientes',(e,args)=>{
    cliente = JSON.parse(args)
    for(let i of moroso){
        if (i.value===cliente.condicion) {
            (condicion=cliente.condicion)
            i.setAttribute('checked',"")
        } 
    }
    _id = cliente._id
    nombre.value = cliente.cliente
    direccion.value = cliente.direccion
    localidad.value = cliente.localidad
    telefono.value = cliente.telefono
    provincia.value = cliente.provincia
    email.value = cliente.mail
    cod_postal.value = cliente.cod_postal
    dnicuit.value = cliente.cuit
    moroso.value = condicion
    condicionFacturacion.value = cliente.cond_fact
    observaciones.value = cliente.observacion
    conIva.value = cliente.cond_iva
})


const modificar = document.querySelector('.modificar')
modificar.addEventListener('click', (e)=>{
    e.preventDefault()
    const inputs = document.querySelectorAll('input')
    const select = document.querySelector('select')
    select.toggleAttribute('disabled')
    for(let input of inputs){ 
        input.toggleAttribute('disabled')
}
})

const nuevoCliente = {}
const guardar = document.querySelector('.guardar')
guardar.addEventListener('click',e =>{
    for(let i of moroso){
        i.checked && (condicion=i.value)
    }
    console.log(condicion)
    e.preventDefault()
    nuevoCliente._id = _id
    nuevoCliente.cliente = nombre.value 
    nuevoCliente.direccion = direccion.value    
    nuevoCliente.localidad =  localidad.value 
    nuevoCliente.telefono = telefono.value 
    nuevoCliente.provincia = provincia.value 
    nuevoCliente.mail = email.value 
    nuevoCliente.cod_postal = cod_postal.value 
    nuevoCliente.cuit =  dnicuit.value 
    nuevoCliente.cond_iva = conIva.value 
    nuevoCliente.observacion = observaciones.value
    console.log(condicion)
    nuevoCliente.condicion = condicion
    nuevoCliente.cond_fact = condicionFacturacion.value 
    nuevoCliente.lim_compra = limite.value 
    console.log(nuevoCliente)
    ipcRenderer.send('modificarCliente',nuevoCliente)
    window.close()
})


const salir = document.querySelector('.salir')
salir.addEventListener('click',()=>{
    window.close()
})

const eliminar = document.querySelector('.eliminar')

eliminar.addEventListener('click',(e)=>{
    e.preventDefault()
    ipcRenderer.send('eliminar-cliente',_id)
    window.close()
})

const doc = document
doc.addEventListener('keydown',e=>{
    if (e.key==="Escape") {
        window.close()
    }
})