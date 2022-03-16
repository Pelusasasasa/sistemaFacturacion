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

const Dialogs = require("dialogs");
const dialogs = Dialogs()
const Vendedor = getParameterByName('vendedor')

const hoy = new Date();
let diaDeHoy =  hoy.getDate();
let mesDeHoy = hoy.getMonth();
let anioDeHoy = hoy.getFullYear();

mesDeHoy = (mesDeHoy === 0) ? 1 : mesDeHoy;
mesDeHoy = (mesDeHoy<10) ? `0${mesDeHoy}`: mesDeHoy;
diaDeHoy = (diaDeHoy<10) ? `0${diaDeHoy}`: diaDeHoy;

const { ipcRenderer } = require("electron");

let situacion = "blanco"
document.addEventListener('keydown',(event) =>{
    if (event.key === "Alt") {
       document.addEventListener('keydown',(e) =>{
           if (e.key === "F9" && situacion === "blanco") {
               mostrarNegro();
               situacion = 'negro';
               (parseFloat(cliente.saldo_p)>0) && saldoAfavor.setAttribute('disabled',"")
            listarLista(nuevaLista,situacion)
           }
       })
   }
})

document.addEventListener('keydown',(event) =>{
   if (event.key === "Alt") {
      document.addEventListener('keydown',(e) =>{
          if (e.key === "F3" && situacion === "negro") {
              ocultarNegro();
              situacion = 'blanco';
              (parseFloat(cliente.saldo)>0) && saldoAfavor.setAttribute('disabled',"");
            listarLista(nuevaLista,situacion);
          }
      })
  }
})

const body = document.querySelector('.contenedorEmitirRecibo')
const informacionCliente = document.querySelector('.informacionCliente')
const botones = document.querySelector('.botones')
const pagado = document.querySelector('.pagado')
const ocultarNegro = ()=>{
    pagado.classList.remove('mostrarNegro')
    informacionCliente.classList.remove('mostrarNegro')
    botones.classList.remove('mostrarNegro')
    saldo.classList.remove('none')
    saldo_p.classList.add('none')
    body.classList.remove('mostrarNegro')
}

const mostrarNegro = ()=>{
    pagado.classList.add('mostrarNegro')
    informacionCliente.classList.add('mostrarNegro')
    botones.classList.add('mostrarNegro')
    const body = document.querySelector('.contenedorEmitirRecibo')
    saldo.classList.add('none')
    saldo_p.classList.remove('none')
    body.classList.add('mostrarNegro')
}


const codigo = document.querySelector('#codigo')
const nombre = document.querySelector('#nombre')
const saldo = document.querySelector('#saldo')
const saldo_p = document.querySelector('#saldo_p')
const direccion = document.querySelector('#direccion')
const localidad = document.querySelector('#localidad');
const fecha = document.querySelector('#fecha')
fecha.value = `${anioDeHoy}-${mesDeHoy}-${diaDeHoy}`
const cond_iva = document.querySelector('#cond_iva')
const cuit = document.querySelector('#cuit')
const listar = document.querySelector('.listar')
const imprimir = document.querySelector('.imprimir')
const cancelar = document.querySelector('.cancelar')
const vendedor = document.querySelector('.vendedor');
const saldoAfavor = document.querySelector('#saldoAFavor');
const total = document.querySelector('#total');
let inputSeleccionado  = listar
let trSeleccionado
total.value = 0.00
let cliente = {}
let listaVentas = []
let nuevaLista=[]
let arregloParaImprimir = [];
vendedor.innerHTML = `<h3>${Vendedor}</h3>`


codigo.addEventListener('keypress', async (e)=>{
    if (e.key === 'Enter') {
        if (codigo.value !== "") {
            cliente = (await axios.get(`${URL}clientes/id/${codigo.value.toUpperCase()}`)).data;
            if ((cliente === "")) {
                alert("Cliente no encontrado")
                codigo.value = "";
            }else{
                inputsCliente(cliente);
            }
        }else{
            ipcRenderer.send('abrir-ventana',"clientes")
        }
    }
})

