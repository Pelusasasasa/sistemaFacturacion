
const tbody = document.querySelector('.tbody')
const body = document.querySelector('body')
const salir = document.querySelector('.salirBoton')
const cambiar = document.querySelector('.cambiarBoton')
const impirmir = document.querySelector('.imprimirBoton')
const Dialogs = require("dialogs");
const { dialog } = require("electron/main");
const dialogs = Dialogs();
const axios = require("axios");
require("dotenv").config;
const URL = process.env.URL;
let seleccionado


body.addEventListener('keydown',e=>{
    if (e.key === "Escape") {
        window.close()
    }
})

const promesaStockNegativo = async()=>{
    let productos = await axios(`${URL}productos/stockNegativo`)
    productos = productos.data
    productos.sort((a,b)=>{
        if (a.descripcion > b.descripcion) {
            return 1
        }else if(a.descripcion < b.descripcion){
            return -1
        }

        return 0
    })
    listarProductos(productos)
}
promesaStockNegativo()



function listarProductos(lista) {
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
    dialogs.prompt("Nuevo Stock",async valor=>{
        let producto = await axios.get(`${URL}productos/${seleccionado.id}`)
        producto = producto.data;
        producto.stock = valor;
        await axios.put(`${URL}productos/${seleccionado.id}`,producto)
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
