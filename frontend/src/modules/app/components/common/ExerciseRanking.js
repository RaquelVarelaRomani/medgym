import React from "react";
import styles from "./ExerciseRanking.module.css";

const ExerciseRanking = ({ ranking, currentUser }) => {
    if (!ranking) return null;
    if (!ranking.length)
        return <p className={styles.empty}>No hay marcas registradas.</p>;

    const sorted = [...ranking].sort((a, b) => b.maxWeightKg - a.maxWeightKg);

    return (
        <ul className={styles.list}>
            {sorted.map((p, index) => {
                const highlight = currentUser && p.userId === currentUser.id;

                return (
                    <li
                        key={index}
                        className={highlight ? styles.itemHighlight : styles.item}
                    >
                        <span className={styles.position}>{index + 1}.</span>

                        <img
                            className={styles.avatar}
                            src={
                                p.userProfilePicture
                                    ? `data:image/jpeg;base64,${p.userProfilePicture}`
                                    : process.env.PUBLIC_URL + "/assets/default-profile.jpg"
                            }
                            alt="avatar"
                        />

                        <span className={styles.name}>
                            {p.userName} {p.userSurname}
                        </span>

                        <span className={styles.weight}>{p.maxWeightKg} kg</span>
                    </li>
                );
            })}
        </ul>
    );
};

export default ExerciseRanking;
