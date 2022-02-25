const Afip = require('@afipsdk/afip.js');
const afip = new Afip({ CUIT: 27165767433 });

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

const Dialogs = require("dialogs");
const dialogs = Dialogs()
let vendedor = getParameterByName('vendedor')
let empresa = getParameterByName('empresa')
const { ipcRenderer, Main } = require("electron");
const usuario = document.querySelector(".usuario")
const textoUsuario = document.createElement("P")
textoUsuario.innerHTML = vendedor
usuario.appendChild(textoUsuario)
const resultado = document.querySelector('#resultado');
const codigoC = document.querySelector('#codigoC')
const buscarCliente = document.querySelector('#nombre');
const saldo = document.querySelector('#saldo');
const localidad = document.querySelector('#localidad');
const direccion = document.querySelector('#direccion');
const provincia = document.querySelector('#provincia');
const dnicuit = document.querySelector('#dnicuit');
const telefono = document.querySelector('#telefono');
const conIva = document.querySelector('#conIva');
const total = document.querySelector('#total');
const ventaValorizado = document.querySelector('.ventaValorizado')
const valorizado = document.querySelector('.valorizado')
const imprimirCheck = document.querySelector('.imprimirCheck')
const impresion = document.querySelector('.impresion')
const observaciones = document.querySelector('#observaciones')
const codigo = document.querySelector('#codigo')
const tiposVentas = document.querySelectorAll('input[name="tipoVenta"]')
const borrarProducto = document.querySelector('.borrarProducto')
const inputEmpresa = document.querySelector('#empresa')
inputEmpresa.value = empresa;

let situacion = "blanco"//para teclas alt y F9
let totalPrecioProducos = 0;
let yaSeleccionado;
let tipoVenta;
let borraNegro = false;
let ventaDeCtaCte = "";
codigoC.focus()



 document.addEventListener('keydown',(event) =>{
     if (event.key === "Alt") {
        document.addEventListener('keydown',(e) =>{
            if (e.key === "F9" && situacion === "blanco") {
                mostrarNegro();
                situacion = 'negro'
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
           }
       })
   }
})


 //Musetra las cosas en negro
function mostrarNegro() {
    const bodyNegro = document.querySelector('.emitirComprobante')
    const saldoNegro = document.querySelector(".saldoNegro")
    const saldo = document.querySelector(".saldo")
    const ventaNegro = document.querySelector(".ventaNegro")
    const ticketFactura = document.querySelector('.ticketFactura')
    const parteNegra = document.querySelector('.parteNegra')
        parteNegra.classList.add('formulario-negro')
        parteNegra.classList.remove('formulario-verde')
        const total = document.querySelector('.total')
        total.classList.add('formulario-negro')
        total.classList.remove('formulario-verde')
        const tipoVenta = document.querySelector('.tipoVenta')
        tipoVenta.classList.add('formulario-negro')
        tipoVenta.classList.remove('formulario-verde')
        const partefinal = document.querySelector('.partefinal')
        partefinal.classList.add('formulario-negro')
        partefinal.classList.remove('formulario-verde')
        saldoNegro.classList.remove('none')
        saldo.classList.add('none')
        bodyNegro.classList.add('mostrarNegro')
        ventaNegro.classList.remove('none')
        ticketFactura.classList.add('none')
        ventaValorizado.classList.remove('none')
        imprimirCheck.classList.remove('none')
}

function ocultarNegro() {
    const bodyNegro = document.querySelector('.emitirComprobante')
    const saldoNegro = document.querySelector(".saldoNegro")
    const saldo = document.querySelector(".saldo")
    const ventaNegro = document.querySelector(".ventaNegro")
    const ticketFactura = document.querySelector('.ticketFactura')
    const parteNegra = document.querySelector('.parteNegra')
    parteNegra.classList.remove('formulario-negro')
    parteNegra.classList.add('formulario-verde')
    const tipoVenta = document.querySelector('.tipoVenta')
    tipoVenta.classList.remove('formulario-negro')
    tipoVenta.classList.add('formulario-verde')
    const total = document.querySelector('.total')
    total.classList.remove('formulario-negro')
    total.classList.add('formulario-verde')
    const partefinal = document.querySelector('.partefinal')
    partefinal.classList.remove('formulario-negro')
    partefinal.classList.add('formulario-verde')

        saldoNegro.classList.add('none')
        saldo.classList.remove('none')
        bodyNegro.classList.remove('mostrarNegro')
        ventaNegro.classList.add('none')
        ticketFactura.classList.remove('none')
        ventaValorizado.classList.add('none')
        imprimirCheck.classList.add('none')
}

let cliente = {}
let producto = {}
let venta = {}
let listaProductos = []
let Preciofinal = 0
venta.vendedor = vendedor

