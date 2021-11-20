const { ipcRenderer } = require("electron");
const tbody = document.querySelector('.tbody')

ipcRenderer.send('traerSaldo')
ipcRenderer.on('traerSaldo',(e,args)=>{

    clientes = JSON.parse(args)
    console.log(clientes)
    clientes.forEach(cliente => {
        tbody.innerHTML += `
            <tr>
                <td>${cliente._id}</td>
                <td>${cliente.cliente}</td>
                <td>${cliente.direccion}</td>
                <td>${cliente.cond_iva}</td>
                <td>${cliente.localidad}</td>
                <td>${cliente.saldo}</td>
                <td>${cliente.saldo_p}</td>
            </tr>
        `
    });
})
const descargar = document.querySelector('.descargar')
const tabla = document.querySelector('#tabla')

descargar.addEventListener('click',e=>{
    tabla.save()
})