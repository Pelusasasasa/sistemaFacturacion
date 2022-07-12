const a = require('./config')
const fs = require('fs');
const os = require('os')
require('dotenv').config();

const axios = require("axios")
const path = require('path');
const { app, BrowserWindow, ipcMain, Menu, ipcRenderer,dialog } = require('electron');
const { DateTime } = require("luxon");
const url = require('url')
const [pedidos, ventas] = require('./descargas/descargas')



let URL
if (a === 1) {
    URL = process.env.URLPUBLICANEGOCIO;
}else if(a === 2){
    URL = process.env.URL;
    //URL = process.env.URLPRIVADANEGOCIO;
}
let conexion;
let tipoConexion;
if (a === 2) {
    conexion = "Privada";
}else{
    conexion = "Publica"
}



if (process.env.NODE_ENV !== 'production') {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
    })
};
global.nuevaVentana = null;
global.ventanaPrincipal = null
global.nuevaVentanaDos = null

app.on('window-all-closed',()=>{
    if (process.platform !== "darwin") {
        app.quit();    
    }
});


function crearVentanaPrincipal() {
    ventanaPrincipal = new BrowserWindow({  
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
        }
        
    });
    ventanaPrincipal.loadFile('src/index.html')
    ventanaPrincipal.maximize()
}

ipcMain.on('elegirPath',async e=>{
     const path = (await dialog.showSaveDialog()).filePath;
     e.reply('mandoPath',path);
})

//abrir ventana agregar cliente
ipcMain.on('abrir-ventana-agregar-cliente',e=>{
    abrirVentana('clientes/agregarCliente.html',1100,500)
})

ipcMain.on('minimizar',e=>{
    ventanaPrincipal.minimize();
})


ipcMain.on('recargar-Ventana',(e,args)=>{
    app.relaunch();
    app.exit();
});

ipcMain.on('abrir-menu',()=>{
    ventanaPrincipal.setClosable(true);
ventanaPrincipal.setMenuBarVisibility(true);
});

