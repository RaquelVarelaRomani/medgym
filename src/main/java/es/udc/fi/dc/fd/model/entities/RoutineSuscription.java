package es.udc.fi.dc.fd.model.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "routine_suscription")
public class RoutineSuscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    @ManyToOne
    @JoinColumn(name = "routine_id")
    private Routine routine;

    public RoutineSuscription() {}

    public RoutineSuscription(User user, Routine routine) {
        this.user = user;
        this.routine = routine;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Routine getRoutine() {
        return routine;
    }

    public void setRoutine(Routine routine) {
        this.routine = routine;
    }
}
