"use strict"

//***  VARIABLES GLOBALES  *** */
 let usuario;
 let idUsuario;
 let cadena;

 $(document).ready(() =>{

    $("#game").hide();
    $("#action-tittle").hide();
    $("#entrar").on("click", iniciar_sesion);
    $("#nuevo").on("click",registrarse);
    $("#crearPartida").on("click", crear_partida);
    $("#unirsePartida").on("click", unirse_partida);
    $("#desconectar").on("click", cerrar_sesion);
    $("#listaPartidas").on("click", actualizar_partida);
    $("#actualizar_partida").on("click", actualizar_partida);
    
 });



function iniciar_sesion(event){

    event.preventDefault();

    usuario = $("#usuario").val();
    let contraseña = $("#contraseña").val();
    cadena = btoa(usuario + ":" + contraseña);

    $.ajax({

            type: "POST",
            url:"/iniciarSesion",
            contentType:"application/json",

            data:JSON.stringify({
                usuario: usuario,
                contraseña: contraseña
            }),

            success: (data,textStatus, jqXHR)=>{ 

                if(data.usuario){

                    $("#login").hide();
                    $("#game").show();
                    $("#action-tittle").show();
                    let nameUserElem = $("<p id = nombre_usuario_titulo class = user-tittle>" + usuario + "</p>");
                    $("#action-tittle").prepend(nameUserElem);
                    cargar_partidas();
                }
                else
                    alert("Atenticación incorrecta.");
            },

            error: function (jqXHR, textStatus, errorThrown) {

                alert("Se ha producido un error: " + errorThrown);
            }
    });

}//inicar_sesion

function registrarse(event){

    event.preventDefault();

    usuario = $("#usuario").val();
    let contraseña = $("#contraseña").val();
    cadena = btoa(usuario + ":" + contraseña);

    $.ajax({
        
            type: "POST",
            url:"/registrarUsuario",
            contentType:"application/json",

            data:JSON.stringify({
                usuario:usuario,
                contraseña: contraseña
            }),

            success: (data,textStatus, jqXHR)=>{ 
            
                if(data.usuario)
                    alert("Ya hay un usuario con ese nombre.");
                
                else{

                    $("#login").hide();
                    $("#game").show();
                    $("#action-tittle").show();
                    let nameUserElem = $("<p id = nombre_usuario_titulo class = user-tittle>" + usuario + "</p>");
                    $("#action-tittle").prepend(nameUserElem);
                }
            },

            error: function (jqXHR, textStatus, errorThrown) {
                alert("Se ha producido un error: " + errorThrown);
            }
    });  
}//registrarse


function cargar_partidas(){

    $.ajax({
        type:"GET",
        url: "/cargarPartidas",
        beforeSend: function(req){

            req.setRequestHeader("Authorization", "Basic " + cadena);
        },

        success: (data,textStatus, jqXHR)=>{

            if(data.partidas){

                data.partidas.forEach(partida =>{

                    let part = $("<a class = 'nav-item nav-link' id= " + partida.id + " data-toggle=tab href=#contenido role=tab aria-selected= false>" + partida.nombre + "</a>");
                    $("#listaPartidas").append(part);
                });
            }  
        },

        error: function (jqXHR, textStatus, errorThrown) {

            alert("Se ha producido un error: " + errorThrown);
            cerrar_sesion();
        }
    });
}//cargar_partidas

 
function crear_partida(event){

    event.preventDefault();

    let partida = $("#nombrePartida").val();

    if(partida.length > 0){

        $.ajax({
            type: "GET",
            url:"/crearPartida",
            beforeSend: function(req){

                req.setRequestHeader("Authorization", "Basic " + cadena);
            },
            data: {
                partida: partida
            },

            success: (data,textStatus, jqXHR)=>{ 

                $("#nombrePartida").val("");
                let part = $("<a class = 'nav-item nav-link' id= " + data.partida.id + " data-toggle=tab href= contenido role=tab aria-selected= false>" + data.partida.nombre + "</a>");
                $("#listaPartidas").append(part);
            },

            error: function (jqXHR, textStatus, errorThrown) {
                alert("No se ha podido crear la partida");
            }
        });

    }//if
    else
        alert("La partida necesita un nombre.");

}//crear_partida


function unirse_partida(event){

    event.preventDefault();
   
    let idPartida = $("#identPartida").val();
    
    if(idPartida.length > 0){

        $.ajax({
            
            type: "GET",
            url:"/unirsePartida/" + idPartida,
            beforeSend: function(req){

                req.setRequestHeader("Authorization", "Basic " + cadena);
            },

            success: (data,textStatus, jqXHR)=>{ 

                if(data.partida){

                    $("#identPartida").val("");
                    let part = $("<a class = 'nav-item nav-link' id= " + data.partida.id + " data-toggle=tab href= contenido role=tab aria-selected= false>" + data.partida.nombre + "</a>");
                    $("#listaPartidas").append(part);
                }
            },

            error: function (jqXHR, textStatus, errorThrown) {

                $("#identPartida").val("");
                alert(jqXHR.responseJSON.msg);
            }
        });
    }
    else
        alert("La partida necesita un nombre.");

}//unirse_partida


function actualizar_partida(event){

    event.preventDefault();
    
     let idPartida = event.target.id;

    if(idPartida !== "misPartidas"){

        $.ajax({
            
            type: "GET",
            url: "/actualizarPartida/" + idPartida,
            beforeSend: function(req){
    
                req.setRequestHeader("Authorization", "Basic " + cadena);
            },
    
            success: (data,textStatus, jqXHR)=>{ 
    
                $("#tabla_jugadores tbody").empty();
                $("#nombre_partida").text(data.datos[0].nombre);

                data.datos.forEach(dato =>{
    
                    let fila = $("<tr></tr>");
                    let celdaNombre = $("<td>").text(dato.login);
                    let celdaCartas;

                    if(data.datos.length < 4){
                        celdaCartas = $("<td>").text("--");
                    }
                    else{
                        celdaCartas = $("<td>").text("NUM"); //Será difrente cuando se haga el reparto de las cartas.
                    }
                    
                    fila.append(celdaNombre);
                    fila.append(celdaCartas);

                    $("#tabla_jugadores tbody").append(fila);
                });

                if(data.datos.length < 4){

                    $("#partida_en_curso").hide();
                    $("#detalle_ident").text("El identificador de esta partida es " + idPartida + ".");
                    $("#detalles_partida").show();
                }
                else{
                    $("#partida_en_curso").show();
                    $("#detalles_partida").hide();
                }
                
            },
    
            error: function (jqXHR, textStatus, errorThrown) {
                alert("Se ha producido un error: " + errorThrown);
                //cerrar_sesion();
            }
        });
    }//if

}//actualizar_partida


function cerrar_sesion(){
  
    cadena = undefined;
    usuario = undefined;
    $("#nombre_usuario_titulo").val("");
    $("#usuario").val("");
    $("#contraseña").val("");
    $("#game").hide();
    $("#action-tittle").hide();
    $("#login").show();
    
    
}//cerrar_sesion