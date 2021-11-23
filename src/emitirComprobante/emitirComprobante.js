function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

const Dialogs = require("dialogs");
const dialogs = Dialogs()
const vendedor = getParameterByName('vendedor')
const { ipcRenderer } = require("electron");

const usuario = document.querySelector(".usuario")
const textoUsuario = document.createElement("P")
textoUsuario.innerHTML = vendedor
usuario.appendChild(textoUsuario)
const resultado = document.querySelector('#resultado');
const buscarCliente = document.querySelector('#nombre');
document.querySelector('#nombre').focus()
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
const observaciones = document.querySelector('#observaciones')
const codigo = document.querySelector('#codigo')
const tiposVentas = document.querySelectorAll('input[name="tipoVenta"]')
const borrarProducto = document.querySelector('.borrarProducto')

let arreglo=[]//para teclas alt y F9
let Numeros = []
let yaSeleccionado
let tipoVenta
nombre.focus()


function metercantidad(texto){
    dialogs.prompt(texto,valor=>{
        return valor
    })

}

 document.addEventListener('keydown',(event) =>{
     arreglo.push(event.key);
     if(arreglo.includes("Alt") && arreglo.includes("F9")){
             mostrarNegro();

     }
 })

let cliente = {}
let producto = {}
let venta = {}
let listaProductos = []
let Preciofinal = 0
venta.vendedor = vendedor

//abrimos una ventana para buscar el cliente
buscarCliente.addEventListener('keypress', (e) =>{
    if (e.key === 'Enter') {
        ipcRenderer.send('abrir-ventana',"clientes")
     }
})

observaciones.addEventListener('keypress',e=>{
    if (e.key==='Enter') {
        codigo.focus()
    }
})

//recibimos el cliente
ipcRenderer.on('mando-el-cliente',(e,args)=>{ 
    cliente = JSON.parse(args)
    ponerInputsClientes(cliente);//ponemos en los inputs los valores del cliente
    if (cliente.condicion==="M") {
        dialogs.alert(`${cliente.observacion}`)
    }
    observaciones.focus()
})


//Cuando buscamos un producto
codigo.addEventListener('keypress',(e) => {
    if (e.key === 'Enter') {
        if (e.target.value !== "") {
            ipcRenderer.send('get-producto',e.target.value)
            ipcRenderer.once('get-producto',(a,args)=>{
                if (JSON.parse(args).length === 0) {
                        dialogs.alert("No existe ese Producto").then(
                            document.querySelector('.ok').focus()
                        ).then(()=>{
                            codigo.focus()
                        })
                }else{
                    dialogs.prompt("Cantidad",async valor=>{
                        await mostrarVentas(JSON.parse(args)[0],valor)
                        e.target.value=""
                        codigo.focus()
                    })

                }
            })
        }else{
            ipcRenderer.send('abrir-ventana',"productos")
        }
        
    }
})

ipcRenderer.on('mando-el-producto',(e,args) => {
    const {producto,cantidad} = JSON.parse(args);
    console.log(producto)
    mostrarVentas(producto,cantidad)
})

function mostrarVentas(objeto,cantidad) {

    Preciofinal += (parseFloat(objeto.precio_venta)*cantidad);
    total.value = (parseFloat(Preciofinal)).toFixed(2)
    resultado.innerHTML += `
        <tr id=${objeto._id}>
        <td>${objeto._id}</td>
        <td>${(parseFloat(cantidad)).toFixed(2)}</td>
        <td>${objeto.descripcion}</td>
        <td>${objeto.tasaIva === "normal" ? "10.50" : "21"}</td>
        <td>${parseFloat(objeto.precio_venta).toFixed(2)}</td>
        <td>${(parseFloat(objeto.precio_venta)*(cantidad)).toFixed(2)}</td>
        
        </tr>
    `
    listaProductos.push({objeto,cantidad});
    venta.productos = listaProductos


   
}

resultado.addEventListener('click',e=>{
    inputseleccionado(e.path[1])

    if (yaSeleccionado) {
        borrarProducto.classList.remove('none')
    }
})

