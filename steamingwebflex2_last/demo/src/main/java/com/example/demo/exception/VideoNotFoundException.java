package com.example.demo.exception;

public class VideoNotFoundException extends RuntimeException {
    public VideoNotFoundException(Long id) {
        super("Video not found with id " + id);
    }
}

