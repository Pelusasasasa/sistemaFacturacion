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

const body = document.querySelector('body');
const resultado = document.querySelector('#resultado');

//Parte Cliente
const codigoC = document.querySelector('#codigoC')
const buscarCliente = document.querySelector('#nombre');
const saldo = document.querySelector('#saldo');
const localidad = document.querySelector('#localidad');
const direccion = document.querySelector('#direccion');
const provincia = document.querySelector('#provincia');
const dnicuit = document.querySelector('#dnicuit');
const telefono = document.querySelector('#telefono');
const conIva = document.querySelector('#conIva');
const observaciones = document.querySelector('#observaciones')

//parte buscador Producto
const codigo = document.querySelector('#codigo');
const cambioPrecio = document.querySelector('.parte-producto_cambioPrecio');
const nuevaCantidadDiv = document.querySelector('.parte-producto_cantidad');
const descripcionAgregar = document.querySelector('.parte-producto_descripcion');
const precioAgregar = document.querySelector('.parte-producto_precio');
const agregariva = document.querySelector('.parte-producto_iva');


const total = document.querySelector('#total');
const ventaValorizado = document.querySelector('.ventaValorizado')
const valorizado = document.querySelector('.valorizado')
const imprimirCheck = document.querySelector('.imprimirCheck')
const impresion = document.querySelector('.impresion')


const tiposVentas = document.querySelectorAll('input[name="tipoVenta"]')
const borrarProducto = document.querySelector('.borrarProducto')
const inputEmpresa = document.querySelector('#empresa');
const alerta = document.querySelector('.alerta');
const cancelar = document.querySelector('.cancelar')
inputEmpresa.value = empresa;

let situacion = "blanco"//para teclas alt y F9
let totalPrecioProducos = 0;
let seleccionado = "";
let subseleccionado = ""
let tipoVenta;
let borraNegro = false;
let ventaDeCtaCte = "";
let arregloMovimiento= [];
let arregloProductosDescontarStock = [];
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
           if (e.key === "F8" && situacion === "negro") {
               ocultarNegro();
               situacion = 'blanco'
           }
       })
   }
});

body.addEventListener('keyup',e=>{
    if (e.keyCode === 40 && seleccionado.nextElementSibling) {
        let aux;
        for (let i = 0; i < seleccionado.children.length; i++) {
            aux = seleccionado.children[i].className.includes("subseleccionado") ? i : aux;
        }
        seleccionado && seleccionado.classList.remove('seleccionado');
        seleccionado = seleccionado.nextElementSibling;
        seleccionado.classList.add('seleccionado');

        subseleccionado && subseleccionado.classList.remove('subseleccionado');
        subseleccionado = seleccionado.children[aux];
        subseleccionado.classList.add('subseleccionado');
    }else if(e.keyCode === 38 && seleccionado.previousElementSibling){
        let aux;
        for (let i = 0; i < seleccionado.children.length; i++) {
            aux = seleccionado.children[i].className.includes("subseleccionado") ? i : aux;
        }

        seleccionado && seleccionado.classList.remove('seleccionado');
        seleccionado = seleccionado.previousElementSibling;
        seleccionado.classList.add('seleccionado');

        subseleccionado && subseleccionado.classList.remove('subseleccionado');
        subseleccionado = seleccionado.children[aux];
        subseleccionado.classList.add('subseleccionado');
    }else if(e.keyCode === 37 && subseleccionado.previousElementSibling){
        subseleccionado.classList.remove('subseleccionado');
        subseleccionado = subseleccionado.previousElementSibling
        subseleccionado.classList.add('subseleccionado');
    }else if(e.keyCode === 39 && subseleccionado.nextElementSibling){
        subseleccionado.classList.remove('subseleccionado');
        subseleccionado = subseleccionado.nextElementSibling
        subseleccionado.classList.add('subseleccionado');
    }else if(e.key === "Control"){
        document.addEventListener('keydown',e=>{
            if (e.keyCode === 67) {
              if (subseleccionado) {
                  let aux = document.createElement("textarea");
                  aux.innerHTML = subseleccionado.innerHTML
                  document.body.appendChild(aux);
                  aux.select();
                  document.execCommand("copy");
                  document.body.removeChild(aux);
              }
            }
        });
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
});

//hacemos enter despues de agregar la descripcion al producto 999-999
descripcion.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        agregariva.children[0].focus();
    }
});

