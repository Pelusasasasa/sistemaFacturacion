const { ipcRenderer } = require("electron")
const sweet = require('sweetalert2');

const Afip = require('@afipsdk/afip.js');
const afip = new Afip({ CUIT: 27165767433 });
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

const axios = require("axios");
require("dotenv").config;
const URL = process.env.URL;

const vendedor = getParameterByName('vendedor');

const Dialogs = require("dialogs");
const dialogs = Dialogs()

//cliente
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

//buscador
const codigo = document.querySelector('#codigo');
const descripcionAgregar = document.querySelector('.parte-producto_descripcion');
const precioAgregar = document.querySelector('.parte-producto_precio');
const agregarIva = document.querySelector('.parte-producto_iva');
const divNuevaCantidad = document.querySelector('.nuevaCantidad');
const divNuevoPrecio = document.querySelector('.nuevoPrecio');

//tabla
const resultado = document.querySelector('#resultado');

//descuento
const facturaOriginal = document.querySelector('#original');
const total = document.querySelector('#total');

//cobrado
const cobrado = document.querySelector('#cobrado');
const divVendedor = document.querySelector('.vendedor');
const radios = document.querySelectorAll('input[name=tipo]');

//parte Final
const factura = document.querySelector('.factura');
const cancelar = document.querySelector('.cancelar');
const borrarProducto = document.querySelector('.borrarProducto');

//alerta
const alerta = document.querySelector('.alerta');

divVendedor.children[0].innerHTML = vendedor

let cliente = {};
let listaProductos = [];
let seleccionado;
let subseleccionado
let totalPrecioProductos = 0;
let arregloMovimiento = [];
let arregloProductosDescontarStock = [];

codigoC.addEventListener('keypress',async e=>{
    if ((e.key === "Enter")) {
        if (codigoC.value !== "") {
            let cliente = (await axios.get(`${URL}clientes/id/${codigoC.value.toUpperCase()}`)).data;
                if (cliente==="") {
                    await sweet.fire({title:"Cliente no encontrado"});
                    codigoC.value = "";
                }else{
                    ponerInputsClientes(cliente)
                    codigoC.value === "9999" ? buscarCliente.focus() : observaciones.focus()
                }
        }else{
            ipcRenderer.send('abrir-ventana',"clientes")
            codigoC.value === "9999" ? buscarCliente.focus() : observaciones.focus()
        }
    }
})

ipcRenderer.on('mando-el-cliente',(e,args)=>{
    cliente = JSON.parse(args)
    ponerInputsClientes(cliente)
    
})

const verTipoPago = async ()=>{
    let a = "NINGUNO"
    await radios.forEach(async e=>{
         a = await e.checked ? e.value : a;
    })
    return a
}



 //Ponemos valores a los inputs
 async function ponerInputsClientes(cliente) {
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
    if (cliente.condicion==="M") {
        await sweet.fire({title:`${cliente.observacion}`});
    }
    if (codigoC.value === "9999") {
        buscarCliente.removeAttribute('disabled');
        telefono.removeAttribute('disabled');
        localidad.removeAttribute('disabled');
        direccion.removeAttribute('disabled');
        provincia.removeAttribute('disabled');
        dnicuit.removeAttribute('disabled');
        telefono.removeAttribute('disabled');
        conIva.removeAttribute('disabled');
    }else{
        buscarCliente.setAttribute('disabled',"");
        telefono.setAttribute('disabled',"");
        localidad.setAttribute('disabled',"");
        direccion.setAttribute('disabled',"");
        provincia.setAttribute('disabled',"");
        dnicuit.setAttribute('disabled',"");
        telefono.setAttribute('disabled',"");
        conIva.setAttribute('disabled',"");
    }
}

observaciones.addEventListener('keypress',(e)=>{
    if (e.key === "Enter") {
        codigo.focus()
    }
}) 


