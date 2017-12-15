
"use strict";

//______________________________________ MODULOS _______________________________________

const express = require("express");
const mysql = require("mysql");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const mySql_session = require("express-mysql-session");

//****************  MODULOS LOCALES  *****************  
//****************************************************
const config = require("./config");
const daoUsers = require("./dao_users");
const daoFriends = require("./dao_friends");
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
}//userMail

function userMail (request, response, next){
    
    if(request.session.emailUser)
        next();
    else
        response.redirect("/login.html");
}//userMail

//Controla los mesajes flash de la aplicacion.
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
function deleteFriends (request, respnse, next){

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
//______________________________________________________________________________



//____________________________________ APARTADO 1 ________________________________

/**
 * Muestra la pagina de logueo
 * Mensaje de error NULO.
 */
app.get("/login.html", (request, response) => {

    response.render("login");
});


/**
 * Muestra la pagina de registro de nuevo usuario.
 * Mensaje de error NULO.
 */
app.get("/checkIn.html", (request, response) => {
    
    response.render("check_in");
});


/**
 * Manejador para el registro de un nuevo usuario.
 *  Busca si existe un usario con el mismo email ya registrado.
 *  (existe --> mensaje de error informando)
 *  (no exisite --> se procede al registro del nuevo usuario)
 */
app.post("/check_in", (request, response) =>{

    daoU.findByEmail(request.body.email, (err, encontrado) =>{
        
        if(err){
            response.status(400);
            response.end();
        }
        else{
            response.status(200);
            if(encontrado !== null){
                response.setFlash("Este email ya está registrado");
                response.render("check_in");
            }
            else{

                daoU.createUser(request.body, (err, result) =>{
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
            response.locals.scoreUser = user_fields.score;
            let age = getAge(user_fields.date);
            console.log(age);
            response.render("profile", {user:user_fields, age});
        }
    });
});


/**
 * Muestra la vista para modificar el perfil
 * Obtiene los datos de usuario actual y los pasa al formualrio.
 */
app.get("/modifyProfile.html", userId, (request, response) =>{

    daoU.readUser(request.session.idUser, (err, user_fields) =>{

        if(err){
            response.status(400);
            response.end();
        }
        else{
            response.status(200);
            response.render("modifyProfile", {user:user_fields});
        }
    });

});

app.post("/modifyProfile", userMail, userId, (request, response) =>{

    let user = request.body;
    user.email = request.session.emailUser;

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
                        response.setFlash("rror al modificar el usuario");
                        response.render("modifyProfile", {user:user_fields});
                    }
                });
            }//else
        }//elss
    });
});


//Muestra la pagian de los amigos.
//Tanto los que están pendientes de aceptacion
//Como los que estan en nuestra lista de amigos.
app.get("/friends", userId, deleteFriends, (request, response) =>{

    //COLOCAR EL DAO READREQUESTFRIENDS Y ASOCIARLO AL ARRAY REQUESTFRIENDS

    //BUSCR LA FORMA DE MOSTRAR UNICAMENTE LOS AMIGOS.

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

//Muestra la inforamcion del perfil del usuario que hemos seleccionado.
app.get("/profileFriend/:id", userId, (request, response) => {

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

//Muestra los usuario los cuales coincidan con la cadena que hemos introducido
//con la posibilidad de enviar una solicitud de amistad.
app.post("/search", userId, (request, response) =>{

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
        
      
        
//¿DEBERÍAN APARARECER EN LA LISTA DE AMIGOS BUSCADOS UNICAMENTE
//AQUELLOS QUE NO TENGAN SOLICITUD DE AMISTAD O SEAN AMIGOS?

/*     let listaAmigos = [];

    //Obtiene una lista con los amigos del usario actual.
    daoF.readFriendship(request.session.idUser, (err, list) => {
        
        if(err){
            response.status(400);
            response.end();
        }//if
        else{
            response.status(200);
            listaAmigos = list;
        }
    });

    let listaNombre = [];

    //Encuentra los nombre que coinciden con la cadena introducida.
    daoU.findByName(request.body.nombre_campo, request.session.idUser, (err, list) => {
        
        if(err){
            response.status(400);
            response.end();
        }
        else{
            response.status(200);
            listaNombre = list;
        }
    });

    //Hay que encontrar la forma de obtener una lista solo con los usuarios que no sean amigos del USUARIO ACTUAL. */
});


//Realiza una peticion de amistad a otro usuario,
//en el caso de que no sean amigos o que la peticion ya haya sido recibida o solicitada.
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

/******************************************************************************************** */
/******************************************************************************************** */

function getAge(fecha) {
    var hoy = new Date();
    var cumpleanos = new Date(fecha);
    var edad = hoy.getFullYear() - cumpleanos.getFullYear();
    var m = hoy.getMonth() - cumpleanos.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) {
        edad--;
    }

    return edad;
}

app.listen(config.port, function (err) {
    if (err){
        console.log("No se ha podido iniciar el servidor.")
        console.log(err);
    }
    else
    console.log(`Servidor escuchando en puerto ${config.port}.`);
});//app.listen