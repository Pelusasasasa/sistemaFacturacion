const { ipcRenderer } = require("electron/renderer");
const axios = require("axios")
const URL = process.env.URL;
const { DateTime } = require("luxon");


const desde = document.querySelector('#desde');
const hasta = document.querySelector('#hasta');
const hoy = new Date();
let dia = hoy.getDate();
let mes = hoy.getMonth() + 1;
mes = mes === 13 ? 1 : mes;
let anio = hoy.getFullYear()
dia = dia < 10 ? `0${dia}` : dia;   
mes = mes < 10 ? `0${mes}` : mes;
desde.value = `${anio}-${mes}-${dia}`;
hasta.value = `${anio}-${mes}-${dia}`
let hastaFecha = DateTime.fromISO(hasta.value).endOf('day');
const desdeFecha = new Date(desde.value)
let tickets = [];
const traerVentasEntreFechas = async()=>{
    let ventas = (await axios.get(`${URL}ventas/${desdeFecha}/${hastaFecha}`)).data;
    let presupuesto = (await axios.get(`${URL}presupuesto/${desdeFecha}/${hastaFecha}`)).data
    tickets = ventas.filter(venta => ( venta.tipo_pago !== "CC"));
    presupuestosTickets = presupuesto.filter(venta => ( venta.tipo_pago !== "CC"));
    listarVentas([...tickets,...presupuestosTickets]);
}
traerVentasEntreFechas();

const tbody = document.querySelector('.tbody');
const listarVentas = (ventas)=>{
    ventas.forEach(venta => {
        const hoy = new Date(venta.fecha);
        let dia = hoy.getDate();
        let mes = hoy.getMonth() + 1;
        mes = mes === 13 ? 1 : mes;
        let anio = hoy.getFullYear()
        dia = dia < 10 ? `0${dia}` : dia;   
        mes = mes < 10 ? `0${mes}` : mes;
        let fecha = `${dia}/${mes}/${anio}`
        tbody.innerHTML += `
            <tr id="${venta._id}" class="desabilitado">
                <td>${fecha}</td>
                <td>${venta.cliente}</td>
                <td>${venta.nombreCliente}</td>
                <td>${venta.cod_comp}</td>
                <td>${venta.tipo_comp}</td>
                <td>${venta.nro_comp}</td>
                <td>${venta.comprob !== undefined ? venta.comprob : ""}</td>
                <td><input type="text" value="${venta.precioFinal}" /></td>
                <td><input type="text" value="${venta.gravado21 !== undefined ? venta.gravado21 : ""}" /></td>
                <td><input type="text" value="${venta.iva21 !== undefined ? venta.iva21 : ""}" /></td>
                <td><input type="text" value="${venta.gravado105 !== undefined ? venta.gravado105 : ""}" /></td>
                <td><input type="text" value="${venta.iva105 !== undefined ? venta.iva105 : ""}" /></td>
                <td><input type="text" value="${venta.cant_iva !== undefined ? venta.cant_iva : ""}" /></td>
                <td>${venta.cod_doc !== undefined ? venta.cod_doc : ""}</td>
                <td>${venta.dnicuit !== undefined ? venta.dnicuit : ""}</td>
                <td>${venta.condIva !== undefined ? venta.condIva : ""}</td>
            </tr>
        `
    });
}

let arregloModificacion = [];
tbody.addEventListener('click',e=>{
    e.target.localName !== "input" && e.target.parentNode.classList.toggle("desabilitado");
    addOrRemove(arregloModificacion,e.target.parentNode.id)
    // console.log(arregloModificacion)
})

const guardar = document.querySelector('.guardar');
guardar.addEventListener('click',e=>{
    const array = document.querySelectorAll('tbody tr');
    const arreglo = []
    array.forEach(element=>{
        if (!element.classList.contains("desabilitado")) {
            arreglo.push(element);
        }
    })
    arreglo.forEach((element)=>{
        tickets.forEach(async ticket=>{
            if (ticket.nro_comp === element.children[5].innerHTML) {
                const precioFinal = element.children[7].children[0].value;
                const gravado21 = element.children[8].children[0].value;
                const iva21 = element.children[9].children[0].value;
                const gravado105 = element.children[10].children[0].value;
                const iva105 = element.children[11].children[0].value;
                const cantIva = element.children[12].children[0].value;
                ticket.precioFinal = precioFinal;
                gravado21 !== "" && (ticket.gravado21 = parseFloat(gravado21));
                gravado105 !== "" && (ticket.gravado105 = parseFloat(gravado105));
                iva21 !== "" && (ticket.iva21 = parseFloat(iva21));
                iva105 !== "" && (ticket.iva105 = parseFloat(iva105));
                cantIva !== "" && (ticket.cant_iva = parseFloat(cantIva));
                if (ticket.tipo_comp === "Presupuesto") {
                    await axios.put(`${URL}presupuesto/${ticket._id}`,ticket)
                }else{
                    await axios.put(`${URL}ventas/${ticket._id}`,ticket)
                }
                console.log(ticket);
            }
        })
    })
})

function addOrRemove(array, value) {
    var index = array.indexOf(value);

    if (index === -1) {
        array.push(value);
    } else {
        array.splice(index, 1);
    }
}

const salir = document.querySelector('.salir');
salir.addEventListener('click',e=>{
    window.close()
})