//Cuando buscamos un producto
codigo.addEventListener('keypress',async (e) => {
    if((codigo.value.length===3 || codigo.value.length===7) && e.key != "Backspace" && e.key !== "-" && e.key !== "Enter"){
        codigo.value = codigo.value + "-"
    }
    if (e.key === 'Enter') {

        if (!divNuevaCantidad.classList.contains('none')) {
            divNuevaCantidad.classList.add('none');
            divNuevoPrecio.classList.add('none');
            agregarIva.classList.add('none');
        }

        if (e.target.value === "999-999") {
            descripcionAgregar.classList.remove('none');
            agregarIva.classList.remove('none');
            precioAgregar.classList.remove('none');
            descripcionAgregar.children[0].focus();
        }else if (e.target.value !== "") {
            let producto = (await axios.get(`${URL}productos/${e.target.value}`)).data
                if (producto.length === 0) {
                        await sweet.fire({title:"No existe ese Producto"});
                        codigo.value = "";
                }else{
                    sweet.fire({
                        title:"Cantidad",
                        input:"text",
                        showCancelButton:true,
                        confirmButtonText:"Aceptar"
                    }).then(async({isConfirmed,value})=>{
                        if (isConfirmed && value !== "") {
                            if (!Number.isInteger(parseFloat(value)) && producto.unidad === "U") {
                                await sweet.fire({title:"La cantidad de este producto no puede ser en decimal"});
                            }else{
                                await mostrarVentas(producto,value)
                                e.target.value=""
                                codigo.focus()
                            }
                        }
                    }) 
                }
        }else{
            ipcRenderer.send('abrir-ventana',"productos")
        }
        
    }
});

descripcionAgregar.children[0].addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        agregarIva.children[0].focus();
    }
});

agregarIva.children[0].addEventListener('keypress',e=>{
    e.preventDefault();
    if (e.key === "Enter") {
        if (precioAgregar.classList.contains('none')) {
            divNuevoPrecio.children[1].focus();
        }else{
            precioAgregar.children[0].focus();
        }
    }
})

precioAgregar.addEventListener('keypress',e=>{
    if (e.key === "Enter" && codigo.value !== "888-888") {
        const product = {
            descripcion: descripcionAgregar.children[0].value,
            precio_venta: parseFloat(precioAgregar.children[0].value),
            _id:codigo.value,
            marca:"",
            unidad:"",
            iva:agregarIva.children[0].value
        }
        sweet.fire({
            input:"text",
            title:"Cantidad",
            showCancelButton:true,
            confirmButtonText:"Aceptar"
        }).then(async({isConfirmed,value})=>{
            if (isConfirmed && value !== "") {
                if(value !== "" && parseFloat(value) !== 0){
                    await mostrarVentas(product,parseFloat(value));
                };
                codigo.value = await "";
                codigo.focus();
                precioAgregar.children[0].value = await "";
                precioAgregar.classList.add('none');
                agregarIva.classList.add('none');
                agregarIva.children[0].value = "N";
                descripcionAgregar.children[0].value = await "";
                descripcionAgregar.classList.add('none');
            }
        })
    }
})

ipcRenderer.on('mando-el-producto',async(e,args)=>{
        const {producto,cantidad} = JSON.parse(args)
        await mostrarVentas(producto,cantidad)


})

let id = 1
const mostrarVentas = (objeto,cantidad)=>{
    totalPrecioProductos += (parseFloat(objeto.precio_venta)*parseFloat(cantidad));
    total.value = totalPrecioProductos.toFixed(2);
    resultado.innerHTML += `
        <tr id=${id}>
        <td class="tdEnd">${(parseFloat(cantidad)).toFixed(2)}</td>
        <td>${objeto._id}</td>
        <td>${objeto.descripcion}</td>
        <td class="tdEnd" >${(objeto.iva === "R" ? 10.50 : 21).toFixed(2)}</td>
        <td class="tdEnd">${parseFloat(objeto.precio_venta).toFixed(2)}</td>
        <td class="tdEnd">${(parseFloat(objeto.precio_venta)*(cantidad)).toFixed(2)}</td>
        </tr>
    `
    objeto.identificadorTabla = `${id}`
    id++;
    listaProductos.push({objeto,cantidad});
}

descuento.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        facturaOriginal.focus()
    }
})
descuento.addEventListener('blur',e=>{
    verDescuento()
})
const contado = document.querySelector('#CD');

cobrado.addEventListener('blur',e=>{
    if (cobrado.value !== "") {
        inputCobrado(cobrado.value)
    }
})