const inputseleccionado = (e) =>{
    yaSeleccionado && yaSeleccionado.classList.remove('seleccionado')
   e.classList.toggle('seleccionado')
   yaSeleccionado = document.querySelector('.seleccionado')
}

//PARTE DE DESCUENTO


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
     Total = total.value
    descuentoN.value = redondear(descuento.value*Total/100);
    total.value=redondear(Total - descuentoN.value);
}

//si se sobra menos que se muestre cuanto es la diferencia
function inputCobrado(numero) {
    Total=total.value
    descuentoN.value =  redondear(Total-numero)
    descuento.value = redondear(descuentoN.value*100/Total)
    total.value = numero;
}
//PARTE DE DESCUENTO




//Musetra las cosas en negro
function mostrarNegro() {
    const bodyNegro = document.querySelector('.emitirComprobante')
    const saldoNegro = document.querySelector(".saldoNegro")
    const ventaNegro = document.querySelector(".ventaNegro")
    const ticketFactura = document.querySelector('.ticketFactura')

        saldoNegro.classList.toggle('none')
        bodyNegro.classList.toggle('mostrarNegro')
        ventaNegro.classList.toggle('none')
        ticketFactura.classList.toggle('none')
        ventaValorizado.classList.toggle('none')
        arreglo=[]
}


//Vemos el numero para saber de la ultima factura a o b
let texto =""



//Vemos si la venta es cc, contando, presupuesto
let tipoPago
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
        return 81
    } else {
        return 82
    }
    }else{
        return " "
    }
}

function verQueVentaEs(tipo,cod_comp) {
    if (tipo === "Presupuesto") {
        return "Ultimo Presupuesto"
    }else if(tipo === "Ticket Factura" && cod_comp === 81){
        return "Ultima Factura A"
    }else if(tipo ===  "Ticket Factura" && cod_comp === 82){
        return "Ultima Factura B"
    }else if(tipo === "Cuenta Corriente"){
        return "Ultimo Remito Cta Cte"
    }else if(tipo === "Contado"){
        return "Ultimo Remito Contado"
    }
}

//numero de comprobante de ticket factura
function traerUltimoNroComprobante(tipoCom,codigoComprobante,tipo_pago) {

        if (tipoCom==="Ticket Factura") {
            const numeroFactura = verQueVentaEs(tipoCom,codigoComprobante)
            return `00003-${Numeros[numeroFactura]}`
        }else if(tipoCom === "Presupuesto" & tipo_pago==="CD"){
            const numeroFactura = verQueVentaEs("Contado")
            return Numeros[numeroFactura]
        }else if(tipoCom === "Presupuesto" & tipo_pago === "CC"){
            const numeroFactura = verQueVentaEs("Cuenta Corriente")
            return Numeros[numeroFactura]
        }else if(tipoCom === "Presupuesto" & tipo_pago === "PP"){
            const numeroFactura = verQueVentaEs("Presupuesto")
            return Numeros[numeroFactura]
        }
    }
    //propiedad comprobante
    function numeroComprobante(tipo){
        if (tipo === "Ticket Factura") {
            venta.cod_doc = codDoc(cliente.dnicuit)
            venta.dnicuit = cliente.dnicuit
            venta.condIva = cliente.conIva
        }

    }

//propiedad cod_doc vemos si es dni o cuit para retornar el codDoc
function codDoc(dniocuit) {
    if (dniocuit.strlen > 8) {
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

const traerTamanioDeMovProducto = async()=>{
    let retornar
    await ipcRenderer.invoke('traerTamanioMovProductos').then((id)=>{
        retornar = id
    })

    return retornar
}

//Registramos un movimiento de producto
async function movimientoProducto(cantidad,objeto){
    const id = traerTamanioDeMovProducto()
    let movProducto = {}
    movProducto._id = (await traerTamanioDeMovProducto()) + 1
    movProducto.codProd = objeto._id
    movProducto.descripcion = objeto.descripcion
    movProducto.cliente = cliente.cliente
    movProducto.comprobante = tipoVenta
    movProducto.comprobante = "C"
    movProducto.nro_comp=venta.nro_comp
    movProducto.egreso = cantidad
    movProducto.stock = objeto.stock
    movProducto.precio_unitario=objeto.precio_venta
    movProducto.total=(parseFloat(movProducto.egreso)*parseFloat(movProducto.precio_unitario)).toFixed(2)
    movProducto.vendedor = venta.vendedor

    ipcRenderer.send('movimiento-producto',movProducto)
}

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
    texto = verNumero(cliente.cond_iva,mostrar)
    traerNumeroDeFactura(texto,mostrar)
})


