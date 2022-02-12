const { ipcRenderer } = require("electron")
const Dialogs = require("dialogs");
const dialogs = Dialogs()

const cliente = document.querySelector('#buscador')
const saldo = document.querySelector('#saldo')
const listar = document.querySelector('.listar')
const compensada = document.querySelector('.compensada')
const historica = document.querySelector('.historica')
const actualizar = document.querySelector('.actualizar')

let nuevaLista=[]
let lista=[]
let clienteTraido = {}
let listaGlobal=[]
vendedor = ""
let seleccionado
let situacion = "blanco";
let tipo = "compensada"

historica.addEventListener('click',e=>{
    historica.classList.add("disable")
    compensada.classList.remove('disable')
    tipo = "historica"
    listarLista(lista,situacion,tipo)
})

compensada.addEventListener('click',e=>{
    compensada.classList.add("disable")
    historica.classList.remove('disable')
    tipo = "compensada"
    listarLista(nuevaLista,situacion,tipo)
})

document.addEventListener('keydown',(event) =>{
    if (event.key === "Alt") {
       document.addEventListener('keydown',(e) =>{
           if (e.key === "F9" && situacion === "blanco") {
               mostrarNegro();
               situacion = 'negro';
               listarLista(nuevaLista,situacion,tipo);
           }
       })
   }
})

document.addEventListener('keydown',(event) =>{
   if (event.key === "Alt") {
      document.addEventListener('keydown',(e) =>{
          if (e.key === "F3" && situacion === "negro") {
              ocultarNegro();
              situacion = 'blanco';
              listarLista(nuevaLista,situacion,tipo);
          }
      })
  }
})

const ocultarNegro = ()=>{
    const saldo = document.querySelector('#saldo')
    const saldo_p = document.querySelector('#saldo_p')
    const botonFacturar = document.querySelector('#botonFacturar')
    const body = document.querySelector('.consultaCtaCte');
    const seccion_botones = document.querySelector('.seccion_botones');
    const buscador = document.querySelector('.buscador')
    buscador.classList.remove("mostrarNegro")
    seccion_botones.classList.remove("mostrarNegro")
    saldo.classList.remove('none')
    saldo_p.classList.add('none')
    botonFacturar.classList.add('none')
    body.classList.remove('mostrarNegro')
    actualizar.classList.add('none')
}

const mostrarNegro = ()=>{
    const saldo = document.querySelector('#saldo')
    const saldo_p = document.querySelector('#saldo_p')
    const botonFacturar = document.querySelector('#botonFacturar')
    const body = document.querySelector('.consultaCtaCte');
    const seccion_botones = document.querySelector('.seccion_botones');
    const buscador = document.querySelector('.buscador')
    buscador.classList.add("mostrarNegro")
    seccion_botones.classList.add("mostrarNegro")
    saldo.classList.add('none')
    botonFacturar.classList.remove('none')
    saldo_p.classList.remove('none')
    body.classList.add('mostrarNegro')
    actualizar.classList.remove('none')
}

cliente.addEventListener('keypress', e =>{
    if (e.key === "Enter") {
        if (cliente.value !== "") {
            ipcRenderer.invoke('get-cliente',(cliente.value).toUpperCase()).then(async(args)=>{
                if (JSON.parse(args) !== "") {
                    ponerDatosCliente(JSON.parse(args));
                }else{
                     alert("El cliente no existe")
                     cliente.value = "";
                     cliente.focus();
                }

            })
        }else{
            ipcRenderer.send('abrir-ventana',"clientes")
        }
    }
})

ipcRenderer.on('mando-el-cliente',async(e,args)=>{
    ponerDatosCliente(JSON.parse(args))
})


listar.addEventListener('click',e=>{
    seleccionado = e.path[1]
    const sacarSeleccion = document.querySelector('.seleccionado')
    sacarSeleccion && sacarSeleccion.classList.remove('seleccionado')
    seleccionado.classList.toggle('seleccionado')
    if (seleccionado) {
        lista.forEach(listar=>{
            listar.nro_comp === seleccionado.id && mostrarDetalles(listar.productos,listar.vendedor);
        })
    }
})

