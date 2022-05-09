const { ipcRenderer } = require("electron")
const Dialogs = require("dialogs");
const dialogs = Dialogs()

const axios = require("axios");
require("dotenv").config;
const URL = process.env.URL;


const cliente = document.querySelector('#buscador')
const saldo = document.querySelector('#saldo')
const listar = document.querySelector('.listar')
const compensada = document.querySelector('.compensada')
const historica = document.querySelector('.historica')
const actualizar = document.querySelector('.actualizar')

let listaCompensada=[];
let listaHistorica=[];
let lista=[]
let clienteTraido = {}
let listaGlobal=[]
vendedor = ""
let seleccionado = "";
let situacion = "blanco";
let tipo = "compensada"

historica.addEventListener('click',e=>{
    historica.classList.add("disable")
    compensada.classList.remove('disable')
    tipo = "historica"
    listarLista(listaHistorica,situacion,tipo)
})

compensada.addEventListener('click',e=>{
    compensada.classList.add("disable")
    historica.classList.remove('disable')
    tipo = "compensada"
    listarLista(listaCompensada,situacion,tipo)
})

document.addEventListener('keydown',(event) =>{
    if (event.key === "Alt") {
       document.addEventListener('keydown',(e) =>{
           if (e.key === "F9" && situacion === "blanco") {
               mostrarNegro();
               situacion = 'negro';
               tipo === "compensada" ? listarLista(listaCompensada,situacion,tipo) : listarLista(listaHistorica,situacion,tipo);
           }
       })
   }
})

document.addEventListener('keydown',(event) =>{
   if (event.key === "Alt") {
      document.addEventListener('keydown',(e) =>{
          if (e.key === "F8" && situacion === "negro") {
              ocultarNegro();
              situacion = 'blanco';
              tipo === "compensada" ? listarLista(listaCompensada,situacion,tipo) : listarLista(listaHistorica,situacion,tipo);
          }
      })
  }
})

const ocultarNegro = ()=>{
    const saldo = document.querySelector('#saldo')
    const saldo_p = document.querySelector('#saldo_p')
    const botonFacturar = document.querySelector('#botonFacturar')
    const body = document.querySelector('.consultaCtaCte');
    const seccion_botones = document.querySelector('.seccion_botones');
    const buscador = document.querySelector('.buscador')
    buscador.classList.remove("mostrarNegro")
    seccion_botones.classList.remove("mostrarNegro")
    saldo.classList.remove('none')
    saldo_p.classList.add('none')
    botonFacturar.classList.add('none')
    body.classList.remove('mostrarNegro')
    actualizar.classList.add('none')
}

const mostrarNegro = ()=>{
    const saldo = document.querySelector('#saldo')
    const saldo_p = document.querySelector('#saldo_p')
    const botonFacturar = document.querySelector('#botonFacturar')
    const body = document.querySelector('.consultaCtaCte');
    const seccion_botones = document.querySelector('.seccion_botones');
    const buscador = document.querySelector('.buscador')
    buscador.classList.add("mostrarNegro")
    seccion_botones.classList.add("mostrarNegro")
    saldo.classList.add('none')
    botonFacturar.classList.remove('none')
    saldo_p.classList.remove('none')
    body.classList.add('mostrarNegro')
    actualizar.classList.remove('none')
}

cliente.addEventListener('keypress', async e =>{
    if (e.key === "Enter") {
        if (cliente.value !== "") {
            let clienteTraido = await axios.get(`${URL}clientes/id/${cliente.value.toUpperCase( )}`)
            clienteTraido = clienteTraido.data;
                if (clienteTraido !== "") {
                    ponerDatosCliente(clienteTraido);
                }else{
                     alert("El cliente no existe")
                     cliente.value = "";
                     cliente.focus();
                }
            }else{
            ipcRenderer.send('abrir-ventana',"clientes")
         }
        }
    })

ipcRenderer.on('mando-el-cliente',async(e,args)=>{
    ponerDatosCliente(JSON.parse(args))
})


listar.addEventListener('click',e=>{
    seleccionado = e.path[0].nodeName === "TD" ?  e.path[1] : e.path[2];
    const sacarSeleccion = document.querySelector('.seleccionado')
    sacarSeleccion && sacarSeleccion.classList.remove('seleccionado')
    seleccionado.classList.toggle('seleccionado')
    if (seleccionado) {
        listaHistorica.forEach(listar=>{
            listar.nro_comp === seleccionado.id && mostrarDetalles(listar.nro_comp,listar.tipo_comp,listar.vendedor);
        })
    }
});

listar.addEventListener('keyup', async e=>{
    const observacion = document.activeElement.value;
    const comp = (await axios.get(`${URL}cuentaComp/id/${seleccionado.id}`)).data[0];
    comp.observaciones = observacion.toUpperCase()
    await axios.put(`${URL}cuentaComp/id/${seleccionado.id}`,comp)
})

