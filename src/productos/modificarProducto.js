const { ipcRenderer } = require("electron");
const electron = require('electron')

const formularioProducto = document.querySelector('#formularioProducto');
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
const unidad = document.querySelector('#unidad');
let dolar = 100
let costo = 0
let valorTasaIva = 26

//Traer el dolar
ipcRenderer.send('traerDolar')
const promesa = new Promise((resolve,reject) =>{
    ipcRenderer.on('traerDolar',(e,args)=>{
        args = JSON.parse(args)
        dolar = parseFloat(args)
    })
    resolve()

})
console.log(dolar)
let producto = {}

const promesaProductos = new Promise((resolve,reject)=>{
    ipcRenderer.on('datos-productos',(e,args)=>{
        producto = JSON.parse(args)
        resolve()
    })
})

promesaProductos.then(()=>{
    asignarCampos()
})

function asignarCampos() {
    codigo.value = producto._id
    codFabrica.value = producto.cod_fabrica
    descripcion.value = producto.descripcion
    provedor.value = producto.provedor
    marca.value = producto.marca
    stock.value = producto.stock
    tasaIva.value=producto.iva;
    (producto.costo !== "") && (costoPesos.value = parseFloat(producto.costo).toFixed(2));
    (producto.costodolar !== "") && (costoDolares.value = parseFloat(producto.costo*dolar).toFixed(2));

    if (costoPesos.value === "0") {
        console.log(dolar)
        ivaImp.value = parseFloat(producto.impuestos)*dolar
        costo = parseFloat(costoDolares.value)
        costoTotal.value = ((costo+parseFloat(producto.impuestos))*dolar).toFixed(3)
    }else{
        ivaImp.value = parseFloat(producto.impuestos)
        costo = parseFloat(costoPesos.value)
        costoTotal.value = ((costo+parseFloat(producto.impuestos))).toFixed(3)
    }
    observaciones.value = producto.observacion
    utilidad.value=(parseFloat(producto.utilidad)).toFixed(2)
    precioVenta.value = producto.precio_venta;
    unidad.value = producto.unidad
}



tasaIva.addEventListener('blur  ', (e) =>{
    letraIva = devolverIva(e.target.value)
    valorTasaIva = tasaIvas(e.target.value);
})

if (costoPesos.focus) {
    costoPesos.addEventListener('blur', (e) =>{
        costo = resultado(parseFloat(costoPesos.value),valorTasaIva);
    })
    }

ivaImp.addEventListener('focus',(e)=>{
    (costoPesos.value === "") ? (ivaImp.value = parseFloat((costoDolares.value * valorTasaIva / 100).toFixed(3))) : ivaImp.value = parseFloat(costo.toFixed(2))
})

costoTotal.addEventListener('focus',()=>{
    costoT = parseFloat(ivaImp.value)
    let costoP = 0

    if (costoPesos === "") {
        costoP = parseFloat(costoDolares.value)*dolar;
        const sumar = parseFloat((costoP*valorTasaIva/100)).toFixed(2)
        costoTotal.value = sumar+(parseFloat(costoDolares.value)*dolar)
    }else{
        costoP = parseFloat(costoPesos.value)
        costoTotal.value = ((costo+costoP).toFixed(2))
    }
})



precioVenta.addEventListener('focus',e=>{
    precioVenta.value = parseFloat((parseFloat(utilidad.value)+parseFloat(costoTotal.value)).toFixed(2))
})
const modificar = document.querySelector('.modificar')
modificar.addEventListener('click',e=>{
    producto._id = codigo.value
    producto.cod_fabrica = codFabrica.value
    producto.descripcion = descripcion.value
    producto.provedor = provedor.value
    producto.marca = marca.value
    producto.stock = stock.value
    producto.iva = tasaIva.value
    producto.costo = costoPesos.value
    producto.costodolares = costoDolares.value
    producto.observacion = observaciones.value
    producto.utilidad = utilidad.value
    producto.precio_venta = precioVenta.value
    producto.unidad = unidad.value
    ipcRenderer.send('modificarProducto',producto)
    window.close()
})

const salir = document.querySelector('.salir')
salir.addEventListener('click',e=>{
    window.close();
})

document.addEventListener('keydown',e=>{
    if (e.key === "Escape") {
        window.close()
    }
})

function resultado(numero1,numero2,dolar=1) {
    return numero1*numero2*dolar/100;
}