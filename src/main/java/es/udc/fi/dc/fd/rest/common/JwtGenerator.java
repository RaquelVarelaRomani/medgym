package es.udc.fi.dc.fd.rest.common;

public interface JwtGenerator {

    String generate(JwtInfo info);

    JwtInfo getInfo(String token);

}
