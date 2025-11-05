package es.udc.fi.dc.fd.rest.dtos;

public class RoutineExerciseDto {
    private Long id;
    private Long routineId;
    private Long exerciseId;
    private String exerciseName;
    private String exerciseDescription;
    private String muscleGroup;
    private String equipment;
    private byte[] image;
    private Integer position;
    private boolean blocked;

    public RoutineExerciseDto() {}

    public RoutineExerciseDto(Long id, Long routineId, Long exerciseId, String exerciseName, String exerciseDescription, String muscleGroup, String equipment, byte[] image, Integer position) {
        this.id = id;
        this.routineId = routineId;
        this.exerciseId = exerciseId;

        this.exerciseName = exerciseName == null ? null : exerciseName.trim();
        this.exerciseDescription = exerciseDescription == null ? null : exerciseDescription.trim();
        this.muscleGroup = muscleGroup == null ? "" : muscleGroup.trim();
        this.equipment = equipment == null ? "" : equipment.trim();
        this.image = image;
        this.position = position;
        this.blocked = false;
    }

    public RoutineExerciseDto(Long id, Long routineId, Long exerciseId, String exerciseName, String exerciseDescription, String muscleGroup, String equipment, byte[] image, Integer position, boolean blocked) {
        this.id = id;
        this.routineId = routineId;
        this.exerciseId = exerciseId;

        this.exerciseName = exerciseName == null ? null : exerciseName.trim();
        this.exerciseDescription = exerciseDescription == null ? null : exerciseDescription.trim();
        this.muscleGroup = muscleGroup == null ? "" : muscleGroup.trim();
        this.equipment = equipment == null ? "" : equipment.trim();
        this.image = image;
        this.position = position;
        this.blocked = blocked;
    }

    public RoutineExerciseDto(Long id, Long routineId, Long exerciseId, String exerciseName, String exerciseDescription, Integer position) {
    this(id, routineId, exerciseId, exerciseName, exerciseDescription,"", "", null, position);
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


    public String getMuscleGroup() {
        return muscleGroup;
    }

    public void setMuscleGroup(String muscleGroup) {
        this.muscleGroup = muscleGroup;
    }

    public String getEquipment() {
        return equipment;
    }

    public void setEquipment(String equipment) {
        this.equipment = equipment;
    }

    public byte[] getImage() {
        return image;
    }

    public void setImage(byte[] image) {
        this.image = image;
    }

    public Integer getPosition() {
        return position;
    }
    public void setPosition(Integer position) {
        this.position = position;
    }

    public boolean isBlocked() {
        return blocked;
    }
    public void setBlocked(boolean blocked) {
        this.blocked = blocked;
    }
}
