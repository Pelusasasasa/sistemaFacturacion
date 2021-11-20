const { ipcRenderer } = require("electron");

const hoy = new Date();
let dia = hoy.getDate()
if (dia<10) {
    dia = `0${dia}`
}
let mes = hoy.getMonth()
if (mes<10) {
    mes = `0${mes}`
}
const fechaDeHoy = (`${hoy.getFullYear()}-${mes + 1}-${dia}`)
const buscar = document.querySelector('.buscar');
const contado = document.querySelector('.contado');
const cteCorriente = document.querySelector('.cteCorriente');
const desde =  document.querySelector('#desde')
const hasta =  document.querySelector('#hasta')
desde.value = fechaDeHoy
console.log(desde.value)
hasta.value = fechaDeHoy
const tbody =  document.querySelector('.tbody')

buscar.addEventListener('click',e=>{
    ipcRenderer.send('traerVentasEntreFechas',[desde.value,hasta.value])
})
let ventas = []

const promesaVentas = new Promise((resolve,reject)=>{
    ipcRenderer.on('traerVentasEntreFechas',(e,args)=>{
        ventas = JSON.parse(args)

    })
})

contado.addEventListener('click',e=>{
    const ventasContado = ventas.filter(venta => venta.tipo_pago === "CD")
    listarVentas(ventasContado)
})

cteCorriente.addEventListener('click',e=>{
    const ventasContado = ventas.filter(venta => venta.tipo_pago === "CC")
    listarVentas(ventasContado)
})

function listarVentas(lista) {
    console.log(lista)
    tbody.innerHTML = ""
    lista.forEach(venta => {
        venta.productos.forEach(({objeto,cantidad})=>{
            tbody.innerHTML += `
            <tr>
                <td>${venta.nro_comp}</td>
                <td>${venta.fecha}</td>
                <td>${venta.cliente}</td>
                <td>${objeto._id}</td>
                <td>${objeto.descripcion}</td>
                <td>${cantidad}</td>
                <td>${objeto.precio_venta}</td>
                <td>${objeto.precio_venta*cantidad}</td>
            </tr>
        `
        })
        tbody.innerHTML += `
        <tr class="total"><td></td><td></td><td></td><td></td><td></td><td></td><td class=tdTotal>${venta.precioFinal}</td></tr>`
    });
}