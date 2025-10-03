
package es.udc.fi.dc.fd.rest.controllers;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.services.ExerciseService;
import es.udc.fi.dc.fd.model.services.UserService;
import es.udc.fi.dc.fd.rest.dtos.ExerciseConversor;
import es.udc.fi.dc.fd.rest.dtos.ExerciseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

import static es.udc.fi.dc.fd.rest.dtos.ExerciseConversor.toExerciseDto;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    @Autowired
    private ExerciseService exerciseService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<ExerciseDto> createExercise(@RequestAttribute Long userId, @RequestBody ExerciseDto exerciseDto) throws DuplicateInstanceException, InstanceNotFoundException {
        User user = userService.loginFromId(userId);
        Exercise exercise = exerciseService.createExercise(exerciseDto.getName(), exerciseDto.getDescription(), user);
        URI location = URI.create("/api/exercises/" + exercise.getId());
        return ResponseEntity.created(location).body(toExerciseDto(exercise));
    }

    @GetMapping("/{id}")
    public ExerciseDto getExercise(@PathVariable Long id) throws InstanceNotFoundException {
        return toExerciseDto(exerciseService.findExerciseById(id));
    }

    @PutMapping("/{id}")
    public ExerciseDto updateExercise(@PathVariable Long id, @RequestBody ExerciseDto exerciseDto) throws InstanceNotFoundException, DuplicateInstanceException {
        exerciseService.updateExercise(id, exerciseDto.getName(), exerciseDto.getDescription());
        return toExerciseDto(exerciseService.findExerciseById(id));
    }

    @PutMapping("/{id}/status")
    public ExerciseDto updateExerciseStatus(@PathVariable Long id, @RequestParam Exercise.ExerciseStatus status) throws InstanceNotFoundException {
        exerciseService.updateExerciseStatus(id, status);
        return toExerciseDto(exerciseService.findExerciseById(id));
    }

    @GetMapping
    public List<ExerciseDto> findAllExercises() {
        return ExerciseConversor.toExerciseDtos(exerciseService.findAllExercises());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteExercise(@PathVariable Long id) throws InstanceNotFoundException {
        exerciseService.deleteExercise(id);
    }

}
