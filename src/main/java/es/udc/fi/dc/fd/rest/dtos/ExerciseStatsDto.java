package es.udc.fi.dc.fd.rest.dtos;
import java.time.LocalDate;

public class ExerciseStatsDto {

    private LocalDate date;
    private Integer value;

    public ExerciseStatsDto(LocalDate date, Integer value) {
        this.date = date;
        this.value = value;
    }

    public LocalDate getDate() {
        return date;
    }

    public Integer getValue() {
        return value;
    }
}