const listarLista = (lista,situacion,tipo)=>{
    let aux
    (situacion === "negro") ? (aux = "Presupuesto") : (aux = "Ticket Factura")
    listaGlobal = lista.filter(e=>{
        if (aux === "Presupuesto") {
            return  (e.tipo_comp === aux ||  e.tipo_comp === "Recibos_P")   
        }else{
            return (e.tipo_comp === aux) || e.tipo_comp === "Recibos"
        }
    })
    listar.innerHTML = '';
    let saldoAcumulativo = 0;
    listaGlobal.forEach(venta => {
        vendedor = venta.vendedor
        let importe = 0.0;
        let saldo = 0;
        let pagado = 0;
        if (venta.tipo_comp !== "Recibos") {
            importe = (venta.precioFinal).toFixed(2);
            saldo = ((venta.precioFinal - venta.abonado).toFixed(2))
        }else if(tipo === "Recibos"){
            importe = (venta.precioFinal).toFixed(2);
            saldo = ((venta.precioFinal - venta.abonado).toFixed(2))
        }
        if ((venta.tipo_comp === "Presupuesto" || venta.tipo_comp === "Ticket Factura") && tipo === "historica") {
            pagado = "0.00";
        }else if (((venta.tipo_comp === "Ticket Factura" || venta.tipo_comp === "Presupuesto") && tipo === "compensada")) {
            pagado = (parseFloat(venta.abonado)).toFixed(2)
        }else if((venta.tipo_comp === "Recibos" || venta.tipo_comp === "Recibos_P") && venta.abonado !== "0" && tipo === "compensada" ){
            pagado = parseFloat(venta.abonado).toFixed(2)
        }else{
            pagado = parseFloat(venta.precioFinal).toFixed(2)
        }

        saldoAcumulativo = (venta.tipo_comp === "Presupuesto" || venta.tipo_comp === "Ticket Factura" ) ? saldoAcumulativo + venta.precioFinal : saldoAcumulativo-venta.precioFinal
        if (venta.length !== 0) {
            let fecha = new Date(venta.fecha)
            if (tipo === "compensada") {
                listar.innerHTML += `
                <tr id="${venta.nro_comp}">
                <td>${fecha.getUTCDate()}/${fecha.getUTCMonth()+1}/${fecha.getUTCFullYear()}</td>
                    <td>${venta.tipo_comp}</td>
                    <td>${venta.nro_comp}</td>
                    <td class = "importe">${importe}</td>
                    <td class = "pagado">${pagado}</td>
                    <td class = "saldo">${(saldo)}</td>
                    <td>${venta.observaciones}</td>
                </tr>
            `
            }else{
                listar.innerHTML += `
                <tr id="${venta.nro_comp}">
                <td>${fecha.getUTCDate()}/${fecha.getUTCMonth()+1}/${fecha.getUTCFullYear()}</td>
                    <td>${venta.tipo_comp}</td>
                    <td>${venta.nro_comp}</td>
                    <td class = "importe">${importe}</td>
                    <td class = "pagado">${pagado}</td>
                    <td class = "saldo">${(saldoAcumulativo).toFixed(2)}</td>
                    <td>${venta.observaciones}</td>
                </tr>
            `
            }
        }
    });
}

const detalle = document.querySelector('.detalle')
function mostrarDetalles(lista,vendedor) {
    detalle.innerHTML = ''
    if ((lista.length === 0)) {
        detalle.innerHTML = `<h3>Vendedor del recibo: ${vendedor}</h3>`
    }else{
    lista.forEach((producto) =>{
        let {objeto,cantidad} = producto 
        detalle.innerHTML += `
        <tr>
            <td>${objeto._id}</td>
            <td>${objeto.descripcion}</td>
            <td>${parseFloat(cantidad).toFixed(2)}</td>
            <td>${(parseFloat(objeto.precio_venta)).toFixed(2)}</td>
            <td>${(objeto.precio_venta*cantidad).toFixed(2)}</td>
            <td>${vendedor}</td>
        </tr>
        
        `
        })
    }
}

let ventaAModificar
let total = 0
let saldoABorrar = 0


    actualizar.addEventListener('click',e=>{
        if (seleccionado) {

        nuevaLista.find(e=>{
            if (e.nro_comp === seleccionado.id) {
                ventaAModificar=e;
            }
        })
        ventaAModificar.productos.forEach(producto=>{
             ipcRenderer.send('traerPrecio',producto.objeto._id)
             ipcRenderer.once('traerPrecio',(e,args) => {  

                const productoModificado = JSON.parse(args)
                if(producto.objeto._id === productoModificado._id){
                    producto.objeto.precio_venta = productoModificado.precio_venta
                    mostrarDetalles(ventaAModificar.productos)
                    total=sacarTotal(ventaAModificar.productos)
                    ventaAModificar.precioFinal = total.toFixed(2)
            }
            ipcRenderer.send('ventaModificada',[ventaAModificar,ventaAModificar.nro_comp,situacion])
            ipcRenderer.on('devolverVenta',(e,args)=>{
                let [venta,cliente ] = JSON.parse(args)
                ipcRenderer.send('imprimir-venta',[venta,cliente,false,1,"CD"])
            })
            location.reload()
            })
        })
        }else{
            alert("Venta no seleccionada")
        }

    })
function sacarTotal(arreglo){
    total = 0   
    arreglo.forEach((producto)=>{
        let cantidad = producto.cantidad
        let objeto = producto.objeto
        total += cantidad*(objeto.precio_venta)
    })
    return total
}

const botonFacturar = document.querySelector('#botonFacturar')
botonFacturar.addEventListener('click',() =>{
    if (seleccionado) {
        dialogs.promptPassword("Contraseña").then(value=>{
        ipcRenderer.invoke('traerUsuario',value).then((args)=>{
            if (JSON.parse(args) !== "") {
                ipcRenderer.send('abrir-ventana-emitir-comprobante',[JSON.parse(args).nombre,seleccionado.id,JSON.parse(args).empresa])   
            }
        })
        })

    }else{
        alert('Venta no seleccionada')
    }
})


document.addEventListener('keydown',e=>{
    if(e.key === "Escape"){
        window.history.go(-1)
    }
})

const ponerDatosCliente = async (Cliente)=>{
    clienteTraido = Cliente
    cliente.value = Cliente.cliente
    saldo.value = (parseFloat(Cliente.saldo)).toFixed(2)
    saldo_p.value = (parseFloat(Cliente.saldo_p)).toFixed(2)
    listaVentas=Cliente.listaVentas

    await ipcRenderer.invoke('traerVentas',listaVentas).then((args)=>{
        console.log(JSON.parse(args))
        lista = JSON.parse(args)
    })
        lista.forEach(venta =>{
            (venta.pagado === false || (venta.tipo_comp === "Recibos" && (venta.precioFinal < 0 || parseFloat(venta.abonado) > 0 ))) && nuevaLista.push(venta);
        })
        listarLista(nuevaLista,situacion,tipo)
}