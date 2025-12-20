package es.udc.fi.dc.fd.rest.dtos;

import java.util.List;

public class WorkoutForHistoryDto extends WorkoutWithUserDto {
    private List<WorkoutCommentDto> comments;
    private List<WorkoutLikeDto> likes;

    public WorkoutForHistoryDto() {
        // No-args constructor required for Jackson and frameworks.
        // Nested comment: implementation intentionally empty because the DTO
        // is only used as a data carrier and all fields are set via setters,
        // satisfying SonarQube rules regarding unused or empty methods.
    }

    @Override
    public List<WorkoutCommentDto> getComments() {
        return comments;
    }

    @Override
    public void setComments(List<WorkoutCommentDto> comments) {
        this.comments = comments;
    }

    @Override
    public List<WorkoutLikeDto> getLikes() {
        return likes;
    }

    @Override
    public void setLikes(List<WorkoutLikeDto> likes) {
        this.likes = likes;
    }

    public interface AllValidations {
    }
}
