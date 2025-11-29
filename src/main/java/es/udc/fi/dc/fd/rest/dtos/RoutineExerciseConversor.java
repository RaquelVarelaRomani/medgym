package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.Exercise.ExerciseStatus;
import es.udc.fi.dc.fd.model.entities.RoutineExercise;

public class RoutineExerciseConversor {
    private RoutineExerciseConversor() {
    }

    public static RoutineExerciseDto toRoutineExerciseDto(RoutineExercise routineExercise) {

        Exercise ex = routineExercise.getExercise();
        boolean blocked = (ex != null && ex.getStatus() == ExerciseStatus.BLOCKED);

        RoutineExerciseDto routineExerciseDto = new RoutineExerciseDto();

        routineExerciseDto.setId(routineExercise.getId());
        routineExerciseDto.setRoutineId(routineExercise.getRoutine().getId());
        routineExerciseDto.setExerciseId(routineExercise.getExercise().getId());
        routineExerciseDto.setExerciseName(routineExercise.getExercise().getName());
        routineExerciseDto.setExerciseDescription(routineExercise.getExercise().getDescription());
        routineExerciseDto.setMuscleGroup(routineExercise.getExercise().getMuscleGroup().toString());
        routineExerciseDto.setEquipment(routineExercise.getExercise().getEquipment().toString());
        routineExerciseDto.setImage(routineExercise.getExercise().getImage());
        routineExerciseDto.setPosition(routineExercise.getPosition());
        routineExerciseDto.setBlocked(blocked);

        return routineExerciseDto;
    }
}