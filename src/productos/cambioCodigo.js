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
        console.log(e.key)
        ipcRenderer.send('get-producto',e.target.value)
        nuevoCodigo.focus()
        console.log(nuevoCodigo.focus)
    }

})

ipcRenderer.on('get-producto',(e,args)=>{
        const producto = JSON.parse(args)
        const {descripcion} = producto
    if (descripcion) {
        diescripcion.value = descripcion
    }else{
        alert("Producto no existe")
        console.log(codigo.value)
        codigo.focus()
    }
})

nuevoCodigo.addEventListener('keyup',e=>{
    console.log(e.key)
    if (e.key === "Enter") {
    // ipcRenderer.send('get-producto',e.target.value)

    // const promesaProductoExistente = new Promise((resolve,reject)=>{
    //     ipcRenderer.on('get-producto',(e,args)=>{
    //         const productoYaExistente = JSON.parse(args)
    //         if (productoYaExistente.length!==0 ) {
    //             resolve()
    //         }
    //     })
    // })

    // promesaProductoExistente.then(()=>{
    //     alert("codigo ya utilizado")
    //     location.reload()
    // })
        aceptar.focus()
    }
})


aceptar.addEventListener('click',e=>{
    ipcRenderer.send('cambio-codigo',[codigo.value,nuevoCodigo.value])
    location.reload()
})


// cancelar.addEventListener('keyup',e=>{
//     if (e.key === "Enter") {
//         window.close()
//     }
// })

cancelar.addEventListener('click',e=>{
        window.close()
})

document.addEventListener('keydown',e=>{
    if (e.key === "Escape") {
        window.close()
    }
})