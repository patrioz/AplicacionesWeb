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
     * Dadas una respuesta alternativa la asocia a la pregunta en la base de datos.
     * 
     * @param {object} answers respuesta alternativa
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    addAlternativeAnswer(idQuestion, answers, callback){

        this.pool.getConnection((err, connection) => {
            
            if (err){
                callback(err); return;
            }

            let query= "INSERT INTO answers (idQuestion, answerText) VALUES ?";

            let insert = [];

            insert.push([idQuestion, answers]);

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
     * @param {int} userId id del usario actual
     * @param {function} callback 
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
     * Devuelve la lista de amigos que han constestado a la pregunta elegida y
     * aun no ha sido adib¡vinada por el usuario actual
     * 
     * @param {int} idQuestion id de la pregunta la cual se quiere obtener las respuestas 
     * @param {int} isUser id del usario actual
     * @param {function} callback 
     */
    friendsNotAnswer(idUser, idQuestion, callback){

        this.pool.getConnection((err, connection) => {
            
            if (err){
                callback(err); return;
            }

            connection.query("SELECT f.user2 AS idFriend, u.name AS nameFriend, u.surname AS surnameFriend " +
                            "FROM users u JOIN friendship f ON (f.user2 = u.idUser) " +
                            "WHERE user1 = ? " +
                            "AND f.user2 NOT IN " +
                            "(SELECT friendship.user2 FROM answers_friends af JOIN friendship " +
                            " WHERE f.user2= friendship.user2 AND friendship.user2 = af.userFriend and af.question = ?) " +
                            "UNION " +
                            "SELECT f.user1 AS idFriend, u.name AS nameFriend, u.surname AS surnameFriend " +
                            "FROM users u JOIN friendship f ON (f.user1 = u.idUser) " +
                            "WHERE user2 = ? " +
                            "AND f.user1 NOT IN " +
                            "(SELECT friendship.user1 FROM answers_friends af JOIN friendship " +
                            "WHERE f.user1= friendship.user1 AND friendship.user1 = af.userFriend and af.question = ?)",
            [idUser, idQuestion, idUser, idQuestion],
            (err,rows)=>{

                if(err){
                    callback(err); return;
                }

                connection.release();
                callback(null, rows);
            });
        });
    }//friendsNotAnswer


    /**
     * Devuelve la lista de amigos que han constestado a la pregunta elegida y
     * que ademas ya han sido adivinadas por el usuario actual.
     * 
     * @param {int} idQuestion id de la pregunta la cual se quiere obtener las respuestas 
     * @param {int} isUser id del usario actual
     * @param {function} callback 
     */
    friendsAnswer(idUser, idQuestion, callback){

        this.pool.getConnection((err, connection) => {
            
            if (err){
                callback(err); return;
            }

            connection.query("SELECT u.idUser AS idFriend, u.name AS nameFriend, " +
                            "u.surname AS surnameFriend, af.answer AS result " + 
                            "FROM answers_friends af JOIN users u ON (u.idUser = af.userFriend) " +
                            "WHERE af.userMe = ? AND af.question = ?",
            [idUser, idQuestion],
            (err,rows)=>{
                
                

                if(err){
                    callback(err); return;
                }

                    connection.release();
                    callback(null, rows);
            });
        });
    }//friendsAnswer


    /**
     * Devuelve una lista de respuestas aleatorias entre las que se encuentra
     * la elegida por el amigo por el cual vamos a adivinar.
     * 
     * @param {int} idQuestion id de la pregunta la cual se quiere obtener las respuestas 
     * @param {int} idFriend id_amigo del cual queremos obtener las respuestas
     * @param {int} cont contador para saber el numero de repuestas que necesitamos.
     * @param {function} callback 
     */
    randAnswerWithCorrect(idQuestion, idFriend, cont, callback){

        cont = cont - 1;

        this.pool.getConnection((err, connection) => {
            
            if (err){
                callback(err); return;
            }

            connection.query("SELECT idQuestion, questionText, idAnswer, answerText, 1 as correct " + 
                            "FROM questions NATURAL JOIN answers " +
                            "WHERE idQuestion = ? AND idAnswer = " +
                            "(SELECT answer FROM answers_self WHERE question = ? AND user = ?) " +
                            "UNION " +
                            "(SELECT idQuestion, questionText, idAnswer, answerText, 0 as correct " +
                            "FROM questions NATURAL JOIN answers " +
                            "WHERE idQuestion = ? AND idAnswer NOT IN " +
                            "(SELECT answer FROM answers_self WHERE question = ? AND user = ?) " +
                            "ORDER BY rand() LIMIT ?) " + 
                            "ORDER BY idAnswer",
            [idQuestion, idQuestion, idFriend, idQuestion, idQuestion, idFriend, cont],
            (err,rows)=>{

                

                if(err){
                    callback(err); return;
                }

                connection.release();
                callback(null, rows);
            });
        });
    }//randAnswerWithCorrect


     /**
     * Devuelve el contador de respuestas de una pregunta.
     * 
     * @param {int} idQuestion id de la pregunta la cual se quiere obtener las respuestas 
     * @param {function} callback 
     */
    getContQuestion(idQuestion, callback){

        this.pool.getConnection((err, connection) => {
            
            if (err){
                callback(err); return;
            }

            connection.query("SELECT cont FROM `questions` WHERE idQuestion = ?",
            [idQuestion],
            (err,rows)=>{

                if(err){
                    callback(err); return;
                }
                connection.release();
                callback(null, rows[0].cont);
            });
        });
    }//getContQuestion


    checkAnswer(idQuestion, idFriend, idAnswer, callback){

        this.pool.getConnection((err, connection) => {
            
            if (err){
                callback(err); return;
            }

            connection.query("SELECT * FROM `answers_self` WHERE question = ? AND answer = ? AND user = ?",
            [idQuestion, idAnswer, idFriend],
            (err,result)=>{

                if(err){
                    callback(err); return;
                }
                else{

                    connection.release();

                    if(result.length === 0)
                        callback(null, false);
                    else
                        callback(null, true);
                }//else
            });
        });
    }//checkAnswer

    createAnswerFriend(idQuestion, idUser, idFriend, result, callback){

        this.pool.getConnection((err, connection) => {
            
            if (err){
                callback(err); return;
            }

            connection.query("INSERT INTO answers_friends (question, userMe, userFriend, answer) VALUES (?, ?, ?, ?)",
            [idQuestion, idUser, idFriend, result],
            (err,result)=>{

                if(err){

                    callback(err); return;
                }

                connection.release();
                callback(null, result.insertId);
            });
        });
    }//createAnswerFriend

}//DAOAnswers


module.exports = {
    
    DAOQuestions: DAOQuestions
}



