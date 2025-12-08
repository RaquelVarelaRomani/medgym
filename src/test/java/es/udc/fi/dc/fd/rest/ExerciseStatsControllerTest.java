package es.udc.fi.dc.fd.rest.controllers;

import es.udc.fi.dc.fd.model.services.ExerciseStatsService;
import es.udc.fi.dc.fd.rest.dtos.ExerciseStatsDto;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ExerciseStatsController.class)
public class ExerciseStatsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ExerciseStatsService exerciseStatsService;

    @Test
    void testEndpointReturnsStats() throws Exception {

        when(exerciseStatsService.getExerciseStats(1L))
                .thenReturn(List.of(
                        new ExerciseStatsDto(LocalDate.of(2024,1,10), 40),
                        new ExerciseStatsDto(LocalDate.of(2024,1,12), 50)
                ));

        mockMvc.perform(get("/api/stats/exercise/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].value").value(40))
                .andExpect(jsonPath("$[1].value").value(50));
    }
}