//redondea un numero a dos decimales
function redondear(numero) {
    return (parseFloat((Math.round(numero + "e+2") +  "e-2")));

}

function traerNumeroDeFactura(texto,mostrar) {
    ipcRenderer.send('traerNumeros')
    ipcRenderer.on('traerNumeros',(a,args)=>{
    [Numeros] = JSON.parse(args)
    mostrar.value =  [Numeros[texto]]
    })
}

function actualizarNumeroComprobante(comprobante,tipo_pago,codigoComp) {
    let [n1,n2] = comprobante.split('-')
    n2 = parseFloat(n2)+1
    n2 = n2.toString().padStart(8,0)
    let numero = n1+'-'+n2
    let tipoFactura
    if (tipo_pago==="CD") {
        tipoFactura = verQueVentaEs("Contado",codigoComp)
    }else if(tipo_pago==="CC"){
        tipoFactura = verQueVentaEs("Cuenta Corriente",codigoComp)
    }else{
        tipoFactura = verQueVentaEs("Presupuesto",codigoComp)
    }
    ipcRenderer.send('modificar-numeros',[numero,tipoFactura])
}

//pasamos el saldo en negro
function sumarSaldoAlClienteEnNegro(precio,codigo){
    ipcRenderer.send('sumarSaldoNegro',[precio,codigo])
}

