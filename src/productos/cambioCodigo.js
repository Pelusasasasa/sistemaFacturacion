const { ipcRenderer } = require("electron")
const Dialogs = require("dialogs");
const dialogs = Dialogs()
const codigo = document.querySelector('#codigo')
const nuevoCodigo = document.querySelector('#nuevoCodigo')
const aceptar = document.querySelector('.aceptar')
const cancelar = document.querySelector('.cancelar')
const diescripcion = document.querySelector('#descripcion')

codigo.addEventListener('keypress',e=>{
    if(e.key === "Enter"){
        ipcRenderer.send('get-producto',e.target.value)
        nuevoCodigo.focus()
    }

})
const promesaTraerProducto = new Promise((resolve,reject)=>{
    ipcRenderer.on('get-producto',(e,args)=>{
        const producto = JSON.parse(args)[0]
        resolve(producto)
    })
    
})
promesaTraerProducto.then(({descripcion})=>{
    diescripcion.value = descripcion
})

nuevoCodigo.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        ipcRenderer.send('get-producto',e.target.value)

    const promesaProductoExistente = new Promise((resolve,reject)=>{
        ipcRenderer.on('get-producto',(e,args)=>{
            const productoYaExistente = JSON.parse(args)
            if (productoYaExistente.length!==0 ) {
                resolve()
            }
        })
    })

    promesaProductoExistente.then(()=>{
        dialogs.alert("codigo ya utilizado",ok=>{
            location.reload()
        })

    })
        aceptar.focus()
    }
})


aceptar.addEventListener('keypress',e=>{
    if (e.key==="Enter") {
        ipcRenderer.send('cambio-codigo',[codigo.value,nuevoCodigo.value])
        location.reload()
    }
})

cancelar.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        window.close()
    }
})

cancelar.addEventListener('click',e=>{
        window.close()
})
