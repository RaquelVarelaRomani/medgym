import React, { useEffect, useState } from "react";
import styles from "./NotificationIcon.module.css";
import * as notificationService from "../../../../backend/notificationService";

const NotificationIcon = ({ onClick }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        notificationService.getUserNotifications(
            (data) => setCount(data.length),
            (error) => console.error("Error loading notifications:", error)
        );
    }, []);

    return (
        <button className={styles['notification-button']} onClick={onClick}>
            <img
                src={process.env.PUBLIC_URL + "/assets/notification-icon.svg"}
                alt="Notificaciones"
                className={`${styles['notification-icon']} ${count > 0 ? styles['has-notifications'] : ''}`}
            />
            {count > 0 && <span className={styles['notification-badge']}>{count}</span>}
        </button>
    );
};

export default NotificationIcon;
