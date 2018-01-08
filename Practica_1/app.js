
"use strict";

//______________________________________ MODULOS _______________________________________

const express = require("express");
const mysql = require("mysql");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const mySql_session = require("express-mysql-session");
const multer = require("multer");
const fs = require("fs");
var expressValidator = require("express-validator");

//****************  MODULOS LOCALES  *****************  
//****************************************************
const config = require("./config");
const daoUsers = require("./dao_users");
const daoFriends = require("./dao_friends");
const daoQuestions = require("./dao_questions");

const upload = multer({ storage: multer.memoryStorage() });
//*****************************************************
const app = express();
//_______________________________________________________________________________________



//________________________________ MOTORES DE APLICACIÓN ________________________________

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//_______________________________________________________________________________________



//________________________________ MIDDLEWARE _________________________________

const ficherosEstaticos = path.join(__dirname, "public");

const mySqlStore = mySql_session(session);
const sessionStore = new mySqlStore(config.mysqlConfig);
const middlewareSession = session({
    saveUninitialized: false,
    secret: "foobar34",
    resave: false,
    store: sessionStore
});

function userId (request, response, next){
    
    if(request.session.idUser)
        next();
        
    else
        response.redirect("/login.html");
}//userID

function userMail (request, response, next){
    
    if(request.session.emailUser)
        next();
    else
        response.redirect("/login.html");
}//userMail

/**
 * Controla los mensajes flash de la aplicacion.
 */
app.use((request, response, next) => {
    response.setFlash = (str) => {
        request.session.flashMessage = str;
    }
    response.locals.getFlash = () => {
        let mensaje = request.session.flashMessage;
        delete request.session.flashMessage;
        return mensaje;
    }
    next();
});

//Hace una limipia de la amistades rechazadas por e usuario
//De esta forma no constan como amigos pero se pueden
//volver a mandar peticiones de amistad
function deleteFriends (request, response, next){

    daoF.deleteFriendship((err,callback) =>{

        if(err){
            response.status(400);
            response.end();
        }
        else
            next();
    });
};

app.use(express.static(ficherosEstaticos));
app.use(middlewareSession);
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator())
//______________________________________________________________________________



//__________________________________ CONEXION ___________________________________

let pool = mysql.createPool({
    database: config.mysqlConfig.database,
    host: config.mysqlConfig.host,
    user: config.mysqlConfig.user,
    password: config.mysqlConfig.password
});
let daoU = new daoUsers.DAOUsers(pool);
let daoF = new daoFriends.DAOFriends(pool);
let daoQ = new daoQuestions.DAOQuestions(pool);
//______________________________________________________________________________



//____________________________________ APARTADO 1 ________________________________

/**
 * Muestra la pagina de logueo
 */
app.get("/login.html", (request, response) => {

    response.render("login");
});


/**
 * Muestra la pagina de registro de nuevo usuario.
 */
app.get("/checkIn.html", (request, response) => {
    
    response.render("check_in", {err:[], user:{}});
});


/**
 * Manejador para el registro de un nuevo usuario.
 *  Busca si existe un usario con el mismo email ya registrado.
 *  (existe --> mensaje de error informando)
 *  (no exisite --> se procede al registro del nuevo usuario)
 */
app.post("/check_in", upload.single("foto"), (request, response) =>{

    request.checkBody("email", "Email vacio").notEmpty();
    request.checkBody("email", "Direccion de correo no valida").isEmail();
    request.checkBody("password", "Contraseña vacia").notEmpty();
    request.checkBody("name", "Nombre vacio").notEmpty();
    request.checkBody("surname", "Apellido vacio").notEmpty();
    request.checkBody("date", "Fecha de nacimiento no válida").isBefore();

    request.getValidationResult().then((result) => {

        if (result.isEmpty()) {

            let user = {
                email: request.body.email,
                password: request.body.password,
                name: request.body.name,
                surname: request.body.surname,
                date: request.body.date,
                gender: request.body.gender,
                img: null
            };
            
            daoU.findByEmail(request.body.email, (err, encontrado) =>{
                
                if(err){
                    response.status(400);
                    response.end();
                }
                else{
                    response.status(200);
                    if(encontrado !== null){
                        response.setFlash("Este email ya está registrado");
                        response.render("check_in", {err:[], user:user});
                    }
                    else{
        
                        if (request.file) {
                            user.img = request.file.buffer;
                        }
        
                        daoU.createUser(user, (err, result) =>{
        
                            if(err){
                                response.status(400);
                                response.end();
                            }
                            else{
                                response.status(200);
        
                                if(result !== null){
                                    request.session.emailUser = request.body.email;
                                    request.session.idUser = result;
                                    response.redirect("/profile");
                                }
                                else{
                                    response.setFlash("Error al registrar el usuario");
                                    response.render("check_in");
                                }
                                    
                            }//else          
                        });//createUser
                    }//else
                }//else
            });//searchUser
        }
        else {

            let incorrectUser = {
                email: request.body.email,
                password: request.body.password,
                name: request.body.name,
                surname: request.body.surname,
                date: request.body.date,
                gender: request.body.gender
            };

            response.render("check_in", {err: result.mapped(), user: incorrectUser})

        }//else
    });
});

