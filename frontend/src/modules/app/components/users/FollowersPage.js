import React, { useEffect, useState } from "react";
import styles from "./FollowersPage.module.css";
import { tryLoginFromServiceToken } from "../../../../backend/userService";
import { getFollowers } from "../../../../backend/userFollowService";
import { useNavigate } from "react-router-dom";
import LoadingMessage from "../common/LoadingMessage";

const FollowersPage = () => {
    const navigate = useNavigate();
    const [followers, setFollowers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        tryLoginFromServiceToken(
        (data) => {
            const user = data.user;
            setCurrentUser(user);

            if (user.role !== "TRAINER") {
            setError("Solo los entrenadores pueden ver sus seguidores.");
            setLoading(false);
            return;
            }

            getFollowers(
            user.id,
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

    if (loading) return <LoadingMessage text="Cargando seguidores..." />;

    if (error) return <div className={styles["followers-container"]}>{error}</div>;

    return (
        <div className={styles["followers-container"]}>
        <div className={styles["followers-header"]}>
            <h2>Tus Seguidores</h2>
        </div>

        {followers.length === 0 ? (
            <div className={styles["followers-list"]}>
            <div className={`${styles["follower-card"]} ${styles["empty"]}`}>
                <p className={styles["no-followers-text"]}>Aún no tienes seguidores.</p>
            </div>
            </div>
        ) : (
            <div className={styles["followers-list"]}>
            {followers.map((follower) => (
                <div key={follower.id} className={styles["follower-card"]}>
                <h3>
                    {follower.userName} {follower.userSurname}
                </h3>
                <p>{follower.userEmail}</p>
                </div>
            ))}
            </div>
        )}
        </div>
    );
};

export default FollowersPage;
