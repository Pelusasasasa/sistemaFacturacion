const {model,Schema} = require('mongoose')

const Usuario = new Schema({
    _id: String,
    nombre: {
        type: String,
        required: true
    },
})


module.exports = model('Usuario',Usuario)