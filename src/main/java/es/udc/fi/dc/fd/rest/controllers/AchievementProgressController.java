package es.udc.fi.dc.fd.rest.controllers;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.services.AchievementProgressService;
import es.udc.fi.dc.fd.model.services.AchievementService;
import es.udc.fi.dc.fd.rest.dtos.AchievementProgressDto;
import es.udc.fi.dc.fd.rest.dtos.AchievementProgressParamsDto;
import es.udc.fi.dc.fd.rest.dtos.OnFinishWorkoutParamsDto;
import org.springframework.web.bind.annotation.*;

import static es.udc.fi.dc.fd.rest.dtos.AchievementProgressConversor.*;

import java.util.List;

@RestController
@RequestMapping("/api/achievements")
public class AchievementProgressController {

    private final AchievementProgressService achievementProgressService;
    private final AchievementService achievementService;

    public AchievementProgressController(AchievementProgressService achievementProgressService, AchievementService achievementService) {
        this.achievementProgressService = achievementProgressService;
        this.achievementService = achievementService;
    }

    @PostMapping("/{achievementId}/progress")
    public void createOrUpdateAchievementProgress(
            @RequestAttribute Long userId,
            @PathVariable Long achievementId,
            @RequestBody AchievementProgressParamsDto params
    ) throws InstanceNotFoundException {
        achievementProgressService.createOrUpdateAchievementProgress(userId, achievementId, params.getProgress());
    }

    @PostMapping("/onFinishWorkout")
    public void onFinishWorkout(
            @RequestAttribute Long userId,
            @RequestBody OnFinishWorkoutParamsDto params
    ) throws InstanceNotFoundException {
        achievementProgressService.onFinishedWorkout(userId, params.getSeconds(), params.getReps());
    }

    @GetMapping("/{achievementId}")
    public AchievementProgressDto findAchievementProgress(
            @RequestAttribute Long userId,
            @PathVariable Long achievementId
    ) throws InstanceNotFoundException {
        return toAchievementProgressDto(
                achievementProgressService.findAchievementProgress(userId, achievementId),
                achievementService.findAchievementById(achievementId)
        );
    }

    @GetMapping()
    public List<AchievementProgressDto> findAllAchievementProgressesByUser(@RequestAttribute Long userId) throws InstanceNotFoundException {
        return achievementProgressDtos(
                achievementProgressService.findAchievementProgressesByUser(userId),
                achievementService.findAllAchievements()
        );
    }

    @GetMapping("/streak")
    public int getCurrentStreak(@RequestAttribute Long userId) throws InstanceNotFoundException {
        return achievementProgressService.getCurrentStreak(userId);
    }
}
