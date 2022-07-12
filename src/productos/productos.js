const { ipcRenderer } = require("electron");
const axios = require("axios");
const sweet = require('sweetalert2');

require('dotenv').config();
const URL = process.env.URL;

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

const acceso = getParameterByName('acceso')

const resultado = document.querySelector('#resultado');
const select = document.querySelector('#seleccion');
const buscarProducto = document.querySelector('#buscarProducto');
const modificar = document.querySelector('.modificar');
const movimiento = document.querySelector('.movimiento');
const ingresarMov = document.querySelector('.ingresar')
const agregarProducto = document.querySelector('.agregarProducto');
const eliminar = document.querySelector('.eliminar');
const volver = document.querySelector('.volver');

let texto = ""
let seleccionado;
let subseleccion;
const body = document.querySelector('body')
buscarProducto.focus()

ipcRenderer.on('productoModificado',(e,args)=>{
    const producto = JSON.parse(args);
    const tr = document.getElementById(`${producto._id}`)
    const aux = tr.children;
    aux[1].innerHTML = producto.descripcion;
    aux[2].innerHTML = producto.precio_venta;
    aux[3].innerHTML = producto.marca;
    aux[4].innerHTML = producto.stock;
    aux[5].innerHTML = producto.cod_fabrica;
    aux[6].innerHTML = producto.observacion;
})


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
    if (document.activeElement.nodeName === "BODY") {
        const tr = document.querySelector('.seleccionado')
        recorrerConFlechas(e)
    }
});

//funcion para recorrer la tabla
function recorrerConFlechas(e) {
     if(e.key === "Control"){
        document.addEventListener('keydown',e=>{
            if (e.keyCode === 67) {
              if (subseleccion) {
                  let aux = document.createElement("textarea");
                  aux.innerHTML = subseleccion.innerHTML
                  document.body.appendChild(aux);
                  aux.select();
                  document.execCommand("copy");
                  document.body.removeChild(aux);
              }
            }
        });
    }
    funcionSubSeleccion(e.keyCode);

}

async function filtrar(){
    //obtenemos lo que se escribe en el input
    texto = buscarProducto.value.toLowerCase();
    let productos;
    if(texto !== ""){ 
        let condicion = select.value;
        condicion === "codigo" && (condicion = "_id")
        console.log(texto)
        console.log(condicion)
        productos = await axios.get(`${URL}productos/buscarProducto/${texto}/${condicion}`)
    }else{
        productos = await axios.get(`${URL}productos/buscarProducto/textoVacio/descripcion`)
    }
    productos = productos.data
    ponerProductos(productos);
}

const ponerProductos = productos =>{
    resultado.innerHTML = '';
    for(let producto of productos){
            resultado.innerHTML += `
                <tr id="${producto._id}">
                    <th scope="row">${producto._id}</th>
                    <td class="descripcion">${producto.descripcion}</td>
                    <td class= "precio">${(parseFloat(producto.precio_venta)).toFixed(2)}</td>
                    <td>${producto.marca}</td>
                    <td class="stock">${(parseFloat(producto.stock)).toFixed(2)}</td>
                    <td>${producto.cod_fabrica}</td>
                    <td>${producto.observacion}</td>
                </tr>
            `
    }
}

buscarProducto.addEventListener('keydown',e=>{
    if (e.key === "ArrowLeft" && buscarProducto.value === "") {
        select.focus();
    }
})

//Hacemos que se seleccione un producto
let seleccionarTBody = document.querySelector('tbody')
seleccionarTBody.addEventListener('click',(e) =>{
    seleccionado = e.path[1];
    subseleccion && subseleccion.classList.remove('subseleccionado');
    subseleccion = e.path[0].nodeName === "TD" ? e.path[0] : e.path[1];
    subseleccion.classList.add('subseleccionado');
    const sacarSeleccion = document.querySelector('.seleccionado')
    sacarSeleccion && sacarSeleccion.classList.remove('seleccionado')
    seleccionado.classList.toggle('seleccionado')
    //mostrar imagen
    seleccionado && mostrarImagen(seleccionado.id)
})


const imagen = document.querySelector('.imagen')
async function mostrarImagen(id) {
        const producto = (await axios.get(`${URL}productos/${id}`)).data;
        if (producto.imgURL) {
            const path = `${URL}productos/${id}/image`
            console.log(path)
            imagen.innerHTML = `
            <img class="imagenProducto" src=${path}>`
        };
}

ipcRenderer.once('Historial',async(e,args)=>{
    const [textoA,seleccionA] = JSON.parse(args)
    buscarProducto.value = await textoA;
    select.value = await seleccionA;
    filtrar()
})


