const a = require('./config')
const fs = require('fs')
require('dotenv').config();
let URL
if (a === 1) {
    URL = process.env.URLPUBLICANEGOCIO;
}else if(a === 2){
    URL = "http://192.168.1.11:4000/api/";
    //URL = process.env.URLPRIVADANEGOCIO;
}
let conexion;
let tipoConexion;
if (a === 2) {
    conexion = "Privada";
}else{
    conexion = "Publica"
}


const axios = require("axios")
const path = require('path');
const { app, BrowserWindow, ipcMain, Menu, ipcRenderer } = require('electron');
const { DateTime } = require("luxon");
const url = require('url')
const [pedidos, ventas] = require('./descargas/descargas')


if (process.env.NODE_ENV !== 'production') {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
    })
};
global.nuevaVentana = null;
global.ventanaPrincipal = null

app.on('window-all-closed',()=>{
    app.quit()
})
function crearVentanaPrincipal() {
    ventanaPrincipal = new BrowserWindow({  
        //width: 7000,
        //height: 7000,
        icon: path.join(__dirname,'./imagenes/electro.ico'),
        fullscreen: false,
        closable: false,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
        }
        
    });
    ventanaPrincipal.loadFile('src/index.html')
    ventanaPrincipal.maximize()
}

//abrir ventana agregar cliente
ipcMain.on('abrir-ventana-agregar-cliente',e=>{
    abrirVentana('agregarCliente')
})


ipcMain.on('recargar-Ventana',(e,args)=>{
    app.relaunch();
    app.exit();
})


//INICIO PRODUCTOS

//obtener todos los productos
ipcMain.on('get-productos', async (e, args=["","descripcion"]) => {
    let productos
    let texto
    if(args[0] !== ""){ 
        texto = args[0]
        let condicion = args[1]
        condicion === "codigo" && (condicion = "_id")
        productos = await axios.get(`${URL}productos/buscarProducto/${texto}/${condicion}`)
    }else{
        productos = await axios.get(`${URL}productos/buscarProducto/textoVacio/descripcion`)
    }
    productos = productos.data
    e.reply('get-productos', JSON.stringify(productos))
})

//Obtenemos un producto
ipcMain.on('get-producto',async(e,args)=>{
    let producto = await axios.get(`${URL}productos/${args}`)
    producto = producto.data
    e.reply('get-producto',JSON.stringify(producto))
})

//Crear Producto
ipcMain.on('nuevo-producto', async (e, args) => {
    await axios.post(`${URL}productos`,args)
})

//modificamos el producto
ipcMain.on('modificarProducto', async (e, args) => {
    await axios.put(`${URL}productos/${args._id}`,args)
})

//Eliminamos un producto
ipcMain.on('eliminar-producto', async (e, id) => {
    await axios.delete(`${URL}productos/${id}`)
})

//Cambiamos el codigo de un producto
ipcMain.on('cambio-codigo',async(e,args)=>{
    const [idViejo,idNuevo] = args;
    const productos = await axios.get(`${URL}productos/${idViejo}`)
    const nuevoProducto=productos.data
    nuevoProducto._id=idNuevo

    await axios.post(`${URL}productos`,nuevoProducto)   
    await axios.delete(`${URL}productos/${idViejo}`)
 })

//productos con stock negativo
ipcMain.on('stockNegativo',async (e)=>{
    let productos = await axios(`${URL}productos/stockNegativo`)
    productos = productos.data
    e.reply('stockNegativo',JSON.stringify(productos))
})

//Cambiar stock de un producto
ipcMain.on('cambiarStock',async (e,arreglo)=>{
    const [id,nuevoStock] = arreglo;
    let producto = await axios.get(`${URL}productos/${id}`)
    producto = producto.data;
    producto.stock = nuevoStock;
    await axios.put(`${URL}productos/${id}`,producto)
})

//mandamos el precio del producto
ipcMain.on('traerPrecio',async(e,id)=>{
    let producto = await axios.get(`${URL}productos/${id}`)
    producto = producto.data
    e.reply('traerPrecio', JSON.stringify(producto))
})


//descontamos el stock
ipcMain.on('descontarStock', async (e, args) => {
    const [ cantidad , id] = args;
    let producto = await axios.get(`${URL}productos/${id}`)
    producto = producto.data
    const descontar = parseInt(producto.stock) - parseInt(cantidad)
    producto.stock = descontar.toFixed(2)
    await axios.put(`${URL}productos/${id}`,producto)
})

//enviamos los productos entre un rango
ipcMain.on('traerProductosPorRango',async (e,args)=>{
    const [desde,hasta] = args
    let productos = await axios.get(`${URL}productos/productosEntreRangos/${desde}/${hasta}`)
    productos = productos.data;
    e.reply('traerProductosPorRango',JSON.stringify(productos))
})

//mandamos el producto a emitir comprobante
ipcMain.on('mando-el-producto', async (e, args) => {
    let producto = await axios.get(`${URL}productos/${args._id}`);
    producto = producto.data
    ventanaPrincipal.webContents.send('mando-el-producto', JSON.stringify({
        producto: producto,
        cantidad: args.cantidad
    }))
})

//cambiamos el precio de los productos con dolares
ipcMain.on('CambiarPrecios',async(e,args)=>{
    let productos = await axios.get(`${URL}productos/buscarProducto/textoVacio/dolar`)
    let dolar = await axios.get(`${URL}tipoVenta`);
    dolar = dolar.data.dolar
    productos = productos.data;
    productos.forEach(async producto => {
        const costoTotal = (parseFloat(producto.impuestos)+parseFloat(producto.costodolar)*parseFloat(dolar));
        producto.precio_venta = (costoTotal+(parseFloat(producto.utilidad)*costoTotal/100)).toFixed(2);
        await axios.put(`${URL}productos/${producto._id}`,producto)
    });
})