ipcRenderer.on('mando-el-cliente',async(e,args)=>{
    cliente=JSON.parse(args)
    inputsCliente(JSON.parse(args))
})

const listarLista = (lista,situacion)=>{
    let aux
    (situacion === "negro") ? (aux = "Presupuesto") : (aux = "Ticket Factura")
    listaGlobal = lista.filter(e=>e.tipo_comp === aux)
    listar.innerHTML = " ";
    listaGlobal.forEach(venta => {
        if (venta.length !== 0) {
            let saldo = parseFloat(venta.importe) - parseFloat(venta.pagado)
            let fecha = new Date(venta.fecha) 
            let dia = fecha.getDate()
            let mes = fecha.getMonth();
            let anio = fecha.getFullYear();
            
            mes = (mes === 0 ) ? (mes + 1) : mes;
            mes = (mes < 10) ? `0${mes}` : mes;
            dia = (dia < 10) ? `0${dia}` : dia ;

            listar.innerHTML += `
                <tr id="${venta.nro_comp}">
                <td> ${ dia } / ${ mes } / ${ anio } </td>
                <td> ${ venta.tipo_comp } </td>
                <td> ${ venta.nro_comp } </td>
                <td> ${ ( venta.importe ).toFixed ( 2 ) } </td>
                <td> ${ parseFloat ( ( venta.pagado ) ).toFixed ( 2 ) } </td>
                <td> <input type="text" id = ${ venta.nro_comp } name = "pagadoActual"> </td>
                <td class = "saldop"> ${ saldo.toFixed( 2 ) } </td>
                <td> ${ venta.observaciones } </td>
                </tr>
            `
        }
    });

}
let a;
//Vemos que tr se selecciono y lo guardamos en una varaible
    listar.addEventListener('click',e=>{
        trSeleccionado = e.path[2]
        inputSeleccionado = e.path[0]
    })

inputSeleccionado.addEventListener('keydown',(e)=>{
    if (e.key==="Tab" || e.key === "Enter") {
        const aux = trSeleccionado.children[6].innerHTML
        const aDescontar = parseFloat(trSeleccionado.children[3].innerHTML) - parseFloat(trSeleccionado.children[4].innerHTML) - parseFloat(trSeleccionado.children[6].innerHTML)
        if (inputSeleccionado.value !== "") {
            trSeleccionado.children[6].innerHTML = (parseFloat(trSeleccionado.children[3].innerHTML)-parseFloat(trSeleccionado.children[4].innerHTML) - parseFloat(inputSeleccionado.value)).toFixed(2)
        }
            let venta
            let abonadoAnterior
            nuevaLista.forEach(e =>{
                if(e.nro_comp === trSeleccionado.id){    
                    venta = e
                    abonadoAnterior=e.abonado;
                }
            });

            if ((trSeleccionado.children[6].innerHTML < 0)) {
                alert("El monto abonado es mayor al de la venta")
                trSeleccionado.children[6].innerHTML = aux;
                trSeleccionado.children[5].children[0].value = "";
                trSeleccionado.children[5].children[0].focus();
             }else{
                 //Si una venta y ase encuentra en el arreglo de imprimir no entramo al if sino agregamos la venta al arreglo
                if (!arregloParaImprimir.some(objeto => objeto.numero === trSeleccionado.id)) {
                    const renglon = trSeleccionado.children
                    let objeto = {
                        fecha: renglon[0].innerHTML.trim(),
                        comprobante: renglon[1].innerHTML.trim(),
                        numero: renglon[2].innerHTML.trim(),
                        pagado: renglon[5].children[0].value.trim(),
                        saldo: renglon[6].innerHTML.trim()

                    };
                    (inputSeleccionado.value !== "")  && arregloParaImprimir.push(objeto);
                }else{
                    const modificarSaldo = arregloParaImprimir.find(objeto => objeto.numero === trSeleccionado.id)
                    modificarSaldo.precioFinal = parseFloat(inputSeleccionado.value)
                    modificarSaldo.pagado = parseFloat(inputSeleccionado.value)
                }
                if(a === inputSeleccionado.id){
                    total.value = (parseFloat(inputSeleccionado.value) + parseFloat(total.value) - parseFloat(aDescontar)).toFixed(2)
                }else{
                    if (inputSeleccionado.value !== "") {
                        total.value = ((parseFloat(inputSeleccionado.value) + parseFloat(total.value)) - parseFloat(aDescontar)).toFixed(2)
                    }
                }
                a=trSeleccionado.id
                if(trSeleccionado.nextElementSibling){
                    trSeleccionado = trSeleccionado.nextElementSibling
                    inputSeleccionado = trSeleccionado.children[5].children[0] 
                    trSeleccionado.children[5].children[0].focus()
                }else{
                    saldoAfavor.focus()
                }
        }
        if ((parseFloat(total.value) === parseFloat(cliente.saldo) && situacion === "blanco") || (parseFloat(total.value) === parseFloat(cliente.saldo_p) && situacion === "negro")) {
            const saldoAFavor = document.querySelector('#saldoAFavor');
            saldoAFavor.removeAttribute('disabled')
        }else{
            saldoAFavor.setAttribute('disabled',"")
        }
        }

})

