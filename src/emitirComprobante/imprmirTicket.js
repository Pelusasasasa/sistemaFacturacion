const { ipcRenderer } = require("electron");

const conector = new ConectorPlugin();
ipcRenderer.on('imprimir',(e,args)=>{
    console.log("first")
    const [Venta,Cliente,,,,,valoresQR] = JSON.parse(args)
    ponerValores(Cliente,Venta,valoresQR)
})

const ponerValores = (Cliente,Venta,{QR,cae,vencimientoCae})=>{
    console.log(Venta)
    const fechaVenta = new Date(Venta.fecha)
    let dia = fechaVenta.getDate()
    let mes = fechaVenta.getMonth()+1;
    let horas = fechaVenta.getHours()
    let minutos = fechaVenta.getMinutes()
    let segundos = fechaVenta.getSeconds()
    mes = mes<10 ? `0${mes}` : mes;
    let anio = fechaVenta.getFullYear()
    const comprobante = verTipoComp(Venta.cod_comp)
    conector.cortar()
    conector.establecerTamanioFuente(2,2);
    conector.establecerFuente(ConectorPlugin.Constantes.FuenteC)
    conector.establecerJustificacion(ConectorPlugin.Constantes.AlineacionCentro);
    conector.texto("*ELECTRO AVENIDA*\n")
    conector.establecerJustificacion(ConectorPlugin.Constantes.AlineacionIzquierda);
    conector.establecerTamanioFuente(1,1);
    conector.texto("GIANOVI MARINA ISABEL\n");
    conector.texto("INGRESO BRUTOS: 27165767433\n")
    conector.texto("C.U.I.T Nro: 27165767433\n");
    conector.texto("AV.9 DE JULION-3380 (3228);CHAJARI E.R.\n");
    conector.texto("INICIO DE ACTIVIDADES: 02-03-07\n");
    conector.texto("IVA RESPONSABLE INSCRIPTO\n");
    conector.texto("------------------------------------------\n");
    conector.texto(`${comprobante}   0005-${Venta.nro_comp}\n`);
    conector.texto(`FECHA: ${dia}-${mes}-${anio}    Hora:${horas}:${minutos}:${segundos}\n`);
    conector.texto("------------------------------------------\n");
    conector.texto(`${Cliente.cliente}\n`);
    conector.texto(`${Cliente.cuit}\n`);
    conector.texto(`${Cliente.cond_iva}\n`);
    conector.texto(`${Cliente.direccion}   ${Cliente.localidad}\n`);
    conector.texto("------------------------------------------\n");
    conector.texto("CANTIDAD/PRECIO UNIT (%IVA)\n")
    conector.texto("DESCRIPCION           (%B.I)       IMPORTE\n")  
    conector.texto("------------------------------------------\n");
    Venta.productos && Venta.productos.forEach(({cantidad,objeto})=>{
        conector.texto(`${cantidad}/${objeto.precio_venta}              ${objeto.iva === "N" ? "(21.00)" : "(10.50)"}\n`);
        conector.texto(`${objeto.descripcion.slice(0,30)}       ${(parseFloat(cantidad)*parseFloat(objeto.precio_venta)).toFixed(2)}\n`)
    })
    conector.feed(2);
    conector.establecerTamanioFuente(2,1);
    conector.texto("TOTAL       $" +  Venta.precioFinal + "\n");
    conector.establecerTamanioFuente(1,1);
    conector.texto("Recibimos(mos)\n");
    conector.texto("Contado     $" + Venta.precioFinal + "\n");
    conector.establecerTamanioFuente(2,1);
    conector.texto("CAMBIO      $0.00\n");
    conector.establecerJustificacion(ConectorPlugin.Constantes.AlineacionCentro);
    conector.texto("*MUCHA GRACIAS*\n")
    conector.qrComoImagen("Soy el contenido del código QR");
    conector.establecerJustificacion(ConectorPlugin.Constantes.AlineacionIzquierda);
    conector.establecerTamanioFuente(1,1);
    conector.texto("CAE:" + "                  " + "Vencimiento CAE:" + "\n")
    conector.texto(cae + "           " + vencimientoCae + "\n")
    conector.feed(3)
    conector.cortar()

    conector.imprimirEn("Microsoft Print to PDF")
        .then(respuestaAlImprimir => {
                //  printer.execute()
                 console.log("first")
            if (respuestaAlImprimir === true) {
                console.log("Impreso correctamente");
            } else {
                console.log("Error. La respuesta es: " + respuestaAlImprimir);
            }
        });
   }


const verTipoComp = (codigoComprobante)=>{
    if (codigoComprobante === 6) {
        return "Cod: 006 - Factura B"
    }else if(codigoComprobante === 1){
        return "Cod: 002 - Factura A"
    }else if(codigoComprobante === 3){
        return "Cod: 003 - Nota Credito A"
    }else if(codigoComprobante === 4){
        return "Cod: 004 - Recibos A"
    }else if(codigoComprobante === 8){
        return "Cod: 008 - Nota Credito B"
    }else if(codigoComprobante === 9){
        return "Cod: 009 - Recibos B"
    }
}