//hacemos enter al iva del producto 999-999
agregariva.children[0].addEventListener('keypress',e=>{
    e.preventDefault();
    if (e.key === "Enter") {
        if (precioAgregar.classList.contains('none')) {
            cambioPrecio.children[1].focus();
        }else{
            precio.focus();
        }
    }
})


//creamos un producto para listarlo en la pantalla
precioAgregar.addEventListener('keypress',e=>{
    if (e.key === "Enter" && codigo.value !== "888-888") {
        const product = {
            descripcion: descripcionAgregar.children[0].value,
            precio_venta: precioAgregar.children[0].value !== "" ? parseFloat(precioAgregar.children[0].value) : 0,
            _id:codigo.value,
            marca:"",
            unidad:"",
            iva: agregariva.children[0].value
        }
        dialogs.prompt("Cantidad",async valor =>{
            if (valor !== "" && parseFloat(valor) !== 0) {
                await mostrarVentas(product,parseFloat(valor));
            }
            codigo.value = await "";
            codigo.focus()
            precioAgregar.children[0].value = await "";
            precioAgregar.classList.add('none');
            agregariva.classList.add('none')
            descripcionAgregar.children[0].value = await "";
            descripcionAgregar.classList.add('none');
        });
    }

})


//Cuando buscamos un producto
codigo.addEventListener('keypress',async (e) => {
    if((codigo.value.length===3 || codigo.value.length===7) && e.key != "Backspace" && e.key !== "-" && e.key !== "Enter"){
        codigo.value = codigo.value + "-"
    }
    if (e.key === 'Enter') {

        if (!nuevaCantidadDiv.classList.contains('none')) {
            nuevaCantidadDiv.classList.add('none');
            cambioPrecio.classList.add('none');
            agregariva.classList.add('none');
        }

        if (e.target.value !== "") {
            if (codigo.value === "999-999") {          
                //habilitamos para que podamos escribir un producto     
                descripcionAgregar.classList.remove('none');
                precioAgregar.classList.remove('none');
                agregariva.classList.remove('none');
                descripcionAgregar.children[0].focus();
                
            }else if(codigo.value === "888-888"){
                const precio = document.querySelector('.parte-producto_precio')
                let descripcion = document.querySelector('.parte-producto_descripcion');
                descripcion.classList.remove('none')
                let producto = (await axios.get(`${URL}productos/888-888`)).data;
                descripcion.children[0].value = producto.descripcion;
                precio.classList.remove('none');
                precio.children[0].focus();
                precio.addEventListener('keypress',async e=>{
                    if (e.key === "Enter") {
                        const product = {
                            descripcion: descripcion.children[0].value,
                            precio_venta: parseFloat(precio.children[0].value),
                            _id:codigo.value
                        }
                        dialogs.prompt("Cantidad",async valor =>{
                            await mostrarVentas(product,parseFloat(valor));
                            codigo.value = "";
                            precio.children[0].value = "";
                            descripcion.children[0].value = "";
                            await codigo.focus();
                            precio.classList.add('none')
                            descripcion.classList.add('none')
                        })
                    }
                })
            }else{
            let producto = (await axios.get(`${URL}productos/${e.target.value}`)).data;
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
                            if (!Number.isInteger(parseFloat(valor)) && producto.unidad === "U") {
                                await alert("La cantidad de este producto no puede ser en decimal")
                                codigo.focus()
                            }else{
                                producto.stock<0 && alert("Stock En Negativo");
                               (parseFloat(producto.precio_venta) === 0 && alert("Precio del producto en 0"))
                                await mostrarVentas(producto,parseFloat(valor));
                                e.target.value="";
                                codigo.focus();
                            }}})}}
        }else{
            ipcRenderer.send('abrir-ventana',"productos")
        }}})

