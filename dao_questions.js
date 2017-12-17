"use strict";

class DAOQuestions {
    /**
     * Inicializa el DAO de preguntas-respuestas.
     * 
     * @param {Pool} pool Pool de conexiones MySQL. Todas las operaciones
     *                    sobre la BD se realizarán sobre este pool.
     */
    constructor(pool) {
        this.pool = pool;
    }



    /**
     * Devuelve 5 preguntas aleatoriamente
     * 
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    getRandomQuestions(callback) {
        
        this.pool.getConnection((err, connection) => {
                    
            if (err){ 
                callback(err); return;
            }

            connection.query("SELECT idQuestion, questionText FROM questions " +
                             "ORDER BY RAND() LIMIT 5",    
            (err, rows) => {
            
                if(err){
                    callback(err); return;
                }

                connection.release();
                                
                if (rows.length === 0)
                    callback(null, null);
                else{
                    callback(null, rows);
                }
            });
        });
    }//getRandomQuestions


    /**
     * Dadas una pregunta la registra en la base de datos.
     * 
     * @param {object} newQuestion datos de la nueva pregunta
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    createQuestion(newQuestion, n_answers, callback){

        this.pool.getConnection((err, connection) => {
            
            if (err){
                callback(err); return;
            }

            connection.query("INSERT INTO questions (questionText, cont) VALUES (?, ?)",
            [newQuestion, n_answers],
            (err, result) => {
                
                if(err){
                    callback(err); return;
                }
                connection.release();
                callback(null, result.insertId);
            });
        });
    }//createQuestion

    
    /**
     * Dadas las respuestas de una pregunta, las alamcena en la base de datos.
     * 
     * @param {object} answers array de respuestas
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    addAnswer(idQuestion, answers, callback){

        this.pool.getConnection((err, connection) => {
            
            if (err){
                callback(err); return;
            }

            let query= "INSERT INTO answers (idQuestion, answerText) VALUES ?";

            let insert = [];

            for(let i =0; i < answers.length; i++){

                insert.push([idQuestion, answers[i]]);
            }
            connection.query(query,
            [insert],
            (err, result) => {
                
                    if(err){
                        callback(err); return;
                    }
                    connection.release();
                    callback(null, result.insertId);
            });
        });
    }//createQuestion


    /**
     * Dado los parametros de entrada alamacena en la base de datos
     * una respuesta para una determinada pregunta contestada por el usuario actual 
     * 
     * @param {int} idQuestion identificador de la pregunta
     * @param {int} idAnswer identificador de la respuesta
     * @param {int} idUser identificador del usuario actual
     * @param {function} callback Función que recibirá el objeto error y el resultado
     * 
     */
    createAnswer(idQuestion, idAnswer, idUser, callback){

        this.pool.getConnection((err, connection) => {
            
            if (err){
                callback(err); return;
            }
            connection.query("INSERT INTO answers_self (question, answer, user) VALUES (?, ?, ?)",
            [idQuestion, idAnswer, idUser],
            (err, result) => {
                
                if(err){
                    callback(err); return;
                }
                connection.release();
                callback(null, result.insertId);
            });
        });
    }//createAnswer


    /**
     * Dado un id de pregunta, devuelve su texto.
     * 
     * @param {*} idQuestion id de la pregunta la cual se quiere obtener el texto
     * @param {*} callback Función que recibirá el objeto error y el resultado
     */
    getQuestion(idQuestion, callback){

        this.pool.getConnection((err, connection) => {
            
            if (err){ 
                callback(err); return;
            }

            connection.query("SELECT * FROM questions WHERE idQuestion = ?",
            [idQuestion],
            (err, question) => {
                            
                if(err){
                    callback(err); return;
                }

                connection.release();

                if(question.length === 0)
                    callback(null, null);

                else
                    callback(null, question[0]);
            });
        });
    }//getQuestion

    /**
     * Dado el id de una pregunta, devuelve los datos de la pregunta y
     * sus correspondientes respuestas
     * 
     * @param {*} idQuestion id de la pregunta la cual se quiere obtener las respuestas
     * @param {*} callback Función que recibirá el objeto error y el resultado 
     */
    getAnswers(idQuestion, callback){
        
        this.pool.getConnection((err, connection) => {
            
            if (err){ 
                callback(err); return;
            }

            connection.query("SELECT questions.idQuestion, questions.questionText, answers.idAnswer, answers.answerText " + 
                             "FROM questions LEFT JOIN answers " +
                             "ON answers.idQuestion = questions.idQuestion " +
                             "WHERE questions.idQuestion = ?",
            [idQuestion],
            (err, result) => {
                            
                if(err){
                    callback(err); return;
                }
                
                connection.release();

                if(result.length === 0)
                    callback(null, null);

                else
                    callback(null, result);
            });
        });
    }//getQuestion



    /**
     * Dado un identificador de pregunta y de usuario consulta si se ha respondido o no
     * 
     * @param {*} idQuestion id de la pregunta la cual se quiere obtener las respuestas 
     */
    findAnswer(idQuestion, idUser, callback){

        this.pool.getConnection((err, connection) => {
            
            if (err){ 
                callback(err); return;
            }

            connection.query("SELECT * FROM answers_self WHERE question = ? AND user = ?",
            [idQuestion, idUser],

            (err, result) => {
                
                if(err){
                    callback(err); return;
                }
                
                connection.release();

                if(result.length === 0)
                    callback(null, false);
                else
                    callback(null, true);
            });
        });
    }//findAnswer


    /**
     * Devuelve la lista de amigos que han constestado a la pregunta elegida y en qu estado se encuetra.
     * 
     * @param {int} idQuestion 
     * @param {int} userId 
     * @param {function} callback 
     */
    answerCorrect(idQuestion, userId, callback){

        this.pool.getConnection((err, connection) => {
            
        if (err){
            callback(err); return;
        }
  
        
        connection.query("SELECT users.idUser, users.name, answers_friends.answer as result "+
                        "FROM users JOIN friendship ON (users.idUser = friendship.user2) "+
                        "LEFT JOIN answers_self ON (friendship.user2 = answers_self.user AND answers_self.question = ? ) "+
                        "LEFT JOIN answers_friends ON (answers_friends.userFriend = answers_self.user "+
                        "AND answers_friends.question = answers_self.question) "+
                        "WHERE friendship.user1 = ?",
        [idQuestion, userId],
        (err,rows)=>{

            if(err){
                callback(err); return;
            }
            else
                callback(null, rows);
        });
    });
    }//answerCorrect

}//DAOAnswers


module.exports = {
    
    DAOQuestions: DAOQuestions
}



