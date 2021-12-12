const {ipcRenderer,remote} = require('electron');
const Dialogs = require("dialogs");
const dialogs = Dialogs()


const buscarCliente = document.querySelector('#buscarCliente')
const resultado = document.querySelector('#resultado')


ipcRenderer.on('get-clientes',(e,args) =>{
    const clientes = JSON.parse(args);
    console.log(clientes)
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
        if(nombre.indexOf(texto) !== -1){

           resultado.innerHTML += `
           <tr id="${cliente._id}">
                <th id="nombre">${cliente.cliente}</th>
                <td >${cliente.localidad}</td>
                <td>${cliente.direccion}</td>
                <td>${cliente.telefono}</td>
                <td>${cliente.cond_iva}</td>
                <td>${cliente.cuit}</td>
                <td>${cliente.saldo}</td>
            </tr>
           ` 
        }

    }

})


//compramaos si en el input de buscar el texto que escribimos es igual al nombre de algun cliente
const filtrar = ()=>{
    resultado.innerHTML='';
    texto = buscarCliente.value.toLowerCase();
    ipcRenderer.send('get-clientes',texto);
}
filtrar()

let seleccionarTBody = document.querySelector('tbody');
seleccionarTBody.addEventListener('dblclick',  (e) =>{
        ipcRenderer.send('mando-el-cliente',e.path[1].id);
})

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
        ipcRenderer.send('abrir-ventana-modificar-cliente',identificador)
    }else{
        dialogs.alert('Cliente no seleccionado')
        document.querySelector('.ok').focus()
    }
})

ipcRenderer.on('pasandocliente',(e,args) =>{
    console.log(args)
})

const inputseleccionado = (e) =>{
    const yaSeleccionado = document.querySelector('.seleccionado')
    yaSeleccionado && yaSeleccionado.classList.remove('seleccionado')
   e.classList.toggle('seleccionado')
}

document.addEventListener('keydown',e=>{
    if(e.key === "Escape"){
        window.history.go(-1)
    }
})