/**
 * Dado un identificador de usuario, devuelve su imagen de perfil.
 */
app.get("/imagen/:id", (request, response) => {

    daoU.getImg(request.params.id, (err, imagen) => {

        if (imagen) {
            response.end(imagen);
        }
        else {
            response.status(404);
            response.end();
        }
    });
});

/**
 * Verifica credenciales de usuario.
 * (si son correctas --> redirige a al manejador de perfil)
 * (si no --> muestra la pagina de logueo con mensaje de error)
 */
app.post("/connect", (request, response) => {

    daoU.isUserCorrect(request.body.email, request.body.password, (err, callback) =>{

        if(err){
            response.status(400);
            response.end();
        }
        else{
            response.status(200);
            if(callback !== null){
                request.session.emailUser = request.body.email;
                request.session.idUser = callback;
                response.redirect("/profile");
            }
            else{
                response.setFlash("Correo y/o contraseña incorrecta");
                response.render("login");
            }
                
        }//else
    });
});


/**
 * Elimina los datos almacenados en la sesion y cierra la sesion del usuario actual.
 * Redirege a la pagina de logueo.
 */
app.get("/logout", (request, response) => {
    
        request.session.destroy();
        response.redirect("/login.html");
});


/**
 * Manejador que obitiene los datos del usuario logueado y los muestra en la vista de perfil
 * Guarda los datos de usuario en local para poder ser usados por la vista.
 * Redirige a la vista de perfil.
 */
app.get("/profile", userId, (request, response) =>{

    daoU.readUser(request.session.idUser, (err, user_fields) =>{

        if(err){
            response.status(400);
            response.end();
        }
        else{
            response.status(200);
            request.session.scoreUser = user_fields.score;
            response.locals.scoreUser = user_fields.score;
            response.locals.idUser= request.session.idUser;
            let age = getAge(user_fields.date);
            response.render("profile", {user:user_fields, age});
        }
    });
});


/**
 * Manejador que muestra la inforamcion del perfil del usuario actual
 * en el formato del formulario de registro, dando la posiblidad de cambiar los datos que se deseen.
 */
app.get("/modifyProfile.html", userId, (request, response) =>{

    response.locals.scoreUser = request.session.scoreUser;
    response.locals.idUser= request.session.idUser;

    daoU.readUser(request.session.idUser, (err, user_fields) =>{

        if(err){
            response.status(400);
            response.end();
        }
        else{
            response.status(200);
            response.render("modifyProfile", {err: [], user:user_fields});
        }
    });
});


/**
 * Modifica los datos del usuario actual
 * (si tiene exito --> vuelve a la vista de perfil con los datos actualizados)
 * (si no --> vuelve a mostrar los datos en el formualario para vovler a modificar)
 */
app.post("/modifyProfile", userMail, userId, (request, response) =>{

    response.locals.scoreUser = request.session.scoreUser;
    response.locals.idUser= request.session.idUser;

    request.checkBody("password", "Contraseña vacia").notEmpty();
    request.checkBody("name", "Nombre vacio").notEmpty();
    request.checkBody("surname", "Apellido vacio").notEmpty();
    request.checkBody("date", "Fecha de nacimiento no válida").isBefore();

    request.getValidationResult().then((result) => {
        
        if (result.isEmpty()) {

            let user = request.body;
            user.email = request.session.emailUser;
            
            if (request.file) {
                user.img = request.file.buffer;
            }

            daoU.modifyUser(user, (err, result) =>{
                
                if(err){
                    response.status(400);
                    response.end();
                }
                else{
                    response.status(200);
        
                    if(result)
                        response.redirect("/profile");
        
                    else{
        
                        daoU.readUser(request.session.idUser, (err, user_fields) =>{
                    
                            if(err){
                                response.status(400);
                                response.end();
                            }
                            else{
                                response.status(200);
                                response.setFlash("ERROR al modificar el usuario");
                                response.render("modifyProfile", {user:user_fields});
                            }
                        });
                    }//else
                }//else
            });
        }
        else {

            let incorrectUser = {
                email: request.body.email,
                password: request.body.password,
                name: request.body.name,
                surname: request.body.surname,
                date: request.body.date,
                gender: request.body.gender
            };

            response.render("modifyProfile", {err: result.mapped(), user: incorrectUser})

        }//else
    });
});


