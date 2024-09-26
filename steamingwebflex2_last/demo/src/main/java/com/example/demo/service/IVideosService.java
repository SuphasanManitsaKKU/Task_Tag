package com.example.demo.service;

import java.util.Optional;
import java.util.List;

import com.example.demo.model.Videos;

public interface IVideosService {
    List<Videos> findAll();
    Optional<Videos> findById(Long id);
    Videos save(Videos videos);
    void deleteById(Long id);
    List<Videos> findByUserId(String userId); 
}