//Aca mandamos la venta en presupuesto
const presupuesto = document.querySelector('.presupuesto')
presupuesto.addEventListener('click',(e)=>{

    ipcRenderer.send('traerNumeros')
    ipcRenderer.on('traerNumeros',(a,args)=>{
    [Numeros] = JSON.parse(args)

    e.preventDefault() 
    tipoVenta="Presupuesto"
    venta.descuento = (descuentoN.value);
    venta.precioFinal = redondear(total.value)
    verElTipoDeVenta(tiposVentas) //vemos si es contado,cuenta corriente o presupuesto en el input[radio]
    venta.tipo_comp = tipoVenta
    venta.tipo_pago = tipopago(tipoPago)
    venta.nro_comp = traerUltimoNroComprobante(tipoVenta,venta.Cod_comp,venta.tipo_pago);
    venta._id=venta.nro_comp
    venta.pagado = verSiPagoONo(venta.tipo_pago);//Ejecutamos para ver si la venta se pago o no
    if (!valorizado.checked && venta.tipo_pago === "CC") {
       venta.precioFinal = "0.1" 
    }
    if (venta.tipo_pago !== "PP") {
    venta.tipo_pago === "CC" && sumarSaldoAlClienteEnNegro(venta.precioFinal,cliente._id);
    (venta.productos).forEach(producto => {
        sacarStock(producto.cantidad,producto.objeto)
        movimientoProducto(producto.cantidad,producto.objeto)
    });
    }
    actualizarNumeroComprobante(venta.nro_comp,venta.tipo_pago,venta.cod_comp)
    ipcRenderer.send('nueva-venta',venta);
    printPage()
    location.reload()
})
})
//Aca mandamos la venta con tikect Factura
const ticketFactura = document.querySelector('.ticketFactura')
ticketFactura.addEventListener('click',(e) =>{
    e.preventDefault()
     tipoVenta = "Ticket Factura"
     venta.observacion = observaciones.value
     verElTipoDeVenta(tiposVentas)//vemos si es contado,cuenta corriente o presupuesto en el input[radio]
     venta.descuento = (descuentoN.value);
     venta.precioFinal = redondear(total.value);
     venta.tipo_comp = tipoVenta;
     numeroComprobante(tipoVenta);
     venta.Cod_comp = verCodComprobante(tipoVenta)
     venta.nro_comp = traerUltimoNroComprobante("Ticket Factura",venta.Cod_comp)
     venta.tipo_pago = tipopago(tipoPago)   
     console.log(venta.tipo_pago)
     venta.tipo_pago === "CD" ? (venta.pagado = true) : (venta.pagado = false)
     venta.comprob = traerNumeroDeFactura(texto)

    venta.tipo_pago === "CC" && sumarSaldoAlCliente(venta.precioFinal)
    sacarStock(venta.productos[0])
    ipcRenderer.send('nueva-venta',venta);
    window.reload()
 })

 function verSiPagoONo(texto) {
    if (texto === "CD"){
        return true
    }else{
        return false
    }
 }


 const buscarAfip = document.querySelector('.buscarAfip')
 buscarAfip.addEventListener('click',  (e)=>{
 
    ipcRenderer.send('buscar-cliente',dnicuit.value)
    ipcRenderer.on('buscar-cliente',(e,args)=>{
        console.log(dnicuit.value)
        cliente = JSON.parse(args)[0]   

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
                        console.log(JSON.parse(Http.responseText).data[0])
                        buscarPersonaPorCuit(JSON.parse(Http.responseText).data[0])
                        }
                   }
                }
            }
    })
    observaciones.focus()
    e.preventDefault()
 })

 function buscarPersonaPorCuit(cuit) {
    const Https = new XMLHttpRequest();
    const url=`https://afip.tangofactura.com/REST/GetContribuyente?cuit=${cuit}`;
    Https.open("GET", url);
    Https.send()
    Https.onreadystatechange = (e) => {
        const persona = JSON.parse(Https.responseText)
        
        const {nombre,domicilioFiscal,EsRI,EsMonotributo,EsExento,EsConsumidorFinal}= persona.Contribuyente
        const cliente = {}
        cliente.cliente=nombre
        cliente.localidad = domicilioFiscal.localidad
        cliente.direccion = domicilioFiscal.direccion
        cliente.provincia = domicilioFiscal.nombreProvincia
        buscarCliente.value = nombre
        localidad.value=domicilioFiscal.localidad
        direccion.value = domicilioFiscal.direccion
        provincia.value = domicilioFiscal.nombreProvincia
        if (EsRI) {
            cliente.cond_iva="Inscripto"
        }else if (EsExento) {
            cliente.cond_iva="Exento"
        } else if (EsMonotributo) {
            cliente.cond_iva="Monotributista"
        } else if(EsConsumidorFinal) {
            cliente.cond_iva="Consumidor Final"
        }
        cliente.cuit = dnicuit.value
        ponerInputsClientes(cliente) 
    }
 }

 //Ponemos valores a los inputs

 function ponerInputsClientes(cliente) {
    buscarCliente.value = cliente.cliente;
    saldo.value = cliente.saldo;
    saldo_p.value = cliente.saldo_p;
    localidad.value = cliente.localidad;
    direccion.value = cliente.direccion;
    provincia.value = cliente.provincia;
    dnicuit.value = cliente.cuit;
    telefono.value = cliente.telefono;
    conIva.value = cliente.cond_iva;
    venta.cliente = cliente._id
    
    
 }

borrarProducto.addEventListener('click',e=>{
    if (yaSeleccionado) {
        producto = venta.productos.find(e=>e.objeto._id===yaSeleccionado.id)

        total.value = (parseFloat(total.value)-(parseFloat(producto.cantidad)*parseFloat(producto.objeto.precio_venta))).toFixed(2)
        venta.productos.pop(producto)
        yaSeleccionado.innerHTML = ""
        
    }
})


