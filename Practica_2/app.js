"use strict";
//Requires
const express = require("express");
const mysql = require("mysql");
const path = require("path");
const bodyParser = require("body-parser");
const config = require("./config");
const expressValidator = require("express-validator");

const moment = require('moment');

//P2
const passport = require("passport");
const passportHTTP = require("passport-http");

const https = require("https");
const fs = require("fs");

//Certificados para HTTPS
var privateKey = fs.readFileSync("./certificados/mi_clave.pem");
var certificate = fs.readFileSync("./certificados/certificado_firmado.crt");

//Daos
const daoUsuarios = require("./daos/dao_usuarios");
const daoPartidas = require("./daos/dao_partidas");

const app = express();

app.get("/index.html",(request, response)=>{
    response.redirect("index");

});


//Conexion
let pool = mysql.createPool({
    database: config.mysqlConfig.database,
    host: config.mysqlConfig.host,
    user: config.mysqlConfig.user,
    password: config.mysqlConfig.password
});
let daoU = new daoUsuarios.DAOUsers(pool);
let daoP = new daoPartidas.DAOPartidas(pool);




var servidor = https.createServer(
    { key: privateKey, cert: certificate },
 app);


servidor.listen(config.port, function(err) {
    if (err) {
        console.log("No se ha podido iniciar el servidor.")
        console.log(err);
    } else {
        console.log(`Servidor escuchando en puerto ${config.port}.`);
    }
});