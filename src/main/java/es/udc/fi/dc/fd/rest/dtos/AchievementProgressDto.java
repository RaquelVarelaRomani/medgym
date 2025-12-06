package es.udc.fi.dc.fd.rest.dtos;

public class AchievementProgressDto {

    private AchievementInfoDto info;
    private AchievementRequirementsDto requirements;
    private AchievementProgressInfoDto progressInfo;

    public AchievementProgressDto() {
    }

    public AchievementProgressDto(AchievementInfoDto info, AchievementRequirementsDto requirements, AchievementProgressInfoDto progressInfo) {
        this.info = info;
        this.requirements = requirements;
        this.progressInfo = progressInfo;
    }

    public String getName() {
        return info != null ? info.getName() : null;
    }
    public void setName(String name) {
        if (info == null) info = new AchievementInfoDto();
        info.setName(name);
    }

    public String getDescription() {
        return info != null ? info.getDescription() : null;
    }
    public void setDescription(String description) {
        if (info == null) info = new AchievementInfoDto();
        info.setDescription(description);
    }

    public Integer getBronzeReq() {
        return requirements != null ? requirements.getBronzeReq() : null;
    }
    public void setBronzeReq(Integer bronzeReq) {
        if (requirements == null) requirements = new AchievementRequirementsDto();
        requirements.setBronzeReq(bronzeReq);
    }

    public Integer getSilverReq() {
        return requirements != null ? requirements.getSilverReq() : null;
    }
    public void setSilverReq(Integer silverReq) {
        if (requirements == null) requirements = new AchievementRequirementsDto();
        requirements.setSilverReq(silverReq);
    }

    public Integer getGoldReq() {
        return requirements != null ? requirements.getGoldReq() : null;
    }
    public void setGoldReq(Integer goldReq) {
        if (requirements == null) requirements = new AchievementRequirementsDto();
        requirements.setGoldReq(goldReq);
    }

    public Integer getProgress() {
        return progressInfo != null ? progressInfo.getProgress() : null;
    }
    public void setProgress(Integer progress) {
        if (progressInfo == null) progressInfo = new AchievementProgressInfoDto();
        progressInfo.setProgress(progress);
    }

    public Integer getHighestProgress() {
        return progressInfo != null ? progressInfo.getHighestProgress() : null;
    }
    public void setHighestProgress(Integer highestProgress) {
        if (progressInfo == null) progressInfo = new AchievementProgressInfoDto();
        progressInfo.setHighestProgress(highestProgress);
    }

    public Boolean getConvertToHours() {
        return progressInfo != null ? progressInfo.getConvertToHours() : null;
    }
    public void setConvertToHours(Boolean convertToHours) {
        if (progressInfo == null) progressInfo = new AchievementProgressInfoDto();
        progressInfo.setConvertToHours(convertToHours);
    }

    public AchievementInfoDto getInfo() {
        return info;
    }

    public void setInfo(AchievementInfoDto info) {
        this.info = info;
    }

    public AchievementRequirementsDto getRequirements() {
        return requirements;
    }

    public void setRequirements(AchievementRequirementsDto requirements) {
        this.requirements = requirements;
    }

    public AchievementProgressInfoDto getProgressInfo() {
        return progressInfo;
    }

    public void setProgressInfo(AchievementProgressInfoDto progressInfo) {
        this.progressInfo = progressInfo;
    }
}