//modificamos el precio de los prodcutos por porcentaje
ipcMain.on('modficarPrecioPorcentaje',async(e,args)=>{
    let [marca,porcentaje] = args
    porcentaje = parseFloat(porcentaje);
    let productos = await axios.get(`${URL}productos/marcas/${marca}`)
    productos = productos.data;
    await productos.forEach(async producto=>{
        if (producto.costodolar === 0) {
            producto.costo = (parseFloat(producto.costo) + parseFloat(producto.costo)*5/100).toFixed(2);
            producto.impuestos = (producto.iva === "N") ? (parseFloat(producto.costo) * 26 / 100) : (parseFloat(producto.costo) * 15 / 100);
            producto.precio_venta = ((parseFloat(producto.costo) + parseFloat(producto.impuestos))*parseFloat(producto.utilidad)/100) +(parseFloat(producto.costo) + parseFloat(producto.impuestos))
            producto.impuestos = (producto.impuestos).toFixed(2)
            producto.precio_venta = (producto.precio_venta).toFixed(2)
        }else{
            producto.costodolar = parseFloat((parseFloat(producto.costodolar) + parseFloat(producto.costodolar)*5/100).toFixed(2));
            producto.impuestos = (producto.iva === "N") ? (parseFloat(producto.costodolar) * 26 / 100) : (parseFloat(producto.costodolar) * 15 / 100);
            producto.precio_venta = ((parseFloat(producto.costo) + parseFloat(producto.impuestos))*parseFloat(producto.utilidad)) + (parseFloat(producto.costo) + parseFloat(producto.impuestos))
            producto.impuestos = (producto.impuestos).toFixed(2)
            producto.precio_venta = (producto.precio_venta).toFixed(2)
        }
        await axios.put(`${URL}productos/${producto._id}`,producto)

    })
    nuevaVentana.webContents.send('avisoModificacion')
    
})

//probar imagenes 
ipcMain.on('traerImagen',async(e,args)=>{
    let path = await axios.get(`${URL}productos/imagenes/imagen`)
    path = path.data;
    e.reply("traerImagen",JSON.stringify(path))
})

//FIN PRODUCTOS


//INICIO CLIENTES

//traemos los clientes
ipcMain.on('get-clientes', async (e, args = "") => {
    let clientes
    args === "" && (args = "A Consumidor Final")
    clientes = await axios.get(`${URL}clientes/${args}`)
    clientes = clientes.data
    e.reply('get-clientes', JSON.stringify(clientes))
})

//traemos un cliente
ipcMain.handle('get-cliente', async (e, args) => {
    let cliente = await axios.get(`${URL}clientes/id/${args}`)
    cliente = cliente.data
    return JSON.stringify(cliente)
})

//Creamos un cliente
ipcMain.on('nuevo-cliente', async (e, args) => {
    const inicial = (args.cliente[0]).toUpperCase()
    let numero = await axios.get(`${URL}clientes/crearCliente/${inicial}`)
    args._id = numero.data
    await axios.post(`${URL}clientes`,args)
})

//Abrir ventana para modificar un cliente
ipcMain.on('abrir-ventana-modificar-cliente', (e, args) => {
    abrirVentana("modificar-cliente")
    const [idCliente,acceso] = args
    nuevaVentana.on('ready-to-show',async ()=>{
        let cliente = await axios.get(`${URL}clientes/id/${idCliente}`)
        cliente = cliente.data
        nuevaVentana.webContents.send('datos-clientes', JSON.stringify([cliente,acceso]))
    })
    nuevaVentana.setMenuBarVisibility(false)
})


//Modificamos el cliente
ipcMain.on('modificarCliente', async (e, args) => {
    await axios.put(`${URL}clientes/${args._id}`,args)
})

//elimanos un cliente
ipcMain.on('eliminar-cliente', async (e, args) => {
    await axios.delete(`${URL}clientes/${args}`)
})

//mandamos el cliente a emitir comprobante
ipcMain.on('mando-el-cliente', async (e, args) => {
    let cliente = await axios.get(`${URL}clientes/id/${args}`)
    cliente = cliente.data
    ventanaPrincipal.webContents.send('mando-el-cliente', JSON.stringify(cliente))
    ventanaPrincipal.focus()
})

//modificamos el saldo del cliente
ipcMain.on('modificarSaldo',async (e,arreglo)=>{
    const [id,tipoSaldo,nuevoSaldo] = arreglo
    let cliente = await axios.get(`${URL}clientes/id/${id}`);
    cliente = cliente.data;
    cliente[tipoSaldo] = nuevoSaldo.toFixed(2);
    await axios.put(`${URL}clientes/${id}`,cliente)
})

//Buscar Cliente por el cuit o dni
ipcMain.on('buscar-cliente',async (e,args)=>{
    let cliente = await axios.get(`${URL}clientes/cuit/${args}`)
    cliente = cliente.data
    e.reply('buscar-cliente',JSON.stringify(cliente))
})

//Mandamos el saldo CC a un cliente
ipcMain.on('sumarSaldoNegro', async (e, args) => {
    const [precio, id] = args
    let cliente = await axios.get(`${URL}clientes/id/${id}`)
    cliente = cliente.data;
    let saldo_p = (parseFloat(precio) + parseFloat(cliente.saldo_p)).toFixed(2)
    cliente.saldo_p = saldo_p
    await axios.put(`${URL}clientes/${id}`,cliente)
})

ipcMain.on('sumarSaldo',async (e,args)=>{
    const [precio,id] = args;

    let cliente = await axios.get(`${URL}clientes/id/${id}`)
    cliente = cliente.data;
    let saldo = (parseFloat(precio)+parseFloat(cliente.saldo)).toFixed(2)
    cliente.saldo = saldo;
    await axios.put(`${URL}clientes/${id}`,cliente)
})

