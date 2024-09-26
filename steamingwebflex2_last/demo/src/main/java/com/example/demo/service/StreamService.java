package com.example.demo.service;

import com.example.demo.exception.VideoNotFoundException;
import com.example.demo.model.Videos;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import reactor.core.publisher.Mono;

@Service
public class StreamService {

    @Autowired
    private IVideosService videosService;

    @Autowired
    private IFileStorageService fileStorageService; // ใช้ fileStorageService

    @Autowired
    private VideoUploadService videoUploadService;

    @Autowired
    private VideoDeleteService videoDeleteService;

    public List<Videos> getVideosByUserId(String userId) {
        return videosService.findByUserId(userId); // ค้นหาวิดีโอตาม userId
    }

    public Mono<Resource> retrieveContent(Long id) {
        return Mono.fromSupplier(() -> {
            Videos video = videosService.findById(id)
                    .orElseThrow(() -> new VideoNotFoundException(id));
            return fileStorageService.loadFileAsResource(video.getFileName());
        });
    }

    public List<Videos> findAll() {
        return videosService.findAll();
    }

    public Videos uploadVideo(MultipartFile file, String title, String userId) throws IOException {
        return videoUploadService.uploadVideo(file, title, userId);
    }

    public void deleteVideo(Long id) throws IOException {
        videoDeleteService.deleteVideo(id);
    }

    public Videos findVideoById(Long id) {
        return videosService.findById(id)
                .orElseThrow(() -> new VideoNotFoundException(id)); // ถ้าไม่พบจะโยนข้อผิดพลาด
    }    

    public void updateVideoTitle(Long id, String newTitle) {
        Videos video = videosService.findById(id)
                .orElseThrow(() -> new VideoNotFoundException(id));
        video.setTitle(newTitle);  // อัปเดต title ของวิดีโอ
        videosService.save(video); // บันทึกการอัปเดตในฐานข้อมูล
    }

    public Resource retrieveContentByName(String fileName) {
        return fileStorageService.loadFileAsResource(fileName); // ใช้ fileStorageService
    }

    public Resource retrieveThumbnailByName(String fileName) {
        return fileStorageService.retrieveThumbnailByName(fileName); // ใช้ fileStorageService
    }
}