let saldoAFavorAnterior = "0"
saldoAfavor.addEventListener('keydown',e=>{
    
    if (e.key === "Enter" && saldoAfavor.value !== "") {
        total.value = (parseFloat(total.value) + parseFloat(saldoAfavor.value) - parseFloat(saldoAFavorAnterior)).toFixed(2);
        (saldoAfavor.value = (parseFloat(saldoAfavor.value)).toFixed(2));
        saldoAFavorAnterior = saldoAfavor.value 
    }
})

imprimir.addEventListener('click', e=>{
    e.preventDefault;
    hacerRecibo();
})
imprimir.addEventListener('keydown',e=>{
    e.preventDefault()
    if (e.key === "Enter") {
        hacerRecibo();
    }
})


const hacerRecibo = async()=>{
    modificarVentas(nuevaLista)
    const nrmComp = await traerUltimoNroRecibo()
    modifcarNroRecibo(nrmComp)
    const recibo = {}
    recibo.nro_comp = nrmComp
    recibo.cod_comp = verCodComp(cond_iva.value)
    recibo.dnicuit = cuit.value
    recibo._id = await tamanioVentas()
    recibo.pagado = true
    recibo.cliente = cliente._id
    recibo.vendedor = Vendedor
    recibo.precioFinal = parseFloat(total.value).toFixed(2);
    recibo.tipo_comp = (situacion === "blanco" ? "Recibos" : "Recibos_P" );
    const aux = (situacion === "negro") ? "saldo_p" : "saldo"
    let saldoFavor = 0;
    saldoFavor = (saldoAfavor.value !== "") && parseFloat(saldoAFavor.value);
    recibo.abonado = saldoAfavor.value;
    const saldoNuevo = parseFloat((parseFloat(cliente[aux]) - parseFloat(total.value)).toFixed(2));
    //Tomamos el cliente y agregamos a su lista Ventas la venta y tambien modificamos su saldo
    const _id = recibo.cliente;
    let clienteTraido = await axios.get(`${URL}clientes/id/${_id}`);
    clienteTraido = clienteTraido.data;
    //saldo
    clienteTraido[aux] = saldoNuevo.toFixed(2);
    //listaVentas
    let listaVentas = clienteTraido.listaVentas;
    listaVentas[0] === "" ? (listaVentas[0] = recibo.nro_comp) : (listaVentas.push(recibo.nro_comp));
    clienteTraido.listaVentas = listaVentas;
    await axios.put(`${URL}clientes/${_id}`,clienteTraido);
    await axios.post(`${URL}ventas`,recibo);
    saldoAfavor.value !== "" && ponerEnCuentaCorrienteCompensada(recibo);
    ponerEnCuentaCorrienteHistorica(recibo);
    const afip =  recibo.tipo_comp === "Recibos" ? await subirAAfip(recibo) : {};
    const impresora = recibo.tipo_comp === "Recibos" ? "SAM4S GIANT-100" : undefined;
    // arregloParaImprimir contiene todos las ventas que tiene pagadas y total contiene el total del recibo
    ipcRenderer.send('imprimir-venta',[recibo,cliente,false,1,recibo.tipo_comp,arregloParaImprimir,total.value]);
    location.href = "../index.html"
}

