import React, { useEffect, useState } from "react";
import styles from "./FollowersPage.module.css";
import { tryLoginFromServiceToken } from "../../../../backend/userService";
import { getFollowedTrainers } from "../../../../backend/userFollowService";
import { useNavigate, useParams } from "react-router-dom";
import LoadingMessage from "../common/LoadingMessage";

const FollowingPage = () => {
    const {id} = useParams()
    const navigate = useNavigate();
    const [followers, setFollowers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        tryLoginFromServiceToken(
        () => {
            getFollowedTrainers(
            id,
            (followersData) => {
                setFollowers(followersData);
                setLoading(false);
            },
            () => {
                setError("No se pudieron cargar los seguidores.");
                setLoading(false);
            }
            );
        },
        () => {
            setError("Sesión expirada. Inicia sesión de nuevo.");
            setLoading(false);
            navigate("/users/login");
        }
        );
    }, [navigate]);

    if (loading) return <LoadingMessage text="Cargando seguidos..." />;

    if (error) return <div className={styles["followers-container"]}>{error}</div>;

    return (
        <div className={styles["followers-container"]}>
        <div className={styles["followers-header"]}>
            <h2>Tus Seguidos</h2>
        </div>

        {followers.length === 0 ? (
            <div className={styles["followers-list"]}>
            <div className={`${styles["follower-card"]} ${styles["empty"]}`}>
                <p className={styles["no-followers-text"]}>Aún no sigues a nadie.</p>
            </div>
            </div>
        ) : (
            <div className={styles["followers-list"]}>
            {followers.map((follower) => (
                <button
                    key={follower.id}
                    type="button"
                    className={styles["follower-card"]}
                    onClick={() => navigate(`/users/profile/${follower.trainerId}`)}
                >
                    <h3>
                        {follower.trainerUserName} {follower.trainerUserSurname}
                    </h3>
                    <p>{follower.trainerUserEmail}</p>
                </button>
            ))}
            </div>
        )}
        </div>
    );
};

export default FollowingPage;
