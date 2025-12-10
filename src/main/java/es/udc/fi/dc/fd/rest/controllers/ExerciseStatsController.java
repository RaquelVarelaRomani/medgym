package es.udc.fi.dc.fd.rest.controllers;

import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.services.ExerciseStatsService;
import es.udc.fi.dc.fd.rest.dtos.ExerciseStatsDto;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@RestController
@RequestMapping("/api/stats")
public class ExerciseStatsController {

    private final ExerciseStatsService exerciseStatsService;

    public ExerciseStatsController(ExerciseStatsService exerciseStatsService) {
        this.exerciseStatsService = exerciseStatsService;
    }

    @GetMapping("/exercise/{exerciseId}")
    public List<ExerciseStatsDto> getStats(@PathVariable Long exerciseId) 
            throws InstanceNotFoundException {
        return exerciseStatsService.getExerciseStats(exerciseId);
    }
}
