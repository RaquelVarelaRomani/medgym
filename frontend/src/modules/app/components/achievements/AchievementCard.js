import React from 'react';
import styles from './AchievementCard.module.css';
import PropTypes from "prop-types";

export default function AchievementCard({ achievement }) {
    let {name, description, bronzeReq, silverReq, goldReq, highestProgress} = achievement;
    let progress = highestProgress;
    if (achievement.convertToHours) {
        progress = Math.floor(progress / 3600);
        bronzeReq /= 3600;
        silverReq /= 3600;
        goldReq /= 3600;
    }

    return (
        <div className={`${styles.card}`}>
            <div className={styles.info}>
                <h3 className={styles.title}>{name}</h3>
                <p className={styles.description}>{description}</p>

                <div className={styles.progressRow}>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${Math.min((progress / goldReq) * 100, 100)}%` }}
                        />
                    </div>
                    <span className={styles.progressText}>{progress}/{goldReq}</span>
                </div>
            </div>

            <div className={styles.badges}>
                {progress < bronzeReq &&
                    <img
                        src={process.env.PUBLIC_URL + "/assets/medal-silver.svg"}
                        alt="Sin medalla"
                        className={styles.medal}
                    />
                }
                {progress >= bronzeReq && progress < silverReq &&
                    <img
                        src={process.env.PUBLIC_URL + "/assets/medal-bronze.svg"}
                        alt="Bronce"
                        className={`${styles.medal} ${styles.active}`}
                    />
                }
                {progress >= silverReq && progress < goldReq &&
                    <img
                        src={process.env.PUBLIC_URL + "/assets/medal-silver.svg"}
                        alt="Plata"
                        className={`${styles.medal} ${styles.active}`}
                    />
                }
                {progress >= goldReq &&
                    <img
                        src={process.env.PUBLIC_URL + "/assets/medal-gold.svg"}
                        alt="Oro"
                        className={`${styles.medal} ${styles.active}`}
                    />
                }
            </div>
        </div>
    );
}

AchievementCard.propTypes = {
    achievement: PropTypes.shape({
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        bronzeReq: PropTypes.number.isRequired,
        silverReq: PropTypes.number.isRequired,
        goldReq: PropTypes.number.isRequired,
        progress: PropTypes.number.isRequired,
        highestProgress: PropTypes.number.isRequired,
        convertToHours: PropTypes.bool
    }).isRequired
};

