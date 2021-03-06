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
     * Determina si un determinado usuario aparece en la BD con la contraseña
     * pasada como parámetro.
     * 
     * Es una operación asíncrona, de modo que se llamará a la función callback
     * pasando, por un lado, el objeto Error (si se produce, o null en caso contrario)
     * y, por otro lado, el id, indicando el resultado de la operacion
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
            (err, result) =>{

                if (err) { 
                    callback(err);return;//el segunda parametro es undefined, no hace falta ponerlo.
                }

                connection.release();

                if(result.length === 0)
                    callback(null, null);
                else
                    callback(null, result[0].idUser);
            });
        });
    }//isUserCorrect


    //*********************************************************************************************************************** */


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

            connection.query("INSERT INTO users (email, password, name, surname, date, gender, img) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [user.email, user.password, user.name, user.surname, user.date, user.gender, user.img],
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


    //***********************************************************************************************************************


    /**
     * Modifica usuario en la base de datos. 
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
            
            connection.query("UPDATE users SET password = ?, name = ?, surname = ?, date = ?, gender = ?, img = ? WHERE email = ?",
            [user.password, user.name, user.surname, user.date, user.gender, user.img, user.email],
            (err, result) =>{

                if(err){
                    callback(err);return;
                }

                connection.release();
                if(result.changedRows === 0)
                    callback(null, false);
                else
                    callback(null, true);
            });

        });   
    }//modifyUser



    //***********************************************************************************************************************

    /**
     * Dado un id de usuario devuelve la iamgen de dicho usuario.
     * 
     * @param {int} idUSer identificador del usuario del que se quiere obtener la imagen.
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    getImg(idUser, callback){
        
        this.pool.getConnection((err, connection) =>{

            if(err){
                callback(err); return;
            }

            connection.query("SELECT img FROM users WHERE idUser = ?",
            [idUser],
            (err, result) =>{

                if(err){
                    callback(err);return;
                }
                connection.release();

                if(result.length === 0)
                    callback(null,null);
                else
                    callback(null, result[0].img);
            });
        });
    }//readUser



    //***********************************************************************************************************************

    /**
     * Dado un id devuelve los todos los datos de dicho ususario.
     * 
     * @param {int} id identificador del usuario que se quiere encontrar.
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    readUser(id, callback){
        
        this.pool.getConnection((err, connection) =>{

            if(err){
                callback(err); return;
            }

            connection.query("SELECT * FROM users WHERE idUser = ?",
            [id],
            (err, user) =>{

                if(err){
                    callback(err);return;
                }
                    
                connection.release();
                callback(null, user[0]);
            });
        });
    }//readUser


    //***********************************************************************************************************************


    /**
     * Devuelve todos los usuarios registrasdos en la base de datos.
     * 
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    readAll(callback){
        
        this.pool.getConnection((err, connection) =>{

            if(err){
                callback(err); return;
            }

            connection.query("SELECT * FROM users ORDER BY name",
            (err, users) =>{

                if(err){
                    callback(err);return;
                }
                    
                connection.release();
                callback(null, users);
            });
        });
    }//readAll


    //***********************************************************************************************************************


    /**
     * Dado un email devuelve todos los datos de dicho usuario
     * 
     * Resultado de la operacion:
     *  (true --> si el usuario ya esta registrado con ese email)
     *  (false --> si no existe ningun usuario con ese email)
     * 
     * @param {string} email Identificador del usuario a buscar
     * @param {function} callback Función que recibirá el objeto error y el resultado
     * 
     */
    findByEmail(email, callback){

        this.pool.getConnection((err, connection) =>{

            if(err){
                callback(err); return;
            }

            connection.query("SELECT * FROM users WHERE email = ?",
            [email],
            (err, user) =>{

                if(err){
                    callback(err);return;
                }
                
                connection.release();
                if(user.length === 0)
                    callback(null, null);
                else
                    callback(null, user[0]);
            });
        });
    }//findByEmail


    //***********************************************************************************************************************


    /**
     * Dado un nombre devuelve todos los usarios coincidientes,
     * total o parcialmente con el mismo.
     * 
     * 
     * @param {string} name Nombre del usuario que se quiere buscar
     * @param {function} callback Función que recibirá el objeto error y el resultado
     * 
     */
    findByName(name, id, callback){

        this.pool.getConnection((err, connection) =>{

            if(err){                         
                callback(err); return;
            }

            connection.query("SELECT users.idUser, users.name, users.surname FROM users " +
                             "WHERE users.idUser != ? AND (name LIKE ? OR surname LIKE ?)",
            [id, "%" + name + "%", "%" + name + "%"],
            (err, users) =>{

                if(err){
                    callback(err);return;
                }
                connection.release();

                if(users.length === 0)
                    callback(null, null);
                else
                    callback(null, users);
            });
        });
    }//findByName 

    modifyScore(idUser, score, callback){

        this.pool.getConnection((err, connection) =>{

            if(err){                         
                callback(err); return;
            }

            connection.query("UPDATE users SET score = ? WHERE idUser = ?",

            [score, idUser],
            (err, result) =>{

                if(err){
                    console.log(err);
                    callback(err);return;
                }
                connection.release();

                if(result.changedRows === 0)
                    callback(null, false);
                else
                    callback(null, true);
            });
        });
    }

}//DAOUsers

module.exports = {
    DAOUsers: DAOUsers
}