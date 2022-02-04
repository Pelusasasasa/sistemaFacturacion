
const codigo = document.querySelector('#codigo');
const codFabrica = document.querySelector('#cod-fabrica');
const descripcion = document.querySelector('#descripcion');
const provedor = document.querySelector('#provedor');
const marca = document.querySelector('#marca');
const stock = document.querySelector('#stock');
const tasaIva = document.querySelector('#tasaIva');
const costoPesos = document.querySelector('#costoPesos');
const costoDolares = document.querySelector('#costoDolares');
const ivaImp = document.querySelector('#ivaImp')
const costoTotal = document.querySelector('#costoTotal');
const observaciones = document.querySelector('#observaciones'); 
const utilidad = document.querySelector('#utilidad');
const precioVenta = document.querySelector('#precioVenta');
const imagen = document.querySelector('#imagen')
const unidad = document.querySelector('#unidad')

const agregar = document.querySelector('.agregar')

let valorTasaIva = 26
let letraIva = "N"
let costoT = 0 //costo total
let precioV = 0 //Precio Venta
let dolar = 0
const {ipcRenderer} = require('electron');

//No enviar el formulario al apretar enter
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('input[type=text]').forEach( node => node.addEventListener('keypress', e => {
      if(e.keyCode == 13) {
        e.preventDefault();
      }
    }))
  });

//Traer el dolar
ipcRenderer.send('traerDolar')
ipcRenderer.on('traerDolar',(e,args)=>{
    args = JSON.parse(args)
    dolar = parseFloat(args)
})

codigo.addEventListener('blur',e=>{
    if(codigo.value !== ""){
        ipcRenderer.send('get-producto',codigo.value);
        ipcRenderer.on('get-producto',(e,args)=>{
            const producto = JSON.parse(args)
            if(producto !== ""){
                alert("El codigo ya es utilizador por " + producto.descripcion)
                codigo.value = "";
                codigo.focus(); 
            }
        })
    }
})

tasaIva.addEventListener('blur  ', (e) =>{
    letraIva = devolverIva(e.target.value)
    valorTasaIva = tasaIvas(e.target.value);
})

if (costoPesos.focus) {
costoPesos.addEventListener('blur', (e) =>{
    costoT = resultado(parseFloat(costoPesos.value),valorTasaIva);
})
}

costoDolares.addEventListener('blur', (e) =>{   
   costoDolares.value !== "" && (costoT = resultado(parseFloat(costoDolares.value),valorTasaIva,dolar))   ;
})

ivaImp.addEventListener('focus' , (e) =>{
    
    console.log(ivaImp.value);

})

costoTotal.addEventListener('focus' , (e) =>{
    (costoPesos.value === "") ? (ivaImp.value = parseFloat((costoDolares.value * valorTasaIva / 100).toFixed(2))) : ivaImp.value = parseFloat(costoT.toFixed(2))
    costoT = parseFloat(ivaImp.value)
    let costoP = 0;
    if ((costoPesos.value) === "") {
        costoP = parseFloat(costoDolares.value)*dolar
        const sumar = parseFloat((costoP*valorTasaIva/100).toFixed(3))
        costoTotal.value = sumar+(parseFloat(costoDolares.value)*dolar)
    }else{
        costoP = parseFloat(costoPesos.value)
        costoTotal.value = ((costoT+costoP).toFixed(2));
    }


})

utilidad.addEventListener('blur', (e) => {
    precioV = resultado(parseFloat(costoTotal.value),parseFloat(utilidad.value))
})

precioVenta.addEventListener('focus', (e) =>{
    precioVenta.value = parseFloat((precioV+parseFloat(costoTotal.value)).toFixed(2))
})

agregar.addEventListener('click' , (e) =>{
    e.preventDefault();
    const producto = {
        _id: codigo.value,
        cod_fabrica: codFabrica.value,
        descripcion: descripcion.value,
        provedor: provedor.value,
        marca: marca.value,
        stock: stock.value,
        iva: letraIva,
        observacion: observaciones.value,
        costo: costoPesos.value,
        costodolar: costoDolares.value,
        impuestos: ivaImp.value,
        utilidad: utilidad.value,
        precio_venta: precioVenta.value,
        unidad: unidad.value
    }
    ipcRenderer.send('nuevo-producto',producto)
    formularioProducto.reset();
})

ipcRenderer.on('producto-guardado', (e,args) =>{
    console.log(JSON.parse(args))
})


function devolverIva(palabra) {
    if (palabra === "normal") {
        return "N";
    }else{
        return "R"
    }
}

function tasaIvas(palabra) {
    if (palabra === "normal") {
        return 26;
    }else{
        return 15;
    }
}

function resultado(numero1,numero2,dolar=1) {
    return numero1*numero2*dolar/100;
}
const doc  = document
doc.addEventListener('keydown',e=>{
    if (e.key === "Escape") {
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

codigo.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        codFabrica.focus()
    }
})
codFabrica.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        descripcion.focus()
    }
})
descripcion.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        unidad.focus()
    }
})

stock.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        provedor.focus()
    }
})

provedor.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        marca.focus()
    }
})

marca.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        tasaIva.focus()
    }
})

costoPesos.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        costoDolares.focus()
    }
})

costoDolares.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        ivaImp.focus()
    }
})

ivaImp.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        costoTotal.focus()
    }
})

costoTotal.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        observaciones.focus()
    }
})

observaciones.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        utilidad.focus()
    }
})

utilidad.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        precioVenta.focus()
    }
})

precioVenta.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        modificar.focus()
    }
}) 

utilidad.addEventListener('focus',e=>{
    selecciona_value(utilidad.id)
})

costoPesos.addEventListener('focus',e=>{
    selecciona_value(costoPesos.id)
})

costoDolares.addEventListener('focus',e=>{
    selecciona_value(costoDolares.id)
})

marca.addEventListener('focus',e=>{
    selecciona_value(marca.id)
})

stock.addEventListener('focus',e=>{
    selecciona_value(stock.id)
})

provedor.addEventListener('focus',e=>{
    selecciona_value(provedor.id)
})

descripcion.addEventListener('focus',e=>{
    selecciona_value(descripcion.id)
})

codigo.addEventListener('focus',e=>{
    selecciona_value(codigo.id)
})

codFabrica.addEventListener('focus',e=>{
    selecciona_value(codFabrica.id)
})

ivaImp.addEventListener('focus',e=>{
    selecciona_value(ivaImp.id)
})

costoTotal.addEventListener('focus',e=>{
    selecciona_value(costoTotal.id)
})

observaciones.addEventListener('focus',e=>{
    selecciona_value(observaciones.id)
})