ipcMain.on('borrarVentaACliente',async (e,args)=>{
    const [id,numero] = args;

    let cliente = await axios.get(`${URL}clientes/id/${id}`)
    cliente = cliente.data;
    let venta = await axios.get(`${URL}presupuesto/${numero}`)
    venta = venta.data[0]

    cliente.saldo_p = (parseFloat(cliente.saldo_p)-venta.precioFinal).toFixed(2);

    cliente.listaVentas = cliente.listaVentas.filter(num=>(numero!== num))

    await axios.put(`${URL}clientes/${id}`,cliente)
    console.log(numero)
    await axios.delete(`${URL}presupuesto/${numero}`)
})

//enviamos los clientes que tienen saldo
ipcMain.on('traerSaldo',async (e,args)=>{
     let clientes = await axios.get(`${URL}clientes`)
     clientes = clientes.data
     e.reply('traerSaldo',JSON.stringify(clientes))
})


ipcMain.on('abrir-ventana-clientesConSaldo',async(e,args)=>{
    abrirVentana("abrir-ventana-clientesConSaldo");
    nuevaVentana.on('ready-to-show',()=>{
        nuevaVentana.webContents.send('situacion',JSON.stringify(args))
    })
})

//FIN CLIENTES

//INICIO VENTAS

//tamanio de las ventas
ipcMain.handle('tamanioVentas',async(e,args)=>{
    let tamanio
    args === "presupuesto" ? tamanio = await axios.get(`${URL}presupuesto`)  : tamanio = await axios.get(`${URL}ventas`)
    tamanio = tamanio.data;
    return(JSON.stringify(parseFloat(tamanio) + 1))
})

//Obtenemos la venta
ipcMain.on('nueva-venta', async (e, args) => {
    let nuevaVenta;
    if (args.tipo_comp === "Presupuesto") {
       nuevaVenta = await axios.post(`${URL}presupuesto`,args)
    }else{
       nuevaVenta = await axios.post(`${URL}ventas`,args)
    }
    nuevaVenta = nuevaVenta.data
    let cliente 
    if (nuevaVenta.tipo_pago == "CC" || nuevaVenta.tipo_comp === "Recibos" || nuevaVenta.tipo_comp === "Recibos_P") {    
        const _id = nuevaVenta.cliente;
        cliente = await axios.get(`${URL}clientes/id/${_id}`);
        cliente = cliente.data;
        let listaVentas = cliente.listaVentas;
        listaVentas[0] === "" ? (listaVentas[0] = nuevaVenta.nro_comp) : (listaVentas.push(nuevaVenta.nro_comp));
        cliente.listaVentas = listaVentas;
        let clienteModificado = await axios.put(`${URL}clientes/${_id}`,cliente);
        clienteModificado = clienteModificado.data;
        e.reply('clienteModificado',JSON.stringify(clienteModificado))
    }else{
        e.reply('clienteModificado',JSON.stringify(cliente))
    }
})

ipcMain.on('imprimir-venta',async(e,args)=>{
    const [,,condicion,cantidad,tipo,name] = args;
    const options = {
        silent: condicion,
        copies: cantidad,
    };
    if(name !== undefined){
        options.deviceName = name
    }
    if (tipo === "Recibo") {
        abrirVentana("imprimir-recibo")
    }else if(tipo === "ticket-factura"){
        abrirVentana("imprimir-factura")
    }else{
        abrirVentana("imprimir-comprobante")
    }
    await imprimir(options,args)
})

const imprimir = (opciones,args)=>{
    nuevaVentana.webContents.on('did-finish-load', function() {
        nuevaVentana.webContents.send('imprimir',JSON.stringify(args))
            nuevaVentana.webContents.print(opciones,(success, errorType) => {
                    if (success) {
                        ventanaPrincipal.focus()
                        nuevaVentana.close();
                    }
              })
    });
}

//buscamos las ventas
ipcMain.handle('traerVentas' ,async (e,args)=>{
    const lista=[]
    for (const id of args) {
        let venta = await axios.get(`${URL}ventas/${id}`)
        venta = venta.data;
        if(venta.length !== 0){
            lista.push(venta[0])
        }else{
            let presupuesto = await axios.get(`${URL}presupuesto/${id}`)
            presupuesto = presupuesto.data;
            if (presupuesto.length !== 0) {
                lista.push(presupuesto[0])
            }
        }
    }
    return (JSON.stringify(lista))
})

//traer una venta en especifico
ipcMain.on('traerVenta',async (e,args)=>{
    let venta = await axios.get(`${URL}ventas/${args}`)
    venta = venta.data
    if (venta.length === 0) {
        venta = await axios.get(`${URL}presupuesto/${args}`);
        venta = venta.data;
    }

    e.reply('traerVenta',JSON.stringify(venta))
})

//Modificamos las ventas
ipcMain.on('modificamosLasVentas',async (e,arreglo)=>{
    for (let Venta of arreglo){
        const id = Venta._id
        const nro_comp = Venta.nro_comp
        const abonado = Venta.abonado
        const pagado = Venta.pagado
        let venta
        Venta.tipo_comp === "Presupuesto" ? venta = await axios.get(`${URL}presupuesto/${nro_comp}`) : venta = await axios.get(`${URL}ventas/${nro_comp}`)
        venta = venta.data[0];
        console.log(venta)
        venta.abonado = parseFloat(abonado).toFixed(2)
        venta.pagado = pagado
        venta.tipo_comp === "Presupuesto" ? await axios.put(`${URL}presupuesto/${id}`,venta)  : await axios.put(`${URL}ventas/${id}`,venta)
    }
})

//traer ventas que tengan el mismo id y esten entre fechas
ipcMain.on('traerVentasIdYFechas', async(e,args)=>{
    const ventas = args[0]
    const desde = args[1]
    const hasta = DateTime.fromISO(args[2]).endOf('day')
    const lista = await probar(ventas,desde,hasta)
    e.reply('traerVentasIdYFechas',JSON.stringify(lista))
})

