package es.udc.fi.dc.fd.rest.dtos;

import java.time.LocalDateTime;
import java.util.List;

public class FavouriteRoutineDto {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime creationDate;
    private LocalDateTime modificationDate;
    private Long trainerId;
    private String trainerName;
    private String trainerSurname;
    private String visibility;
    private String difficulty;
    private List<RoutineLikeDto> likes;
    private Long count;

    public FavouriteRoutineDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public String getTrainerSurname() {
        return trainerSurname;
    }

    public void setTrainerSurname(String trainerSurname) {
        this.trainerSurname = trainerSurname;
    }

    public String getVisibility() {
        return visibility;
    }

    public void setVisibility(String visibility) {
        this.visibility = visibility;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public List<RoutineLikeDto> getLikes() {
        return likes;
    }

    public void setLikes(List<RoutineLikeDto> likes) {
        this.likes = likes;
    }

    public Long getCount() {
        return count;
    }

    public void setCount(Long count) {
        this.count = count;
    }
}
