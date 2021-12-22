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
const { ipcRenderer, Main } = require("electron");
const { CLIENT_RENEG_LIMIT } = require('tls');
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

let situacion = "blanco"//para teclas alt y F9
let Numeros = [];
let yaSeleccionado;
let tipoVenta;
let borraNegro = false;
let ventaDeCtaCte = "";
nombre.focus()



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

        saldoNegro.classList.remove('none')
        saldo.classList.add('none')
        bodyNegro.classList.add('mostrarNegro')
        ventaNegro.classList.remove('none')
        ticketFactura.classList.add('none')
        ventaValorizado.classList.remove('none')
}

function ocultarNegro() {
    const bodyNegro = document.querySelector('.emitirComprobante')
    const saldoNegro = document.querySelector(".saldoNegro")
    const saldo = document.querySelector(".saldo")
    const ventaNegro = document.querySelector(".ventaNegro")
    const ticketFactura = document.querySelector('.ticketFactura')

        saldoNegro.classList.add('none')
        saldo.classList.remove('none')
        bodyNegro.classList.remove('mostrarNegro')
        ventaNegro.classList.add('none')
        ticketFactura.classList.remove('none')
        ventaValorizado.classList.add('none')
}

let cliente = {}
let producto = {}
let venta = {}
let listaProductos = []
let Preciofinal = 0
venta.vendedor = vendedor

//abrimos una ventana para buscar el cliente
buscarCliente.addEventListener('keypress', (e) =>{
    if (e.key === 'Enter' ) {
        if ( buscarCliente.value!=="") {
            ipcRenderer.invoke('get-cliente',buscarCliente.value).then((args)=>{
                ponerInputsClientes(JSON.parse(args))
                observaciones.focus()
            })
        }else{
            ipcRenderer.send('abrir-ventana',"clientes")
        }
     }
})

buscarCliente.addEventListener('focus',e=>{
    buscarCliente.value=""
})

//recibimos el cliente
ipcRenderer.on('mando-el-cliente',(e,args)=>{ 
    cliente = JSON.parse(args)
    ponerInputsClientes(cliente);//ponemos en los inputs los valores del cliente

    observaciones.focus()
})