ipcRenderer.on('mando-el-producto',(e,args) => {
    const {producto,cantidad} = JSON.parse(args);
    mostrarVentas(producto,parseFloat(cantidad))
})
let id = 1 //id de la tabla de ventas
function mostrarVentas(objeto,cantidad) {
    console.log(objeto.iva)
    Preciofinal += (parseFloat(objeto.precio_venta)*cantidad);
    total.value = (parseFloat(Preciofinal)).toFixed(2)
    resultado.innerHTML += `
        <tr id=${id}>
        <td class="tdEnd">${(cantidad).toFixed(2)}</td>
        <td>${objeto._id}</td>
        <td>${objeto.descripcion} ${objeto.marca}</td>
        <td class="tdEnd">${(objeto.iva === "R" ? 10.50 : 21).toFixed(2)}</td>
        <td class="tdEnd">${parseFloat(objeto.precio_venta).toFixed(2)}</td>
        <td class="tdEnd">${(parseFloat(objeto.precio_venta)*(cantidad)).toFixed(2)}</td>
        </tr>
    `
    objeto.identificadorTabla = `${id}`;
    id++;
    totalPrecioProducos += (objeto.precio_venta * cantidad);
    listaProductos.push({objeto,cantidad});
}



body

resultado.addEventListener('click',e=>{
    seleccionado && seleccionado.classList.remove('seleccionado');
    subseleccionado && subseleccionado.classList.remove('subseleccionado');
    seleccionado = e.path[0].nodeName === "TD" ? e.path[1] : e.path[0];
    subseleccionado = e.path[0];
    seleccionado.classList.add('seleccionado');
    subseleccionado.classList.add('subseleccionado');
    if (seleccionado) {
        borrarProducto.classList.remove('none');
        cambioPrecio.classList.remove('none');
        nuevaCantidadDiv.classList.remove('none');
        agregariva.classList.remove('none');
    }
})


//Para Cambiar el precio de un producto
cambioPrecio.children[1].addEventListener('keypress',async (e)=>{
    if (e.key === "Enter") {
        const  producto = listaProductos.find(({objeto,cantidad})=> objeto.identificadorTabla === seleccionado.id);
        await borrarUnProductoDeLaLista(seleccionado);
        producto.objeto.precio_venta = cambioPrecio.children[1].value !== "" ? parseFloat(cambioPrecio.children[1].value) : producto.objeto.precio_venta;
        producto.cantidad = nuevaCantidad.value !== "" ? nuevaCantidad.value : producto.cantidad;
        producto.objeto.iva = agregariva.children[0].value;
        mostrarVentas(producto.objeto,parseFloat(producto.cantidad));
        cambioPrecio.children[1].value = "";
        nuevaCantidad.value = "";
        cambioPrecio.classList.add('none');
        agregariva.classList.add('none');
        borrarProducto.classList.add('none');
        nuevaCantidadDiv.classList.add('none');
        codigo.focus()
    }
})

//Para cambiar la cantidad
const nuevaCantidad = document.querySelector('#nuevaCantidad');
nuevaCantidad.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        agregariva.children[0].focus();
    }
})


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
    cobrado.value !== "" && inputCobrado(cobrado.value)
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
    total.value = parseFloat(numero).toFixed(2);
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

//Vemos que tipo de venta es
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
    arregloProductosDescontarStock.push(producto);
}

//INICIO MOVPRODUCTOS

//Registramos un movimiento de producto
async function movimientoProducto(cantidad,objeto,idCliente,cliente){
    let movProducto = {}
    movProducto.codProd = objeto._id
    movProducto.descripcion = `${objeto.descripcion} ${objeto.marca ? objeto.marca :""} ${objeto.cod_fabrica ? objeto.cod_fabrica : ""}`;
    movProducto.codCliente = idCliente;
    movProducto.cliente = cliente;
    movProducto.comprobante = tipoVenta
    movProducto.tipo_comp = venta.tipo_comp
    movProducto.nro_comp=venta.nro_comp
    movProducto.egreso = cantidad
    movProducto.stock = parseFloat((parseFloat(objeto.stock) - cantidad).toFixed(2))
    movProducto.precio_unitario=objeto.precio_venta
    movProducto.total=(parseFloat(movProducto.egreso)*parseFloat(movProducto.precio_unitario)).toFixed(2)
    movProducto.vendedor = venta.vendedor;
    arregloMovimiento.push(movProducto);
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
    const mostrar = document.querySelector('#numeroFactura');
    texto = verNumero(conIva.value);
     mostrar.value = ((await axios.get(`${URL}tipoVenta`)).data)[texto];
})


//redondea un numero a dos decimales
function redondear(numero) {
    return (parseFloat((Math.round(numero + "e+2") +  "e-2")));

}

