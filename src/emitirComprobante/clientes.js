const {ipcRenderer} = require('electron');
const sweet = require('sweetalert2');
const axios = require('axios');
require('dotenv').config;
const URL = process.env.URL;


const buscarCliente = document.querySelector('#buscarCliente');
const resultado = document.querySelector('#resultado');
const body = document.querySelector('body');
const tbody = document.querySelector("tbody");

let clientes = '';
let texto;
let seleccionado;
let subseleccion;

body.addEventListener('keypress',e=>{
    seleccionado = document.querySelector('.seleccionado')
    if (e.key === 'Enter') {
        ipcRenderer.send('mando-el-cliente',seleccionado.id);
        window.close()
     }
})


const listar = async(texto) =>{
    let clientes = (await axios.get(`${URL}clientes/${texto}`)).data;
    clientes = clientes.sort(function(a,b){
        let A = a.cliente.toUpperCase()
        let B = b.cliente.toUpperCase()

        if (A<B) {
            return -1;
        }
        if (A>B) {
            return 1;
        }

        return 0
    })
    
    for(let cliente of clientes){
        let nombre = cliente.cliente.toLowerCase();
        texto = texto[0] === "*" ? texto.substr(1) : texto;
        if(nombre.indexOf(texto) !== -1){
           resultado.innerHTML += `
           <tr id="${cliente._id}">
                <td>${cliente._id}</td>
                <th scope= "row">${cliente.cliente}</th>
                <td id="nombre">${cliente.localidad}</td>
                <td>${cliente.direccion}</td>
                <td>${cliente.telefono}</td>
                <td>${cliente.cond_iva}</td>
                <td>${cliente.cuit}</td>
                <td>${(parseFloat(cliente.saldo)).toFixed(2)}</td>
            </tr>
           ` 
        }

    }

    seleccionado = resultado.firstElementChild;
    seleccionado.classList.add('seleccionado');
    subseleccion = resultado.firstElementChild.children[0];
    subseleccion.classList.add('subseleccionado');

}

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
        }else if (e.keyCode === 40) {
            if (seleccionado.nextElementSibling) {
                let aux
                for(let i = 0;i<seleccionado.children.length;i++){
                    aux = seleccionado.children[i].className.includes('subseleccionado') ? i : aux;
                }

                seleccionado && seleccionado.classList.remove('seleccionado');
                seleccionado = seleccionado.nextElementSibling;
                seleccionado.classList.add('seleccionado');

                subseleccion && subseleccion.classList.remove('subseleccionado');
                subseleccion = seleccionado.children[aux];
                subseleccion.classList.add('subseleccionado');
            }
        }else if(e.keyCode === 38){
            if (seleccionado.previousElementSibling) {
                let aux
                for(let i = 0;i<seleccionado.children.length;i++){
                    aux = seleccionado.children[i].className.includes('subseleccionado') ? i : aux;
                }
                seleccionado && seleccionado.classList.remove('seleccionado');
                seleccionado = seleccionado.previousElementSibling;
                seleccionado.classList.add('seleccionado');

                subseleccion && subseleccion.classList.remove('subseleccionado');
                subseleccion = seleccionado.children[aux];
                subseleccion.classList.add('subseleccionado');
            }
        }else if(e.keyCode === 37){
            if (subseleccion.previousElementSibling) {
                subseleccion && subseleccion.classList.remove('subseleccionado');
                subseleccion = subseleccion.previousElementSibling;
                subseleccion.classList.add('subseleccionado')
            }
        }else if(e.keyCode === 39){
            if (subseleccion.nextElementSibling) {
                subseleccion && subseleccion.classList.remove('subseleccionado');
                subseleccion = subseleccion.nextElementSibling;
                subseleccion.classList.add('subseleccionado')
            }
        }
    }


//recorrer con flechas
const table = document.querySelector('.m-0')
window.addEventListener('click',e=>{

    if (table.contains(e.target)) {
        table.classList.add('bodyFocus')
    }else{
        table.classList.remove('bodyFocus')
    }
})

body.addEventListener('keydown',e=>{
    if (table.classList.contains('bodyFocus')) {
        recorrerConFlechas(e)
    }
})


//compramaos si en el input de buscar el texto que escribimos es igual al nombre de algun cliente
const filtrar = ()=>{
    resultado.innerHTML='';
    texto = buscarCliente.value.toLowerCase();
    listar(texto);
}
filtrar()

let seleccionarTBody = document.querySelector('tbody');
seleccionarTBody.addEventListener('dblclick',  (e) =>{
        ipcRenderer.send('mando-el-cliente',e.path[1].id);
        window.close()
})

buscarCliente.addEventListener('keyup',filtrar)


tbody.addEventListener('click',e =>{
   seleccionado && seleccionado.classList.remove('seleccionado');
   console.log(e.path[0])
   seleccionado = (e.path[0].nodeName === "TD" || e.path[0].nodeName === "TH" )? e.path[1] : e.path[0];
   seleccionado.classList.add('seleccionado');

   subseleccion && subseleccion.classList.remove('subseleccionado');
   subseleccion = e.path[0];
   subseleccion.classList.add('subseleccionado')
});

document.addEventListener('keydown',e=>{
    if (e.key === "Escape") {
        window.close();
    }
});