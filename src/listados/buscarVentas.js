
const axios = require("axios");
const { DateTime } = require("luxon");
require("dotenv").config;
const URL = process.env.URL;

const seleccion = document.querySelectorAll('input[name="seleccionar"]');
const seleccionar = document.querySelector('.seleccionar');
const primerNumero =  document.querySelector('#primerNumero');
const segundoNumero =  document.querySelector('#segundoNumero');
const nombre = document.querySelector('.nombre');
const razon = document.querySelector('#razon');
const tbody = document.querySelector('.tbody');
let seleccionado = document.querySelector('#porNumero');

const hoy = new Date()
let dia = hoy.getDate()
let mes = hoy.getMonth() + 1;

if (dia<10) {
    dia = `0${dia}`
};
if (mes<10) {
    mes = `0${mes}`
};

const fechaDeHoy = (`${hoy.getFullYear()}-${mes}-${dia}`)

primerNumero.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        segundoNumero.focus();
    }
});

segundoNumero.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        buscar.focus();
    }
});

primerNumero.addEventListener('focus',e=>{
    primerNumero.select();
});

segundoNumero.addEventListener('focus',e=>{
    segundoNumero.select();
});

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
buscar.addEventListener('click',async e=>{
     if (seleccionado.id==="porNumero") {
         let idVenta
        primerNumero.value === "0000" 
        ? idVenta = (segundoNumero.value).padStart(8,"0")
        : idVenta = (primerNumero.value.padStart(4,"0") + "-" + (segundoNumero.value).padStart(8,"0"));
        let venta = (await axios.get(`${URL}ventas/venta/ventaUnica/${idVenta}/Ticket Factura`)).data;
        venta = venta === "" ? (await axios.get(`${URL}ventas/venta/ventaUnica/${idVenta}/Recibos`)).data : venta;
        venta = venta === "" ? (await axios.get(`${URL}ventas/venta/ventaUnica/${idVenta}/Recibos_P`)).data : venta;
        venta = venta === "" ? (await axios.get(`${URL}presupuesto/${idVenta}`)).data : venta;
        traerVenta(venta);
     }else{
        let texto = razon.value === "" ? "A Consumidor Final" : razon.value;
        let clientes = await axios.get(`${URL}clientes/${texto}`);
        clientes = clientes.data;
        traerTodasLasVentas(clientes)
     }
})

let cliente
const traerVenta = async(venta)=>{
    if (venta !== "") {
        cliente = await buscarCliente(venta.cliente);
        tbody.innerHTML = ``;
        listarVentas(venta) ;
    }else{
        alert("No se encontro ninguna Venta");
    }
}


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
    let cliente = await axios.get(`${URL}clientes/id/${id}`)
    cliente = cliente.data
    return cliente
}

const desde = document.querySelector('#desde')
const hasta = document.querySelector('#hasta')
let ventas = []
async function traerTodasLasVentas(lista) {
    ventas = []
    lista.forEach(cliente=>{
        ventas = ventas.concat(cliente.listaVentas)
    })
    let retornar = [];
    const desdeFecha = desde.value
    const hastaFecha = DateTime.fromISO(hasta.value).endOf('day')
    for await (const Venta of ventas){
        let ventaARetornar = await axios.get(`${URL}ventas/${Venta}/${desdeFecha}/${hastaFecha}`)
        ventaARetornar = ventaARetornar.data;
        if (ventaARetornar.length === 0) {
            ventaARetornar = await axios.get(`${URL}presupuesto/${Venta}/${desdeFecha}/${hastaFecha}`);
            ventaARetornar = ventaARetornar.data

        }
        if(ventaARetornar[0] !== undefined){
            retornar.push(ventaARetornar[0])
    }
    }
    tbody.innerHTML = ``;
    if(retornar.length === 0){
        alert("No hay ventas, fijarse nombre y fechas")
    }
    retornar = retornar.filter(venta=>{
        if(venta.tipo_comp !== "Recibos" && venta.tipo_comp !== "Recibos_P"){
            return venta
        }
    })

    retornar.forEach(async venta=>{
        cliente = await buscarCliente(venta.cliente)
        listarVentas(venta)
    })  
}

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