//cuando apretramos enter en el cobrado o le sacamos focos
cobrado.addEventListener('keypress',e=>{
    if(e.key === "Enter"){
        contado.focus()
    }
});

//ver si hay un descuento 
let Total = 0
function verDescuento() {
    Total = totalPrecioProductos
    descuentoN.value = (parseFloat(descuento.value)*Total/100).toFixed(2);
    total.value=(Total - parseFloat(descuentoN.value)).toFixed(2)
};

//si se sobra menos que se muestre cuanto es la diferencia
function inputCobrado(numero) {
    Total=totalPrecioProductos
    descuentoN.value =  (Total-parseFloat(numero)).toFixed(2);
    descuento.value = (parseFloat(descuentoN.value)*100/Total).toFixed(2);
    total.value = parseFloat(numero).toFixed(2);
}

factura.addEventListener('click',async e=>{
    e.preventDefault();
    alerta.classList.remove('none');
    try {
        const venta = {};
        venta.tipo_pago = await verTipoPago();
        if (facturaOriginal.value === "") {
            await sweet.fire({title:"No se escribio el numero de la factura Original",returnFocus:false})
            facturaOriginal.focus()
        }else if(listaProductos.length === 0){
            await sweet.fire({title:"No se cargo productos",returnFocus:false});
            codigo.focus();
        }else if(venta.tipo_pago === "NINGUNO"){
            await sweet.fire({title:"Elegir tipo de pago"});
        }else{
            venta.productos = listaProductos
            venta.fecha = new Date()
            venta.cliente = codigoC.value;
            venta.nombreCliente = buscarCliente.value;
            venta.tipo_comp = "Nota Credito";
            venta.observaciones = observaciones.value;
            venta.descuento = descuentoN.value;
            venta.cod_comp = verCod_comp(cliente.cond_iva)
            venta.productos = listaProductos;
            venta.numeroAsociado = facturaOriginal.value;
            venta.dnicuit = dnicuit.value;
            venta.cod_doc = (venta.dnicuit.length > 8) ? 80 : 96;
            venta.cod_doc = venta.dnicuit === "00000000" ? 99 : venta.cod_doc
            venta.condIva = conIva.value;
            venta.descuento = parseFloat(descuentoN.value);
            venta.precioFinal = parseFloat(total.value);
            venta.vendedor = vendedor;
            venta.direccion = direccion.value;
            if (venta.precioFinal>10000 && (buscarCliente.value === "A CONSUMIDOR FINAL" || dnicuit.value === "00000000")) {
                await sweet.fire({title:"Factura mayor a 10000, poner valores clientes"})
            }else{
                //modifcamos el precio del producto correspondiente con el descuenta
                for (let producto of venta.productos){
                    if (parseFloat(descuentoN.value) !== 0 && descuentoN.value !== "" ) {
                        producto.objeto.precio_venta =  (parseFloat(producto.objeto.precio_venta)) - parseFloat(producto.objeto.precio_venta)*parseFloat(descuento.value)/100
                        producto.objeto.precio_venta = producto.objeto.precio_venta.toFixed(2)
                    }
                }
                const [iva21,iva105,gravado21,gravado105,cant_iva] = gravadoMasIva(venta.productos);
                venta.iva21 = iva21;
                venta.iva105 = iva105;
                venta.gravado21 = gravado21;
                venta.gravado105 = gravado105;
                venta.cant_iva = cant_iva;  

                
                //Traemos la venta relacionada con la nota de credito
                let ventaRelacionada = (await axios.get(`${URL}ventas/factura/${venta.numeroAsociado}/${"Ticket Factura"}/${venta.condIva}`)).data;
                //subimos a la afip la factura electronica
                let afip = await subirAAfip(venta,ventaRelacionada);
                venta.nro_comp = `0005-${(afip.numero).toString().padStart(8,'0')}`;
                await actualizarNroCom(venta.nro_comp,venta.cod_comp);

                //mandamos para que sea compensada
                venta.tipo_pago === "CC" &&  ponerEnCuentaCorrienteCompensada(venta,true);
                //Mandamos par que sea historica
                venta.tipo_pago === "CC" && ponerEnCuentaCorrienteHistorica(venta,true,saldo.value);
                
                //mandamos la venta
                nuevaVenta = await axios.post(`${URL}ventas`,venta)
                //Imprimos el ticket
                ipcRenderer.send('imprimir-venta',[venta,afip,true,1,'Ticket Factura']);
                
                //Si la venta no es Presupuesto Presupuesto descontamos el stock y hacemos movimiento de producto
                if (venta.tipo_pago !== "PP") {
                    //Si la venta es CC le sumamos el saldo
                    venta.tipo_pago === "CC" && sumarSaldo(venta.precioFinal,venta.cliente);
                    //movimiento de producto y stock
                for await (let producto of venta.productos){
                        await agregarStock(producto.objeto._id,producto.cantidad);
                        await movimientoProducto(producto.objeto,producto.cantidad,venta);
                    }
                    await axios.put(`${URL}productos`,arregloProductosDescontarStock);
                    await axios.post(`${URL}movProductos`,arregloMovimiento);
                    arregloMovimiento = [];
                    arregloProductosDescontarStock = [];
                }
                //creamos el pdf
                alerta.children[0].innerHTML = "Guardando nota de credito como pdf"
                await axios.post(`${URL}crearPdf`,[venta,cliente,afip]);
                //reiniciamos la pagina
                location.href="../index.html";
           
        }}
    } catch (error) {
        console.error(error)
    }finally{
        alerta.classList.add('none');
    }
    });