const cancelar = document.querySelector('.cancelar')
cancelar.addEventListener('click',async e=>{
    e.preventDefault()
        const ventaCancelada = {}
        if (cliente._id) {
            ventaCancelada.cliente = cliente._id
        }

        ventaCancelada.productos = listaProductos
        ventaCancelada._id = await tamanioCancelados()
        ventaCancelada.vendedor = vendedor
        ipcRenderer.send('ventaCancelada',ventaCancelada)
        window.location = "../index.html"
})

// Vemos el tamanio de los Cancelados
const tamanioCancelados = async() =>{
    let retornar
    await ipcRenderer.invoke('tamanioCancelado').then((tamanio)=>{
        retornar =  tamanio
    })
        return `${retornar + 1}`
}

     function printPage(){
        const div = document.querySelector('divImprimir')
        var iframe = document.getElementById("iframe");
        var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
        const fecha = innerDoc.querySelector('.fecha')
        const numero = innerDoc.querySelector('.numero')
        const vendedor = innerDoc.querySelector('.vendedor')
        const clientes = innerDoc.querySelector('.cliente')
        const idCliente = innerDoc.querySelector('.idCliente')
        const cuit = innerDoc.querySelector('.cuit')
        const direccion = innerDoc.querySelector('.direccion')
        const localidad = innerDoc.querySelector('.localidad')
        const numeroComp = innerDoc.querySelector('.numero')
        const cond_iva = innerDoc.querySelector('.cond_iva')
        const subtotal = innerDoc.querySelector('.subtotal')
        const precioFinal = innerDoc.querySelector('.precioFinal')
        const tipoPago = innerDoc.querySelector('.tipoPago')
        const tbody = innerDoc.querySelector('.tbody')
        const tomarFecha = new Date()
        const dia = tomarFecha.getDate() 
        const mes = tomarFecha.getMonth() + 1
        const anio = tomarFecha.getFullYear()
        const hora = tomarFecha.getHours()
        const minuto = tomarFecha.getMinutes()
        const segundo = tomarFecha.getSeconds()

        console.log(cliente)
        const lista = venta.productos
        numero.innerHTML=venta.nro_comp
        clientes.innerHTML = cliente.cliente
        idCliente.innerHTML = cliente._id
        vendedor.innerHTML = venta.vendedor
        cuit.innerHTML = cliente.cuit
        direccion.innerHTML = cliente.direccion
        localidad.innerHTML = cliente.localidad
        fecha.innerHTML = `${dia}/${mes}/${anio} ${hora}:${minuto}:${segundo}`
        numeroComp.innerHTML = venta.nro_comp
        subtotal.innerHTML=parseFloat(venta.precioFinal)+parseFloat(venta.descuento)
        precioFinal.innerHTML=venta.precioFinal
        tipoPago.innerHTML= venta.tipo_pago

        if (venta.tipo_pago === "CC") {
            precioFinal.innerHTML = ""
            subtotal.innerHTML=""
        }


        if (cliente.cond_iva) {
            cond_iva.innerHTML = cliente.cond_iva
        }else{
            cond_iva.innerHTML = "Consumidor Final"
        }
        tbody.innerHTML=""
         lista.forEach(({cantidad,objeto}) => {
             if (venta.tipo_pago !== "CC") {
                    
                tbody.innerHTML += `
                <tr>
                    <td>${(parseFloat(cantidad)).toFixed(2)}</td>
                    <td>${objeto._id}</td>
                    <td class="descripcion">${objeto.descripcion}</td>
                    <td>${parseFloat(objeto.precio_venta).toFixed(2)}</td>
                    <td>${(parseFloat(objeto.precio_venta)*cantidad).toFixed(2)}</td>
                </tr>
                `
            }else{
                tbody.innerHTML += `
                <tr>
                    <td>${(parseFloat(cantidad)).toFixed(2)}</td>
                    <td class="descripcion">${objeto._id}</td>
                    <td>${objeto.descripcion}</td>
                </tr>
                `
            }
         });

         window.print()

     } 
     document.addEventListener('keydown',e=>{
        if(e.key === "Escape"){
            window.history.go(-1)
        }
    })