const tamanioVentas = async(tipoVenta)=>{//tipoVenta = Presupuesto o Ticket Factura
    tamanio = await axios.get(`${URL}presupuesto`);
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
async function sumarSaldoAlClienteEnNegro(precio,codigo,valorizado,venta){
    !valorizado ? precio = "0.1" : precio;
    let cliente = (await axios.get(`${URL}clientes/id/${codigo}`)).data
    let saldo_p = (parseFloat(precio) + parseFloat(cliente.saldo_p)).toFixed(2);
    cliente.saldo_p = saldo_p;
    let lista = cliente.listaVentas;
    lista.push(venta);
    cliente.listaVentas = lista;
    await axios.put(`${URL}clientes/${codigo}`,cliente);
}

async function sumarSaldoAlCliente(precio,codigo,venta) {
    let cliente = await axios.get(`${URL}clientes/id/${codigo}`)
    cliente = cliente.data;
    cliente.listaVentas.push(venta);
    let saldo = (parseFloat(precio)+parseFloat(cliente.saldo)).toFixed(2);
    cliente.saldo = saldo;
    await axios.put(`${URL}clientes/${codigo}`,cliente)
}
const sacarIdentificadorTabla = (arreglo)=>{
    arreglo.forEach(producto=>{
        delete producto.objeto.identificadorTabla  
    })
}

//Aca mandamos la venta en presupuesto
const presupuesto = document.querySelector('.presupuesto');

presupuesto.addEventListener('click',async (e)=>{
    e.preventDefault()
    
    if (confirm("Presupuesto?")) {

        if (listaProductos.length===0) {
            //Avisamos que no se puede hacer una venta sin productos
            alert("Cargar Productos")
        }else{
            //creamos una lista sin los descuentos para imprimirlos
            const listaSinDescuento = JSON.parse(JSON.stringify(listaProductos));

            venta.productos = listaProductos;
            venta.tipo_pago = await verElTipoDeVenta(tiposVentas); //vemos si es CD,CC o PP en el input[radio]
            if (venta.tipo_pago === "Ninguno") {
                    alert("Seleccionar un modo de venta");
            }else{
                try {
                    alerta.classList.remove('none');
                    venta.nombreCliente = buscarCliente.value;
                    tipoVenta="Presupuesto";
                    venta._id = await tamanioVentas("presupuesto")
                    venta.descuento = (descuentoN.value);
                    venta.precioFinal = redondear(total.value);
                    venta.fecha = new Date();
                    venta.tipo_comp = tipoVenta;
                    venta.observaciones = observaciones.value;
                    //Le pasamos que es un presupuesto contado CD
                    venta.nro_comp = await traerUltimoNroComprobante(tipoVenta,venta.cod_comp,venta.tipo_pago);
                    venta.empresa = inputEmpresa.value;
                    let valorizadoImpresion = "valorizado"
                    if (!valorizado.checked && venta.tipo_pago === "CC") {
                    valorizadoImpresion="no valorizado";
                    }
                    sacarIdentificadorTabla(venta.productos);
                    
                    for await (let producto of venta.productos){
                            if (parseFloat(descuentoN.value) !== 0 && descuentoN.value !== "" ) {
                                producto.objeto.precio_venta =  (parseFloat(producto.objeto.precio_venta)) - parseFloat(producto.objeto.precio_venta)*parseFloat(descuento.value)/100
                                producto.objeto.precio_venta = producto.objeto.precio_venta.toFixed(2)
                            }
                        }

                    await axios.post(`${URL}presupuesto`,venta)
                    await actualizarNumeroComprobante(venta.nro_comp,venta.tipo_pago,venta.cod_comp)
                     //si la venta es CC Sumamos un saldo al cliente y ponemos en cuenta corriente compensada y historica
                     if (venta.tipo_pago === "CC") {
                        await sumarSaldoAlClienteEnNegro(venta.precioFinal,venta.cliente,valorizado.checked,venta.nro_comp);
                        await  ponerEnCuentaCorrienteCompensada(venta,valorizado.checked);
                        await ponerEnCuentaCorrienteHistorica(venta,valorizado.checked,saldo_p.value);
                    }
                     if (impresion.checked) {
                         let cliente = {
                             _id:codigoC.value,
                             cliente: buscarCliente.value,
                             cuit: dnicuit.value,
                             direccion: direccion.value,
                             localidad: localidad.value,
                             cond_iva: conIva.value
                         }
                         if (venta.tipo_pago === "CC") {
                            ipcRenderer.send('imprimir-venta',[venta,cliente,true,2,"imprimir-comprobante",valorizadoImpresion,listaSinDescuento])
                         }else{
                             ipcRenderer.send('imprimir-venta',[venta,cliente,false,1,"imprimir-comprobante",valorizadoImpresion,listaSinDescuento])
                         }
                     }
                     //si la venta es distinta de presupuesto sacamos el stock y movimiento de producto
                     if(venta.tipo_pago !== "PP"){
                        for(let producto of venta.productos){
                            producto.objeto._id !== "999-999" &&  await sacarStock(producto.cantidad,producto.objeto);
                            await movimientoProducto(producto.cantidad,producto.objeto,venta.cliente,venta.nombreCliente);
                         }
                         await axios.put(`${URL}productos`,arregloProductosDescontarStock)
                         await axios.post(`${URL}movProductos`,arregloMovimiento);
                         arregloMovimiento = [];
                         arregloProductosDescontarStock = [];
                     }
    
                    window.location = "../index.html";
                     
                } catch (error) {
                    console.log(error)
                    alert("No se puedo cargar la venta")
                }finally{
                    alerta.classList.add('none');
                }
               
            }
        }
    }
})

//Aca mandamos la venta con tikect Factura
const ticketFactura = document.querySelector('.ticketFactura')
ticketFactura.addEventListener('click',async (e) =>{
    e.preventDefault();
   if (confirm("Ticket Factura?")) {
    //Vemos si algun producto tiene lista negativa
    const stockNegativo = listaProductos.find(producto=>producto.cantidad < 0);
    //mostramos alertas
    if(stockNegativo){
        alert("Ticket Factura no puede ser productos en negativo");
    }else if(listaProductos.length===0){
        alert("Ningun producto cargado")
    }else{  
     tipoVenta = "Ticket Factura";
     venta.tipo_pago = await verElTipoDeVenta(tiposVentas)//vemos si es contado,cuenta corriente o presupuesto en el input[radio]
     if (venta.tipo_pago === "Ninguno") {
            alert("Seleccionar un modo de venta");
        }else{
            alerta.classList.remove('none');
            const listaSinDescuento = JSON.parse(JSON.stringify(listaProductos))
            venta.productos = listaProductos;
            venta.nombreCliente = buscarCliente.value;
            venta.observaciones = observaciones.value;
            venta.fecha = new Date();
            venta.direccion = direccion.value
            venta.descuento = (descuentoN.value);
            venta.precioFinal = redondear(total.value);
            venta.tipo_comp = tipoVenta;
            numeroComprobante(tipoVenta);
            venta.empresa = inputEmpresa.value;
            venta.cod_comp = verCodComprobante(tipoVenta);
            if (venta.precioFinal >=10000 && (buscarCliente.value === "A CONSUMIDOR FINAL" || dnicuit.value === "00000000")) {
                alert("Factura mayor a 10000, poner datos cliente");
                alerta.classList.add('none');
            }else{
                try {
                    for(let producto of venta.productos){
                        if (parseFloat(descuentoN.value) !== 0 && descuentoN.value !== "" ) {
                            producto.objeto.precio_venta = (parseFloat(producto.objeto.precio_venta)) - parseFloat(producto.objeto.precio_venta)*parseFloat(descuento.value)/100
                            producto.objeto.precio_venta = producto.objeto.precio_venta.toFixed(2)
                        }
                    };
                    const [iva21,iva105,gravado21,gravado105,cant_iva] = gravadoMasIva(venta.productos);
                    
                    venta.gravado21 = gravado21;
                    venta.gravado105 = gravado105;
                    venta.iva21 = iva21;
                    venta.iva105 = iva105;
                    venta.cant_iva = cant_iva;
                    borraNegro && (venta.observaciones = ventaAnterior.nro_comp);
                    const afip = await subirAAfip(venta);
                    venta.nro_comp = `0005-${(afip.numero).toString().padStart(8,'0')}`;
                    venta.comprob = venta.nro_comp;
                    venta.tipo_pago === "CC" && sumarSaldoAlCliente(venta.precioFinal,venta.cliente,venta.nro_comp);
                    venta.tipo_pago === "CC" && ponerEnCuentaCorrienteCompensada(venta,true);
                    venta.tipo_pago === "CC" && ponerEnCuentaCorrienteHistorica(venta,true,saldo.value);
                    actualizarNumeroComprobante(venta.nro_comp,venta.tipo_pago,venta.cod_comp);
                    
                    nuevaVenta = await axios.post(`${URL}ventas`,venta)
                    const cliente = (await axios.get(`${URL}clientes/id/${codigoC.value.toUpperCase()}`)).data;

                    alerta.children[1].children[0].innerHTML = "Imprimiendo Venta";//cartel de que se esta imprimiendo la venta

                    //mandamos a imprimir el ticket
                    ipcRenderer.send('imprimir-venta',[venta,afip,true,1,'Ticket Factura']);
                    //Le mandamos al servidor que cree un pdf con los datos
                    await axios.post(`${URL}crearPdf`,[venta,cliente,afip]);
                    
                    if(venta.tipo_pago !== "PP" && !borraNegro){
                        for(let producto of venta.productos){
                            producto.objeto._id !== "999-999" &&  await sacarStock(producto.cantidad,producto.objeto)
                            await movimientoProducto(producto.cantidad,producto.objeto,venta.cliente,venta.nombreCliente)
                        }
                        await axios.put(`${URL}productos`,arregloProductosDescontarStock)
                        await axios.post(`${URL}movProductos`,arregloMovimiento);
                        arregloMovimiento = [];
                        arregloProductosDescontarStock = [];
                    }
        
                    if (borraNegro) {
                        //traemos los movimientos de productos de la venta anterior y lo modificamos a la nueva venta
                        const movimientosViejos = (await axios.get(`${URL}movProductos/${ventaAnterior.nro_comp}/Presupuesto`)).data;
                        for await (let mov of movimientosViejos){
                            mov.nro_comp = venta.nro_comp;
                            mov.tipo_comp = "Ticket Factura";
                        }
                        await axios.put(`${URL}movProductos`,movimientosViejos);

                        //borramos la cuenta compensada
                        await borrrarCuentaCompensada(ventaDeCtaCte);
                        //descontamos el saldo del cliente y le borramos la venta de la lista
                        await descontarSaldo(ventaAnterior.cliente,ventaAnterior.precioFinal,ventaAnterior.nro_comp,venta.nro_comp);
                        await borrarCuentaHistorica(ventaAnterior.nro_comp,ventaAnterior.cliente,ventaAnterior.tipo_comp);
                        await borrarVenta(ventaAnterior.nro_comp)
                    };
                    !borraNegro ? (window.location = '../index.html') : window.close();
                } catch (error) {
                    alert("No se puedo generar la Venta")
                    console.log(error)
                }finally{
                    alerta.classList.add('none')
                }
        }
    }
    }
   }
 })

 //sacamos el gravado y el iva de una venta
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
    const qrCode = require('qrcode');
    const url = `https://www.afip.gob.ar/fe/qr/?p=${texto}`;
    const QR = await qrCode.toDataURL(url);
    return QR;
}

