package com.example.demo.service;

import java.util.List;
import java.util.Optional;
import com.example.demo.model.Videos;
import com.example.demo.repository.IVideosRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class VideosService implements IVideosService {

    private final IVideosRepository videosRepository;

    @Autowired
    public VideosService(IVideosRepository videosRepository) {
        this.videosRepository = videosRepository;
    }

    @Override
    public List<Videos> findAll() {
        return videosRepository.findAll();
    }

    @Override
    public Optional<Videos> findById(Long id) {
        return videosRepository.findById(id);
    }

    @Override
    public Videos save(Videos videos) {
        return videosRepository.save(videos);  
    }

    @Override
    public void deleteById(Long id) {
        videosRepository.deleteById(id);
    }

    @Override
    public List<Videos> findByUserId(String userId) {
        return videosRepository.findByUserId(userId); // ค้นหาวิดีโอตาม userId
    }

}
