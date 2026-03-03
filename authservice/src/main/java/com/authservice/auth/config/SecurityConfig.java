package com.authservice.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
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

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // permit CloudFront UI host in addition to wildcard (useful while
        // developing locally). Remove wildcard in production or replace with
        // explicit domains only.
        configuration.setAllowedOrigins(Arrays.asList(
            "*",
            "https://d393qv373r18to.cloudfront.net"
        )); // Change to your frontend URL for production
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}