//funcion que busca en la afip a una persona
 const buscarAfip = document.querySelector('.buscarAfip')
 buscarAfip.addEventListener('click',  async (e)=>{
    let cliente = (await axios.get(`${URL}clientes/cuit/${dnicuit.value}`)).data;
        if (cliente !== "") {
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
    observaciones.focus()
 })

 //Funcion para buscar una persona directamente por el cuit
 async function buscarPersonaPorCuit(cuit) {
        const Https = new XMLHttpRequest();
        const url=`https://afip.tangofactura.com/REST/GetContribuyente?cuit=${cuit}`;
        await Https.open("GET", url);
        await Https.send()
        Https.onreadystatechange = (e) => {
            if (Https.responseText !== "") {
                const persona = JSON.parse(Https.responseText)
                if (persona.errorGetData === false) {
                    const {nombre,domicilioFiscal,EsRI,EsMonotributo,EsExento,EsConsumidorFinal} = persona.Contribuyente;
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
                        cliente.cond_iva="Inscripto";
                    }else if (EsExento) {
                        cliente.cond_iva="Exento";
                    } else if (EsMonotributo) {
                        cliente.cond_iva="Monotributista";
                    } else if(EsConsumidorFinal) {
                        cliente.cond_iva="Consumidor Final";
                    }
                    cliente.cuit = dnicuit.value;
                    cliente._id = "9999";
                    ponerInputsClientes(cliente);
                }else{
                    alert("Persona no encontrada");
                }
            }
        }
         
 }

 //lo usamos para borrar un producto de la tabla
