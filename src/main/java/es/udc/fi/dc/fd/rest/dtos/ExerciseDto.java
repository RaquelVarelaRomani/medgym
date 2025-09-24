
package es.udc.fi.dc.fd.rest.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ExerciseDto {

    public interface AllValidations {}

    private Long id;
    private String name;
    private String description;

    public ExerciseDto() {}

    public ExerciseDto(Long id, String name, String description) {
        this.id = id;
        this.name = name.trim();
        this.description = description.trim();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    @NotNull(groups={AllValidations.class})
    @Size(min=1, max=100, groups={AllValidations.class})
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name.trim();
    }

    @NotNull(groups={AllValidations.class})
    @Size(min=1, groups={AllValidations.class})
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description.trim();
    }
}
