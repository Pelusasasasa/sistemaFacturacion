 const URL = "http://192.168.0.123:4000/api/";
//const URL = "http://179.62.24.12/api/";

const axios = require("axios")
const path = require('path');
const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const { DateTime } = require("luxon");
const url = require('url')
const [pedidos, ventas] = require('./descargas/descargas')


if (process.env.NODE_ENV !== 'production') {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
    })
};
global.nuevaVentana = null;
global.nuevaVentana2 = null;
global.ventanaPrincipal = null
function crearVentanaPrincipal() {
    ventanaPrincipal = new BrowserWindow({  
        //width: 7000,
        //height: 7000,
        icon: path.join(__dirname,'./imagenes/electro.ico'),
        fullscreen: false,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true
        }
    });
    ventanaPrincipal.loadFile('src/index.html')
    ventanaPrincipal.maximize()
}

//abrir ventana agregar cliente
ipcMain.on('abrir-ventana-agregar-cliente',e=>{
    abrirVentana('agregarCliente')
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
        productos = await axios.get(`${URL}productos/${texto}/${condicion}`)
    }else{
        productos = await axios.get(`${URL}productos/textoVacio/descripcion`)
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
    let productos = await axios.get(`${URL}productos/textoVacio/dolar`)
    let dolar = await axios.get(`${URL}tipoVenta`);
    dolar = dolar.data.dolar
    productos = productos.data;

    productos.forEach(producto => {
        (producto.precio_venta) = (parseFloat(producto.utilidad)+(dolar*(parseFloat(producto.impuestos) + parseFloat(producto.costodolar)))).toFixed(2);
    });
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
    nuevaVentana.on('ready-to-show',async ()=>{
        let cliente = await axios.get(`${URL}clientes/id/${args}`)
        cliente = cliente.data
        nuevaVentana.webContents.send('datos-clientes', JSON.stringify(cliente))
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
    cliente[tipoSaldo] = nuevoSaldo;
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
    let venta = await axios.get(`${URL}ventas/${numero}`)
    venta = venta.data[0]
    cliente.saldo_p = (parseFloat(cliente.saldo_p)-venta.precioFinal).toFixed(2);
    cliente.listaVentas = cliente.listaVentas.filter(num=>(numero!== num))
    await axios.put(`${URL}clientes/${id}`,cliente)
    await axios.delete(`${URL}ventas/${numero}`)
})

//enviamos los clientes que tienen saldo
ipcMain.on('traerSaldo',async (e,args)=>{
     let clientes = await axios.get(`${URL}clientes`)
     clientes = clientes.data
     e.reply('traerSaldo',JSON.stringify(clientes))
})

//FIN CLIENTES

//INICIO VENTAS

//tamanio de las ventas
ipcMain.handle('tamanioVentas',async(e,args)=>{
    let tamanio = await axios.get(`${URL}ventas`)
    tamanio = tamanio.data;
    return(JSON.stringify(tamanio))
})

//Obtenemos la venta
ipcMain.on('nueva-venta', async (e, args) => {
    let nuevaVenta = await axios.post(`${URL}ventas`,args)
    nuevaVenta = nuevaVenta.data
    const _id = nuevaVenta.cliente
    let cliente = await axios.get(`${URL}clientes/id/${_id}`)
    cliente = cliente.data
    let listaVentas = cliente.listaVentas
    listaVentas[0] === "" ? (listaVentas[0] = nuevaVenta.nro_comp) : (listaVentas.push(nuevaVenta.nro_comp))
    cliente.listaVentas = listaVentas;
    await axios.put(`${URL}clientes/${_id}`,cliente)
})

ipcMain.on('imprimir-venta',async(e,args)=>{
    const [venta,cliente,condicion,tipo] = args;
    const options = {
        silent: condicion,
        copies:tipo,
    };

    (tipo === "Recibo") ? abrirVentana("imprimir-recibo") : abrirVentana("imprimir-comprobante");

    const a = await imprimir(options,args)
    if (tipo === 2) {
        //imprimir(options,args)
    }
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
        }
    }
    return (JSON.stringify(lista))
})

//traer una venta en especifico
ipcMain.on('traerVenta',async (e,args)=>{
    let venta = await axios.get(`${URL}ventas/${args}`)
    venta = venta.data

    e.reply('traerVenta',JSON.stringify(venta))
})

