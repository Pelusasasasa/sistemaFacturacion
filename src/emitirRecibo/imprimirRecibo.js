const {ipcRenderer} = require('electron')

ipcRenderer.on('imprimir',(e,args)=>{
    console.log(JSON.parse(args))
    const [Cliente,Venta,,,arreglo,total] = JSON.parse(args)
    listar(Venta,Cliente,arreglo,total)
})

const listar = (venta,Cliente,lista,precio)=>{
const numero = document.querySelector('.numero')
const fecha = document.querySelector('.fecha');
const cliente = document.querySelector('.cliente')
const cuit = document.querySelector('.cuit')
const localidad = document.querySelector('.localidad')
const direccion = document.querySelector('.direccion')
const iva = document.querySelector('.cond_iva')
const total = document.querySelector('#total')
const tbody = document.querySelector('.tbody')
const tomarFecha = new Date();
const hoy = tomarFecha.getDate()
const mes = tomarFecha.getMonth() + 1;
const anio = tomarFecha.getFullYear();

const cond_iva = (Cliente.iva === undefined) && "Consumidor Final";

fecha.innerHTML = `${hoy}/${mes}/${anio}`;
numero.innerHTML = venta.nro_comp;
cliente.innerHTML = Cliente.cliente;
cuit.innerHTML = Cliente.cuit;
localidad.innerHTML=Cliente.localidad;
direccion.innerHTML=Cliente.direccion;
iva.innerHTML = cond_iva;
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
}

document.addEventListener('keydown',e=>{
    if (e.key=== "Escape") {
        window.close()
    }
})