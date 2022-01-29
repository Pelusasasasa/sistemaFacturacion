const { ipcRenderer } = require("electron/renderer");

const hasta = document.querySelector('#hasta')
const desde = document.querySelector('#desde')


const hoy = new Date();

let day = hoy.getDate()
if (day<10) {
    day = `0${day}`
}
let month = hoy.getMonth()

month = month === 0 ? month+1 : month ;

if (month<10) {
    month = `0${month}`
}

const fechaDeHoy = (`${hoy.getFullYear()}-${month}-${day}`)
const buscar = document.querySelector('.buscar')
const tbody = document.querySelector('.tbody')
desde.value = fechaDeHoy
hasta.value = fechaDeHoy


buscar.addEventListener('click',e=>{
    ipcRenderer.send('traerVentasCanceladas',[desde.value,hasta.value])
})

ipcRenderer.on('traerVentasCanceladas',(e,args)=>{
    const ventas = JSON.parse(args)
    tbody.innerHTML = ""
    console.log(ventas)
    ventas.forEach((venta)=>{
        listarVentasCanceladas(venta)
    })

})

const listarVentasCanceladas = async (venta)=>{
    let cliente
    let vendedor = venta.vendedor
    let fecha = new Date(venta.fecha)
    let dia = fecha.getDate()
    let mes = fecha.getMonth()+1
    let anio = fecha.getFullYear()
    let hora = fecha.getHours()
    let minutos = fecha.getMinutes()
    let segundos = fecha.getSeconds()
    dia = dia < 10 ? `0${dia}` : dia ;
    mes = mes < 10 ? `0${mes}` : mes ;
    await ipcRenderer.invoke('get-cliente',venta.cliente).
        then((clienteTraido)=>{
            cliente = JSON.parse(clienteTraido).cliente})
           
        venta.productos.forEach(({cantidad,objeto}) => {
        tbody.innerHTML += `
            <tr>
                <td>${dia}/${mes}/${anio}</td>
                <td class = "cliente">${cliente}</td>
                <td>${objeto._id}</td>
                <td>${objeto.descripcion}</td>
                <td>${cantidad}</td>
                <td class = "total">${(cantidad*objeto.precio_venta).toFixed(2)}</td>
                <td class="vendedor">${vendedor[0]}</td>
                <td>${hora}:${minutos}:${segundos}</td>

            </tr>
        `
    });
}

const doc = document
doc.addEventListener('keydown',e=>{
    if (e.key==="Escape") {
        window.close()
    }
})