const axios  = require("axios");
const { ipcRenderer } = require("electron");
require("dotenv").config;
const URL = process.env.URL;


const XLSX = require('xlsx');

const buscar = document.querySelector('.buscar')
const tbody = document.querySelector('.tbody')
const desde = document.querySelector('#desde')
const hasta = document.querySelector('#hasta')
const listar = document.querySelector('.listar')
let productos =[]

desde.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        hasta.focus()
    }else if((desde.value.length === 3 || desde.value.length === 7)&& e.key !== "-"){
        desde.value = desde.value + "-";
}
})

hasta.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        buscar.focus()
    }else if((hasta.value.length === 3 || hasta.value.length === 7) && e.key !== "-"){
        hasta.value = hasta.value + "-";
}
})


buscar.addEventListener('click',async e=>{
        productos = await axios.get(`${URL}productos/productosEntreRangos/${desde.value}/${hasta.value}`)
        productos = productos.data;
        listarProductos();
})

    function listarProductos() {
        tbody.innerHTML = ""
        productos.forEach(({_id,descripcion,cod_fabrica,stock}) => {
            tbody.innerHTML += `
                <tr>
                <td>${_id}</td>
                <td>${descripcion}</td>
                <td>${cod_fabrica}</td>
                <td>${parseFloat(stock).toFixed(2)}</td>
                </tr>
            `
        });
    }


const imprimir = document.querySelector('.imprimir')
imprimir.addEventListener('click',e=>{
    let printContents = document.querySelector('.listar')
    let originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
})

const excel = document.querySelector('.excel')
excel.addEventListener('click',e=>{
    let listado = []
    productos.forEach(({_id,descripcion,stock,cod_fabrica,marca})=>{
        let objeto = {}
            objeto.codigo=_id;
            objeto.descripcion=descripcion;
            objeto.stock=stock;
            objeto.fabrica = cod_fabrica;
            objeto.marca = marca
            listado.push(objeto)
    })
    listadoStock(listado)
})


const listadoStock = (listado)=>{
    ipcRenderer.send('elegirPath');
    let path = "";
    let extencion = "xlsx";
    ipcRenderer.on('mandoPath',(e,args)=>{
        path = args;
        extencion = path.split('.')[1] ? path.split('.')[1] : extencion;
        path = path.split('.')[0];
        let wb = XLSX.utils.book_new();
        wb.props = {
            Title: "Listado Stock",
            subject: "Test",
            Author: "Electro Avenida"
        }
        let newWs = XLSX.utils.json_to_sheet(listado)
        
        XLSX.utils.book_append_sheet(wb,newWs,'Listado Stock')
        XLSX.writeFile(wb,path + "." + extencion)
    });
}

//si apretamos escape se cieera la pagina
document.addEventListener('keydown',e=>{
    if (e.key === "Escape") {
        window.close()
    }
})