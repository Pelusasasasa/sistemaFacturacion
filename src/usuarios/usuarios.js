const { ipcRenderer } = require("electron/renderer")

const nombre = document.querySelector('#nombre')
const codigo = document.querySelector('#codigo')
const acceso = document.querySelector('#acceso')

const enviar = document.querySelector('#enviar')

enviar.addEventListener('click', e =>{
    const Usuario = {
        _id: codigo.value,
        nombre: nombre.value,
        acceso: acceso.value
    }
    ipcRenderer.send('agregarUsuario',Usuario)
    location.reload()
})

let listaVendedores
ipcRenderer.send('traerUsuarios')
ipcRenderer.on('traerUsuarios',(e,args)=>{
    const listarUsuarios = document.querySelector('.listarUsuarios')
    listaVendedores = JSON.parse(args)

for(let usuario of JSON.parse(args)){
    listarUsuarios.innerHTML += `
        <li class="listaUsuario">
            <div class="vendedor" id="${usuario._id}">
                <h3 class="nombreUsuario">${usuario.nombre}</h3>
            </div>
        </li>
    `
}
})


const lista = document.querySelector('.listarUsuarios')
lista.addEventListener('click',e=>{
    const click = e.path[1].id
    ponerValoresInputs(click)
})

const ponerValoresInputs = (id)=>{
    listaVendedores.find(usuario => {
        if (usuario._id === id) {
            nombre.value = usuario.nombre
            codigo.value = usuario._id
            acceso.value = usuario.acceso
        }
    })
}

const guardar = document.querySelector('#guardar');
guardar.addEventListener('click',e=>{
    const nuevoUsuario = {
        nombre:nombre.value,
        _id:codigo.value,
        acceso:acceso.value
    }
    
    ipcRenderer.invoke('modificarUsuario',nuevoUsuario)
    .then(async (args)=>{
        const alerta = JSON.parse(args)
        await alert(alerta)
        location.reload();
    });
})
