package es.udc.fi.dc.fd.model.services.exceptions;

@SuppressWarnings("serial")
public class BlockedUserException extends Exception {

    private final String email;

    public BlockedUserException(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }

}
