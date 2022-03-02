const { ipcRenderer } = require("electron/renderer")
let permiso;
ipcRenderer.on('acceso',(e,args)=>{
    permiso = JSON.parse(args)
})

const nombre = document.querySelector('#nombre');
const codigo = document.querySelector('#codigo');
const acceso = document.querySelector('#acceso');
const empresa = document.querySelector('#empresa');
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
}
traerUsuarios()

const lista = document.querySelector('.listarUsuarios')
lista.addEventListener('click',e=>{
    const click = e.path[1].id;
    (permiso === "0") ? ponerValoresInputs(click) : alert("No tiene permisos para interactuar");
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


document.addEventListener('keyup',e=>{
    if (e.key === "Escape") {

        window.close()
    }
})