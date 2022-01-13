const Dialogs = require("dialogs");
const dialogs = Dialogs()

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}


const { ipcRenderer } = require("electron");
const vendedor = getParameterByName('vendedor')
const nombre = document.querySelector("#nombre");
const numero = document.querySelector("#telefono");
const codigo = document.querySelector("#codigo");
const cantidad = document.querySelector('#cantidad');
const descripcion = document.querySelector('#descripcion')
const Pedido = {}


//asignamos a cliente un nombre
let cliente = nombre.value
nombre.addEventListener('change',e =>{
    cliente = nombre.value
    Pedido.cliente = cliente
})

//al precionar enter le damos el foco a numero
nombre.addEventListener('keypress',e=>{
    if(e.key === 'Enter'){
        numero.focus()
    }
})

//al precionar enter le damos el foco a codigo
numero.addEventListener('keypress',e=>{
    if(e.key === 'Enter'){
        codigo.focus()
    }
})

//asignamos a telefono un numero
let telefono = numero.value
numero.addEventListener('change',e =>{
    telefono = numero.value
    Pedido.telefono = telefono
})

codigo.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (codigo.value === "") {
            ipcRenderer.send('abrir-ventana',"productos")
        }else if(codigo.value === "9999"){
            cantidad.classList.remove('none')
            descripcion.classList.remove('none')
        }else{
            ipcRenderer.send('get-producto',codigo.value)
            ipcRenderer.once('get-producto',(e,args)=>{
                if (JSON.parse(args) !== "") {
                    dialogs.prompt('Cantidad',async valor=>{
                        await mostrarVentas(JSON.parse(args),valor)
                        codigo.value="";
                        codigo.focus()
                    })
                }else{
                    alert("El producto no existe")
                }
            })
        }

    }
})

cantidad.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        const producto = {
            _id: "9999",
            descripcion:descripcion.value,
        }
        mostrarVentas(producto,cantidad.value)
    }
    
})

ipcRenderer.on('mando-el-producto',(e,args) => {
    const {producto,cantidad} = JSON.parse(args);
    mostrarVentas(producto,cantidad)
})

function mostrarVentas(objeto,cantidad) {
    resultado.innerHTML += `
        <tr>
        <td>${objeto._id}</td>
        <td>${cantidad}</td>
        <td>${objeto.descripcion}</td>
        <td>${cliente}</td>
        <td>${telefono}</td>
        </tr>
    `

    Pedido.codigo = objeto._id
    Pedido.cantidad = cantidad
    Pedido.stock = objeto.stock
    Pedido.producto = objeto.descripcion



}
const body = document.querySelector('form')
const grabar = document.querySelector(".grabar");
grabar.addEventListener('click', e =>{
    //Mandar Pedido a La Base de Datos
    Pedido.vendedor = vendedor
    ipcRenderer.send('Pedido',Pedido)
    window.location.href = '../index.html'
})


document.addEventListener('keydown',e=>{
    if(e.key === "Escape"){
        window.history.go(-1)
    }
})