package es.udc.fi.dc.fd.model.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "user_follow")
public class UserFollow {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "client_id")
    private User user;
    @ManyToOne
    @JoinColumn(name = "trainer_id")
    private User trainer;

    public UserFollow() {}

    public UserFollow(User user, User trainer) {
        this.user = user;
        this.trainer = trainer;
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

    public User gettrainer() {
        return trainer;
    }

    public void settrainer(User trainer) {
        this.trainer = trainer;
    }
}
