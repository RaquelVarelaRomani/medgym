package es.udc.fi.dc.fd.rest.dtos;

public class AchievementProgressInfoDto {

    private Integer progress;
    private Integer highestProgress;
    private Boolean convertToHours;

    public AchievementProgressInfoDto() {
    }

    public AchievementProgressInfoDto(Integer progress, Integer highestProgress, Boolean convertToHours) {
        this.progress = progress;
        this.highestProgress = highestProgress;
        this.convertToHours = convertToHours;
    }

    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }

    public Integer getHighestProgress() {
        return highestProgress;
    }

    public void setHighestProgress(Integer highestProgress) {
        this.highestProgress = highestProgress;
    }

    public Boolean getConvertToHours() {
        return convertToHours;
    }

    public void setConvertToHours(Boolean convertToHours) {
        this.convertToHours = convertToHours;
    }
}