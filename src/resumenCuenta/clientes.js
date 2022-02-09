const {ipcRenderer} = require('electron');
const buscarCliente = document.querySelector('#buscarCliente')
const resultado = document.querySelector('#resultado')
let clientes = ''
let texto;  

const body = document.querySelector('body')
body.addEventListener('keypress',e=>{
    const seleccionado = document.querySelector('.seleccionado')
    if (e.key === 'Enter') {
        ipcRenderer.send('mando-el-cliente',seleccionado.id);
        window.close()
     }
})
let situacion = "blanco"


ipcRenderer.on('traerSaldo',async(e,args) =>{
    console.log("b");
    let clientes = JSON.parse(args);
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

   clientes = (situacion === "blanco") ? retornarClientes(clientes,"saldo") : retornarClientes(clientes,"saldo_p")

    for(let cliente of clientes){
        let nombre = cliente.cliente.toLowerCase();
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

    const primerCliente = resultado.firstElementChild.id
    let tr = document.getElementById(primerCliente)
    tr.classList.add('seleccionado')

})

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
ipcRenderer.on('situacion',async(e,args)=>{
    situacion = JSON.parse(args)
    console.log(situacion);
})

//compramaos si en el input de buscar el texto que escribimos es igual al nombre de algun cliente
const filtrar = ()=>{
    console.log("a");
    resultado.innerHTML='';
    texto = buscarCliente.value.toLowerCase();

    ipcRenderer.send('traerSaldo',texto);

}
filtrar()

let seleccionarTBody = document.querySelector('tbody');
seleccionarTBody.addEventListener('dblclick',  (e) =>{
        ipcRenderer.send('mando-el-cliente',e.path[1].id);
        window.close()
})

buscarCliente.addEventListener('keyup',filtrar)

const cliente = document.querySelector("tbody")
let identificador
cliente.addEventListener('click',e =>{
   identificador = e.path[1].className
   inputseleccionado(e.path[1]);
})

const inputseleccionado = (e) =>{
    const yaSeleccionado = document.querySelector('.seleccionado')
    yaSeleccionado && yaSeleccionado.classList.remove('seleccionado')
   e.classList.toggle('seleccionado')
}

document.addEventListener('keydown',e=>{
    if (e.key === "Escape") {
        window.close()
    }
})

const retornarClientes = (Clientes,saldo)=>{
    const retornar = Clientes.filter(cliente => cliente[saldo] !== "0")
    return retornar
}