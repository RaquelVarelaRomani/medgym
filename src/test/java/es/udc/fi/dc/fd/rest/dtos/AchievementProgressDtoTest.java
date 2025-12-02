package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.Achievement;
import es.udc.fi.dc.fd.model.entities.AchievementProgress;
import es.udc.fi.dc.fd.model.entities.User;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AchievementProgressDtoTest {

    @Test
    void testToAchievementProgressDto() {

        User user = new User("John", "Doe", "john@test.com",
                "600000000", "pass",
                User.RoleType.CLIENT, User.StatusType.ACTIVE);
        user.setId(1L);

        Achievement achievement =
                new Achievement("Hours", "Accumulate hours", 10, 20, 30);
        achievement.setId(5L);

        AchievementProgress progress =
                new AchievementProgress(42, user, achievement);
        progress.setId(7L);

        AchievementProgressDto dto =
                AchievementProgressConversor.toAchievementProgressDto(progress, achievement);

        assertNotNull(dto);
        assertEquals(achievement.getName(), dto.getName());
        assertEquals(achievement.getDescription(), dto.getDescription());
        assertEquals(achievement.getBronzeReq(), dto.getBronzeReq());
        assertEquals(achievement.getSilverReq(), dto.getSilverReq());
        assertEquals(achievement.getGoldReq(), dto.getGoldReq());
        assertEquals(progress.getProgress(), dto.getProgress());
    }

    @Test
    void testAchievementProgressDtos() {

        User user = new User("Jane", "Doe", "jane@test.com",
                "600000001", "pass",
                User.RoleType.CLIENT, User.StatusType.ACTIVE);
        user.setId(2L);

        Achievement ach1 =
                new Achievement("Hours", "Desc1", 1, 2, 3);
        ach1.setId(10L);

        Achievement ach2 =
                new Achievement("Reps", "Desc2", 4, 5, 6);
        ach2.setId(11L);

        AchievementProgress p1 =
                new AchievementProgress(12, user, ach1);
        p1.setId(20L);

        AchievementProgress p2 =
                new AchievementProgress(50, user, ach2);
        p2.setId(21L);

        List<AchievementProgress> progresses = Arrays.asList(p1, p2);
        List<Achievement> achievements = Arrays.asList(ach1, ach2);

        List<AchievementProgressDto> dtos =
                AchievementProgressConversor.achievementProgressDtos(progresses, achievements);

        assertNotNull(dtos);
        assertEquals(2, dtos.size());

        AchievementProgressDto dto1 = dtos.get(0);
        AchievementProgressDto dto2 = dtos.get(1);

        assertEquals("Hours", dto1.getName());
        assertEquals(12, dto1.getProgress());
        assertEquals(p1.getAchievement().getBronzeReq(), dto1.getBronzeReq());
        assertEquals(p1.getAchievement().getGoldReq(), dto1.getGoldReq());

        assertEquals("Reps", dto2.getName());
        assertEquals(50, dto2.getProgress());
        assertEquals(p2.getAchievement().getSilverReq(), dto2.getSilverReq());
    }

    @Test
    void testSetters() {

        AchievementProgressDto dto = new AchievementProgressDto();

        dto.setName("N");
        dto.setDescription("D");
        dto.setBronzeReq(10);
        dto.setSilverReq(20);
        dto.setGoldReq(30);
        dto.setProgress(40);

        assertEquals("N", dto.getName());
        assertEquals("D", dto.getDescription());
        assertEquals(10, dto.getBronzeReq());
        assertEquals(20, dto.getSilverReq());
        assertEquals(30, dto.getGoldReq());
        assertEquals(40, dto.getProgress());
    }
}
