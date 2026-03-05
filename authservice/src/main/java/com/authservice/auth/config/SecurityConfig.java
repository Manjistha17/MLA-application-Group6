package com.authservice.auth.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.context.annotation.Bean;

@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .csrf().disable()  // Disable CSRF for APIs
            .authorizeRequests()

                // ✅ Prometheus and auth endpoints
                .antMatchers("/actuator/**").permitAll()
                .antMatchers("/api/auth/**").permitAll()

                // ✅ Admin endpoints (secured)
                //.antMatchers("/api/admin/**").hasRole("ADMIN")
                .antMatchers("/api/admin/**").permitAll()   // ✅ open admin endpoints for testing


                // ✅ Swagger UI & API docs
                .antMatchers(
                    "/swagger-ui.html",
                    "/swagger-ui/**",
                    "/v3/api-docs/**"
                ).permitAll()

                // All other requests require authentication
                .anyRequest().authenticated()

            // Disable browser login popup
            .and()
            .httpBasic().disable();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // ✅ Remove the CorsConfigurationSource bean to prevent Spring Boot from sending CORS headers
}