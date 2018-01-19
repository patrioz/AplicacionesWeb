"use strict"

//variables de mi sesion
 let login;
 let loginId;
 let cadena;

 $(document).ready(() =>{

    $("#entrar").on("click", inicio);
    $("#nuevo").on("click",registrarse);
 });



function inicio(){

    let usuario = $("#usu").val();
    let contaseña = $("#pass").val();

    $.ajax({
        type: "POST",
            url:"/iniciarSesion",
            contentType:"application/json",
            data:JSON.stringify({
                usuario:usuario,
                contaseña: contraseña
            }),

            //funcion entrar en app

            success: (data,textStatus, jqXHR)=>{ 

                login = data.nombre;
                loginId= data.id;
                cadena = btoa(usuario + ":" + contraseña);


                $("#log").hide();
            },

            //En caso de error, mostramos el error producido
            error: function (jqXHR, textStatus, errorThrown) {
                alert("Se ha producido un error: " + errorThrown);
            }


    });

}//Inicio

function registrarse(){

    let usuario = $("#usu").val();
    let contaseña = $("#pass").val();
    

    $.ajax({
        
        type: "POST",
            url:"/registrarUsuario",
            contentType:"application/json",
            data:JSON.stringify({
                usuario:usuario,
                contaseña: contraseña,
            }),

            //funcion entrar en app

            success: (data,textStatus, jqXHR)=>{ 
                

                $("#log").after("Usuario " + data.nombre );
            },

            //En caso de error, mostramos el error producido
            error: function (jqXHR, textStatus, errorThrown) {
                alert("Se ha producido un error: " + errorThrown);
            }


    });  
}//Registrarse

 