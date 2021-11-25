const { ipcRenderer } = require("electron")

const seleccion = document.querySelectorAll('input[name="seleccionar"]')
const seleccionar = document.querySelector('.seleccionar')
let seleccionado = document.querySelector('#porNumero')
const primerNumero =  document.querySelector('#primerNumero')
const segundoNumero =  document.querySelector('#segundoNumero')
const nombre = document.querySelector('.nombre')
const razon = document.querySelector('#razon')
const tbody = document.querySelector('.tbody')

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

seleccionar.addEventListener('click',e=>{
    seleccion.forEach(e=>{
        e.checked && (seleccionado = e);
    })
    const desde = document.querySelector('.desde')
    const hasta = document.querySelector('.hasta')
    const hastafecha = document.querySelector('#hasta')
    const desdeFecha = document.querySelector('#desde')
    desdeFecha.value = fechaDeHoy
    hastafecha.value = fechaDeHoy
    const numeros = document.querySelector('.numeros')
    if (seleccionado.id==="razonSocial") {
        numeros.classList.add('invisible')
        desde.classList.remove('invisible')
        hasta.classList.remove('invisible')
        nombre.classList.remove('invisible')
    }else{
        numeros.classList.remove('invisible')
        desde.classList.add('invisible')
        hasta.classList.add('invisible')
        nombre.classList.add('invisible')
    }
})

const buscar = document.querySelector('.buscar')
buscar.addEventListener('click',e=>{
     if (seleccionado.id==="porNumero") {
         const idVenta = (primerNumero.value + "-" + segundoNumero.value)
         ipcRenderer.send('traerVenta',idVenta)
     }else{
         ipcRenderer.send('get-clientes',razon.value)
     }
})



let cliente

ipcRenderer.once('get-clientes',(e,args)=>{
    traerTodasLasVentas(JSON.parse(args))
})
ipcRenderer.once('traerVenta',async (e,args)=>{
    buscarCliente(JSON.parse(args)[0].cliente).then(console.log)
    cliente = buscarCliente(JSON.parse(args)[0].cliente)
    tbody.innerHTML = ``
    listarVentas(JSON.parse(args)[0])
})


function listarVentas(venta) {
        tbody.innerHTML += `<h2>${cliente}</h2>`
        venta.productos.forEach(({objeto,cantidad})=>{
            const fecha = mostrarFecha(venta.fecha)
            tbody.innerHTML += `
            <tr>
                <td>${fecha}</td>
                <td>${objeto._id}</td>
                <td>${objeto.descripcion}</td>
                <td>${venta.nro_comp}</td>
                <td>${cantidad}</td>
                <td>${objeto.precio_venta}</td>
                <td>${objeto.precio_venta*cantidad}</td>
            </tr>
        `
        })
        tbody.innerHTML += `
        <tr class="total">
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td class=tdTotal>${venta.precioFinal}</td>
        </tr>`
}

const buscarCliente = async (id) =>{
    let retornar
    await ipcRenderer.invoke('get-cliente',id).then((a)=>{
        retornar = JSON.parse(a)
    })
    return retornar

}

const desde = document.querySelector('#desde')
const hasta = document.querySelector('#hasta')
let ventas = []
function traerTodasLasVentas(lista) {
    lista.forEach(cliente=>{
        ventas = ventas.concat(cliente.listaVentas)
    })
    ipcRenderer.send('traerVentasIdYFechas',[ventas,desde.value,hasta.value])
}

ipcRenderer.on('traerVentasIdYFechas',(e,args)=>{
    const lista = JSON.parse(args)
    tbody.innerHTML = ``
    lista.forEach(async venta=>{
        cliente = await buscarCliente(venta.cliente)
        listarVentas(venta)
    })
})

const mostrarFecha = (string) =>{
    const ponerFecha = new Date(string)
    const dia = ponerFecha.getDate()
    const mes = ponerFecha.getMonth()+1
    const anio = ponerFecha.getUTCFullYear()

    return `${dia}/${mes}/${anio}`
}

document.addEventListener('keydown',e=>{
    if(e.key === "Escape"){
        window.close()
    }
})