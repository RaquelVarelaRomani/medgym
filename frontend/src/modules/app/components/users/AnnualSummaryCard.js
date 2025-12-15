import React, { useEffect, useState } from "react";
import styles from "./AnnualSummaryCard.module.css"; 
import PropTypes from "prop-types";
import { getAnnualSummary } from "../../../../backend/summaryService";
import LoadingMessage from "../common/LoadingMessage";

const AnnualSummaryCard = ({ onClose }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAnnualSummary(
            (data) => {
                setStats(data);
                setLoading(false);
            },
            (err) => {
                console.error(err);
                setLoading(false);
            }
        );
    }, []);

    // Lógica para decidir qué contenido mostrar (Evita el ternario anidado que no le gusta a SonarQube)
    let cardContent;

    if (loading) {
        cardContent = <LoadingMessage />;
    } else if (stats) {
        cardContent = (
            <div className={styles.listContainer}>
                {/* SECCIÓN 1: LIKES DADOS */}
                <div className={styles.section}>
                    <p className={styles.label}>Has dado...</p>
                    <p className={styles.number}>
                        {stats.likesGiven} me gustas
                    </p>
                    <p className={styles.message}>
                        {stats.likesGiven > 0 
                            ? "¡Felicidades! Esperamos que este año sigas repartiendo mucho amor."
                            : "Con que eres de esos que quiere pasar desapercibido... ¡Deja de ser tan serio y reparte amor el año que viene!"
                        }
                    </p>
                </div>

                {/* SECCIÓN 2: LIKES RECIBIDOS */}
                <div className={styles.section}>
                    <p className={styles.label}>Has recibido...</p>
                    <p className={styles.number}>
                        {stats.likesReceived} me gustas
                    </p>
                    <p className={styles.message}>
                        {stats.likesReceived > 0 
                            ? "¡Estamos encantados contigo! Esperamos que el año que viene sigas causando sensación con tus rutinas."
                            : "¡Recuerda! La satisfacción radica en el esfuerzo, no en el logro."
                        }
                    </p>
                </div>

                {/* SECCIÓN 3: COMENTARIOS DADOS */}
                <div className={styles.section}>
                    <p className={styles.label}>Has comentado...</p>
                    <p className={styles.number}>
                        {stats.commentsGiven} veces
                    </p>
                    <p className={styles.message}>
                        {stats.commentsGiven > 0 
                            ? "¡Genial! Nos encanta la gente sociable."
                            : "Con que te ha comido la lengua el gato..."
                        }
                    </p>
                </div>

                {/* SECCIÓN 4: COMENTARIOS RECIBIDOS */}
                <div className={styles.section}>
                    <p className={styles.label}>Te han comentado...</p>
                    <p className={styles.number}>
                        {stats.commentsReceived} veces
                    </p>
                    <p className={styles.message}>
                        {stats.commentsReceived > 0 
                            ? "Nos alegramos de este resultado. ¡El feedback es el regalo que todos deseamos!"
                            : "Ten paciencia, el hombre es un ser sociable por naturaleza."
                        }
                    </p>
                </div>

                <div className={styles.footer}>
                    Disfruta de estas fechas y... <br/>¡Te esperamos el año que viene!
                </div>
            </div>
        );
    } else {
        cardContent = <p>No se pudo cargar la información.</p>;
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.card}>
                <h3 className={styles.title}>Resumen Anual</h3>
                
                <div className={styles.intro}>
                    Hemos visto que no has puesto excusas para el deporte, pero... ¿Qué hay de tus amigos? 
                    Veámos cuánto los has cuidado, ¡y cuánto te cuidaron!
                    {/* Espacio explícito añadido antes del span para evitar ambigüedad */}
                    {" "}
                    <span className={styles.introStrong}>Aquí tienes tus interacciones del año:</span>
                </div>

                {cardContent}

                <div className={styles.actions}>
                    <button type="button" className={styles.closeBtn} onClick={onClose}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

AnnualSummaryCard.propTypes = {
    onClose: PropTypes.func.isRequired,
};

export default AnnualSummaryCard;