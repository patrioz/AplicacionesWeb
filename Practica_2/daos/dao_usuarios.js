"use strict";

class DAOUsers {


    /**
     * Inicializa el DAO de usuarios.
     * 
     * @param {Pool} pool Pool de conexiones MySQL. Todas las operaciones
     *                    sobre la BD se realizarán sobre este pool.
     */
    constructor(pool) {
        this.pool = pool;
    }


    //*********************************************************************************************************************** */


      /**
     * @param {string} login Identificador del usuario a buscar
     * @param {string} password Contraseña a comprobar
     * @param {function} callback Función que recibirá el objeto error y el resultado
     *
     */
    isUserCorrect(login, password, callback) {
        
        this.pool.getConnection((err,connection) => {

            if(err){
                callback(err);return;
            }

            connection.query("SELECT * FROM usuarios WHERE login = ? AND password =?",
            [login, password],
            (err, result) =>{

                if (err) { 
                    callback(err);return;//el segunda parametro es undefined, no hace falta ponerlo.
                }

                connection.release();

                if(result.length === 0)
                    callback(null, null);
                else
                    callback(null, result[0].id);
            });
        });
    }//isUserCorrect


    //*********************************************************************************************************************** */


    /** 
     *
     * @param {object} login objeto con los datos del usuario
     * @param {function} callback Función que recibirá el objeto error y el resultado
     * 
     */
    createUser(login, callback){
        
        this.pool.getConnection((err, connection) =>{
            
            if(err){
                callback(err); return;
            }
            
            connection.query("INSERT INTO usuarios (login, password) VALUES (?, ?)",
            [usuarios.login, usuarios.password],
            (err, result) =>{
                
                if(err){
                    console.log(err);
                    callback(err);return;
                }
                connection.release();
                callback(null, result.insertId);
            });
        });
    }//createUser

//************************************************************** */

getPartidasUsuario(login,callback){
    this.pool.getConnection((err, connection) =>{
            
        if(err){
            callback(err); return;
        }
        
        connection.query("SELECT p.id, p.nombre FROM partidas p JOIN juega_en j ON(p.id = j.idPartida)"+
        " JOIN usuarios u ON (j.idUsuario = u.id) WHERE u.login = ?",
        [usuarios.login],
        (err,result)=>{
            if(err){
                console.log(err);
                callback(err);return;
            }
            connection.release();
            callback(null,filas);


        });
    });
}//getPartidasUsuario


}//FIN DAO

module.exports = {
    DAOUsers: DAOUsers
}