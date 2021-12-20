const { ipcRenderer } = require("electron");

const nombre = document.querySelector('.nombre')
const direccion = document.querySelector('.direccion')
const telefono = document.querySelector('.telefono')
const buscador = document.querySelector('#buscador');
const tbody = document.querySelector('.tbody');
const saldoActual = document.querySelector('#saldoActual');
const imprimir = document.querySelector('.imprimir')

let situacion = "blanco";
let listaVentas = [];
let saldo = "saldo";
let cliente = {};

buscador.addEventListener('keypress',e=>{
    if (buscador.value === "" && e.key === "Enter") {
        ipcRenderer.send('abrir-ventana','clientes')
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

}

const mostrarNegro = ()=>{
    const body = document.querySelector('.seccionResumeCuenta') 
    body.classList.add('mostrarNegro')
}


ipcRenderer.on('mando-el-cliente',async(e,args)=>{
    cliente = JSON.parse(args)
    nombre.innerHTML = cliente.cliente
    direccion.innerHTML = `${cliente.direccion}-${cliente.localidad}`;
    telefono.innerHTML = cliente.telefono;


    await ipcRenderer.invoke('traerVentas',cliente.listaVentas).then((args)=>{
        nuevaLista = []
        listaVentas = JSON.parse(args)
    })

    listarVentas(listaVentas,situacion)
})

function listarVentas(ventas,situacion) {
    tbody.innerHTML = ""
    const aux = (situacion === "blanco") ? "Ticket Factura" : "Presupuesto";
    let listaAux = []
    listaAux = ventas.filter(e=>{
        if (e.tipo_comp === "Presupuesto") {
            return (e.pagado === false)
        }else{
            return e
        }
    })

    if (aux === "Presupuesto") {
       listaAux = listaAux.filter(e=>{
            return (e.tipo_comp === aux || e.tipo_comp === "Recibos")
        })
    }else{
        listaAux = listaAux.filter(e=>{
            return (e.tipo_comp === aux)
        })
    }
        
        listaAux.forEach(venta => {
            const fecha = new Date(venta.fecha);
            const dia = fecha.getDate();
            const mes = fecha.getMonth() + 1;
            const anio = fecha.getUTCFullYear();
            
            tbody.innerHTML += `
                <tr>
                    <td>${dia}/${mes}/${anio}</td>
                    <td>${venta.tipo_comp}</td>
                    <td>${venta.nro_comp}</td>
                    <td></td>
                    <td></td>
                    <td>${(venta.precioFinal-parseFloat(venta.abonado)).toFixed(2)}</td>
                </tr>
            `

        });
        saldoActual.value = cliente[saldo]
}

imprimir.addEventListener('click',e=>{
    const ocultar = document.querySelector('.buscador')
    ocultar.classList.add('disable')
    window.print()
    history.go(-1)
})