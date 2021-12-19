function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

const Dialogs = require("dialogs");
const dialogs = Dialogs()
const Vendedor = getParameterByName('vendedor')

const hoy = new Date();
const fechaDeHoy = (`${hoy.getFullYear()}-${hoy.getMonth() + 1}-${hoy.getDate()}`)

const { ipcRenderer } = require("electron");



let situacion = "blanco"

document.addEventListener('keydown',(event) =>{
    if (event.key === "Alt") {
       document.addEventListener('keydown',(e) =>{
           if (e.key === "F9" && situacion === "blanco") {
               mostrarNegro();
               situacion = 'negro'
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
              situacion = 'blanco'
            listarLista(nuevaLista,situacion)
          }
      })
  }
})

const ocultarNegro = ()=>{
    const body = document.querySelector('.contenedorEmitirRecibo')
    saldo.classList.remove('none')
    saldo_p.classList.add('none')
    body.classList.remove('mostrarNegro')
}

const mostrarNegro = ()=>{
    const saldo = document.querySelector('#saldo')
    const saldo_p = document.querySelector('#saldo_p')
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
fecha.value = fechaDeHoy
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


codigo.addEventListener('keypress', (e)=>{
    if (e.key === 'Enter') {
        ipcRenderer.send('abrir-ventana',"clientes")
    }
})

ipcRenderer.on('mando-el-cliente',async(e,args)=>{
    const obtenerFecha = new Date()
    let dia = obtenerFecha.getDate()
    dia < 10 ? dia=`0${dia}` : dia
    let mes = obtenerFecha.getMonth() + 1
    mes < 10 ? mes=`0${mes}` : mes
    let anio = obtenerFecha.getFullYear() 
    const mostrarFecha =`${anio}-${mes}-${dia}`;
    cliente = JSON.parse(args)
    codigo.value = cliente._id;
    nombre.value = cliente.cliente;
    saldo.value = cliente.saldo;
    saldo_p.value = cliente.saldo_p
    direccion.value = cliente.direccion;
    localidad.value = cliente.localidad;
    cond_iva.value = cliente.cond_iva;
    cuit.value = cliente.cuit;
    fecha.value = mostrarFecha;

    await ipcRenderer.invoke('traerVentas',cliente.listaVentas).then((args)=>{
        nuevaLista = []
        listaVentas = JSON.parse(args)
    })
    //Sacamos las ventas que ya estan pagadas

    listaVentas.forEach(venta => {
        venta.pagado === false && nuevaLista.push(venta)
    });

    listarLista(nuevaLista,situacion)
    trSeleccionado = listar.firstElementChild
    if (trSeleccionado) {
        inputSeleccionado = trSeleccionado.children[5].children[0]  
    }

})

const listarLista = (lista,situacion)=>{
    let aux
    (situacion === "negro") ? (aux = "Presupuesto") : (aux = "Ticket Factura")
    listaGlobal = lista.filter(e=>e.tipo_comp === aux)
    listar.innerHTML = " "
    listaGlobal.forEach(venta => {
        if (venta.length !== 0) {
            let saldo = parseFloat(venta.precioFinal) - parseFloat(venta.abonado)
            let fecha = new Date(venta.fecha) 
            const dia = fecha.getDate()
            const mes = fecha.getMonth();
            const anio = fecha.getFullYear();   
            listar.innerHTML += `
                <tr id="${venta._id}">
                <td> ${ dia } / ${ mes } / ${ anio } </td>
                <td> ${ venta.tipo_comp } </td>
                <td> ${ venta.nro_comp } </td>
                <td> ${ ( venta.precioFinal ).toFixed ( 2 ) } </td>
                <td> ${ parseFloat ( ( venta.abonado ) ).toFixed ( 2 ) } </td>
                <td> <input type="text" id = ${ venta.nro_comp } name = "pagadoActual"> </td>
                <td class = "saldop"> ${ saldo.toFixed( 2 ) } </td>
                <td> ${ venta.observaciones } </td>
                </tr>
            `
        }
    });
}
let a;
let valorAnterior = ""
    listar.addEventListener('click',e=>{
        trSeleccionado = e.path[2]
        inputSeleccionado = e.path[0]
    })
inputSeleccionado.addEventListener('keydown',(e)=>{
    if (e.key==="Tab" || e.key === "Enter") {
        const aDescontar = parseFloat(trSeleccionado.children[3].innerHTML) - parseFloat(trSeleccionado.children[6].innerHTML)
        console.log(aDescontar)
            if (inputSeleccionado.value !== "") {
                trSeleccionado.children[6].innerHTML = (parseFloat(trSeleccionado.children[3].innerHTML)-parseFloat(trSeleccionado.children[4].innerHTML) - parseFloat(inputSeleccionado.value)).toFixed(2)
            }
            let venta
            nuevaLista.forEach(e =>{
                if(e._id === trSeleccionado.id){
                    venta = e
                }
            });

            if (!arregloParaImprimir.includes(trSeleccionado.id)) {
                const renglon = trSeleccionado.children
                let objeto = {
                    fecha: renglon[0].innerHTML,
                    comprobante: renglon[1].innerHTML,
                    numero: renglon[2].innerHTML,
                    pagado: renglon[5].children[0].value,
                    saldo: renglon[6].innerHTML
                };

                (inputSeleccionado.value !== "")  && arregloParaImprimir.push(objeto);
                console.log(arregloParaImprimir);
            }
            venta.abonado = parseFloat(venta.abonado) + parseFloat(inputSeleccionado.value);
            (venta.abonado === venta.precioFinal) && (venta.pagado = true);
            if(a === inputSeleccionado.id){
                total.value = (parseFloat(inputSeleccionado.value) + parseFloat(total.value) - parseFloat(aDescontar).toFixed(2))
            }else{
                if (inputSeleccionado.value !== "") {
                    total.value = ((parseFloat(inputSeleccionado.value) + parseFloat(total.value)) - parseFloat(aDescontar)).toFixed(2)
                }
            }
            a=trSeleccionado.id
            valorAnterior = inputSeleccionado.value;
            if(trSeleccionado.nextElementSibling){
                trSeleccionado = trSeleccionado.nextElementSibling
                inputSeleccionado = trSeleccionado.children[5].children[0] 
                trSeleccionado.children[5].children[0].focus()
            }else{
                saldoAfavor.focus()
            }

        }

})

saldoAfavor.addEventListener('blur',()=>{
    (saldoAfavor.value !== "") && (total.value = parseFloat(total.value) + parseFloat(saldoAfavor.value))
})

imprimir.addEventListener('click',async e=>{
    const nrmComp = await traerUltimoNroRecibo()
    const recibo = {}
    recibo.nro_comp = nrmComp
    recibo._id = nrmComp
    recibo.pagado = true
    recibo.cliente = cliente._id
    recibo.vendedor = Vendedor
    recibo.precioFinal = parseFloat(total.value).toFixed(2)
    recibo.tipo_comp = "Recibos"
    const aux = (situacion === "negro") ? "saldo_p" : "saldo"
    let saldoFavor = 0;
    saldoFavor = (saldoAfavor.value !== "") && parseFloat(saldoAFavor.value);
    const saldoNuevo = parseFloat((parseFloat(cliente[aux]) - parseFloat(total.value)).toFixed(2)) - saldoFavor
    ipcRenderer.send('modificarSaldo',[cliente._id,aux,saldoNuevo])
    ipcRenderer.send('modificamosLasVentas',nuevaLista)
    ipcRenderer.send('nueva-venta',recibo)
    printPage(recibo,cliente.cliente,cliente.cuit,cliente.direccion,cliente.localidad,cliente.cond_iva,arregloParaImprimir,total.value)
    location.reload()
})

const traerUltimoNroRecibo =async ()=>{
    let retornar
    await ipcRenderer.invoke('traerUltimoNumero',"Ultimo Recibo").then((args)=>{
        retornar = JSON.parse(args)
    })
    return retornar
}

document.addEventListener('keydown',e=>{
    if(e.key === "Escape"){
        window.history.go(-1)
    }
})


async function printPage(recibo,nombreCliente,cuitCliente,direccionCliente,localidadCliente,ivaCliente,lista,precio){
    const div = document.querySelector('divImprimir')
    var iframe = document.getElementById("iframe");
    var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
    const numero = innerDoc.querySelector('.numero')
    const fecha = innerDoc.querySelector('.fecha');
    const cliente = innerDoc.querySelector('.cliente')
    const cuit = innerDoc.querySelector('.cuit')
    const localidad = innerDoc.querySelector('.localidad')
    const direccion = innerDoc.querySelector('.direccion')
    const iva = innerDoc.querySelector('.cond_iva')
    const total = innerDoc.querySelector('#total')
    const tbody = innerDoc.querySelector('.tbody')
    const tomarFecha = new Date();
    const hoy = tomarFecha.getDate()
    const mes = tomarFecha.getMonth() + 1;
    const anio = tomarFecha.getFullYear();

    fecha.innerHTML = `${hoy}/${mes}/${anio}`;
    numero.innerHTML = recibo.nro_comp;
    cliente.innerHTML = nombreCliente;
    cuit.innerHTML = cuitCliente;
    localidad.innerHTML=localidadCliente;
    direccion.innerHTML=direccionCliente;
    iva.innerHTML = ivaCliente;
    tbody.innerHTML = ""

    lista.forEach(objeto => {
        tbody.innerHTML += `
            <tr>
                <td>${objeto.fecha}</td>
                <td>${objeto.comprobante}</td>
                <td>${objeto.numero}</td>
                <td>${(parseFloat(objeto.pagado)).toFixed(2)}</td>
                <td>${(parseFloat(objeto.saldo)).toFixed(2)}</td>
            </tr>
        `
    })
    total.value = precio
    const informacionCliente = document.querySelector('.informacionCliente')
    const tabla = document.querySelector('.tabla')
    const pagado = document.querySelector('.pagado')
    console.log(pagado)
    const botones = document.querySelector('.botones')
    informacionCliente.classList.add('disabled')
    tabla.classList.add('disabled')
    pagado.classList.add('disabled')
    botones.classList.add('disabled')
    window.print()
}