//Modificamos las ventas
ipcMain.on('modificamosLasVentas',async (e,arreglo)=>{
    for (let Venta of arreglo){
        const id = Venta.nro_comp
        const abonado = Venta.abonado
        const pagado = Venta.pagado
        let venta = await axios.get(`${URL}ventas/${id}`)
        venta = venta.data[0];
        venta.abonado = parseFloat(abonado).toFixed(2)
        venta.pagado = pagado
        await axios.put(`${URL}ventas/${id}`,venta)
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
    e.reply('traerVentasEntreFechas',JSON.stringify(ventas))
})


//Mandamos la modificacion de la venta
ipcMain.on('ventaModificada',async (e,[args,id,saldo])=>{
     let venta = await axios.get(`${URL}ventas/${id}`)
     venta = venta.data[0]
     venta.precioFinal = args.precioFinal;
     venta.productos = args.productos;
     await axios.put(`${URL}ventas/${id}`,venta)
    let cliente = await axios.get(`${URL}clientes/id/${args.cliente}`)
    cliente = cliente.data
    let total = 0
    total = args.precioFinal
   
    total = (parseFloat(total) - parseFloat(saldo) + parseFloat(cliente.saldo_p)).toFixed(2)
    cliente.saldo_p = total

     await axios.put(`${URL}clientes/${args.cliente}`,cliente)
})

    ipcMain.on('abrir-ventana-emitir-comprobante',(e,args)=>{
        const[vendedor,numeroVenta] = args
        abrirVentana("emitirComrpobante")
        nuevaVentana.on('ready-to-show',async ()=>{
            nuevaVentana.webContents.send('venta',JSON.stringify([vendedor,numeroVenta]))
        })
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
    const [id,acceso] = args
    abrirVentana('abrir-ventana-modificar-producto')
    nuevaVentana.on('ready-to-show',async ()=>{
        let Producto = await axios.get(`${URL}productos/${id}`)
        Producto = Producto.data
    nuevaVentana.webContents.send('datos-productos', JSON.stringify(Producto))
    nuevaVentana.webContents.send('acceso', JSON.stringify(acceso))
    })
    nuevaVentana.on('close', ()=> {
        ventanaPrincipal.reload()
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
    ipcMain.handle('movimiento-producto-abrir',async e =>{
        let producto = await axios.get(`${URL}productos/${id}`);
        producto = producto.data
        return (JSON.stringify([producto,vendedor]))
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
    {
        label: "Emitir Nota De Credito",
        click(){
            abrirVentana("EmitirNotaCredito")
        }
    },
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
                    {
                        label:"Resumen de Cuent",
                        click(){
                        }
                    }
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
                    abrirVentana("usuarios")
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
    }
]

//AbrirVentanaParaBuscarUnCliente
ipcMain.on('abrir-ventana', (e, args) => {
    if (args === "numeros") {
      abrirVentana(args)
    } else {
       abrirVentana(args);
    }
})


//Para abrir todas las ventanas
function abrirVentana(texto,numeroVenta){
    if(texto==="movProducto"){
        nuevaVentana = new BrowserWindow({
            width: 800,
            height: 500,
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
    }else if(texto === "usuarios"){
        nuevaVentana = new BrowserWindow({
            width: 500,
            height: 450,
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true
            }
        })
        nuevaVentana.loadURL(url.format({
            pathname: path.join(__dirname, 'usuarios/usuarios.html'),
            protocol: 'file',
            slashes: true
        }));
        nuevaVentana.setMenuBarVisibility(false)
        nuevaVentana.on('close',e=>{
            nuevaVentana = null
        })
    }else if(texto === "listadoSaldo"){
        nuevaVentana = new BrowserWindow({
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
            // width: 1100,
            // height: 500,
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true
            }
        })
        nuevaVentana.maximize()
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
    }
}

async function descargas() {
    pedidos((await axios.get(`${URL}pedidos`)).data)
    ventas((await axios.get(`${URL}ventas`)).data)
}


//Menu de navegacion
const mainMenu = Menu.buildFromTemplate(templateMenu)

Menu.setApplicationMenu(mainMenu)
module.exports = { crearVentanaPrincipal }


