const { ipcRenderer } = require("electron")

const tbody = document.querySelector('.tbody')

// ipcRenderer.send('informacion-movimiento-producto')

ipcRenderer.on('datos-movimiento-producto', (e,args)=>{
    const listaMovimiento = JSON.parse(args)
    listaMovimiento.sort((a,b)=>{
        if (a.fecha > b.fecha) {
            return 1;
        }else if(a.fecha < b.fecha){
            return -1;
        }
        return 0;
    })
    tbody.innerHTML += " ";
    for(let movProducto of listaMovimiento){
        let fecha = new Date(movProducto.fecha)
        tbody.innerHTML += `
            <tr>
                <td>${fecha.getUTCDate()}/${fecha.getUTCMonth()+1}/${fecha.getUTCFullYear()}</td>
                <td>${movProducto.codCliente}</td>
                <td>${movProducto.cliente}</td>
                <td>${movProducto.tipo_comp}</td>
                <td>${movProducto.nro_comp}</td>
                <td>${movProducto.ingreso}</td>
                <td>${movProducto.egreso}</td>
                <td>${movProducto.stock}</td>
                <td>${movProducto.precio_unitario}</td>
                <td>${movProducto.total}</td>
                <td>${movProducto.vendedor}</td>
            </tr>
        `
    };
})


const salir = document.querySelector('.salir')
salir.addEventListener('click',()=>{
    window.close();

})

document.addEventListener('keydown',e=>{
    console.log(e)
    if(e.key === "Escape"){
        window.close()
    }
})