const { ipcRenderer } = require("electron");
require('dotenv').config();
const URL = process.env.URL;
const axios = require("axios")


const codigo = document.querySelector('#codigo');
const codFabrica = document.querySelector('#cod-fabrica');
const descripcion = document.querySelector('#descripcion');
const provedor = document.querySelector('#provedor');
const marca = document.querySelector('#marca');
const stock = document.querySelector('#stock');
const tasaIva = document.querySelector('#tasaIva');
const costoPesos = document.querySelector('#costoPesos');
const costoDolares = document.querySelector('#costoDolares');
const ivaImp = document.querySelector('#ivaImp')
const costoTotal = document.querySelector('#costoTotal');
const observaciones = document.querySelector('#observaciones');
const utilidad = document.querySelector('#utilidad');
const precioVenta = document.querySelector('#precioVenta');
const unidad = document.querySelector('#unidad');
let dolar = 0;
let costo = 0;
let valorTasaIva = 26;
let acceso;


//Traer el dolar
const traerDolar = async()=>{
    let numeros = (await axios.get(`${URL}tipoVenta`)).data;
    dolar = numeros.dolar
}
traerDolar()

    ipcRenderer.on('id-producto',async(e,args)=>{
        let producto = await axios.get(`${URL}productos/${args}`);
        producto = producto.data;
        asignarCampos(producto)
    })
ipcRenderer.on('acceso',(e,args)=>{
    acceso = JSON.parse(args)
    console.log(acceso)
    if (acceso === "2") {
        document.querySelector('.costos').classList.add('none');
        document.querySelector('.utilidad').classList.add('none')
    }
})

function asignarCampos(producto) {
    codigo.value = producto._id
    codFabrica.value = producto.cod_fabrica
    descripcion.value = producto.descripcion
    provedor.value = producto.provedor
    marca.value = producto.marca
    stock.value = producto.stock
    tasaIva.value=producto.iva;
    (parseFloat(producto.costo) !== 0) ? (costoPesos.value = parseFloat(producto.costo).toFixed(2)) : (costoPesos.value = "0.00");
    (parseFloat(producto.costodolar) !== 0) ? (costoDolares.value = parseFloat(producto.costodolar).toFixed(3)) : (costoDolares.value = "0.00");

    if (parseFloat(costoDolares.value) !== 0) {
        ivaImp.value = parseFloat(producto.impuestos);
        costo = parseFloat(costoDolares.value);
        costoTotal.value = ((costo+parseFloat(producto.impuestos))*dolar).toFixed(3);
    }else{
        ivaImp.value = parseFloat(producto.impuestos)
        costo = parseFloat(costoPesos.value)
        costoTotal.value = ((costo+parseFloat(producto.impuestos))).toFixed(3)
    }
    observaciones.value = producto.observacion
    utilidad.value=(parseFloat(producto.utilidad)).toFixed(2)
    precioVenta.value = producto.precio_venta;
    unidad.value = producto.unidad
    valorTasaIva = tasaIvas(producto.iva)
}
tasaIva.addEventListener('click', (e) =>{
    valorTasaIva = tasaIvas(e.target.value);
})

if (costoPesos.focus) {
        costoPesos.addEventListener('blur', (e) =>{
        costo = resultado(parseFloat(costoPesos.value),valorTasaIva);
    })
    }

costoTotal.addEventListener('focus',()=>{
    ivaImp.value = (parseFloat(costoDolares.value) !== 0) ? (parseFloat((costoDolares.value * valorTasaIva / 100).toFixed(3))) :  costo.toFixed(3)
    
    costoT = parseFloat(ivaImp.value)
    let costoP = 0
    
    if (parseFloat(costoDolares.value) !== 0) {
        costoP = parseFloat(costoDolares.value);
        costoTotal.value = ((parseFloat(ivaImp.value)+parseFloat(costoDolares.value))*dolar).toFixed(2)
    }else{
        costoP = parseFloat(costoPesos.value)
        console.log(costo)
        console.log(costoP)
        costoTotal.value = ((costo+costoP).toFixed(2))
    }
})

precioVenta.addEventListener('focus',e=>{
    
    const aux = (parseFloat(utilidad.value)*parseFloat(costoTotal.value)/100).toFixed(2)
    console.log(costoTotal.value)
    precioVenta.value = parseFloat((parseFloat(aux) + parseFloat(costoTotal.value)).toFixed(2))
})

