const privada = document.querySelector('.privada')
const publica = document.querySelector('.publica')
const flechaPrivada = document.querySelector('#privada').firstElementChild
console.log(flechaPrivada)
const flechaPublica = document.querySelector('#publica').firstElementChild
console.log(flechaPublica)
let tipoConexion = require('./config');
console.log(tipoConexion);

(tipoConexion === 2) ? flechaPublica.classList.add('flechaBlanca') : flechaPrivada.classList.add('flechaBlanca')

const { ipcRenderer } = require('electron')
const fs = require('fs')

privada.addEventListener('click',async()=>{
    tipoConexion = `a=2;module.exports = a`;
    fs.writeFile('src/config.js',tipoConexion,()=>{
        console.log("hola")
        ipcRenderer.send('recargar-Ventana')
    })
})

publica.addEventListener('click',async()=>{
    tipoConexion = `a=1;module.exports = a`;
    fs.writeFile('src/config.js',tipoConexion,()=>{
        console.log("hola")
        ipcRenderer.send('recargar-Ventana')
    })
})