borrarProducto.addEventListener('click',e=>{
    nuevaCantidadDiv.classList.add('none');
    cambioPrecio.classList.add('none');
    borrarUnProductoDeLaLista(seleccionado);
});


    const borrarUnProductoDeLaLista =async  (productoSeleccionado)=>{
        if (productoSeleccionado) {
            
            producto = listaProductos.find(e=>e.objeto.identificadorTabla === productoSeleccionado.id);
            
            //tomamos el precio del producto que borramos
            const aDescontar = parseFloat(productoSeleccionado.children[5].innerHTML);
            //si hay un descuento ya prehecho tomamos ese descuento
            const descuentoProducto = parseFloat((aDescontar*parseFloat((descuento.value)/100).toFixed(2)).toFixed(2));

            total.value = (parseFloat(total.value)-(aDescontar - descuentoProducto)).toFixed(2);
            
            Preciofinal = (Preciofinal - (parseFloat(productoSeleccionado.children[5].innerHTML)).toFixed(2)) 
            for await(let e of listaProductos){
                if (productoSeleccionado.id === e.objeto.identificadorTabla) {
                        listaProductos = listaProductos.filter(e=>e.objeto.identificadorTabla !== productoSeleccionado.id);
                        totalPrecioProducos -= (e.objeto.precio_venta*e.cantidad);
                }
            };
            console.log(productoSeleccionado)
            productoSeleccionado.parentNode.removeChild(productoSeleccionado);
            seleccionado = "";
            subseleccionado = "";
        }
        let nuevoTotal = 0;
        listaProductos.forEach(({objeto,cantidad})=>{
            nuevoTotal += (objeto.precio_venta * cantidad);
        })
        descuentoN.value = (nuevoTotal*parseFloat(descuento.value)/100).toFixed(2);
        borrarProducto.classList.add('none');
        codigo.focus();
    }

    
