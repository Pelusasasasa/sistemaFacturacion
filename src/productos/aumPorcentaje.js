const sweet = require('sweetalert2');
const select = document.querySelector('#marca');
const porcentajeInput = document.querySelector('#porcentaje');
const modificar = document.querySelector('.modificar');

const axios = require("axios");
require("dotenv").config;
const URL = process.env.URL;

let marcas;
let dolar;
const traerMarcas = async()=>{
        dolar = parseFloat((await axios.get(`${URL}tipoVenta`)).data.dolar);
        marcas = await axios(`${URL}productos`);
        marcas = marcas.data
        marcas.sort();
        marcas.forEach(marca => {
            const option = document.createElement('option')
            option.text = marca;
            option.value = marca
            select.appendChild(option)
        });
    }
traerMarcas()


modificar.addEventListener('click',async e=>{
    let marca = select.value;
    let porcentaje = parseFloat(porcentajeInput.value);
    let productos = await axios.get(`${URL}productos/marcas/${marca}`)
    productos = productos.data;
    await productos.forEach(async producto=>{
        if (producto.costodolar === 0) {
            producto.costo = (parseFloat(producto.costo) + parseFloat(producto.costo)*porcentaje/100).toFixed(2);
            producto.impuestos = (producto.iva === "N") ? (parseFloat(producto.costo) * 26 / 100) : (parseFloat(producto.costo) * 15 / 100);
            producto.precio_venta = ((parseFloat(producto.costo) + parseFloat(producto.impuestos))*parseFloat(producto.utilidad)/100) +(parseFloat(producto.costo) + parseFloat(producto.impuestos))
            producto.impuestos = (producto.impuestos).toFixed(2)
            producto.precio_venta = (producto.precio_venta).toFixed(2)
        }else{
            producto.costodolar = parseFloat((parseFloat(producto.costodolar) + parseFloat(producto.costodolar)*porcentaje/100).toFixed(2));
            producto.impuestos = (producto.iva === "N") ? (parseFloat(producto.costodolar) * 26 / 100).toFixed(2) : (parseFloat(producto.costodolar) * 15 / 100).toFixed(2);
            producto.precio_venta = ((producto.costodolar + parseFloat(producto.impuestos))*dolar*parseFloat(producto.utilidad)/100) + ((parseFloat(producto.costodolar) + parseFloat(producto.impuestos))*dolar);
            producto.precio_venta = (producto.precio_venta).toFixed(2);
        }
        await axios.put(`${URL}productos/${producto._id}`,producto)
        sweet.fire({title:`Se Modifico el precio de los productos ${select.value}`})
    })
})
