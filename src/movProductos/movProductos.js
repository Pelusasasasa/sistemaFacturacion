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

ipcRenderer.invoke('movimiento-producto').then((args)=>{
    vendedor = JSON.parse(args)[1]
    producto = JSON.parse(args)[0][0]
    codigo.value = producto._id
    descripcion.value = producto.descripcion
    stock.value = producto.stock

})

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

aceptar.addEventListener('click', (e) => {
    movProducto.codProd = codigo.value;
    movProducto.descripcion = descripcion.value;

    if (operacion==="Compra") {
        (movProducto.tipo_comp="C") 
      }else if(operacion==="Suma"){
       (movProducto.tipo_comp="+") 
      }else{
       (movProducto.tipo_comp="-") 
      };
    ( operacion==="Resta") ? (movProducto.egreso=cantidad.value) : (movProducto.ingreso=cantidad.value);
    movProducto.stock=nuevoStock.value
      movProducto.vendedor = vendedor
      ipcRenderer.send('movimiento-producto',movProducto);
      ipcRenderer.send('cambiar-stock',[movProducto.codProd,movProducto.stock]);
      location.reload()
})

volver.addEventListener('click',e=>{
    window.close()
})