//Cuando se hace un click en cancelar y se confirma, vemos si hay productos para que se guarde en una base de datos
cancelar.addEventListener('click',async e=>{
    e.preventDefault()
    if (confirm("Desea cancelar el Presupuesto")) {
        if (listaProductos.length !== 0) {
            const ventaCancelada = {};
            
            if (cliente._id) {
                ventaCancelada.cliente = cliente._id;
            }
            ventaCancelada.productos = listaProductos;
            ventaCancelada._id = await tamanioCancelados();
            ventaCancelada.vendedor = vendedor;
            await axios.post(`${URL}cancelados`,ventaCancelada);
        }
            window.location = "../index.html";
    }
})

// Vemos el tamanio de los Cancelados
const tamanioCancelados = async() =>{
    let tamanio = (await axios.get(`${URL}cancelados/tamanio`)).data;
    return `${tamanio + 1}`;
}

 //Ponemos valores a los inputs
function ponerInputsClientes(cliente) {
    cliente._id && (codigoC.value = cliente._id);
    buscarCliente.value = cliente.cliente;
    cliente.saldo && (saldo.value = cliente.saldo);
    cliente.saldo_p && (saldo_p.value = cliente.saldo_p);
    localidad.value = cliente.localidad;
    direccion.value = cliente.direccion;
    provincia.value = cliente.provincia;
    dnicuit.value = cliente.cuit;
    cliente.telefono && (telefono.value = cliente.telefono);
    conIva.value = cliente.cond_iva;
    venta.cliente = cliente._id;
    if (cliente.condicion==="M") {
        alert(`${cliente.observacion}`)
    }
    const cuentaC = document.querySelector('.cuentaC');
    (cliente.cond_fact === "4") ? cuentaC.classList.add('none') : cuentaC.classList.remove('none');
    if (codigoC.value === "9999"){
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
ipcRenderer.once('venta',async (e,args)=>{
    borraNegro = true;
    const [usuario,numero,empresaS] = JSON.parse(args);
    inputEmpresa.value = empresaS;
    ventaDeCtaCte = numero;
    textoUsuario.innerHTML = usuario;
    ventaAnterior = (await axios.get(`${URL}presupuesto/${numero}`)).data;
    let cliente = (await axios.get(`${URL}clientes/id/${ventaAnterior.cliente}`)).data;
    ponerInputsClientes(cliente)
    ventaAnterior.productos.forEach(producto =>{
        const {objeto,cantidad} = producto;
        mostrarVentas(objeto,cantidad)
    })
})

const borrrarCuentaCompensada = async(numero)=>{
    await axios.delete(`${URL}cuentaComp/id/${numero}`);
}

//descontamos el saldo del cliente
const descontarSaldo = async(codigo,precio,numero,venta)=>{
    console.log("a")
    const cliente = (await axios.get(`${URL}clientes/id/${codigo}`)).data;
    const index = cliente.listaVentas.indexOf(numero);
    cliente.listaVentas.splice(index);
    cliente.listaVentas = venta;
    cliente.saldo_p = parseFloat(cliente.saldo_p) - precio;
    await axios.put(`${URL}clientes/${codigo}`,cliente);
}

const borrarCuentaHistorica = async(numero,cliente,tipoComp)=>{
    const eliminada = (await axios.delete(`${URL}cuentaHisto/id/${numero}`)).data;
    const importeEliminado = eliminada.debe;
    const historicas = (await axios.get(`${URL}cuentaHisto/cliente/${cliente}`)).data;
    let cuentaHistoricas = historicas.filter(historica => historica.tipo_comp === tipoComp);
    cuentaHistoricas = cuentaHistoricas.filter(historica => historica.fecha > eliminada.fecha);
    cuentaHistoricas.forEach(async cuenta=>{
        cuenta.saldo = cuenta.saldo - importeEliminado;
        await axios.put(`${URL}cuentaHisto/id/${cuenta.nro_comp}`,cuenta);
    })
}

const borrarVenta = async(numero)=>{
    await axios.delete(`${URL}presupuesto/${numero}`);
}



const subirAAfip = async(venta)=>{
    alerta.children[1].children[0].innerHTML = "Esperando Confirmacion de AFIP";
    const fecha = new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString().split('T')[0];

    const serverStatus = await afip.ElectronicBilling.getServerStatus();
    console.log(serverStatus)

    let ultimoElectronica = await afip.ElectronicBilling.getLastVoucher(5,parseFloat(venta.cod_comp));

    let data = {
        'CantReg': 1,
        'CbteTipo': venta.cod_comp,
        'Concepto': 1,
        'DocTipo': venta.cod_doc,
        'DocNro': venta.dnicuit,
        'CbteDesde': ultimoElectronica + 1,
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
        };
        console.log(data);
        console.log(venta);
        const res = await afip.ElectronicBilling.createVoucher(data); //creamos la factura electronica
        alerta.children[1].children[0].innerHTML = "Venta en AFIP Aceptada";
        const qr = {
            ver: 1,
            fecha: fecha,
            cuit: 27165767433,
            ptoVta: 5,
            tipoCmp: venta.cod_comp,
            nroCmp: ultimoElectronica + 1,
            importe: data.ImpTotal,
            moneda: "PES",
            ctz: 1,
            tipoDocRec: data.DocTipo,
            nroDocRec: parseInt(data.DocNro),
            tipoCodAut: "E",
            codAut: parseFloat(res.CAE)
        };
        const textoQR = btoa(JSON.stringify(qr));//codificamos lo que va en el QR
        const QR = await generarQR(textoQR);
        return {
            QR,
            cae:res.CAE,
            vencimientoCae:res.CAEFchVto,
            texto:textoQR,
            numero:ultimoElectronica + 1
        }
}

telefono.addEventListener('focus',e=>{
    telefono.select()
});
buscarCliente.addEventListener('focus',e=>{
    buscarCliente.select()
})
localidad.addEventListener('focus',e=>{
    localidad.select()
})
provincia.addEventListener('focus',e=>{
    provincia.select()
})
direccion.addEventListener('focus',e=>{
    direccion.select()
})
dnicuit.addEventListener('focus',e=>{
    
    dnicuit.select()
})

descuento.addEventListener('focus',e=>{
    descuento.select()
})

cobrado.addEventListener('focus',e=>{
    cobrado.select()
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
});

descuento.addEventListener('keypress',e=>{
    if (e.key === "Enter" && situacion==="blanco") {
        ticketFactura.focus()
    }else if(e.key === "Enter" && situacion==="negro"){
        presupuesto.focus()
    }
});

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
    cuenta.observaciones = venta.observaciones;
    await axios.post(`${URL}cuentaHisto`,cuenta);
}