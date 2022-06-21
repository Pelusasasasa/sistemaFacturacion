const { ipcRenderer } = require("electron")
const sweet = require('sweetalert2');
const codigo = document.querySelector('#codigo')
const nuevoCodigo = document.querySelector('#nuevoCodigo')
const aceptar = document.querySelector('.aceptar')
const cancelar = document.querySelector('.cancelar')
const diescripcion = document.querySelector('#descripcion')

const axios = require("axios");
require("dotenv").config;
const URL = process.env.URL;

codigo.addEventListener('keydown',async e=>{
    if(e.key === "Enter" || e.key === "Tab"){  
        let producto = await axios.get(`${URL}productos/${codigo.value}`)
        producto = producto.data
        if (producto.descripcion) {
            descripcion.value = producto.descripcion;
            nuevoCodigo.focus();
        }else{
            await sweet.fire({title:"Producto no existe"});
            codigo.value = "";
        }
    }else if((codigo.value.length === 3 || codigo.value.length === 7) && e.key !== "-" && e.key !== "Backspace"){
        codigo.value = codigo.value + "-"
    }

})


nuevoCodigo.addEventListener('keydown',async e=>{
    if (e.key === "Enter") {
            let productoYaExistente = await axios.get(`${URL}productos/${e.target.value}`);
            productoYaExistente = productoYaExistente.data;
                if (productoYaExistente.length!==0 ) {
                    await sweet.fire({title:"codigo ya utilizado"});
                    nuevoCodigo.value = "";
                }else{
                    aceptar.focus()
                }
    }
})


aceptar.addEventListener('click',async e=>{
    const productos = await axios.get(`${URL}productos/${codigo.value}`)
    const nuevoProducto=productos.data;
    nuevoProducto._id=nuevoCodigo.value;
    await axios.post(`${URL}productos`,nuevoProducto)   
    await axios.delete(`${URL}productos/${codigo.value}`)
    location.reload()
})


cancelar.addEventListener('keyup',e=>{
    if (e.key === "Enter") {
        window.close()
    }
})

cancelar.addEventListener('click',e=>{
        window.close()
})

document.addEventListener('keydown',e=>{
    if (e.key === "Escape") {
        window.close()
    }
})