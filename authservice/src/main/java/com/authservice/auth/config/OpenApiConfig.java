package com.authservice.auth.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("MLA Fitness App - Auth API")
                        .version("1.0.0")
                        .description("API documentation for Authentication Service")
                        .contact(new Contact()
                                .name("MLA Application Group 6")))
                .servers(Arrays.asList(
                        new Server().url("http://localhost:8080").description("Development server")
                ));
    }
}
