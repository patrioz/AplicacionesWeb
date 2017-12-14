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

            connection.query("DELETE FROM friendship WHERE request = null",
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
     * Modifica una amistad de la base de datos con los nuevos atributos
     * 
     * @param {object} friendship datos de amistad ainsertar.
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    modifyFriendship(friendship, callback){
        
        this.pool.getConnection((err,connection) => {
            
            if(err){
                callback(err);return;
            }

            connection.query("UPDATE friendship SET user1 = ?, user2 = ?, request = ?",
            [friendship.user1, friendship.user2, friendship.request],
            (err, result) =>{

                if (err) { 
                    callback(err);return;
                }

                connection.release();
                callback(result);
            });
        });
    }//modifyFrienship


    //***********************************************************************************************************************

    /**
     * Devuelve una lista con las amistades de un usuario
     * (--> nombre, apellido y estado de la amistad)
     *  
     * @param {object} id id del usuario
     * @param {boolean} request estado de la peticion
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    readFriendship(id, callback){
        
        this.pool.getConnection((err,connection) => {

            if(err){
                callback(err);return;
            }

            connection.query("SELECT users.idUser, users.name, users.surname, friendship.request " +
                             "FROM users LEFT JOIN friendship " +
                                "ON friendship.user2 = users.idUser " + 
                             "WHERE friendship.user1 = ?;",
            [id],
            (err, listFriends) =>{

                if (err) { 
                    callback(err);return;
                }
                connection.release();
                if(listFriends.lenght === 0)
                    callback(null, null);
                else
                    callback(null, listFriends);
            });
        });
    }//readFrienship
    
}//DAOFriends

module.exports = {
    DAOFriends: DAOFriends
}