//Agregamos el stock nuevo
const agregarStock = async (codigo,cantidad)=>{
    let producto = (await axios.get(`${URL}productos/${codigo}`)).data;
    const descontar = parseFloat(producto.stock) + parseFloat(cantidad);
    producto.stock = descontar.toFixed(2);
    arregloProductosDescontarStock.push(producto);
}

const movimientoProducto = async(objeto,cantidad,venta)=>{
    let movProducto = {}
    movProducto.codProd = objeto._id;
    movProducto.descripcion = objeto.descripcion;
    movProducto.cliente = venta.nombreCliente;
    movProducto.codCliente = venta.cliente;
    movProducto.comprobante = "Nota de Credito";
    movProducto.tipo_comp = venta.tipo_comp;
    movProducto.nro_comp=venta.nro_comp;
    movProducto.ingreso = cantidad;
    movProducto.stock = objeto.stock;
    movProducto.precio_unitario=objeto.precio_venta;
    movProducto.total=(parseFloat(movProducto.ingreso)*parseFloat(movProducto.precio_unitario)).toFixed(2)
    movProducto.vendedor = venta.vendedor;
    arregloMovimiento.push(movProducto)
}

//Sumamos el saldo al cluente si la venta  es Cuenta Corriente
const sumarSaldo = async(precio,id) =>{
    const cliente = (await axios.get(`${URL}clientes/id/${id}`)).data;
    saldoNuevo = parseFloat(cliente.saldo) - parseFloat(precio);
    cliente.saldo = saldoNuevo.toFixed(2);
    await axios.put(`${URL}clientes/${id}`,cliente)
}


//Trae el numero de comrpobante dependiendo de si es nota de credito A o B
const traerNumeroComprobante = async(codigo)=>{
    let retornar
    const tipo = (codigo === "008") ? "Ultima N Credito B" : "Ultima N Credito A"
    let numeros = (await axios.get(`${URL}tipoVenta`)).data;
    retornar = `${numeros[tipo]}`
    return retornar
}

//actualiza el numero de comprobante a uno mas
const actualizarNroCom = async(comprobante,codigo)=>{
    let numero
    let tipoFactura
    if (codigo === "008") {
        tipoFactura = "Ultima N Credito B"
    }else{
        tipoFactura = "Ultima N Credito A"
    }
    numero = comprobante.split('-')[1];
    numero = (parseFloat(numero) + 1).toString().padStart(8,0)
    let numeros = (await axios.get(`${URL}tipoVenta`)).data;
    numeros[tipoFactura] = `0005-${numero}`;
    await axios.put(`${URL}tipoventa`,numeros);
}

const verCod_comp = (iva)=>{
    if(iva === "Inscripto"){
        return 3
    }else{
        return 8
    }
}

