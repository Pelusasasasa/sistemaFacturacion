const { ipcRenderer } = require("electron")


const cliente = document.querySelector('#buscador')
const saldo = document.querySelector('#saldo')
const listar = document.querySelector('.listar')
let nuevaLista=[]
let lista=[]
let listaGlobal=[]
vendedor = ""
let seleccionado
let situacion = "blanco"

document.addEventListener('keydown',(event) =>{
    if (event.key === "Alt") {
       document.addEventListener('keydown',(e) =>{
           if (e.key === "F9" && situacion === "blanco") {
               mostrarNegro();
               situacion = 'negro'
               listarLista(nuevaLista,situacion)
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
              listarLista(nuevaLista,situacion)
          }
      })
  }
})

const ocultarNegro = ()=>{
    const saldo = document.querySelector('#saldo')
    const saldo_p = document.querySelector('#saldo_p')
    const botonFacturar = document.querySelector('#botonFacturar')
    const body = document.querySelector('.consultaCtaCte')
    saldo.classList.remove('none')
    saldo_p.classList.add('none')
    botonFacturar.classList.add('none')
    body.classList.remove('mostrarNegro')
}

const mostrarNegro = ()=>{
    const saldo = document.querySelector('#saldo')
    const saldo_p = document.querySelector('#saldo_p')
    const botonFacturar = document.querySelector('#botonFacturar')
    const body = document.querySelector('.consultaCtaCte')
    saldo.classList.add('none')
    botonFacturar.classList.remove('none')
    saldo_p.classList.remove('none')
    body.classList.add('mostrarNegro')
}

cliente.addEventListener('keypress',e =>{
    e.key === 'Enter' &&  ipcRenderer.send('abrir-ventana',"clientes")
})

ipcRenderer.on('mando-el-cliente',async(e,args)=>{
    let Cliente = JSON.parse(args)
    cliente.value = Cliente.cliente
    saldo.value = Cliente.saldo
    saldo_p.value = Cliente.saldo_p
    listaVentas=Cliente.listaVentas

    await ipcRenderer.invoke('traerVentas',listaVentas).then((args)=>{
        lista = JSON.parse(args)
    })
        lista.forEach(venta =>{
            (venta.pagado === false) && nuevaLista.push(venta);
        })
        listarLista(nuevaLista,situacion)
        
})


listar.addEventListener('click',e=>{
    seleccionado = e.path[1]
    const sacarSeleccion = document.querySelector('.seleccionado')
    sacarSeleccion && sacarSeleccion.classList.remove('seleccionado')
    seleccionado.classList.toggle('seleccionado')
    if (seleccionado) {
        lista.forEach(listar=>{
            listar._id === seleccionado.id && mostrarDetalles(listar.productos,seleccionado._id)
        })
    }
})

const listarLista = (lista,situacion)=>{
    let aux
    (situacion === "negro") ? (aux = "Presupuesto") : (aux = "Ticket Factura")
    listaGlobal = lista.filter(e=>e.tipo_comp === aux)
    listar.innerHTML = ''
    listaGlobal.forEach(venta => {
        vendedor = venta.vendedor
        if (venta.length !== 0) {
            let fecha = new Date(venta.fecha) 
            listar.innerHTML += `
                <tr id="${venta._id}">
                <td>${fecha.getUTCDate()}/${fecha.getUTCMonth()+1}/${fecha.getUTCFullYear()}</td>
                    <td>${venta.tipo_comp}</td>
                    <td>${venta.nro_comp}</td>
                    <td>${(venta.precioFinal).toFixed(2)}</td>
                    <td>${(parseFloat((venta.abonado))).toFixed(2)}</td>
                    <td>${(venta.precioFinal-venta.abonado).toFixed(2)}</td>
                    <td>${venta.observaciones}</td>
                </tr>
            `
        }
    });
}

const detalle = document.querySelector('.detalle')
function mostrarDetalles(lista) {
    detalle.innerHTML = ''
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

let ventaAModificar
let total = 0
let saldoABorrar = 0
const actualizar = document.querySelector('.actualizar')

    actualizar.addEventListener('click',e=>{
        if (seleccionado) {
        nuevaLista.find(e=>{
            if (e._id === seleccionado.id) {
                ventaAModificar=e
                saldoABorrar = ventaAModificar.precioFinal
                console.log(saldoABorrar)
            }
        })
        ventaAModificar.productos.forEach(producto=>{
             ipcRenderer.send('traerPrecio',producto.objeto._id)
             ipcRenderer.once('traerPrecio',(e,args) => {  
                 console.log(JSON.parse(args))
                const productoModificado = JSON.parse(args)
                if(producto.objeto._id === productoModificado._id){
                    producto.objeto.precio_venta = productoModificado.precio_venta
                    mostrarDetalles(ventaAModificar.productos)
                    total=sacarTotal(ventaAModificar.productos)
                    ventaAModificar.precioFinal = total.toFixed(2)
            }
            ipcRenderer.send('ventaModificada',[ventaAModificar,ventaAModificar._id,saldoABorrar])
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
        console.log(seleccionado.id)
        ipcRenderer.send('abrir-ventana-emitir-comprobante',seleccionado.id)
    }else{
        alert('Venta no seleccionada')
    }
})


document.addEventListener('keydown',e=>{
    if(e.key === "Escape"){
        window.history.go(-1)
    }
})