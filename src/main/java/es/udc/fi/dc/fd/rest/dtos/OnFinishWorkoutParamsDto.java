package es.udc.fi.dc.fd.rest.dtos;

import jakarta.validation.constraints.NotNull;

public class OnFinishWorkoutParamsDto {

    private Integer seconds;
    private Integer reps;

    public OnFinishWorkoutParamsDto() {
        super();
    }

    @NotNull
    public Integer getSeconds() {
        return seconds;
    }

    public void setSeconds(Integer seconds) {
        this.seconds = seconds;
    }

    @NotNull
    public Integer getReps() {
        return reps;
    }

    public void setReps(Integer reps) {
        this.reps = reps;
    }

}