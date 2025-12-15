package es.udc.fi.dc.fd.rest;

import es.udc.fi.dc.fd.model.entities.User;
import es.udc.fi.dc.fd.model.entities.UserDao;
import es.udc.fi.dc.fd.model.services.SummaryService;
import es.udc.fi.dc.fd.rest.controllers.UserController;
import es.udc.fi.dc.fd.rest.dtos.AnnualSummaryDto;
import es.udc.fi.dc.fd.rest.dtos.AuthenticatedUserDto;
import es.udc.fi.dc.fd.rest.dtos.LoginParamsDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SummaryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserController userController;

    @Autowired
    private UserDao userDao;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @MockBean
    private SummaryService summaryService;

    private AuthenticatedUserDto authenticatedUser;

    @BeforeEach
    void setUp() throws Exception {
        String uniqueEmail = "summary_" + System.nanoTime() + "@test.com";
        
        User user = new User("UserSummary", "Test", uniqueEmail, "666777888", "password", User.RoleType.CLIENT, User.StatusType.ACTIVE);
        user.setPassword(passwordEncoder.encode("password"));
        userDao.save(user);

        LoginParamsDto loginParams = new LoginParamsDto();
        loginParams.setEmail(uniqueEmail);
        loginParams.setPassword("password");
        authenticatedUser = userController.login(loginParams);
    }

    @Test
    void testGetAnnualSummary() throws Exception {
        AnnualSummaryDto mockSummary = new AnnualSummaryDto(10, 5, 3, 8);
        when(summaryService.getAnnualSummary(anyLong())).thenReturn(mockSummary);

        mockMvc.perform(get("/api/summary/annual")
                .header("Authorization", "Bearer " + authenticatedUser.getServiceToken())
                .requestAttr("userId", authenticatedUser.getUserDto().getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.likesGiven").value(10))
                .andExpect(jsonPath("$.likesReceived").value(5))
                .andExpect(jsonPath("$.commentsGiven").value(3))
                .andExpect(jsonPath("$.commentsReceived").value(8));
    }
}