const listarLista = (lista,situacion,tipo)=>{
    let aux
    (situacion === "negro") ? (aux = "Presupuesto") : (aux = "Ticket Factura");
    listaGlobal = lista.filter(e=>{
        if (aux === "Presupuesto") {
            return  (e.tipo_comp === aux ||  e.tipo_comp === "Recibos_P")   
        }else{
            return (e.tipo_comp === aux) || e.tipo_comp === "Recibos" ||  e.tipo_comp === "Nota Credito"
        }
    })
    listar.innerHTML = '';
    listaGlobal.forEach(venta => {
        vendedor = venta.vendedor
        let importe = venta.importe;
        let saldo = venta.saldo;
        let pagado = venta.pagado;
        if (venta.length !== 0) {
            let fecha = new Date(venta.fecha)
            if (tipo === "compensada") {
                listar.innerHTML += `
                <tr id="${venta.nro_comp}">
                <td>${fecha.getUTCDate()}/${fecha.getUTCMonth()+1}/${fecha.getUTCFullYear()}</td>
                    <td>${venta.tipo_comp}</td>
                    <td>${venta.nro_comp}</td>
                    <td class = "importe">${parseFloat(importe).toFixed(2)}</td>
                    <td class = "pagado">${parseFloat(pagado).toFixed(2)}</td>
                    <td class = "saldo">${(parseFloat(saldo).toFixed(2))}</td>
                    <td><input class="${venta.nro_comp}" type="text" value="${venta.observaciones}" /></td>
                </tr>
            `
            }else{
                listar.innerHTML += `
                <tr id="${venta.nro_comp}">
                <td>${fecha.getUTCDate()}/${fecha.getUTCMonth()+1}/${fecha.getUTCFullYear()}</td>
                    <td>${venta.tipo_comp}</td>
                    <td>${venta.nro_comp}</td>
                    <td class = "importe">${(venta.debe).toFixed(2)}</td>
                    <td class = "pagado">${(venta.haber).toFixed(2)}</td>
                    <td class = "saldo">${(venta.saldo).toFixed(2)}</td>
                    <td>${venta.observaciones}</td>
                </tr>
            `
            }
        }
    });
}

const detalle = document.querySelector('.detalle')
async function mostrarDetalles(id,tipo,vendedor) {
    detalle.innerHTML = '';
    if (tipo === "Recibos_P" || tipo === "Recibos") {
        const vendedor = (await axios.get(`${URL}ventas/venta/ventaUnica/${seleccionado.id}/${tipo}`)).data.vendedor;
        detalle.innerHTML += `
            <tr><h1>El recibo fue emitido por: ${vendedor}</h1></tr>
        `
    }else{
    let productos = (await axios.get(`${URL}movProductos/${id}/${tipo}`)).data;
    let movimientos1 = productos.filter(movimiento => movimiento.codCliente === clienteTraido._id);
    let movimientos2 = productos.filter(movimiento => movimiento.codigo === clienteTraido._id);
    productos = [...movimientos1,...movimientos2]
    productos.forEach((producto) =>{
        let {codProd,descripcion,vendedor,egreso,precio_unitario} = producto;
        detalle.innerHTML += `
        <tr>
            <td>${codProd}</td>
            <td>${descripcion}</td>
            <td>${egreso.toFixed(2)}</td>
            <td>${precio_unitario.toFixed(2)}</td>
            <td>${(egreso*precio_unitario).toFixed(2)}</td>
            <td>${vendedor}</td>
        </tr>
        `
        })
    }
}

