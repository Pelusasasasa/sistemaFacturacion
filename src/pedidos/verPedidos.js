const { ipcRenderer } = require("electron")
const Dialogs = require("dialogs");
const dialogs = Dialogs()

const tbody = document.querySelector("tbody")



let pedidos = []
//Mandamos a llamar a pedidos
ipcRenderer.send('traerpedidos')
//recibimos los pedidos
ipcRenderer.on('traerPedidos',(e,args)=>{
    pedidos = JSON.parse(args)

    for(let [index,pedido] of pedidos.entries()){
        let fecha = new Date(pedido.fecha)
        const stock =(pedido.stock !== undefined) ? pedido.stock : 0; 
        tbody.innerHTML += `
        <tr id="${pedido._id}">
            <td>${fecha.getUTCDate()}/${fecha.getUTCMonth()+1}/${fecha.getUTCFullYear()}</td>
            <td>${pedido.codigo}</td>
            <td>${pedido.producto}</td>
            <td class = "cantidad">${(pedido.cantidad).toFixed(2)}</td>
            <td>${pedido.cliente}</td>
            <td>${pedido.telefono}</td>
            <td>${pedido.vendedor}</td>
            <td class = "stock">${(stock).toFixed(2)}</td>
            <td class="estado"><input disabled name="estadoPedido" id="estadoPedido${index}" value="${pedido.estadoPedido}"></input></td>
        </tr>
        `
    }

})

let id
let seleccionado

tbody.addEventListener("click" , e =>{
     id = e.path[1]
    seleccionado = document.querySelector('.seleccionado')
    seleccionado &&  seleccionado.classList.remove('seleccionado')
    id.classList.toggle('seleccionado')
    const identificador = id.id
    let pedidoIdentificado = {}

    for(let pedido of pedidos){
        (pedido._id === identificador) && (pedidoIdentificado=pedido)
    }
    const tds = id.querySelector('.estado')
    const estado = tds.querySelector('input')
    estado.toggleAttribute('disabled')
    //pasamos el foco al input al tocar en la fila
    estado.focus()

    //hacemos que se seleccione todo el input
    console.log(estado)
    selecciona_value(estado.id)

    //se ejecuta cuando escribimos en el input
    estado.addEventListener('keyup', e =>{
        pedidoIdentificado.estadoPedido = e.target.value
    })

})


//apretamos el boton y mandamos los cambios
const guardar = document.querySelector('.guardar')
guardar.addEventListener('click', e=>{
    ipcRenderer.send('modificar-pedidos',pedidos)
    location.reload()
})

//Eliminar un pedido
const eliminarPedido = document.querySelector('.eliminarPedido')
eliminarPedido.addEventListener("click", e =>{
        if (id) {
            ipcRenderer.send("eliminarPedido",id.id)
            location.reload()
        }else{
            dialogs.alert('Pedido no seleccionado')
        }

})

function selecciona_value(idInput) {

    valor_input = document.getElementById(idInput).value ;
    console.log(valor_input)
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


    document.addEventListener('keydown',e=>{
        if(e.key === "Escape"){
            window.history.go(-1)
        }
    })