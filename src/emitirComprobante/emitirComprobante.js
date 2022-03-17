const Afip = require('@afipsdk/afip.js');
const afip = new Afip({ CUIT: 27165767433 });

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}
const { ipcRenderer } = require("electron");
const axios = require("axios");
const { DateTime } = require("luxon");
require("dotenv").config;
const URL = process.env.URL;

const Dialogs = require("dialogs");
const dialogs = Dialogs();

//Es lo que viene en la URL
let vendedor = getParameterByName('vendedor')
let empresa = getParameterByName('empresa')

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
    const table = document.querySelector('.table');
    table.classList.add('enNegro')
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
codigoC.addEventListener('keypress', async(e) =>{
    if (e.key === 'Enter'  ) {
        if ( codigoC.value!=="") {
            let cliente = await axios.get(`${URL}clientes/id/${codigoC.value.toUpperCase()}`);
            cliente = cliente.data;
                if (cliente === "") {
                    alert("Cliente no encontrado")
                    codigoC.value = ""
                }else{
                    ponerInputsClientes(cliente)
                    codigoC.value === "9999" ? buscarCliente.focus() : observaciones.focus()
                }
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
codigo.addEventListener('keypress',async (e) => {

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
                let producto = (await axios.get(`${URL}productos/888-888`)).data;
                descripcion.children[0].value = producto.descripcion;
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
            let producto = await axios.get(`${URL}productos/${e.target.value}`);
            producto = producto.data;
                if (producto.length === 0) {
                        alert("No existe ese Producto");
                        codigo.value = "";
                        codigo.focus();
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
                                await mostrarVentas(producto,valor);
                                e.target.value="";
                                codigo.focus();
                            }}})}}
        }else{
            ipcRenderer.send('abrir-ventana',"productos")
        }}})

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
let texto = "";

//Vemos si la venta es cc, contando, presupuesto

