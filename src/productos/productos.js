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
buscarProducto.focus()


//Lo que hacemos es cuando se hace click en la tabla se le agrega una clase que dice que el foco lo tiene la tabla o no
const table = document.querySelector('.m-0')
window.addEventListener('click',e=>{
    if (table.contains(e.target)) {
        table.classList.add('tablaFocus')
    }else{
        table.classList.remove('tablaFocus')
    }
})

body.addEventListener('keypress',e=>{
    if (e.key === 'Enter' && document.activeElement.tabIndex !== 1) {
        seleccionado = document.querySelector('.seleccionado')
        cantidad(seleccionado)
    }
})

//cada vez que apretamos una tecla vemos si la tabla tiene el foco y si las teclas son arriba o abajo recorremos la tabla
//si la tecla es escape se cierra la pagina
body.addEventListener('keydown',e=>{
    if (table.classList.contains('tablaFocus')) {
        recorrerConFlechas(e)
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
    const productos = JSON.parse(args);
    for(let producto of productos){
            resultado.innerHTML += `
                <tr id="${producto._id}">
                    <th scope="row">${producto._id}</th>
                    <td>${producto.descripcion}</td>
                    <td>${producto.precio_venta}</td>
                    <td>${producto.marca}</td>
                    <td>${producto.stock}</td>
                    <td>${producto.cod_fabrica}</td>
                </tr>
            `
    }
})

select.addEventListener('click',(e) =>{
    seleccion = e.target.value;
}) 

//Hacemos que se seleccione un producto
let seleccionarTBody = document.querySelector('tbody')
seleccionarTBody.addEventListener('click',(e) =>{
    seleccionado = e.path[1]
    const sacarSeleccion = document.querySelector('.seleccionado')
    sacarSeleccion && sacarSeleccion.classList.remove('seleccionado')
    seleccionado.classList.toggle('seleccionado')
    //mostrar imagen
    seleccionado && mostrarImagen(seleccionado.id)
})

const inputseleccionado = (e) =>{
    const yaSeleccionado = document.querySelector('.seleccionado')
    yaSeleccionado && yaSeleccionado.classList.remove('seleccionado')
   e.classList.toggle('seleccionado')
}

const imagen = document.querySelector('.imagen')
function mostrarImagen(id) {
    imagen.innerHTML = `
    <img class="imagenProducto" src=../Fotos/${id}.jpg>`
}


//modificar el producto
const modificar = document.querySelector('.modificar')
modificar.addEventListener('click',e=>{
    if(seleccionado){
        ipcRenderer.send('abrir-ventana-modificar-producto',seleccionado.id)
    }else{
        dialogs.alert('Producto no seleccionado')
            console.log(document.activeElement)
            document.querySelector('.ok').focus()
    }
})
//Agregar producto
const agregarProducto = document.querySelector('.agregarProducto')
agregarProducto.addEventListener('click',e=>{
    ipcRenderer.send('abrir-ventana-agregar-producto')
})

//Info Movimiento de producto
const movimiento = document.querySelector('.movimiento')
movimiento.addEventListener('click',()=>{
    if (seleccionado) {
        ipcRenderer.send('abrir-ventana-info-movimiento-producto',seleccionado.id)
    }else{
        dialogs.alert('Producto no seleccionado')
        document.querySelector('.ok').focus()
    }
})

//Ingresar movimientoProducto
const ingresarMov = document.querySelector('.ingresar')
ingresarMov.addEventListener('click', e => {
   if (seleccionado) {
       dialogs.promptPassword("Contraseña",async valor=>{
        await ipcRenderer.invoke('traerUsuario',valor).then((args)=>{
            const vendedor = JSON.parse(args).nombre
            ipcRenderer.send('abrir-ventana-movimiento-producto',[seleccionado.id,vendedor])
        })
       })
    
   }else{
    dialogs.alert('Producto no seleccionado')
    document.querySelector('.ok').focus()
   }
})

//Eliminar un producto
const eliminar = document.querySelector('.eliminar')
eliminar.addEventListener('click',e=>{
    if (seleccionado) {
        ipcRenderer.send('eliminar-producto',seleccionado.id)
        location.reload()
    }else{
        dialogs.alert('Producto no seleccionado')
        document.querySelector('.ok').focus()
    }

})
 buscarProducto.addEventListener('keyup',filtrar);

filtrar();


document.addEventListener('keydown',e=>{
    if(e.key === "Escape"){
        window.history.go(-1)
    }
})