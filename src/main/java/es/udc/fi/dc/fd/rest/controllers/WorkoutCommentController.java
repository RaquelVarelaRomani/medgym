package es.udc.fi.dc.fd.rest.controllers;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.WorkoutComment;
import es.udc.fi.dc.fd.model.services.WorkoutCommentService;
import es.udc.fi.dc.fd.model.services.WorkoutCommentServiceImpl;
import es.udc.fi.dc.fd.rest.dtos.AchievementProgressDto;
import es.udc.fi.dc.fd.rest.dtos.WorkoutCommentDto;
import es.udc.fi.dc.fd.rest.dtos.WorkoutCommentParamsDto;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static es.udc.fi.dc.fd.rest.dtos.WorkoutCommentConversor.toWorkoutCommentDto;
import static es.udc.fi.dc.fd.rest.dtos.WorkoutCommentConversor.toWorkoutCommentDtoWithAchievements;
import static es.udc.fi.dc.fd.rest.dtos.WorkoutCommentConversor.toWorkoutCommentDtos;

@RestController
@RequestMapping("/api")
public class WorkoutCommentController {
    private final WorkoutCommentService workoutCommentService;

    public WorkoutCommentController(WorkoutCommentService workoutCommentService) {
        this.workoutCommentService = workoutCommentService;
    }

    @PostMapping("/workouts/{workoutId}/comments")
    public WorkoutCommentDto commentWorkout(@RequestAttribute Long userId, @PathVariable Long workoutId, @RequestBody WorkoutCommentParamsDto workoutCommentParamsDto)
            throws InstanceNotFoundException {
        WorkoutComment workoutComment = workoutCommentService.commentWorkout(userId, workoutCommentParamsDto.getText(), workoutId);
        List<AchievementProgressDto> newAchievements = ((WorkoutCommentServiceImpl) workoutCommentService).getNewAchievements();
        WorkoutCommentDto dto = toWorkoutCommentDtoWithAchievements(workoutComment, newAchievements);
        ((WorkoutCommentServiceImpl) workoutCommentService).clearNewAchievements();
        return dto;
    }

    @GetMapping("/workouts/{workoutId}/comments")
    public List<WorkoutCommentDto> getWorkoutComments(@PathVariable Long workoutId) {
        return toWorkoutCommentDtos(workoutCommentService.getWorkoutComments(workoutId));
    }

    @DeleteMapping("/workoutComments/{workoutCommentId}")
    public void deleteWorkoutComment(@PathVariable Long workoutCommentId) throws InstanceNotFoundException {
        workoutCommentService.deleteWorkoutComment(workoutCommentId);
    }
}
