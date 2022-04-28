const { ipcRenderer } = require("electron");

const axios = require("axios");
require("dotenv").config;
const URL = process.env.URL;

const fecha = document.querySelector('.fecha');
        const numero = document.querySelector('.numero');
        const vendedor = document.querySelector('.vendedor');
        const clientes = document.querySelector('.cliente');
        const idCliente = document.querySelector('.idCliente');
        const cuit = document.querySelector('.cuit');
        const direccion = document.querySelector('.direccion');
        const localidad = document.querySelector('.localidad');
        const numeroComp = document.querySelector('.numero');
        const cond_iva = document.querySelector('.cond_iva');
        const subtotal = document.querySelector('.subtotal');
        const precioFinal = document.querySelector('.precioFinal');
        const tipoPago = document.querySelector('.tipoPago');
        const tbody = document.querySelector('.tbody');
        const seccionQR = document.querySelector('.seccionQR');
        const tipoFactura = document.querySelector('.tipoFactura');
        const descuento = document.querySelector('.descuento');
        const tomarFecha = new Date();
        const dia = tomarFecha.getDate(); 
        const mes = tomarFecha.getMonth() + 1
        const anio = tomarFecha.getFullYear();
        const hora = tomarFecha.getHours();
        const minuto = tomarFecha.getMinutes();
        const segundo = tomarFecha.getSeconds();

        const listar = async (venta,cliente,valorizado)=>{
            
            let lista = (await axios.get(`${URL}movProductos/${venta.nro_comp}/Presupuesto`)).data;
            if (lista.length >16) {
                const tabla = document.querySelector('.tabla');
                tabla.classList.add('hojaGrande');
            }
            numero.innerHTML=venta.nro_comp
            clientes.innerHTML = cliente.cliente;
            venta.observaciones !== "" ? clientes.innerHTML += ` (${venta.observaciones})` : "";
            idCliente.innerHTML = cliente._id
            vendedor.innerHTML = venta.vendedor
            cuit.innerHTML = cliente.cuit
            direccion.innerHTML = cliente.direccion
            localidad.innerHTML = cliente.localidad
            fecha.innerHTML = `${dia}/${mes}/${anio} ${hora}:${minuto}:${segundo}`
            numeroComp.innerHTML = venta.nro_comp
            subtotal.innerHTML=parseFloat(venta.precioFinal)+parseFloat(venta.descuento)
            precioFinal.innerHTML=(parseFloat(venta.precioFinal)).toFixed(2);
            tipoPago.innerHTML= venta.tipo_pago
            tipoFactura.innerHTML = "R"
            descuento.innerHTML = venta.descuento
    
            if (venta.tipo_pago === "CC" && valorizado !== "valorizado") {
                precioFinal.innerHTML = ""
                subtotal.innerHTML=""
                descuento.innerHTML= ""
            }
    
            if (cliente.cond_iva) {
                cond_iva.innerHTML = cliente.cond_iva
            }else{
                cond_iva.innerHTML = "Consumidor Final"
            }
            tbody.innerHTML=""
             for (let objeto of lista) {
                 if (venta.tipo_pago !== "CC" || (valorizado === "valorizado" && venta.tipo_pago === "CC"   )) {
                        
                    tbody.innerHTML += `
                    <tr>
                        <td>${(parseFloat(objeto.egreso)).toFixed(2)}</td>
                        <td>${objeto.codProd}</td>
                        <td class="descripcion">${objeto.descripcion}</td>
                        <td>${parseFloat(objeto.precio_unitario).toFixed(2)}</td>
                        <td>${(parseFloat(objeto.precio_unitario)*objeto.egreso).toFixed(2)}</td>
                    </tr>
                    `
                }else{
                    tbody.innerHTML += `
                    <tr>
                        <td>${(parseFloat(objeto.egreso)).toFixed(2)}</td>
                        <td class="descripcion">${objeto.codProd}</td>
                        <td>${objeto.descripcion}</td>
                    </tr>
                    `
                }
             };
        }
 
    document.addEventListener('keydown',e=>{
        if(e.key === "Escape"){
            window.close()
        }
        })

    ipcRenderer.on('imprimir',(e,args)=>{
        [venta,cliente,,,,valorizado] = JSON.parse(args)
        listar(venta,cliente,valorizado)
    })