/**
 * Manejador que muestra la lista de amigos del usuario actual.
 * 
 * Además muestra las peticiones de amstad de nuevos usuarios.
 */
app.get("/friends", userId, deleteFriends, (request, response) =>{

    response.locals.scoreUser = request.session.scoreUser;
    response.locals.idUser= request.session.idUser;

    let id_user1 = request.session.idUser;
    let friends = [];
    let requestFriends = [];

    daoF.readRequestFriends(id_user1, (err, list_request) => {

        if(err){
            response.status(400);
            response.end();
        }
        else{
            response.status(200);
            requestFriends = list_request;

            daoF.readFriends(id_user1, (err, list_friends) => {

                if(err){
                    response.status(400);
                    response.end();
                }
                else{
                    response.status(200);
                    
                    friends = list_friends;

                    response.render("friends", {friends:friends, requestFriends:requestFriends});
                }
            });
        }
    });
});

/**
 * Manejador que muestra la informacion del perfil que se ha seleccionado
 */
app.get("/profileFriend/:id", userId, (request, response) => {

    response.locals.scoreUser = request.session.scoreUser;
    response.locals.idUser= request.session.idUser;

    daoU.readUser(request.params.id, (err, friend_fields) =>{
        
        if(err){
            response.status(400);
            response.end();
        }
        else{
            response.status(200);
            response.render("profileFriend", {user:friend_fields});
        }
    });
});


/**
 * Manejador que muestra la lista de usuarios los cuales coinciden con la cadena
 * de caracteres introducida previamente.
 * 
 * Muestre todos los usuarios registrados en la base de datos coincidentes con la cadena
 * a excepcion del propio usuario actual.
 */
app.post("/search", userId, (request, response) =>{

    response.locals.scoreUser = request.session.scoreUser;
    response.locals.idUser= request.session.idUser;

    if(request.body.nombre_campo !== ""){
        daoU.findByName(request.body.nombre_campo, request.session.idUser, (err, list) => {
            
            if(err){
                response.status(400);
                response.end();
            }
            else{
                response.status(200);
                if(list !== null)
                    response.render("searchFriends", {infMsg: "Resultado de la búsqueda con: '" + 
                                                        request.body.nombre_campo + "'",listSearch:list});
                else
                    response.render("searchFriends", {infMsg: "No se han econtrado coincidencias con: '" +
                                                        request.body.nombre_campo + "'", listSearch:null});
            }//else
        })
    }//if
    else{
        response.setFlash("Introduzca un valor en la barra buscadora");
        response.redirect("/friends");
    }
});


/**
 * Realiza una peticion de amistad a un usuario de la base de datos encontrado por la coincidencia de su nombre
 * 
 * En caso de que los usuarios ya sean amigos o la peticion de amistad ya este hecha por ambas partes
 * se lanzará un mensaje de aviso al usuario actual
 */
app.get("/request_friendship/:id_user2", userId, (request, response) => {

    let id_user1 = request.session.idUser;
    let id_user2 = request.params.id_user2;
    
    daoF.findFriendship(id_user1, id_user2, (err, request) =>{

        if(err){
            response.status(400);
            response.end();
        }
        else{
            response.status(200);

            if(request === null){

                daoF.createFrienship(id_user1, id_user2, (err, result) =>{
                    
                    if(err){
                        response.status(400);
                        response.end();
                    }
                    else{
                        response.status(200);

                        if(!result){
                            response.setFlash("ERROR al enviar la solicitud de amistad");
                            response.redirect("/friends")
                        }//if
                    }//else
                });

                response.setFlash("Solicitud de amistad enviada");
                response.redirect("/friends")
            }
            else{
                //Si el estado de la solicitud es igual a uno (request = 1), la amistad esta pendiente.
                if(request === 1){
                    response.setFlash("Esta amistad ya está solicitada");
                    response.redirect("/friends");
                }
                //por el contrario (request = 0), los usuarios ya son amigos.
                else{
                    response.setFlash("Ya eres amigo de este usuario");
                    response.redirect("/friends");
                }
                
            }//else
        }//else
    });
});


/**
 * Manejador que modifica la relacion de amistad al haber aceptado la solicitud
 */
