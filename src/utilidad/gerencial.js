const { ipcRenderer } = require("electron/renderer");

const hasta = document.querySelector('#hasta')
const desde = document.querySelector('#desde')


const hoy = new Date();

let dia = hoy.getDate()
if (dia<10) {
    dia = `0${dia}`
}
let mes = hoy.getMonth()

mes = mes === 0 ? mes+1 : mes ;

if (mes<10) {
    mes = `0${mes}`
}

const fechaDeHoy = (`${hoy.getFullYear()}-${mes}-${dia}`)
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
    await ipcRenderer.invoke('get-cliente',venta.cliente).
        then((clienteTraido)=>{
            cliente = JSON.parse(clienteTraido).cliente})
           
        venta.productos.forEach(({cantidad,objeto}) => {
        tbody.innerHTML += `
            <tr>
                <td>${dia}/${mes}/${anio}</td>
                <td>${cliente}</td>
                <td>${objeto._id}</td>
                <td>${objeto.descripcion}</td>
                <td>${cantidad}</td>
                <td>${cantidad*objeto.precio_venta}</td>
                <td>${vendedor[0]}</td>
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