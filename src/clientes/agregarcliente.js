const Dialogs = require("dialogs");
const dialogs = Dialogs()



const botonEnviar = document.querySelector('#boton-enviar')
const nombre = document.querySelector('#nombre')
const localidad = document.querySelector('#localidad')
const direccion = document.querySelector('#direccion')
const telefono = document.querySelector('#telefono')
const provincia = document.querySelector('#provincia')
const cod_postal = document.querySelector('#cod_postal')
const email = document.querySelector('#email')
const dnicuit = document.querySelector('#dnicuit')
const conIva = document.querySelector('#conIva')
const condicionFacturacion = document.querySelector('#conFac')
const limite = document.querySelector('#limite')

const moroso = document.querySelectorAll('input[name="moroso"]')
const observaciones = document.querySelector('#observaciones')
const salir = document.querySelector('.salir')
const saldo = "0"
const saldo_p = "0"
const listaVenta = []
const {ipcRenderer} = require('electron');
const { default: cuitValidator } = require("cuit-validator");
nombre.focus()
let condicion = ""
const normal = document.querySelector('input[name=moroso]')

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
        console.log(conIva.value);
        if((dnicuit.value.length !== 11 && conIva.value !== "Consumidor Final") || (dnicuit.value.length !== 8 && conIva.value === "Consumidor Final")){
            alert("El dni o cuit no es Valido")
        }else{
            if(!cuitValidator(dnicuit.value) && dnicuit.value.length === 11){
                alert("El cuit no es valido");
                dnicuit.value = "";
                dnicuit.focus();
            }else{
                email.focus();
            }
        }
    }
})

email.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        telefono.focus()
    }
})

observaciones.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        botonEnviar.focus()
    }
})


telefono.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        limite.focus()
    }
})

limite.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        condicionFacturacion.focus()
    }
})
condicionFacturacion.addEventListener('keypress',e=>{
    e.preventDefault()
    if (e.key === "Enter") {
        normal.focus()
    }
})

normal.addEventListener('keypress',e=>{
    e.preventDefault()
    if (e.key === "Enter") {
        observaciones.focus()
    }
})


botonEnviar.addEventListener('click',async e =>{
    for(let i of moroso){

        i.checked && (condicion = i.value  )
    }

    if (condicion === "Moroso") {
        condicion = "M";
    }else{
        condicion = "N";
    }
    e.preventDefault();
    const cliente = {
        cliente: nombre.value,
        localidad: localidad.value,
        direccion: direccion.value,
        provincia: provincia.value,
        cod_postal: cod_postal.value,
        telefono: telefono.value,
        cuit: dnicuit.value,
        mail: email.value,
        cond_iva: conIva.value,
        saldo: saldo.value,
        limite: limite.value,
        condicion: condicion,
        saldo_p: saldo_p.value,
        cond_fact: condicionFacturacion.value,
        observacion: observaciones.value,
        listaVenta: listaVenta.value
    }
    ipcRenderer.send('nuevo-cliente',cliente);
    window.close()
    
});

document.addEventListener('keydown',(e)=>{
    if (e.key === "Escape") {
        window.close()
    }
})


salir.addEventListener('click',e=>{
    window.close()
})