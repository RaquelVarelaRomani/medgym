import React from "react";
import styles from "./Popup.module.css";

function Popup({ show, text, onOk }) {
    if (!show) return null;

    return (
        <div className={styles['popup-overlay']}>
            <div className={styles['popup-content']}>
                <p>{text}</p>
                <button onClick={onOk}>OK</button>
            </div>
        </div>
    );
}

export default Popup;