const probar = async (listau,fecha1,fecha2)=>{
    const retornar = []
    for await (const Venta of listau){
        let ventaARetornar = await axios.get(`${URL}ventas/${Venta}/${fecha1}/${fecha2}`)
        ventaARetornar = ventaARetornar.data
        if (ventaARetornar.length === 0) {
            ventaARetornar = await axios.get(`${URL}presupuesto/${Venta}/${fecha1}/${fecha2}`);
            ventaARetornar = ventaARetornar.data
            console.log(ventaARetornar)
        }
        if(ventaARetornar[0] !== undefined){
            retornar.push(ventaARetornar[0])
    }
    }
    return retornar
}
    
//traerVentas entre las fechas
ipcMain.on('traerVentasEntreFechas',async(e,args)=>{
    const desde = new Date(args[0])
    let hasta = DateTime.fromISO(args[1]).endOf('day')
    let ventas = await axios.get(`${URL}ventas/${desde}/${hasta}`)
    ventas = ventas.data
    let presupuesto = await axios.get(`${URL}presupuesto/${desde}/${hasta}`)
    presupuesto = presupuesto.data;
    e.reply('traerVentasEntreFechas',JSON.stringify([...ventas,...presupuesto]))
})

//traerVentas entre fechas de un cliente
ipcMain.handle('traerVentasClienteEntreFechas',async(e,args)=>{
    let [cliente,desde,hasta] = args
    desde = new Date(desde)
    hasta = DateTime.fromISO(hasta).endOf('day')
    let ventas = await axios.get(`${URL}ventas/cliente/${cliente}/${desde}/${hasta}`)
    ventas = ventas.data;
    let presupuestos = await axios.get(`${URL}presupuesto/cliente/${cliente}/${desde}/${hasta}`);
    presupuestos = presupuestos.data
    return JSON.stringify([...ventas,...presupuestos])
})


//Mandamos la modificacion de la venta
ipcMain.on('ventaModificada',async (e,[args,id])=>{
     let venta = await axios.get(`${URL}ventas/${id}`)
     venta = venta.data[0]
     let saldoABorrar = venta.precioFinal
     venta.precioFinal = args.precioFinal;
     venta.productos = args.productos;
     //ipcRenderer.send('imprimir-venta',[venta,args.cliente,false,1])
     await axios.put(`${URL}ventas/${venta._id}`,venta)
    let cliente = await axios.get(`${URL}clientes/id/${args.cliente}`)
    cliente = cliente.data;
    let total = 0
    total = args.precioFinal
    total = (parseFloat(total) - parseFloat(saldoABorrar) + parseFloat(cliente.saldo_p)).toFixed(2)
    cliente.saldo_p = total
     await axios.put(`${URL}clientes/${args.cliente}`,cliente)
     e.reply('devolverVenta',JSON.stringify([venta,cliente]))
})

    ipcMain.on('abrir-ventana-emitir-comprobante',(e,args)=>{
        const[vendedor,numeroVenta,empresa] = args
        abrirVentana("emitirComrpobante")
        nuevaVentana.on('ready-to-show',async ()=>{
            nuevaVentana.webContents.send('venta',JSON.stringify([vendedor,numeroVenta,empresa]))
        })
    })


    ipcMain.on('eliminar-venta',async(e,id)=>{
    })
//FIN VENTAS

//INICIO FISCAL E ITEM

    ipcMain.on('fiscal', async(e,args)=>{
        await axios.put(`${URL}fiscal`,args)
    })

    ipcMain.on('item',async(e,args)=>{
        await axios.post(`${URL}item`,args)
    })

//FIN FISCAL  E ITEM

//INICIO NUMEROS

//mandamos el tipo de comprobante
ipcMain.on('mando-tipoCom', async (e, args) => {
    let numeros = await axios.get(`${URL}tipoVenta`)
    numeros=numeros.data
    e.reply('numeroComp', JSON.stringify(numeros[0][args]))
})

//Traer los numeros
ipcMain.handle('traerNumeros', async (e,args) => {
    let numeros = await axios.get(`${URL}tipoVenta`);
    numeros=numeros.data;
    return JSON.stringify(numeros[args])
})

//traemos los numeros actuales
ipcMain.on('recibir-numeros', async (e, args) => {
    let numeros = await axios.get(`${URL}tipoVenta`);
    numeros=numeros.data
    e.reply('numeros-enviados', JSON.stringify(numeros))
})

//Ver un numero en especials
ipcMain.on('vernumero', async (e, args) => {
    let numero = await axios.get(`${URL}tipoVenta`)
    numero = numero.data;
    e.reply('numeromandado', JSON.stringify(numero[args]))
})

//modificamos los numeros manualmente
ipcMain.on('enviar-numero', async (e, args) => {
    await axios.put(`${URL}tipoVenta`,args)
})

//modificamos los numeros
ipcMain.on('modificar-numeros',async(e,args)=>{
    [numero,tipo] = args
    let numeros = await axios.get(`${URL}tipoVenta`)
    numeros = numeros.data;
    numeros[tipo] = numero;
    await axios.put(`${URL}tipoventa`,numeros)
})

//llevar los dolares al crear un producto
ipcMain.on('traerDolar',async e=>{
    let numeros = await axios.get(`${URL}tipoVenta`)
    numeros = numeros.data
    const dolar = numeros.dolar
    e.reply('traerDolar',JSON.stringify(dolar))
})

//traemos un numero del Recibo En EMITIR RECIBO
ipcMain.handle('traerUltimoNumero',async(e,args)=>{
    let numero = await axios.get(`${URL}tipoVenta`)
    numero = numero.data["Ultimo Recibo"]
    return JSON.stringify(numero)
})