const traerUltimoNroRecibo = async ()=>{
    let numero = await axios.get(`${URL}tipoVenta`)
    numero = numero.data["Ultimo Recibo"];
    return numero
}

const modifcarNroRecibo = async(numero)=>{
    let [n1,n2] = numero.split('-')
    n2 = parseFloat(n2 ) + 1
    n2 = n2.toString().padStart(8,0)
    let nrmComp = n1 + "-" + n2

    let numeros = await axios.get(`${URL}tipoVenta`)
    numeros = numeros.data;
    numeros["Ultimo Recibo"] = nrmComp;
    await axios.put(`${URL}tipoventa`,numeros)

}

document.addEventListener('keydown',e=>{
    if(e.key === "Escape"){
        window.history.go(-1)
    }
}) 


const inputsCliente = async (cliente)=>{
    const obtenerFecha = new Date();
    let dia = obtenerFecha.getDate();
    dia < 10 ? dia=`0${dia}` : dia;
    let mes = obtenerFecha.getMonth() + 1;
    mes = (mes === 0) ? mes + 1 : mes;
    mes < 10 ? mes=`0${mes}` : mes;
    let anio = obtenerFecha.getFullYear(); 
    const mostrarFecha =`${anio}-${mes}-${dia}`;
    (cliente.cond_iva === "") ? (cond_iva.value = "Consumidor Final") : (cond_iva.value = cliente.cond_iva) ;
    codigo.value = cliente._id;
    nombre.value = cliente.cliente;
    saldo.value = cliente.saldo;
    saldo_p.value = cliente.saldo_p
    direccion.value = cliente.direccion;
    localidad.value = cliente.localidad;
    cuit.value = cliente.cuit;
    fecha.value = mostrarFecha;


    if (situacion === "blanco" && parseFloat(cliente.saldo) > 0)  {
        saldoAFavor.setAttribute("disabled","")
    }else if(situacion === "negro" && parseFloat(cliente.saldo_p) > 0){
        saldoAFavor.setAttribute("disabled","")
    }
    let conpensada = (await axios.get(`${URL}cuentaComp/cliente/${cliente._id}`)).data;
    nuevaLista = conpensada
    listarLista(conpensada,situacion)
    trSeleccionado = listar.firstElementChild
    if (trSeleccionado) {
        inputSeleccionado = trSeleccionado.children[5].children[0]  
    }
}   

const tamanioVentas = async()=>{
    let retornar
    retornar = await axios.get(`${URL}ventas`);
    retornar = retornar.data;
    return (retornar + 1); 
}


const modificarVentas = (lista)=>{
    const trs = document.querySelectorAll('tbody tr')
    trs.forEach(tr=>{
        nuevaLista.forEach(async venta=>{
            if(tr.id === venta.nro_comp){
                venta.pagado = (tr.children[5].children[0].value !== "") ? parseFloat((parseFloat(tr.children[4].innerHTML) + parseFloat(tr.children[5].children[0].value)).toFixed(2)) : parseFloat(venta.pagado);
                venta.saldo = parseFloat(tr.children[6].innerHTML);
                if(venta.importe === venta.pagado){
                    await axios.delete(`${URL}cuentaComp/id/${venta.nro_comp}`);
                }else{
                    await axios.put(`${URL}cuentaComp/id/${venta.nro_comp}`,venta);
                }
                
            }
        })
    })
}

