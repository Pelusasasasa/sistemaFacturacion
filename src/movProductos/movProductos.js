const { ipcRenderer } = require("electron")

const codigo = document.querySelector('#codigo')
const descripcion = document.querySelector('#descripcion')
const stock = document.querySelector('#stock')
const tipoOperacion = document.querySelectorAll('input[name="operacion"]')
const cantidad = document.querySelector('#cantidad')
const nuevoStock = document.querySelector('#nuevoStock')
const aceptar = document.querySelector('.aceptar')
const volver = document.querySelector('.volver')
let movProducto = {}
let vendedor

ipcRenderer.on('movimiento-producto-abrir',(e,args)=>{
    console.log(JSON.parse(args))
    const [producto,usuario] = JSON.parse(args)
    codigo.value = producto._id
    descripcion.value = producto.descripcion
    stock.value = producto.stock
    vendedor = usuario
})

cantidad.addEventListener('keypress',e=>{
    if (e.key === "Enter") {
        aceptar.focus()
    }
})

const tamanioMovimiento = async()=>{
    const tamanio = await axios.get(`${URL}movProductos`);
    return (tamanio+1)
}


let operacion = "Compra"
function verTipoDeOperacion(tipo){
    tipo.forEach(e => {
        e.checked && (operacion = e.value)
    });
}

cantidad.addEventListener('blur',e=>{
    verTipoDeOperacion(tipoOperacion)

   if ( operacion === "Compra" || operacion === "Suma" ) {
    (nuevoStock.value = (parseFloat(cantidad.value) + parseFloat(stock.value)).toFixed(2))
   }else{
    (nuevoStock.value = ( parseFloat(stock.value) - parseFloat(cantidad.value) ).toFixed(2))
   }    
})

aceptar.addEventListener('click', async (e) => {

    movProducto.codProd = codigo.value;
    movProducto.descripcion = descripcion.value;
    movProducto._id = await tamanioMovimiento();
    if (operacion==="Compra") {
        (movProducto.tipo_comp="C") 
      }else if(operacion==="Suma"){
       (movProducto.tipo_comp="+") 
      }else{
       (movProducto.tipo_comp="-") 
      };
    ( operacion==="Resta") ? (movProducto.egreso=cantidad.value) : (movProducto.ingreso=cantidad.value);
    movProducto.stock=nuevoStock.value;
      movProducto.vendedor = vendedor;
      await axios.post(`${URL}movProductos`,movProducto);
      let producto = (await axios.get(`${URL}productos/${movProducto.codProd}`)).data;
      producto.stock = movProducto.stock;
      await axios.put(`${URL}productos/${movProducto.codProd}`,producto)
      window.close()
})



volver.addEventListener('click',e=>{
    window.close()
})

document.addEventListener('keydown',e=>{
    if (e.key === "Escape") {
        window.close()
    }
})