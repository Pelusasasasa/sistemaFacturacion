const privada = document.querySelector('.privada')
const publica = document.querySelector('.publica')
let tipoConexion
const fs = require('fs')

privada.addEventListener('click',async()=>{
    tipoConexion = `a=2;module.exports = a`;
    fs.writeFile('src/config.js',tipoConexion,()=>{
        console.log("hola")
    })
})

publica.addEventListener('click',async()=>{
    tipoConexion = `a=1;module.exports = a`;
    fs.writeFile('src/config.js',tipoConexion,()=>{
        console.log("hola")
    })
})