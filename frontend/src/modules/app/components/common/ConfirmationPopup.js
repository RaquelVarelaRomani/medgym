import React from "react";
import "./ConfirmationPopup.css";

function ConfirmationPopup({ show, text, onOk, onCancel }) {
    if (!show) return null;

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <p>{text}</p>
                <div className="popup-buttons">
                    <button className="popup-accept-btn" onClick={onOk}>Aceptar</button>
                    <button className="popup-cancel-btn" onClick={onCancel}>Cancelar</button>
                </div>

            </div>
        </div>
    );
}

export default ConfirmationPopup;
