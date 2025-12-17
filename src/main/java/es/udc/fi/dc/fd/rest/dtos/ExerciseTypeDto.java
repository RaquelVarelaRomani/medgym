package es.udc.fi.dc.fd.rest.dtos;

public class ExerciseTypeDto {

    private String name;

    public ExerciseTypeDto() {
    }

    public ExerciseTypeDto(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}