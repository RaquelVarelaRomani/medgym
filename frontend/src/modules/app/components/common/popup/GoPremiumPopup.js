import React from "react";
import styles from "./GoPremiumPopup.module.css";

function GoPremiumPopup({ show, text, onOk, onCancel }) {
    if (!show) return null;

    return (
        <div className={styles['popup-overlay']}>
            <div className={styles['popup-content']}>
                <h2 className={styles['popup-title']}>Función premium</h2>

                <p className={styles['popup-text']}>{text}</p>

                <div className={styles['popup-buttons']}>
                    <button className={styles['popup-cancel-btn']} onClick={onCancel}>
                        Cancelar
                    </button>

                    <button className={styles['premium-button']} onClick={onOk}>
                        Hacerme premium
                    </button>
                </div>
            </div>
        </div>
    );
}

export default GoPremiumPopup;
