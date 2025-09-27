package es.udc.fi.dc.fd.rest.dtos;

public class RoutineExerciseDto {
    private Long id;
    private Long routineId;
    private Long exerciseId;
    private String exerciseName;
    private String exerciseDescription;
    private Integer position;

    public RoutineExerciseDto() {}

    public RoutineExerciseDto(Long id, Long routineId, Long exerciseId, String exerciseName, String exerciseDescription, Integer position) {
        this.id = id;
        this.routineId = routineId;
        this.exerciseId = exerciseId;
        this.exerciseName = exerciseName;
        this.exerciseDescription = exerciseDescription;
        this.position = position;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRoutineId() {
        return routineId;
    }

    public void setRoutineId(Long routineId) {
        this.routineId = routineId;
    }

    public Long getExerciseId() {
        return exerciseId;
    }

    public void setExerciseId(Long exerciseId) {
        this.exerciseId = exerciseId;
    }

    public String getExerciseName() {
        return exerciseName;
    }

    public void setExerciseName(String exerciseName) {
        this.exerciseName = exerciseName;
    }

    public String getExerciseDescription() {
        return exerciseDescription;
    }

    public void setExerciseDescription(String exerciseDescription) {
        this.exerciseDescription = exerciseDescription;
    }


    public Integer getPosition() {
        return position;
    }

    public void setPosition(Integer position) {
        this.position = position;
    }
}
