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
                    codigoC.value === "9999" ? buscarCliente.focus() : observaciones.focus()
                }
            })
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
codigo.addEventListener('keypress',(e) => {
    if((codigo.value.length===3 || codigo.value.length===7) && e.key != "Backspace" && e.key !== "-" && e.key !== "Enter"){
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
        venta.vendedor = vendedor
         if (parseFloat(precioFinal)>10000 && buscarCliente.value === "A CONSUMIDOR FINAL" && dnicuit.value === "00000000"  && direccion.value === "CHAJARI") {
             alert("Factura mayor a 10000, poner valores clientes")
         }else{
            actualizarNroCom(venta.nro_comp,venta.cod_comp)
            let afip
            let ventaRelacionada = (await axios.get(`${URL}ventas/${args}`)).data;
            if (ventaRelacionada.length === 0) {
                ventaRelacionada = (await axios.get(`${URL}presupuesto/${args}`)).data;
            }
            afip = await subirAAfip(venta,ventaRelacionada[0])
            ipcRenderer.send('nueva-venta',venta)
            ipcRenderer.send('imprimir-venta',[venta,cliente,false,1,"ticket-factura","SAM4S GIANT-100",afip])
            location.href="../index.html";
        }}})

const traerNumeroComprobante = async(codigo)=>{
    let retornar
    const tipo = (codigo === "008") ? "Ultima N Credito B" : "Ultima N Credito A"
    await ipcRenderer.invoke('traerNumeros',tipo).then((args)=>{
        retornar = JSON.parse(args)
    });
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
    ipcRenderer.send('modificar-numeros',[numero,tipoFactura])
}

const verCod_comp = (iva)=>{
    if(iva === "Inscripto"){
        return 3
    }else{
        return 8
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
    if (confirm("Desea cancelar Nota Credito")) {
        window.location = '../index.html'
    }
})

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
        { name: 'Nro_Fact', type: 'C', size: 255 },
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
          Nro_Fact: original.value,
          Vendedor:venta.vendedor,
          Empresa: "ELECTRO AVENIDA"
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