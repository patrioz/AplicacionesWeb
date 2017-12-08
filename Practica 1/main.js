
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

function userMail (request, response, next){
    
    if(request.session.currentUser)
        next();
    else
        response.redirect("/login.html");
}//userMail

app.use(express.static(ficherosEstaticos));
app.use(middlewareSession);
app.use(bodyParser.urlencoded({extended: false}));
//______________________________________________________________________________



//________________________________ CONEXION _________________________________

let pool = mysql.createPool({
    database: config.mysqlConfig.database,
    host: config.mysqlConfig.host,
    user: config.mysqlConfig.user,
    password: config.mysqlConfig.password
});
let daoU = new daoUsers.DAOUsers(pool);
//______________________________________________________________________________

/**
 * Pagina de logueo.
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

    daoU.searchUser(request.body.email, (err, encontrado) =>{
        
        if(err){
            response.status(400);
            response.end;
        }
        else{
            response.status(200);
            if(encontrado)
                response.render("check_in", {errMsg:"Este email ya está registrado"});
            else{

                let user = {};
                user.email = request.body.email;
                user.password = request.body.password;
                user.name = request.body.name;
                user.surname = request.body.surname;
                user.gender = request.body.gender;
                user.date = request.body.date;

                daoU.createUser(user, (err, callback) =>{
                    
                    if(err){
                        response.status(400);
                        response.end;
                    }
                    else{
                        response.status(200);
                        if(callback !== null){
                            request.session.currentUser = request.body.email;
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
            response.end;
        }
        else{
            response.status(200);
            if(callback){
                request.session.currentUser = request.body.email;
                response.redirect("/profile");
            }

            else
                response.render("login", {errMsg:"Correo y/o contraseña incorrecta"});
        }//else
    });
});


/**
 * Elimina los datos almacenados en la sesion.
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
app.get("/profile", userMail, (request, response) =>{

    daoU.getUser(request.session.currentUser, (err, user_fields) =>{

        if(err){
            response.status(400);
            response.end;
        }
        else{
            response.status(200);
            app.locals.scoreUser = user_fields[0].score;
            response.render("profile", {user:user_fields});
        }
    });
});

/**
 * Muestra la vista para modificar el perfil
 * Obtiene los datos de usuario actual y los pasa al formualrio.
 */
app.get("/modifyProfile.html", userMail, (request, response) =>{

    daoU.getUser(request.session.currentUser, (err, user_fields) =>{

        if(err){
            response.status(400);
            response.end;
        }
        else{
            response.status(200);
            response.render("ModifyProfile", {user:user_fields, errMsg:null});
        }
    });

});

app.post("/modifyProfile", userMail, (request, response) =>{

    let user = {};
    user.email = request.session.currentUser;
    user.password = request.body.password;
    user.name = request.body.name;
    user.surname = request.body.surname;
    user.gender = request.body.gender;
    user.date = request.body.date;

    daoU.modifyUser(user, (err, result) =>{

        if(err){
            response.status(400);
            response.end;
        }
        else{
            response.status(200);
            if(result)
                response.redirect("/profile");
            else
                response.render("check_in", {errMsg:"Error al modificar el usuario"});
        }//elss
    });
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