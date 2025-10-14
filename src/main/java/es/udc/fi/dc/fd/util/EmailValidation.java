package es.udc.fi.dc.fd.util;

import java.util.regex.Pattern;

public final class EmailValidation {

    //4)validacion estricta de expresiones regulares
    //regex=expresion regular para describir un patron de texto
    //antes del @ -> min 1 caracter y max 64 ^(?=.{1,64}@)
    //[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)*@ perminte puntos intermedios (no al inicio ni final)
    //[^-][A-Za-z0-9-]+(\.[A-Za-z0-9-]+)* parte del dominio
    //(\.[A-Za-z]{2,})$ extension final
    private static final String EMAIL_REGEX =
        "^(?=.{1,64}@)[A-Za-z0-9_-]+(\\.[A-Za-z0-9_-]+)*@" +
        "[^-][A-Za-z0-9-]+(\\.[A-Za-z0-9-]+)*(\\.[A-Za-z]{2,})$";

    private static final Pattern EMAIL_PATTERN = Pattern.compile(EMAIL_REGEX);

    private EmailValidation() { }

    public static boolean isValidEmail(String email) {
        if (email == null) return false;
        return EMAIL_PATTERN.matcher(email).matches();
    }
}
