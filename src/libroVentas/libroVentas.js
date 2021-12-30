const { ipcRenderer } = require("electron");

const fecha = new Date()
let dia = fecha.getDate()
let mes = fecha.getMonth() + 1;
mes = (mes === 13) ? (mes=1) : mes;
mes = (mes < 10) ? (mes = `0${mes}`) : mes;
dia = (dia<10) ? (dia = `0${dia}`) : dia;
const anio = fecha.getFullYear();

let ultimoDiaMesAnterior = (new Date(anio,mes-1,0))
ultimoDiaMesAnterior=ultimoDiaMesAnterior.getDate()

let ultimoDia = (new Date(anio,mes,0))
ultimoDia = ultimoDia.getDate()
const fechaAyer = `${anio}-${mes-1}-${ultimoDiaMesAnterior}`
const fechaHoy = `${anio}-${mes}-${ultimoDia}`

const desde = document.querySelector('#desde');
const hasta = document.querySelector('#hasta');
const tbody = document.querySelector('.tbody');
const buscar =  document.querySelector('.buscar');
desde.value = fechaAyer;
hasta.value = fechaHoy;

let listaTicketFactura = []
let listaNotaCredito = []

buscar.addEventListener('click',e=>{
    ipcRenderer.send('traerVentasEntreFechas',[desde.value,hasta.value])
})

ipcRenderer.on('traerVentasEntreFechas',(e,args)=>{
    let ventas = JSON.parse(args)
    ventas = ventas.filter(venta => venta.tipo_comp !== "Presupuesto");
    listaTicketFactura = ventas.filter(venta=>venta.tipo_comp === "Ticket Factura");
    listaNotaCredito = ventas.filter(venta=>venta.tipo_comp !== "Ticket Factura");
    listar(listaNotaCredito);
    listar(listaTicketFactura);
})

const listar = (ventas)=>{
    let cliente;
    let cond_iva;
    let totalgravado21 = 0;
    let totalgravado105 = 0;
    let totaliva21 = 0;
    let totaliva105 = 0;
    let diaVentaAnterior = 1

    ventas.forEach(async venta => {
        let fecha = new Date(venta.fecha)
        const day = fecha.getDate();
        const month = fecha.getMonth();
        const year = fecha.getFullYear();
        const [gravado21,iva21,gravado105,iva105] = sacarIvas(venta.productos)
        if (diaVentaAnterior === day) {
            totalgravado21 += gravado21
            totaliva21 += iva21
            totalgravado105 += gravado105
            totaliva105 += iva105
        }else{
            tbody.innerHTML + `
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>Totales Diarios</td>
                    <td>${venta.tipo_comp}</td>
                    <td>${totalgravado21}</td>
                    <td>${totaliva21}</td>
                    <td>${totalgravado105}</td>
                    <td>${totaliva105}</td>
                    <td></td>
                    
                </tr>
            `
            diaVentaAnterior = day
            totalgravado21 += 0
            totaliva21 += 0
            totalgravado105 += 0
            totaliva105 += 0
        }
        await ipcRenderer.invoke('get-cliente',venta.cliente).then((args)=>{
            cliente = JSON.parse(args);
            cond_iva = (cliente.cond_iva) ? (cliente.cond_iva) : "Consumidor Final";
        })

        tbody.innerHTML += `
            <tr>
                <td>${day}/${month}/${year}</td>
                <td>${cliente.cliente}</td>
                <td>${cond_iva}</td>
                <td>${cliente.cuit}</td>
                <td>${venta.tipo_comp}</td>
                <td>0003-${venta.nro_comp}</td>
                <td>${gravado21}</td>
                <td>${iva21}</td>
                <td>${gravado105}</td>
                <td>${iva105}</td>
                <td>${venta.precioFinal}<td>
            </tr>
        `
    });
}

const sacarIvas = (productos)=>{
    let gravado21 = 0;
    let iva21 = 0;
    let gravado105 = 0;
    let iva105 = 0;
    productos.forEach(({objeto,cantidad})=>{
        if (objeto.iva === "N") {
            gravado21 = parseFloat(gravado21.toFixed(2)) + parseFloat(((cantidad * parseFloat(objeto.precio_venta))/1.21).toFixed(2))
            iva21 += parseFloat((parseFloat(gravado21)*21/100).toFixed(2))
        }else{
            gravado105 = parseFloat(gravado105.toFixed(2)) + parseFloat(((cantidad * parseFloat(objeto.precio_venta))/1.105).toFixed(2))
            iva105 += parseFloat((parseFloat(gravado105)*10.5/100).toFixed(2))
        }

    })

    return [gravado21,iva21,gravado105,iva105]
}