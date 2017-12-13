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

    /**
     * Determina si un determinado usuario aparece en la BD con la contraseña
     * pasada como parámetro.
     * 
     * Es una operación asíncrona, de modo que se llamará a la función callback
     * pasando, por un lado, el objeto Error (si se produce, o null en caso contrario)
     * y, por otro lado, un booleano indicando el resultado de la operación
     * (true => el usuario existe, false => el usuario no existe o la contraseña es incorrecta)
     * En caso de error error, el segundo parámetro de la función callback será indefinido.
     * 
     * @param {string} email Identificador del usuario a buscar
     * @param {string} password Contraseña a comprobar
     * @param {function} callback Función que recibirá el objeto error y el resultado
     *
     */
    isUserCorrect(email, password, callback) {

        this.pool.getConnection((err,connection) => {

            if(err){
                
                callback(err);return;
            }

            connection.query("SELECT * FROM users WHERE email = ? AND password =?",
            [email, password],
            (err, rows) =>{

                if (err) { 
                    console.log("Prueba");
                    callback(err);return;//el segunda parametro es undefined, no hace falta ponerlo.
                }

                connection.release();

                if (rows.length === 0)
                    callback(null, false);
                else
                    callback(null, true);
            });
        });
    }//isUserCorrect


    /**
     * Determina si un usuario que se esta registrando en la aplicacion,
     * puede usar ese email o no.
     * 
     * Resultado de la operacion:
     *  (true --> si el usuario ya esta registrado con ese email)
     *  (false --> si no existe ningun usuario con ese email)
     * 
     * @param {string} email Identificador del usuario a buscar
     * @param {function} callback Función que recibirá el objeto error y el resultado
     * 
     */
    searchUser(email, callback){

        this.pool.getConnection((err, connection) =>{

            if(err){
                callback(err); return;
            }

            connection.query("SELECT * FROM users WHERE email = ?",
            [email],
            (err, rows) =>{

                if(err){
                    callback(err);return;
                }
                
                connection.release();
                
                if (rows.length === 0)
                    callback(null, false);
                else
                    callback(null, true);
            });
        });
    }//searchUser

    /**
     * Inserta un nuevo usuario con todos sus datos en la base de datos. 
     *  (--> primera iteración lo haremos sin imagen de perfil)
     * 
     * Resultado de la operacion:
     * (si se ha insertado correctamente --> devuelve el id del nuevo usuario)
     * (si no --> devuelve null)
     *
     * @param {object} user objeto con los datos del usuario
     * @param {function} callback Función que recibirá el objeto error y el resultado
     * 
     */
    createUser(user, callback){

        this.pool.getConnection((err, connection) =>{
            
            if(err){
                callback(err); return;
            }

            connection.query("INSERT INTO users (email, password, date, gender) VALUES (?, ?, ?, ?)",
            [user.email, user.password, user.date, user.gender],
            (err, result) =>{
                
                if(err){
                    callback(err);return;
                }
                
                connection.release();
                
                if (result !== null)
                    callback(null, result.insertId);
                else
                    callback(null, null);
            });
        });
    }//createUser


    /**
     * Dado un email devuelve los todos los datos de dicho ususario.
     * 
     * @param {string} email correo del usuario.
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    getUser(email, callback){

        this.pool.getConnection((err, connection) =>{

            if(err){
                callback(err); return;
            }

            connection.query("SELECT * FROM users WHERE email = ?",
            [email],
            (err, result) =>{

                if(err){
                    callback(err);return;
                }
                    
                connection.release();

                callback(null, result);
            });
        });
    }//gerUser

    /**
     * Modifica usuarioen la base de datos. 
     *  (--> primera iteración lo haremos sin imagen de perfil)
     * 
     * Resultado de la operacion:
     * (true --> si se ha modificado correctamente)
     * (false --> si no)
     *
     * @param {object} user objeto con los datos del usuario
     * @param {function} callback Función que recibirá el objeto error y el resultado
     * 
     */
    modifyUser(user, callback){

        this.pool.getConnection((err, connection) =>{
            
            if(err){
                callback(err); return;
            }

            connection.query("UPDATE users SET password = ?, name = ?, surname = ?, date = ?, gender = ? WHERE email = ?",
            [user.password, user.name, user.surname, user.date, user.gender, user.email],
            (err, result) =>{

                if(err){
                    callback(err);return;
                }
                    
                connection.release();

                callback(null, result);
            });

        });   
    }//modifyUser


}//DAOUsers

module.exports = {
    DAOUsers: DAOUsers
}