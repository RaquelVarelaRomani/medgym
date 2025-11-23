package es.udc.fi.dc.fd.model.services.exceptions;

public class FollowException extends RuntimeException {
    private final Long userId;

    public FollowException(Long userId) {
        this.userId = userId;
    }

    public Long getUserId() {
        return userId;
    }
}
