
"use strict";

//______________________________________ MODULOS _______________________________________

const express = require("express");
const mysql = require("mysql");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const mySql_session = require("express-mysql-session");
const multer = require("multer");
const fs = require("fs");
const moment = require('moment');
const expressValidator = require("express-validator");
const passport = require("passport");
const passportHTTP = require("passport-http");
const https = require("https");

//****************  MODULOS LOCALES  *****************  
//****************************************************
const config = require("./config");
const daoPartidas = require("./DAO/dao_partidas");
const daoUsers = require("./DAO/dao_usuarios");

const app = express();
//_______________________________________________________________________________________


//________________________________ MOTORES DE APLICACIÓN ________________________________

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//_______________________________________________________________________________________

//Certificados para HTTPS
var privateKey = fs.readFileSync("./certificados/mi_clave.pem");
var certificate = fs.readFileSync("./certificados/certificado_firmado.crt");


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

app.use(passport.initialize());
passport.use(new passportHTTP.BasicStrategy(

    { realm: 'Autenticacion' },
    function(usuario, contraseña, callback) {

        daoU.isUserCorrect(usuario, contraseña, (err, nameUser) => {

            if (err) {
                callback(err);
            }
            else {

                if(nameUser === undefined)
                    callback(null, false);
                else
                    callback(null, {nameUser: nameUser});
            }
        });
    }
));

app.use(bodyParser.json());
app.use(express.static(ficherosEstaticos));
app.use(middlewareSession);
app.use(bodyParser.urlencoded({extended: false}));
app.use(expressValidator())

//__________________________________ CONEXION ___________________________________

let pool = mysql.createPool({
    database: config.mysqlConfig.database,
    host: config.mysqlConfig.host,
    user: config.mysqlConfig.user,
    password: config.mysqlConfig.password
});
let daoU = new daoUsers.DAOUsers(pool);
let daoP = new daoPartidas.DAOPartidas(pool);

//______________________________________________________________________________

app.get("/",(request, response)=>{

    response.redirect("index.html");
});


app.post("/iniciarSesion", (request, response) => {

    let usuario = request.body.usuario;
    let contraseña = request.body.contraseña;

    daoU.isUserCorrect(usuario, contraseña, (err, nameUser) => {

        if (err) {
            response.status(500);
            response.end();
        }
        else {

            response.status(200);
            if(nameUser === undefined)
                response.json({usuario: false});
            else
                response.json({usuario: true});
        }
    });     
});


app.post("/registrarUsuario", function(request, response){

    let usuario = request.body.usuario;
    let contraseña = request.body.contraseña;

    daoU.buscarUsuario(usuario, (err, resultado)=>{

        if(err){
            response.status(500);
            response.end();
        }
        else{

            //Devolvera true, lo que significa que ya hay un usuario con ese nombre registrado
            if(resultado){
                response.status(400);
                response.end();
            }
            else{

                daoU.createUser(usuario, contraseña, (err, idUser) =>{

                    if(err){
                        response.status(500);
                        response.end();
                    }
                    else{
                        response.status(201);
                        response.json({usuario: resultado});
                    }//else

                });//createUser
            }//else
        }//else
    })//buscarUusario
});//Registrarse


app.get("/cargarPartidas", passport.authenticate('basic', {session: false}), (request, response) =>{

    if(request.user){

        daoP.getPartidasUsuario(request.user.nameUser, (err, partidas) =>{

            if(err){
                response.status(500);
                response.end();
            }
            else{
                response.status(200);
                response.json({partidas: partidas});
            }
        });
    }
    else{
        response.status(403);
    }
});//cargarPartidas


app.get("/crearPartida",  passport.authenticate('basic', {session: false}), function(request, response){

    if(request.user){

        daoP.nuevaPartida(request.user.nameUser , request.query.partida, (err, idPartida)=>{

            if(err){
                response.status(500);
                response.end();
            }
            else{
                response.status(201);
                daoP.getPartida(idPartida, (err, partida) => {

                    if(err){

                        response.status(500);
                        response.end();
                    }
                    else{

                        response.status(200);
                        response.json({permitido: true, partida: partida});
                    }
                });//getartida
            }//else
        });//daoPartida
    }//if
    else{
        response.status(403);
    }
});//crearPartida


app.get("/unirsePartida/:idPartida", passport.authenticate('basic', {session: false}), (request, response) => {

    let idPartida = request.params.idPartida;

    if(request.user){

        daoP.findPartida(idPartida, (err, result) =>{

            if(err){
                response.status(500);
                response.end();
            }
            else{

                if(result){
                    daoP.partidaCompleta(idPartida, (err, partidaCompleta) =>{

                        if(err){
                            response.status(500);
                            response.end();
                        }
                        else{

                            if(partidaCompleta){
                                response.status(400);//La partida esta completa
                                response.json({msg: "La partida ya está completa."})
                            }
                            else{

                                daoP.unirsePartida(request.user.nameUser, idPartida, (err, callback) =>{

                                    if(err){
                                        response.status(500);
                                        response.end();
                                    }
                                    else{
                                        daoP.getPartida(idPartida, (err, partida) => {

                                            if(err){
                        
                                                response.status(500);
                                                response.end();
                                            }
                                            else{
                        
                                                response.status(200);
                                                response.json({permitido: true, partida: partida});
                                            }
                                        });//getartida
                                    }
                                })
                            }
                        }
                    })
                }
                else{
                    response.status(404);//la partida no existe
                    response.json({msg: "La partida no existe."});
                }
            }
        });
    }
    else{
        response.status(403);
    }
});


app.get("/actualizarPartida/:idPartida", passport.authenticate('basic', {session: false}), (request, response) =>{

    let idPartida = request.params.idPartida;

    if(request.user){

        daoP.findPartida(idPartida, (err, result) =>{

            if(err){
                response.status(500);
                response.end();
            }
            else{

                if(result){

                    daoP.getJugadores(idPartida, (err, jugadores) =>{

                        if(err){
                            response.status(500);
                            response.end();
                        }
                        else{
                            response.json({datos: jugadores});
                        }
                    });//getJugadores

                }
                else{
                    response.status(404);//la partida no existe
                    response.json({msg: "La partida no existe."});
                }
            }
        });//findPartida
    }
    else{
        response.status(403);
    }
});


//____________________________________________________________________________________________________________

//_________________________________________________ MANEJADOR DE ESCUHA ______________________________________


var servidor = https.createServer(
    { key: privateKey, cert: certificate },
 app);


 servidor.listen(config.httpsPort, function(err){
    if(err){
        console.log("No se ha iniciado el servidor");
        console.log(err);
    }else{

        console.log(`Servidor escuchando en puerto ${config.port}.`)
    }

});


app.listen(config.port, function(err) {
    if (err) {
        console.log("No se ha podido iniciar el servidor.")
        console.log(err);
    } else {
        console.log(`Servidor escuchando en puerto ${config.port}.`);
    }
});