cancelar.addEventListener('click',async e=>{
    sweet.fire({
        title:"Cancelar Nota Credito",
        showCancelButton:true,
        confirmButtonText:"Aceptar"
    }).then(({isConfirmed})=>{
        if (isConfirmed) {
            window.location = '../index.html'    
        }
    });
})


resultado.addEventListener('click',e=>{
    seleccionado && seleccionado.classList.remove('seleccionado')
    seleccionado = e.path[1];
    seleccionado.classList.add('seleccionado');
    if (seleccionado) {
        divNuevaCantidad.classList.remove('none');
        agregarIva.classList.remove('none');
        divNuevoPrecio.classList.remove('none');
        borrarProducto.classList.remove('none');
        agregarIva.children[0].value = seleccionado.children[3].innerHTML === "10.50" ? "R" : "N";
    }
})

//modificamos la cantidad del producto
divNuevaCantidad.children[1].addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        agregarIva.children[0].focus();
    }
});

divNuevoPrecio.children[1].addEventListener('keypress',e=>{
    if(e.key === "Enter"){
        let nuevoTotal = parseFloat(total.value);
        const producto = listaProductos.find(({objeto,cantidad})=>objeto.identificadorTabla === seleccionado.id);
        nuevoTotal -= parseFloat(producto.cantidad) * parseFloat(producto.objeto.precio_venta);
        producto.cantidad = divNuevaCantidad.children[1].value !== "" ? divNuevaCantidad.children[1].value : producto.cantidad;
        producto.objeto.precio_venta = divNuevoPrecio.children[1].value !== "" ? divNuevoPrecio.children[1].value : producto.objeto.precio_venta;
        producto.objeto.iva = agregarIva.children[0].value;
        const tr = document.getElementById(`${seleccionado.id}`);
        tr.children[0].innerHTML = parseFloat(producto.cantidad).toFixed(2);
        tr.children[3].innerHTML = producto.objeto.iva === "R" ? "10.50%" : "21.00";
        tr.children[4].innerHTML = parseFloat(producto.objeto.precio_venta).toFixed(2);
        tr.children[5].innerHTML = (parseFloat(producto.cantidad) * parseFloat(producto.objeto.precio_venta)).toFixed(2);
        nuevoTotal += parseFloat(producto.cantidad) * parseFloat(producto.objeto.precio_venta);
        totalPrecioProductos = nuevoTotal;
        total.value = nuevoTotal.toFixed(2);
        divNuevaCantidad.classList.add('none');
        divNuevoPrecio.classList.add('none');
        agregarIva.classList.add('none');
        divNuevoPrecio.children[1].value = "";
        divNuevaCantidad.children[1].value = "";
        agregarIva.children[0].value = "N";
        codigo.focus();
    }
})


 //lo usamos para borrar un producto de la tabla
 borrarProducto.addEventListener('click',e=>{
    if (seleccionado) {
        divNuevaCantidad.classList.add('none')
        divNuevoPrecio.classList.add('none')
        producto = listaProductos.find(e=>e.objeto.identificadorTabla === seleccionado.id);
        total.value = (parseFloat(total.value)-(parseFloat(producto.cantidad)*parseFloat(producto.objeto.precio_venta))).toFixed(2)
        listaProductos.forEach(e=>{
            if (seleccionado.id === e.objeto.identificadorTabla) {
                    listaProductos = listaProductos.filter(e=>e.objeto.identificadorTabla !== seleccionado.id)
            }
        })
        const a = seleccionado
        a.parentNode.removeChild(a)
    }
    let nuevoTotal = 0;
        listaProductos.forEach(({objeto,cantidad})=>{
            nuevoTotal += (objeto.precio_venta * cantidad);
        })
    total.value = (nuevoTotal - (nuevoTotal*parseFloat(descuento.value)/100)).toFixed(2);
    totalPrecioProductos = parseFloat(total.value);
    descuentoN.value = (nuevoTotal*parseFloat(descuento.value)/100).toFixed(2)
    codigo.focus();
})


buscarCliente.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        telefono.focus()
    }
})

telefono.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        direccion.focus()
    }
})

direccion.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        localidad.focus()
    }
})