//modificar el producto

modificar.addEventListener('click',async e=>{
    if(seleccionado){
        ipcRenderer.send('abrir-ventana-modificar-producto',[seleccionado.id,acceso,texto,select.value]);
    }else{
        await sweet.fire({
            title:'Producto no seleccionado',
            returnFocus:false
        });
        buscarProducto.focus();
    }
});

//Agregar producto
agregarProducto.addEventListener('click',e=>{
    ipcRenderer.send('abrir-ventana-agregar-producto');
})


//Info Movimiento de producto
movimiento.addEventListener('click',async ()=>{
    if (seleccionado) {
        ipcRenderer.send('abrir-ventana-info-movimiento-producto',seleccionado.id)
    }else{
        await sweet.fire({
            title:'Producto no seleccionado',
            returnFocus:false
        });
        buscarProducto.focus();
    }
})

//Ingresar movimientoProducto
ingresarMov.addEventListener('click',async e => {
   if (seleccionado) {
        let vendedor = getParameterByName('vendedor');
        vendedor ?  ipcRenderer.send('abrir-ventana-movimiento-producto',[seleccionado.id,vendedor]) : sweet.fire({title:"Contraseña Incorrecta"});
   }else{
        await sweet.fire({
            title:'Producto no seleccionado',
            returnFocus:false
        });
        buscarProducto.focus();
       }
})

//Eliminar un producto

eliminar.addEventListener('click',async e=>{
    if (seleccionado) {
        await sweet.fire({
            title: "Eliminar Producto",
            showCancelButton:true,
            confirmButtonText:"Aceptar"
        }).then(async ({isConfirmed})=>{
            if (isConfirmed) {
                await axios.delete(`${URL}productos/${seleccionado.id}`)
                location.reload()        
            }
        })
    }else{
        await sweet.fire({
            title:'Producto no seleccionado',
            returnFocus:false
        });
        buscarProducto.focus();
    }

})
 buscarProducto.addEventListener('keyup',filtrar);
filtrar();
buscarProducto.addEventListener('keypress',e=>{
    if (buscarProducto.value.length === 3 && e.key !== "-" && select.value === "codigo") {
        buscarProducto.value = buscarProducto.value + "-"
    }
})


document.addEventListener('keydown',e=>{
    if(e.key === "Escape"){
        window.history.go(-1)
    }
})

if (acceso === "2" || acceso === "1") {
    eliminar.classList.add('none')
}

//cunado se cambie la conidcion el codigo toma el foco
select.addEventListener('keydown',e=>{
    if(e.key === "ArrowUp" || e.key === "ArrowDown"){
        buscarProducto.focus()
    }else{
        e.preventDefault();
    }
});

const funcionSubSeleccion = (codigoKey)=>{
    if(codigoKey=== 39){
        subseleccion.classList.remove('subseleccionado');
        subseleccion = subseleccion.nextElementSibling;
        subseleccion.classList.add('subseleccionado');
      }else if(codigoKey=== 37){
        if(subseleccion.previousElementSibling){
            subseleccion.classList.remove('subseleccionado');
            subseleccion = subseleccion.previousElementSibling
            subseleccion.classList.add('subseleccionado');
        }
      }else if(codigoKey=== 38){
        if (seleccionado.previousElementSibling) {
            let aux;
            for(let i = 0;i<seleccionado.children.length;i++){
                if (seleccionado.children[i].className.includes("subseleccionado")) {
                    aux = i;
                }
            }
            seleccionado.classList.remove('seleccionado');
            subseleccion.classList.remove('subseleccionado');
            seleccionado = seleccionado.previousElementSibling;
            subseleccion = seleccionado.children[aux]
            subseleccion.classList.add('subseleccionado')
            seleccionado.classList.add('seleccionado')
        }
      }else if(codigoKey=== 40){
        if (seleccionado.nextElementSibling) {
            let aux;
            for(let i = 0;i<seleccionado.children.length;i++){
                if (seleccionado.children[i].className.includes("subseleccionado")) {
                    aux = i;
                }
            }
            seleccionado.classList.remove('seleccionado');
            subseleccion.classList.remove('subseleccionado');
            seleccionado = seleccionado.nextElementSibling;
            subseleccion = seleccionado.children[aux];
            subseleccion.classList.add('subseleccionado');
            seleccionado.classList.add('seleccionado');
        }
      }
}


volver.addEventListener('click',e=>{
    location.href = "../index.html";
});

document.addEventListener('keydown',e=>{
    if (e.key === "Escape") {
        location.href = "../index.html";
    }
})