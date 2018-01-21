"use strict";

class DAOPartidas {

    /**
     * Inicializa el DAO de partidas.
     * 
     * @param {Pool} pool Pool de conexiones MySQL. Todas las operaciones
     *                    sobre la BD se realizarán sobre este pool.
     */
    constructor(pool) {
        this.pool = pool;
    }

getPartidasUsuario(idUsuario, callback){
    console.log(idUsuario);

    this.pool.getConnection((err, connection) =>{
            
        if(err){
            callback(err); return;
        }
        
            connection.query("SELECT p.id, p.nombre FROM partidas p JOIN juega_en j ON(p.id = j.idPartida)"+
                "JOIN usuarios u ON (j.idUsuario = u.id) WHERE u.id = ?",
                [idUsuario],
                (err, rows)=>{

            if(err){
                callback(err);
            }

            console.log(rows);
            connection.release();

            if(rows.length === 0){
                
                callback(null, undefined);
            }
            else{
                
                callback(null, rows);
            }
        });
    });
}//getPartidasUsuario

nuevaPartida(idUsuario, nombrePartida, callback){
    console.log(idUsuario);

    this.pool.getConnection((err,connection) => {

        if(err){
            callback(err); return;
        }
        connection.query("INSERT INTO partidas (nombre, estado) VALUES  (?, ?)",
        [nombrePartida, "nueva"],
        (err, result) =>{
                
            if(err){
                callback(err); return;
            }
            
            else{
                
                let datosPartida={
                    nombrePartida: nombrePartida,
                    idPartida: result.insertId,
                    creada : false
                }

                connection.query("INSERT INTO juega_en (idUsuario, idPartida) " +
                                "VALUES ( ?, ?)",
                [idUsuario, result.insertId],
                (err,result)=>{

                    if(err){
                        callback(err); return;
                    }
                    
                    else{
                        datosPartida.creada=true;
                        connection.release();
                        console.log("queryOK");
                        
                        callback(null, datosPartida);
                    }
                });
            }
        });
    });
}//Nueva partida


getIncorporacion(id,login, callback){

    this.pool.getConnection((err,connection) => {

        if(err)
            callback(err);
        
        connection.query("INSERT INTO juega_en VALUES (SELECT id FROM usuarios WHERE login = ?), ? ",
        [login, id],
        (err,result)=>{

            if(err)
                callback(err);

            else{
                connection.release();
                callback(null, result);
            }
        });
    });
}//getIncorporacio


getEstadoPartida(idPartida, callback){

    this.pool.getConnection((err,connection) => {

        if(err)
            callback(err);
        
        connection.query("SELECT idUsuario FROM juega_en WHERE idPartida= ? ",
        [idPartida],
        (err,result)=>{

            if(err)
                callback(err);

            else{

                connection.release();
                callback(null, result);
            }
        });
    });
}//getEstadoPartida




}//DAOPartidas

module.exports = {
    DAOPartidas: DAOPartidas
}