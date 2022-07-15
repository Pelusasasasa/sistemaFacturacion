const { ipcRenderer } = require("electron");
require('dotenv').config();
const URL = process.env.URL;
const axios = require("axios");

const select = document.querySelector('#marcas');
const tbody = document.querySelector('tbody');

const traerMarcas = async()=>{
    const marcas = (await axios.get(`${URL}productos`)).data;
    marcas.sort((a,b)=>{
        if (a>b) {
            return 1
        }else if(a<b){
            return -1
        }
        return 0
    })
    for await(let marca of marcas){
        const option = document.createElement('option');
        option.value = marca;
        option.text = marca;
        select.appendChild(option);
    }
};

select.addEventListener('keyup',async e=>{
    tbody.innerHTML = "";
    listar();
});

select.addEventListener('click',async e=>{
    tbody.innerHTML = "";
    listar();
});

const listar = async ()=>{
    const productos = (await axios.get(`${URL}productos/buscarProducto/${select.value}/marca`)).data;
    for await(let {descripcion,_id,stock,precio_venta,observacion} of productos){
        tbody.innerHTML += `
            <tr>
                <td>${_id}</td>
                <td>${descripcion}</td>
                <td>${stock}</td>
                <td>$${precio_venta}</td>
                <td>${observacion.slice(0,13)}</td>

            </tr>
        `
    }
}
traerMarcas();