package es.udc.fi.dc.fd.model.services.exceptions;

@SuppressWarnings("serial")
public class IncorrectLoginException extends Exception {

    private final String email;
    private final String password;

    public IncorrectLoginException(String email, String password) {
        this.email = email;
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

}