let ventaAModificar
let total = 0
let saldoABorrar = 0


    actualizar.addEventListener('click',async e=>{
        if (seleccionado) {
                venta = (await axios.get(`${URL}presupuesto/${seleccionado.id}`)).data[0];
                let cuentaCompensada = (await axios.get(`${URL}cuentaComp/id/${seleccionado.id}`)).data[0];
                let cuentaHistorica = (await axios.get(`${URL}cuentaHisto/id/${seleccionado.id}`)).data[0];
                let cliente = (await axios.get(`${URL}clientes/id/${cuentaCompensada.codigo}`)).data;
                let movimientos = (await axios.get(`${URL}movProductos/${seleccionado.id}/Presupuesto`)).data;
                //traemos los productos para ver su precio y actualizarlos
                let productos = [];
                let total = 0;
                for await(let movimiento of movimientos ){
                    const producto = (await axios.get(`${URL}productos/${movimiento.codProd}`)).data;
                    total += parseFloat(movimiento.egreso)*parseFloat(producto.precio_venta);
                    productos.push({cantidad:movimiento.egreso,objeto:producto});
                };
                venta.productos = productos;

                const index = listaHistorica.map(e=>e.nro_comp).indexOf(seleccionado.id);
                let arregloRestante = listaHistorica.slice(index+1);
                arregloRestante = arregloRestante.filter(e=>{
                    return (e.tipo_comp === "Presupuesto" || e.tipo_comp === "Recibos_P");
                });
                let saldo = parseFloat(cliente.saldo_p) - parseFloat(cuentaCompensada.importe);

                //actualizamos el importe de la cuentaCompensada
                cuentaCompensada.importe = parseFloat(parseFloat(total).toFixed(2));

                //actualizamos el saldo de la cuentaCompensada
                cuentaCompensada.saldo = parseFloat((parseFloat(total) - cuentaCompensada.pagado).toFixed(2));



                cuentaHistorica.saldo -= cuentaHistorica.debe;
                cuentaHistorica.debe = cuentaCompensada.importe;
                //Guardamos la venta con el nuevo precioFinal
                venta.precioFinal = parseFloat(total.toFixed(2));
                ipcRenderer.send('imprimir-venta',[venta,cliente,false,1,"imprimir-comprobante","valorizado"]);
                if (confirm("Grabar Importe")) {

                    for await (let movProducto of movimientos) {
                        let producto =(await axios.get(`${URL}productos/${movProducto.codProd}`)).data;
                        movProducto.precio_unitario = parseFloat(producto.precio_venta);
                        movProducto.total = parseFloat((movProducto.egreso*movProducto.precio_unitario).toFixed(2));
                        await axios.put(`${URL}movProductos/${movProducto._id}`,movProducto);
                    };

                    venta && await axios.put(`${URL}presupuesto/${venta.nro_comp}`,venta);
                    saldo += parseFloat(cuentaCompensada.importe);
                    cuentaHistorica.saldo = parseFloat((parseFloat(cuentaHistorica.saldo) + parseFloat(cuentaHistorica.debe)).toFixed(2))
                    let ultimoSaldo = cuentaHistorica.saldo;
                    for await (let e of arregloRestante){
                        e.saldo= (e.tipo_comp === "Recibos_P") ?  parseFloat((ultimoSaldo - e.haber).toFixed(2)) : parseFloat((e.debe + ultimoSaldo).toFixed(2));
                        ultimoSaldo = e.saldo;
                        await axios.put(`${URL}cuentaHisto/id/${e.nro_comp}`,e)
                    };
                    cliente.saldo_p = saldo.toFixed(2);
                    await axios.put(`${URL}cuentaHisto/id/${cuentaHistorica.nro_comp}`,cuentaHistorica);
                    await axios.put(`${URL}cuentaComp/id/${cuentaCompensada.nro_comp}`,cuentaCompensada);
                    await axios.put(`${URL}clientes/${cliente._id}`,cliente);
                    const cuentaCompensadaModificada  = (await axios.get(`${URL}cuentaComp/id/${seleccionado.id}`)).data[0];
                    seleccionado.children[3].innerHTML = cuentaCompensadaModificada.importe;
                    seleccionado.children[4].innerHTML = cuentaCompensadaModificada.pagado;
                    seleccionado.children[5].innerHTML = cuentaCompensadaModificada.saldo;
                    saldo.value = cliente.saldo;
                    saldo_p.value = cliente.saldo_p
                }
                
        }else{
            alert("Venta no seleccionada")
        }
    })


const botonFacturar = document.querySelector('#botonFacturar')
botonFacturar.addEventListener('click',() =>{
    if (seleccionado) {
        dialogs.promptPassword("Contraseña").then(async value=>{
            let vendedor = (await axios.get(`${URL}usuarios/${value}`)).data;
            if (vendedor !== "") {
                ipcRenderer.send('abrir-ventana-emitir-comprobante',[vendedor.nombre,seleccionado.id,vendedor.empresa])   
            }
        })
    }else{
        alert('Venta no seleccionada')
    }
})


document.addEventListener('keydown',e=>{
    if(e.key === "Escape"){
        window.history.go(-1)
    }
})

const ponerDatosCliente = async (Cliente)=>{
    clienteTraido = Cliente
    cliente.value = Cliente.cliente
    saldo.value = (parseFloat(Cliente.saldo)).toFixed(2)
    saldo_p.value = (parseFloat(Cliente.saldo_p)).toFixed(2)
    listaVentas=Cliente.listaVentas
    let compensadas = (await axios.get(`${URL}cuentaComp/cliente/${Cliente._id}`)).data;
    let historicas = (await axios.get(`${URL}cuentaHisto/cliente/${Cliente._id}`)).data;
    listaCompensada=compensadas;
    listaHistorica = historicas;
    listarLista(compensadas,situacion,tipo)
}