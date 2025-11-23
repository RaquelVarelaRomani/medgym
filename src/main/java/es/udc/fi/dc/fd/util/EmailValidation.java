package es.udc.fi.dc.fd.util;

import java.util.regex.Pattern;

public final class EmailValidation {

    private static final String LOCAL_PART =
            "(?>[A-Za-z0-9_-]+)(?:\\.(?>[A-Za-z0-9_-]+))*";

    private static final String DOMAIN_PART =
            "(?>[A-Za-z0-9-]+)(?:\\.(?>[A-Za-z0-9-]+))*";

    private static final String TLD_PART =
            "\\.[A-Za-z]{2,}";

    private static final String EMAIL_REGEX =
            "^(?=.{1,64}@)" + LOCAL_PART + "@" + DOMAIN_PART + TLD_PART + "$";

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile(EMAIL_REGEX);

    private EmailValidation() {}

    public static boolean isValidEmail(String email) {
        if (email == null) return false;
        return EMAIL_PATTERN.matcher(email).matches();
    }
}
