const { ipcRenderer, ipcMain } = require("electron");

const nombre = document.querySelector('.nombre')
const direccion = document.querySelector('.direccion')
const telefono = document.querySelector('.telefono')
const buscador = document.querySelector('#buscador');
const tbody = document.querySelector('.tbody');
const saldoActual = document.querySelector('#saldoActual');
const imprimir = document.querySelector('.imprimir')
const desde = document.querySelector('#desde')
const hasta = document.querySelector('#hasta')
const ocultar = document.querySelector('.seccion-buscador')
const volver = document.querySelector('.volver');

const dateNow = new Date()
let day = dateNow.getDate()
let month = dateNow.getMonth() + 1 
let year = dateNow.getFullYear()

day = day < 10 ? `0${day}`: day;
month = month < 10 ? `0${month}`: month;

const date = `${year}-${month}-${day}`

desde.value = date;
hasta.value = date

let situacion = "blanco";
let listaVentas = [];
let saldo = "saldo";
let cliente = {};


//Imprimir todos

// ipcRenderer.on('datosAImprimir',async(e,args)=>{
//     cliente = JSON.parse(args);
//     nombre.innerHTML = cliente.cliente;
//     direccion.innerHTML = `${cliente.direccion}-${cliente.localidad}`;
//     telefono.innerHTML = cliente.telefono;
//     await ipcRenderer.invoke('traerVentasClienteEntreFechas',[cliente._id,desde.value,hasta.value]).then((args)=>{
//         nuevaLista = []
//         listaVentas = JSON.parse(args)
//     })

//     await listarVentas(listaVentas,situacion);
//     // volver.classList.add('disable');
//     // ocultar.classList.add('disable');
//     // header.classList.add('m-0');
//     // header.classList.add('p-0');
//     // window.print();
// })

buscador.addEventListener('keypress',e=>{
    if (buscador.value === "" && e.key === "Enter") {
        ipcRenderer.send('abrir-ventana-clientesConSaldo',situacion)
    }
})



document.addEventListener('keydown',(event) =>{
    if (event.key === "Alt") {
        document.addEventListener('keydown',(e) =>{
           if (e.key === "F9" && situacion === "blanco") {
               mostrarNegro();
               situacion = 'negro'
               saldo = "saldo_p"
               listarVentas(listaVentas,situacion)
           }
       })
   }
})

document.addEventListener('keydown',(event) =>{
   if (event.key === "Alt") {
        document.addEventListener('keydown',(e) =>{
          if (e.key === "F3" && situacion === "negro") {
              ocultarNegro();
              situacion = 'blanco'
              saldo = "saldo"
              listarVentas(listaVentas,situacion)
          }
        })
  }
})

const ocultarNegro = ()=>{
    const body = document.querySelector('.seccionResumeCuenta')
    body.classList.remove('mostrarNegro')
    ocultar.classList.remove('mostrarNegro')
    volver.classList.remove('mostrarNegro')

}

const mostrarNegro = ()=>{
    const body = document.querySelector('.seccionResumeCuenta') 
    body.classList.add('mostrarNegro')
    ocultar.classList.add('mostrarNegro')
    volver.classList.add('mostrarNegro')
    
}


ipcRenderer.on('mando-el-cliente',async(e,args)=>{
    cliente = JSON.parse(args)
    nombre.innerHTML = cliente.cliente
    direccion.innerHTML = `${cliente.direccion}-${cliente.localidad}`;
    telefono.innerHTML = cliente.telefono;
    await ipcRenderer.invoke('traerVentasClienteEntreFechas',[cliente._id,desde.value,hasta.value]).then((args)=>{
        nuevaLista = []
        listaVentas = JSON.parse(args)
    })

    listarVentas(listaVentas,situacion)
})

