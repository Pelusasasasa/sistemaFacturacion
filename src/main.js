const URL = "http://192.168.1.116:4000/api/";

const axios = require("axios")
const path = require('path');
const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const { DateTime } = require("luxon");
const url = require('url')
const [pedidos, ventas] = require('./descargas/descargas')

//Obtenemos los objetos de la base de datos
const Clientes = require('./models/cliente')
const Productos = require('./models/producto')
const Ventas = require('./models/venta')
const Numeros = require('./models/tipoVenta');
const movProducto = require('./models/movProducto');
const Cancelados = require('./models/cancelados')


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
        width: 7000,
        height: 7000,
        fullscreen: false,
        webPreferences: {
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
    console.log(nuevoProducto)
    await axios.delete(`${URL}productos/${idViejo}`)
    console.log("A")
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
    console.log(producto)
    await axios.put(`${URL}productos/${id}`,producto)
})

//mandamos el precio del producto
ipcMain.on('traerPrecio',async(e,id)=>{
    let producto = await axios.get(`${URL}/productos/${id}`)
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
    await axios.put(`${URL}pedidos/${id}`,producto)
})

//FIN PRODUCTOS


//CLIENTES

//traemos los clientes
ipcMain.on('get-clientes', async (e, args = "") => {
    let clientes
    clientes = await axios.get(`${URL}clientes/${args}`)
    clientes = clientes.data
    e.reply('get-clientes', JSON.stringify(clientes))
})

