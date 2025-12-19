package es.udc.fi.dc.fd.rest.dtos;

public class TopExerciseDto extends ExerciseDto {
    private Long count;

    public TopExerciseDto() {
        super();
    }

    public Long getCount() {
        return count;
    }

    public void setCount(Long count) {
        this.count = count;
    }
}
