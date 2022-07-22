const {ipcRenderer} = require('electron');
const sweet = require('sweetalert2');
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
let clientes;
let seleccionado;
let subseleccionado;

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
                <td class="codigo">${cliente._id}</td>
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

const cliente = document.querySelector("tbody");
cliente.addEventListener('click',e =>{
    seleccionado && (seleccionado.classList.remove('seleccionado'));
    subseleccionado && (subseleccionado.classList.remove('subseleccionado'));
    subseleccionado = e.path[0];
    seleccionado = e.path[1];
    seleccionado.classList.add('seleccionado');
    subseleccionado.classList.add('subseleccionado');
})

const agregar = document.querySelector('.agregar')
agregar.addEventListener('click',e=>{
    ipcRenderer.send('abrir-ventana-agregar-cliente')
})


const modificar = document.querySelector('.modificar')
modificar.addEventListener('click',async () =>{
    if (seleccionado) {
        ipcRenderer.send('abrir-ventana-modificar-cliente',[seleccionado.id,acceso])
    }else{
        await sweet.fire({
            title:"Cliente no Seleccionado",
            returnFocus:false
        });
        buscarCliente.focus()
    }
})

ipcRenderer.on('pasandocliente',(e,args) =>{
    console.log(args)
})

eliminar.addEventListener('click',async e=>{
    const clienteEliminar = document.querySelector('.seleccionado')
    if (clienteEliminar ) {
        const cliente = clienteEliminar.children[1].innerHTML;
        await sweet.fire({
            title:"Eliminar Cliente " + cliente,
            showCancelButton:true,
            confirmButtonText:"Aceptar"
        }).then(async ({isConfirmed})=>{
            if (isConfirmed) {
                await axios.delete(`${URL}clientes/${clienteEliminar.id}`);
                location.reload()    
            }
        })
    }else{
        await sweet.fire({
            title:"Cliente no Seleccionado",
            returnFocus:false
        });
        buscarCliente.focus()
    }
})

document.addEventListener('keydown',e=>{
    if(e.key === "Escape"){
        window.history.go(-1)
    }
})


//hacemos para que si el foco lo tiene el tbody recorremos con flechas
const body = document.querySelector('body');
body.addEventListener('keydown',e=>{
    if (seleccionado ) {
        if (e.keyCode === 40 && seleccionado.nextElementSibling) {
            let aux;
            for (let i = 0; i < seleccionado.children.length; i++) {
                aux = seleccionado.children[i].className.includes('subseleccionado') ? i : aux;
            }
            seleccionado.classList.remove('seleccionado');
            seleccionado = seleccionado.nextElementSibling;
            seleccionado.classList.add('seleccionado');
            subseleccionado && subseleccionado.classList.remove('subseleccionado');
            subseleccionado = seleccionado.children[aux];
            subseleccionado.classList.add('subseleccionado');
        }else if(e.keyCode === 38 && seleccionado.previousElementSibling){
            let aux;
            for (let i = 0; i < seleccionado.children.length; i++) {
                aux = seleccionado.children[i].className.includes('subseleccionado') ? i : aux;
            }
            seleccionado.classList.remove('seleccionado');
            seleccionado = seleccionado.previousElementSibling;
            seleccionado.classList.add('seleccionado');
            subseleccionado && subseleccionado.classList.remove('subseleccionado');
            subseleccionado = seleccionado.children[aux];
            subseleccionado.classList.add('subseleccionado');
        }else if(e.keyCode === 37 && subseleccionado.previousElementSibling){
            subseleccionado && subseleccionado.classList.remove('subseleccionado');
            subseleccionado = subseleccionado.previousElementSibling;
            subseleccionado.classList.add('subseleccionado');
        }else if(e.keyCode === 39 && subseleccionado.nextElementSibling){
            subseleccionado && subseleccionado.classList.remove('subseleccionado');
            subseleccionado = subseleccionado.nextElementSibling;
            subseleccionado.classList.add('subseleccionado');
        }else if(e.keyCode === 17){
            document.addEventListener('keydown',e=>{
                if (e.keyCode === 67) {
                    if (subseleccionado) {
                        let aux = document.createElement("textarea");
                        aux.innerHTML = subseleccionado.innerHTML
                        document.body.appendChild(aux);
                        aux.select();
                        document.execCommand("copy");
                        document.body.removeChild(aux);
                    }
                }
            })
        }
    }
});


const th = document.querySelector('table');
let precionado = false;
th.addEventListener('mousedown',e=>{
    precionado = true;
    if (precionado) {
        e.target.classList.add('resizing');
    }
});
th.addEventListener('mouseup',e=>{
    if (precionado) {
        precionado = false;
        e.target.classList.remove('resizing');
    }
});
