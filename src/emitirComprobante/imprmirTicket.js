const { ipcRenderer } = require("electron");
const { date } = require("gulp-util");

const cliente = document.querySelector('.cliente')
const cuit = document.querySelector('.cuit')
const iva = document.querySelector('.iva')
const direccion = document.querySelector('.direccion')
const comprobante = document.querySelector('.comprobante')
const numeroComprobante = document.querySelector('.numeroComprobante')
const fecha = document.querySelector('.fecha')
const hora = document.querySelector('.hora')


ipcRenderer.on('imprimir',(e,args)=>{
    const [Venta,Cliente] = JSON.parse(args)

    ponerValores(Cliente,Venta)
})

const ponerValores = (Cliente,Venta)=>{
    console.log(fecha);
    const fechaVenta = new Date(Venta.fecha)
    let dia = fechaVenta.getDate()
    let mes = fechaVenta.getMonth()+1;
    let horas = fechaVenta.getHours()
    let minutos = fechaVenta.getMinutes()
    let segundos = fechaVenta.getSeconds()
    mes = mes<10 ? `0${mes}` : mes;
    let anio = fechaVenta.getFullYear()
    comprobante.innerHTML = verTipoComp(Venta.cod_comp)
    numeroComprobante.innerHTML = Venta.nro_comp;
    cliente.innerHTML = Cliente.cliente;
    fecha.innerHTML = `FECHA: ${dia}-${mes}-${anio}`
    hora.innerHTML = `HORA: ${horas}-${minutos}-${segundos}`
    cuit.innerHTML = Cliente.cuit;
    iva.innerHTML = Cliente.cond_iva;
    direccion.innerHTML = `${Cliente.direccion}  ${Cliente.localidad}`
}


const verTipoComp = (codigoComprobante)=>{
    if (codigoComprobante === 6) {
        return "Factura B"
    }else if(codigoComprobante === 1){
        return "Factura A"
    }
}