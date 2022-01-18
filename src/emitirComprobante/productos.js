const { ipcRenderer } = require("electron");
const Dialogs = require("dialogs");
const dialogs = Dialogs()


const resultado = document.querySelector('#resultado');
const select = document.querySelector('#seleccion');
const buscarProducto = document.querySelector('#buscarProducto');
let productos = '';
let seleccion = 'descripcion'
let texto = ""
let seleccionado
const body = document.querySelector('body')

body.addEventListener('keypress',e=>{
    if (e.key === 'Enter' && document.activeElement.tabIndex !== 1 && document.activeElement.tabIndex !== 2 ) {
        seleccionado = document.querySelector('.seleccionado')
        if(seleccionado){
            cantidad(seleccionado)
        }else{
            alert("Producto no seleccionado")
            document.querySelector('.ok').focus()
        } ; 
    }})

//Lo que hacemos es cuando se hace click en la tabla se le agrega una clase que dice que el foco lo tiene la tabla o no
const table = document.querySelector('.m-0')
window.addEventListener('click',e=>{
    if (table.contains(e.target)) {
        table.classList.add('tablaFocus')
    }else{
        table.classList.remove('tablaFocus')
    }
})

//cada vez que apretamos una tecla vemos si la tabla tiene el foco y si las teclas son arriba o abajo recorremos la tabla
//si la tecla es escape se cierra la pagina
body.addEventListener('keydown',e=>{
    if (table.classList.contains('tablaFocus')) {
        recorrerConFlechas(e)
    }
    if (e.key === "Escape") {
        window.close()
    }
})

//funcion para recorrer la tabla
function recorrerConFlechas(e) {
    if (e.key === "ArrowDown") {
        const tr = document.querySelector('.seleccionado')
        if (tr.nextElementSibling) {
            tr.nextElementSibling.classList.add('seleccionado')
            tr.classList.remove('seleccionado')
        }
    }else if(e.key === "ArrowUp"){
        const tr = document.querySelector('.seleccionado')
        if (tr.previousElementSibling) {
            tr.previousElementSibling.classList.add('seleccionado')
            tr.classList.remove('seleccionado')
        }
    }
}

function filtrar(){
    resultado.innerHTML = '';
    //obtenemos lo que se escribe en el input
    texto = buscarProducto.value.toLowerCase();
    ipcRenderer.send('get-productos',[texto,seleccion]);
}

ipcRenderer.on('get-productos', (e,args) =>{
    productos = JSON.parse(args);
    for(let producto of productos){
            resultado.innerHTML += `
                <tr id="${producto._id}">
                    <th scope="row">${producto._id}</th>
                    <td class ="descripcion" >${producto.descripcion}</td>
                    <td>${(parseFloat(producto.precio_venta)).toFixed(2)}</td>
                    <td>${producto.marca}</td>
                    <td>${parseFloat(producto.stock).toFixed(2)}</td>
                    <td>${producto.cod_fabrica}</td>
                </tr>
            `
    }
    // inputseleccionado(seleccionarTBody.firstElementChild)

})

select.addEventListener('click',(e) =>{
    seleccion = e.target.value;
})

buscarProducto.addEventListener('keyup',filtrar);

let seleccionarTBody = document.querySelector('tbody')
seleccionarTBody.addEventListener('click',e=>{
    let identificador = e.path[1]
    inputseleccionado(identificador)
})

const inputseleccionado = (e) =>{
    const yaSeleccionado = document.querySelector('.seleccionado')
    yaSeleccionado && yaSeleccionado.classList.remove('seleccionado')
    e.classList.toggle('seleccionado')
}

seleccionarTBody.addEventListener('dblclick',(e) =>{
    seleccionado = document.querySelector('.seleccionado')
    seleccionado ? cantidad(seleccionado) : alert("Producto no seleccionado");
})

filtrar();


async function cantidad(e) {
    await dialogs.prompt("cantidad",async(valor) =>{
        const pro = productos.find(e=>e._id === seleccionado.id)
        if (valor === undefined) {
            await seleccionado.classList.remove('seleccionado')
            seleccionado = ""
            buscarProducto.focus()
        }else{
            if(!Number.isInteger(parseFloat(valor)) && pro.unidad==="U"){
                alert("El producto no se puede escribir con decimal")
            }else{
               ipcRenderer.send('mando-el-producto',{
                   _id: e.id
                    ,cantidad: valor
                })
            }
        }
    })
}