// //se modifica un numero de comrpobante
// ipcMain.on('modificar-nrocomp', async (e, args) => {
//     const numeros = await Numeros.find();
//     numeros[0][args[1]] = args[0]
//     await numeros[0].save()
// })


//FIN NUMEROS

//INICIO USUARIOS

//Traer Todos los usuarios
ipcMain.on('traerUsuarios', async (e, args) => {
    let usuarios = await axios.get(`${URL}usuarios`)
    usuarios = usuarios.data
    e.reply("traerUsuarios", JSON.stringify(usuarios))
})

ipcMain.on('agregarUsuario', async (e, args) => {
    const usuario = await axios.post(`${URL}usuarios`,args)
})

//traer un usuario
ipcMain.handle('traerUsuario',async(e,id)=>{
    let usuario = await axios.get(`${URL}usuarios/${id}`)
    usuario = usuario.data
    return JSON.stringify(usuario)
})

ipcMain.handle('modificarUsuario',async(e,args)=>{
    const a = await axios.put(`${URL}usuarios/${args._id}`,args)
    return JSON.stringify(a.data)
})

//FIN USUARIOS

//INICIO PEDIDOS

//Pedido
ipcMain.on('Pedido', async (e, args) => {
    const pedido = await axios.post(`${URL}pedidos`,args)
})

//Traer los pedidos a VerPedidos
ipcMain.on('traerpedidos', async (e, args) => {
    let pedidos = await axios.get(`${URL}pedidos`)
    pedidos = pedidos.data;
    e.reply('traerPedidos', JSON.stringify(pedidos))
})

//modificar un pedido
ipcMain.on('modificar-pedidos', async (e, args) => {
    for (let pedido of args) {
        await axios.put(`${URL}pedidos/${pedido._id}`,pedido)
    }
})

//Eliminar un pedido
ipcMain.on('eliminarPedido', async (e, id) => {
    await axios.delete(`${URL}pedidos/${id}`)
})

//FIN DE PEDIDOS





//Abrir ventana para modificar un producto
ipcMain.on('abrir-ventana-modificar-producto',  (e, args) => {
    const [id,acceso,texto,seleccion] = args
    abrirVentana('abrir-ventana-modificar-producto')
    nuevaVentana.on('ready-to-show',async ()=>{
        let Producto = await axios.get(`${URL}productos/${id}`)
        Producto = Producto.data
    nuevaVentana.webContents.send('datos-productos', JSON.stringify(Producto))
    nuevaVentana.webContents.send('acceso', JSON.stringify(acceso))
    })
    nuevaVentana.on('close', async()=> {
        await ventanaPrincipal.reload()
        ventanaPrincipal.once('ready-to-show',async ()=>{
        ventanaPrincipal.webContents.send("Historial",JSON.stringify([texto,seleccion]))
        })
        
        nuevaVentana = null
    })
})


//abrir ventana agregar producto
ipcMain.on('abrir-ventana-agregar-producto',async(e,args)=>{
    abrirVentana('agregarProducto')
})


//INICIO MOVIMIENTO DE PRODUCTOS

//Abrir ventana de movimiento de producto
ipcMain.on('abrir-ventana-movimiento-producto',async (e,arreglo)=>{
    const [id,vendedor] = arreglo
    abrirVentana('movProducto')
    let producto = await axios.get(`${URL}productos/${id}`);
    producto = producto.data
    nuevaVentana.on('ready-to-show',()=>{
        nuevaVentana.webContents.send('movimiento-producto-abrir',(JSON.stringify([producto,vendedor])) )
    })
})

//llevamos el tamanio de la bd de Mov Producto
ipcMain.handle('traerTamanioMovProductos',async()=>{
    const tamanio = await axios.get(`${URL}movProductos`)
    return (tamanio.data)
})

//Cargar Movimiento producto
ipcMain.on('movimiento-producto',async (e,args) => {
    const movimiento = await axios.post(`${URL}movProductos`,args)
})


//Abiri ventana de Informacion de producto
ipcMain.on('abrir-ventana-info-movimiento-producto',async (e,args)=>{
    abrirVentana('info-movProducto')
//informacion de movimiento de producto
    nuevaVentana.on('ready-to-show',async()=>{
        let producto = await axios.get(`${URL}movProductos/${args}`)
        producto = producto.data
        nuevaVentana.webContents.send('datos-movimiento-producto',JSON.stringify(producto))
    })
})

//FIN MOVIMIENTO DE PRODUCTOS

//INICIO CANCELADOS

//retornamos el tamanio de la bd de Cancelados
ipcMain.handle('tamanioCancelado',async(e,args)=>{
    let tamanio = await axios.get(`${URL}cancelados/tamanio`)
    tamanio = tamanio.data
    return tamanio
})

//guardamos los cancelados en la base de datos
ipcMain.on('ventaCancelada',async(e,args)=>{
    const ventaCancelada = await axios.post(`${URL}cancelados`,args)
})

//traemos Ventas canceladas entre fechas
ipcMain.on('traerVentasCanceladas',async(e,args)=>{
    const desde = new Date(args[0])
    let hasta = DateTime.fromISO(args[1]).endOf('day')
    let ventasCanceladas = await axios.get(`${URL}cancelados/${desde}/${hasta}`)
    ventasCanceladas = ventasCanceladas.data
    e.reply('traerVentasCanceladas',JSON.stringify(ventasCanceladas))
})
//FIN CANCELADOS

