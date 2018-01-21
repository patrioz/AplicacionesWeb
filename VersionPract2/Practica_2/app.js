
"use strict";

//______________________________________ MODULOS _______________________________________

const express = require("express");
const mysql = require("mysql");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const mySql_session = require("express-mysql-session");
const fs = require("fs");
const expressValidator = require("express-validator");
const passport = require("passport");
const passportHTTP = require("passport-http");
const https = require("https");

//****************  MODULOS LOCALES  *****************  
//****************************************************
const config = require("./config");
const daoPartidas = require("./daos/dao_partidas");
const daoUsers = require("./daos/dao_usuarios");

const app = express();
//_______________________________________________________________________________________



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
                callback(null, {nameUser: usuario});
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

    //let nameUser = request.user.nameUser;
    var usu = request.body.usuario;
    var contra = request.body.contraseña;

    daoU.isUserCorrect(usu, contra,(err, callback)=>{

        if(err){
            response.end();
            console.log("noo");
        }else{
            if(callback === undefined){
                response.end("Fallo al cargar la sesion");
            }else{
                response.status(200);
                response.json({"nombre": callback.login, "id:": callback.id});
            }
        }  
    });
    
        
}); //IniciarSesion
       



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


app.post("/crearPartida", function(request, response){

    var usu = request.body.loginId;
    var partida = request.body.partida;

    console.log(usu);
    console.log(partida);

    daoP.nuevaPartida(usu,partida,(err,callback)=>{
        if(err){
            
            console.log(err);
            response.end();
        }else{
            if(callback.creada){
            response.status(201);
            console.log(callback.nombrePartida,callback.nombrePartida);
            response.json({"nombrePartida": callback.nombrePartida, "idPartida:":callback.idPartida});

            }else{
                response.status(400);
                response.end("Fallo al acceder.");
            }
        }

    });//daoPartida

});//crearPartida

app.get("/cargarPartidas", function(request, response){

    var idU = request.query.loginId;

    daoP.getPartidasUsuario(idU, (err, partidas) =>{

        if(err){
            response.status(500);
            response.end();
        }
        else{
            
            if(partidas === undefined){
                response.end("Fallo al acceder");
            }
            else{
                response.status(201);
                console.log("dentro");
               response.json({"id": idU,  "partidas": partidas});
                
            }
               
        }
    }); 



})



//app.post("/unirsePartida")

            


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