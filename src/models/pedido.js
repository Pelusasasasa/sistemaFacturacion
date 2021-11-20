const {model,Schema} = require('mongoose')

const Pedido = new Schema({
    fecha:{
        type: Date,
        default: Date.now
    },
    codigo:{
        type: String,
        required: true
    },
    producto:{
        type: String,
        required: true
    },
    cantidad:{
        type: Number,
        required: true
    },
    cliente:{
        type: String,
        default: ""
    },
    telefono:{
        type: String,
        default: ""
    },
    vendedor: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true
    },
    estadoPedido: {
        type: String,
        default: "Sin Pedir"
    }
})


module.exports = model('Pedido',Pedido) 