//menu
const templateMenu = [
    {
        label: 'Convertir excel',
        submenu: [{
            label: 'Pedidos',
            click() {
                descargas();
            }
        },
        {
            label: 'Ventas',
            click() {
                descargas()
            }
        }]
    },
    {
        label: "h",
        submenu: [
            {
                label: 'Show/Hide Dev Tools',
                accelerator: process.platform == 'darwin' ? 'Comand+D' : 'Ctrl+D',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            }
        ]
    },
    // {
    //     label: "Emitir Nota De Credito",
    //     click(){
    //         abrirVentana("EmitirNotaCredito")
    //     }
    // },
    {
        label: "Datos",
        submenu: [
            {
                label: "Clientes",
                submenu:[
                    {
                        label:"Listado Saldo",
                        click(){
                            abrirVentana("listadoSaldo")
                        }
                    },
                ]
            },
            {
                label: "Productos",
                submenu:[
                    
                    {
                        label:"Listado de Stock",
                        click(){
                            abrirVentana("listadoStock")
                        }
                    },
                    {
                        label: "Cambio de codigo",
                        click(){
                            abrirVentana("cambioCodigo")
                        }
                    },{
                        label: "Aum porcentaje",
                        click(){
                            abrirVentana("AumentoPorPorcentaje");
                            nuevaVentana.on('ready-to-show',async()=>{
                                const marcas = await axios(`${URL}productos`)
                                nuevaVentana.webContents.send("mandarMarcas",JSON.stringify(marcas.data))
                            })
                        }
                    }
                ]
            },
            {
                label: "Numeros",
                click(){
                    abrirVentana("numeros")
                }
            },{
                label: "Vendedores",
                click(){
                    validarUsuario("ValidarUsuario")
                }
            }
        ]
    },
    {
        label: "Listado",
        submenu:[
            {
                label: "PorComprobante",
                click(){
                    abrirVentana("porComprobante")
                }
            },
            {
                label: "Presupuesto",
                click(){
                    abrirVentana("presupuesto")
                }
            },
            {
                label: "Buscar Venta",
                click(){
                    abrirVentana("buscarVenta")
                }
            },
            {
                label: "Stock Negativo",
                click(){
                    abrirVentana("stockNegativo")
                }
            },
            {
                label: "Libro Ventas",
                click(){
                    abrirVentana("libroVentas")
                }
            }
        ]
    },
    {
        label: "Utilidad",
        submenu:[
            {
                label:"Gerencial",
                click(){
                    abrirVentana("gerencial")
                }
            }
        ]
    },
    {
        label: `${conexion}`,
        click(){
            if (a === 2) {
                tipoConexion = `a=1;module.exports = a`;
                fs.writeFile(__dirname + '/config.js',tipoConexion,()=>{
                    app.relaunch();
                    app.exit(0);
                })
            }else{
                tipoConexion = `a=2;module.exports = a`;
                fs.writeFile(__dirname + '/config.js',tipoConexion,()=>{
                    app.relaunch();
                    app.exit(0);
                })
            }
        }
    }//,{
    //     label: "Resumenes de cuentas",
    //     async click(){
    //         let clientes = await axios.get(`${URL}clientes`)
    //         clientes = clientes.data
    //         clientes.forEach(async cliente =>{
    //             abrirVentana("resumenCuenta")
    //             await nuevaVentana.on('ready-to-show',()=>{
    //                 nuevaVentana.webContents.send('datosAImprimir',JSON.stringify(cliente))
    //             })
    //             // await imprimir(options,args)
    //         })
    //     }
    // }
]

//AbrirVentanaParaBuscarUnCliente
ipcMain.on('abrir-ventana', (e, args) => {
      abrirVentana(args)
})


