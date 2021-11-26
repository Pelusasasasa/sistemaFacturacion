const { ipcRenderer } = require("electron");
const hoy = new Date()
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
const desde =  document.querySelector('#desde')
const hasta =  document.querySelector('#hasta')
desde.value = fechaDeHoy
hasta.value = fechaDeHoy
const tbody =  document.querySelector('.tbody')
buscar.addEventListener('click',e=>{
    ipcRenderer.send('traerVentasEntreFechas',[desde.value,hasta.value])
})
let ventas = []


    ipcRenderer.on('traerVentasEntreFechas',(e,args)=>{
        ventas = JSON.parse(args)
        const ventasPresupuestos = ventas.filter(venta => venta.tipo_pago === "PP")
        listarVentas(ventasPresupuestos,tbody)
    })

function listarVentas(lista,bodyelegido) {
    bodyelegido.innerHTML = ""
    lista.forEach(venta => {
        const fecha = new Date(venta.fecha);
        const hoy = fecha.getDate();
        const mes = fecha.getMonth();
        const anio = fecha.getFullYear();
        venta.productos.forEach(({objeto,cantidad})=>{
            bodyelegido.innerHTML += `
            <tr>
                <td>${venta.nro_comp}</td>
                <td>${hoy}/${mes}/${anio}</td>
                <td>${venta.cliente}</td>
                <td>${objeto._id}</td>
                <td>${objeto.descripcion}</td>
                <td>${cantidad}</td>
                <td>${objeto.precio_venta}</td>
                <td>${objeto.precio_venta*cantidad}</td>
            </tr>
        `
        })
        bodyelegido.innerHTML += `
        <tr class="total"><td></td><td></td><td></td><td></td><td></td><td></td><td>Total: </td><td class=tdTotal>${venta.precioFinal}</td></tr>`
    });
}
const imprimir = document.querySelector('.imprimir')
imprimir.addEventListener('click',e=>{
    //printPage()
    const buscador = document.querySelector('.buscador')
    buscador.classList.add('disable')
    buscador.classList.remove('buscador')
    window.print()
    buscador.classList.add('buscador')
    buscador.classList.remove('disable')
})


document.addEventListener('keydown',e=>{
    if(e.key === "Escape"){
        window.close()
    }
})