localidad.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        provincia.focus()
    }
})

provincia.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        conIva.focus()
    }
})

conIva.addEventListener('keypress',e=>{
    e.preventDefault()
    if (e.key === "Enter") {
        dnicuit.focus()
    }
})

dnicuit.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        observaciones.focus()
    }
})


telefono.addEventListener('focus',e=>{
    selecciona_value(telefono.id)
})

buscarCliente.addEventListener('focus',e=>{
    selecciona_value(buscarCliente.id)
})
localidad.addEventListener('focus',e=>{
    selecciona_value(localidad.id)
})
provincia.addEventListener('focus',e=>{
    selecciona_value(provincia.id)
})
direccion.addEventListener('focus',e=>{
    selecciona_value(direccion.id)
})
dnicuit.addEventListener('focus',e=>{
    selecciona_value(dnicuit.id)
})

 //sacamos el gravado y el iva
 const gravadoMasIva = (ventas)=>{
    let totalIva105 = 0
    let totalIva21=0
    let gravado21 = 0 
    let gravado105 = 0 
    ventas.forEach(({objeto,cantidad}) =>{
        if (objeto.iva === "N") {
            gravado21 += parseFloat(cantidad)*(parseFloat(objeto.precio_venta)/1.21) 
            totalIva21 += parseFloat(cantidad)*(parseFloat(objeto.precio_venta)-(parseFloat(objeto.precio_venta))/1.21)
        }else{
            gravado105 += parseFloat(cantidad)*(parseFloat(objeto.precio_venta/1.105))
            totalIva105 += parseFloat(cantidad)*(parseFloat(objeto.precio_venta)-(parseFloat(objeto.precio_venta))/1.105)
        }
    })
    let cantIva = 1
    if (gravado105 !== 0 && gravado21 !== 0) {
        cantIva = 2;
    }
    return [parseFloat(totalIva21.toFixed(2)),parseFloat(totalIva105.toFixed(2)),parseFloat(gravado21.toFixed(2)),parseFloat(gravado105.toFixed(2)),cantIva]
 }


const subirAAfip = async(venta,ventaAsociada)=>{
    alerta.children[0].innerHTML = "Esperando confirmacion de la afip"
    const ventaAnterior = await afip.ElectronicBilling.getVoucherInfo(parseFloat(facturaOriginal.value),5,1); 
    const fecha = new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    let ultimoElectronica = await afip.ElectronicBilling.getLastVoucher(5,parseFloat(venta.cod_comp));
    let totalIva105 = 0
    let totalIva21=0
    let totalNeto21 = 0 
    let totalNeto105 = 0 
    venta.productos.forEach(({objeto,cantidad}) =>{
        if (objeto.iva === "N") {
            totalNeto21 += parseFloat(cantidad)*(parseFloat(objeto.precio_venta/1.21))
            totalIva21 += parseFloat(cantidad)*(parseFloat(objeto.precio_venta)-(parseFloat(objeto.precio_venta))/1.21)
        }else{
            totalNeto105 += parseFloat(cantidad)*(parseFloat(objeto.precio_venta/1.105))
            totalIva105 += parseFloat(cantidad)*(parseFloat(objeto.precio_venta)-(parseFloat(objeto.precio_venta))/1.105)
        }
    })
    let data = {
        'CantReg': 1,
        'CbteTipo': venta.cod_comp,
        "CbtesAsoc": [
            {
                "Tipo":ventaAnterior.CbteTipo,
                "PtoVta":ventaAnterior.PtoVta,
                "Nro":ventaAnterior.CbteHasta
                
            }
        ],
        'Concepto': 1,
        'DocTipo': venta.cod_doc,
        'DocNro': venta.dnicuit,
        'CbteDesde': ultimoElectronica + 1,
        'CbteHasta': ultimoElectronica+1,
        'CbteFch': parseInt(fecha.replace(/-/g, '')),
        'ImpTotal': venta.precioFinal,
        'ImpTotConc': 0,
        'ImpNeto': (totalNeto105+totalNeto21).toFixed(2),
        'ImpOpEx': 0,
        'ImpIVA': (totalIva21+totalIva105).toFixed(2), //Importe total de IVA
        'ImpTrib': 0,
        'MonId': 'PES',
        'PtoVta': 5,
        'MonCotiz' 	: 1,
        'Iva' 		: [],
        };
        
        if (totalNeto105 !=0 ) {
            data.Iva.push({
                    'Id' 		: 4, // Id del tipo de IVA (4 para 10.5%)
                    'BaseImp' 	: totalNeto105.toFixed(2), // Base imponible
                    'Importe' 	: totalIva105.toFixed(2) // Importe 
            })
        };
        if (totalNeto21 !=0 ) {
            data.Iva.push({
                    'Id' 		: 5, // Id del tipo de IVA (5 para 21%)
                    'BaseImp' 	: totalNeto21.toFixed(2), // Base imponible
                    'Importe' 	: totalIva21.toFixed(2) // Importe 
            })
        };
        const res = await afip.ElectronicBilling.createVoucher(data); //creamos la factura electronica
        alerta.children[0].innerHTML = "Nota de Credito Afip Aceptada"
        const qr = {
            ver: 1,
            fecha: fecha,
            cuit: 27165767433,
            ptoVta: 5 ,
            tipoCmp: venta.cod_comp,
            nroCmp: ultimoElectronica,
            importe: data.ImpTotal,
            moneda: "PES",
            ctz: 1,
            tipoDocRec: data.DocTipo,
            nroDocRec: parseInt(data.DocNro),
            tipoCodAut: "E",
            codAut: parseFloat(res.CAE)
        }
        const textoQR = btoa(JSON.stringify(qr));//codificamos lo que va en el QR
        const QR = await generarQR(textoQR,res.CAE,res.CAEFchVto)
        return {
            QR,
            cae:res.CAE,
            vencimientoCae:res.CAEFchVto,
            texto:textoQR,
            numero:ultimoElectronica + 1
        }
}


