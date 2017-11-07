class FlujoNumeros {
    constructor() {
        this.numeros = [6, 1, 4, 3, 10, 9, 8];
    }
    
    siguienteNumero(f) {
        setTimeout(() => {
          let result = this.numeros.shift();
          f(result);
        }, 100);
    }
}

let flujo = new FlujoNumeros();

/**
 * Imprime la suma de los dos primeros números del flujo pasado como parámetro.
 * function sumaDosLog(flujo) {
    flujo.siguienteNumero(num => sumaLog(flujo,num));
}
 */
function sumaDosLog(flujo) {
    flujo.siguienteNumero(o => sumaLog(flujo,o));
}

function sumaLog(flujo, i){

    flujo.siguienteNumero(o => console.log(o +i));
}


/**
 * Llama a la función f con la suma de los dos primeros números del flujo pasado como parámetro.
 */
function sumaDos(flujo, f) {
    /* Implementar */
}

/**
 * Llama a la función f con la suma de todos los números del flujo pasado como parámetro
 */
function sumaTodo(flujo, f) {
    /* Implementar */    
}

sumaDosLog(flujo);


/* NO MODIFICAR A PAR DE AQUÍ */

module.exports = {
    FlujoNumeros: FlujoNumeros,
    
    sumaDosLog: sumaDosLog,
    sumaDos: sumaDos,
    sumaTodo: sumaTodo
}