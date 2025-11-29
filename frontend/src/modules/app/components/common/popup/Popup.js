import React from "react";
import styles from "./Popup.module.css";
import PropTypes from "prop-types";

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

Popup.propTypes = {
    show: PropTypes.bool.isRequired,
    text: PropTypes.string.isRequired,
    onOk: PropTypes.func.isRequired
};