const XLSX = require('xlsx');

const pedidos = (Pedidos) =>{
let wb = XLSX.utils.book_new();

wb.props = {
    Title: "Pedidos",
    subject: "Test",
    Author: "Electro Aaenida"
}

let newWS = XLSX.utils.json_to_sheet(Pedidos)

XLSX.utils.book_append_sheet(wb, newWS,'Pedidos')
XLSX.writeFile(wb,"Pedidos.xlsx")
}

const ventas = (Ventas)=>{
    console.log(Ventas)
    let wb = XLSX.utils.book_new();

    wb.props = {
        Title: "Ventas",
        subject: "Test",
        Author: "Electro Avenida"
    }
    Ventas.forEach(venta => {
        delete venta.pagado
        delete venta.tipo_pago
        delete venta.productos
        delete venta.comprob
        delete venta.cod_comp
        delete venta.cod_doc
        delete venta.dnicuit
        delete venta.observaciones
        delete venta.empresa
        delete venta.__v
        delete venta.abonado
        delete venta.cliente
        delete venta.condIva
    });
    console.log(Ventas[0])
    let newWs = XLSX.utils.json_to_sheet(Ventas)
    XLSX.utils.book_append_sheet(wb,newWs,'Ventas')
    XLSX.writeFile(wb,"Ventas.xlsx")
}

module.exports = [pedidos,ventas];