async function verElTipoDeVenta(tipo) {
    let retornar = "Ninguno"
    tipo.forEach(e => {
        if (e.checked) {
          retornar =  e.value;
        }
    });
    return retornar;
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
        //tipoCom = Pesupuesto
        //ver que venta es retorna el atributo del bojeto guardado en la BD
        if (tipoCom==="Ticket Factura") {
            const numeroFactura = verQueVentaEs(tipoCom,codigoComprobante)
            let tipoVenta = ((await axios.get(`${URL}tipoVenta`)).data)[numeroFactura];
            return tipoVenta
        }else if(tipoCom === "Presupuesto" & tipo_pago==="CD"){
            const numeroFactura =  verQueVentaEs("Contado")
            const tipoVenta = ((await axios.get(`${URL}tipoVenta`)).data)[numeroFactura];
            return tipoVenta
        }else if(tipoCom === "Presupuesto" & tipo_pago === "CC"){
            const numeroFactura = verQueVentaEs("Cuenta Corriente")
            const tipoVenta = ((await axios.get(`${URL}tipoVenta`)).data)[numeroFactura];
            return tipoVenta
        }else if(tipoCom === "Presupuesto" & tipo_pago === "PP"){
            const numeroFactura = verQueVentaEs("Presupuesto")
            const tipoVenta = ((await axios.get(`${URL}tipoVenta`)).data)[numeroFactura];
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
    if (dniocuit.length === 11) {
        return 80
    } else if(dniocuit.length === 8 && dniocuit !== "00000000") {
        return 96
    }
    return 99
}

//Vamos a descontar el stock 
async function sacarStock(cantidad,objeto) {
    let producto = (await axios.get(`${URL}productos/${objeto._id}`)).data;
    const descontar = parseInt(producto.stock) - parseFloat(cantidad);
    producto.stock = descontar.toFixed(2);
    await axios.put(`${URL}productos/${objeto._id}`,producto);

}

//INICIO MOVPRODUCTOS

const traerTamanioDeMovProducto = async()=>{
    const tamanio = await axios.get(`${URL}movProductos`);
    return tamanio
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
    await axios.post(`${URL}movProductos`,movProducto);
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
numeroDeFactura.addEventListener('click', async () =>{
    const mostrar = document.querySelector('#numeroFactura')
    texto = verNumero(cliente.cond_iva)
    mostrar.value = ((await axios.get(`${URL}tipoVenta`)).data)[texto];
})


//redondea un numero a dos decimales
function redondear(numero) {
    return (parseFloat((Math.round(numero + "e+2") +  "e-2")));

}
 async function traerNumeroDeFactura(texto,mostrar) {
    let retornar;
    let numeros = (await axios.get(`${URL}tipoVenta`)).data;
    mostrar && (mostrar.value = numeros[texto])
    return numeros[texto]
}


const tamanioVentas = async(tipoVenta)=>{//tipoVenta = Presupuesto o Ticket Factura
    tipoVenta === "presupuesto" ? tamanio = await axios.get(`${URL}presupuesto`)  : tamanio = await axios.get(`${URL}ventas`)
    tamanio = tamanio.data + 1;
    return tamanio
}

async function actualizarNumeroComprobante(comprobante,tipo_pago,codigoComp) {
    let numero
    let tipoFactura
    let [n1,n2] = comprobante.split('-')
    n2 = parseFloat(n2)+1;
    n2 = n2.toString().padStart(8,0);
    numero = n1+'-'+n2;
    console.log(comprobante.split('-')[0] !== "0005")
    if (comprobante.split('-')[0] !== "0005") {


    if (tipo_pago==="CD") {
        tipoFactura = verQueVentaEs("Contado",codigoComp)
    }else if(tipo_pago==="CC"){
        tipoFactura = verQueVentaEs("Cuenta Corriente",codigoComp)
    }else{
        tipoFactura = verQueVentaEs("Presupuesto",codigoComp)
    }
    }else{
        tipoFactura = verQueVentaEs("Ticket Factura",codigoComp)
    }
    let numeros = await axios.get(`${URL}tipoVenta`)
    numeros = numeros.data;
    numeros[tipoFactura] = numero;
    await axios.put(`${URL}tipoventa`,numeros)
}

//pasamos el saldo en negro
async function sumarSaldoAlClienteEnNegro(precio,codigo,valorizado){
    !valorizado ? precio = "0.1" : precio;
    console.log(valorizado);
    let cliente = await axios.get(`${URL}clientes/id/${codigo}`)
    cliente = cliente.data;
    let saldo_p = (parseFloat(precio) + parseFloat(cliente.saldo_p)).toFixed(2);
    cliente.saldo_p = saldo_p;
    await axios.put(`${URL}clientes/${codigo}`,cliente);
}

async function sumarSaldoAlCliente(precio,codigo) {
    let cliente = await axios.get(`${URL}clientes/id/${codigo}`)
    cliente = cliente.data;
    let saldo = (parseFloat(precio)+parseFloat(cliente.saldo)).toFixed(2)
    cliente.saldo = saldo;
    await axios.put(`${URL}clientes/${codigo}`,cliente)
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

    if (confirm("Presupuesto?")) {

        if (listaProductos.length===0) {
            //Avisamos que no se puede hacer una venta sin productos
            alert("Cargar Productos")

        }else{

            venta.productos = listaProductos;
            venta.tipo_pago = await verElTipoDeVenta(tiposVentas); //vemos si es CD,CC o PP en el input[radio]
            if (venta.tipo_pago === "Ninguno") {
                    alert("Seleccionar un modo de venta")
            }else{
                venta.nombreCliente = buscarCliente.value;
                tipoVenta="Presupuesto"
                venta._id = await tamanioVentas("presupuesto")
                venta.descuento = (descuentoN.value);
                venta.precioFinal = redondear(total.value);
                venta.tipo_comp = tipoVenta;
                
                //Le pasamos que es un presupuesto contado CD
                venta.nro_comp = await traerUltimoNroComprobante(tipoVenta,venta.cod_comp,venta.tipo_pago);
                venta.empresa = inputEmpresa.value;
                let valorizadoImpresion = "valorizado"
                if (!valorizado.checked && venta.tipo_pago === "CC") {
                valorizadoImpresion="no valorizado"
                }
                sacarIdentificadorTabla(venta.productos);
                //si la venta es CC Sumamos un saldo al cliente y ponemos en cuenta corriente compensada y historica
                 if (venta.tipo_pago === "CC") {
                     sumarSaldoAlClienteEnNegro(venta.precioFinal,venta.cliente,valorizado.checked);
                     ponerEnCuentaCorrienteCompensada(venta,valorizado.checked);
                     ponerEnCuentaCorrienteHistorica(venta,valorizado.checked,saldo_p.value);
                    if (venta.tipo_pago !== "PP") {
                        //sacamos el stock y tambien creamos el movimiento de producto
                        for (let producto of venta.productos){
                                if (parseFloat(descuentoN.value) !== 0 && descuentoN.value !== "" ) {
                                    producto.objeto.precio_venta = parseFloat(producto.cantidad) * (parseFloat(producto.objeto.precio_venta)) - parseFloat(producto.cantidad)*parseFloat(producto.objeto.precio_venta)*parseFloat(descuento.value)/100
                                    producto.objeto.precio_venta = producto.objeto.precio_venta.toFixed(2)
                                }
                                sacarStock(producto.cantidad,producto.objeto)
                                await movimientoProducto(producto.cantidad,producto.objeto)
                            }
                    }
                 }
    
                 await actualizarNumeroComprobante(venta.nro_comp,venta.tipo_pago,venta.cod_comp)
                 ipcRenderer.send('nueva-venta',venta);
                 if (impresion.checked) {
                     let cliente = {
                         _id:codigoC.value,
                         cliente: buscarCliente.value,
                         cuit: dnicuit.value,
                         direccion: direccion.value,
                         localidad: localidad.value
                     }
                     if (venta.tipo_pago === "CC") {
                         ipcRenderer.send('imprimir-venta',[venta,cliente,true,2,"imprimir-comprobante",valorizadoImpresion])
                     }else{
                         ipcRenderer.send('imprimir-venta',[venta,cliente,false,1,"imprimir-comprobante",valorizadoImpresion])
                     }
                 }
                 window.location = "../index.html";
            }
        }
    }
})

//Aca mandamos la venta con tikect Factura
const ticketFactura = document.querySelector('.ticketFactura')
ticketFactura.addEventListener('click',async (e) =>{
    e.preventDefault()
   if (confirm("Ticket Factura?")) {
    const stockNegativo = listaProductos.find(producto=>producto.cantidad < 0)
    if(stockNegativo){
        alert("Ticket Factura no puede ser productos en negativo");
    }else if(listaProductos.length===0){
        alert("Ningun producto cargado")
    }else{
      venta.productos = listaProductos;
      const [iva21,iva105,gravado21,gravado105,cant_iva] = gravadoMasIva(venta.productos);
     tipoVenta = "Ticket Factura";
     venta.tipo_pago = await verElTipoDeVenta(tiposVentas)//vemos si es contado,cuenta corriente o presupuesto en el input[radio]
     if (venta.tipo_pago === "Ninguno") {
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
        venta.tipo_pago === "CD" ? (venta.pagado = true) : (venta.pagado = false)
        venta.comprob = venta.nro_comp;
        venta.gravado21 = gravado21;
        venta.gravado105 = gravado105;
        venta.iva21 = iva21;
        venta.iva105 = iva105
        venta.cant_iva = cant_iva;
        if (venta.precioFinal >=10000 && (buscarCliente.value === "A CONSUMIDOR FINAL" && dnicuit.value === "00000000" && direccion.value === "CHAJARI")) {
            alert("Factura mayor a 10000, poner datos cliente")
        }else{
        venta.tipo_pago === "CC" && sumarSaldoAlCliente(venta.precioFinal,venta.cliente);
        venta.tipo_pago === "CC" && ponerEnCuentaCorrienteCompensada(venta,true);
        venta.tipo_pago === "CC" && ponerEnCuentaCorrienteHistorica(venta,true,saldo.value);
        venta.empresa = inputEmpresa.value;
        for(let producto of venta.productos){
           if (parseFloat(descuentoN.value) !== 0 && descuentoN.value !== "" ) {
               producto.objeto.precio_venta = parseFloat(producto.cantidad) * (parseFloat(producto.objeto.precio_venta)) - parseFloat(producto.cantidad)*parseFloat(producto.objeto.precio_venta)*parseFloat(descuento.value)/100
               producto.objeto.precio_venta = producto.objeto.precio_venta.toFixed(2)
           }
            sacarStock(producto.cantidad,producto.objeto)
            await movimientoProducto(producto.cantidad,producto.objeto)
        };
        actualizarNumeroComprobante(venta.nro_comp,venta.tipo_pago,venta.cod_comp);
        const afip = await subirAAfip(venta)
        await ipcRenderer.send('nueva-venta',venta);
        const cliente = (await axios.get(`${URL}clientes/id/${codigoC.value.toUpperCase()}`)).data;
        await imprimirVenta([venta,cliente,afip]);
        await axios.post(`${URL}crearPdf`,[venta,cliente,afip]);

        if (borraNegro) {
            ipcRenderer.on('clienteModificado',async(e,args)=>{
                await borrarCuentaCorriente(ventaDeCtaCte)
            })};
        !borraNegro && (window.location = '../index.html');
        }
    }
    }
   }
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

 //Funcion para buscar una persona directamente por el cuit
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
            await axios.post(`${URL}cancelados`,ventaCancelada);
        }
            window.location = "../index.html"
    }
})

