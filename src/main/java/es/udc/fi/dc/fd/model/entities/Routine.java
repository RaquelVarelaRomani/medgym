package es.udc.fi.dc.fd.model.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "routines")
public class Routine {
    private Long id;
    private String name;
    private String description;

    private LocalDateTime creationDate;

    private LocalDateTime modificationDate;

    private User trainer;

    public Routine() {}

    public Routine(String name, String description, LocalDateTime creationDate, LocalDateTime modificationDate) {
        this.name = name;
        this.description = description;
        this.creationDate = creationDate;
        this.modificationDate = modificationDate;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    @Column(name = "creation_date")
    public LocalDateTime getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(LocalDateTime creationDate) {
        this.creationDate = creationDate;
    }

    @Column(name = "modification_date")
    public LocalDateTime getModificationDate() {
        return modificationDate;
    }

    public void setModificationDate(LocalDateTime modificationDate) {
        this.modificationDate = modificationDate;
    }

    @ManyToOne
    @JoinColumn(name = "trainer_id")
    public User getTrainer() {
        return trainer;
    }

    public void setTrainer(User user) {
        this.trainer = user;
    }
}
