import React, {useEffect, useState} from "react";
// OJO! Importa estilos definidos en CSS
import "./Routines.css";
import { Link, useNavigate} from "react-router-dom";
import * as routineService from "../../../../backend/routineService";
import {getServiceToken} from "../../../../backend/appFetch";

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
    const navigate = useNavigate();
    //CAMBIAR: usuario de prueba para vista de entrenador
    {/*const testUser = {
        id: 1,
        nombre: "Entrenador1",
        role: 1 //trainer
    };

    //CAMBIAR: ARRAY ESTATICO PORQUE LUEGO HAY QUE CONECTAR CON EL BACKEND
    const routines = [
    { id: 1, titulo: "Ejemplo entrenamiento nº 1", entrenador: "Entrenador2" },
    { id: 2, titulo: "Ejemplo entrenamiento nº 2", entrenador: "Entrenador1" },
    { id: 3, titulo: "Ejemplo entrenamiento nº 3", entrenador: "Entrenador1" },
  ];*/}

    const [routines, setRoutines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [error, setError] = useState(null);

    //cargar datos de usuario
    useEffect(() => {
        const token = getServiceToken();
        if (!token) {
            navigate("/");
            return;
        }

        const storedUser = sessionStorage.getItem('authenticatedUser');
        console.log(JSON.parse(sessionStorage.getItem('authenticatedUser')));
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }

        loadRoutines();


    }, [navigate]);

    const loadRoutines = () => {
        setLoading(true);
        routineService.getAllRoutines(
            (data) => {
                console.log("Routines loaded:", data);
                setRoutines(data);
                setLoading(false);
            },
            (errors) => {
                console.error("Error loading routines:", errors);
                setError(errors.globalError || "Error al cargar los entrenamientos");
                setLoading(false);
            }
        );
    };

    //CAMBIAR: hacer funcion auxiliar para mapear int a role
    const isClient = () => {
        if (!currentUser) return true;
        return currentUser.role === 'CLIENT';
    };
    const isTrainer = () => {
        if (!currentUser) return false;
        return currentUser.role === 'TRAINER';
    };
    const isAdmin = () => {
        if (!currentUser) return false;
        return currentUser.role === 'ADMIN';
    };

    const isRoutineCreator = (routine) => {
        if (!currentUser || !routine.trainerId) return false;
        return currentUser.id === routine.id;
    }
    const handleEdit = (e, routineId) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/routines/edit/${routineId}`); //comprobar ruta
    };

    const handleDelete = (e, routineId) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Delete routine", routineId);
    };

    const handleAddRoutine = () => {
    //pag de crear rutinas CAMBIAR 
    navigate("/routines/new");
  };

    const handleProfileClick = () => {
        navigate("/profile");
    };

    if (loading) {
        return (
            <div className="contenedor">
                <div className="loading-message">Cargando entrenamientos...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="contenedor">
                <div className="error-message">
                    {error}
                    <button onClick={loadRoutines} className="retry-button">
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        );
    }

  // return = lo que hay que renderizar en pantalla
  return (
    
    // 1) Hacemos un div para agrupar todo dentro del recuadro del login
   <div className="contenedor">

        <img
            src={process.env.PUBLIC_URL + "/assets/logo.svg"}
            alt="Foto de perfil"
            className="foto-perfil"
            onClick={handleProfileClick}
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
                <h3>{routine.name}</h3> {/*Ya usamos h2 en el titulo grande*/}
                <p>Generado por {
                    routine.trainer ?
                        `${routine.trainer.name} ${routine.trainer.surname}` :
                        'Entrenador desconocido'
                }</p> {/*CAMBIAR: tiene que funcionar con el backend */}

                {/*boton editar y borrar para admins y creador de las rutinas*/}
                {((isTrainer() && isRoutineCreator(routine)) || isAdmin()) && (
                    <div>
                        <button className="boton-editar"
                            onClick={(e) => handleEdit(e, routine.id)}>
                            Editar
                        </button>
                        <button className="boton-eliminar"
                                onClick={(e) => handleDelete(e, routine.id)}>
                            Eliminar
                        </button>
                    </div>
                )}
            </Link>
            ))}
        </div>

        {/*Boton CREAR*/}
      {(isTrainer() || isAdmin()) && (
        <button className="boton-crear" onClick={handleAddRoutine}>
          +
        </button>
      )}
        
    </div>
    
  );
};

export default Routines;
