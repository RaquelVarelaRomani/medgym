import React, { useEffect, useState } from "react";
import styles from "./CreateExercise.module.css";
import { useNavigate, useParams } from "react-router-dom";
import * as exerciseService from "../../../../backend/exerciseService";
import { tryLoginFromServiceToken } from "../../../../backend/userService";
import Popup from "../common/popup/Popup";
import FileUploadButton from "../common/FileUploadButton";
import CropModal from "../common/CropModal";
import LoadingMessage from "../common/LoadingMessage";


const EditExercise = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [titleError, setTitleError] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [popupText, setPopupText] = useState("");

    const [exerciseData, setExerciseData] = useState({
        name: "",
        description: "",
        muscleGroup: "",
        equipment: "",
        image: null,
    });

    const [showCropper, setShowCropper] = useState(false);
    const [imageToCrop, setImageToCrop] = useState(null);

    // Verificar login
    useEffect(() => {
        tryLoginFromServiceToken(
            (authenticatedUser) => {
                loadExercise();
            },
            () => {
                console.error("Token inválido o expirado");
                navigate("/users/login");
            }
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Cargar datos del ejercicio
    const loadExercise = () => {
        exerciseService.getExercise(
            id,
            (data) => {
                setExerciseData({
                    name: data.name,
                    description: data.description,
                    muscleGroup: data.muscleGroup || "",
                    equipment: data.equipment || "",
                    image: data.image || null,
                });
                setLoading(false);
            },
            (error) => {
                console.error("Error al cargar el ejercicio:", error);
                setError("No se pudo cargar el ejercicio.");
                setLoading(false);
            }
        );
    };

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

        /* Actualizar directamente */
        exerciseService.updateExercise(
            id,
            exerciseData.name,
            exerciseData.description,
            exerciseData.muscleGroup,
            exerciseData.equipment,
            exerciseData.image,
            () => {
                setPopupText("Cambios guardados correctamente.");
                setShowPopup(true);
            },
            (errors) => {
                console.error("Error actualizando ejercicio:", errors);
                setError("Error al guardar los cambios. Intenta de nuevo.");
            }
        );
    };

    if (loading) return <LoadingMessage text="Cargando ejercicio..." />;
    return (
        <div className={styles["contenedor-create-exercise"]}>
            <div className={styles["header-crear-ejercicio"]}>
                <h2>Editando ejercicio: {exerciseData.name}</h2>
                <img
                    src={process.env.PUBLIC_URL + "/assets/logo.svg"}
                    alt="Logo"
                    className={styles["foto-perfil"]}
                    onClick={() => navigate("/users/profile")}
                />
            </div>

            <div className={styles["form-crear-ejercicio"]}>
                <div className={styles["exercise-photo"]}>
                    {exerciseData.image ? (
                        <img
                            src={`data:image/jpeg;base64,${exerciseData.image}`}
                            alt="Previsualización del ejercicio"
                            className={styles["exercise-image"]}
                        />
                    ) : (
                        <img
                            src="./assets/default-exercise.jpg"
                            alt="Ejercicio por defecto"
                            className={styles["exercise-image"]}
                        />
                    )}
                </div>

                <FileUploadButton
                    onFileSelect={(file) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            setShowCropper(true);
                            setImageToCrop(reader.result);
                        };
                        reader.readAsDataURL(file);
                    }}
                />

                {showCropper && (
                    <CropModal
                        imageSrc={imageToCrop}
                        onCancel={() => setShowCropper(false)}
                        onSave={(croppedImage) => {
                            const base64String = croppedImage.split(",")[1];
                            setExerciseData({ ...exerciseData, image: base64String });
                            setShowCropper(false);
                        }}
                    />
                )}

                <div className={styles["form-div"]}>
                    <label htmlFor="name">Nombre:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={exerciseData.name}
                        onChange={handleChange}
                        className={titleError ? styles["input-error"] : ""}
                    />
                    {titleError && <span className={styles["error-message"]}>{titleError}</span>}
                </div>

                <div className={styles["form-div"]}>
                    <label htmlFor="description">Descripción:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={exerciseData.description}
                        onChange={handleChange}
                        rows={3}
                    />
                </div>

                <div className={styles["form-div"]}>
                    <label htmlFor="muscleGroup">Grupo muscular:</label>
                    <input
                        type="text"
                        id="muscleGroup"
                        name="muscleGroup"
                        value={exerciseData.muscleGroup}
                        onChange={handleChange}
                    />
                </div>

                <div className={styles["form-div"]}>
                    <label htmlFor="equipment">Equipamiento:</label>
                    <input
                        type="text"
                        id="equipment"
                        name="equipment"
                        value={exerciseData.equipment}
                        onChange={handleChange}
                    />
                </div>

                {error && <div className={styles["error-message"]}>{error}</div>}

                <div className={styles["form-actions"]}>
                    <button className={styles["boton-guardar"]} onClick={handleSave}>
                        Guardar
                    </button>
                    <button className={styles["boton-cancelar"]} onClick={handleCancel}>
                        Cancelar
                    </button>
                </div>
            </div>

            <Popup
                show={showPopup}
                text={popupText}
                onOk={() => {
                    setShowPopup(false);
                    navigate("/exercises");
                }}
            />
        </div>
    );
};

export default EditExercise;
