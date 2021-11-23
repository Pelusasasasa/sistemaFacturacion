const { ipcRenderer } = require("electron");
const electron = require('electron')
const remote = electron.remote

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
let dolar = 100
let costo = 0

//Traer el dolar
ipcRenderer.send('traerDolar')
const promesa = new Promise((resolve,reject) =>{
    ipcRenderer.on('traerDolar',(e,args)=>{
        args = JSON.parse(args)
        dolar = parseFloat(args)
    })
    resolve()

})


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
    tasaIva.value=tasaIva.options[tasaiva(producto.iva)].value
    costoPesos.value = producto.costo
    costoDolares.value = producto.costodolar

    if (costoPesos.value === "0") {
        ivaImp.value = parseFloat(producto.impuestos)*dolar
        costo = parseFloat(costoDolares.value)
        costoTotal.value = ((costo+parseFloat(producto.impuestos))*dolar).toFixed(3)
    }else{
        ivaImp.value = parseFloat(producto.impuestos)
        costo = parseFloat(costoPesos.value)
        costoTotal.value = ((costo+parseFloat(producto.impuestos))).toFixed(3)
    }
    observaciones.value = producto.observacion
    utilidad.value=producto.utilidad
    precioVenta.value = producto.precio_venta

}


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
    console.log(producto)
    ipcRenderer.send('modificarProducto',producto)
    window.close()
})

function tasaiva(letra) {
    if (letra === "N") {
        return 0
    }else{
        return 1
    }
}

const salir = document.querySelector('.salir')
salir.addEventListener('click',e=>{
    window.close();
})

document.addEventListener('keydown',e=>{
    if (e.key === "Escape") {
        window.close()
    }
})