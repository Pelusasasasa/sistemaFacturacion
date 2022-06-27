function redondear(numero,decimales){
    const signo = numero >= 0 ? 1 : -1;
    return(Math.round((numero * Math.pow(10,decimales)) + (signo * 0.0001)) / Math.pow(10,decimales)).toFixed(decimales);
  }

  module.exports = {redondear}