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

    let newWs = XLSX.utils.json_to_sheet(Ventas)

    XLSX.utils.book_append_sheet(wb,newWs,'Ventas')
    XLSX.writeFile(wb,"Ventas.dbf")
}

module.exports = [pedidos,ventas];