app.get("/acceptFriend/:id", userId, (request, response) => {

    daoF.modifyFriendship(request.session.idUser, request.params.id, 0, (err,result) => {

        if(err){
            response.status(400);
            response.end();
        }//if
        else{
            response.status(200);

            if(result){
                response.setFlash("Solicitud de amistad aceptada");
                response.redirect("/friends");
            }//if
            else{
                response.setFlash("ERROR al aceptar la solicitud. Vuelva a intentarlo.");
                response.redirect("/friends");
            }//else
        }//else
    });
});


/**
 * Manejador que modifica la relacion de amistad al haber rechazado la solicitud
*/
app.get("/refuseFriend/:id", (request, response) => {
    
    daoF.modifyFriendship(request.session.idUser, request.params.id, -1, (err,result) => {

        if(err){
            response.status(400);
            response.end();
        }//if
        else{
            response.status(200);

            if(result){
                response.setFlash("Solicitud de ammistad rechazada");
                response.redirect("/friends");
            }//if
            else{
                response.setFlash("ERROR al rechazar la solicitud. Vuelva a intentarlo.");
                response.redirect("/friends");
            }//else
        }//else
    }); 
});
	
	
//________________________________________________________________________________________________________________________



//_____________________________________________________ APARTADO 2 _______________________________________________________

/**
 * Manejador quer muestra la vista de preguntas aleaotrias.
 */
app.get("/questions.html", (request, response)=>{

    response.locals.scoreUser = request.session.scoreUser;
    response.locals.idUser= request.session.idUser;

    daoQ.getRandomQuestions((err, questions) =>{

        if(err){
            response.status(400);
            response.end();
        }
        else{

            response.status(200);

            if(questions === null){
                response.setFlash("Aún no se ha creado ninguna pregunta");
                response.render("questions", {questions:null});
            }//if
            else{
                response.render("questions", {questions:questions});
            }//else
        }//else
    });
});


/**
 * Muestra la vista que permite crear una nueva pregunta.
 */
app.get("/createQuestion.html", (request, response) => {

    response.locals.scoreUser = request.session.scoreUser;
    response.locals.idUser= request.session.idUser;

    response.render("createQuestion", {err: [], res:{}});
});


//
/**
 * Manejador que inserta las nueva pregunta junto con sus repuesta.
 * 
 * Redirije a la vista de preguntas aleatorias.
 */
app.post("/createQuestion", (request, response) => {

    response.locals.scoreUser = request.session.scoreUser;
    response.locals.idUser= request.session.idUser;

    request.checkBody("answers", "Respuesta/s vacia/s").notEmpty();
    request.checkBody("question", "Pregunta vacia").notEmpty();

    request.getValidationResult().then((result) => {
        
        if (result.isEmpty()) {

            let answers = request.body.answers.split(/\n/);
            
            daoQ.createQuestion(request.body.question, answers.length, (err, idQuestion) =>{
        
                if(err){
                    response.status(400);
                    response.end();
                }
                else{
                    response.status(200);
        
                    if(idQuestion !== null){
        
                        daoQ.addAnswer(idQuestion, answers, (err, result) =>{
        
                            if(err){
                                response.status(400);
                                response.end();
                            }//if
                            else{
        
                                response.status(200);
        
                                if(result !== null){
                                    response.setFlash("La pregunta se ha creado correctamente");
                                    response.redirect("/questions.html");
                                }//if
                                else{
                                    response.setFlash("ERROR al crear la pregunta");
                                    response.redirect("/questions.html");
                                }
                            }//else
                        });
                    }//if
                    else{
                        response.setFlash("ERROR al crear la pregunta");
                        response.redirect("/questions.html");
                    }//else
                }//else
            });
        }
        else{

            let res = {
                question:request.body.question,
                answers:request.body.ansewrs
            }
            response.render("createQuestion", {err: result.mapped(), res:res});
        }//else
    });
});


/**
 * Manejador que muestra los aciertos y fallos que hemos tenido en un pregunta
 * en funcion de la respuestas de nuestro amigos. (APARTADO 3)
 * 
 * Además, deja contestar la pregunta seleccionada a nosotros mismo (APARTADO 2)
 */
