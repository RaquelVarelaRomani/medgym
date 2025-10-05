import React, { useEffect, useState } from "react";
import "./CreateExercise.css";
import { useNavigate } from "react-router-dom";
import * as exerciseService from "../../../../backend/exerciseService";
import { tryLoginFromServiceToken } from "../../../../backend/userService";

const CreateExercise = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [titleError, setTitleError] = useState("");

  const [exerciseData, setExerciseData] = useState({
    name: "",
    description: "",
  });

  // Verificar login y rol
  useEffect(() => {
    tryLoginFromServiceToken(
      (authenticatedUser) => {
        setCurrentUser(authenticatedUser.user);
        setLoading(false);
      },
      () => {
        console.error("Token inválido o expirado");
        navigate("/users/login");
      }
    );
  }, [navigate]);

  const isTrainer = () => currentUser && currentUser.role === "TRAINER";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExerciseData((prev) => ({ ...prev, [name]: value }));

    if (name === "name" && value.length > 50) {
      setTitleError("El nombre es demasiado largo");
    } else {
      setTitleError("");
    }
  };

  const handleCancel = () => {
    navigate("/exercises");
  };

  const handleSave = () => {
    if (!exerciseData.name.trim()) {
      setTitleError("El nombre es obligatorio");
      return;
    }

    exerciseService.createExercise(
      exerciseData.name,
      exerciseData.description,
      () => {
        navigate("/exercises");
      },
      (errors) => {
        console.error("Error creando ejercicio:", errors);
        setError(errors.globalError || "Error al crear el ejercicio");
      }
    );
  };

  if (loading) return <div>Cargando...</div>;
  if (error)
    return (
      <div>
        <p>{error}</p>
        <button onClick={() => setError(null)}>Reintentar</button>
      </div>
    );

  return (
    <div className="contenedor-create-exercise">
      <div className="header-crear-ejercicio">
        <h2>Estás creando un nuevo ejercicio...</h2>
        <img
          src={process.env.PUBLIC_URL + "/assets/logo.svg"}
          alt="Foto de perfil"
          className="foto-perfil"
          onClick={() => navigate("/users/profile")}
        />
      </div>

      {isTrainer() && (
        <div className="form-crear-ejercicio">
          <div className="form-div">
            <label htmlFor="name">Nombre:</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Escriba aquí el nombre del ejercicio..."
              value={exerciseData.name}
              onChange={handleChange}
              className={titleError ? "input-error" : ""}
            />
            {titleError && (
              <span className="error-message">{titleError}</span>
            )}
          </div>

          <div className="form-div">
            <label htmlFor="description">Descripción:</label>
            <textarea
              id="description"
              name="description"
              placeholder="Describa brevemente el ejercicio..."
              value={exerciseData.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button className="boton-guardar" onClick={handleSave}>
              Guardar
            </button>
            <button className="boton-cancelar" onClick={handleCancel}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateExercise;
