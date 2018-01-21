"use strict"

//variables de mi sesion
 let login;
 let loginId;
 let cadena;

 $(document).ready(() =>{

    $("#game").hide();
    $("#action-tittle").hide();
    $("#entrar").on("click", iniciar_sesion);
    $("#nuevo").on("click",registrarse);
    $("#crearPartida").on("click", crear_partida);
    $("#unirsePartida").on("click", unirse_partida);
    $("#desconectar").on("click", cerrar_sesion);
 });



function iniciar_sesion(event){

    event.preventDefault();

    let usuario = $("#usuario").val();
    let contraseña = $("#contraseña").val();
    let cadena = btoa(usuario + ":" + contraseña);

    $.ajax({

            type: "POST",
            url:"/iniciarSesion",
            contentType: "application/json",
            data: JSON.stringify ({
                usuario: usuario,
                contraseña: contraseña,
            }),
            success: (data,textStatus, jqXHR)=>{ 

                    loginId = data.id;
                    login = data.nombre;
                
                    $("#login").hide();
                    $("#game").show();
                    $("#action-tittle").show();
                    let nameUserElem = $("<p id = nombre_usuario_titulo class = user-tittle>" + usuario + "</p>");
                    $("#action-tittle").prepend(nameUserElem);
                    cargar_partidas();                    
               
            },

            error:  (jqXHR, textStatus, errorThrown)=> {

                alert("Se ha producido un error: " + errorThrown);
            }
    });

}//inicar_sesion

function registrarse(event){

    event.preventDefault();

    let usuario = $("#usuario").val();
    let contraseña = $("#contraseña").val();

    $.ajax({
        
            type: "POST",
            url:"/registrarUsuario",
            contentType:"application/json",

            data:JSON.stringify({
                usuario:usuario,
                contraseña: contraseña
            }),

            success: (data,textStatus, jqXHR)=>{ 
            
                alert(data.usuario);

                if(data.usuario)
                    alert("Ya hay un usuario con ese nombre");
                
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

 
function crear_partida(event){

    event.preventDefault();
   
    let partida = $("#nombrePartida").val();
    

    if(partida.length > 0){


    $.ajax({
        
        type: "POST",
            url:"/crearPartida",
            beforeSend: function(req){

                req.setRequestHeader("Authorization", "Basic " + cadena);
            },
            contentType:"application/json",
            data: JSON.stringify({
                partida: partida,
                loginId: loginId
            }),

            //funcion entrar en app

            success: (data,textStatus, jqXHR)=>{ 

                alert("paso");

                $("#login").hide();
                $("#game").show();
                $("#action-tittle").show();
                $("#vistaMisPartidas").show();

                $("#listaPartidas").append("<a class='nav-item nav-link' id='"
                 + data.idPartida +"' data-toggle='tab' href='#nav-s1role' role ='tab ' aria-controls='nav-s1'"+
                 "aria-selected='true'>" + partida + "</a>");

                
            },

            //En caso de error, mostramos el error producido
            error: function (jqXHR, textStatus, errorThrown) {
                alert("No se ha podido crear la partida");
            }
    });  
    }else{
        alert("La partida necesita un nombre");
    }

}//crear

function unirse_partida(event){
    event.preventDefault();
   
    let idPartida = $("#unirse").val();
    
    $.ajax({
        
        type: "POST",
            url:"/unirsePartida",
            beforeSend: function(req){

                req.setRequestHeader("Authorization", "Basic " + cadena);
            },
            contentType:"application/json",
            data:JSON.stringify({
                idPartida: idPartida,
                loginId: loginId
            }),

            //funcion entrar en app

            success: (data,textStatus, jqXHR)=>{ 

                alert("siii");

                $("#login").hide();
                $("#game").show();
                $("#action-tittle").show();
                $("#vistaMisPartidas").show();

                $("#listaPartidas").append("<a class='nav-item nav-link' id='"
                 + data.idPartida +"' data-toggle='tab' href='#nav-s1role' role ='tab ' aria-controls='nav-s1'"+
                 "aria-selected='true'>" + partida + "</a>");

                
            },

            //En caso de error, mostramos el error producido
            error: function (jqXHR, textStatus, errorThrown) {
                alert("No se ha podido crear la partida");
            }
    });  

}//unirse_partida


function cerrar_sesion(){

    login=null;
    loginId= null;
    cadena= null;
    $("#game").hide();
    $("#action-tittle").hide();
    $("#login").show();
    
}//cerrar_desion


function cargar_partidas(){
    $.ajax({
        type:"GET",
        url: "/cargarPartidas",
        beforeSend: function(req){

            req.setRequestHeader("Authorization", "Basic " + cadena);
        },
        data:{
            idUser : loginId,
        },

        success: (data,textStatus, jqXHR)=>{
            
            $("#listaPartidas").append("<a class='nav-item nav-link' id='"
            + data.idPartida +"' data-toggle='tab' href='#nav-s1role' role ='tab ' aria-controls='nav-s1'"+
            "aria-selected='true'>" + partida + "</a>");

            data.forEach(element => {
                //Nose como hacerlo.
                
            });

         },



        error: function (jqXHR, textStatus, errorThrown) {
            alert("No se han podido cargar las partidas");
        }

    });

}//cargar_partidas