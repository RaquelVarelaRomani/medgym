package es.udc.fi.dc.fd.rest.dtos;

public class RoutineExerciseDto {
    private Long id;
    private Long routineId;
    private Long exerciseId;
    private Byte repetitionsNumber;
    private Short duration;

    public RoutineExerciseDto() {}

    public RoutineExerciseDto(Long id, Long routineId, Long exerciseId, Byte repetitionsNumber, Short duration) {
        this.id = id;
        this.routineId = routineId;
        this.exerciseId = exerciseId;
        this.repetitionsNumber = repetitionsNumber;
        this.duration = duration;
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

    public Byte getRepetitionsNumber() {
        return repetitionsNumber;
    }

    public void setRepetitionsNumber(Byte repetitionsNumber) {
        this.repetitionsNumber = repetitionsNumber;
    }

    public Short getDuration() {
        return duration;
    }

    public void setDuration(Short duration) {
        this.duration = duration;
    }
}
