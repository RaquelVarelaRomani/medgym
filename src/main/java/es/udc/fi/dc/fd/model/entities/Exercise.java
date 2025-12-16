package es.udc.fi.dc.fd.model.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "exercises")
public class Exercise {

    private Long id;
    private String name;
    private String description;
    private ExerciseStatus status;
    private MuscleGroup muscleGroup;
    private Equipment equipment;
    private ExerciseType exerciseType;
    private byte[] image;
    private User creator;

    public Exercise() {
    }

    public Exercise(String name, String description, ExerciseStatus status) {
        this.name = name;
        this.description = description;
        this.status = status;
    }

    public Exercise(String name, String description, MuscleGroup muscleGroup, Equipment equipment,
                    ExerciseType exerciseType, byte[] image, ExerciseStatus status, User creator) {
        this.name = name;
        this.description = description;
        this.muscleGroup = muscleGroup;
        this.equipment = equipment;
        this.exerciseType = exerciseType;
        this.image = image;
        this.status = status;
        this.creator = creator;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @Column(unique = true)
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "muscle_group", length = 50)
    public MuscleGroup getMuscleGroup() {
        return muscleGroup;
    }

    public void setMuscleGroup(MuscleGroup muscleGroup) {
        this.muscleGroup = muscleGroup;
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "equipment", length = 50)
    public Equipment getEquipment() {
        return equipment;
    }

    public void setEquipment(Equipment equipment) {
        this.equipment = equipment;
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "exerciseType", length = 50)
    public ExerciseType getExerciseType() {
        return exerciseType;
    }

    public void setExerciseType(ExerciseType exerciseType) {
        this.exerciseType = exerciseType;
    }

    @Lob
    @Column(name = "image")
    public byte[] getImage() {
        return image;
    }

    public void setImage(byte[] image) {
        this.image = image;
    }

    @Enumerated(EnumType.STRING)
    public ExerciseStatus getStatus() {
        return status;
    }

    public void setStatus(ExerciseStatus status) {
        this.status = status;
    }

    @ManyToOne()
    @JoinColumn(name = "creator_id")
    public User getCreator() {
        return creator;
    }

    public void setCreator(User creator) {
        this.creator = creator;
    }

    public enum ExerciseStatus {
        PENDING,
        APPROVED,
        REJECTED,
        BLOCKED
    }

    public enum MuscleGroup {
        LEG,
        CHEST,
        FULL_BODY,
        CORE,
        BACK,
        ARM,
        BICEPS,
        TRICEPS,
        SHOULDERS
    }

    public enum Equipment {
        NONE,
        DUMBBELL,
        BARBELL,
        BENCH_AND_BARBELL,
        JUMP_ROPE,
        MAT,
        PULLEY,
        PULL_UP_BAR
    }

    public enum ExerciseType {
        STRENGTH,
        CARDIO
    }
}
