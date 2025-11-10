import styles from './Metrics.module.css';

export default function Metrics({ lastMonthWorkouts, totalDuration, averageDuration }) {
    return (
        <div className={styles['metrics-grid']}>
            <div className={styles['metric-card']}>
                <div className={styles['metric-label']}>Entrenamientos completados</div>
                <div className={styles['metric-value']}>{lastMonthWorkouts}</div>
            </div>

            <div className={styles['metric-card']}>
                <div className={styles['metric-label']}>Duración total</div>
                <div className={styles['metric-value']}>{totalDuration}</div>
            </div>

            <div className={styles['metric-card']}>
                <div className={styles['metric-label']}>Duración promedio</div>
                <div className={styles['metric-value']}>{averageDuration}</div>
            </div>
        </div>
    );
}