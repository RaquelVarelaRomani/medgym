package es.udc.fi.dc.fd.rest.controllers;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.ExerciseMaxWeight;
import es.udc.fi.dc.fd.model.services.ExerciseMaxWeightService;
import es.udc.fi.dc.fd.rest.dtos.ExerciseMaxWeightDto;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static es.udc.fi.dc.fd.rest.dtos.ExerciseMaxWeightConversor.toExerciseMaxWeightDtos;

@RestController
@RequestMapping("/api")
public class ExerciseMaxWeightController {

    private final ExerciseMaxWeightService exerciseMaxWeightService;

    public ExerciseMaxWeightController(ExerciseMaxWeightService exerciseMaxWeightService) {
        this.exerciseMaxWeightService = exerciseMaxWeightService;
    }

    @PostMapping("/exercises/{exerciseId}/maxWeight")
    public void addOrUpdateMaxWeight(@RequestAttribute Long userId,
                                     @PathVariable Long exerciseId,
                                     @RequestParam Short maxWeightKg)
            throws InstanceNotFoundException {

        exerciseMaxWeightService.addOrUpdateMaxWeight(userId, exerciseId, maxWeightKg);
    }

    @GetMapping("/exercises/{exerciseId}/maxWeight/ranking")
    public List<ExerciseMaxWeightDto> getMaxWeightRanking(@RequestAttribute Long userId,
                                                          @PathVariable Long exerciseId)
            throws InstanceNotFoundException {

        List<ExerciseMaxWeight> ranking =
                exerciseMaxWeightService.getMaxWeightRanking(userId, exerciseId);

        return toExerciseMaxWeightDtos(ranking);
    }
}
