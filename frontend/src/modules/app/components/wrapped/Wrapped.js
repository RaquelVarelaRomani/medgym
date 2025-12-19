import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { tryLoginFromServiceToken } from "../../../../backend/userService";
import { getWeightComparison, getLongestStreak, getTopExercises, getFavoriteRoutine, getFavoriteMuscleGroup, getAnnualSummary } from "../../../../backend/wrappedService";
import { getMuscleGroupsText } from "../../util/enumConversor";
import styles from "./Wrapped.module.css";
import LoadingMessage from "../common/LoadingMessage";

const Wrapped = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [wrappedData, setWrappedData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [me, setMe] = useState(null);

    const totalSlides = 8;
    const targetYear = 2025;

    useEffect(() => {
        tryLoginFromServiceToken(
            ({ user }) => {
                setMe(user);

                const profileId = parseInt(id, 10);

                if (user.id !== profileId) {
                    navigate(`/users/${user.id}/wrapped`);
                    return;
                }

                loadWrappedData();
            },
            () => navigate("/users/login")
        );
    }, [id, navigate]);

    const loadWrappedData = () => {
        const combinedData = {
            year: targetYear,
            social: { likesGiven: 0, likesReceived: 0, commentsGiven: 0, commentsReceived: 0 },
            topExercises: [],
            favoriteRoutine: { name: "Sin rutina favorita", completionCount: 0, creatorName: null },
            dominantMuscleGroup: { name: "General" },
            longestStreak: { days: 0 },
            totalWeight: { kg: 0, comparison: "nada" },
        };

        let loadedCount = 0;
        const totalAPIs = 5;

        const checkAllLoaded = () => {
            loadedCount++;
            if (loadedCount === totalAPIs) {
                setWrappedData(combinedData);
                setLoading(false);
            }
        };

        getWeightComparison(
            targetYear,
            (weightData) => {
                combinedData.totalWeight = {
                    kg: weightData.totalWeightKg || 0,
                    comparison: weightData.comparisonPhrase || "nada",
                };
                checkAllLoaded();
            },
            (err) => {
                console.error("Error loading weight comparison:", err);
                checkAllLoaded();
            }
        );

        getLongestStreak(
            targetYear,
            (streakDays) => {
                combinedData.longestStreak = {
                    days: streakDays || 0
                };
                checkAllLoaded();
            },
            (err) => {
                console.error("Error loading longest streak:", err);
                checkAllLoaded();
            }
        );

        getAnnualSummary(
            (summaryData) => {
                combinedData.social = {
                    likesGiven: summaryData.likesGiven || 0,
                    likesReceived: summaryData.likesReceived || 0,
                    commentsGiven: summaryData.commentsGiven || 0,
                    commentsReceived: summaryData.commentsReceived || 0,
                };
                checkAllLoaded();
            },
            (err) => {
                console.error("Error loading annual summary:", err);
                checkAllLoaded();
            }
        );

        getTopExercises(
            (exercises) => {
                if (Array.isArray(exercises) && exercises.length > 0) {
                    combinedData.topExercises = exercises.slice(0, 3).map((exercise) => ({
                        name: exercise.name,
                        count: exercise.count || 0,
                        muscleGroup: exercise.muscleGroup || "General"
                    }));
                }
                checkAllLoaded();
            },
            (err) => {
                console.error("Error loading top exercises:", err);
                checkAllLoaded();
            }
        );

        getFavoriteMuscleGroup(
            (muscleGroupData) => {
                combinedData.dominantMuscleGroup = {
                    name: muscleGroupData.muscleGroup || "General"
                };
                checkAllLoaded();
            },
            (err) => {
                console.error("Error loading favorite muscle group:", err);
                checkAllLoaded();
            }
        );

        getFavoriteRoutine(
            (routine) => {
                if (routine && routine.name) {
                    combinedData.favoriteRoutine = {
                        name: routine.name,
                        completionCount: routine.count || 0,
                        creatorName: routine.creatorName || routine.creator?.username || null
                    };
                }
                checkAllLoaded();
            },
            (err) => {
                console.error("Error loading favorite routine:", err);
                checkAllLoaded();
            }
        );
    };

    const nextSlide = () => {
        if (currentSlide < totalSlides - 1) {
            setCurrentSlide(currentSlide + 1);
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    const handleClose = () => {
        navigate(`/users/profile/${id}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === "ArrowRight") nextSlide();
        if (e.key === "ArrowLeft") prevSlide();
        if (e.key === "Escape") handleClose();
    };

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentSlide]);

    if (loading) {
        return <LoadingMessage text="Cargando tu Wrapped 2025..." />;
    }

    return (
        <div className={styles.wrappedContainer}>
            <button className={styles.closeButton} onClick={handleClose}>
                ✕
            </button>

            <div className={styles.progressBar}>
                {[...Array(totalSlides)].map((_, index) => (
                    <div
                        key={`slide-${index}`}
                        className={`${styles.progressDot} ${
                            index === currentSlide ? styles.active : ""
                        } ${index < currentSlide ? styles.completed : ""}`}
                        aria-hidden="true"
                        onClick={() => goToSlide(index)}
                    />
                ))}
            </div>

            <div className={styles.slidesWrapper}>
                <div
                    className={styles.slidesContainer}
                    style={{transform: `translateX(-${currentSlide * 100}%)`}}
                >
                    {/* slide 1 */}
                    <div className={styles.slide}>
                        <div className={styles.slideContent}>
                            <h1 className={styles.mainTitle}>Tu año en</h1>
                            <div className={styles.logoContainer}>
                                <img
                                    src={process.env.PUBLIC_URL + "/assets/logo.svg"}
                                    alt="Logo medgym"
                                    className={styles.wrappedLogo}
                                />
                                <span className={styles.wrappedBrandName}>MEDGYM</span>
                            </div>
                            <div className={styles.year}>2025</div>
                            <p className={styles.subtitle}>
                                Un recorrido por tus logros
                            </p>
                        </div>
                    </div>

                    {/* slide 2 */}
                    <div className={styles.slide}>
                        <div className={styles.slideContent}>
                            <h2 className={styles.slideTitle}>
                                Tu impacto social
                            </h2>
                            <div className={styles.statsGrid}>
                                <div className={styles.statCard}>
                                    <div className={styles.statNumber}>
                                        {wrappedData.social.likesGiven}
                                    </div>
                                    <div className={styles.statLabel}>
                                        Likes dados
                                    </div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statNumber}>
                                        {wrappedData.social.likesReceived}
                                    </div>
                                    <div className={styles.statLabel}>
                                        Likes recibidos
                                    </div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statNumber}>
                                        {wrappedData.social.commentsGiven}
                                    </div>
                                    <div className={styles.statLabel}>
                                        Comentarios hechos
                                    </div>
                                </div>
                                <div className={styles.statCard}>
                                    <div className={styles.statNumber}>
                                        {wrappedData.social.commentsReceived}
                                    </div>
                                    <div className={styles.statLabel}>
                                        Comentarios recibidos
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* slide 3 */}
                    <div className={styles.slide}>
                        <div className={styles.slideContent}>
                            <h2 className={styles.slideTitle}>
                                Tus ejercicios favoritos
                            </h2>
                            {wrappedData.topExercises && wrappedData.topExercises.length > 0 ? (
                                <div className={styles.exerciseList}>
                                    {wrappedData.topExercises.map((exercise, index) => (
                                        <div key={`exercise-${index}`} className={styles.exerciseItem}>
                                            <div className={styles.exerciseRank}>
                                                {index + 1}
                                            </div>
                                            <div className={styles.exerciseInfo}>
                                                <div className={styles.exerciseName}>
                                                    {exercise.name}
                                                </div>
                                                <div className={styles.exerciseCount}>
                                                    {exercise.count} veces
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={styles.outroText}>
                                    Aún no has registrado ejercicios este año
                                </p>
                            )}
                        </div>
                    </div>

                    {/* slide 4 */}
                    <div className={styles.slide}>
                        <div className={styles.slideContent}>
                            <h2 className={styles.slideTitle}>
                                Tu grupo muscular favorito
                            </h2>
                            <div className={styles.muscleHero}>
                                <div className={styles.muscleName}>
                                    {getMuscleGroupsText(wrappedData.dominantMuscleGroup.name)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* slide 5 */}
                    <div className={styles.slide}>
                        <div className={styles.slideContent}>
                            <h2 className={styles.slideTitle}>
                                Tu rutina más seguida
                            </h2>
                            <div className={styles.routineCard}>
                                <div className={styles.routineName}>
                                    {wrappedData.favoriteRoutine.name}
                                </div>
                                <div className={styles.routineCount}>
                                    Completada {wrappedData.favoriteRoutine.completionCount} veces
                                </div>
                                {wrappedData.favoriteRoutine.creatorName && (
                                    <div className={styles.routineCreator}>
                                        por {wrappedData.favoriteRoutine.creatorName}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* slide 6 */}
                    <div className={styles.slide}>
                        <div className={styles.slideContent}>
                            <h2 className={styles.slideTitle}>
                                Tu mejor racha
                            </h2>
                            <div className={styles.streakHero}>
                                <div
                                    className={`${styles.streakEmoji} ${
                                        currentSlide === 5 ? styles.streakEmojiAnimate : ''
                                    }`}
                                >
                                    ⚡
                                </div>
                                <div className={styles.streakNumber}>
                                    {wrappedData.longestStreak.days}
                                </div>
                                <div className={styles.streakLabel}>
                                    días seguidos
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* slide 7 */}
                    <div className={styles.slide}>
                        <div className={styles.slideContent}>
                            <h2 className={styles.slideTitle}>
                                Peso total levantado
                            </h2>
                            <div className={styles.weightHero}>
                                <div className={styles.weightNumber}>
                                    {wrappedData.totalWeight.kg.toLocaleString()} kg
                                </div>
                                <div className={styles.weightComparison}>
                                    El equivalente a
                                </div>
                                <div className={styles.weightComparisonValue}>
                                    {wrappedData.totalWeight.comparison}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* slide 8 */}
                    <div className={styles.slide}>
                        <div className={styles.slideContent}>
                            <h2 className={styles.outroTitle}>
                                ¡Increíble trabajo!
                            </h2>
                            <p className={styles.outroText}>
                                2025 fue un año lleno de logros.
                            </p>
                            <p className={styles.outroText}>
                                ¿Listo para superar tus límites en 2026?
                            </p>
                            <button
                                className={styles.outroButton}
                                onClick={handleClose}
                            >
                                Volver al perfil
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {currentSlide > 0 && (
                <button className={styles.navArrowLeft} onClick={prevSlide}>
                    ‹
                </button>
            )}
            {currentSlide < totalSlides - 1 && (
                <button className={styles.navArrowRight} onClick={nextSlide}>
                    ›
                </button>
            )}

            <div className={styles.clickArea} onClick={nextSlide} aria-hidden="true"/>
        </div>
    );
};

export default Wrapped;