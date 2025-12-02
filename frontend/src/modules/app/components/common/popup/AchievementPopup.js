import React from "react";
import styles from "./Popup.module.css";
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
                <div style={{ textAlign: 'center' }}>
                    {isSingle ? (
                        <>
                            <img
                                src={process.env.PUBLIC_URL + `/assets/${getMedalImage(achievement.progress, achievement.silverReq, achievement.goldReq)}`}
                                alt="Medalla"
                                style={{ width: '80px', height: '80px', marginBottom: '10px' }}
                            />
                            <p>¡Nueva medalla desbloqueada: {achievement.name}!</p>
                            <p style={{ fontSize: '1rem', fontWeight: 'normal', marginTop: '-1.5rem' }}>
                                {achievement.description} ({getMedalInfo(achievement.progress, achievement.bronzeReq, achievement.silverReq, achievement.goldReq)})
                            </p>
                        </>
                    ) : (
                        <>
                            <p>¡Nuevas medallas desbloqueadas!</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
                                {achievements.map((ach) => (
                                    <div key={ach.name} style={{ textAlign: 'center' }}>
                                        <img
                                            src={process.env.PUBLIC_URL + `/assets/${getMedalImage(ach.progress, ach.silverReq, ach.goldReq)}`}
                                            alt="Medalla"
                                            style={{ width: '60px', height: '60px' }}
                                        />
                                        <p style={{ fontSize: '12px', margin: '5px 0 0 0' }}>{ach.name}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
                <button onClick={onOk}>OK</button>
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