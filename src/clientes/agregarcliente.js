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
const moroso = document.formularioCliente.moroso
const observaciones = document.querySelector('#observaciones')
const salir = document.querySelector('.salir')
const saldo = "0"
const saldo_p = "0"
const listaVenta = []
const {ipcRenderer} = require('electron')
nombre.focus()
let condicion = ""


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