//abrimos una ventana para buscar el cliente
codigoC.addEventListener('keypress', (e) =>{
    if (e.key === 'Enter'  ) {
        if ( codigoC.value!=="") {
            ipcRenderer.invoke('get-cliente',(codigoC.value).toUpperCase()).then((args)=>{
                cliente = JSON.parse(args)
                if (cliente === "") {
                    alert("Cliente no encontrado")
                    codigoC.value = ""
                }else{
                    ponerInputsClientes(JSON.parse(args))
                    codigoC.value === "9999" ? buscarCliente.focus() : observaciones.focus()
                }
            })
        }else{
            ipcRenderer.send('abrir-ventana',"clientes")
        }
     }
})

codigoC.addEventListener('focus',e=>{
    codigoC.value=""
})

//recibimos el cliente
ipcRenderer.on('mando-el-cliente',(e,args)=>{ 
    cliente = JSON.parse(args)
    ponerInputsClientes(cliente);//ponemos en los inputs los valores del cliente
    codigoC.value === "9999" ? buscarCliente.focus() : observaciones.focus()
})

observaciones.addEventListener('keypress',e=>{
    if (e.key==='Enter') {
        codigo.focus()
    }
})


//Cuando buscamos un producto
codigo.addEventListener('keypress',(e) => {

    if((codigo.value.length===3 || codigo.value.length===7) && e.key != "Backspace" && e.key !== "-" && e.key !== "Enter"){
        codigo.value = codigo.value + "-"
    }
    if (e.key === 'Enter') {
        if (e.target.value !== "") {
            if (codigo.value === "999-999") {
                const descripcion = document.querySelector('.parte-producto_descripcion')
                const precio = document.querySelector('.parte-producto_precio')
                descripcion.classList.remove('none')
                precio.classList.remove('none')
                descripcion.children[0].focus()
                precio.addEventListener('keypress',e=>{
                    if (e.key === "Enter") {
                        const product = {
                            descripcion: descripcion.children[0].value,
                            precio_venta: parseFloat(precio.children[0].value),
                            _id:codigo.value
                        }
                        dialogs.prompt("Cantidad",async valor =>{
                            await mostrarVentas(product,valor)
                            codigo.value = "";
                            codigo.focus()
                            precio.classList.add('none')
                            descripcion.classList.add('none')
                        })
                    }

                })

            }else if(codigo.value === "888-888"){
                const precio = document.querySelector('.parte-producto_precio')
                let descripcion = document.querySelector('.parte-producto_descripcion')
                descripcion.classList.remove('none')
                ipcRenderer.send('get-producto',"888-888");
                ipcRenderer.on('get-producto',(e,args)=>{
                    descripcion.children[0].value = JSON.parse(args).descripcion;
                })
                precio.classList.remove('none')
                precio.children[0].focus()
                precio.addEventListener('keypress',e=>{
                    if (e.key === "Enter") {
                        const product = {
                            descripcion: descripcion.children[0].value,
                            precio_venta: parseFloat(precio.children[0].value),
                            _id:codigo.value
                        }
                        dialogs.prompt("Cantidad",async valor =>{
                            await mostrarVentas(product,valor)
                            codigo.value = "";
                            precio.children[0].value = "";
                            descripcion.children[0].value = "";
                            codigo.focus()
                            precio.classList.add('none')
                            descripcion.classList.add('none')
                        })
                    }
                })
            }else{

            ipcRenderer.send('get-producto',e.target.value)
            ipcRenderer.once('get-producto',(a,args)=>{
                if (JSON.parse(args).length === 0) {
                        alert("No existe ese Producto")
                        codigo.value = "";
                        codigo.focus()
                }else{
                    dialogs.prompt("Cantidad",async valor=>{
                        if (valor === undefined || valor === "" || parseFloat(valor) === 0) {
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
        }
        }else{
            ipcRenderer.send('abrir-ventana',"productos")
        }
        
    }
})

ipcRenderer.on('mando-el-producto',(e,args) => {
    const {producto,cantidad} = JSON.parse(args);
    mostrarVentas(producto,cantidad)
})
let id = 1 //id de la tabla de ventas
function mostrarVentas(objeto,cantidad) {
    (objeto.precio_venta === "0.00" || objeto.precio_venta === "0.0" || objeto.precio_venta === "0") && alert("Precio del producto en 0")

    if (objeto.stock <= 0) {
        alert("Stock En Negativo")
    }

    Preciofinal += (parseFloat(objeto.precio_venta)*cantidad);
    total.value = (parseFloat(Preciofinal)).toFixed(2)
    resultado.innerHTML += `
        <tr id=${id}>
        <td class="tdEnd">${(parseFloat(cantidad)).toFixed(2)}</td>
        <td>${objeto._id}</td>
        <td>${objeto.descripcion}</td>
        <td class="tdEnd">${(objeto.iva !== "N" ? 10.50 : 21).toFixed(2)}</td>
        <td class="tdEnd">${parseFloat(objeto.precio_venta).toFixed(2)}</td>
        <td class="tdEnd">${(parseFloat(objeto.precio_venta)*(cantidad)).toFixed(2)}</td>
        </tr>
    `
    objeto.identificadorTabla = `${id}`;
    id++;
    totalPrecioProducos += (objeto.precio_venta * cantidad);
    listaProductos.push({objeto,cantidad});
}

const cambioPrecio = document.querySelector('.parte-producto_cambioPrecio')
const nuevaCantidadDiv = document.querySelector('.parte-producto_cantidad')

resultado.addEventListener('click',e=>{
    inputseleccionado(e.path[1])
    if (yaSeleccionado) {
        borrarProducto.classList.remove('none')
        cambioPrecio.classList.remove('none')
        nuevaCantidadDiv.classList.remove('none')
    }
})


//Para Cambiar el precio de un producto
cambioPrecio.children[1].addEventListener('keypress',(e)=>{
    if (e.key === "Enter") {
        const  producto = listaProductos.find(({objeto,cantidad})=> objeto.identificadorTabla === yaSeleccionado.id);
        borrarUnProductoDeLaLista(yaSeleccionado)
        if (producto) {
            const index = listaProductos.indexOf(producto)
            listaProductos.splice(index,1)
        }
        producto.objeto.precio_venta = parseFloat(cambioPrecio.children[1].value)
        mostrarVentas(producto.objeto,producto.cantidad)
        cambioPrecio.children[1].value = "";
        cambioPrecio.classList.add('none');
        codigo.focus()
        
    }
})

//Para cambiar la cantidad
const nuevaCantidad = document.querySelector('#nuevaCantidad');
nuevaCantidad.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        const producto = listaProductos.find(({objeto,cantidad}) => objeto.identificadorTabla === yaSeleccionado.id);
        borrarUnProductoDeLaLista(yaSeleccionado)
        if (producto) {
            const index = listaProductos.indexOf(producto)
            listaProductos.splice(index,1)
        }
        producto.cantidad = parseFloat(nuevaCantidad.value);
        mostrarVentas(producto.objeto,producto.cantidad);
        nuevaCantidad.value = "";
        nuevaCantidadDiv.classList.add('none')
        codigo.focus()
    }
})

const inputseleccionado = (e) =>{
    yaSeleccionado && yaSeleccionado.classList.remove('seleccionado')
   e.classList.toggle('seleccionado')
   yaSeleccionado = document.querySelector('.seleccionado')
}

//FIN TABLA PRODUCTOS

//INICIO PARTE DE DESCUENTO


//aplicamos el descuento
const descuento = document.querySelector('#descuento')
const descuentoN = document.querySelector('#descuentoN')
descuento.value=0
descuentoN.value=0
descuento.addEventListener('blur',()=>{
    verDescuento();
})

//aplicamos el descuento de cobrado
const cobrado = document.querySelector('#cobrado')
cobrado.addEventListener('blur',()=>{
    inputCobrado(cobrado.value)
})
cobrado.addEventListener('keypress',e=>{
    if(e.key === "Enter"){
        contado.focus()
    }
})

//ver si hay un descuento 
let Total = 0
function verDescuento() {
     Total = totalPrecioProducos
    descuentoN.value = redondear(descuento.value*Total/100);
    total.value=redondear(Total - descuentoN.value);
}

//si se sobra menos que se muestre cuanto es la diferencia
function inputCobrado(numero) {
    Total=totalPrecioProducos
    descuentoN.value =  redondear(Total-numero)
    descuento.value = redondear(descuentoN.value*100/Total)
    total.value = numero;
}
//FIN PARTE DE DESCUENTO




//Vemos el numero para saber de la ultima factura a o b
let texto =""

//Vemos si la venta es cc, contando, presupuesto
let tipoPago = "Ninguno"
function verElTipoDeVenta(tipo) {
    tipo.forEach(e => {
        if (e.checked) {
          tipoPago = e.value
        }
    });
}

//ver el numero de comprobonante para el codigo
function verCodComprobante(tipo){
    if (tipo === "Ticket Factura") {
    if (conIva.value === "Inscripto") {
        return 1
    } else {
        return 6
    }
    }else{
        return " "
    }
}

function verQueVentaEs(tipo,cod_comp) {
    if (tipo === "Presupuesto") {
        return "Ultimo Presupuesto"
    }else if(tipo === "Ticket Factura" && cod_comp === 1){
        return "Ultima Factura A"
    }else if(tipo ===  "Ticket Factura" && cod_comp === 6){
        return "Ultima Factura B"
    }else if(tipo === "Cuenta Corriente"){
        return "Ultimo Remito Cta Cte"
    }else if(tipo === "Contado"){
        return "Ultimo Remito Contado"
    }
}

//numero de comprobante de ticket factura
async function traerUltimoNroComprobante(tipoCom,codigoComprobante,tipo_pago) {

        if (tipoCom==="Ticket Factura") {
            const numeroFactura = verQueVentaEs(tipoCom,codigoComprobante)
            const tipoVenta = await traerNumeroDeFactura(numeroFactura)
            return tipoVenta
        }else if(tipoCom === "Presupuesto" & tipo_pago==="CD"){
            const numeroFactura =  verQueVentaEs("Contado")
            const tipoVenta =  await traerNumeroDeFactura(numeroFactura)
            return tipoVenta
        }else if(tipoCom === "Presupuesto" & tipo_pago === "CC"){
            const numeroFactura = verQueVentaEs("Cuenta Corriente")
            const tipoVenta = await traerNumeroDeFactura(numeroFactura)
            return tipoVenta
        }else if(tipoCom === "Presupuesto" & tipo_pago === "PP"){
            const numeroFactura = verQueVentaEs("Presupuesto")
            const tipoVenta = await traerNumeroDeFactura(numeroFactura)
            return tipoVenta
        }
    }

    //propiedad comprobante
    function numeroComprobante(tipo){
        if (tipo === "Ticket Factura") {
            venta.cod_doc = codDoc(dnicuit.value)
            venta.dnicuit = dnicuit.value
            venta.condIva = conIva.value
        }

    }

//propiedad cod_doc vemos si es dni o cuit para retornar el codDoc
function codDoc(dniocuit) {
    if (dniocuit.length > 8) {
        return 80
    } else {
        return 96
    }
}

//propiedad tipo_pago retoranos un cd o cc dependiendo
function tipopago(tipo) {
    if (tipo === "Cuenta Corriente") {
        return "CC"
    }else if(tipo === "Contado"){
        return "CD"
    }else if(tipo === "Presupuesto"){
        return "PP"
    }
}

//Vamos a descontar el stock 
function sacarStock(cantidad,objeto) {
    ipcRenderer.send('descontarStock',[cantidad,objeto._id])
}

//INICIO MOVPRODUCTOS

const traerTamanioDeMovProducto = async()=>{
    let retornar
    await ipcRenderer.invoke('traerTamanioMovProductos').then((id)=>{
        retornar = id
    })
    return retornar
}

//Registramos un movimiento de producto
async function movimientoProducto(cantidad,objeto){
    const id = await traerTamanioDeMovProducto()
    let movProducto = {}
    movProducto._id = (id + 1).toFixed(0)
    movProducto.codProd = objeto._id
    movProducto.descripcion = objeto.descripcion
    movProducto.cliente = cliente.cliente
    movProducto.comprobante = tipoVenta
    movProducto.tipo_comp = venta.tipo_comp
    movProducto.nro_comp=venta.nro_comp
    movProducto.egreso = cantidad
    movProducto.stock = objeto.stock
    movProducto.precio_unitario=objeto.precio_venta
    movProducto.total=(parseFloat(movProducto.egreso)*parseFloat(movProducto.precio_unitario)).toFixed(2)
    movProducto.vendedor = venta.vendedor;
    await ipcRenderer.send('movimiento-producto',movProducto)
}

//FIN MOV PRODUCTOS
function verNumero(condicion) {
    if (condicion === "Inscripto") {
        return  "Ultima Factura A"
    }else{
        return  "Ultima Factura B"
    }
}

//Vemos el numero de factura para las tarjetas
const numeroDeFactura = document.querySelector('.numeroDeFactura')
numeroDeFactura.addEventListener('click', () =>{
    const mostrar = document.querySelector('#numeroFactura')
    texto = verNumero(cliente.cond_iva)
    traerNumeroDeFactura(texto,mostrar)
})


//redondea un numero a dos decimales
function redondear(numero) {
    return (parseFloat((Math.round(numero + "e+2") +  "e-2")));

}

 async function traerNumeroDeFactura(texto,mostrar) {
    let retornar;
     await ipcRenderer.invoke('traerNumeros',texto).then((args)=>{
        mostrar && (mostrar.value = JSON.parse(args))
        retornar = JSON.parse(args)
    })
    return retornar
}


const tamanioVentas = async(tipoVenta)=>{//tipoVenta = Presupuesto o Ticket Factura
    let retornar
    await ipcRenderer.invoke('tamanioVentas',tipoVenta).then(async(args)=>{
        retornar = await JSON.parse(args)
    })
    return retornar
}

function actualizarNumeroComprobante(comprobante,tipo_pago,codigoComp) {
    let numero
    let tipoFactura
    let [n1,n2] = comprobante.split('-')
    if (comprobante.split('-').length === 2) {
    n2 = parseFloat(n2)+1
    n2 = n2.toString().padStart(8,0)
    numero = n1+'-'+n2

    if (tipo_pago==="CD") {
        tipoFactura = verQueVentaEs("Contado",codigoComp)
    }else if(tipo_pago==="CC"){
        tipoFactura = verQueVentaEs("Cuenta Corriente",codigoComp)
    }else{
        tipoFactura = verQueVentaEs("Presupuesto",codigoComp)
    }
    }else{
        numero = parseFloat(n1)+1
        numero = numero.toString().padStart(8,0)
        tipoFactura = verQueVentaEs("Ticket Factura",codigoComp)
    }
    ipcRenderer.send('modificar-numeros',[numero,tipoFactura])
}

//ponemos el atributo pagado
function verSiPagoONo(texto) {
    if (texto === "CD"){
        return true
    }else{
        return false
    }
 }


//pasamos el saldo en negro
function sumarSaldoAlClienteEnNegro(precio,codigo){
    ipcRenderer.send('sumarSaldoNegro',[precio,codigo])
}

function sumarSaldoAlCliente(precio,codigo) {
    ipcRenderer.send('sumarSaldo',[precio,codigo])
}
const sacarIdentificadorTabla = (arreglo)=>{
    arreglo.forEach(producto=>{
        delete producto.objeto.identificadorTabla  
    })
}

console.log(descuentoN)

//Aca mandamos la venta en presupuesto
const presupuesto = document.querySelector('.presupuesto')
presupuesto.addEventListener('click',async (e)=>{
    e.preventDefault()
    if (listaProductos.length===0) {
        alert("Cargar Productos")
    }else{
        venta.productos = listaProductos
        verElTipoDeVenta(tiposVentas) //vemos si es contado,cuenta corriente o presupuesto en el input[radio]
        if (tipoPago === "Ninguno") {
                alert("Seleccionar un modo de venta")
        }else{
            venta.nombreCliente = buscarCliente.value;
            tipoVenta="Presupuesto"
            venta._id = await tamanioVentas("presupuesto")
            venta.descuento = (descuentoN.value);
            venta.precioFinal = redondear(total.value)
            venta.tipo_comp = tipoVenta
            venta.tipo_pago = tipopago(tipoPago)
            venta.nro_comp = await traerUltimoNroComprobante(tipoVenta,venta.Cod_comp,venta.tipo_pago);
            venta.empresa = inputEmpresa.value;
            venta.pagado = verSiPagoONo(venta.tipo_pago);//Ejecutamos para ver si la venta se pago o no
            let valorizadoImpresion = "valorizado"
            if (!valorizado.checked && venta.tipo_pago === "CC") {
            venta.precioFinal = "0.1" 
            valorizadoImpresion="no valorizado"
            }
            
            sacarIdentificadorTabla(venta.productos);
            if (venta.tipo_pago !== "PP") {
                venta.tipo_pago === "CC" && sumarSaldoAlClienteEnNegro(venta.precioFinal,cliente._id);
            for (let producto of venta.productos){
                    if (parseFloat(descuentoN.value) !== 0 && descuentoN.value !== "" ) {
                        producto.objeto.precio_venta = parseFloat(producto.cantidad) * (parseFloat(producto.objeto.precio_venta)) - parseFloat(producto.cantidad)*parseFloat(producto.objeto.precio_venta)*parseFloat(descuento.value)/100
                        producto.objeto.precio_venta = producto.objeto.precio_venta.toFixed(2)
                    }
                    sacarStock(producto.cantidad,producto.objeto)
                    await movimientoProducto(producto.cantidad,producto.objeto)
                }
            }
            actualizarNumeroComprobante(venta.nro_comp,venta.tipo_pago,venta.cod_comp)
            ipcRenderer.send('nueva-venta',venta);
            if (impresion.checked) {
                if (venta.tipo_pago === "CC") {
                    ipcRenderer.send('imprimir-venta',[venta,cliente,true,2,"imprimir-comprobante",,{},valorizadoImpresion])
                }else{
                    ipcRenderer.send('imprimir-venta',[venta,cliente,false,1,"imprimir-comprobante",,{},valorizadoImpresion])
                }
            }
            window.location = "../index.html"
        }
    }
})

//Aca mandamos la venta con tikect Factura
const ticketFactura = document.querySelector('.ticketFactura')
ticketFactura.addEventListener('click',async (e) =>{
    e.preventDefault()

    const stockNegativo = listaProductos.find(producto=>producto.cantidad < 0)
    if(stockNegativo){
        alert("Ticket Factura no puede ser productos en negativo");
    }else if(listaProductos.length===0){
        alert("Ningun producto cargado")
    }else{
     venta.productos = listaProductos;
      tipoVenta = "Ticket Factura"
      verElTipoDeVenta(tiposVentas)//vemos si es contado,cuenta corriente o presupuesto en el input[radio]
      if (tipoPago === "Ninguno") {
         alert("Seleccionar un modo de venta")
         }else{
         venta.nombreCliente = buscarCliente.value;
         venta._id = await tamanioVentas("ticket factura");
         venta.observaciones = observaciones.value
         venta.fecha = new Date()
         venta.descuento = (descuentoN.value);
         venta.precioFinal = redondear(total.value);
         venta.tipo_comp = tipoVenta;
         numeroComprobante(tipoVenta);
         venta.cod_comp = verCodComprobante(tipoVenta)
         venta.nro_comp = await traerUltimoNroComprobante("Ticket Factura",venta.cod_comp)
         venta.pagado = verSiPagoONo(venta.tipo_pago)
         venta.tipo_pago = tipopago(tipoPago)   
         venta.tipo_pago === "CD" ? (venta.pagado = true) : (venta.pagado = false)
         venta.comprob = venta.nro_comp;


         if (venta.precioFinal >=10000 && (buscarCliente.value === "A CONSUMIDOR FINAL" && dnicuit.value === "00000000" && direccion.value === "CHAJARI")) {
             alert("Factura mayor a 10000, poner datos cliente")
         }else{
         venta.tipo_pago === "CC" && sumarSaldoAlCliente(venta.precioFinal,venta.cliente);
         venta.empresa = inputEmpresa.value;
         for(let producto of venta.productos){
            if (parseFloat(descuentoN.value) !== 0 && descuentoN.value !== "" ) {
                producto.objeto.precio_venta = parseFloat(producto.cantidad) * (parseFloat(producto.objeto.precio_venta)) - parseFloat(producto.cantidad)*parseFloat(producto.objeto.precio_venta)*parseFloat(descuento.value)/100
                producto.objeto.precio_venta = producto.objeto.precio_venta.toFixed(2)
            }
             sacarStock(producto.cantidad,producto.objeto)
             await movimientoProducto(producto.cantidad,producto.objeto)
         };
         actualizarNumeroComprobante(venta.nro_comp,venta.tipo_pago,venta.cod_comp)
         const afip = await subirAAfip(venta)

         await ipcRenderer.send('nueva-venta',venta);
         ipcRenderer.send('imprimir-venta',[venta,cliente,false,1,"ticket-factura","SAM4S GIANT-100",afip])
         //imprimirTikectFactura(venta,cliente)
         //imprimirItem(venta,cliente)

         if (borraNegro) {
             ipcRenderer.on('clienteModificado',async(e,args)=>{
                 await borrarCuentaCorriente(ventaDeCtaCte)
             })

         };
         !borraNegro && (window.location = '../index.html');

         }
     }
    }
 })


//Generamos el qr
async function generarQR(texto) {
    const fs = require('fs')
    const url = `https://www.afip.gob.ar/fe/qr/?p=${texto}`;
    return url
}

//funcion que busca en la afip a una persona
 const buscarAfip = document.querySelector('.buscarAfip')
 buscarAfip.addEventListener('click',  (e)=>{
    ipcRenderer.send('buscar-cliente',dnicuit.value)
    ipcRenderer.on('buscar-cliente',(e,args)=>{
        cliente = JSON.parse(args)
        if (args.length !== 2) {
            ponerInputsClientes(cliente)
        }else{
                if (dnicuit.value) {
                   if (dnicuit.value.length>8) {
                        buscarPersonaPorCuit(dnicuit.value)
                   }else{
                    const Http = new XMLHttpRequest();
                    const url=`https://afip.tangofactura.com/Index/GetCuitsPorDocumento/?NumeroDocumento=${dnicuit.value}`;
                    Http.open("GET", url);
                    Http.send()
                    Http.onreadystatechange = (e) => {
                        buscarPersonaPorCuit(JSON.parse(Http.responseText).data[0])
                        }
                   }
                }
            }
    })
    observaciones.focus()
 })

 function buscarPersonaPorCuit(cuit) {
    const Https = new XMLHttpRequest();
    const url=`https://afip.tangofactura.com/REST/GetContribuyente?cuit=${cuit}`;
    Https.open("GET", url);
    Https.send()
    Https.onreadystatechange = (e) => {
        if (Https.responseText !== "") {

            const persona = JSON.parse(Https.responseText)
            const {nombre,domicilioFiscal,EsRI,EsMonotributo,EsExento,EsConsumidorFinal}= persona.Contribuyente;
            const cliente = {};
            cliente.cliente=nombre;
            cliente.localidad = domicilioFiscal.localidad;
            cliente.direccion = domicilioFiscal.direccion;
            cliente.provincia = domicilioFiscal.nombreProvincia;
            buscarCliente.value = nombre;
            localidad.value=domicilioFiscal.localidad;
            direccion.value = domicilioFiscal.direccion;
            provincia.value = domicilioFiscal.nombreProvincia;
            if (EsRI) {
                cliente.cond_iva="Inscripto"
            }else if (EsExento) {
                cliente.cond_iva="Exento"
            } else if (EsMonotributo) {
                cliente.cond_iva="Monotributista"
            } else if(EsConsumidorFinal) {
                cliente.cond_iva="Consumidor Final"
            }
            cliente.cuit = dnicuit.value;
            ponerInputsClientes(cliente) ;
        
        }

    }

 }
 //lo usamos para borrar un producto de la tabla
borrarProducto.addEventListener('click',e=>{
    borrarUnProductoDeLaLista(yaSeleccionado)
})


const cancelar = document.querySelector('.cancelar')
cancelar.addEventListener('click',async e=>{
    e.preventDefault()
    if (confirm("Desea cancelar el Presupuesto")) {
        if (listaProductos.length !== 0) {
            const ventaCancelada = {}
    
            if (cliente._id) {
                ventaCancelada.cliente = cliente._id
            }
            ventaCancelada.productos = listaProductos
            ventaCancelada._id = await tamanioCancelados()
            ventaCancelada.vendedor = vendedor
            ipcRenderer.send('ventaCancelada',ventaCancelada)
        }
            window.location = "../index.html"
    }
})

// Vemos el tamanio de los Cancelados
const tamanioCancelados = async() =>{
    let retornar
    await ipcRenderer.invoke('tamanioCancelado').then((tamanio)=>{
        retornar =  tamanio
    })
        return `${retornar + 1}`
}

const fs = require('fs');

 //Ponemos valores a los inputs
function ponerInputsClientes(cliente) {
    codigoC.value = cliente._id
    buscarCliente.value = cliente.cliente;
    saldo.value = cliente.saldo;
    saldo_p.value = cliente.saldo_p;
    localidad.value = cliente.localidad;
    direccion.value = cliente.direccion;
    provincia.value = cliente.provincia;
    dnicuit.value = cliente.cuit;
    telefono.value = cliente.telefono;
    conIva.value = cliente.cond_iva;
    venta.cliente = cliente._id;
    if (cliente.condicion==="M") {
        alert(`${cliente.observacion}`)
    }
    const cuentaC = document.querySelector('.cuentaC');
    (cliente.cond_fact === "4") ? cuentaC.classList.add('none') : cuentaC.classList.remove('none');
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

let ventaAnterior;
ipcRenderer.once('venta',(e,args)=>{
    borraNegro = true;
    const [usuario,numero,empresaS] = JSON.parse(args);
    inputEmpresa.value = empresaS;
    ventaDeCtaCte = numero;
    textoUsuario.innerHTML = usuario;
    venta.vendedor = usuario;
    ipcRenderer.send('traerVenta',numero);
    ipcRenderer.on('traerVenta',async (e,args)=>{
        const venta = JSON.parse(args)[0]
        ventaAnterior = venta
        const cliente = JSON.parse(await ipcRenderer.invoke('get-cliente',venta.cliente))
        ponerInputsClientes(cliente)
        venta.productos.forEach(producto =>{
            const {objeto,cantidad} = producto;
            mostrarVentas(objeto,cantidad)
        })
    })
})

const borrarCuentaCorriente = async (numero)=>{
    ventaAnterior.tipo_pago === "CC" && await ipcRenderer.send('borrarVentaACliente',[venta.cliente,numero]);
    //ipcRenderer.send('eliminar-venta',numero)
}   

const {DBFFile} = require ('dbffile');
const { exit } = require('process');

const imprimirTikectFactura = async(venta,cliente)=>{

    const tipo_doc = (venta.cod_doc === 96) ? 67 : 50;
    let cond_iva = 67;
    let tipo_fact = 66;
    if (cliente.cond_iva==="Inscripto") {
        cond_iva = 73
    }else if (cliente.cond_iva==="Exento") {
        cond_iva = 69
    } else if (cliente.cond_iva==="Monotributista") {
        cond_iva = 77
    }else{
        cond_iva=67
    };
    (cond_iva===73) && (tipo_fact = 65);

    let tipo_pago = ""

    if (venta.tipo_pago === "CD") {
        tipo_pago = "Contado";
    }else if (venta.tipo_pago === "CC") {
        tipo_pago = "Cuenta Corriente"
    }else{
        tipo_pago = "Presupuesto"
    }

    let fieldDescriptors = [
        { name: 'Ref', type: 'B', size: 8},
        { name: 'Codigo', type: 'C', size: 255 },
        { name: 'Nombre', type: 'C', size: 255 },
        { name: 'Cuit', type: 'C', size: 255 },
        { name: 'Cod_iva', type: 'B', size: 8},
        { name: 'Tipo_doc', type: 'B', size: 8},
        { name: 'Tipo_fact', type: 'B', size: 8},
        { name: 'Domicilio', type: 'C', size: 255 },
        { name: 'Descuento', type: 'B', size: 8 ,decimalPlaces: 2},
        { name: 'Tipo_pago', type: 'C', size: 255 },
        { name: 'Vendedor', type: 'C', size: 255 },
        { name: 'Empresa', type: 'C', size: 255 }
    ];

    let records = [
        { Ref: venta.nro_comp,
          Codigo: cliente._id,
          Nombre:cliente.cliente,
          Cuit:cliente.cuit,
          Cod_iva:cond_iva,
          Tipo_doc: parseFloat(tipo_doc),
          Tipo_fact:tipo_fact,
          Domicilio:cliente.direccion,
          Descuento:(parseFloat(venta.descuento)),
          Tipo_pago: tipo_pago,
          Vendedor:venta.vendedor,
          Empresa: venta.empresa
        },
    ];
    ipcRenderer.send('fiscal',{fieldDescriptors,records})
}

const imprimirItem = async(venta,cliente)=>{
    const datosAGuardar = [];
    let fieldDescriptors = [
        { name: 'ref', type: 'B', size: 8},
        { name: 'descripcio', type: 'C', size: 255 },
        { name: 'cantidad', type: 'B', size: 8, decimalPlaces: 2 },
        { name: 'monto', type: 'B', size: 8, decimalPlaces: 2 },
        { name: 'iva', type: 'B', size: 8, decimalPlaces: 2 },
    ]
    venta.productos.forEach(({objeto,cantidad})=>{

        let iva = 21
        if (objeto.iva === "N") {
            iva = 21.00
        }else{
            iva = 10.50
        }

        const item = {
            ref: venta.nro_comp,
            descripcio: objeto.descripcion,
            cantidad: cantidad,
            monto: (parseFloat(objeto.precio_venta)*cantidad).toFixed(2),
            iva: iva
        }
        datosAGuardar.push(item)
    })
    
    ipcRenderer.send('item',{fieldDescriptors,datosAGuardar})

}

const subirAAfip = async(venta)=>{
    const fecha = new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    let ultimoElectronica = await afip.ElectronicBilling.getLastVoucher(5,parseFloat(venta.cod_comp));
    (ultimoElectronica === 0) && (ultimoElectronica=1); 
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
        'Concepto': 1,
        'DocTipo': venta.cod_doc,
        'DocNro': venta.dnicuit,
        'CbteDesde': 1,
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
        }
        
        if (totalNeto105 !=0 ) {
            data.Iva.push({
                    'Id' 		: 4, // Id del tipo de IVA (4 para 10.5%)
                    'BaseImp' 	: totalNeto105.toFixed(2), // Base imponible
                    'Importe' 	: totalIva105.toFixed(2) // Importe 
            })
        }
        if (totalNeto21 !=0 ) {
            data.Iva.push({
                    'Id' 		: 5, // Id del tipo de IVA (5 para 21%)
                    'BaseImp' 	: totalNeto21.toFixed(2), // Base imponible
                    'Importe' 	: totalIva21.toFixed(2) // Importe 
            })
        }
        const res = await afip.ElectronicBilling.createNextVoucher(data); //creamos la factura electronica

        const qr = {
            ver: 1,
            fecha: data.CbteFch,
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
        const textoQR = btoa(unescape(encodeURIComponent(qr)));//codificamos lo que va en el QR
        const QR = await generarQR(textoQR,res.CAE,res.CAEFchVto)
        return {
            QR,
            cae:res.CAE,
            vencimientoCae:res.CAEFchVto
        }
}

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

descuento.addEventListener('focus',e=>{
    selecciona_value(descuento.id)
})

cobrado.addEventListener('focus',e=>{
    selecciona_value(cobrado.id)
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

descuento.addEventListener('keypress',e=>{
    if (e.key === "Enter" && situacion==="blanco") {
        ticketFactura.focus()
    }else if(e.key === "Enter" && situacion==="negro"){
        presupuesto.focus()
    }
})

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

    const borrarUnProductoDeLaLista = (productoSeleccionado)=>{
        if (productoSeleccionado) {
            producto = listaProductos.find(e=>e.objeto.identificadorTabla === productoSeleccionado.id);
            total.value = (parseFloat(total.value)-(parseFloat(producto.cantidad)*parseFloat(producto.objeto.precio_venta))).toFixed(2)
            Preciofinal = (Preciofinal - (parseFloat(producto.cantidad)*parseFloat(producto.objeto.precio_venta)).toFixed(2)) 
            listaProductos.forEach(e=>{
                if (productoSeleccionado.id === e.objeto.identificadorTabla) {
                        listaProductos = listaProductos.splice(e=>e.objeto.identificadorTabla === productoSeleccionado.id)
                        totalPrecioProducos -= (e.objeto.precio_venta*e.cantidad);
                }
            })
            const a = productoSeleccionado
            a.parentNode.removeChild(a)
        }
        let nuevoTotal = 0;
        listaProductos.forEach(({objeto,cantidad})=>{
            nuevoTotal += (objeto.precio_venta * cantidad);
        })
        total.value = (nuevoTotal - (nuevoTotal*parseFloat(descuento.value)/100)).toFixed(2)
        descuentoN.value = (nuevoTotal*parseFloat(descuento.value)/100).toFixed(2)
        codigo.focus()
    }