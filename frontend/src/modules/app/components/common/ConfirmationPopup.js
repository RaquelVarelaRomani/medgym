import React from "react";
import styles from "./ConfirmationPopup.module.css";

function ConfirmationPopup({ show, text, onOk, onCancel }) {
    if (!show) return null;

    return (
        <div className={styles['popup-overlay']}>
            <div className={styles['popup-content']}>
                <p>{text}</p>
                <div className={styles['popup-buttons']}>
                    <button className={styles['popup-accept-btn']} onClick={onCancel}>Cancelar</button>
                    <button className={styles['popup-accept-btn']} onClick={onOk}>OK</button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmationPopup;
