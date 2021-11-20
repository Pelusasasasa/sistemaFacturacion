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


const codigo = document.querySelector('#codigo')
const nombre = document.querySelector('#nombre')
const saldo = document.querySelector('#saldo')
const direccion = document.querySelector('#direccion')
const localidad = document.querySelector('#localidad');
const fecha = document.querySelector('#fecha')
fecha.value = fechaDeHoy
const cond_iva = document.querySelector('#cond_iva')
const cuit = document.querySelector('#cuit')
const tbody = document.querySelector('.listar')
const imprimir = document.querySelector('.imprimir')
const cancelar = document.querySelector('.cancelar')
const vendedor = document.querySelector('.vendedor')
const total = document.querySelector('#total')
let inputSeleccionado  = tbody
let trSeleccionado
total.value = 0.00
let cliente = {}
let listaVentas = []
let nuevaLista=[]
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
    saldo.value = cliente.saldo_p;
    direccion.value = cliente.direccion;
    localidad.value = cliente.localidad;
    cond_iva.value = cliente.cond_iva;
    cuit.value = cliente.cuit;
    fecha.value = mostrarFecha;

    await ipcRenderer.invoke('traerVentas',cliente.listaVentas).then((args)=>{
        listaVentas = JSON.parse(args)
    })
    //Sacamos las ventas que ya estan pagadas

    listaVentas.forEach(venta => {
        venta.pagado === false && nuevaLista.push(venta)
    });

    nuevaLista.forEach(venta =>{
        let saldo = parseFloat(venta.precioFinal) - parseFloat(venta.abonado)
        let fecha = new Date(venta.fecha)
        let dia = fecha.getDate()
        let mes = fecha.getMonth()+1
        let anio = fecha.getFullYear()
        tbody.innerHTML += `
            <tr id="${venta._id}">
                <td>${dia}/${mes}/${anio}</td>
                <td>${venta.tipo_comp}</td>
                <td>${venta.nro_comp}</td>
                <td>${(venta.precioFinal).toFixed(2)}</td>
                <td>${parseFloat((venta.abonado)).toFixed(2)}</td>
                <td><input type"text" id=${venta.nro_comp} name="pagadoActual"></td>
                <td class="saldop">${saldo.toFixed(2)}</td>
                <td>${venta.observaciones}</td>
            </tr>
        `

    })
    trSeleccionado = tbody.firstElementChild
    inputSeleccionado = trSeleccionado.children[5].children[0]
})
let valorAnterior = ""
    tbody.addEventListener('click',e=>{
        trSeleccionado = e.path[2]
        inputSeleccionado = e.path[0]
    })
inputSeleccionado.addEventListener('keydown',(e)=>{
    if (e.key==="Tab") {
            trSeleccionado.children[6].innerHTML = (parseFloat(trSeleccionado.children[3].innerHTML)-parseFloat(trSeleccionado.children[4].innerHTML) - parseFloat(inputSeleccionado.value)).toFixed(2)

            let venta
            nuevaLista.forEach(e =>{
                if(e._id === trSeleccionado.id){
                    venta = e
                }
            })
            venta.abonado = parseFloat(venta.abonado) + parseFloat(inputSeleccionado.value);
            (venta.abonado === venta.precioFinal) && (venta.pagado = true);
            if(valorAnterior !== ""){
                total.value = (parseFloat(inputSeleccionado.value) + parseFloat(total.value) - parseFloat(valorAnterior)).toFixed(2)
            }else{
                total.value = (parseFloat(inputSeleccionado.value) + parseFloat(total.value)).toFixed(2)
            }


            if(trSeleccionado.nextElementSibling){
                trSeleccionado = trSeleccionado.nextElementSibling
            inputSeleccionado = trSeleccionado.children[5].children[0] 
            }    
            valorAnterior = inputSeleccionado.value
        }

})

imprimir.addEventListener('click',async e=>{
    const nrmComp = await traerUltimoNroRecibo()
    const recibo = {}
    recibo._id = nrmComp
    recibo.nro_comp = nrmComp
    recibo.pagado = true
    recibo.cliente = cliente._id
    recibo.vendedor = Vendedor
    recibo.precioFinal = parseFloat(total.value)
    recibo.tipo_comp = "Recibos"
    console.log(recibo)

    const saldoNuevo = parseFloat((parseFloat(cliente.saldo_p) - parseFloat(total.value)).toFixed(2))
    ipcRenderer.send('modificarSaldo',[cliente._id,"saldo_p",saldoNuevo])
    ipcRenderer.send('modificamosLasVentas',nuevaLista)
    ipcRenderer.send('nueva-venta',recibo)
    location.reload()
})

const traerUltimoNroRecibo =async ()=>{
    let retornar
    await ipcRenderer.invoke('traerUltimoNumero',"Ultimo Recibo").then((args)=>{
        retornar = JSON.parse(args)["Ultimo Recibo"]
    })
    return retornar
}


document.addEventListener('keydown',e=>{
    if(e.key === "Escape"){
        window.history.go(-1)
    }
})