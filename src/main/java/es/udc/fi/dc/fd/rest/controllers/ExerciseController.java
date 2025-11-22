
package es.udc.fi.dc.fd.rest.controllers;

import java.net.URI;
import java.util.List;

import es.udc.fi.dc.fd.model.services.exceptions.PermissionException;
import es.udc.fi.dc.fd.rest.dtos.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import es.udc.fi.dc.fd.model.common.exceptions.DuplicateInstanceException;
import es.udc.fi.dc.fd.model.common.exceptions.InstanceNotFoundException;
import es.udc.fi.dc.fd.model.entities.Exercise;
import es.udc.fi.dc.fd.model.entities.Exercise.ExerciseStatus;
import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.services.ExerciseService;
import es.udc.fi.dc.fd.model.services.UserService;

import static es.udc.fi.dc.fd.rest.dtos.ExerciseConversor.toExerciseDto;

import static es.udc.fi.dc.fd.model.entities.Exercise.MuscleGroup;
import static es.udc.fi.dc.fd.model.entities.Exercise.Equipment;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    @Autowired
    private ExerciseService exerciseService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<ExerciseDto> createExercise(@RequestAttribute Long userId, @RequestBody ExerciseDto exerciseDto) throws DuplicateInstanceException, InstanceNotFoundException, PermissionException {
        User user = userService.loginFromId(userId);
        Exercise exercise = exerciseService.createExercise(exerciseDto.getName(), exerciseDto.getDescription(), MuscleGroup.valueOf(exerciseDto.getMuscleGroup()), Equipment.valueOf(exerciseDto.getEquipment()), exerciseDto.getImage(), user);
        URI location = URI.create("/api/exercises/" + exercise.getId());
        return ResponseEntity.created(location).body(toExerciseDto(exercise));
    }

    @GetMapping("/{id}")
    public ExerciseDto getExercise(@PathVariable Long id) throws InstanceNotFoundException {
        return toExerciseDto(exerciseService.findExerciseById(id));
    }

    @PutMapping("/{id}")
    public ExerciseDto updateExercise(@PathVariable Long id,
                                    @RequestBody ExerciseDto exerciseDto,
                                    @RequestAttribute Long userId)
            throws InstanceNotFoundException, DuplicateInstanceException {

        User user = userService.loginFromId(userId);
        Exercise exercise = exerciseService.findExerciseById(id);

        // 🔒 Solo el creador o un admin pueden editar
        if (!user.getRole().equals(User.RoleType.ADMIN)
                && !exercise.getCreator().getId().equals(user.getId())) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Only the creator or an admin can update this exercise");
        }

        exerciseService.updateExercise(
                id,
                exerciseDto.getName(),
                exerciseDto.getDescription(),
                exerciseDto.getMuscleGroup() != null ? MuscleGroup.valueOf(exerciseDto.getMuscleGroup()) : null,
                exerciseDto.getEquipment() != null ? Equipment.valueOf(exerciseDto.getEquipment()) : null,
                exerciseDto.getImage()
        );

        return toExerciseDto(exerciseService.findExerciseById(id));
    }


    @PutMapping("/{id}/status")
    public ExerciseDto updateExerciseStatus(@PathVariable Long id, @RequestBody ExerciseDto exerciseDto) throws InstanceNotFoundException {
        exerciseService.updateExerciseStatus(id, ExerciseStatus.valueOf(exerciseDto.getStatus()));
        return toExerciseDto(exerciseService.findExerciseById(id));
    }

    @GetMapping
    public List<ExerciseDto> findAllExercises(@RequestAttribute Long userId) throws InstanceNotFoundException {
        return ExerciseConversor.toExerciseDtos(exerciseService.findAllExercises(userId));
    }

    @GetMapping("/pending")
    public List<ExerciseDto> findExercisesWithPendingStatus() {
        return ExerciseConversor.toExerciseDtos(exerciseService.findExercisesWithPendingStatus());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteExercise(@PathVariable Long id) throws InstanceNotFoundException {
        exerciseService.deleteExercise(id);
    }

    @GetMapping("/muscleGroups")
    public List<MuscleGroupDto> getMuscleGroups() {
        return MuscleGroupConversor.toMuscleGroupDtos(exerciseService.findAllMuscleGroups());
    }

    @GetMapping("/equipments")
    public List<EquipmentDto> getEquipments() {
        return EquipmentConversor.toEquipmentDtos(exerciseService.findAllEquipments());
    }
}
