package es.udc.fi.dc.fd.model.services;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Achievement;
import es.udc.fi.dc.fd.model.entities.AchievementDao;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AchievementServiceTest {

    @Autowired
    private AchievementService achievementService;

    @Autowired
    private AchievementDao achievementDao;

    private Achievement createAchievement(String name, String desc) {
        return achievementDao.save(new Achievement(name, desc, 10, 20, 30));
    }

    @Test
    void testFindAchievementById() throws Exception {
        Achievement a = createAchievement("A1", "A1");

        Achievement found = achievementService.findAchievementById(a.getId());

        assertNotNull(found);
        assertEquals(a.getId(), found.getId());
        assertEquals("A1", found.getDescription());
    }

    @Test
    void testFindAchievementByIdNotFound() {
        assertThrows(InstanceNotFoundException.class,
                () -> achievementService.findAchievementById(99999L));
    }

    @Test
    void testFindAllAchievements() {
        Achievement a1 = createAchievement("A2", "A2");
        Achievement a2 = createAchievement("A3", "A3");

        List<Achievement> list = achievementService.findAllAchievements();

        assertTrue(list.size() >= 2);
        assertTrue(list.stream().anyMatch(a -> a.getId().equals(a1.getId())));
        assertTrue(list.stream().anyMatch(a -> a.getId().equals(a2.getId())));
    }
}
