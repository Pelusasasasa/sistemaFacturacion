const { ipcRenderer } = require("electron/renderer")

const nombre = document.querySelector('#nombre')
const codigo = document.querySelector('#codigo')

const enviar = document.querySelector('#enviar')

enviar.addEventListener('click', e =>{
    const Usuario = {
        _id: codigo.value,
        nombre: nombre.value
    }
    ipcRenderer.send('agregarUsuario',Usuario)
    location.reload()
})

ipcRenderer.send('traerUsuarios')
ipcRenderer.on('traerUsuarios',(e,args)=>{
    const listarUsuarios = document.querySelector('.listarUsuarios')

for(let usuario of JSON.parse(args)){
    listarUsuarios.innerHTML += `
        <li class="listaUsuario">
            <div class="Usuario">
                <h3 class="nombreUsuario">${usuario.nombre}: <span class="idUsuario">${usuario._id}</span></h3>
            <div/>
        </li>
    `
}

})
