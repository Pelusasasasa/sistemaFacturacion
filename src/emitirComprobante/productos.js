const sweet = require('sweetalert2');
const { ipcRenderer } = require("electron");
const Dialogs = require("dialogs");
const dialogs = Dialogs()


const resultado = document.querySelector('#resultado');
const select = document.querySelector('#seleccion');
const buscarProducto = document.querySelector('#buscarProducto');
let productos = '';
let seleccion = 'descripcion';
let subseleccion;
let texto = ""
let seleccionado
const body = document.querySelector('body')

body.addEventListener('keypress',e=>{
    if (e.key === 'Enter' && document.activeElement.tabIndex !== 1 && document.activeElement.tabIndex !== 2 ) {
        seleccionado = document.querySelector('.seleccionado')
        if(seleccionado){
            cantidad(seleccionado)
        }else{
            sweet.fire({title:"Producto no seleccionado"});
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
    }else if(document.activeElement.nodeName === "INPUT" && e.keyCode === 40){
        table.classList.add('tablaFocus') 
        subseleccion = seleccionado.children[0];
        document.activeElement.blur();
        subseleccion.classList.add('subseleccionado')
        
    }
    if (e.key === "Escape") {
        window.close()
    }
})

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

function filtrar(){
    if (buscarProducto.value !== "") {
        resultado.innerHTML = '';
    }
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
     seleccionado = seleccionarTBody.firstElementChild;
     seleccionado.classList.add('seleccionado');
     subseleccion = seleccionado.children[0];
     subseleccion.classList.add('subseleccionado');
});


select.addEventListener('click',(e) =>{
    seleccion = e.target.value;
});

select.addEventListener('keydown',(e) =>{
    if (e.keyCode === 39) {
        e.preventDefault();
        buscarProducto.focus()
    }
});



buscarProducto.addEventListener('keyup',filtrar);

let seleccionarTBody = document.querySelector('tbody')
seleccionarTBody.addEventListener('click',e=>{
    subseleccion && (subseleccion.classList.remove('subseleccionado'));
    subseleccion = e.path[0].nodeName === "TD" ? e.path[0] : e.path[0].children;
    subseleccion.classList.add('subseleccionado');
    seleccionado && (seleccionado.classList.remove('seleccionado'));
    seleccionado = e.path[1];
    seleccionado.classList.add('seleccionado')
})

seleccionarTBody.addEventListener('dblclick',(e) =>{
    seleccionado = document.querySelector('.seleccionado');
    seleccionado ? cantidad(seleccionado) : sweet.fire({title:"Producto no seleccionado"});
})

filtrar();

buscarProducto.addEventListener('keyup',e=>{
    if (e.keyCode === 37) {
        if (buscarProducto.value === "") {
            select.focus();   
        };
    }
})

async function cantidad(e) {
    await dialogs.prompt("cantidad",async(valor) =>{
        const pro = productos.find(e=>e._id === seleccionado.id)
        if (valor === undefined || valor === "" || parseFloat(valor) === 0) {
            await seleccionado.classList.remove('seleccionado')
            seleccionado = "";
            buscarProducto.focus()
        }else{
            if(!Number.isInteger(parseFloat(valor)) && pro.unidad==="U"){
                sweet.fire({title:"El producto no se puede escribir con decimal"})
            }else{
                parseFloat(e.children[4].innerHTML)<0 && sweet.fire({title:"Stock Negativo"});
                (parseFloat(e.children[2].innerHTML) === 0 && sweet.fire({title:"Precio del producto en 0"}));
               ipcRenderer.send('mando-el-producto',{
                   _id: e.id
                    ,cantidad: valor
                })
                await seleccionado.classList.remove('seleccionado');
                await subseleccion.classList.remove('subseleccionado');
                seleccionado = "";
                subseleccion = "";
                buscarProducto.value = "";
                buscarProducto.focus();
            }
        }
    })
};

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
};
