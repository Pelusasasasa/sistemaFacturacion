
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
    (costoPesos.value === "") ? (ivaImp.value = parseFloat((costoDolares.value * valorTasaIva / 100).toFixed(3))) : ivaImp.value = parseFloat(costoT.toFixed(2))

})

costoTotal.addEventListener('focus' , (e) =>{
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