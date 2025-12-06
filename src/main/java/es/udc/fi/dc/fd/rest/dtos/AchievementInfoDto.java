package es.udc.fi.dc.fd.rest.dtos;

public class AchievementInfoDto {

    private String name;
    private String description;

    public AchievementInfoDto() {
    }

    public AchievementInfoDto(String name, String description) {
        this.name = name;
        this.description = description;
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
}