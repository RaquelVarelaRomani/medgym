
package es.udc.fi.dc.fd.rest.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class RoutineDto {

    public interface AllValidations {}

    private Long id;
    private String name;
    private String description;
    private LocalDateTime creationDate;
    private LocalDateTime modificationDate;
    private Long trainerId;
    private String trainerName;
    private String trainerSurname;

    public RoutineDto() {}

    public RoutineDto(Long id, String name, String description, LocalDateTime creationDate, LocalDateTime modificationDate, Long trainerId, String trainerName, String trainerSurname) {
        this.id = id;
        this.name = name.trim();
        this.description = description.trim();
        this.creationDate = creationDate;
        this.modificationDate = modificationDate;
        this.trainerId = trainerId;
        this.trainerName = trainerName;
        this.trainerSurname = trainerSurname;
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

    public LocalDateTime getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(LocalDateTime creationDate) {
        this.creationDate = creationDate;
    }

    public LocalDateTime getModificationDate() {
        return modificationDate;
    }

    public void setModificationDate(LocalDateTime modificationDate) {
        this.modificationDate = modificationDate;
    }

    public Long getTrainerId() {
        return trainerId;
    }

    public void setTrainerId(Long trainerId) {
        this.trainerId = trainerId;
    }

    public String getTrainerName() {
        return trainerName;
    }

    public void setTrainerName(String trainerName) {
        this.trainerName = trainerName;
    }

    public String getTrainerSurame() {
        return trainerSurname;
    }

    public void setTrainerSurame(String trainerSurame) {
        this.trainerSurname = trainerSurame;
    }
}
