
const { DateTime } = require("luxon");
const axios = require("axios");
require("dotenv").config;
const URL = process.env.URL;


const hoy = new Date()
let dia = hoy.getDate()
if (dia<10) {
    dia = `0${dia}`
}
let mes = hoy.getMonth() + 1

mes = mes === 0 ? mes+1 : mes ;

if (mes<10) {
    mes = `0${mes}`
}
const fechaDeHoy = (`${hoy.getFullYear()}-${mes}-${dia}`)
const buscar = document.querySelector('.buscar');
const desde =  document.querySelector('#desde')
const hasta =  document.querySelector('#hasta')
desde.value = fechaDeHoy
hasta.value = fechaDeHoy
const tbody =  document.querySelector('.tbody');

desde.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        hasta.focus();
    };
});

hasta.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        buscar.focus();
    };
});

buscar.addEventListener('click',async e=>{
    const desdeFecha = new Date(desde.value);
    let hastaFecha = DateTime.fromISO(hasta.value).endOf('day');
    let ventas = await axios.get(`${URL}ventas/${desdeFecha}/${hastaFecha}`);
    ventas = ventas.data;
    let presupuesto = await axios.get(`${URL}presupuesto/${desdeFecha}/${hastaFecha}`);
    presupuesto = presupuesto.data;
    const ventasPresupuestos = ventas.filter(venta => venta.tipo_pago === "PP")
    const presupuestoPresupuestos = presupuesto.filter(venta => venta.tipo_pago === "PP")
    listarVentas([...ventasPresupuestos,...presupuestoPresupuestos],tbody)
})

function listarVentas(lista,bodyelegido) {
    bodyelegido.innerHTML = ""
    lista.forEach(venta => {
        const fecha = new Date(venta.fecha);
        let hoy = fecha.getDate();
        let mes = fecha.getMonth();
        let anio = fecha.getFullYear();
        mes = (mes===0) ? mes + 1 : mes;
        mes = (mes<10) ? `0${mes}` : mes;
        hoy = (hoy<10) ? `0${hoy}` : hoy;
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
                <td>${(objeto.precio_venta*cantidad).toFixed(2)}</td>
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