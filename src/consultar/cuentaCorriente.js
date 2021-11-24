const { ipcRenderer } = require("electron")


const cliente = document.querySelector('#buscador')
const saldo = document.querySelector('#saldo')
const listar = document.querySelector('.listar')
let nuevaLista=[]
let lista=[]
vendedor = ""

cliente.addEventListener('keypress',e =>{
    e.key === 'Enter' &&  ipcRenderer.send('abrir-ventana',"clientes")
})

ipcRenderer.on('mando-el-cliente',async(e,args)=>{
    let Cliente = JSON.parse(args)
    cliente.value = Cliente.cliente
    saldo.value = Cliente.saldo_p
    listaVentas=Cliente.listaVentas

    await ipcRenderer.invoke('traerVentas',listaVentas).then((args)=>{
        lista = JSON.parse(args)
    })
        lista.forEach(venta =>{
            (venta.pagado === false) && nuevaLista.push(venta);
        })
        nuevaLista.forEach(venta => {
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
                    </tr>
                `
            }
        });
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
    nuevaLista.find(e=>{
        if (e._id === seleccionado.id) {
            ventaAModificar=e
            saldoABorrar = ventaAModificar.precioFinal
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
                console.log(ventaAModificar.precioFinal)
                ventaAModificar.precioFinal = total.toFixed(2)
        }
        
        ipcRenderer.send('ventaModificada',[ventaAModificar,ventaAModificar._id,saldoABorrar])
        location.reload()
        })
    })

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


document.addEventListener('keydown',e=>{
    if(e.key === "Escape"){
        window.history.go(-1)
    }
})