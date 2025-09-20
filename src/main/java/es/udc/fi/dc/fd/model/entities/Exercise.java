package es.udc.fi.dc.fd.model.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "exercises")
public class Exercise {
    /** The id. */
    private long id;
    /** The exercise name. */
    private String name;
    /** The description. **/
    private String description;

    public Exercise() {}

    public Exercise(long id, String name, String description) {
        this.id = id;
        this.name = name;
        this.description = description;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public long getId() {
        return id;
    }

    public void setId(long id) {
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
}
