package es.udc.fi.dc.fd.rest.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class WorkoutCommentParamsDto {

    private String text;

    public WorkoutCommentParamsDto() {
        super();
    }

    public WorkoutCommentParamsDto(String text) {
        super();
        this.text = text;
    }

    @NotNull
    @Size(min = 1)
    public String getText() {
        return text;
    }
    public void setText(String text) {
        this.text = text;
    }

}
