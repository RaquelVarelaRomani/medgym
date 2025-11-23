package es.udc.fi.dc.fd.rest.dtos;

import com.fasterxml.jackson.annotation.JsonProperty;

public class AuthenticatedUserDto {

    private String serviceToken;
    private UserDto userDto;


    public AuthenticatedUserDto() {
    }

    public AuthenticatedUserDto(String serviceToken, UserDto userDto) {

        setServiceToken(serviceToken);
        setUserDto(userDto);

    }

    public String getServiceToken() {
        return serviceToken;
    }

    public void setServiceToken(String serviceToken) {
        this.serviceToken = serviceToken;
    }

    @JsonProperty("user")
    public UserDto getUserDto() {
        return userDto;
    }

    public void setUserDto(UserDto userDto) {
        this.userDto = userDto;
    }

}
