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
let mes = hoy.getMonth() +1
if (mes<10) {
    mes = `0${mes}`
}
const fechaDeHoy = (`${hoy.getFullYear()}-${mes}-${dia}`)


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
         let idVenta
        primerNumero.value === "0000" 
        ? idVenta = (segundoNumero.value).padStart(8,"0")
        : idVenta = (primerNumero.value + "-" + (segundoNumero.value).padStart(8,"0"));
         ipcRenderer.send('traerVenta',idVenta)
     }else{
         ipcRenderer.send('get-clientes',(razon.value).toUpperCase())
     }
})

let cliente

ipcRenderer.on('get-clientes',(e,args)=>{
    traerTodasLasVentas(JSON.parse(args))
})
ipcRenderer.on('traerVenta',async (e,args)=>{
    if (JSON.parse(args).length !== 0) {
        cliente = await buscarCliente(JSON.parse(args)[0].cliente)
        tbody.innerHTML = ``
        listarVentas(JSON.parse(args)[0]) 
    }else{
        alert("No se encontro ninguna Venta")
    }

})


function listarVentas(venta) {
        tbody.innerHTML += `<tr class="titulo"><td>${cliente.cliente}</td></tr>`
        let total = 0;
        venta.productos.forEach(({objeto,cantidad})=>{
            const fecha = mostrarFecha(venta.fecha)
            tbody.innerHTML += `
            <tr>
                <td>${fecha}</td>
                <td>${objeto._id}</td>
                <td>${objeto.descripcion}</td>
                <td>${venta.nro_comp}</td>
                <td>${parseFloat(cantidad).toFixed(2)}</td>
                <td>${objeto.precio_venta}</td>
                <td>${(objeto.precio_venta*cantidad).toFixed(2)}</td>
            </tr>
        `
        total += (objeto.precio_venta*cantidad)
        })
        tbody.innerHTML += `
        <tr class="total">
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td class=tdTotal>${total.toFixed(2)}</td>
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
    ventas = []
    lista.forEach(cliente=>{
        ventas = ventas.concat(cliente.listaVentas)
    })
    ipcRenderer.send('traerVentasIdYFechas',[ventas,desde.value,hasta.value])
}

ipcRenderer.on('traerVentasIdYFechas',(e,args)=>{
    let lista = JSON.parse(args)
    console.log(lista)
    tbody.innerHTML = ``;
    if(lista.length === 0){
        alert("No hay ventas, fijarse nombre y fechas")
    }
    lista = lista.filter(venta=>{
        if(venta.tipo_comp !== "Recibos" && venta.tipo_comp !== "Recibos_P"){
            return venta
        }
    })
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