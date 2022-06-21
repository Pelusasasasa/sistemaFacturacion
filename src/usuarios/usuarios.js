const { ipcRenderer } = require("electron");
const sweet = require('sweetalert2');
let permiso;
let idSeleccionado;
ipcRenderer.on('acceso',(e,args)=>{
    permiso = JSON.parse(args)
})

const nombre = document.querySelector('#nombre');
const codigo = document.querySelector('#codigo');
const acceso = document.querySelector('#acceso');
const empresa = document.querySelector('#empresa');
const eliminar = document.querySelector('.eliminar');
const enviar = document.querySelector('#enviar');
const axios = require("axios");
require("dotenv").config;
const URL = process.env.URL;

enviar.addEventListener('click', async e =>{
    const Usuario = {
        _id: codigo.value,
        nombre: nombre.value,
        acceso: acceso.value,
        empresa:empresa.value
    }
    await axios.post(`${URL}usuarios`,Usuario);
    location.reload();
})

let usuarios;
const listarUsuarios = document.querySelector('.listarUsuarios')
const traerUsuarios = async()=>{
    usuarios = await axios.get(`${URL}usuarios`)
    usuarios = usuarios.data;
    for(let usuario of usuarios){
        listarUsuarios.innerHTML += `
            <li class="listaUsuario">
                <div class="vendedor" id="${usuario._id}">
                    <h3 class="nombreUsuario">${usuario.nombre}</h3>
                </div>
            </li>
        `
    }
    listarUsuarios.innerHTML += `
        <li class="agregar">
            <div class="vendedor ">
                <h3 class="nombreUsuario">+Agregar</h3>
            </div>
        </li>
    `
}

traerUsuarios()

const lista = document.querySelector('.listarUsuarios')
lista.addEventListener('click',e=>{
    if (e.target.nodeName === "H3" && e.target.parentNode.parentNode.className === "agregar") {
        enviar.classList.remove('none');
        guardar.classList.add('none');
        eliminar.classList.add('none');
        nombre.value = "";
        codigo.value = "";
        acceso.value = "";
        empresa.value = "";
        codigo.removeAttribute("disabled");
        nombre.focus();
    }else{
        idSeleccionado = e.path[1].id
        const click = e.path[1].id;
        (permiso === "0") ? ponerValoresInputs(click) : sweet.fire({title:"No tiene permisos para interactuar"});
        (permiso === "0") && guardar.classList.remove('none');
        (permiso === "0") && eliminar.classList.remove('none');
        (permiso === "0") && enviar.classList.add('none');
        codigo.setAttribute('disabled','');
    }
})

const ponerValoresInputs = (id)=>{
    usuarios.find(usuario => {
        if (usuario._id === id) {
            nombre.value = usuario.nombre
            codigo.value = usuario._id
            acceso.value = usuario.acceso
            empresa.value = usuario.empresa
        }
    })
}

const guardar = document.querySelector('#guardar');
guardar.addEventListener('click',async e=>{
    const nuevoUsuario = {
        nombre:nombre.value,
        _id:codigo.value,
        acceso:acceso.value,
        empresa:empresa.value
    };
    await axios.put(`${URL}usuarios/${nuevoUsuario._id}`,nuevoUsuario);
    location.reload();
})

eliminar.addEventListener('click',async e=>{
    await axios.delete(`${URL}usuarios/${idSeleccionado}`);
    window.close();
})


document.addEventListener('keyup',e=>{
    if (e.key === "Escape") {

        window.close()
    }
})