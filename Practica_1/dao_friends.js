"use strict";

class DAOFriends {
    
    /**
     * Inicializa el DAO de usuarios.
     * 
     * @param {Pool} pool Pool de conexiones MySQL. Todas las operaciones
     *                    sobre la BD se realizarán sobre este pool.
     */
    constructor(pool) {
        this.pool = pool;
    }

    /**
     * Dada una amistad la registra en la base de datos.
     * (true --> si creada correctamente)
     * (false --> en caso contrario)
     * 
     * @param {object} friendship datos de amistad ainsertar.
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    createFrienship(user1, user2, callback){

        this.pool.getConnection((err,connection) => {
            
            if(err){
                callback(err);return;
            }

            connection.query("INSERT INTO friendship (user1, user2) VALUES (?,?)",
            [user1, user2],
            (err, result) =>{

                if (err) { 
                    callback(err);return;
                }

                connection.release();
                if(result.insertId === null)
                    callback(null, false);
                else
                    callback(null, true);
            });
        });

    }//createFriendship


    //***********************************************************************************************************************

    /**
     * Elimina de la base de datos todas aquellas amistades cuyas peticiones esten a null.
     * 
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    deleteFriendship(callback){

        this.pool.getConnection((err,connection) => {
            
            if(err){
                callback(err);return;
            }

            connection.query("DELETE FROM friendship WHERE friendship.request = -1",
            (err, result) =>{

                if (err) { 
                    callback(err);return;
                }

                connection.release();
                callback(null);
            });
        });
    }//deleteFrienship


    //***********************************************************************************************************************


    /**
     * Modifica una amistad de la base de datos con los nuevos atributos.
     * 
     * 
     * @param {object} friendship datos de amistad ainsertar.
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    modifyFriendship(current_user, friend, request, callback){

        this.pool.getConnection((err,connection) => {
            
            if(err){
                callback(err);return;
            }

            connection.query("UPDATE friendship SET request = ? WHERE friendship.user1 = ? AND friendship.user2 = ?",
            [request, friend, current_user],
            (err, result) =>{

                if (err) { 
                    callback(err);return;
                }
                else{
                    connection.release();

                    if(result.changedRows > 0)
                        callback(null, true);
                    else
                        callback(null, false);
                }
                
            });
        });
    }//modifyFrienship


    //***********************************************************************************************************************

    /**
     * Devuelve una lista con las amistades de un usuario
     * (--> id, nombre, apellido)
     *  
     * @param {object} id id del usuario
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    readFriends(id, callback){

        this.pool.getConnection((err,connection) => {

            if(err){
                callback(err);return;
            }

            connection.query("SELECT users.idUser, users.name, users.surname " +
                             "FROM users "+
                             "WHERE users.idUser IN " +
                                "(SELECT friendship.user1 FROM friendship WHERE friendship.user2 = ? AND friendship.request = 0) " +
                             "OR users.idUser IN " +
                                "(SELECT friendship.user2 FROM friendship WHERE friendship.user1 = ? AND friendship.request = 0)",
            [id, id],
            (err, listFriends) =>{

                if (err) {
                    console.log("readfriends");
                    console.log(err);
                    callback(err);return;
                }
                connection.release();
                callback(null, listFriends);
            });
        });
    }//readFrienship
    

    //****************************************************************************************************


    /**
     * Devuelve una lista con las peticione de amistad pendientes del usuario
     * (--> nombre, apellido y estado de la amistad)
     *  
     * @param {object} id id del usuario
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    readRequestFriends(id, callback){
        
        this.pool.getConnection((err,connection) => {

            if(err){
                callback(err);return;
            }

            connection.query("SELECT users.idUser, users.name, users.surname " +
                             "FROM users INNER JOIN friendship " +
                             "ON friendship.user1 = users.idUser " +
                             "WHERE friendship.user2 = ? AND friendship.request = 1",
            [id],
            (err, listFriends) =>{

                if (err) { 
                    console.log("requestFriends");
                    console.log(err);
                    callback(err);return;
                }
                connection.release();

                callback(null, listFriends);
            });
        });
    }//readFrienship
    

    //***********************************************************************************************************************

    /**
     * Dado dos id´s busca si la amistad existe.
     * (null --> en el caso de que la amistad no exista)
     * (request --> estado de la solicitud [pendientes || amigos])
     *  
     * @param {object} id_user id del usuario
     * @param {boolean} id_friend id del posible amigo
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    findFriendship(id_user, id_friend, callback){

        this.pool.getConnection((err,connection) => {

            if(err){
                callback(err);return;
            }

            connection.query("SELECT request FROM friendship WHERE (user1 = ? AND user2 = ?) OR (user1 = ? AND user2 = ?)",
            [id_user, id_friend, id_friend, id_user],
            (err, rows) =>{

                if (err) { 
                    callback(err);return;
                }
                connection.release();

                if(rows.length === 0)
                    callback(null, null); //--> se puede enviar la peticion
                else
                    callback(null, rows[0].request); //envia el estado de la peticion.
            });
        });
    }//readFrienship

//*********************************************************************************************************    
    
}//DAOFriends

module.exports = {
    DAOFriends: DAOFriends
}