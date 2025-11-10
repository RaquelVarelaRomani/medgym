import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
    Cell,
} from 'recharts';
import styles from './MuscleGroupChart.module.css';
import {getMuscleGroupsText} from "../../../util/enumConversor";

const COLORS = [
    'var(--neon-orange)',
    'var(--accent-cyan)',
    'var(--accent-green)',
    'var(--accent-yellow)',
    'var(--accent-red)',
    'var(--accent-purple)',
];

export default function MuscleGroupChart({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className={styles['empty-chart']}>
                <p>No hay datos de grupos musculares disponibles</p>
            </div>
        );
    }

    const formattedData = data.map(item => ({
        ...item,
        displayName: getMuscleGroupsText(item.name),
        originalName: item.name,
    }));

    return (
        <div className={styles['chart-container']}>
            <h3 className={styles['chart-title']}>Ejercicios por Grupo Muscular</h3>

            <div className={styles['chart-wrapper']}>
                <ResponsiveContainer width="100%" height={450}>
                    <BarChart
                        data={formattedData}
                        margin={{ top: 20, right: 30, left: 20, bottom: -70 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="rgba(255, 107, 53, 0.1)"
                        />
                        <XAxis
                            dataKey="displayName"
                            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={120}
                        />
                        <YAxis
                            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                            allowDecimals={false}
                            type="number"
                            domain={[0, 'dataMax + 2']}
                        />
                        <Bar
                            dataKey="exercises"
                            radius={[8, 8, 0, 0]}
                            animationDuration={800}
                        >
                            {formattedData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}