ipcMain.on('cerrar-menu',()=>{
    ventanaPrincipal.setClosable(false);
    ventanaPrincipal.setMenuBarVisibility(false);
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

//mandamos el producto a emitir comprobante
ipcMain.on('mando-el-producto', async (e, args) => {
    let producto = await axios.get(`${URL}productos/${args._id}`);
    producto = producto.data
    ventanaPrincipal.webContents.send('mando-el-producto', JSON.stringify({
        producto: producto,
        cantidad: args.cantidad
    }));

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

//Abrir ventana para modificar un cliente
ipcMain.on('abrir-ventana-modificar-cliente', (e, args) => {
    abrirVentana("clientes/modificarCliente.html",1100,450)
    const [idCliente,acceso] = args
    nuevaVentana.on('ready-to-show',async ()=>{
        let cliente = await axios.get(`${URL}clientes/id/${idCliente}`)
        cliente = cliente.data
        nuevaVentana.webContents.send('datos-clientes', JSON.stringify([cliente,acceso]))
    })
    nuevaVentana.setMenuBarVisibility(false)
})

//mandamos el cliente a emitir comprobante
ipcMain.on('mando-el-cliente', async (e, args) => {
    let cliente = (await axios.get(`${URL}clientes/id/${args}`)).data
    ventanaPrincipal.webContents.send('mando-el-cliente', JSON.stringify(cliente))
    ventanaPrincipal.focus()
})

ipcMain.on('borrarVentaACliente',async (e,args)=>{
    const [id,numero] = args;

    let cliente = await axios.get(`${URL}clientes/id/${id}`)
    cliente = cliente.data;
    let venta = (await axios.get(`${URL}presupuesto/${numero}`)).data;

    cliente.saldo_p = (parseFloat(cliente.saldo_p)-venta.precioFinal).toFixed(2);

    cliente.listaVentas = cliente.listaVentas.filter(num=>(numero!== num))

    await axios.put(`${URL}clientes/${id}`,cliente)
    await axios.delete(`${URL}presupuesto/${numero}`)
})

ipcMain.on('abrir-ventana-clientesConSaldo',async(e,args)=>{
    abrirVentana("resumenCuenta/clientes.html",1200,500 , "noReinician");
    nuevaVentana.on('ready-to-show',()=>{
        nuevaVentana.webContents.send('situacion',JSON.stringify(args))
    })
})

//FIN CLIENTES

//INICIO VENTAS
//imprivimos una venta ya sea presupuesto o ticket factura
ipcMain.on('imprimir-venta',async(e,args)=>{
    const [,,condicion,cantidad,tipo,,,] = args;
    let options
    if (tipo === "Ticket Factura") {
        options = {
            silent: condicion,
            copies: cantidad,
            deviceName: "SAM4S GIANT-100"
        };
    }else{
        options = {
            silent: condicion,
            copies: cantidad,
        };
    }
    if (tipo === "Recibos_P") {
        abrirVentana("emitirRecibo/imprimirRecibo.html",1000,900,"noReinician");
    }else if(tipo === "Recibos"){
        abrirVentana("emitirComprobante/imprimirTicket.html",800,200,"noReinician");
    }else if(tipo === "Ticket Factura"){
        abrirVentana("impresionTicket/index.html",1000,900,"noReinician")
    }else{
        abrirVentana("emitirComprobante/imprimir.html",1000,500,"noReinician");
    }
    await imprimir(options,args);
})

//funcion para imprimir presupuesto
const imprimir = (opciones,args)=>{
    nuevaVentana.webContents.on('did-finish-load', function() {
        nuevaVentana.webContents.send('imprimir',JSON.stringify(args))
            nuevaVentana.webContents.print(opciones,(success, errorType) => {
                    if (success) {
                        ventanaPrincipal.focus()
                        nuevaVentana.close();
                    }else{
                        ventanaPrincipal.focus();
                        nuevaVentana && nuevaVentana.close();
                    }
        })
    });
}   

//Mandamos la modificacion de la venta
ipcMain.on('ventaModificada',async (e,[args,id])=>{
     let venta = await axios.get(`${URL}ventas/${id}`)
    if(venta.data.length === 0){
        venta = await axios.get(`${URL}presupuesto/${id}`)
        venta = venta.data;
    }else{
        venta = venta.data[0]
    }

    let saldoABorrar = venta.precioFinal
    venta.precioFinal = args.precioFinal;
    venta.productos = args.productos;
    venta.tipo_comp === "Ticket Factura" ? await axios.put(`${URL}ventas/${venta._id}`,venta) : await axios.put(`${URL}presupuesto/${venta._id}`,venta);
    let cliente = await axios.get(`${URL}clientes/id/${args.cliente}`);
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
        abrirVentana("emitirComprobante/emitirComprobante.html",1000,1000)
        nuevaVentanaDos.on('ready-to-show',async ()=>{
            nuevaVentanaDos.webContents.send('venta',JSON.stringify([vendedor,numeroVenta,empresa]))
        })
    })


    ipcMain.on('eliminar-venta',async(e,id)=>{
    })
//FIN VENTAS

//Abrir ventana para modificar un producto
ipcMain.on('abrir-ventana-modificar-producto',  (e, args) => {
    const [id,acceso,texto,seleccion] = args
    abrirVentana('productos/modificarProducto.html',1000,600,'noReinician')
    nuevaVentana.on('ready-to-show',async ()=>{
    nuevaVentana.webContents.send('id-producto', id)
    nuevaVentana.webContents.send('acceso', JSON.stringify(acceso))
    })
    nuevaVentana.on('close', async()=> {
        ventanaPrincipal.once('ready-to-show',async ()=>{
        })
        
        nuevaVentana = null
    })
});

ipcMain.on('productoModificado',(e,args)=>{
    ventanaPrincipal.webContents.send('productoModificado',JSON.stringify(args))
});


//abrir ventana agregar producto
ipcMain.on('abrir-ventana-agregar-producto',async(e,args)=>{
    abrirVentana('productos/agregarProducto.html',1100,500)
})


//INICIO MOVIMIENTO DE PRODUCTOS

//Abrir ventana de movimiento de producto
ipcMain.on('abrir-ventana-movimiento-producto',async (e,arreglo)=>{
    const [id,vendedor] = arreglo
    abrirVentana('movProductos/movProductos.html',800,500,"noReinician")
    let producto = await axios.get(`${URL}productos/${id}`);
    producto = producto.data
    nuevaVentana.on('ready-to-show',()=>{
        nuevaVentana.webContents.send('movimiento-producto-abrir',(JSON.stringify([producto,vendedor])) )
    })
})

//Abrir ventana de Informacion de producto
ipcMain.on('abrir-ventana-info-movimiento-producto',async (e,args)=>{
    abrirVentana('movProductos/infoMovProductos.html',1200,600,"noReinician")

//informacion de movimiento de producto
    nuevaVentana.on('ready-to-show',async()=>{
        let producto = (await axios.get(`${URL}movProductos/${args}`)).data;
        nuevaVentana.webContents.send('datos-movimiento-producto',JSON.stringify(producto))
    })
})

//FIN MOVIMIENTO DE PRODUCTOS


ipcMain.on('enviar-arreglo-descarga',(e,args)=>{
    descargas('Ventas',args[0],args[1]);
})

//menu
const templateMenu = [
    {
        label: 'Convertir excel',
        submenu: [{
            label: 'Pedidos',
            async click() {
                const path = (await dialog.showSaveDialog()).filePath;
                descargas("Pedidos","s",path);
            }
        },
        {
            label: 'Ventas',
            click() {
                abrirVentana('fechas/fechas.html',400,300);

            }
        }]
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
                            abrirVentana("clientes/listadoSaldo.html",1000,900)
                        }
                    },
                    {
                        label:"Imprimir Presupuesto",
                        click(){
                            abrirVentana("clientes/imprimirPresupuesto.html",600,500)
                        }
                    },
                    {
                        label: "Arreglar Saldo",
                        click(){
                            abrirVentana("clientes/arreglarSaldo.html",550,600)
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
                            abrirVentana("productos/listadoStock.html",1000,900)
                        }
                    },
                    {
                        label: "Cambio de codigo",
                        click(){
                            abrirVentana("productos/cambioCodigo.html",400,300)
                        }
                    },{
                        label: "Aum porcentaje",
                        click(){
                            abrirVentana("./productos/aumPorcentaje.html",600,200);
                            nuevaVentana.on('ready-to-show',async()=>{
                                const marcas = await axios.get(`${URL}productos`)
                                nuevaVentana.webContents.send("mandarMarcas",JSON.stringify(marcas.data))
                            })
                        }
                    },{
                        label: "Listado Por Marca",
                        click(){
                            abrirVentana("./productos/listadoPorMarca.html",1200,1000)
                        }
                    }
                ]
            },
            {
                label: "Numeros",
                click(){
                    abrirVentana("numeros/numeros.html",500,1000)
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
                    abrirVentana("listados/porComrpobante.html",1200,1000)
                }
            },
            {
                label: "Presupuesto",
                click(){
                    abrirVentana("listados/presupuestos.html",1200,1000)
                }
            },
            {
                label: "Buscar Venta",
                click(){
                    abrirVentana("listados/buscarVentas.html",1200,1000)
                }
            },
            {
                label: "Stock Negativo",
                click(){
                    abrirVentana("listados/stockNegativo.html",1200,1000)
                }
            },
            {
                label: "Libro Ventas",
                click(){
                    abrirVentana("libroVentas/libroVentas.html",1100,500)
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
                    abrirVentana("utilidad/gerencial.html",1200,1000)
                }
            },{
                label: "Ver Registros",
                click(){
                    abrirVentana("utilidad/verRegistros.html",1500,1000)
                }
            },{
                label:"Cargar Factura",
                click(){
                    abrirVentana("utilidad/cargarFactura.html",800,900);
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
    },
    {
        label:"",
        accelerator: process.platform == 'darwin' ? 'Comand+D' : 'Ctrl+D',
        click(item, focusedWindow) {
            focusedWindow.toggleDevTools();
        }
    },
]

//AbrirVentanaParaBuscarUnCliente
ipcMain.on('abrir-ventana', (e, args) => {
      abrirVentana(args)
})


//Para abrir todas las ventanas
function abrirVentana(texto,width,height,reinicio){
    if (texto === "resumenCuenta") {
        nuevaVentana = new BrowserWindow({
            width: 800,
            height: 500,
            parent:ventanaPrincipal,
            modal:true,
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
    }else if(texto === "clientes"){
        nuevaVentana = new BrowserWindow({
            parent:ventanaPrincipal,
            modal:true,
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
            modal:true,
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
        });
        nuevaVentana.on('ready-to-show',()=>{
        })
        nuevaVentana.setMenuBarVisibility(false)
    }else if(texto === "emitirComprobante/emitirComprobante.html"){
        nuevaVentanaDos = new BrowserWindow({
            parent:ventanaPrincipal,
            modal:true,
            width: width,
            height: height,
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true
            }
        })
        nuevaVentanaDos.loadURL(url.format({
            pathname: path.join(__dirname, `./${texto}`),
            protocol: 'file',
            slashes: true
        }));
        nuevaVentanaDos.setMenuBarVisibility(false)
        nuevaVentanaDos.on('close',e=>{
            nuevaVentanaDos = null;
            reinicio !== "noReinician" && ventanaPrincipal.reload()
        })
    }else if(texto.includes("usuarios")){
        const a = texto.split('?')[1];
        nuevaVentana = new BrowserWindow({
            width: 500,
            parent:ventanaPrincipal,
            modal:true,
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
    }else{
        nuevaVentana = new BrowserWindow({
            parent:ventanaPrincipal,
            modal:true,
            width: width,
            height: height,
            webPreferences: {
                contextIsolation: false,
                nodeIntegration: true
            }
        })
        nuevaVentana.loadURL(url.format({
            pathname: path.join(__dirname, `./${texto}`),
            protocol: 'file',
            slashes: true
        }));
        nuevaVentana.setMenuBarVisibility(false)
        nuevaVentana.on('close',e=>{
            nuevaVentana = null;
            reinicio !== "noReinician" && ventanaPrincipal.reload()
        })
    }

}


//Aca hacemos que se descargue un excel Ya sea con los pedidos o con las ventas

async function descargas(nombreFuncion,ventasTraidas,path) {
    if(nombreFuncion === "Pedidos"){
        pedidos((await axios.get(`${URL}pedidos`)).data,path)
    }else if(nombreFuncion === "Ventas"){
        ventas(ventasTraidas,path);
    }
}

const validarUsuario = (texto)=>{
    ventanaPrincipal.webContents.send('validarUsuario',JSON.stringify(texto))
}


//Menu de navegacion
const mainMenu = Menu.buildFromTemplate(templateMenu)

Menu.setApplicationMenu(mainMenu)
module.exports = { crearVentanaPrincipal }


