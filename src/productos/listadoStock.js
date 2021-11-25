const { ipcRenderer } = require("electron")
const XLSX = require('xlsx');

const buscar = document.querySelector('.buscar')
const tbody = document.querySelector('.tbody')
const desde = document.querySelector('#desde')
const hasta = document.querySelector('#hasta')
const listar = document.querySelector('.listar')
let productos =[]
buscar.addEventListener('click',e=>{
    ipcRenderer.send('traerProductosPorRango',[desde.value,hasta.value])

    const promesa = new Promise((resolve,reject)=>{
        ipcRenderer.on('traerProductosPorRango',(e,args)=>{
            productos = JSON.parse(args)
            resolve()
        })
        })

        promesa.then(()=>{
            listarProductos()
        })
})

    function listarProductos() {
        tbody.innerHTML = ""
        productos.forEach(({_id,descripcion,cod_fabrica,precio_venta}) => {
            tbody.innerHTML += `
                <tr>
                <td>${_id}</td>
                <td>${descripcion}</td>
                <td>${cod_fabrica}</td>
                <td>${precio_venta}</td>
                </tr>
            `
        });
    }


const imprimir = document.querySelector('.imprimir')
imprimir.addEventListener('click',e=>{
     let printContents = document.querySelector('.listar').innerHTML
     let originalContents = document.body.innerHTML;

     document.body.innerHTML = printContents;

     window.print();

     document.body.innerHTML = originalContents;
})

const excel = document.querySelector('.excel')
excel.addEventListener('click',e=>{
    let listado = []
    productos.forEach(({_id,descripcion,stock})=>{
        let objeto = {}
            objeto.codigo=_id
            objeto.descripcion=descripcion
            objeto.stock=stock
            listado.push(objeto)
    })
    listadoStock(listado)
})


const listadoStock = (listado)=>{
    let wb = XLSX.utils.book_new();

    wb.props = {
        Title: "Listado Stock",
        subject: "Test",
        Author: "Electro Avenida"
    }
    // console.log((listado))
    let newWs = XLSX.utils.json_to_sheet(listado)
    
    XLSX.utils.book_append_sheet(wb,newWs,'Listado Stock')
    XLSX.writeFile(wb,"listadoStock.xlsx")
}


document.addEventListener('keydown',e=>{
    if (e.key === "Escape") {
        window.close()
    }
})