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


codigo.addEventListener('keypress', (e)=>{
    if (e.key === 'Enter') {
        if (codigo.value !== "") {
            ipcRenderer.invoke('get-cliente',(codigo.value).toUpperCase()).then((args)=>{
            cliente = JSON.parse(args);
            (cliente === "") ? alert("Cliente no encontrado") : inputsCliente(cliente);
            })
        }else{
            ipcRenderer.send('abrir-ventana',"clientes")
        }
    }
})

ipcRenderer.on('mando-el-cliente',async(e,args)=>{
    inputsCliente(JSON.parse(args))
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
            nuevaLista.forEach(e =>{
                if(e.nro_comp === trSeleccionado.id){    
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
            }

            console.log(trSeleccionado.children[5].children[0]);
            if ((trSeleccionado.children[6].innerHTML < 0)) {
                alert("El monto abonado es mayor al de la venta")
                trSeleccionado.children[6].innerHTML = aux;
                trSeleccionado.children[5].children[0].value = "";
                trSeleccionado.children[5].children[0].focus();
             }else{
                
                console.log(aDescontar);
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
                if(trSeleccionado.nextElementSibling){
                    trSeleccionado = trSeleccionado.nextElementSibling
                    inputSeleccionado = trSeleccionado.children[5].children[0] 
                    trSeleccionado.children[5].children[0].focus()
                }else{
                    saldoAfavor.focus()
                }
        }

        }
})
let saldoAFavorAnterior = "0"
saldoAfavor.addEventListener('keydown',e=>{
    
    if (e.key === "Enter" && saldoAfavor.value !== "") {
        (total.value = (parseFloat(total.value) + parseFloat(saldoAfavor.value) - parseFloat(saldoAFavorAnterior)).toFixed(2));
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
    const nrmComp = await traerUltimoNroRecibo()
    modifcarNroRecibo(nrmComp)
    const recibo = {}
    recibo.nro_comp = nrmComp
    recibo._id = await tamanioVentas()
    recibo.pagado = true
    recibo.cliente = cliente._id
    recibo.vendedor = Vendedor
    recibo.precioFinal = parseFloat(total.value).toFixed(2);
    recibo.tipo_comp = "Recibos";
    const aux = (situacion === "negro") ? "saldo_p" : "saldo"
    let saldoFavor = 0;
    saldoFavor = (saldoAfavor.value !== "") && parseFloat(saldoAFavor.value);
    recibo.abonado = saldoAfavor.value
    const saldoNuevo = parseFloat((parseFloat(cliente[aux]) - parseFloat(total.value)).toFixed(2));
    console.log(saldoNuevo)
    ipcRenderer.send('modificarSaldo',[cliente._id,aux,saldoNuevo])
    ipcRenderer.send('modificamosLasVentas',nuevaLista)
    console.log(recibo)
    ipcRenderer.send('nueva-venta',recibo)
    ipcRenderer.send('imprimir-venta',[cliente,recibo,false,1,"Recibo",arregloParaImprimir,total.value])
    location.reload()
}

const traerUltimoNroRecibo = async ()=>{
    let retornar
    await ipcRenderer.invoke('traerUltimoNumero',"Ultimo Recibo").then((args)=>{
        retornar = JSON.parse(args)
    })
    return retornar
}

const modifcarNroRecibo = async(numero)=>{
    let [n1,n2] = numero.split('-')
    n2 = parseFloat(n2 ) + 1
    n2 = n2.toString().padStart(8,0)
    let nrmComp = n1 + "-" + n2
    await ipcRenderer.send('modificar-numeros',[nrmComp,'Ultimo Recibo'])
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
}

const tamanioVentas = async()=>{
    let retornar
    await ipcRenderer.invoke('tamanioVentas').then(async(args)=>{
        retornar = await JSON.parse(args)
    })
    return retornar
}