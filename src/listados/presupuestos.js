const { ipcRenderer } = require("electron");

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

const promesaVentas = new Promise((resolve,reject)=>{
    ipcRenderer.on('traerVentasEntreFechas',(e,args)=>{
        ventas = JSON.parse(args)
        const ventasPresupuestos = ventas.filter(venta => venta.tipo_pago === "PP")

        resolve(ventasPresupuestos)

    })
})

promesaVentas.then(()=>{
    listarVentas(ventas,tbody)
})

function listarVentas(lista,bodyelegido) {
    console.log(lista)
    bodyelegido.innerHTML = ""
    lista.forEach(venta => {
        venta.productos.forEach(({objeto,cantidad})=>{
            bodyelegido.innerHTML += `
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
        bodyelegido.innerHTML += `
        <tr class="total"><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td class=tdTotal>${venta.precioFinal}</td></tr>`
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

function printPage(){
    const div = document.querySelector('divImprimir')
    let iframe = document.getElementById("iframeListado");
    let innerDoc = iframe.contentDocument || iframe.contentWindow.document;
    const listado = innerDoc.querySelector('.listado')
    listado.innerHTML +=`
    
    <div class="listar">
        <table>
            <thead>
                <tr>
                    <td>Nro Comp</td>
                    <td>Fecha</td>
                    <td>Cliente</td>
                    <td>Cod Prod</td>
                    <td>Descripcion</td>
                    <td>Egreso</td>
                    <td>Precio</td>
                    <td>Total</td>
                </tr>
            </thead>
            <tbody class="tbodyI">

            </tbody>
        </table>
    </div>
    `

    const tbodyI = innerDoc.querySelector('.tbodyI')
    listarVentas(ventas,tbodyI)

    window.print()
}

document.addEventListener('keydown',e=>{
    if(e.key === "Escape"){
        window.close()
    }
})