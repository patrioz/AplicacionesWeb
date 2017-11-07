
/**
 * ============================
 * Ejercicio entregable 3.
 * Funciones de orden superior.
 * ============================
 * 
 * Puedes ejecutar los tests ejecutando `mocha` desde el directorio en el que se encuentra
 * el fichero `tareas.js`.
 */
"use strict";

let listaTareas = [
  { text: "Preparar práctica PDAP", tags: ["pdap", "practica"] },
  { text: "Mirar fechas congreso", done: true, tags: [] },
  { text: "Ir al supermercado", tags: ["personal"] },
  { text: "Mudanza", done: false, tags: ["personal"] },
];

/**
 * 1-Devuelve las tareas de la lista de entrada que no hayan sido finalizadas.
 */
function getToDoTasks(tasks) {
  let fil = tasks.filter(o => o["done"] !== true); //Hacemos una seleccion de las tareas que no se han finalizado
  
    let salida = fil.map(o => o["text"]);//Hacemos una seleccion dentro del propio array para que se solo se alamacenen los nombres de las tareas.
  
    return salida;
  
}

/**
 *2- Devuelve las tareas que contengan el tag especificado
 */

function findByTag(tasks, tag) {
  
  let salida = tasks.filter(o => o.tags.indexOf(tag) !== -1);
  
    return salida;
}

/**
 * 3-Devuelve las tareas que contengan alguno de los tags especificados
 */

 /**Implementa una función findByTags(tasks, tags) que devuelva aquellas tareas del array tasks
que contengan al menos una etiqueta que coincida con una de las del array tags pasado como
segundo parámetro. */


function findByTags(tasks, tags) {


  let salida = tasks.filter(o => o.tags.some(i => tags.indexOf(i) !== -1));
  
    return salida;

  
}
//console.log(findByTags(listaTareas,["personal", "pdap"]))

/**
 * 4-Devuelve el número de tareas finalizadas
 * Implementa una función countDone(tasks) que devuelva el número de tareas completadas en
  el array de tareas tasks pasado como parámetro.
 */
function countDone(tasks) {
  
    let salida = tasks.reduce((acum, o) =>{ //reduce la matriz a un solo valor

      if(o.done === true){

       return acum+1; //devuelve el acumulador sumado en caso de que la tarea este a true

      }else{

         return acum; //en caso de la tarea estar a false no suma nada y el acumulador se queda con el valor anterior
      }
    }, 0) ///inicializamos el acumulador a 0
  
  
    return salida;
  
}

//console.log(countDone(listaTareas))

/**
 * 5-Construye una tarea a partir de un texto con tags de la forma "@tag"
 * Implementa una función createTask(texto) que reciba un texto intercalado con etiquetas, cada
  una consistente en una serie de caracteres alfanuméricos precedidos por el signo @. Esta función
  debe devolver un objeto tarea con su array de etiquetas extraídas de la cadena texto. El texto de
  la tarea resultante no debe contener las etiquetas de la cadena de entrada.
 */
function createTask(text) {
  
  	let salida;
  let exRg =new RegExp();
  let buscar= text.indexOf("@");
  exRg = /\@[A-Za-z0-9]+/g;
	text=text.trim();
	
  if(buscar === -1){ // si no hay ningun @ devuelva la cadena vacia(2.test -> tarea vacia)
    
     salida ={ text :text.trim(), tags:[] };
	  
  }else{
  let copia= text.substring(0,buscar);
   	salida = text.replace("exRg", " ");
	  salida = salida.substring(buscar-1, text.length).split(" @");
	  salida = {text: copia.trim(), tags: salida.slice(1)};


  }
return salida;
}

/**text=text.trim(); //Eliminamos los espacios en blanco de la cadena
  let buscar = text.indexOf("@"); //Busca en la cadena si hay algun @
  let arry;//creacion de la variable array
  

  if(buscar === -1){ // si no hay ningun @ devuelva la cadena vacia(2.test -> tarea vacia)
   
    arry ={ text :text.trim(), tags:[] }; //Mostramos array vacio

  }else{ // si encuentra @

    let pal=text.substring(0,buscar); //guarda en los caracteres desde el principio hasta el @
  
    let copia = text.substring(buscar-1, text.length).split(" @"); //guarda en copia desde el @ hasta el final del texto
    //y divide la cadena
    arry = {text :pal.trim(), tags: copia.slice(1)}; //Muestra las palabras y los tags

  }

   return arry; */

console.log(createTask("Esto es una @cadena"));
//console.log(createTask("Y por aqui@ va otra @personal"));



/*
  NO MODIFICAR A PARTIR DE AQUI
  Es necesario para la ejecución de tests
*/
module.exports = {
  getToDoTasks: getToDoTasks,
  findByTag: findByTag,
  findByTags: findByTags,
  countDone: countDone,
  createTask: createTask
}