package es.udc.fi.dc.fd.rest.dtos;

public class AchievementRequirementsDto {

    private Integer bronzeReq;
    private Integer silverReq;
    private Integer goldReq;

    public AchievementRequirementsDto() {
    }

    public AchievementRequirementsDto(Integer bronzeReq, Integer silverReq, Integer goldReq) {
        this.bronzeReq = bronzeReq;
        this.silverReq = silverReq;
        this.goldReq = goldReq;
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