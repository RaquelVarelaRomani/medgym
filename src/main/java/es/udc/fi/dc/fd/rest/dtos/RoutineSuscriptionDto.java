package es.udc.fi.dc.fd.rest.dtos;

import java.util.List;

public class RoutineSuscriptionDto {
    private Long routineId;
    private String routineName;
    private List<UserSummaryDto> users;

    public RoutineSuscriptionDto() {}

    public RoutineSuscriptionDto(Long routineId, String routineName, List<UserSummaryDto> users) {
        this.routineId = routineId;
        this.routineName = routineName;
        this.users = users;
    }

    public Long getRoutineId() {
        return routineId;
    }

    public void setRoutineId(Long routineId) {
        this.routineId = routineId;
    }

    public String getRoutineName() {
        return routineName;
    }

    public void setRoutineName(String routineName) {
        this.routineName = routineName;
    }

    public List<UserSummaryDto> getUsers() {
        return users;
    }

    public void setUsers(List<UserSummaryDto> users) {
        this.users = users;
    }
}
