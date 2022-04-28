const {ipcRenderer} = require('electron');
const Dialogs = require("dialogs");
const dialogs = Dialogs();
const axios = require('axios');
require('dotenv').config
const URL = process.env.URL;

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

const acceso = getParameterByName("acceso")
const buscarCliente = document.querySelector('#buscarCliente')
const resultado = document.querySelector('#resultado')
const eliminar = document.querySelector('.eliminar')
acceso !== "0" && eliminar.classList.add('none') 
let clientes

const ponerClientes = (clientes) =>{
    clientes.sort((a,b)=>{
        if(a.cliente<b.cliente){
            return -1
        }
        if (a.cliente>b.cliente) {
            return 1
        }
        return 0
    })
    for(let cliente of clientes){
        let nombre = cliente.cliente.toLowerCase();
        texto = texto[0] === "*" ? texto.substr(1) : texto;
        if(nombre.indexOf(texto) !== -1){
           resultado.innerHTML += `
           <tr id="${cliente._id}">
                <td >${cliente._id}</td>
                <th id="nombre">${cliente.cliente}</th>
                <td >${cliente.localidad}</td>
                <td>${cliente.direccion}</td>
                <td>${cliente.telefono}</td>
                <td>${cliente.cond_iva}</td>
                <td>${cliente.cuit}</td>
                <td>${(parseFloat(cliente.saldo)).toFixed(2)}</td>
            </tr>
           ` 
        }

    }

}


//compramaos si en el input de buscar el texto que escribimos es igual al nombre de algun cliente
const filtrar = async ()=>{
    resultado.innerHTML='';
    texto = buscarCliente.value.toLowerCase();
    texto = texto === "" ? "a consumidor final" : texto;
    let clientes = await axios.get(`${URL}clientes/${texto}`);
    clientes = clientes.data;
    ponerClientes(clientes)
}
filtrar()

buscarCliente.addEventListener('keyup',filtrar)

const cliente = document.querySelector("tbody")
let identificador
cliente.addEventListener('click',e =>{
   identificador = e.path[1].id
   inputseleccionado(e.path[1]);
})

const agregar = document.querySelector('.agregar')
agregar.addEventListener('click',e=>{
    ipcRenderer.send('abrir-ventana-agregar-cliente')
})


const modificar = document.querySelector('.modificar')
modificar.addEventListener('click',() =>{
    if (identificador) {
        ipcRenderer.send('abrir-ventana-modificar-cliente',[identificador,acceso])
    }else{
        dialogs.alert('Cliente no seleccionado')
        document.querySelector('.ok').focus()
    }
})

ipcRenderer.on('pasandocliente',(e,args) =>{
    console.log(args)
})

const inputseleccionado = (e) =>{
    yaSeleccionado = document.querySelector('.seleccionado')
    yaSeleccionado && yaSeleccionado.classList.remove('seleccionado')
   e.classList.toggle('seleccionado')
}


eliminar.addEventListener('click',async e=>{
    e.preventDefault()
    const clienteEliminar = document.querySelector('.seleccionado')
    if (clienteEliminar ) {
        const cliente = clienteEliminar.children[1].innerHTML;
        if(confirm("Eliminar Cliente " + cliente)){
            await axios.delete(`${URL}clientes/${clienteEliminar.id}`);
            location.reload()
        }
    }else{
        alert("Cliente no Seleccionado")
    }
})

document.addEventListener('keydown',e=>{
    if(e.key === "Escape"){
        window.history.go(-1)
    }
})