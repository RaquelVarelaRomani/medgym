package es.udc.fi.dc.fd.rest.dtos;

public class RoutineExerciseDto {
    private Long id;
    private Long routineId;
    private Long exerciseId;
    private String description;

    public RoutineExerciseDto() {}

    public RoutineExerciseDto(Long id, Long routineId, Long exerciseId, String description) {
        this.id = id;
        this.routineId = routineId;
        this.exerciseId = exerciseId;
        this.description = description;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
