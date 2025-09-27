import React from "react";
import "./Popup.css";

function Popup({ show, text, onOk }) {
    if (!show) return null;

    return (
        <div className="popup-overlay">
            <div className="popup-content">
                <p>{text}</p>
                <button onClick={onOk}>OK</button>
            </div>
        </div>
    );
}

export default Popup;
