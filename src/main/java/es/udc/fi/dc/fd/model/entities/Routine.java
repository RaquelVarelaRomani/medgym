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

    /**
     * The creationDate and modificationDate fields are handled by the database.
     * creation_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
     * modification_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
     */
    public Routine(String name,  String description, User trainer) {
        this.name = name;
        this.description = description;
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

    @Column(name = "creation_date", nullable = false, updatable = false, insertable = false)
    public LocalDateTime getCreationDate() {
        return creationDate;
    }
    public void setCreationDate(LocalDateTime creationDate) {
        this.creationDate = creationDate;
    }

    @Column(name = "modification_date", nullable = false, updatable = false, insertable = false)
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