//Para abrir todas las ventanas
function abrirVentana(texto,numeroVenta){
    if (texto === "resumenCuenta") {
        nuevaVentana = new BrowserWindow({
            parent:ventanaPrincipal,
            width: 800,
            height: 500,
            parent:ventanaPrincipal,
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true
            }
        })
        nuevaVentana.loadURL(url.format({
            pathname: path.join(__dirname, `resumenCuenta/resumenCuenta.html`),
            protocol: 'file',
            slashes: true
        }));
        nuevaVentana.setMenuBarVisibility(false)
        nuevaVentana.on('close', function (event) {
            nuevaVentana = null
        })
    }else if(texto === "abrir-ventana-clientesConSaldo"){
        nuevaVentana = new BrowserWindow({
            width: 1200,
            height: 500,
            parent:ventanaPrincipal,
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true
            }
        })
        nuevaVentana.loadURL(url.format({

            pathname: path.join(__dirname, `resumenCuenta/clientes.html`),
            protocol: 'file',
            slashes: true
        }));
        //nuevaVentana.setMenuBarVisibility(false)
        nuevaVentana.on('close', function (event) {
            nuevaVentana = null
        })
    }else if(texto==="movProducto"){
        nuevaVentana = new BrowserWindow({
            width: 800,
            height: 500,
            parent:ventanaPrincipal,
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true
            }
        })
        nuevaVentana.loadURL(url.format({

            pathname: path.join(__dirname, `movProductos/movProductos.html`),
            protocol: 'file',
            slashes: true
        }));
        nuevaVentana.setMenuBarVisibility(false)
        nuevaVentana.on('close', function (event) {
            nuevaVentana = null
        })
    }else if(texto === "imprimir-comprobante"){
            nuevaVentana = new BrowserWindow({
                parent:ventanaPrincipal,
                width: 1000,
                height: 500,
                webPreferences: {
                    contextIsolation: false,
                    nodeIntegration: true
                }
            })
            nuevaVentana.loadURL(url.format({
                pathname: path.join(__dirname, `emitirComprobante/imprimir.html`),
                protocol: 'file',
                slashes: true
            }));
            nuevaVentana.on('close', ()=> {
                nuevaVentana = null
            })
            nuevaVentana.setMenuBarVisibility(false)
        }else if(texto === "imprimir-factura"){
            nuevaVentana = new BrowserWindow({
                
                width: 1000,
                height: 500,
                webPreferences: {
                    contextIsolation: false,
                    nodeIntegration: true
                }
            })
            nuevaVentana.loadURL(url.format({
                pathname: path.join(__dirname, `emitirComprobante/imprimirTicket.html`),
                protocol: 'file',
                slashes: true
            }));
            nuevaVentana.on('close', ()=> {
                nuevaVentana = null
            })
            nuevaVentana.setMenuBarVisibility(false);
        }else if(texto === "imprimir-recibo"){
            nuevaVentana = new BrowserWindow({
                parent:ventanaPrincipal,
                width: 1000,
                height: 500,
                webPreferences: {
                    contextIsolation: false,
                    nodeIntegration: true
                }
            })
            nuevaVentana.loadURL(url.format({
                pathname: path.join(__dirname, `emitirRecibo/imprimirRecibo.html`),
                protocol: 'file',
                slashes: true
            }));
            nuevaVentana.on('close', ()=> {
                nuevaVentana = null
            })
            nuevaVentana.setMenuBarVisibility(false)
    }else if(texto === "info-movProducto"){
        nuevaVentana = new BrowserWindow({
            parent:ventanaPrincipal,
            width: 1000,
            height: 500,
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true
            }
        })
        nuevaVentana.on('close', ()=> {
            ventanaPrincipal.reload()
            nuevaVentana = null
        })
        nuevaVentana.setMenuBarVisibility(false)

        nuevaVentana.loadURL(url.format({
            pathname: path.join(__dirname, `movProductos/infoMovProductos.html`),
            protocol: 'file',
            slashes: true
        }));

         nuevaVentana.on('close', function (event) {
             ventanaPrincipal.reload()
             nuevaVentana = null
         })
    }else if(texto === "modificar-cliente"){
        nuevaVentana = new BrowserWindow({
            width: 1100,
            height: 450,
            parent:ventanaPrincipal,
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true
            }
        })
        nuevaVentana.loadURL(url.format({
            pathname: path.join(__dirname, `clientes/modificarCliente.html`),
            protocol: 'file',
            slashes: true
        }));
        nuevaVentana.on('close', function (event) {
            nuevaVentana= null
            ventanaPrincipal.reload();
        })
    }else if(texto === "clientes"){
        nuevaVentana = new BrowserWindow({
            parent:ventanaPrincipal,
            width: 1000,
            height: 600,
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true
            }
        })

        nuevaVentana.loadURL(url.format({
            pathname: path.join(__dirname, `emitirComprobante/clientes.html`),
            protocol: 'file',
            slashes: true
        }));
        nuevaVentana.setMenuBarVisibility(false)
        nuevaVentana.on('close', function (event) {
            nuevaVentana = null
        })
    }else if(texto === "productos"){
        nuevaVentana = new BrowserWindow({
            parent:ventanaPrincipal,
            width: 1200,
            height: 600,
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true
            }
        })

        nuevaVentana.loadURL(url.format({
            pathname: path.join(__dirname, `emitirComprobante/productos.html`),
            protocol: 'file',
            slashes: true
        }));

        nuevaVentana.on('close', function (event) {
            nuevaVentana= null
        })
        nuevaVentana.setMenuBarVisibility(false)
    }else if(texto === "numeros"){
        nuevaVentana = new BrowserWindow({
            parent:ventanaPrincipal,
            width: 500,
            height: 1000,
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true
            }
        })
        nuevaVentana.loadURL(url.format({
            pathname: path.join(__dirname, `${texto}/${texto}.html`),
            protocol: 'file',
            slashes: true
        }));
        nuevaVentana.setMenuBarVisibility(false)
    }else if(texto === "abrir-ventana-modificar-producto"){
        nuevaVentana = new BrowserWindow({
            parent:ventanaPrincipal,
            width: 1000,
            height: 600,
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true
            }
        })
        nuevaVentana.loadURL(url.format({
            pathname: path.join(__dirname, 'productos/modificarProducto.html'),
            protocol: 'file',
            slashes: true
        }));
        nuevaVentana.setMenuBarVisibility(false)
    }else if(texto.includes("usuarios")){
        const a = texto.split('?')[1];
        nuevaVentana = new BrowserWindow({
            width: 500,
            parent:ventanaPrincipal,
            height: 450,
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true
            }
        })
        nuevaVentana.loadURL(url.format({
            pathname: path.join(__dirname, `usuarios/usuarios.html`),
            protocol: 'file',
            slashes: true
        }));
        nuevaVentana.setMenuBarVisibility(false)
        nuevaVentana.on('close',e=>{
            nuevaVentana = null
        })
        nuevaVentana.on('ready-to-show',()=>{
            nuevaVentana.webContents.send('acceso',JSON.stringify(a))
        })
    }else if(texto === "listadoSaldo"){
        nuevaVentana = new BrowserWindow({
            parent:ventanaPrincipal,
            width: 1000,
            height: 900,
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true
            }
        })
        nuevaVentana.loadURL(url.format({
            pathname: path.join(__dirname, 'clientes/listadoSaldo.html'),
            protocol: 'file',
            slashes: true
        }));
        nuevaVentana.setMenuBarVisibility(false)
        nuevaVentana.on('close',e=>{
            nuevaVentana = null
        })
    }else if(texto === "listadoStock"){
        nuevaVentana = new BrowserWindow({
            parent:ventanaPrincipal,
            width: 1000,
            height: 900,
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true
            }
        })
        nuevaVentana.loadURL(url.format({
            pathname: path.join(__dirname, 'productos/listadoStock.html'),
            protocol: 'file',
            slashes: true
        }));
        nuevaVentana.setMenuBarVisibility(false)
        nuevaVentana.on('close',e=>{
            nuevaVentana = null
        })
    }else if(texto==="cambioCodigo"){
        nuevaVentana = new BrowserWindow({
            width: 400,
            parent:ventanaPrincipal,
            height: 300,
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true
            }
        })
        nuevaVentana.loadURL(url.format({
            pathname: path.join(__dirname, 'productos/cambioCodigo.html'),
            protocol: 'file',
            slashes: true
        }));
        nuevaVentana.setMenuBarVisibility(false)
        nuevaVentana.on('close',e=>{
            nuevaVentana = null
        })
    }else if(texto === "porComprobante"){
        nuevaVentana = new BrowserWindow({
            parent:ventanaPrincipal,
            width: 1200,
            height: 1000,
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true
            }
        })
        nuevaVentana.loadURL(url.format({
            pathname: path.join(__dirname, 'listados/porComrpobante.html'),
            protocol: 'file',
            slashes: true
        }));
        nuevaVentana.setMenuBarVisibility(false)
        nuevaVentana.on('close',e=>{
            nuevaVentana = null
        })
    }else if(texto === "presupuesto"){
        nuevaVentana = new BrowserWindow({
            parent:ventanaPrincipal,
            width: 1200,
            height: 1000,
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true
            }
        })
        nuevaVentana.loadURL(url.format({
            pathname: path.join(__dirname, 'listados/presupuestos.html'),
            protocol: 'file',
            slashes: true
        }));
        nuevaVentana.setMenuBarVisibility(false)
        nuevaVentana.on('close',e=>{
            nuevaVentana = null
        })
    }else if(texto === "stockNegativo"){
        nuevaVentana = new BrowserWindow({
            parent:ventanaPrincipal,
            width: 1200,
            height: 1000,
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true
            }
        })
        nuevaVentana.loadURL(url.format({
            pathname: path.join(__dirname, 'listados/stockNegativo.html'),
            protocol: 'file',
            slashes: true
        }));
        nuevaVentana.setMenuBarVisibility(false)
        nuevaVentana.on('close',e=>{
            nuevaVentana = null
        })  
    }else if(texto === "buscarVenta"){
        nuevaVentana = new BrowserWindow({
            parent:ventanaPrincipal,
            width: 1200,
            height: 1000,
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true
            }
        })
        nuevaVentana.loadURL(url.format({
            pathname: path.join(__dirname, 'listados/buscarVentas.html'),
            protocol: 'file',
            slashes: true
        }));
        nuevaVentana.setMenuBarVisibility(false)
        nuevaVentana.on('close',e=>{
            nuevaVentana = null
        }) 
    }else if(texto === "gerencial"){
        nuevaVentana = new BrowserWindow({
            parent:ventanaPrincipal,
            width: 1200,
            height: 1000,
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true
            }
        })
        nuevaVentana.loadURL(url.format({
            pathname: path.join(__dirname, 'utilidad/gerencial.html'),
            protocol: 'file',
            slashes: true
        }));
        nuevaVentana.setMenuBarVisibility(false)
        nuevaVentana.on('close',e=>{
            nuevaVentana = null
        })
    }else if(texto === "agregarCliente"){
        nuevaVentana = new BrowserWindow({
            parent:ventanaPrincipal,
            width: 1100,
            height: 500,
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true
            }
        })
        nuevaVentana.loadURL(url.format({
            pathname: path.join(__dirname, 'clientes/agregarCliente.html'),
            protocol: 'file',
            slashes: true
        }));
        nuevaVentana.setMenuBarVisibility(false)
        nuevaVentana.on('close',e=>{
            nuevaVentana = null;    
            ventanaPrincipal.reload()
        })  
    }else if(texto === "agregarProducto"){
        nuevaVentana = new BrowserWindow({
            parent:ventanaPrincipal,
            width: 1100,
            height: 500,
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true
            }
        })
        nuevaVentana.loadURL(url.format({
            pathname: path.join(__dirname, 'productos/agregarProducto.html'),
            protocol: 'file',
            slashes: true
        }));
        nuevaVentana.setMenuBarVisibility(false)
        nuevaVentana.on('close',e=>{
            nuevaVentana = null;
            ventanaPrincipal.reload()
        })  
    }else if(texto === "emitirComrpobante"){
        nuevaVentana = new BrowserWindow({
            parent:ventanaPrincipal,
            width: 1100,
            height: 500,
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true
            }
        })
        nuevaVentana.loadURL(url.format({
            pathname: path.join(__dirname, `emitirComprobante/emitirComprobante.html`),
            protocol: 'file',
            slashes: true
        }));
        nuevaVentana.setMenuBarVisibility(false)
        nuevaVentana.on('close',e=>{
            nuevaVentana = null;
            ventanaPrincipal.reload()
        })  
    }else if(texto === "libroVentas"){
        nuevaVentana = new BrowserWindow({
            parent:ventanaPrincipal,
            width: 1100,
            height: 500,
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true
            }
        })
        nuevaVentana.loadURL(url.format({
            pathname: path.join(__dirname, `libroVentas/libroVentas.html`),
            protocol: 'file',
            slashes: true
        }));
        nuevaVentana.setMenuBarVisibility(false)
        nuevaVentana.on('close',e=>{
            nuevaVentana = null;
            ventanaPrincipal.reload()
        })  
    }else if(texto === "AumentoPorPorcentaje"){

        nuevaVentana = new BrowserWindow({
            parent:ventanaPrincipal,
            width: 600,
            height: 200,
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true
            }
        })
        nuevaVentana.loadURL(url.format({
            pathname: path.join(__dirname, `./productos/aumPorcentaje.html`),
            protocol: 'file',
            slashes: true
        }));
        nuevaVentana.setMenuBarVisibility(false)
        nuevaVentana.on('close',e=>{
            nuevaVentana = null;
            ventanaPrincipal.reload()
        })
    }
}

async function descargas() {
    pedidos((await axios.get(`${URL}pedidos`)).data)
    ventas((await axios.get(`${URL}ventas`)).data)
}
const validarUsuario = (texto)=>{
    ventanaPrincipal.webContents.send('validarUsuario',JSON.stringify(texto))
}


//Menu de navegacion
const mainMenu = Menu.buildFromTemplate(templateMenu)

Menu.setApplicationMenu(mainMenu)
module.exports = { crearVentanaPrincipal }