//Sirve para selecccionar todo un input
function selecciona_value(idInput) {
    valor_input = document.getElementById(idInput).value;
    longitud = valor_input.length;
    var selectionEnd = 0 + 1;
    if (document.getElementById(idInput).setSelectionRange) {
    document.getElementById(idInput).focus();
    document.getElementById(idInput).setSelectionRange (0, longitud);
    }
    else if (input.createTextRange) {
    var range = document.getElementById(idInput).createTextRange() ;
    range.collapse(true);
    range.moveEnd('character', 0);
    range.moveStart('character', longitud);
    range.select();
    }
    }

    //Generamos el qr
async function generarQR(texto) {
    const qrCode = require('qrcode');
    const url = `https://www.afip.gob.ar/fe/qr/?p=${texto}`;
    const QR = await qrCode.toDataURL(url)
    return QR;
}

//Inicio Compensada
const ponerEnCuentaCorrienteCompensada = async(venta,valorizado)=>{
    const cuenta = {};
    let id = await axios.get(`${URL}cuentaComp`)
    cuenta._id = id.data + 1;
    cuenta.codigo = venta.cliente;
    cuenta.fecha = new Date();
    cuenta.cliente = buscarCliente.value;
    cuenta.tipo_comp = venta.tipo_comp;
    cuenta.nro_comp = venta.nro_comp;
    cuenta.importe = valorizado ? parseFloat(venta.precioFinal) : 0.1;
    cuenta.saldo = valorizado ? parseFloat(venta.precioFinal) : 0.1;
    cuenta.observaciones = venta.observaciones;
    await axios.post(`${URL}cuentaComp`,cuenta)
}

//inicio historica
const ponerEnCuentaCorrienteHistorica = async(venta,valorizado,saldo)=>{
    const id = (await axios.get(`${URL}cuentaHisto`)).data + 1;
    const cuenta = {}
    cuenta._id = id;
    cuenta.codigo = venta.cliente;
    cuenta.cliente = buscarCliente.value;
    cuenta.tipo_comp = venta.tipo_comp;
    cuenta.nro_comp = venta.nro_comp;
    cuenta.debe = valorizado ? parseFloat(venta.precioFinal) : 0.1;
    cuenta.saldo = parseFloat(saldo) - cuenta.debe;
    await axios.post(`${URL}cuentaHisto`,cuenta);
}
