package es.udc.fi.dc.fd.model.entities;

import jakarta.persistence.*;

@Entity
@Table(name= "exercises")
public class Exercise {

    public enum ExerciseStatus {
        PENDING,
        APPROVED,
        REJECTED
    }

    private Long id;
    private String name;
    private String description;
    private ExerciseStatus status;
    private String muscleGroup;
    private String equipment;
    private byte[] image;
    private User creator;

    public Exercise() {}

    public Exercise(String name, String description, ExerciseStatus status) {
        this.name = name;
        this.description = description;
        this.status = status;
    }

    public Exercise(String name, String description, String muscleGroup, String equipment, byte[] image, ExerciseStatus status, User creator) {
        this.name = name;
        this.description = description;
        this.muscleGroup = muscleGroup;
        this.equipment = equipment;
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

    @Column(name = "muscle_group", length = 50)
    public String getMuscleGroup() {
        return muscleGroup;
    }
    public void setMuscleGroup(String muscleGroup) {
        this.muscleGroup = muscleGroup;
    }

    @Column(name = "equipment", length = 50)
    public String getEquipment() {
        return equipment;
    }
    public void setEquipment(String equipment) {
        this.equipment = equipment;
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
}
