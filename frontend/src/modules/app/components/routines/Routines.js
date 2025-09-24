import React, { useState } from "react";
// OJO! Importa estilos definidos en CSS
import "./Routines.css";
import { Link } from "react-router-dom";
//TUVE QUE AÑADIR ESTA PORQUE -> useParams lee los parametros de la URL (routiens/:id)
//useNavigate -> funcion para cambiar de ruta (necesitamos para la foto de perfil)
//import { Link, useNavigate } from "react-router-dom";

// import { config } from "../../../../config/constants.js"; // 

// Declaración de la función rot13 (comentada correctamente)
/*
function rot13(s) {
  // devolverá el string con las letras reemplazadas según la regla
  return s.replace(
    /[A-Z]/gi,
    (c) =>
      "NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm"[
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".indexOf(c)
      ]
    // en este cifrado se desplaza 13 posiciones cada letra
  );
}
*/


//IMPORTANTE: kebab-case para las clases CSS (palabras-separadas-asi)


// Definición componente funcional (el que React renderiza como pantalla)
const Routines = () => {
    //CAMBIAR: ARRAY ESTATICO PORQUE LUEGO HAY QUE CONECTAR CON EL BACKEND
    const routines = [
    { id: 1, titulo: "Ejemplo entrenamiento nº 1", entrenador: "Entrenador2" },
    { id: 2, titulo: "Ejemplo entrenamiento nº 2", entrenador: "Entrenador1" },
    { id: 3, titulo: "Ejemplo entrenamiento nº 3", entrenador: "Entrenador1" },
  ];

  // return = lo que hay que renderizar en pantalla
  return (
    
    // 1) Hacemos un div para agrupar todo dentro del recuadro del login
   <div className="contenedor">

        <img
            src={process.env.PUBLIC_URL + "/assets/logo.svg"}
            alt="Foto de perfil"
            className="foto-perfil"
            // onClick={() => navigate("/profile")}  // cuando actives la navegación
        />

        <div className="routines-titulo-grande">
            <h2>Entrenamientos:</h2>
        </div>

        {/*<div className="routines-titulo-grande">
            <h2>Entrenamientos:</h2>
                <img
                //CAMBIAR: aqui tendria que ir la foto de perfil
                src={process.env.PUBLIC_URL + "/assets/logo.svg"}
                alt="Foto de perfil"
                className="foto-perfil"
                //CAMBIAR: que al hacer clic en la foto te mande al perfil
                //onClick={() => navigate("/profile")}
                />
        </div> */}
        <div className="lista-rutinas">
            {routines.map((routine) => ( //recorre el array de rutinas
            //CAMBIAR: puede que esto no pueda ser asi
            <Link
                to={`/routines/${routine.id}`}
                key={routine.id}
                className="caja-rutina"
            >
                <h3>{routine.titulo}</h3> {/*Ya usamos h2 en el titulo grande*/}
                <p>Generado por {routine.entrenador}</p> {/*CAMBIAR: tiene que funcionar con el backend */}
            </Link>
            ))}
        </div>
        
    </div>
  );
};

export default Routines;
