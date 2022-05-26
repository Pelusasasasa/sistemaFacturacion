const XLSX = require('xlsx');

const pedidos = (Pedidos,path) =>{
let wb = XLSX.utils.book_new();

let extencion = "xlsx";
extencion = path.split('.')[1] ? path.split('.')[1] : extencion;
path = path.split('.')[0];

wb.props = {
    Title: "Pedidos",
    subject: "Test",
    Author: "Electro Aaenida"
}

let newWS = XLSX.utils.json_to_sheet(Pedidos)

XLSX.utils.book_append_sheet(wb, newWS,'Pedidos');
XLSX.writeFile(wb,path + "." + extencion );
}

const ventas = (Ventas,path)=>{

    let wb = XLSX.utils.book_new();

    wb.props = {
        Title: "Ventas",
        subject: "Test",
        Author: "Electro Avenida"
    }

    //borraos las propiedades que no son necesarias
    Ventas.forEach(venta => {
        delete venta._id
        delete venta.tipo_pago
        delete venta.productos
        delete venta.comprob
        delete venta.direccion
        delete venta.cod_comp
        delete venta.cod_doc
        delete venta.dnicuit
        delete venta.observaciones
        delete venta.__v
        delete venta.abonado
        delete venta.cliente
        delete venta.condIva
        delete venta.gravado21
        delete venta.iva21
        delete venta.gravado105
        delete venta.iva105
        delete venta.cant_iva
    });

    //Lo que hacemos es ordenar el array por fechas
    Ventas.sort((a,b)=>{
        if(a.fecha > b.fecha){
            return 1;
        }else if(a.fecha < b.fecha){
            return -1
        }

        return 0
    })
    let recibos = 0;
    let facturas = 0;
    let presupuesto = 0;
    const agregarVenta = {}

    Ventas.forEach(venta=>{
        recibos += (venta.tipo_comp === "Recibos_P" ||  venta.tipo_comp === "Recibos") ? venta.precioFinal : 0;
        facturas += (venta.tipo_comp === "Ticket Factura") ? venta.precioFinal : 0;
        facturas -= (venta.tipo_comp === "Nota Credito") ? venta.precioFinal : 0;
        presupuesto += (venta.tipo_comp === "Presupuesto") ? venta.precioFinal : 0;
        const fecha = new Date(venta.fecha);
        let dia = fecha.getDate();
        let mes = fecha.getMonth()+1;
        let anio = fecha.getFullYear();
        let hora = fecha.getHours();
        let minuts = fecha.getMinutes();
        let secons = fecha.getSeconds();
        dia = dia < 10 ? `0${dia}` : dia;
        mes = mes < 10 ? `0${mes}` : mes;
        mes = mes === 13 ? 1 : mes;
        venta.precioSinDescuento = venta.descuento ? parseFloat(venta.precioFinal) + parseFloat(venta.descuento) : venta.precioFinal;
        venta.fecha = `${dia}/${mes}/${anio} - ${hora}:${minuts}:${secons}`;
    });
    agregarVenta.recibos = recibos;
    agregarVenta.facturas = facturas;
    agregarVenta.presupuesto = presupuesto;
    Ventas.push(agregarVenta);
    let newWs = XLSX.utils.json_to_sheet(Ventas)
    XLSX.utils.book_append_sheet(wb,newWs,'Ventas');
    let extencion = "xlsx"
    extencion = path.split('.')[1] ? path.split('.')[1] : extencion;
        path = path.split('.')[0];
    XLSX.writeFile(wb,path + "." + extencion)
}

module.exports = [pedidos,ventas];