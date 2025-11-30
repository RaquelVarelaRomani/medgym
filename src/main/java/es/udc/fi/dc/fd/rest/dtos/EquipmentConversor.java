package es.udc.fi.dc.fd.rest.dtos;

import java.util.List;

import static es.udc.fi.dc.fd.model.entities.Exercise.Equipment;

public class EquipmentConversor {

    private EquipmentConversor() {
    }

    public static EquipmentDto toEquipmentDto(Equipment equipment) {

        return new EquipmentDto(
                equipment.name()
        );
    }

    public static List<EquipmentDto> toEquipmentDtos(List<Equipment> equipments) {
        return equipments.stream().map(EquipmentConversor::toEquipmentDto).toList();
    }
}
