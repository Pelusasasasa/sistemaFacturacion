const {ipcRenderer} = require('electron')

const div = document.querySelector('divImprimir')
var iframe = document.getElementById("iframe");
var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
const numero = innerDoc.querySelector('.numero')
const fecha = innerDoc.querySelector('.fecha');
const cliente = innerDoc.querySelector('.cliente')
const cuit = innerDoc.querySelector('.cuit')
const localidad = innerDoc.querySelector('.localidad')
const direccion = innerDoc.querySelector('.direccion')
const iva = innerDoc.querySelector('.cond_iva')
const total = innerDoc.querySelector('#total')
const tbody = innerDoc.querySelector('.tbody')
const tomarFecha = new Date();
const hoy = tomarFecha.getDate()
const mes = tomarFecha.getMonth() + 1;
const anio = tomarFecha.getFullYear();

fecha.innerHTML = `${hoy}/${mes}/${anio}`;
numero.innerHTML = recibo.nro_comp;
cliente.innerHTML = nombreCliente;
cuit.innerHTML = cuitCliente;
localidad.innerHTML=localidadCliente;
direccion.innerHTML=direccionCliente;
iva.innerHTML = ivaCliente;
tbody.innerHTML = ""

lista.forEach(objeto => {
    tbody.innerHTML += `
        <tr>
            <td>${objeto.fecha}</td>
            <td>${objeto.comprobante}</td>
            <td>${objeto.numero}</td>
            <td>${(parseFloat(objeto.pagado)).toFixed(2)}</td>
            <td>${(parseFloat(objeto.saldo)).toFixed(2)}</td>
        </tr>
    `
})
total.value = precio
const informacionCliente = document.querySelector('.informacionCliente')
const tabla = document.querySelector('.tabla')
const pagado = document.querySelector('.pagado')
console.log(pagado)
const botones = document.querySelector('.botones')
informacionCliente.classList.add('disabled')
tabla.classList.add('disabled')
pagado.classList.add('disabled')
botones.classList.add('disabled')