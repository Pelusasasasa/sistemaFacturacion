const {model,Schema} = require('mongoose')


const tipoVenta = new Schema({
   "Ultima Factura A": String,
   "Ultima Factura B": String,
   "Ultima N Credito A":String,
   "Ultima N Credito B":String,
   "Ultima N Debito A":String,
   "Ultima N Debito B":String,
   "Ultimo Recibo": String,
   "Ultimo Presupuesto": String,
   "Ultimo Remito": String,
   "Ultimo Remito Contado": String,
   "Ultimo Remito Cta Cte": String,
   "dolar": String
})

module.exports = model('tipoVenta',tipoVenta)