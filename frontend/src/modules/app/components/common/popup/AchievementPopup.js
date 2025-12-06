import React from "react";
import styles from "./Popup.module.css";
import achievementStyles from './AchievementPopup.module.css';
import PropTypes from "prop-types";

function AchievementPopup({ show, achievements, onOk }) {
    if (!show || !achievements || achievements.length === 0) return null;

    const getMedalImage = (progress, silverReq, goldReq) => {
        if (progress >= goldReq) return "medal-gold.svg";
        if (progress >= silverReq) return "medal-silver.svg";
        return "medal-bronze.svg";
    };

    const getMedalInfo = (progress, bronzeReq, silverReq, goldReq) => {
        if (progress >= goldReq) return goldReq;
        if (progress >= silverReq) return silverReq;
        return bronzeReq;
    };

    const isSingle = achievements.length === 1;
    const achievement = isSingle ? achievements[0] : null;

    return (
        <div className={styles['popup-overlay']}>
            <div className={styles['popup-content']}>
                <div className={achievementStyles.center}>
                    {isSingle ? (
                        <>
                            <img
                                src={process.env.PUBLIC_URL + `/assets/${getMedalImage(achievement.progress, achievement.silverReq, achievement.goldReq)}`}
                                alt="Medalla"
                                className={achievementStyles.medalImageLarge}
                            />
                            <p>¡Nueva medalla desbloqueada!<br/>{achievement.name}</p>
                            <p className={achievementStyles.achievementDescription}>
                                {achievement.description} ({getMedalInfo(achievement.progress, achievement.bronzeReq, achievement.silverReq, achievement.goldReq)})
                            </p>
                        </>
                    ) : (
                        <>
                            <p>¡Nuevas medallas desbloqueadas!</p>
                            <div className={achievementStyles.medalsContainer}>
                                {achievements.map((ach) => (
                                    <div key={ach.name} className={achievementStyles.medalItem}>
                                        <img
                                            src={process.env.PUBLIC_URL + `/assets/${getMedalImage(ach.progress, ach.silverReq, ach.goldReq)}`}
                                            alt="Medalla"
                                            className={achievementStyles.medalImageSmall}
                                        />
                                        <p className={achievementStyles.medalName}>{ach.name}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
                <button onClick={() => { onOk(); window.dispatchEvent(new CustomEvent('routineDeleted')); }}>OK</button>
            </div>
        </div>
    );
}

AchievementPopup.propTypes = {
    show: PropTypes.bool.isRequired,
    achievements: PropTypes.arrayOf(PropTypes.object),
    onOk: PropTypes.func.isRequired
};

export default AchievementPopup;