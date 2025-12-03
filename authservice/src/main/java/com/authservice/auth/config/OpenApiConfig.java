package com.authservice.auth.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI authServiceOpenAPI() {
        Server localServer = new Server();
        localServer.setUrl("http://localhost:8080");
        localServer.setDescription("Server URL in Development environment");

        Contact contact = new Contact();
        contact.setName("MLA Fitness App Team");

        Info info = new Info()
                .title("Auth Service API")
                .version("1.0")
                .contact(contact)
                .description("API documentation for the Authentication and User Management Service. " +
                        "This service handles user registration, login, profile management, and password reset functionality.");

        return new OpenAPI().info(info).servers(List.of(localServer));
    }
}
