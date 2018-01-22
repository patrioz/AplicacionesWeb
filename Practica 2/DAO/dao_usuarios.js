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

            connection.query("SELECT * FROM usuarios WHERE login = ? AND password = ?",
            [login, password],
            (err, result) =>{

                if (err)
                    callback(err);

                connection.release();

                if(result.length === 0)
                    callback(null, undefined);
                else
                    callback(null, result[0].login);
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
    createUser(usuario, contraseña, callback){
        
        this.pool.getConnection((err, connection) =>{
            
            if(err){
                callback(err); return;
            }
            
            connection.query("INSERT INTO usuarios (login, password) VALUES (?, ?)",
            [usuario, contraseña],
            (err, result) =>{
                
                if(err)
                    callback(err);
                
                connection.release();
                
                callback(null, result.insertId);
            });
        });
    }//createUser

//************************************************************** */

    /** 
     *
     * @param {object} usuario objeto con los datos del usuario
     * @param {function} callback Función que recibirá el objeto error y el resultado
     * 
     */
    buscarUsuario(usuario, callback){
        
        this.pool.getConnection((err, connection) =>{
            
            if(err){
                callback(err); return;
            }
            
            connection.query("SELECT * FROM usuarios WHERE login = ?",
            [usuario],
            (err, result) =>{
                
                if(err)
                    callback(err);
                
                connection.release();

                if(result.length === 0)
                    callback(null, false);
                else
                    callback(null, true);
            });
        });
    }//createUser


}//DAOUsers

module.exports = {
    DAOUsers: DAOUsers
}