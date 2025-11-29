package es.udc.fi.dc.fd.rest.dtos;

public class AchievementProgressDto {

    private String name;
    private String description;
    private Integer bronzeReq;
    private Integer silverReq;
    private Integer goldReq;
    private Integer progress;

    public AchievementProgressDto() {
    }

    public AchievementProgressDto(String name, String description, Integer bronzeReq, Integer silverReq, Integer goldReq, Integer progress) {
        this.name = name;
        this.description = description;
        this.bronzeReq = bronzeReq;
        this.silverReq = silverReq;
        this.goldReq = goldReq;
        this.progress = progress;
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

    public Integer getProgress() {
        return progress;
    }
    public void setProgress(Integer progress) {
        this.progress = progress;
    }
}
