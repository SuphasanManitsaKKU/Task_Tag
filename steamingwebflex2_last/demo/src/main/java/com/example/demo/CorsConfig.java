package com.example.demo;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // อนุญาตให้ทุก endpoint ใช้งาน CORS
                        .allowedOrigins("https://www.suphasan.site", "http://localhost:3001") // อนุญาตทุก origin จากทุก
                                                                                              // IP และทุก port
                        .allowedMethods("*") // อนุญาตทุก HTTP methods
                        .allowedHeaders("*"); // อนุญาตทุก headers
            }
        };
    }
}
