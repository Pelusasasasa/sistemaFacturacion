const { ipcRenderer } = require("electron");
const qrcode = require('qrcode');

const codFactura = document.querySelector('.codFactura');
const tipo = document.querySelector('.tipo');
const numeroFactura = document.querySelector('.numeroFactura');
const fecha = document.querySelector('.dia');
const hora = document.querySelector('.hora');


const nombre = document.querySelector('.nombre');
const cuit = document.querySelector('.cuit');
const condIva = document.querySelector('.condIva');
const direccion = document.querySelector('.direccion');
const numeroAsociado = document.querySelector('.numeroAsociado');

const listaProductos = document.querySelector('.listaProductos');
const discriminadorIva = document.querySelector('.discriminadorIva');


//En caso de recibo
const cantidadPrecio = document.querySelector('.cantidadPrecio');
const iva = document.querySelector('.iva');
const descri = document.querySelector('.descri');
const BI = document.querySelector('.BI');
const importe = document.querySelector('.importe');

//total
const descuento = document.querySelector('.descuento');
const total = document.querySelector('.total');
const tipoVenta = document.querySelector('.tipoVenta');
const divAfip = document.querySelector('.afip');

//afip
const qr = document.querySelector('.qr');
const cae = document.querySelector('.cae');
const venciCae = document.querySelector('.venciCae');


 ipcRenderer.on('imprimir',(e,args)=>{
     [venta,afip,,,,valorizado,lista] = JSON.parse(args)
    listar(venta,afip,valorizado,lista);
 });

 const listar = async (venta,afip)=>{
    //fecha y hora
    let date = new Date(venta.fecha);
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let hour = date.getHours();
    let minuts = date.getMinutes();
    let seconds = date.getSeconds();

    month = month === 13 ? 1 : month;
    month = month < 10 ? `0${month}` : month;
    day = day < 10 ? `0${day}` : day;
    hour = hour < 10 ? `0${hour}` : hour;
    minuts = minuts < 10 ? `0${minuts}` : minuts;
    seconds = seconds < 10 ? `0${seconds}` : seconds;

    const tipoFactura = verTipoFactura(venta.cod_comp)

    codFactura.innerHTML = "0"+venta.cod_comp;
    tipo.innerHTML = tipoFactura;
    numeroFactura.innerHTML = venta.nro_comp

    fecha.innerHTML = `${day}/${month}/${year}`;
    hora.innerHTML = `${hour}:${minuts}:${seconds}`;

    nombre.innerHTML = venta.nombreCliente;
    cuit.innerHTML = venta.dnicuit;
    condIva.innerHTML = venta.condIva;
    direccion.innerHTML = venta.direccion;
    venta.numeroAsociado && (numeroAsociado.innerHTML = "Comp Original Nº:" + venta.numeroAsociado);
    
    if (venta.tipo_comp !== "Recibos") {
        for await(let {objeto,cantidad} of venta.productos){
            const iva = objeto.iva === "N" ? 1.21 : 1.105;
            listaProductos.innerHTML += `
                <div class="cantidad">
                    <p>${cantidad}/${venta.condIva === "Inscripto" ? (objeto.precio_venta/iva).toFixed(2)  : objeto.precio_venta}</p>
                    <p>${objeto.iva === "N" ? "(21.00)" : "(10.50)"}</p>
                    <p></p>
                </div>
                <div class="descripcionProducto">
                    <p>${objeto.descripcion.slice(0,27)}</p>
                    <p>${venta.condIva === "Inscripto" ? ((objeto.precio_venta/iva)*cantidad).toFixed(2) : (objeto.precio_venta * cantidad).toFixed(2)}</p>
                </div>
            `
        };
    }else{
        cantidadPrecio.innerHTML = "";
        iva.innerHTML = "";
        descri.innerHTML = "Fecha";
        BI.innerHTML = "Numero";
        importe.innerHTML = "Pagado";

        for await(let producto of venta.productos){
            listaProductos.innerHTML += `
                <div class=cantidad>
                    <p>${producto.fecha}</p>
                    <p>${producto.numero}</p>
                    <p>${producto.pagado}</p>
                </div>
            `
        }
    }
    if (venta.condIva === "Inscripto" && venta.tipo_comp !== "Recibos") {
        if (venta.gravado21 !== 0) {
            discriminadorIva.innerHTML += `
                <div class="margin-1-t">
                    <p>NETO SIN IVA</p>
                    <p>${venta.gravado21}</p>
                </div>
                <div>
                <p>IVA 21.00/</p>
                <p>${venta.iva21}</p>
                </div>
            `
        }
        if (venta.gravado105 !== 0) {
            discriminadorIva.innerHTML += `
                <div class="margin-1-t">
                    <p>NETO SIN IVA</p>
                    <p>${venta.gravado105}</p>
                </div>
                <div>
                    <p>IVA 10.50/</p>
                    <p>${venta.iva105}</p>
                </div>
            `
        }
    }

    descuento.innerHTML = parseFloat(venta.descuento).toFixed(2);
    total.innerHTML = parseFloat(venta.precioFinal).toFixed(2);
    tipoVenta.innerHTML = (venta.tipo_pago !== "CC" || venta.cliente === "M122" || venta.cliente === "A029") ? `Contado: ${parseFloat(venta.precioFinal).toFixed(2)}` : "Cuenta Corriente";
    if (afip) {
        qr.children[0].src = afip.QR;
        cae.innerHTML = afip.cae;
        venciCae.innerHTML = afip.vencimientoCae;
    }else{
        divAfip.classList.add('none');
    }
 }


 const verTipoFactura = (codigo)=>{
     if (codigo === 6) {
         return "Factura B";
     }else if(codigo === 1){
         return "Factura A";
     }else if(codigo === 3){
         return "Nota Credito A"
     }else if(codigo === 8){
        return "Nota Credito B"
    }else if(codigo === 4){
        return "Recibos"
    }else if(codigo === 9){
        return "Recibos"
    }
 };