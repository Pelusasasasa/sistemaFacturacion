const { ipcRenderer } = require("electron");
const { DateTime } = require("luxon");
const axios = require("axios");
require("dotenv").config;
const URL = process.env.URL;


const desde = document.querySelector('#desde');
const hasta = document.querySelector('#hasta');
const aceptar = document.querySelector('.aceptar');
const cancelar = document.querySelector('.cancelar');

const date = new Date();

let day = date.getDate();
let month = date.getMonth() + 1;
let year = date.getFullYear();

day = day<10 ? `0${day}` : day;
month = month<10 ? `0${month}` : month;
month = month===13 ? 1 : month;

desde.value = `${year}-${month}-${day}`
hasta.value = `${year}-${month}-${day}`


aceptar.addEventListener('click',async e=>{
    let desdefecha = new Date(desde.value);
    let hastafecha = DateTime.fromISO(hasta.value).endOf('day');
    const tickets = (await axios.get(`${URL}ventas/${desdefecha}/${hastafecha}`)).data;
        const presupuesto = (await axios.get(`${URL}presupuesto/${desdefecha}/${hastafecha}`)).data
        let ticketsDelDia = tickets.filter(ticket =>{
            if (ticket.tipo_comp === "Ticket Factura" && ticket.tipo_pago==="CD") {
                return ticket;
            }else if(ticket.tipo_comp === "Recibos" || ticket.tipo_comp === "Recibos_P"){
                return ticket;
            }
        });
        let presupuestosDelDia = presupuesto.filter(presu =>{
            if(presu.tipo_pago === "CD"){
                return presu
            }
        });
        const arreglo = [...ticketsDelDia,...presupuestosDelDia];
        ipcRenderer.send('enviar-arreglo-descarga',arreglo);
        window.close();
});

desde.addEventListener('keypress',e=>{
    e.preventDefault();
    if (e.key === "Enter") {
        hasta.focus();
    }
});

hasta.addEventListener('keypress',e=>{
    e.preventDefault();
    if (e.key === "Enter") {
        aceptar.focus();
    }
});

cancelar.addEventListener('click',e=>{
    window.close();
})

document.addEventListener('keydown',e=>{
    if (e.key === "Escape") {
        window.close();
    }
})