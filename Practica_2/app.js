"use strict";
//Requires
const express = require("express");
const mysql = require("mysql");
const path = require("path");
const bodyParser = require("body-parser");
const express_session = require("express-session");
const express_mySql_session = require("express-mysql-session");
const config = require("./config");
const expressValidator = require("express-validator");
const moment = require('moment');

//Daos
const daoUsuarios = require("./daos/dao_usuarios");
const daoPartidas = require("./daos/dao_partidas");

const app = express();
const MySQLStore = express_mySql_session(express_session);
//const MySQLStore = mySql_session(session);
//const sessionStore = new MySQLStore(config.mysqlConfig);
/*const middlewareSession = session({
    saveUninitialized: false,
    secret: "foobar34",
    resave: false,
    store: sessionStore
});*/

const sessionStore = new MySQLStore({
    database: config.mysqlConfig.database,
    host: config.mysqlConfig.host,
    user: config.mysqlConfig.user,
    password: config.mysqlConfig.password
});

let pool = mysql.createPool({
    database: config.mysqlConfig.database,
    host: config.mysqlConfig.host,
    user: config.mysqlConfig.user,
    password: config.mysqlConfig.password
});

//P2
var passport = require("passport");
var passportHTTP = require("passport-http");

var https = require("https");
var fs = require("fs");

//Certificados para HTTPS
var privateKey = fs.readFileSync("./certificados/mi_clave.pem");
var certificate = fs.readFileSync("./certificados/certificado_firmado.crt");


//Conexion
/*let pool = mysql.createPool({
    database: config.mysqlConfig.database,
    host: config.mysqlConfig.host,
    user: config.mysqlConfig.user,
    password: config.mysqlConfig.password
});*/
let daoU = new daoUsuarios.DAOUsers(pool);
let daoP = new daoPartidas.DAOPartidas(pool);

app.use(passport.initialize());

passport.use(new passportHTTP.BasicStrategy(
    { realm: 'Autenticacion requerida' },
    function(user, pass, callback) {

        daoU.isUserCorrect(user, pass, (err, ok) => {

            if (err) {
    
                console.log(err);
                response.end();
            } else {
    
                if (!ok) {

                    callback(null, false);
    
                } else {
    
                    callback(null, { userId: user });
                }
            }
        });
    }
));

//Ficheros estaticos
app.use(express.static(path.join(__dirname, "public")));

//Declaracion del middelware bodyParser para obtener el contenido de la peticion post
app.use(bodyParser.urlencoded({extended: false}));

app.use(bodyParser.json());

app.get("/",(request, response)=>{
    response.redirect("index.html");

});



app.post("/iniciarSesion", function(request, response){

    //variables mediante daos
    console.log(request.body.usuario);
    var usu= request.body.usuario;
    var contra = request.body.contraseña;

    

    daoU.isUserCorrect(usu,contra,(err, callback)=>{

        if(err){
            response.status(400);
            response.end();
            console.log("noo");
        }
        else{
            response.status(200);
            if(callback !== null){
                console.log("dentro");
               response.json({"nombre": callback.nombre, "id": callback.id})
            }
            else{
                response.end("Fallo al acceder");
            }
                
        }
    });
});


app.post("/registrarUsuario", function(request, response){
    var usu= request.body.usuario;
    var contra = request.body.contraseña;

    console.log(usu);


    daoU.buscarUsuario(usu,(callback, err)=>{
        if(err) {
            response.end();
            console.log(err);
        }else{
            if(callback){
                response.status(400);
                response.end();
            }else{
                daoU.createUser(usu, contra,(callback, err) =>{

                    if(err){
                        response.end();
                        console.log(err);
                    }
                    else{
                        if(!callback) response.status(400);
                        else{
                            response.status(201);
                            response.json({"usuario:": usu});
                        }
            
                    }
            
                });//createUser
            }
        }

    })//buscarUusario

});//Registrarse



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