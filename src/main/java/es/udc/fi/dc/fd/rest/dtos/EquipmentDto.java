package es.udc.fi.dc.fd.rest.dtos;

public class EquipmentDto {

    private String name;

    public EquipmentDto() {}

    public EquipmentDto(String name) {

        this.name = name;
    }

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
}
