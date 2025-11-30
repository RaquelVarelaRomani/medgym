package es.udc.fi.dc.fd.rest.dtos;

public class MuscleGroupDto {

    private String name;

    public MuscleGroupDto() {
    }

    public MuscleGroupDto(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