function listarVentas(ventas,situacion) {
    ventas = ventas.filter(venta => {
        if (((venta.tipo_comp === "Presupuesto" || venta.tipo_comp === "Ticket Factura"))) {
            return venta
        }else if((venta.pagado === true) && (venta.tipo_comp === "Recibos" || venta.tipo_comp === "Recibos_P")){
            return venta
        }
    })
    tbody.innerHTML = ""
    const aux = (situacion === "blanco") ? "Ticket Factura" : "Presupuesto";
    let listaAux = ventas
    // listaAux = ventas.filter(e=>{
    //     if (e.tipo_comp === "Presupuesto") {
    //         return (e.pagado === false)
    //     }else{
    //         return e
    //     }
    // })

    if (aux === "Presupuesto") {
       listaAux = listaAux.filter(e=>{
            return (e.tipo_comp === aux || e.tipo_comp === "Recibos_P")
        })
    }else{
        listaAux = listaAux.filter(e=>{
            return (e.tipo_comp === aux || e.tipo_comp === "Recibos")
        })
    }
    let saldoAnterior = 0

    listaAux.forEach(venta =>{
        if (situacion === "negro") {
            saldoAnterior += (venta.tipo_comp === "Presupuesto") ? venta.precioFinal - parseFloat(venta.abonado) : 0    
        }else{
            saldoAnterior += (venta.tipo_comp === "Ticket Factura") ? venta.precioFinal: 0
            let abonado = venta.abonado !== "" ? parseFloat(venta.abonado) : 0
            abonado = venta.precioFinal > parseFloat(venta.abonado) ? 0 : abonado
            saldoAnterior -= (venta.tipo_comp === "Recibos") ? venta.precioFinal  - abonado: 0
            console.log(saldoAnterior);
        }
    })
    console.log(saldoAnterior);
    parseFloat(saldoAnterior.toFixed(2))
    if (situacion === "negro") {
        saldoAnterior = (cliente.saldo_p - saldoAnterior).toFixed(2);
    }else{
        saldoAnterior = (cliente.saldo - saldoAnterior).toFixed(2);
    }
    

        tbody.innerHTML += `<tr><td></td><td></td><td></td><td></td><td>Saldo Anterior</td><td>${saldoAnterior}</td></tr>`
        listaAux.forEach(venta => {
            let haber = 0;
            let debe = 0
            if (situacion === "negro") {
                debe = (venta.tipo_comp === "Presupuesto" && venta.tipo_pago === "CC") ? (parseFloat(venta.precioFinal)) : 0;
                haber = (venta.tipo_comp === "Recibos_P") ? (parseFloat(venta.precioFinal)) : 0;
            }else{
                debe = (venta.tipo_comp === "Ticket Factura" && venta.tipo_pago === "CC") ? (parseFloat(venta.precioFinal)) : 0
                haber =  (venta.tipo_comp === "Recibos") ? (parseFloat(venta.precioFinal)) : 0
            }

            let saldito = parseFloat(saldoAnterior) - haber + debe;
            saldoAnterior = parseFloat(saldoAnterior) - haber + debe;
            const fecha = new Date(venta.fecha);
            const dia = fecha.getDate();
            const mes = fecha.getMonth() + 1;
            const anio = fecha.getUTCFullYear();
           
            
            tbody.innerHTML += `
                <tr>
                    <td>${dia}/${mes}/${anio}</td>
                    <td>${venta.tipo_comp}</td>
                    <td>${venta.nro_comp}</td>
                    <td>${(debe === 0.00) ?  "" : debe.toFixed(2)}</td>
                    <td>${(haber === 0.00) ? "" : haber.toFixed(2)}</td>
                    <td>${(saldito).toFixed(2)}</td>
                </tr>
            `

        });
        if (cliente[saldo] === undefined) {
            saldoActual.value === "0";
        }else{
            saldoActual.value = cliente[saldo];
        }
}

imprimir.addEventListener('click',e=>{

    volver.classList.add('disable')
    ocultar.classList.add('disable')
    header.classList.add('m-0')
    header.classList.add('p-0')
    window.print()
    //history.go(-1)
})