import React from "react";
import styles from "./ExerciseRanking.module.css";
import PropTypes from "prop-types";

const ExerciseRanking = ({ ranking, currentUser }) => {
    if (!ranking) return null;
    if (!ranking.length)
        return <p className={styles.empty}>No hay marcas registradas.</p>;

    const sorted = [...ranking].sort((a, b) => b.maxWeightKg - a.maxWeightKg);

    return (
        <ul className={styles.list}>
            {sorted.map((p) => {
                const highlight = currentUser && p.userId === currentUser.id;

                return (
                    <li
                        key={p.id}
                        className={highlight ? styles.itemHighlight : styles.item}
                    >
                        <span className={styles.position}>{sorted.indexOf(p) + 1}.</span>

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

ExerciseRanking.propTypes = {
    ranking: PropTypes.arrayOf(
        PropTypes.shape({
            userId: PropTypes.number.isRequired,
            userName: PropTypes.string.isRequired,
            userSurname: PropTypes.string.isRequired,
            userProfilePicture: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.object,
                PropTypes.instanceOf(Uint8Array)
            ]),
            maxWeightKg: PropTypes.number.isRequired
        })
    ).isRequired,
    currentUser: PropTypes.shape({
        id: PropTypes.number.isRequired
    })
};