const { ipcRenderer } = require("electron")
const axios = require("axios");
require("dotenv").config;
const URL = process.env.URL;

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
const conFact = document.querySelector('#conFact')
const observaciones = document.querySelector('#observaciones')
const saldo = document.querySelector('#saldo')
const saldo_p = document.querySelector('#saldo_p')
let _id = ""
let condicion
let acceso
let situacion = "blanco"

document.addEventListener('keydown',(event) =>{
    if (event.key === "Alt") {
       document.addEventListener('keydown',(e) =>{
           if (e.key === "F9" && situacion === "blanco") {
               mostrarNegro();
               situacion = "negro"
           }
       })
   }
})

document.addEventListener('keydown',(event) =>{
    if (event.key === "Alt") {
       document.addEventListener('keydown',(e) =>{
           if (e.key === "F3" && situacion === "negro") {
               ocultarNegro();
               situacion = "blanco"
           }
       })
   }
})
const mostrarNegro = ()=>{
    const saldo_pDIV = document.querySelector('.saldo_p')
    saldo_pDIV.classList.remove('none')
}

const ocultarNegro = ()=>{
    const saldo_pDIV = document.querySelector('.saldo_p')
    saldo_pDIV.classList.add('none')
}


ipcRenderer.on('datos-clientes',(e,args)=>{
    cliente = JSON.parse(args)[0];
    acceso = JSON.parse(args)[1];


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
    saldo.value = cliente.saldo;
    saldo_p.value = cliente.saldo_p;
})


const modificar = document.querySelector('.modificar')
modificar.addEventListener('click', (e)=>{
    e.preventDefault()
    modificar.classList.add('none')
    const inputs = document.querySelectorAll('input')
    const selects = document.querySelector('#conIva')
        selects.toggleAttribute('disabled')
        acceso !== "0" ? conFact.setAttribute('disabled',"") : conFact.removeAttribute('disabled');
    for(let input of inputs){ 
        input.toggleAttribute('disabled')
}
})

const nuevoCliente = {}
const guardar = document.querySelector('.guardar')
guardar.addEventListener('click',async e =>{
    for(let i of moroso){
        i.checked && (condicion=i.value)
    }
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
    nuevoCliente.condicion = condicion
    nuevoCliente.cond_fact = conFact.value 
    nuevoCliente.lim_compra = parseFloat(limite.value) 
    console.log(nuevoCliente)
    await axios.put(`${URL}clientes/${nuevoCliente._id}`,nuevoCliente);
    window.close()
})


const salir = document.querySelector('.salir')
salir.addEventListener('click',()=>{
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
        conIva.focus()
    }
})

conIva.addEventListener('keypress',e=>{
    e.preventDefault()
    if (e.key === "Enter") {
        direccion.focus()
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
        dnicuit.focus()
    }
})
direccion.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        localidad.focus()
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
conFact.addEventListener('keypress',e=>{
    e.preventDefault()
    if (e.key === "Enter") {
        console.log(moroso[0]);
        moroso[0].focus()
    }
})

moroso[0].addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        observaciones.focus()
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