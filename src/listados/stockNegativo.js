const { ipcRenderer } = require("electron");
const tbody = document.querySelector('.tbody')
const body = document.querySelector('body')
const salir = document.querySelector('.salirBoton')
const cambiar = document.querySelector('.cambiarBoton')
const impirmir = document.querySelector('.imprimirBoton')
const Dialogs = require("dialogs");
const { dialog } = require("electron/main");
const dialogs = Dialogs()
let seleccionado


ipcRenderer.send('stockNegativo')

body.addEventListener('keydown',e=>{
    if (e.key === "Escape") {
        window.close()
    }
})

const promesaStockNegativo = new Promise((resolve,reject)=>{
    ipcRenderer.on('stockNegativo',(e,args)=>{
        resolve(JSON.parse(args))
    })
})

promesaStockNegativo.then((productos)=>{
    listarProductos(productos)
})


function listarProductos(lista) {
    console.log(lista)
    lista.forEach(producto => {
        tbody.innerHTML += `
            <tr id="${producto._id}">
                <td>${producto._id}</td>
                <td>${producto.descripcion}</td>
                <td>${producto.marca}</td>
                <td>${producto.stock}</td>
            </tr>
        `
        inputseleccionado(tbody.firstElementChild)

    });
}

const inputseleccionado = (e) =>{
    const yaSeleccionado = document.querySelector('.seleccionado')
    yaSeleccionado && yaSeleccionado.classList.remove('seleccionado')
   e.classList.toggle('seleccionado')
}

tbody.addEventListener('click',e=>{
    seleccionado = e.path[1]
    const sacarseleccion = document.querySelector('.seleccionado');
    sacarseleccion.classList.remove('seleccionado');
    seleccionado.classList.toggle('seleccionado')
})

cambiar.addEventListener('click',e=>{
    dialogs.prompt("Nuevo Stock",valor=>{
        ipcRenderer.send('cambiarStock',[seleccionado.id,valor])
        location.reload()
    })
})


impirmir.addEventListener('click',e=>{
   printPage()
})

salir.addEventListener('click',()=>{
    window.close()
})


function printPage(){
    const botones = document.querySelector('.botones')
    botones.classList.add('disable')
    window.print()
    botones.classList.remove('disable')
}
