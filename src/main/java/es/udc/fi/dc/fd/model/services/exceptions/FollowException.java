package es.udc.fi.dc.fd.model.services.exceptions;

public class FollowException extends RuntimeException {
    private Long userId;

    public FollowException(Long userId) {
      this.userId = userId;
    }

    public Long getUserId() {
      return userId;
    }

    public void setUserId(Long userId) {
      this.userId = userId;
    }
}
