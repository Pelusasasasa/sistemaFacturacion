const Dialogs = require("dialogs");
const dialogs = Dialogs()
const axios = require("axios");
require("dotenv").config;
const URL = process.env.URL;

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

const { ipcRenderer } = require("electron");
const vendedor = getParameterByName('vendedor')
const nombre = document.querySelector("#nombre");
const numero = document.querySelector("#telefono");
const codigo = document.querySelector("#codigo");
const cantidad = document.querySelector('#cantidad');
const descripcion = document.querySelector('#descripcion')
const tbody = document.querySelector('#tbody');

//al precionar enter le damos el foco a numero
nombre.addEventListener('keypress',e=>{
    if(e.key === 'Enter'){
        numero.focus()
    }
})

//al precionar enter le damos el foco a codigo
numero.addEventListener('keypress',e=>{
    if(e.key === 'Enter'){
        codigo.focus()
    }
})

codigo.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        if (codigo.value === "") {
            ipcRenderer.send('abrir-ventana',"productos")
        }else if(codigo.value === "999-999"){
            cantidad.classList.remove('none')
            descripcion.classList.remove('none')
            descripcion.focus();
        }else{
            let producto = await axios.get(`${URL}productos/${codigo.value}`)
            producto = producto.data;
                if (producto !== "") {
                    dialogs.prompt('Cantidad',async valor=>{
                        await mostrarVentas(producto,valor)
                        codigo.value="";
                        codigo.focus()
                    })
                }else{
                    alert("El producto no existe")
                    codigo.value = ""
                }
        }
    }else if((codigo.value.length === 3 || codigo.value.length === 7) && e.key !== "-" && e.key !== "Backspace"){
        codigo.value = codigo.value + "-"
    }
})

descripcion.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        cantidad.focus();
    }
})

cantidad.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        const producto = {
            _id: "999-999",
            descripcion:descripcion.value,
            stock:"0"
        }
        mostrarVentas(producto,cantidad.value)
        cantidad.classList.add('none')
        cantidad.value = "";
        descripcion.value = "";
        descripcion.classList.add('none');
        codigo.value = "";
        codigo.focus();
    }
    
})

ipcRenderer.on('mando-el-producto',(e,args) => {
    const {producto,cantidad} = JSON.parse(args);
    mostrarVentas(producto,cantidad)
})

function mostrarVentas(objeto,cantidad) {
    tbody.innerHTML += `
        <tr>
        <td>${objeto._id}</td>
        <td>${cantidad}</td>
        <td>${objeto.descripcion}</td>
        <td>${nombre.value}</td>
        <td>${numero.value}</td>
        <td>${objeto.stock}</td>
        </tr>
    `
}

const grabar = document.querySelector(".grabar");
grabar.addEventListener('click', async e =>{
    //Mandar Pedido a La Base de Datos
    const trs = document.querySelectorAll('#tbody tr');
    trs.forEach(async td=>{
        const Pedido = {};
        Pedido.fecha = new Date();
        Pedido.codigo = td.children[0].innerHTML;
        Pedido.cantidad = td.children[1].innerHTML; 
        Pedido.producto = td.children[2].innerHTML; 
        Pedido.cliente = td.children[3].innerHTML;
        Pedido.value = td.children[4].innerHTML;
        Pedido.stock = td.children[5].innerHTML;
        Pedido.vendedor = vendedor; 
        await axios.post(`${URL}pedidos`,Pedido)
    })
    window.location.href = '../index.html'
})


document.addEventListener('keydown',e=>{
    if(e.key === "Escape"){
        window.history.go(-1)
    }
})