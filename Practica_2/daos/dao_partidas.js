"use strict";

class DAOPartidas {


    /**
     * 
     * 
     * @param {Pool} pool
     * 
     */
    constructor(pool) {
        this.pool = pool;
    }


nuevaPartida(login, nombre, callback){
    this.pool.getConnection((err,connection) => {

        if(err){
            callback(err);return;
        }

        connection.query("INSERT INTO partidas (nombre) VALUES =?",
        [nombre],
        (err, result) =>{
                
            if(err){
                console.log(err);
                callback(err);return;
            }else{
                connection.query("INSERT INTO juega_en (idUsuario, idPartida) "+
                "VALUES ((SELECT id FROM usuarios WHERE login = ?), SELECT id FROM partidas WHERE nombre = ?)",
                [login,nombre],
                (err,result)=>{
                    connection.release();
                    if(err){
                        console.log(err);
                        callback(err);return;
                    }else{
                        callback(null, result);
                    }

                });
            }
        });


    });
}//Nueva partida

getIncorporacion(id,login, callback){
    this.pool.getConnection((err,connection) => {

        if(err){
            callback(err);return;
        }

        connection.query("INSERT INTO juega_en values (SELECT id FROM usuarios WHERE login = ?), ? ",
        [login, id],
        (err,result)=>{
            connection.release();
            if(err){
                console.log(err);
                callback(err);return;
            }else{
                callback(null, result);
            }
        });
    });
}//getIncorporacion

getEstadoPartida(idPartida, callback){
    this.pool.getConnection((err,connection) => {

        if(err){
            callback(err);return;
        }

        connection.query("SELECT idUsuario FROM juega_en WHERE idPartida= ? ",
        [idPartida],
        (err,result)=>{
        if(err){
            console.log(err);
            callback(err);return;
        }else{
            callback(null, result);
        }

        });
    });


}//getEstadoPartida



}//Fin DAOPartidas

module.exports = {
    DAOPartidas: DAOPartidas
}