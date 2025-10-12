import React, { useEffect, useRef } from "react";
import styles from "./NotificationPopup.module.css";

const NotificationPopup = ({ notifications = [], onClose }) => {
    const popupRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        console.log(notifications)
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    return (
        <div className={styles.popup} ref={popupRef}>
            <div className={styles.header}>
                <span>Notificaciones</span>
            </div>
            <div className={styles.list}>
                {notifications.length === 0 ? (
                    <div className={styles.empty}>Sin notificaciones</div>
                ) : (
                    notifications.map((n, index) => (
                        <div key={index} className={styles.item}>
                            <div className={styles.text}>{n.message}</div>
                            <div className={styles.date}>
                                {new Date(n.time).toLocaleString('es-ES', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationPopup;
