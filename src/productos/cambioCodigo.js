const { ipcRenderer } = require("electron")
const Dialogs = require("dialogs");
const dialogs = Dialogs()
const codigo = document.querySelector('#codigo')
const nuevoCodigo = document.querySelector('#nuevoCodigo')
const aceptar = document.querySelector('.aceptar')
const cancelar = document.querySelector('.cancelar')
const diescripcion = document.querySelector('#descripcion')

codigo.addEventListener('keydown',e=>{
    if(e.key === "Enter" || e.key === "Tab"){  
        ipcRenderer.send('get-producto',e.target.value)
    }

})

ipcRenderer.on('get-producto',(e,args)=>{
        if(document.activeElement.name === "codigo"){
            const producto = JSON.parse(args)
            const {descripcion} = producto
        if (descripcion) {
            diescripcion.value = descripcion
            nuevoCodigo.focus()
        }else{
            alert("Producto no existe")
            codigo.focus()
        }
        }
})

nuevoCodigo.addEventListener('keydown',e=>{
    if (e.key === "Enter") {
            ipcRenderer.send('get-producto',e.target.value)
            ipcRenderer.on('get-producto',(e,args)=>{
                const productoYaExistente = JSON.parse(args)
                if (productoYaExistente.length!==0 ) {
                    console.log(productoYaExistente)
                    alert("codigo ya utilizado")
                }else{
                    aceptar.focus()
                }
            })
    }
})


aceptar.addEventListener('click',e=>{
    ipcRenderer.send('cambio-codigo',[codigo.value,nuevoCodigo.value])
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