// Vemos el tamanio de los Cancelados
const tamanioCancelados = async() =>{
    let tamanio = (await axios.get(`${URL}cancelados/tamanio`)).data;
    return `${tamanio + 1}`;
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
        let cliente = (await axios.get(`${URL}clientes/id/${venta.cliente}`)).data;
        ponerInputsClientes(cliente)
        venta.productos.forEach(producto =>{
            const {objeto,cantidad} = producto;
            mostrarVentas(objeto,cantidad)
        })
    })
})

const borrarCuentaCorriente = async (numero)=>{
    ventaAnterior.tipo_pago === "CC" && await ipcRenderer.send('borrarVentaACliente',[venta.cliente,numero]);
}   


const subirAAfip = async(venta)=>{
    console.log(venta)
    const fecha = new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    let ultimoElectronica = await afip.ElectronicBilling.getLastVoucher(5,parseFloat(venta.cod_comp));
    (ultimoElectronica === 0) && (ultimoElectronica=1); 
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
        'ImpNeto': parseFloat((venta.gravado21+venta.gravado105).toFixed(2)),
        'ImpOpEx': 0,
        'ImpIVA': parseFloat((venta.iva21+venta.iva105).toFixed(2)), //Importe total de IVA
        'ImpTrib': 0,
        'MonId': 'PES',
        'PtoVta': 5,
        'MonCotiz' 	: 1,
        'Iva' 		: [],
        }
        
        if (venta.iva105 !=0 ) {
            data.Iva.push({
                    'Id' 		: 4, // Id del tipo de IVA (4 para 10.5%)
                    'BaseImp' 	: venta.gravado105, // Base imponible
                    'Importe' 	: venta.iva105 // Importe 
            })
        }
        if (venta.iva21 !=0 ) {
            data.Iva.push({
                    'Id' 		: 5, // Id del tipo de IVA (5 para 21%)
                    'BaseImp' 	: venta.gravado21, // Base imponible
                    'Importe' 	: venta.iva21 // Importe 
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
                        listaProductos = listaProductos.filter(e=>e.objeto.identificadorTabla !== productoSeleccionado.id);
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
        total.value = parseFloat(descuento.value) !== 0 ? (nuevoTotal - (nuevoTotal*parseFloat(descuento.value)/100)).toFixed(2) : nuevoTotal;
        descuentoN.value = (nuevoTotal*parseFloat(descuento.value)/100).toFixed(2)
        codigo.focus()
    }

const imprimirVenta = (arreglo)=>{

const conector = new ConectorPlugin();
const ponerValores = (Cliente,Venta,{QR,cae,vencimientoCae})=>{
    const fechaVenta = new Date(Venta.fecha)
    let dia = fechaVenta.getDate()
    let mes = fechaVenta.getMonth()+1;
    let horas = fechaVenta.getHours();
    let minutos = fechaVenta.getMinutes();
    let segundos = fechaVenta.getSeconds();
    dia = dia<10 ? `0${dia}` : dia;
    mes = mes<10 ? `0${mes}` : mes;
    horas = horas<10 ? `0${horas}` : horas;
    let anio = fechaVenta.getFullYear()
    const comprobante = verTipoComp(Venta.cod_comp)
    conector.cortar()
    conector.establecerTamanioFuente(2,2);
    conector.establecerFuente(ConectorPlugin.Constantes.FuenteC)
    conector.establecerJustificacion(ConectorPlugin.Constantes.AlineacionCentro);
    conector.texto("*ELECTRO AVENIDA*\n")
    conector.establecerJustificacion(ConectorPlugin.Constantes.AlineacionIzquierda);
    conector.establecerTamanioFuente(1,1);
    conector.texto("GIANOVI MARINA ISABEL\n");
    conector.texto("INGRESO BRUTOS: 27165767433\n")
    conector.texto("C.U.I.T Nro: 27165767433\n");
    conector.texto("AV.9 DE JULION-3380 (3228);CHAJARI E.R.\n");
    conector.texto("INICIO DE ACTIVIDADES: 02-03-07\n");
    conector.texto("IVA RESPONSABLE INSCRIPTO\n");
    conector.texto("------------------------------------------\n");
    conector.texto(`${comprobante}   ${Venta.nro_comp}\n`);
    conector.texto(`FECHA: ${dia}-${mes}-${anio}    Hora:${horas}:${minutos}:${segundos}\n`);
    conector.texto("------------------------------------------\n");
    conector.texto(`${buscarCliente.value}\n`);
    conector.texto(`${dnicuit.value}\n`);
    conector.texto(`${conIva.value}\n`);
    conector.texto(`${direccion.value}   ${localidad.value}\n`);
    venta.numeroAsociado && console.log("Numero Asociado")
    venta.numeroAsociado && conector.texto(`${venta.numeroAsociado}\n`);
    conector.texto("------------------------------------------\n");
    conector.texto("CANTIDAD/PRECIO UNIT (%IVA)\n")
    conector.texto("DESCRIPCION           (%B.I)       IMPORTE\n")  
    conector.texto("------------------------------------------\n");
    Venta.productos && Venta.productos.forEach(({cantidad,objeto})=>{
        conector.texto(`${cantidad}/${objeto.precio_venta}              ${objeto.iva === "N" ? "(21.00)" : "(10.50)"}\n`);
        conector.texto(`${objeto.descripcion.slice(0,30)}    ${(parseFloat(cantidad)*parseFloat(objeto.precio_venta)).toFixed(2)}\n`)
    })
    conector.feed(2);
    conector.establecerTamanioFuente(2,1);
    conector.texto("TOTAL        $" +  Venta.precioFinal + "\n");
    conector.establecerTamanioFuente(1,1);
    conector.texto("Recibimos(mos)\n");
    conector.texto(`${venta.tipo_pago === "CD" ? `Contado          ${Venta.precioFinal}`  : "Cuenta Corriente"}` + "\n");
    conector.establecerTamanioFuente(2,1);
    conector.texto("CAMBIO         $0.00\n");
    conector.establecerJustificacion(ConectorPlugin.Constantes.AlineacionCentro);
    conector.texto("*MUCHA GRACIAS*\n")
    conector.qrComoImagen(QR);
    conector.establecerJustificacion(ConectorPlugin.Constantes.AlineacionIzquierda);
    conector.establecerTamanioFuente(1,1);
    conector.texto("CAE:" + "                  " + "Vencimiento CAE:" + "\n")
    conector.texto(cae + "           " + vencimientoCae + "\n")
    conector.feed(3)
    conector.cortar()

    conector.imprimirEn("SAM4S GIANT-100")
        .then(respuestaAlImprimir => {
            if (respuestaAlImprimir === true) {
                console.log("Impreso correctamente");
            } else {
                console.log("Error. La respuesta es: " + respuestaAlImprimir);
            }
        });
   }



const verTipoComp = (codigoComprobante)=>{
    if (codigoComprobante === 6) {
        return "Cod: 006 - Factura B"
    }else if(codigoComprobante === 1){
        return "Cod: 002 - Factura A"
    }else if(codigoComprobante === 3){
        return "Cod: 003 - Nota Credito A"
    }else if(codigoComprobante === 4){
        return "Cod: 004 - Recibos A"
    }else if(codigoComprobante === 8){
        return "Cod: 008 - Nota Credito B"
    }else if(codigoComprobante === 9){
        return "Cod: 009 - Recibos B"
    }
}

const [Venta,Cliente,valoresQR] = arreglo;
ponerValores(Cliente,Venta,valoresQR)
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
    cuenta.saldo = parseFloat(saldo) + cuenta.debe;
    console.log(cuenta)
    await axios.post(`${URL}cuentaHisto`,cuenta);
}