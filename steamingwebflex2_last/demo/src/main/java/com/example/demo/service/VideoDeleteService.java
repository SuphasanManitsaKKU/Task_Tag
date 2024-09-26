package com.example.demo.service;

import com.example.demo.exception.VideoNotFoundException;
import com.example.demo.model.Videos;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.IOException;
import java.nio.file.Path;

@Service
public class VideoDeleteService {

    @Autowired
    private IFileStorageService fileStorageService;

    @Autowired
    private IVideosService videosService;

    @Transactional
    public void deleteVideo(Long id) throws IOException {
        Videos video = videosService.findById(id)
                .orElseThrow(() -> new VideoNotFoundException(id));

        // ลบไฟล์วิดีโอโดยใช้ path ที่ได้จาก fileStorageService
        Path absoluteVideoPath = fileStorageService.getVideoFilePath(video.getFileName());
        System.out.println("delete file in path : " + absoluteVideoPath);
        fileStorageService.deleteFile(absoluteVideoPath);

        // ลบไฟล์ Thumbnail โดยใช้ path ที่ได้จาก fileStorageService
        Path absoluteThumbnailPath = fileStorageService.getThumbnailFilePath(video.getThumbnailUrl());
        System.out.println("delete file in path : " + absoluteThumbnailPath);
        fileStorageService.deleteFile(absoluteThumbnailPath);

        // ลบข้อมูลวิดีโอจากฐานข้อมูล
        videosService.deleteById(id);
    }
}