cancelar.addEventListener('click',e=>{
    if (confirm("Desea cancelar el Recibo")) {
        location.href = "../index.html"
    }
});

const subirAAfip = async(venta)=>{
    console.log(await afip.ElectronicBilling.getAliquotTypes())
    const fecha = new Date(Date.now() - ((new Date()).getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    let ultimoElectronica = await afip.ElectronicBilling.getLastVoucher(5,parseFloat(venta.cod_comp));
    (ultimoElectronica === 0) && (ultimoElectronica=1); 
    let totalIva105 = 0
    let totalIva21=0
    let totalNeto21 = 0 
    let totalNeto105 = 0
    let data = {
        'CantReg': 1,
        'CbteTipo': venta.cod_comp,
        'Concepto': 1,
        'DocTipo': 20,
        'DocNro': venta.dnicuit,
        'CbteDesde': 1,
        'CbteHasta': ultimoElectronica+1,
        'CbteFch': parseInt(fecha.replace(/-/g, '')),
        'ImpTotal': parseFloat(venta.precioFinal),
        'ImpTotConc': 0,
        'ImpNeto': parseFloat((parseFloat(venta.precioFinal)/1.21).toFixed(2)),
        'ImpOpEx': 0,
        'ImpIVA':parseFloat((parseFloat(venta.precioFinal) - parseFloat(venta.precioFinal)/1.21).toFixed(2)),
        'ImpTrib': 0,
        'MonId': 'PES',
        'PtoVta': 5,
        'MonCotiz' 	: 1,
        "Iva":[],
        }
        data.Iva.push(
            {
                "Id": 5,
                "BaseImp": parseFloat((parseFloat(venta.precioFinal)/1.21).toFixed(2)),
                "Importe": parseFloat((parseFloat(venta.precioFinal) - parseFloat(venta.precioFinal)/1.21).toFixed(2))
            }
        )
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

//Generamos el qr
async function generarQR(texto) {
    const fs = require('fs')
    const url = `https://www.afip.gob.ar/fe/qr/?p=${texto}`;
    return url
}

const verCodComp = (condicionIva) =>{
    console.log(condicionIva)
    if(condicionIva === "Inscripto"){
        return  4
    }else{
        return 9
    }
}

const ponerEnCuentaCorrienteCompensada = async(recibo)=>{
    const cuenta = {};
    const id = (await axios.get(`${URL}cuentaComp`)).data + 1;
    cuenta._id = id;
    cuenta.codigo = recibo.cliente;
    cuenta.cliente = cliente.cliente;
    cuenta.tipo_comp = recibo.tipo_comp;
    cuenta.nro_comp = recibo.nro_comp;
    cuenta.importe = saldoAfavor.value;
    cuenta.saldo = saldoAfavor.value;
    await axios.post(`${URL}cuentaComp`,cuenta);
}

const ponerEnCuentaCorrienteHistorica = async(recibo)=>{
    const cuenta = {};
    const id = (await axios.get(`${URL}cuentaHisto`)).data + 1;
    cuenta._id = id;
    cuenta.codigo = recibo.cliente;
    cuenta.cliente = cliente.cliente;
    cuenta.tipo_comp = recibo.tipo_comp;
    cuenta.nro_comp = recibo.nro_comp;
    cuenta.haber = parseFloat(recibo.precioFinal);
    cuenta.saldo = cuenta.tipo_comp === "Recibos" ? parseFloat((parseFloat(cliente.saldo) - cuenta.haber).toFixed(2))  : parseFloat((parseFloat(cliente.saldo_p) - cuenta.haber).toFixed(2));
    await axios.post(`${URL}cuentaHisto`,cuenta)
}