const modificar = document.querySelector('.modificar')
modificar.addEventListener('click',e=>{
    modificar.classList.add('disable')
    guardar.classList.remove('disable')
    codFabrica.removeAttribute("disabled")
    descripcion.removeAttribute("disabled") 
    provedor.removeAttribute("disabled")
    marca.removeAttribute("disabled") 
    tasaIva.removeAttribute("disabled") 
    costoPesos.removeAttribute("disabled") 
    costoDolares.removeAttribute("disabled") 
    costoTotal.removeAttribute("disabled") 
    observaciones.removeAttribute("disabled")
    utilidad.removeAttribute("disabled") 
    precioVenta.removeAttribute("disabled") 
    unidad.removeAttribute('disabled')

})


const guardar = document.querySelector('.guardar')
guardar.addEventListener('click',async e=>{
    let producto = {};
    producto._id = codigo.value
    producto.cod_fabrica = codFabrica.value
    producto.descripcion = descripcion.value
    producto.provedor = provedor.value
    producto.marca = marca.value
    producto.stock = stock.value
    producto.iva = tasaIva.value
    producto.costo = costoPesos.value
    producto.costodolar = parseFloat(costoDolares.value)
    producto.observacion = observaciones.value
    producto.utilidad = utilidad.value
    producto.precio_venta = precioVenta.value
    producto.unidad = unidad.value
    producto.impuestos = ivaImp.value
    await axios.put(`${URL}productos/${producto._id}`,producto);
    ipcRenderer.send('productoModificado',producto);
    window.close()
})

const salir = document.querySelector('.salir')
salir.addEventListener('click',e=>{
    window.close();
})

document.addEventListener('keydown',e=>{
    if (e.key === "Escape") {
        window.close()
    }
})

function resultado(numero1,numero2,dolar=1) {
    return numero1*numero2*dolar/100;
}

    function tasaIvas(palabra) {
        if (palabra === "N") {
            return 26;
        }else{
            return 15;
        }
    }

    codigo.addEventListener('keypress',e=>{
        if (e.key === "Enter") {
            codFabrica.focus()
        }
    })
    codFabrica.addEventListener('keypress',e=>{
        if (e.key === "Enter") {
            descripcion.focus()
        }
    })
    descripcion.addEventListener('keypress',e=>{
        if (e.key === "Enter") {
            unidad.focus()
        }
    })

    unidad.addEventListener('keypress',e=>{
        e.preventDefault();
        if (e.key === "Enter") {
            provedor.focus()
        }
    })
    
    stock.addEventListener('keypress',e=>{
        if (e.key === "Enter") {
            provedor.focus()
        }
    })
    
    provedor.addEventListener('keypress',e=>{
        if (e.key === "Enter") {
            marca.focus()
        }
    })
    
    marca.addEventListener('keypress',e=>{
        if (e.key === "Enter") {
            tasaIva.focus()
        }
    })

    tasaIva.addEventListener('keypress',e=>{
        e.preventDefault();
        if (e.key === "Enter") {
            costoPesos.focus()
            costoPesos.select()
        }
    })
    
    costoPesos.addEventListener('keypress',e=>{
        if (e.key === "Enter") {
            costoDolares.focus()
            costoDolares.select()
        }
    })
    
    costoDolares.addEventListener('keypress',e=>{
        if (e.key === "Enter") {
            costoTotal.focus()
        }
    })
    
    ivaImp.addEventListener('keypress',e=>{
        if (e.key === "Enter") {
            costoTotal.focus()
        }
    })
    
    costoTotal.addEventListener('keypress',e=>{
        if (e.key === "Enter") {
            observaciones.focus()
        }
    })
    
    observaciones.addEventListener('keypress',e=>{
        if (e.key === "Enter") {
            utilidad.focus()
        }
    })
    
    utilidad.addEventListener('keypress',e=>{
        if (e.key === "Enter") {
            precioVenta.focus()
        }
    })
    
    precioVenta.addEventListener('keypress',e=>{
        if (e.key === "Enter") {
            guardar.focus()
        }
    })

    utilidad.addEventListener('focus',e=>{
        utilidad.select();
    })

    costoPesos.addEventListener('focus',e=>{
        costoPesos.select();
    })

    costoDolares.addEventListener('focus',e=>{
        costoDolares.select();
    })

    marca.addEventListener('focus',e=>{
        marca.select();
    })

    stock.addEventListener('focus',e=>{
        stock.select();
    })

    provedor.addEventListener('focus',e=>{
        provedor.select();
    })

    descripcion.addEventListener('focus',e=>{
        descripcion.select();
    })

    codigo.addEventListener('focus',e=>{
        codigo.select();
    })

    codFabrica.addEventListener('focus',e=>{
        codFabrica.select();
    })

    ivaImp.addEventListener('focus',e=>{
        ivaImp.select();
    })

    costoTotal.addEventListener('focus',e=>{
        costoTotal.select();
    })

    observaciones.addEventListener('focus',e=>{
        observaciones.select();
    })

    precioVenta.addEventListener('focus',e=>{
        precioVenta.select();
    })