import styles from './Metrics.module.css';

export default function Metrics({ lastMonthWorkouts, totalDuration, averageDuration }) {
    return (
        <div className={styles['metrics-grid']}>
            <div className={styles['metric-card']}>
                <div className={styles['metric-label']}>Entrenamientos Completados</div>
                <div className={styles['metric-value']}>{lastMonthWorkouts}</div>
            </div>

            <div className={styles['metric-card']}>
                <div className={styles['metric-label']}>Duración Total</div>
                <div className={styles['metric-value']}>{totalDuration}</div>
            </div>

            <div className={styles['metric-card']}>
                <div className={styles['metric-label']}>Duración Promedio</div>
                <div className={styles['metric-value']}>{averageDuration}</div>
            </div>
        </div>
    );
}