observaciones.addEventListener('keypress',e=>{
    if (e.key==='Enter') {
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
                        if (!Number.isInteger(parseFloat(valor)) && JSON.parse(args).unidad === "U") {
                                alert("La cantidad de este producto no puede ser en decimal")
                            }else{
                                await mostrarVentas(JSON.parse(args),valor)
                                e.target.value=""
                                codigo.focus()
                                }
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
    mostrarVentas(producto,cantidad)
})
let id = 1 //id de la tabla de ventas
function mostrarVentas(objeto,cantidad) {
    Preciofinal += (parseFloat(objeto.precio_venta)*cantidad);
    total.value = (parseFloat(Preciofinal)).toFixed(2)
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
//FIN PARTE DE DESCUENTO




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
    const id = traerTamanioDeMovProducto()
    let movProducto = {}
    movProducto._id = ((await traerTamanioDeMovProducto()) + 1).toFixed(0)
    movProducto.codProd = objeto._id
    movProducto.descripcion = objeto.descripcion
    movProducto.cliente = cliente.cliente
    movProducto.comprobante = tipoVenta
    movProducto.tipo_comp = "C"
    movProducto.nro_comp=venta.nro_comp
    movProducto.egreso = cantidad
    movProducto.stock = objeto.stock
    movProducto.precio_unitario=objeto.precio_venta
    movProducto.total=(parseFloat(movProducto.egreso)*parseFloat(movProducto.precio_unitario)).toFixed(2)
    movProducto.vendedor = venta.vendedor
    ipcRenderer.send('movimiento-producto',movProducto)
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
    ipcRenderer.send('sumarSaldo',[percio,codigo])
}
const sacarIdentificadorTabla = (arreglo)=>{
    arreglo.forEach(producto=>{
        delete producto.objeto.identificadorTabla  
    })
}
//Aca mandamos la venta en presupuesto
const presupuesto = document.querySelector('.presupuesto')
presupuesto.addEventListener('click',async (e)=>{
    e.preventDefault() 
    tipoVenta="Presupuesto"
    venta.descuento = (descuentoN.value);
    venta.precioFinal = redondear(total.value)
    verElTipoDeVenta(tiposVentas) //vemos si es contado,cuenta corriente o presupuesto en el input[radio]
    venta.tipo_comp = tipoVenta
    venta.tipo_pago = tipopago(tipoPago)
    venta.nro_comp = await traerUltimoNroComprobante(tipoVenta,venta.Cod_comp,venta.tipo_pago);
    venta._id=venta.nro_comp
    venta.pagado = verSiPagoONo(venta.tipo_pago);//Ejecutamos para ver si la venta se pago o no
    if (!valorizado.checked && venta.tipo_pago === "CC") {
       venta.precioFinal = "0.1" 
    }
    sacarIdentificadorTabla(venta.productos);
    if (venta.tipo_pago !== "PP") {
        venta.tipo_pago === "CC" && sumarSaldoAlClienteEnNegro(venta.precioFinal,cliente._id);
    (venta.productos).forEach(producto => {
        sacarStock(producto.cantidad,producto.objeto)
        movimientoProducto(producto.cantidad,producto.objeto)
    });
    }
    actualizarNumeroComprobante(venta.nro_comp,venta.tipo_pago,venta.cod_comp)
    ipcRenderer.send('nueva-venta',venta);
    printPage("presupuesto")
    location.reload()
})

//Aca mandamos la venta con tikect Factura
const ticketFactura = document.querySelector('.ticketFactura')
ticketFactura.addEventListener('click',async(e) =>{
    e.preventDefault()
     tipoVenta = "Ticket Factura"
     venta.observacion = observaciones.value
     verElTipoDeVenta(tiposVentas)//vemos si es contado,cuenta corriente o presupuesto en el input[radio]
     venta.descuento = (descuentoN.value);
     venta.precioFinal = redondear(total.value);
     venta.tipo_comp = tipoVenta;
     numeroComprobante(tipoVenta);
     venta.cod_comp = verCodComprobante(tipoVenta)
     venta.nro_comp = await traerUltimoNroComprobante("Ticket Factura",venta.cod_comp)
     venta._id=venta.nro_comp;
     venta.pagado = verSiPagoONo(venta.tipo_pago)
     venta.tipo_pago = tipopago(tipoPago)   
     venta.tipo_pago === "CD" ? (venta.pagado = true) : (venta.pagado = false)
     venta.comprob = await traerUltimoNroComprobante("Ticket Factura",venta.cod_comp);
    //venta.tipo_pago === "CC" && sumarSaldoAlCliente(venta.precioFinal,cliente_id);
    (venta.productos).forEach(producto => {
        sacarStock(producto.cantidad,producto.objeto)
        movimientoProducto(producto.cantidad,producto.objeto)
    });
    actualizarNumeroComprobante(venta.nro_comp,venta.tipo_pago,venta.cod_comp)
    subirAAfip(venta)
    ipcRenderer.send('nueva-venta',venta);

    imprimirTikectFactura(venta,cliente)
    imprimirItem(venta,cliente)


    if (borraNegro) {
        borrarCuentaCorriente(ventaDeCtaCte)
    };
    borraNegro ? window.close() : location.reload();
 })


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
        printPage("ticket factura",QR,res.CAE,res.CAEFchVto,ultimoElectronica,venta.cod_comp);
}
//Generamos el qr
async function generarQR(texto) {
    const fs = require('fs')
    const qrcode = require('qrcode')
    const url = `https://www.afip.gob.ar/fe/qr/?p=${texto}`;
    let retornar = await qrcode.toDataURL(url)
    return retornar
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
    e.preventDefault()
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
    if (yaSeleccionado) {
        producto = venta.productos.find(e=>e.objeto.identificadorTabla === yaSeleccionado.id);
        total.value = (parseFloat(total.value)-(parseFloat(producto.cantidad)*parseFloat(producto.objeto.precio_venta))).toFixed(2)
        venta.productos.forEach(e=>{
            if (yaSeleccionado.id === e.objeto.identificadorTabla) {
                    venta.productos = venta.productos.filter(e=>e.objeto.identificadorTabla !== yaSeleccionado.id)
            }
        })

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

const fs = require('fs');
const PdfParse = require('pdf-parse');
//funcion para imprimir una hoja
    async function printPage(factura,qr,cae,fechaCAE,numeroVoucher,cod_comp){
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
        const seccionQR = innerDoc.querySelector('.seccionQR')
        const tipoFactura = innerDoc.querySelector('.tipoFactura')
        const tomarFecha = new Date()
        const dia = tomarFecha.getDate() 
        const mes = tomarFecha.getMonth() + 1
        const anio = tomarFecha.getFullYear()
        const hora = tomarFecha.getHours()
        const minuto = tomarFecha.getMinutes()
        const segundo = tomarFecha.getSeconds()
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
        if(cod_comp === 1){
            tipoFactura.innerHTML = "A"
        }else if (cod_comp === 6) {
            tipoFactura.innerHTML = "B"
        }else{
            tipoFactura.innerHTML = "R"
        }

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
         for await (let {objeto,cantidad} of lista) {
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

            if (factura === "ticket factura") {
                numero.innerHTML =`0005-${(numeroVoucher.toString()).padStart(8,0)}`
                const insertar= `
                <div>
                    <img src=${qr}>
                </div>
                <div>
                    <h3>CAE: ${cae}</h3>
                    <h4>Fecha Vto. Cae: ${fechaCAE}</h4>
                </div>
                `
                seccionQR.innerHTML = insertar
            }
         };

         window.print()

     } 
     document.addEventListener('keydown',e=>{
        if(e.key === "Escape"){
            window.history.go(-1)
        }
    })

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
    venta.cliente = cliente._id;
    if (cliente.condicion==="M") {
        alert(`${cliente.observacion}`)
    }
    const cuentaC = document.querySelector('.cuentaC');
    (cliente.cond_fact === "4") && cuentaC.classList.add('none');
}

ipcRenderer.once('venta',(e,args)=>{
    borraNegro = true;

    const [usuario,numero] = JSON.parse(args)
    ventaDeCtaCte = numero
    textoUsuario.innerHTML = usuario
    venta.vendedor = usuario
    ipcRenderer.send('traerVenta',numero);
    ipcRenderer.on('traerVenta',async (e,args)=>{
        const venta = JSON.parse(args)[0]
        const cliente = JSON.parse(await ipcRenderer.invoke('get-cliente',venta.cliente))
        ponerInputsClientes(cliente)
        venta.productos.forEach(producto =>{
            const {objeto,cantidad} = producto;
            mostrarVentas(objeto,cantidad)
        })
    })
})

const borrarCuentaCorriente = (numero)=>{

    ipcRenderer.send('borrarVentaACliente',[venta.cliente,numero])
}   
const XLSX = require('xlsx');

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

    const ventaAGuardar = {
        ref:venta._id,
        codigo: cliente._id,
        nombre: cliente.cliente,
        cuit: cliente.cuit,
        cond_iva: cond_iva,
        tipo_doc: tipo_doc,
        tipo_fact: tipo_fact,
        domicilio: cliente.direccion,
        descuento: venta.descuento,
        tipo_pago: venta.tipo_pago,
        vendedor: venta.vendedor,
        empresa: "ELECTRO AVENIDA"
    }
         let wb = XLSX.readFile('Ventas.dbf')
         const ws = wb.SheetNames[0]

         const datos  = XLSX.utils.sheet_to_json(wb.Sheets[ws])
    
         const newwb = XLSX.utils.book_new()
         newwb.props = {
            Title: "Ventas",
            subject: "Test",
            Author: "Electro Avenida"
        }
         datos.push(ventaAGuardar)


         const newWs = XLSX.utils.json_to_sheet(datos)

         XLSX.utils.book_append_sheet(newwb,newWs,'Ventas')
         XLSX.writeFile(newwb,"Ventas.dbf")
    
}

const imprimirItem = async(venta,cliente)=>{
    const datosAGuardar = [];

    venta.productos.forEach(({objeto,cantidad})=>{

        let iva = 21
        if (objeto.iva === "N") {
            iva = 21
        }else{
            iva = 10.5
        }
        const item = {
            ref: venta._id,
            descripcion: objeto.descripcion,
            cantidad: cantidad,
            monto: (parseFloat(objeto.precio_venta)*cantidad).toFixed(2),
            iva: iva
        }
        datosAGuardar.push(item)
    })

    let wb = XLSX.readFile('Item.dbf')
         const ws = wb.SheetNames[0]
         const datos  = XLSX.utils.sheet_to_json(wb.Sheets[ws])
    
         const newwb = XLSX.utils.book_new()
         newwb.props = {
            Title: "Item",
            subject: "Test",
            Author: "Electro Avenida"
        }
        datosAGuardar.forEach((dato)=>{
            datos.push(dato)
        })


         const newWs = XLSX.utils.json_to_sheet(datos)

         XLSX.utils.book_append_sheet(newwb,newWs,'Item')
         XLSX.writeFile(newwb,"Item.dbf")
}