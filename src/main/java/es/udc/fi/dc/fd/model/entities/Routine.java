package es.udc.fi.dc.fd.model.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "routines")
public class Routine {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime creationDate;
    private LocalDateTime modificationDate;
    private VisibilityType visibility;
    private DifficultyType difficulty;
    private User trainer;
    private List<RoutineExercise> routineExercises;
    private List<RoutineLike> routineLikes;

    public Routine() {
    }

    public Routine(String name, String description, VisibilityType visibility, DifficultyType difficulty,
                   User trainer) {
        this.name = name;
        this.description = description;
        this.visibility = visibility;
        this.difficulty = difficulty;
        this.trainer = trainer;
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

    @Column(name = "creation_date", nullable = false, updatable = false, insertable = false, columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    public LocalDateTime getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(LocalDateTime creationDate) {
        this.creationDate = creationDate;
    }

    @Column(name = "modification_date", nullable = false, updatable = false, insertable = false, columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    public LocalDateTime getModificationDate() {
        return modificationDate;
    }

    public void setModificationDate(LocalDateTime modificationDate) {
        this.modificationDate = modificationDate;
    }

    public VisibilityType getVisibility() {
        return visibility;
    }

    public void setVisibility(VisibilityType visibility) {
        this.visibility = visibility;
    }

    @Enumerated(EnumType.ORDINAL)
    public DifficultyType getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(DifficultyType difficulty) {
        this.difficulty = difficulty;
    }

    @ManyToOne
    @JoinColumn(name = "trainer_id")
    public User getTrainer() {
        return trainer;
    }

    public void setTrainer(User user) {
        this.trainer = user;
    }

    @OneToMany(mappedBy = "routine", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<RoutineExercise> getRoutineExercises() {
        return routineExercises;
    }

    public void setRoutineExercises(java.util.List<RoutineExercise> routineExercises) {
        this.routineExercises = routineExercises;
    }

    @OneToMany(mappedBy = "routine", cascade = CascadeType.ALL, orphanRemoval = true)
    public List<RoutineLike> getRoutineLikes() {
        return routineLikes;
    }

    public void setRoutineLikes(List<RoutineLike> likes) {
        this.routineLikes = likes;
    }

    @Transient
    public boolean isPrivate() {
        return visibility == VisibilityType.PRIVATE;
    }

    public enum VisibilityType {
        PUBLIC,
        PRIVATE
    }

    public enum DifficultyType {
        BEGINNER,
        INTERMEDIATE,
        ADVANCED
    }
}
