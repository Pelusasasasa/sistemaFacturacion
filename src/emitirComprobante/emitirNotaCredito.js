const { ipcRenderer } = require("electron")

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

const vendedor = getParameterByName('vendedor')

const Dialogs = require("dialogs");
const dialog = require("dialogs");
const dialogs = Dialogs()


const codigoC = document.querySelector('#codigoC');
const buscarCliente = document.querySelector('#nombre');
const saldo = document.querySelector('#saldo');
const saldo_p = document.querySelector('#saldo_p');
const localidad = document.querySelector('#localidad');
const direccion = document.querySelector('#direccion');
const provincia = document.querySelector('#provincia');
const dnicuit = document.querySelector('#dnicuit');
const telefono = document.querySelector('#telefono');
const conIva = document.querySelector('#conIva');
const observaciones = document.querySelector('#observaciones');
const codigo = document.querySelector('#codigo');
const resultado = document.querySelector('#resultado');
const total = document.querySelector('#total');
const original = document.querySelector('#original')
const factura = document.querySelector('.factura');
const cancelar = document.querySelector('.cancelar');


let cliente = {};
let venta = {};
let listaProductos = [];
precioFinal = 0;

codigoC.addEventListener('keypress',e=>{
    if ((e.key === "Enter")) {
        if (codigoC.value !== "") {
            ipcRenderer.invoke('get-cliente',codigoC.value.toUpperCase()).then((args)=>{
                if (JSON.parse(args)==="") {
                    alert("Cliente no encontrado")
                    codigoC.value = ""
                }else{
                    cliente = JSON.parse(args)
                    ponerInputsClientes(cliente)
                    observaciones.focus()
                }
            })
        }else{
            ipcRenderer.send('abrir-ventana',"clientes")
            observaciones.focus()
        }
    }
})



ipcRenderer.on('mando-el-cliente',(e,args)=>{
    cliente = JSON.parse(args)
    ponerInputsClientes(cliente)
    
})

 //Ponemos valores a los inputs
 function ponerInputsClientes(cliente) {
    const iva = (cliente.cond_iva !== "") ? cliente.cond_iva : "Consumidor Final"

    codigoC.value = cliente._id
    buscarCliente.value = cliente.cliente;
    saldo.value = cliente.saldo;
    saldo_p.value = cliente.saldo_p;
    localidad.value = cliente.localidad;
    direccion.value = cliente.direccion;
    provincia.value = cliente.provincia;
    dnicuit.value = cliente.cuit;
    telefono.value = cliente.telefono;
    conIva.value = iva;
    venta.cliente = cliente._id;
    if (cliente.condicion==="M") {
        alert(`${cliente.observacion}`)
    }
}

observaciones.addEventListener('keypress',(e)=>{
    if (e.key === "Enter") {
        codigo.focus()
    }
}) 


//Cuando buscamos un producto
codigo.addEventListener('keypress',(e) => {
    if(codigo.value.length===3 && e.key != "Backspace" && e.key !== "-"){
        codigo.value = codigo.value + "-"
    }
    if (e.key === 'Enter') {
        if (e.target.value !== "") {
            ipcRenderer.send('get-producto',e.target.value)
            ipcRenderer.once('get-producto',(a,args)=>{
                if (JSON.parse(args).length === 0) {
                        alert("No existe ese Producto")
                        codigo.value = "";
                        codigo.focus()
                }else{
                    dialogs.prompt("Cantidad",async valor=>{
                        if (valor === undefined) {
                            e.target.value = await "";
                            codigo.focus()
                        }else{
                            if (!Number.isInteger(parseFloat(valor)) && JSON.parse(args).unidad === "U") {
                                await alert("La cantidad de este producto no puede ser en decimal")
                                codigo.focus()
                            }else{
                                await mostrarVentas(JSON.parse(args),valor)
                                e.target.value=""
                                codigo.focus()
                                }
                        }

                        })   
                }
            })
        }else{
            ipcRenderer.send('abrir-ventana',"productos")
        }
        
    }
})

ipcRenderer.on('mando-el-producto',async(e,args)=>{
        const {producto,cantidad} = JSON.parse(args)
        await mostrarVentas(producto,cantidad)


})

let id = 1
const mostrarVentas = (objeto,cantidad)=>{
    precioFinal += (parseFloat(objeto.precio_venta)*cantidad);
    total.value = (parseFloat(precioFinal)).toFixed(2)
    resultado.innerHTML += `
        <tr id=${id}>
        <td>${objeto._id}</td>
        <td>${(parseFloat(cantidad)).toFixed(2)}</td>
        <td>${objeto.descripcion}</td>
        <td>${objeto.tasaIva === "normal" ? "10.50" : "21"}</td>
        <td>${parseFloat(objeto.precio_venta).toFixed(2)}</td>
        <td>${(parseFloat(objeto.precio_venta)*(cantidad)).toFixed(2)}</td>
        </tr>
    `
    objeto.identificadorTabla = `${id}`
    id++
    listaProductos.push({objeto,cantidad});
    venta.productos = listaProductos
}

console.log(descuento)

descuento.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        original.focus()
    }
})
descuento.addEventListener('blur',e=>{
    descuentoN.value =( parseFloat(total.value) - parseFloat((parseFloat(total.value) - parseFloat(total.value) * parseFloat(descuento.value) / 100).toFixed(2))).toFixed(2)
    total.value = (parseFloat(total.value) - parseFloat(total.value) * parseFloat(descuento.value) / 100).toFixed(2)

})

factura.addEventListener('click',async e=>{
    e.preventDefault();
    const venta = {};
    venta._id = await tamanioVentas();
    venta.cliente = cliente._id;
    venta.tipo_comp = "Nota Credito";
    venta.observaciones = observaciones.value;
    venta.descuento = descuentoN.value;
    venta.cod_comp = verCod_comp(cliente.cond_iva)
    venta.nro_comp = await traerNumeroComprobante(venta.cod_comp)
    venta.comprob = venta.nro_comp;
    venta.productos = listaProductos;
    venta.tipo_pago = "CD";
    venta.cod_doc = (cliente.cuit.length > 8) ? 80 : 96;
    venta.dnicuit = cliente.cuit;
    venta.conIva = cliente.cond_iva;
    venta.pagado = true;
    venta.abonado = "0";
    venta.descuento = parseFloat(descuentoN.value);
    venta.precioFinal = parseFloat(total.value);
    venta.vendedor = vendedor
    console.log(venta)
})


const traerNumeroComprobante = async(codigo)=>{
    let retornar
    const tipo = (codigo === 113) ? "Ultima N Credito B" : "Ultima N Credito A"
    await ipcRenderer.invoke('traerNumeros',tipo).then((args)=>{
        retornar = JSON.parse(args)
    });
    return retornar
}

const verCod_comp = (iva)=>{
    if(iva === "Inscripto"){
        return "112"
    }else{
        return "113"
    }
}

const tamanioVentas = async()=>{
    let retornar
    await ipcRenderer.invoke('tamanioVentas').then(async(args)=>{
        retornar = await JSON.parse(args)
    })
    return retornar
}

cancelar.addEventListener('click',e=>{
    window.location = '../index.html'
})