const {model,Schema} = require('mongoose')


const movProducto = new Schema({
    _id: Number,
    cliente:{
        type: String,
        default: ""
    },
    codProd: {
        type: String,
        required:true
    },
    fecha:{
        type: Date,
        default: Date.now
    },
    descripcion:{
        type: String,
        required:true
    },
    ingreso:{
        type: Number,
        default: 0
    },
    egreso: {
        type: Number,
        default: 0
    },
    nro_comp: {
        type: String,
        default: ""
    },
    tipo_comp: String,
    stock:Number,
    precio_unitario: {
        type: Number,
        default: 0
    },
    total:{
        type: String,
        default: "0"
    },
    pago:String,
    costo:Number,
    total_costo:Number,
    vendedor:{
        type: String,
        default: ""
    }
})

module.exports = model('movProducto',movProducto)