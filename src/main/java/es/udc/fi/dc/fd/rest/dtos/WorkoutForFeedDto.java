package es.udc.fi.dc.fd.rest.dtos;

import java.util.List;

public class WorkoutForFeedDto extends WorkoutWithUserDto {
    private byte[] userProfilePicture;
    private List<WorkoutCommentDto> comments;
    private List<WorkoutLikeDto> likes;

    public WorkoutForFeedDto() {
        // No-args constructor required for Jackson and frameworks.
        // Nested comment: implementation intentionally empty because the DTO
        // is only used as a data carrier and all fields are set via setters,
        // satisfying SonarQube rules regarding unused or empty methods.
    }

    public byte[] getUserProfilePicture() {
        return userProfilePicture;
    }

    public void setUserProfilePicture(byte[] userProfilePicture) {
        this.userProfilePicture = userProfilePicture;
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
