const { ipcRenderer } = require("electron");

async function a(){
    const a = await afip.RegisterScopeThirteen.getTaxpayerDetails(20416305847);
    console.log(a)
}
const inputs = document.querySelectorAll('input');
const modificar = document.querySelector('#modificar')
const cancelar = document.querySelector('#cancelar')

modificar.addEventListener('click' , (e) => {
    e.preventDefault();
    if (modificar.classList.contains("desabilitado")) {
        modificar.classList.add("habilitado")
        modificar.classList.remove("desabilitado")
        inputs.forEach(input => {
            input.removeAttribute("disabled")
        })
    }else{
        modificar.classList.remove("habilitado")
        modificar.classList.add("desabilitado")
        inputs.forEach(input => {
            input.setAttribute("disabled","")
        })
        guardarDatos();
    }

})
const facturaA = document.querySelector('#facturaA')
const facturaB = document.querySelector('#facturaB')
const creditoA = document.querySelector('#creditoA')
const creditoB = document.querySelector('#creditoB')
const debitoA = document.querySelector('#debitoA')
const debitoB = document.querySelector('#debitoB')
const recibo = document.querySelector('#recibo')
const presupuesto= document.querySelector('#presupuesto')
const remito= document.querySelector('#remito')
const remitoC= document.querySelector('#remitoC')
const remitoCorriente = document.querySelector('#remitoCorriente')
const dolar = document.querySelector('#dolar')


function guardarDatos() {    
    const numeros = {
        "Ultima Factura A": facturaA.value,
        "Ultima Factura B": facturaB.value,
        "Ultima N Credito A":creditoA.value,
        "Ultima N Credito B":creditoB.value,
        "Ultima N Debito A":debitoA.value,
        "Ultima N Debito B":debitoB.value,
        "Ultimo Recibo": recibo.value,
        "Ultimo Presupuesto":presupuesto.value,
        "Ultimo Remito": remito.value,
        "Ultimo Remito Contado": remitoC.value,
        "Ultimo Remito Cta Cte": remitoCorriente.value,
        "dolar":dolar.value
    }
     ipcRenderer.send('enviar-numero',numeros);
}

ipcRenderer.send('recibir-numeros')

ipcRenderer.on('numeros-enviados',(e,args)=>{
    const numeros = JSON.parse(args)
    facturaA.value = numeros["Ultima Factura A"];
    facturaB.value =numeros["Ultima Factura B"]
    creditoA.value =numeros["Ultima N Credito A"]
    creditoB.value =numeros["Ultima N Credito B"]
    debitoA.value =numeros["Ultima N Debito A"]
    debitoB.value =numeros["Ultima N Debito B"]
    recibo.value =numeros["Ultimo Recibo"] 
    presupuesto.value =numeros["Ultimo Presupuesto"]
    remito.value =numeros["Ultimo Remito"] 
    remitoC.value =numeros["Ultimo Remito Contado"]
    remitoCorriente.value =numeros["Ultimo Remito Cta Cte"]
    dolar.value = numeros.dolar
})



cancelar.addEventListener('click', ()=>{
    window.close()
})
