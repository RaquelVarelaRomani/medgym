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
import { getMuscleGroupsText } from "../../../util/enumConversor";
import PropTypes from "prop-types";
import { useState } from 'react';

const BASE_COLORS = [
    'var(--neon-orange)',
    'var(--accent-cyan)',
    'var(--accent-green)',
    'var(--accent-yellow)',
    'var(--accent-red)',
    'var(--accent-purple)',
];

const BASE_COLORS_DARK = [
    'var(--neon-orange-glow)',
    'var(--accent-cyan-glow)',
    'var(--accent-green-glow)',
    'var(--accent-yellow-glow)',
    'var(--accent-red-glow)',
    'var(--accent-purple-glow)',
];

function CustomLegend({ lastMonthLabel, previousMonthLabel }) {
    return (
        <div className={styles['custom-legend']}>
            <div className={styles['legend-section']}>
                <span className={styles['legend-label']}>Hace 2 meses:</span>
                <div className={styles['legend-example']}>
                    <div
                        className={styles['legend-square']}
                        style={{backgroundColor: BASE_COLORS_DARK[0]}}
                    />
                    <span className={styles['legend-text']}>Color desaturado</span>
                </div>

                <div className={styles['legend-divider']}/>

                <span className={styles['legend-label']}>Mes anterior:</span>
                <div className={styles['legend-example']}>
                    <div
                        className={styles['legend-square']}
                        style={{backgroundColor: BASE_COLORS[0]}}
                    />
                    <span className={styles['legend-text']}>Color saturado</span>
                </div>
            </div>
        </div>
    );
}

export default function MuscleGroupChart({
                                             data,
                                             comparisonData = null,
                                             lastMonthLabel = "Último mes",
                                             previousMonthLabel = "Mes anterior"
                                         }) {
    const [isComparisonView, setIsComparisonView] = useState(false);

    const canShowComparison = comparisonData && comparisonData.length > 0;

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

    const getComparisonData = () => {
        const formattedComparison = comparisonData.map(item => ({
            ...item,
            displayName: getMuscleGroupsText(item.name),
            originalName: item.name,
        }));

        return formattedData.map(currentMonth => {
            const previousMonth = formattedComparison.find(
                item => item.originalName === currentMonth.originalName
            );

            return {
                displayName: currentMonth.displayName,
                originalName: currentMonth.originalName,
                [previousMonthLabel]: previousMonth?.exercises || 0,
                [lastMonthLabel]: currentMonth.exercises,
            };
        });
    };

    const chartData = isComparisonView ? getComparisonData() : formattedData;

    return (
        <div className={styles['chart-container']}>
            <div className={styles['chart-header']}>
                <h3 className={styles['chart-title']}>
                    Ejercicios por grupo muscular
                </h3>

                {canShowComparison && (
                    <button
                        type="button"
                        className={`${styles['toggle-view-button']} ${
                            isComparisonView ? styles['active'] : ''
                        }`}
                        onClick={() => setIsComparisonView(!isComparisonView)}
                    >
                        {isComparisonView ? 'Vista Normal' : 'Comparar Meses'}
                    </button>
                )}
            </div>

            <div className={styles['chart-wrapper']}>
                <ResponsiveContainer width="100%" height={450}>
                    <BarChart
                        data={chartData}
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

                        {isComparisonView ? (
                            <>
                                <Bar
                                    dataKey={previousMonthLabel}
                                    radius={[8, 8, 0, 0]}
                                    animationDuration={800}
                                >
                                    {formattedData.map((entry, index) => (
                                        <Cell
                                            key={`${entry.originalName}-previous`}
                                            fill={BASE_COLORS_DARK[index % BASE_COLORS_DARK.length]}
                                        />
                                    ))}
                                </Bar>
                                <Bar
                                    dataKey={lastMonthLabel}
                                    radius={[8, 8, 0, 0]}
                                    animationDuration={800}
                                >
                                    {formattedData.map((entry, index) => (
                                        <Cell
                                            key={`${entry.originalName}-current`}
                                            fill={BASE_COLORS[index % BASE_COLORS.length]}
                                        />
                                    ))}
                                </Bar>
                            </>
                        ) : (
                            <Bar
                                dataKey="exercises"
                                radius={[8, 8, 0, 0]}
                                animationDuration={800}
                            >
                                {formattedData.map((entry, index) => (
                                    <Cell
                                        key={entry.originalName}
                                        fill={BASE_COLORS[index % BASE_COLORS.length]}
                                    />
                                ))}
                            </Bar>
                        )}
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {isComparisonView && canShowComparison && (
                <CustomLegend
                    lastMonthLabel={lastMonthLabel}
                    previousMonthLabel={previousMonthLabel}
                />
            )}
        </div>
    );
}

MuscleGroupChart.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        exercises: PropTypes.number.isRequired,
    })).isRequired,
    comparisonData: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string.isRequired,
        exercises: PropTypes.number.isRequired,
    })),
    lastMonthLabel: PropTypes.string,
    previousMonthLabel: PropTypes.string,
};

CustomLegend.propTypes = {
    lastMonthLabel: PropTypes.string.isRequired,
    previousMonthLabel: PropTypes.string.isRequired,
};