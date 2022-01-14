const { ipcRenderer } = require("electron");

const hoy = new Date();
let dia = hoy.getDate()

if (dia<10) {
    dia = `0${dia}`
}
let mes = hoy.getMonth() + 1
console.log(mes)

mes = (mes === 0) ? 1 : mes

if (mes<10) {
    mes = `0${mes}`
}
const fechaDeHoy = (`${hoy.getFullYear()}-${mes}-${dia}`)
const buscar = document.querySelector('.buscar');
const contado = document.querySelector('.contado');
const cteCorriente = document.querySelector('.cteCorriente');
const desde =  document.querySelector('#desde')
const hasta =  document.querySelector('#hasta')
desde.value = fechaDeHoy
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
    contado.classList.add('seleccionado');
    cteCorriente.classList.remove('seleccionado');
    listarVentas(ventasContado);
})

cteCorriente.addEventListener('click',e=>{
    const ventasContado = ventas.filter(venta => venta.tipo_pago === "CC")
    cteCorriente.classList.add('seleccionado');
    contado.classList.remove('seleccionado');
    listarVentas(ventasContado);
})


function listarVentas(lista) {
    tbody.innerHTML = ""
    lista.forEach(venta => {
        let total = 0
        venta.productos.forEach(({objeto,cantidad})=>{
            const fecha = new Date(venta.fecha);
            let hoy = fecha.getDate();
            let mes = fecha.getMonth();
            mes = (mes===0) ? mes + 1 : mes;
            mes = (mes<10) ? `0${mes}` : mes;
            hoy = (hoy<10) ? `0${hoy}` : hoy;
            let anio = fecha.getFullYear();
            total += objeto.precio_venta*cantidad
            tbody.innerHTML += `
            <tr>
                <td>${venta.nro_comp}</td>
                <td>${hoy}/${mes}/${anio}</td>
                <td>${venta.cliente}</td>
                <td>${objeto._id}</td>
                <td>${objeto.descripcion}</td>
                <td>${cantidad}</td>
                <td>${objeto.precio_venta}</td>
                <td>${(objeto.precio_venta*cantidad).toFixed(2)}</td>
            </tr>
        `
        })
        tbody.innerHTML += `
        <tr class="total"><td></td><td></td><td></td><td></td><td></td><td></td><td class=tdTotal>${total.toFixed(2)}</td></tr>`
    });
}


document.addEventListener('keydown',e=>{
    if (e.key === "Escape") {
        window.close()
    }
})