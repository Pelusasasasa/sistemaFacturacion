const sweet = require('sweetalert2');

const tbody = document.querySelector('.tbody')
const body = document.querySelector('body')
const salir = document.querySelector('.salirBoton')
const cambiar = document.querySelector('.cambiarBoton')
const impirmir = document.querySelector('.imprimirBoton')
const Dialogs = require("dialogs");
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

cambiar.addEventListener('click',async e=>{
    await sweet.fire({
        title:"Nuevo Stock",
        showCancelButton:false,
        input:"text",
        confirmButtonText:"Aceptar",
    }).then(async ({isConfirmed,value})=>{
        if (isConfirmed && value !== "") {
            let producto = await axios.get(`${URL}productos/${seleccionado.id}`)
            producto = producto.data;
            producto.stock = value;
            crearMovimiento(producto,producto.stock);
            await axios.put(`${URL}productos/${seleccionado.id}`,producto);
            location.reload()    
        }
    })
});

//creamos el movimiento de producto
const crearMovimiento = async(producto,stock)=>{
    const movimiento = {};
    movimiento.codProd = producto._id;
    movimiento.descripcion = producto.descripcion;
    movimiento.ingreso = stock;
    movimiento.stock = stock;
    movimiento.precio_unitario = producto.precio_venta;
    await axios.post(`${URL}movProductos`,[movimiento]);
}


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
