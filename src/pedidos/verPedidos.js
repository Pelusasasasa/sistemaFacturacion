const axios = require("axios");
require("dotenv").config;
const URL = process.env.URL;

const tbody = document.querySelector("tbody");

let arreglo;
let id;
let seleccionado;
let inputSeleccionado;
//Mandamos a llamar a pedidos
const traerPedidos = async()=>{
    let pedidos = await axios.get(`${URL}pedidos`)
    pedidos = pedidos.data;
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
            <td>${pedido.observacion}</td>
        </tr>
        `
    }
    arreglo = await pedidos
}
traerPedidos()


tbody.addEventListener("click" , e=>{
    seleccionado &&  seleccionado.classList.remove('seleccionado');
    seleccionado = e.target.nodeName === "TD" ? e.path[1] : e.path[1].parentNode;
    seleccionado.classList.add('seleccionado');

    const identificador = seleccionado.id;
    let pedidoIdentificado = {}

    for(let pedido of arreglo){
        (pedido._id === identificador) && (pedidoIdentificado=pedido)
    }

    inputSeleccionado && inputSeleccionado.toggleAttribute('disabled');
    inputSeleccionado = seleccionado.children[8].children[0];
    inputSeleccionado.toggleAttribute('disabled');
    console.log(e.target.nodeName);
    if (e.target.nodeName === "INPUT") {
        //pasamos el foco al input al tocar en la fila
        inputSeleccionado.focus()

        //hacemos que se seleccione todo el input
        inputSeleccionado.select();    
    }
    

    //se ejecuta cuando escribimos en el input
    inputSeleccionado.addEventListener('keyup',async e=>{
        pedidoIdentificado.estadoPedido = e.target.value;
        await axios.put(`${URL}pedidos/${pedidoIdentificado._id}`,pedidoIdentificado);
    })
});


//Eliminar un pedido
const eliminarPedido = document.querySelector('.eliminarPedido');
eliminarPedido.addEventListener("click", async e =>{
        if (id) {
            if (confirm("Seguro quiere Eliminar el Pedido")) {
                await axios.delete(`${URL}pedidos/${id.id}`);
                location.reload();
            }
        }else{
            alert('Pedido no seleccionado');
        }


})

    document.addEventListener('keydown',e=>{
        if(e.key === "Escape"){
            location.href = "../index.html";
        }
    })