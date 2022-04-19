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
        delete venta.cod_comp
        delete venta.cod_doc
        delete venta.dnicuit
        delete venta.observaciones
        delete venta.__v
        delete venta.abonado
        delete venta.cliente
        delete venta.condIva
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
    Ventas.forEach(venta=>{
        const fecha = new Date(venta.fecha);
        let dia = fecha.getDate();
        let mes = fecha.getMonth()+1;
        let anio = fecha.getFullYear();
        dia = dia < 10 ? `0${dia}` : dia;
        mes = mes < 10 ? `0${mes}` : mes;
        mes = mes === 13 ? 1 : mes;

        venta.fecha = `${dia}/${mes}/${anio}`;
        console.log(venta)
    })
    console.log(Ventas)
    let newWs = XLSX.utils.json_to_sheet(Ventas)
    XLSX.utils.book_append_sheet(wb,newWs,'Ventas')
    XLSX.writeFile(wb,"Ventas.xlsx")
}

module.exports = [pedidos,ventas];