app.get("/askQuestion/:idQuestion",userId, (request, response) => {

    //FALTARAN FUNCIONALIDADES O ACCESOS AL DAO PARA LA PARTE 3 DE LA PRACTICA
    //EN LA QUE LOS AMIGOS INTERVENDRÁN EN LA INTERACCION DE LA PREGUNTA.
    let idUser = request.session.idUser;
    let idQuestion = request.params.idQuestion;
    response.locals.scoreUser = request.session.scoreUser;
    response.locals.idUser= idUser;

    daoQ.getQuestion(idQuestion, (err, question) =>{

        if(err){
            response.status(400);
            response.end();
        }//if
        else{
            
            if(question === null){
                response.setFlash("ERROR al cargar la pregunta");
                response.redirect("/questions.html");
            }
            else{
                daoQ.findAnswer(idQuestion, idUser, (err,result) =>{
                    
                    if(err){
                        response.status(400);
                        response.end();
                    }//if
                    else{

                        daoQ.answerCorrect(idQuestion, idUser, (err,list_friends) =>{

                            if(err){
                                response.status(400);
                                response.end();
                            }//if
                            else{
                                response.render("askQuestion", {list_friends:list_friends, question:question, show:result})
                            }
                        });
                 
                    }//else

                });
            }
        }//else
    });
});


/**
 * Manejador que muestra las respuestas de la pregunta llegada como parametro
 */
app.get("/answerQuestion.html/:id", (request, response) =>{

    response.locals.scoreUser = request.session.scoreUser;
    response.locals.idUser= request.session.idUser;

    let idQuestion = request.params.id;

    daoQ.getAnswers(idQuestion, (err, result) =>{

        if(err){
            response.status(400);
            response.end();
        }//if
        else{
            response.status(200);
            if(result === null){
                response.setFlash("ERROR al cargar las respuestas de la pregunta");
                response.redirect("/askQuestion/" + idQuestion)
            }
            else
                response.render("answerQuestion", {question:result});
        }
    });
});


/**
 * Manejador que controla el tipo de respuesta a la preguta elegida
 * (si es alternativa la crea en la base de datos)
 * 
 * createAnswer --> asocia en la base de datos la respuesta dada por un usuario en una determianda pregunta.
 */
app.post("/createAnswer", userId, (request, response) =>{

    
    //Si el usuario ha creado una respuesta alternativa, primero hay que insertarla
    //en la base de datos como una repuesta de dihca pregunta.
    if(request.body.alternative_answer){
        let alternativeAnswer = [];
        alternativeAnswer.push(request.body.alternative_answer);

        daoQ.addAnswer(request.body.id, alternativeAnswer, (err, idAnswer) =>{

            if(err){
                response.status(400);
                response.end();
            }//if
            else{
                response.status(200);

                if(idAnswer !== null){
                    daoQ.createAnswer(request.body.id, idAnswer, request.session.idUser, (err, id_selfAnswer) =>{
                
                        if(err){
                            response.status(400);
                            response.end();
                        }//if
                        else{
                            response.status(200);
                
                            if(id_selfAnswer !== null){
                                response.setFlash("Pregunta contestada correctamente");
                                response.redirect("/questions.html");
                            }//if
                            else{
                                response.setFlash("ERROR al contestar la pregunta");
                                response.redirect("/questions.html");
                            }//else
                        }//else
                    });
                }//if
                else{
                    response.setFlash("ERROR al crear la respuestas aleatoria");
                    response.redirect("/answerQuestion.html/" + idQuestion);
                }//else
            }//else
        });
    }//if
    else{

        daoQ.createAnswer(request.body.id, request.body.answer, request.session.idUser, (err, id_selfAnswer) =>{
            
            if(err){
                response.status(400);
                response.end();
            }//if
            else{
                response.status(200);
    
                if(id_selfAnswer !== null){
                    response.setFlash("Pregunta contestada correctamente");
                    response.redirect("/questions.html");
                }//if
                else{
                    response.setFlash("ERROR al contestar la pregunta");
                    response.redirect("/questions.html");
                }//else
            }//else
        });
    }//else
});


//________________________________________________________________________________________________________________________

//_________________________________________________ FUNCIONES AUXILIARES __________________________________________________


/**
 * Funcion que dada un fecha de nacimiento devuelve la edad.
 * 
 * @param {date} fecha 
 */
function getAge(fecha) {
    var hoy = new Date();
    var cumpleanos = new Date(fecha);
    var edad = hoy.getFullYear() - cumpleanos.getFullYear();
    var m = hoy.getMonth() - cumpleanos.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) {
        edad--;
    }

    return edad;
}//getAge


//________________________________________________________________________________________________________________________

//_________________________________________________ MANEJADOR DE ESCUHA __________________________________________________

/**
 * Indicacion para le programador de que el servidor está escuchando en el puerto correcto.
 */
app.listen(config.port, function (err) {

    if (err){
        console.log("No se ha podido iniciar el servidor.")
        console.log(err);
    }
    else
        console.log(`Servidor escuchando en puerto ${config.port}.`);
        
});//app.listen