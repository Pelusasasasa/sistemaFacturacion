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
const moroso = document.querySelectorAll('input[name="moroso"]')
const conFact = document.querySelector('#conFact   ')
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
    conFact.value = cliente.cond_fact
    observaciones.value = cliente.observacion
    conIva.value = cliente.cond_iva
})


const modificar = document.querySelector('.modificar')
modificar.addEventListener('click', (e)=>{
    e.preventDefault()
    const inputs = document.querySelectorAll('input')
    const selects = document.querySelectorAll('select')
    for(let select of selects){
        select.toggleAttribute('disabled')
    }
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

function selecciona_value(idInput) {
    valor_input = document.getElementById(idInput).value;
    longitud = valor_input.length;
    var selectionEnd = 0 + 1;
    if (document.getElementById(idInput).setSelectionRange) {
    document.getElementById(idInput).focus();
    document.getElementById(idInput).setSelectionRange (0, longitud);
    }
    else if (input.createTextRange) {
    var range = document.getElementById(idInput).createTextRange() ;
    range.collapse(true);
    range.moveEnd('character', 0);
    range.moveStart('character', longitud);
    range.select();
    }
    }

nombre.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        localidad.focus()
    }
})

localidad.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        provincia.focus()
    }
})

provincia.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        cod_postal.focus()
    }
})
cod_postal.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        direccion.focus()
    }
})
direccion.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        dnicuit.focus()
    }
})

dnicuit.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        email.focus()
    }
})

email.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        telefono.focus()
    }
})

telefono.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        limite.focus()
    }
})

limite.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        conFact.focus()
    }
})

observaciones.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        guardar.focus()
    }
})

nombre.addEventListener('focus',e=>{
    selecciona_value(nombre.id)
})
localidad.addEventListener('focus',e=>{
    selecciona_value(localidad.id)
})
provincia.addEventListener('focus',e=>{
    selecciona_value(provincia.id)
})
cod_postal.addEventListener('focus',e=>{
    selecciona_value(cod_postal.id)
})
direccion.addEventListener('focus',e=>{
    selecciona_value(direccion.id)
})
dnicuit.addEventListener('focus',e=>{
    selecciona_value(dnicuit.id)
})
email.addEventListener('focus',e=>{
    selecciona_value(email.id)
})
telefono.addEventListener('focus',e=>{
    selecciona_value(telefono.id)
})
limite.addEventListener('focus',e=>{
    selecciona_value(limite.id)
})
observaciones.addEventListener('focus',e=>{
    selecciona_value(observaciones.id)
})