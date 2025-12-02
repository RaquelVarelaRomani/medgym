package es.udc.fi.dc.fd.model.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "achievements")
public class Achievement {

    private Long id;
    private String name;
    private String description;
    private Integer bronzeReq;
    private Integer silverReq;
    private Integer goldReq;

    public Achievement() {
    }

    public Achievement(String name, String description, Integer bronzeReq, Integer silverReq, Integer goldReq) {
        this.name = name;
        this.description = description;
        this.bronzeReq = bronzeReq;
        this.silverReq = silverReq;
        this.goldReq = goldReq;
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

    public Integer getBronzeReq() {
        return bronzeReq;
    }
    public void setBronzeReq(Integer bronzeReq) {
        this.bronzeReq = bronzeReq;
    }

    public Integer getSilverReq() {
        return silverReq;
    }
    public void setSilverReq(Integer silverReq) {
        this.silverReq = silverReq;
    }

    public Integer getGoldReq() {
        return goldReq;
    }
    public void setGoldReq(Integer goldReq) {
        this.goldReq = goldReq;
    }
}
