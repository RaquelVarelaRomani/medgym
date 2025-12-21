package es.udc.fi.dc.fd.rest.dtos;

public class MuscleGroupFavouriteDto {
    private String muscleGroup;

    public MuscleGroupFavouriteDto() {
    }

    public MuscleGroupFavouriteDto(String muscleGroup) {
        this.muscleGroup = muscleGroup;
    }

    public String getMuscleGroup() {
        return muscleGroup;
    }

    public void setMuscleGroup(String muscleGroup) {
        this.muscleGroup = muscleGroup;
    }
}
