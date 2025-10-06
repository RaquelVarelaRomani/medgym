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

    public Exercise() {}

    public Exercise(String name, String description, ExerciseStatus status) {
        this.name = name;
        this.description = description;
        this.status = status;
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
    public ExerciseStatus getStatus() {
        return status;
    }
    public void setStatus(ExerciseStatus status) {
        this.status = status;
    }
}
