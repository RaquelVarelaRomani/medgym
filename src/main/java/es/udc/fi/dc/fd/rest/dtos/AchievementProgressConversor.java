package es.udc.fi.dc.fd.rest.dtos;

import es.udc.fi.dc.fd.model.entities.Achievement;
import es.udc.fi.dc.fd.model.entities.AchievementProgress;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class AchievementProgressConversor {

    private static final List<Long> CONVERT_TO_HOURS_IDS = List.of(1L);
    private AchievementProgressConversor() {
    }

    public static AchievementProgressDto toAchievementProgressDto(
            AchievementProgress achievementProgress,
            Achievement achievement
    ) {
        AchievementInfoDto info = new AchievementInfoDto(
                achievement.getName(),
                achievement.getDescription()
        );
        AchievementRequirementsDto requirements = new AchievementRequirementsDto(
                achievement.getBronzeReq(),
                achievement.getSilverReq(),
                achievement.getGoldReq()
        );
        AchievementProgressInfoDto progressInfo = new AchievementProgressInfoDto(
                achievementProgress.getProgress(),
                achievementProgress.getHighestProgress(),
                CONVERT_TO_HOURS_IDS.contains(achievement.getId())
        );
        AchievementProgressDto dto = new AchievementProgressDto(info, requirements, progressInfo);
        dto.setMedalType(null);
        return dto;
    }

    public static List<AchievementProgressDto> achievementProgressDtos(
            List<AchievementProgress> achievementProgresses,
            List<Achievement> achievements
    ) {

        Map<Long, Achievement> achievementMap = achievements.stream()
                .collect(Collectors.toMap(Achievement::getId, a -> a));

        return achievementProgresses.stream()
                .map(ap -> {
                    Achievement a = achievementMap.get(ap.getAchievement().getId());
                    return toAchievementProgressDto(ap, a);
                })
                .toList();
    }

}
