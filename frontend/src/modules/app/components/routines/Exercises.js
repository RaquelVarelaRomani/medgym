import React, { useState, useEffect } from "react";
// OJO! Importa estilos definidos en CSS
import "./Exercises.css";
import { Link, useNavigate} from "react-router-dom";
import {getAuthenticatedUser, getServiceToken} from "../../../../backend/appFetch";

//IMPORTANTE: kebab-case para las clases CSS (palabras-separadas-asi)


// Definición componente funcional (el que React renderiza como pantalla)
const Exercises = () => {
    const navigate = useNavigate();

    //CAMBIAR: usuario de prueba para vista de entrenador

    //CAMBIAR: ARRAY ESTATICO PORQUE LUEGO HAY QUE CONECTAR CON EL BACKEND
    const exercises = [
    { id: 1, titulo: "Ejercicio nº 1", descripcion: "Descripción ejercicio nº 1" },
    { id: 2, titulo: "Ejercicio nº 2", descripcion: "Descripción ejercicio nº 2"},
    { id: 3, titulo: "Ejercicio nº 3", descripcion: "Descripción ejercicio nº 3"},
  ];



    const handleDelete = (e, exerciseId) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Delete exercise", exerciseId);
    };

    const handleAddExercise = () => {
    //pag de crear exercises CAMBIAR 
    navigate("/exercises/new");
  };

  // return = lo que hay que renderizar en pantalla
  return (
       <div className="contenedor">

        <img
            src={process.env.PUBLIC_URL + "/assets/logo.svg"}
            alt="Foto de perfil"
            className="foto-perfil"
            // onClick={() => navigate("/profile")}  // cuando actives la navegación
        />

        <div className="exercises-titulo-grande">
            <h2>Ejercicios:</h2>
        </div>

        <div className="lista-ejercicios">
            {exercises.map((exercise) => ( //recorre el array de ejercicios
            //CAMBIAR: puede que esto no pueda ser asi
            <Link
                to={`/exercises/${exercise.id}`}
                key={exercise.id}
                className="caja-ejercicio"
            >
                <h3>{exercise.titulo}</h3> {/*Ya usamos h2 en el titulo grande*/}
                <p>{exercise.descripcion}</p> {/*CAMBIAR: tiene que funcionar con el backend */}

                        <button className="boton-eliminar"
                                onClick={(e) => handleDelete(e, exercise.id)}>
                            Eliminar
                        </button>
                
            </Link>
            ))}
        </div>

        {/*Boton CREAR*/}
        <button className="boton-crear" onClick={handleAddExercise}>
          +
        </button>
        
    </div>
    
  );
};

export default Exercises;
