"use strict";


/**
 * Proporciona operaciones para la gestión de tareas
 * en la base de datos.
 */
class DAOTasks {
    /**
     * Inicializa el DAO de tareas.
     * 
     * @param {Pool} pool Pool de conexiones MySQL. Todas las operaciones
     *                    sobre la BD se realizarán sobre este pool.
     */
    constructor(pool) {
        this.pool = pool;
    }


    /**
     * Devuelve todas las tareas de un determinado usuario.
     * 
     * Este método devolverá (de manera asíncrona) un array
     * con las tareas de dicho usuario. Cada tarea debe tener cuatro
     * atributos: id, text, done y tags. El primero es numérico, el segundo
     * una cadena, el tercero un booleano, y el cuarto un array de cadenas.
     * 
     * La función callback ha de tener dos parámetros: un objeto
     * de tipo Error (si se produce, o null en caso contrario), y
     * la lista de tareas (o undefined, en caso de error).
     * 
     * @param {string} email Identificador del usuario.
     * @param {function} callback Función callback.
     */
    getAllTasks(email, callback) {

        this.pool.getConnection((err, connection) => {
            
            if (err){ //--> si la conexin da error.

                err = "Error al conectar " + err;
                callback(err); return;
            }
            //si no --> realizamos la consulta.
            connection.query(

                "SELECT task.id, task.text, task.done, GROUP_CONCAT(tag.tag) AS tag " +
                "FROM tag RIGHT JOIN task ON tag.taskId = task.id " +
                "WHERE user = 'usuario@ucm.es' " +
                "GROUP BY task.id;",
                [email],

                (err, rows) => {

                    if(err){//--> si la consulta de error.

                        err = "Fallo al hacer la consulta " + err;
                        callback(err); return;
                    }
                    //si no --> 
                    connection.release();//devolvemos la conexion al pool.
                    
                    //devolvemos una respuesta u otra dependiendo del resultado de la consulta.
                    if (rows.length === 0)
                        callback(null, undefined);
                    else{

                        let lista_tareas;
                        let tag_tmp = [];

                        for(let i = 0; i < rows.length; i++){

                            lista_tareas = rows;

                            if(rows[i].tag === null)
                               tag_tmp.push(lista_tareas[i].tag);
                        }

                        callback(null, lista_tareas);
                    }
                }
            );
        });
    }//getAllTasks

    /**
     * Inserta una tarea asociada a un usuario.
     * 
     * Se supone que la tarea a insertar es un objeto con, al menos,
     * dos atributos: text y tags. El primero de ellos es un string con
     * el texto de la tarea, y el segundo de ellos es un array de cadenas.
     * 
     * Tras la inserción se llamará a la función callback, pasándole el objeto
     * Error, si se produjo alguno durante la inserción, o null en caso contrario.
     * 
     * @param {string} email Identificador del usuario
     * @param {object} task Tarea a insertar
     * @param {function} callback Función callback que será llamada tras la inserción
     */
    insertTask(email,task, callback) {

        let consulta;
            this.pool.getConnection((err, connection) => {
                
                if (err){
                    err = "Error al conectar " + err;
                    callback(err); return;
                }
                connection.query(
                
                    "INSERT INTO task (user, text, done) VALUES (?, ?, ?)",
                    [email,task.text, task.done],
                
                    (err, resultado) =>{
                
                        if(err){
                        connection.release();
                        err = "Error al insertar datos " + err;
                        callback(err);
                        }
                        else{
        
                       
        
                        if(task.length > 0){
        
                            consulta = "INSERT INTO tag(idTask, tag) VALUES ? ";
        
                            let i;
        
                            let array = [];
                
                            for( i = 0; i < task.tags.length; i++){
        
                                array.push([resultado.insertId, task.tags[i]]);
                             }    
                            connection.query(
                            consulta, [array],
                            (err, rows) =>{
                                if(err){
                                    connection.release();
                                    err = "Error al insertar datos " + err;
                                    callback(err);
                                }
                           
                        }
                    );
                 }
                 callback(null, undefined);
                }
                }
            );
        });
        }//insertTask

    /**
     * Marca la tarea indicada como realizada, estableciendo
     * la columna 'done' a 'true'.
     * 
     * Tras la actualización se llamará a la función callback, pasándole el objeto
     * Error, si se produjo alguno durante la actualización, o null en caso contrario.
     * 
     * @param {object} idTask Identificador de la tarea a modificar
     * @param {function} callback Función callback que será llamada tras la actualización
     */
    markTaskDone(idTask, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) { callback(err); return; }
            connection.query(
                "UPDATE task SET done = 1 WHERE id = ?",
                [idTask],
                (err) => {
                    connection.release();
                    callback(err);
                }
            );
        });
    }

    /**
     * Elimina todas las tareas asociadas a un usuario dado que tengan
     * el valor 'true' en la columna 'done'.
     * 
     * Tras el borrado se llamará a la función callback, pasándole el objeto
     * Error, si se produjo alguno durante la actualización, o null en caso contrario.
     * 
     * @param {string} email Identificador del usuario
     * @param {function} callback Función llamada tras el borrado
     */
    deleteCompleted(email, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) { callback(err); return; }
            connection.query(
                "DELETE FROM task WHERE user = ? AND done = 1",
                [email],
                (err) => {
                    connection.release();
                    callback(err);
                }
            );
        });
    }
}

module.exports = {
    DAOTasks: DAOTasks
}