//traemos un cliente
ipcMain.handle('get-cliente', async (e, args) => {
    let cliente = await axios.get(`${URL}clientes/${args}`)
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

//FIN CLIENTES

//mandamos el producto a emitir comprobante
ipcMain.on('mando-el-producto', async (e, args) => {
    console.log(args)
    let producto = await axios.get(`${URL}productos/${args._id}`);
    producto = producto.data
    console.log(producto)
    ventanaPrincipal.webContents.send('mando-el-producto', JSON.stringify({
        producto: producto,
        cantidad: args.cantidad
    }))
})

//Mandamos la modificacion de la venta
ipcMain.on('ventaModificada',async (e,[args,id,saldo])=>{
     await Ventas.updateOne({_id:args._id},{
        $set:{
                 precioFinal: args.precioFinal,
                 productos: args.productos
             }
     })
     console.log(saldo)
    const cliente = await Clientes.find({_id:args.cliente})
    let total = 0
    total = args.precioFinal
    total = (parseFloat(total) - parseFloat(saldo) + parseFloat(cliente[0].saldo_p)).toFixed(2)
     await Clientes.updateOne({_id:args.cliente},{
         $set:{
             saldo_p: total
         }
     })

})


//INICIO NUMEROS

//mandamos el tipo de comprobante
ipcMain.on('mando-tipoCom', async (e, args) => {
    let numeros = await axios.get(`${URL}/tipoVenta`)
    numeros=numeros.data
    console.log(numeros)
    e.reply('numeroComp', JSON.stringify(numeros[0][args]))
})

//Traer los numeros
ipcMain.on('traerNumeros', async (e,args) => {
    let numeros = await axios.get(`${URL}tipoVenta`);
    numeros=numeros.data;
    e.reply('traerNumeros', JSON.stringify(numeros[args]));
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

//FIN NUMEROS
ipcMain.on('modificar-nrocomp', async (e, args) => {
    const numeros = await Numeros.find();
    numeros[0][args[1]] = args[0]
    await numeros[0].save()
})

//INICIO USUARIOS

//Traer Todos los usuarios
ipcMain.on('traerUsuarios', async (e, args) => {
    let usuarios = await axios.get(`${URL}usuarios`)
    usuarios = usuarios.data
    e.reply("traerUsuarios", JSON.stringify(usuarios))
})

ipcMain.on('agregarUsuario', async (e, args) => {
    const res = await axios.post(`${URL}usuarios`,args)
    console.log(res.data)
})

//traer un usuario
ipcMain.handle('traerUsuario',async(e,id)=>{
    let usuario = await axios.get(`${URL}usuarios/${id}`)
    usuario = usuario.data
    return JSON.stringify(usuario)
})


//FIN USUARIOS

//INICIO PEDIDOS

//Pedido
ipcMain.on('Pedido', async (e, args) => {
    const pedido = await axios.post(`${URL}pedidos`,args)
    console.log(pedido.data)
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




//modificamos el saldo del cliente
ipcMain.on('modificarSaldo',async (e,arreglo)=>{
    const id = arreglo[0]
    const tipoSaldo = arreglo[1]
    const nuevoSaldo = arreglo[2]
    await Clientes.updateOne({_id:id},{$set: {[tipoSaldo]: nuevoSaldo}})
})

//llevar los dolares al crear un producto
ipcMain.on('traerDolar',async e=>{
    const numeros = await Numeros.find()
    const dolar = numeros[0].dolar
    e.reply('traerDolar',JSON.stringify(dolar))
})

//Abrir ventana para modificar un producto
ipcMain.on('abrir-ventana-modificar-producto',  (e, args) => {

    abrirVentana('abrir-ventana-modificar-producto')
    nuevaVentana.on('ready-to-show',async ()=>{
        console.log(args)
        let Producto = await axios.get(`${URL}productos/${args}`)
        Producto = Producto.data
        console.log(Producto)
    nuevaVentana.webContents.send('datos-productos', JSON.stringify(Producto))
    })
    nuevaVentana.on('close', ()=> {
        ventanaPrincipal.reload()
        nuevaVentana = null
    })
})

//Abiri ventana de Informacion de producto
ipcMain.on('abrir-ventana-info-movimiento-producto',async (e,args)=>{
    abrirVentana('info-movProducto')
//informacion de movimiento de producto
    nuevaVentana.on('ready-to-show',async()=>{
    // const producto = axios.get(`${URL}productos/${}`)
    nuevaVentana.webContents.send('datos-movimiento-producto',JSON.stringify(producto))
})

})

//abrir ventana agregar producto
ipcMain.on('abrir-ventana-agregar-producto',async(e,args)=>{
    abrirVentana('agregarProducto')
})

//Abrir ventana de movimiento de producto
ipcMain.on('abrir-ventana-movimiento-producto',async (e,arreglo)=>{
    const [id,vendedor] = arreglo
    console.log(arreglo)
    abrirVentana('movProducto')
    ipcMain.handle('movimiento-producto',async e =>{
        let producto = await axios.get(`${URL}productos/${id}`);
        producto = producto.data
        return (JSON.stringify([producto,vendedor]))
    })

})

//llevamos el tamanio de la bd de Mov Producto
ipcMain.handle('traerTamanioMovProductos',async()=>{
    const tamanio = await movProducto.find()
    return (tamanio.length)
})



//Movimiento producto
ipcMain.on('movimiento-producto',async (e,args) => {
    const movimiento = new movProducto(args)
    await movimiento.save()
})





//Mandamos el saldo CC a un cliente
ipcMain.on('sumarSaldoNegro', async (e, args) => {
    const [precio, id] = args
    let cliente = await axios.get(`${URL}clientes/id${id}`)
    cliente = cliente.data;
    let saldo_p = (parseFloat(precio) + parseFloat(cliente.saldo_p)).toFixed(2)
    cliente.saldo_p = saldo_p
    await axios.put(`${URL}cliente/${id}`)
})

//Buscar Cliente
ipcMain.on('buscar-cliente',async (e,args)=>{
    const cliente = await Clientes.find({cuit:args})
    e.reply('buscar-cliente',JSON.stringify(cliente))
})

//modificamos los numeros
ipcMain.on('modificar-numeros',async(e,args)=>{
    [numero,tipo] = args
    let numeros = await Numeros.find()
    numeros[0][tipo]=numero
    let nuevoNumero = new Numeros(numeros[0])
    await nuevoNumero.save()
})

//traemos un numero
ipcMain.handle('traerUltimoNumero',async(e,args)=>{
    const numero = await Numeros.find({},{["Ultimo Recibo"]:1,_id:0})
    return JSON.stringify(numero[0])
})

//Obtenemos la venta
ipcMain.on('nueva-venta', async (e, args) => {
    const nuevaVenta = new Ventas(args);
    await nuevaVenta.save()
    const _id = nuevaVenta.cliente
    let cliente = await Clientes.find({ _id: _id })
    cliente = cliente[0]
    let listaVentas = cliente.listaVentas
     listaVentas.push(nuevaVenta._id)
    await Clientes.updateOne({ _id: _id }, { listaVentas: listaVentas })
})

//buscamos las ventas
ipcMain.handle('traerVentas' ,async (e,args)=>{
    const lista=[]
    for (const id of args) {
        const venta = await Ventas.find({_id:id})
        if(venta.length !== 0){
            lista.push(venta[0])
        }
    }
    return (JSON.stringify(lista))
})
//traer una venta en especifico
ipcMain.on('traerVenta',async (e,args)=>{
    const venta = await Ventas.find({_id:args})
    e.reply('traerVenta',JSON.stringify(venta))
})

//Modificamos las ventas
ipcMain.on('modificamosLasVentas',async (e,arreglo)=>{
    for (let venta of arreglo){
        const id = venta._id
        const abonado = venta.abonado
        const pagado = venta.pagado
        await Ventas.updateOne({_id:id},{$set: {abonado:abonado,pagado:pagado}})
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
    for await (const venta of listau){
        const ventaARetornar =  await Ventas.find({$and:[{_id:venta},{fecha:{$gte: new Date(fecha1)}},{fecha:{$lte: new Date(fecha2)}}]})
        if(ventaARetornar[0] !== undefined){
            retornar.push(ventaARetornar[0])
    }
    }
    return retornar
}
//retornamos el tamanio de la bd
ipcMain.handle('tamanioCancelado',async(e,args)=>{
    const cancelados = await Cancelados.find()
    return cancelados.length
})

//guardamos los cancelados en la base de datos
ipcMain.on('ventaCancelada',async(e,args)=>{
    const ventaCancelada = await new Cancelados(args)
    ventaCancelada.save()
})

//traemos Ventas canceladas entre fechas
ipcMain.on('traerVentasCanceladas',async(e,args)=>{
    const desde = new Date(args[0])
    let hasta = DateTime.fromISO(args[1]).endOf('day')
    const ventasCanceladas = await Cancelados.find({$and:[{fecha:{$gte: new Date(desde)}},{fecha:{$lte: new Date(hasta)}}]})
    console.log(ventasCanceladas) 
    e.reply('traerVentasCanceladas',JSON.stringify(ventasCanceladas))
})


//traerVentas entre las fechas
ipcMain.on('traerVentasEntreFechas',async(e,args)=>{
    const desde = new Date(args[0])
    let hasta = DateTime.fromISO(args[1]).endOf('day')
    const ventas = await Ventas.find({$and:[{fecha:{$gte: new Date(desde)}},{fecha:{$lte: new Date(hasta)}}]}) 
    e.reply('traerVentasEntreFechas',JSON.stringify(ventas))
})


//enviamos los productos entre un rango
ipcMain.on('traerProductosPorRango',async (e,args)=>{
    const [desde,hasta] = args
    const productos = await Productos.find({$and: [{_id:{$gte: desde}},{_id:{$lte: hasta}}]})
    e.reply('traerProductosPorRango',JSON.stringify(productos))
})

//enviamos los clientes que tienen saldo
ipcMain.on('traerSaldo',async (e,args)=>{
    const clientes = await Clientes.find({saldo: {$not: {$lte: 0.1}}}).limit(50)
     console.log(await Clientes.find({saldo: {$ne: "0"}}))
    // console.log(await Clientes.find({"saldo": {$ne: 0.0}}))
    console.log(clientes[0].saldo==="0")
    e.reply('traerSaldo',JSON.stringify(clientes))
})

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
        label: "herramientas de desarrollo",
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
function abrirVentana(texto){
    if(texto==="movProducto"){
        nuevaVentana = new BrowserWindow({
            width: 800,
            height: 500,
            webPreferences: {
                nodeIntegration: true
            }
        })
        nuevaVentana.loadURL(url.format({
            pathname: path.join(__dirname, `movProductos/movProductos.html`),
            protocol: 'file',
            slashes: true
        }));
    }else if(texto === "info-movProducto"){
        nuevaVentana = new BrowserWindow({
            parent:ventanaPrincipal,
            width: 800,
            height: 500,
            webPreferences: {
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
            width: 1000,
            height: 450,
            webPreferences: {
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
            nuevaVentana = null
        })  
    }else if(texto === "agregarProducto"){
        nuevaVentana = new BrowserWindow({
            width: 1100,
            height: 500,
            webPreferences: {
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
            nuevaVentana = null
        })  
    }
}

async function descargas() {
    pedidos(JSON.stringify(await axios.get(`${Url}/pedidos`)))
    ventas(JSON.stringify(await Ventas.find()))
}


//Menu de navegacion
const mainMenu = Menu.buildFromTemplate(templateMenu)

Menu.setApplicationMenu(mainMenu)
module.exports = { crearVentanaPrincipal }


