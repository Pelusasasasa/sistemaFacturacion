const { ipcRenderer } = require("electron")
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

const vendedor = getParameterByName('vendedor')

const Dialogs = require("dialogs");
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
const borrarProducto = document.querySelector('.borrarProducto')
const facturaOriginal = document.querySelector('#original');
const radios = document.querySelectorAll('input[name=tipo]');

let cliente = {};
let venta = {};
let listaProductos = [];
let yaSeleccionado;
precioFinal = 0;

codigoC.addEventListener('keypress',async e=>{
    if ((e.key === "Enter")) {
        if (codigoC.value !== "") {
            let cliente = (await axios.get(`${URL}clientes/id/${codigoC.value.toUpperCase()}`)).data;
                if (cliente==="") {
                    alert("Cliente no encontrado")
                    codigoC.value = ""
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
    if (cliente.condicion==="M") {
        alert(`${cliente.observacion}`)
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
        if (e.target.value !== "") {
            let producto = (await axios.get(`${URL}productos/${e.target.value}`)).data
                if (producto.length === 0) {
                        alert("No existe ese Producto")
                        codigo.value = "";
                        codigo.focus()
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
                                await mostrarVentas(producto,valor)
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
        <td class="tdEnd">${(parseFloat(cantidad)).toFixed(2)}</td>
        <td>${objeto._id}</td>
        <td>${objeto.descripcion}</td>
        <td class="tdEnd" >${(objeto.tasaIva !== "N" ? 10.50 : 21).toFixed(2)}</td>
        <td class="tdEnd">${parseFloat(objeto.precio_venta).toFixed(2)}</td>
        <td class="tdEnd">${(parseFloat(objeto.precio_venta)*(cantidad)).toFixed(2)}</td>
        </tr>
    `
    objeto.identificadorTabla = `${id}`
    id++
    listaProductos.push({objeto,cantidad});
    venta.productos = listaProductos
}

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
    venta.tipo_pago = await verTipoPago();
    if (facturaOriginal.value === "") {
        alert("No se escribio el numero de la factura Original")
    }else if(listaProductos.length === 0){
        alert("No se cargo productos")
    }else if(venta.tipo_pago === "NINGUNO"){
        alert("Elegir tipo de pago");
    }else{
        const venta = {};
        venta.fecha = new Date()
        venta.cliente = codigoC.value;
        //Traemos el tamanio de ventas de la BD para el _id
        venta._id = await tamanioVentas();
        venta.tipo_comp = "Nota Credito";
        venta.observaciones = observaciones.value;
        venta.descuento = descuentoN.value;
        venta.cod_comp = verCod_comp(cliente.cond_iva)
        venta.nro_comp = await traerNumeroComprobante(venta.cod_comp)
        venta.comprob = venta.nro_comp;
        venta.productos = listaProductos;
        venta.numeroAsociado = facturaOriginal.value;
        venta.cod_doc = (cliente.cuit.length > 8) ? 80 : 96;
        venta.dnicuit = cliente.cuit;
        venta.conIva = cliente.cond_iva;
        venta.pagado = true;
        venta.abonado = "0";
        venta.descuento = parseFloat(descuentoN.value);
        venta.precioFinal = parseFloat(total.value);
        venta.vendedor = vendedor;

         if (parseFloat(precioFinal)>10000 && buscarCliente.value === "A CONSUMIDOR FINAL" && dnicuit.value === "00000000"  && direccion.value === "CHAJARI") {
             alert("Factura mayor a 10000, poner valores clientes")
         }else{
             //Actualizamos el numero de comprobante
            await actualizarNroCom(venta.nro_comp,venta.cod_comp)
            
            //Traemos la venta relacionada con la nota de credito
            let ventaRelacionada = (await axios.get(`${URL}ventas/${args}`)).data;
            if (ventaRelacionada.length === 0) {
                ventaRelacionada = (await axios.get(`${URL}presupuesto/${args}`)).data;
            }

            //mandamos para que sea compensada
            ponerEnCuentaCorrienteCompensada(venta,true);
            //Mandamos par que sea historica
            ponerEnCuentaCorrienteHistorica(venta,true,saldo.value)
            //mandamos la venta
            ipcRenderer.send('nueva-venta',venta)
            //subimos a la afip la factura electronica
            let afip = await subirAAfip(venta,ventaRelacionada[0]);
            //Imprimos el ticket
            imprimirVenta([venta,cliente,false,1,"ticket-factura","SAM4S GIANT-100",afip])
            location.href="../index.html";
        }}})

const traerNumeroComprobante = async(codigo)=>{
    let retornar
    const tipo = (codigo === "008") ? "Ultima N Credito B" : "Ultima N Credito A"
    let numeros = (await axios.get(`${URL}tipoVenta`)).data;
    let retornar = `0005-${numeros[tipo]}`
    return retornar
}

const actualizarNroCom = async(comprobante,codigo)=>{
    let numero
    let tipoFactura
    if (codigo === "008") {
        tipoFactura = "Ultima N Credito B"
    }else{
        tipoFactura = "Ultima N Credito A"
    }
    numero = comprobante
    numero = (parseFloat(numero) + 1).toString().padStart(8,0)
    let numeros = (await axios.get(`${URL}tipoVenta`)).data;
    numeros[tipoFactura] = numero;
    await axios.put(`${URL}tipoventa`,numeros);
}

const verCod_comp = (iva)=>{
    if(iva === "Inscripto"){
        return 3
    }else{
        return 8
    }
}

const tamanioVentas = async()=>{
    let tamanio = (await axios.get(`${URL}ventas`)).data;
    return tamanio
}

cancelar.addEventListener('click',e=>{
    if (confirm("Desea cancelar Nota Credito")) {
        window.location = '../index.html'
    }
})


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

 //lo usamos para borrar un producto de la tabla
 borrarProducto.addEventListener('click',e=>{
    if (yaSeleccionado) {
        producto = listaProductos.find(e=>e.objeto.identificadorTabla === yaSeleccionado.id);
        total.value = (parseFloat(total.value)-(parseFloat(producto.cantidad)*parseFloat(producto.objeto.precio_venta))).toFixed(2)
        precioFinal = (precioFinal - (parseFloat(producto.cantidad)*parseFloat(producto.objeto.precio_venta)).toFixed(2)) 
        listaProductos.forEach(e=>{
            if (yaSeleccionado.id === e.objeto.identificadorTabla) {
                    listaProductos = listaProductos.filter(e=>e.objeto.identificadorTabla !== yaSeleccionado.id)
            }
        })
        const a = yaSeleccionado
        a.parentNode.removeChild(a)
    }
    let nuevoTotal = 0;
        listaProductos.forEach(({objeto,cantidad})=>{
            nuevoTotal += (objeto.precio_venta * cantidad);
        })
    total.value = (nuevoTotal - (nuevoTotal*parseFloat(descuento.value)/100)).toFixed(2)
    descuentoN.value = (nuevoTotal*parseFloat(descuento.value)/100).toFixed(2)
    codigo.focus()
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

const subirAAfip = async(venta,ventaAsociada)=>{
    const ventaAnterior = await afip.ElectronicBilling.getVoucherInfo(parseFloat(ventaAsociada.nro_comp),5,parseFloat(ventaAsociada.cod_comp)); 
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
    const fs = require('fs')
    const url = `https://www.afip.gob.ar/fe/qr/?p=${texto}`;
    return url
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
        conector.texto(`${comprobante}   0005-${Venta.nro_comp}\n`);
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
            conector.texto(`${objeto.descripcion.slice(0,30)}       ${(parseFloat(cantidad)*parseFloat(objeto.precio_venta)).toFixed(2)}\n`)
        })
        conector.feed(2);
        conector.establecerTamanioFuente(2,1);
        conector.texto("TOTAL            $" +  Venta.precioFinal + "\n");
        conector.establecerTamanioFuente(1,1);
        conector.texto("Recibimos(mos)\n");
        conector.texto(`${venta.tipoPago === "CD" ? `Contado          ${Venta.precioFinal}`  : "Cuenta Corriente"}` + "\n");
        conector.establecerTamanioFuente(2,1);
        conector.texto("CAMBIO           $0.00\n");
        conector.establecerJustificacion(ConectorPlugin.Constantes.AlineacionCentro);
        conector.texto("*MUCHA GRACIAS*\n")
        conector.qrComoImagen("Soy el contenido del código QR");
        conector.establecerJustificacion(ConectorPlugin.Constantes.AlineacionIzquierda);
        conector.establecerTamanioFuente(1,1);
        conector.texto("CAE:" + "                  " + "Vencimiento CAE:" + "\n")
        conector.texto(cae + "           " + vencimientoCae + "\n")
        conector.feed(3)
        conector.cortar()
    
        conector.imprimirEn("Microsoft Print to PDF")
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
    
    const [Venta,Cliente,,,,,valoresQR] = arreglo
    ponerValores(Cliente,Venta,valoresQR)
    }