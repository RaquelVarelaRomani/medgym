export const getDifficultyText = (difficulty) => {
    switch (difficulty) {
        case "BEGINNER":
            return "Principiante";
        case "INTERMEDIATE":
            return "Intermedia";
        case "ADVANCED":
            return "Avanzada";
        default:
            return difficulty;
    }
};

export const getMuscleGroupsText = (muscle) => {
    switch (muscle) {
        case "LEG": return "Piernas";
        case "CHEST": return "Pectoral";
        case "FULL_BODY": return "Cuerpo completo";
        case "CORE": return "Core";
        case "BACK": return "Espalda";
        case "ARM": return "Brazos";
        case "BICEPS": return "Bíceps";
        case "TRICEPS": return "Tríceps";
        case "SHOULDERS": return "Hombros";
        default: return muscle;
    }
};

export const getEquipmentText = (equipment) => {
    switch (equipment) {
        case "NONE": return "Sin equipamiento";
        case "DUMBBELL": return "Mancuernas";
        case "BARBELL": return "Barra";
        case "BENCH_AND_BARBELL": return "Banco y barra";
        case "JUMP_ROPE": return "Comba";
        case "MAT": return "Colchoneta";
        case "PULLEY": return "Polea";
        case "PULL_UP_BAR": return "Barra de dominadas";
        default: return equipment;
    }
};

export const getExerciseTypeText = (exerciseType) => {
    switch (exerciseType) {
        case "STRENGTH": return "Fuerza";
        case "CARDIO": return "Cardio";
        default: return exerciseType;
    }
};