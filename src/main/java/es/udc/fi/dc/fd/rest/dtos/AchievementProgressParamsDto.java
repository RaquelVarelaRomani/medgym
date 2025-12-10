package es.udc.fi.dc.fd.rest.dtos;

import jakarta.validation.constraints.NotNull;

public class AchievementProgressParamsDto {

    private Integer progress;

    public AchievementProgressParamsDto() {
        super();
    }

    @NotNull
    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }

}