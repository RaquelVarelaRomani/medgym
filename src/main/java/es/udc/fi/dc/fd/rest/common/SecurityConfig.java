package es.udc.fi.dc.fd.rest.common;

import static org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    protected SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        // @formatter:off
        http.cors(cors -> cors.disable()).csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers(antMatcher("/*")).permitAll()
                .requestMatchers(antMatcher("/static/**")).permitAll()
                .requestMatchers(antMatcher("/assets/**")).permitAll()
                .requestMatchers(antMatcher("/api/users/signUp")).permitAll()
                .requestMatchers(antMatcher("/api/users/login")).permitAll()
                .requestMatchers(antMatcher("/api/users/loginFromServiceToken")).permitAll()
                .requestMatchers(antMatcher(HttpMethod.DELETE, "/api/users/*")).hasRole("ADMIN")
                .requestMatchers(antMatcher(HttpMethod.POST, "/api/exercises")).hasRole("ADMIN")
                .requestMatchers(antMatcher(HttpMethod.PUT, "/api/exercises/*")).hasRole("ADMIN")
                .requestMatchers(antMatcher(HttpMethod.PUT, "/api/exercises/*/status")).hasRole("ADMIN")
                .requestMatchers(antMatcher(HttpMethod.DELETE, "/api/exercises/*")).hasRole("ADMIN")
                .requestMatchers(antMatcher(HttpMethod.GET, "/api/exercises/pending")).hasRole("ADMIN")
                .requestMatchers(antMatcher(HttpMethod.POST, "/api/routines")).hasAnyRole("ADMIN", "TRAINER")
                .requestMatchers(antMatcher(HttpMethod.PUT, "/api/routines/*")).hasAnyRole("ADMIN", "TRAINER")
                .requestMatchers(antMatcher(HttpMethod.DELETE, "/api/routines/*")).hasAnyRole("ADMIN", "TRAINER")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        // @formatter:on

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        config.setAllowCredentials(true);
        config.addAllowedOrigin("*");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        source.registerCorsConfiguration("/**", config);

        return source;

    }

}
