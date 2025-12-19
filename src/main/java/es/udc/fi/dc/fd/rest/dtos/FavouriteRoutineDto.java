package es.udc.fi.dc.fd.rest.dtos;

public class FavouriteRoutineDto extends RoutineDto {
    private Long count;

    public FavouriteRoutineDto() {
        super();
    }

    public Long getCount() {
        return count;
    }

    public void setCount(Long count) {
        this.count = count;
    }
}
