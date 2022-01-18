const { ipcRenderer } = require("electron");
const select = document.querySelector('#marca')
const porcentaje = document.querySelector('#porcentaje')
const modificar = document.querySelector('.modificar')

let marcas;
    ipcRenderer.on('mandarMarcas',(e,args)=>{
        marcas = JSON.parse(args);
        marcas.sort();
        marcas.forEach(marca => {
            const option = document.createElement('option')
            option.text = marca;
            option.value = marca
            select.appendChild(option)
        });
    })

modificar.addEventListener('click',e=>{
    ipcRenderer.send('modficarPrecioPorcentaje',[select.value,porcentaje.value])
})

ipcRenderer.on('avisoModificacion',e=>{
    alert(`Se Modifico el precio de los productos ${select.value}`)
})