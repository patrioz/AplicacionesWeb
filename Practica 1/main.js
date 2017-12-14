
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
const sessionStore = new mySqlStore({
    host: "localhost",
    user: "root",
    password: "",
    database: "practica1_aw"
});
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

    response.render("login", {errMsg:null});
});


/**
 * Muestra la pagina de registro de nuevo usuario.
 * Mensaje de error NULO.
 */
app.get("/checkIn.html", (request, response) => {
    
        response.render("check_in", {errMsg:null});
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
            if(encontrado !== null)
                response.render("check_in", {errMsg:"Este email ya está registrado"});
            else{

                daoU.createUser(request.body, (err, result) =>{
                    console.log(result);
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
                        else
                            response.render("check_in", {errMsg:"Error al registrar el usuario"});
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
            else
                response.render("login", {errMsg:"Correo y/o contraseña incorrecta"});
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
            app.locals.scoreUser = user_fields.score;
            response.render("profile", {user:user_fields});
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
            response.render("modifyProfile", {user:user_fields, errMsg:null});
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
                        response.render("modifyProfile", {user:user_fields, errMsg:"Error al modificar el usuario"});
                    }
                });
            }//else
        }//elss
    });
});

//--------------------------------------


//Muestra la pagian de los amigos.
//Tanto los que están pendientes de aceptacion
//Como los que estan en nuestra lista de amigos.
app.get("/friends", userId, (request, response) =>{

    daoF.readFriendship(request.session.idUser, (err, list) => {

        if(err){
            response.status(400);
            response.end();
        }//if
        else{
            response.status(200);
            let requestFriends = [];
            let friends = [];

            if(list !== null){
                list.forEach(friend =>{
                    if(friend.request === 0)
                        friends.push(friend);
                    else
                        requestFriends.push(friend);
                });//foreach
                response.render("friends", {friends:friends, requestFriends:requestFriends});
            }//if
            else{
                response.render("friends", {friends:null, requestFirends:null});
            }//else
        }//else
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
                
                if(list !== null){
                    console.log(list);
                    response.render("searchFriends", {infMsg: "Resultado de la búsqueda con: '" + request.body.nombre_campo + "'", listSearch:list});
                }//if
                else{
                    response.render("searchFriends", {infMsg: "No se han econtrado coincidencias con: '" + request.body.nombre_campo + "'", listSearch:null});
                }//else
            }//else
        })
    }//if
    else
        response.render("searchFriends", {infMsg: "Introduzca un valor en la barra buscadora", listSearch:null});
        
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


//Realiza una peticion de amistad a otro usuario.
app.post("/request_friendship", userId, (request, response) => {


});

/******************************************************************************************** */
/******************************************************************************************** */


app.listen(config.port, function (err) {
    if (err){
        console.log("No se ha podido iniciar el servidor.")
        console.log(err);
    }
    else
        console.log(`Servidor escuchando en puerto ${config.port}.`);
});//app.listen