const {model,Schema} = require('mongoose')

const Producto = new Schema({
    _id:{
        type:String,
        required: true
    },
    cod_fabrica: {
        type: String,
        required: false
    },
    descripcion: {
        type: String,
        required: true
    },
    provedor: {
        type: String,
        default: ""
    },
    marca: {
        type: String,
        default: ""
    },
    stock: {
        type: String,
        default: "0"
    },
    iva: {
        type: String,
        required: true
    },
    costo: {
        type: String,
        default: "0"
    },
    costodolar: {
        type: String,
        default: "0"
    },
    impuestos: {
        type: String,
        default: "0"
    },
    utilidad: {
        type: String,
        default: "0"
    },
    precio_venta: {
        type: String,
        default: "0" 
    },
    observacion: {
        type: String,
        default: ""
    }

})


module.exports = model('Producto', Producto);