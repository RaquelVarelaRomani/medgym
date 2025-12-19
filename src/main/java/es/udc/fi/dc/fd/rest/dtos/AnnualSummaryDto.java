package es.udc.fi.dc.fd.rest.dtos;

public class AnnualSummaryDto {
    private long likesGiven;
    private long likesReceived;
    private long commentsGiven;
    private long commentsReceived;

    public AnnualSummaryDto() {}

    public AnnualSummaryDto(long likesGiven, long likesReceived, long commentsGiven, long commentsReceived) {
        this.likesGiven = likesGiven;
        this.likesReceived = likesReceived;
        this.commentsGiven = commentsGiven;
        this.commentsReceived = commentsReceived;
    }

    public long getLikesGiven() { return likesGiven; }
    public void setLikesGiven(long likesGiven) { this.likesGiven = likesGiven; }

    public long getLikesReceived() { return likesReceived; }
    public void setLikesReceived(long likesReceived) { this.likesReceived = likesReceived; }

    public long getCommentsGiven() { return commentsGiven; }
    public void setCommentsGiven(long commentsGiven) { this.commentsGiven = commentsGiven; }

    public long getCommentsReceived() { return commentsReceived; }
    public void setCommentsReceived(long commentsReceived) { this.commentsReceived = commentsReceived; }
}