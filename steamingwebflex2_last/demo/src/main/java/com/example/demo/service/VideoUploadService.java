package com.example.demo.service;

import com.example.demo.model.Videos;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;
import java.io.IOException;
import java.nio.file.Path;

@Service
public class VideoUploadService {

    @Autowired
    private IFileStorageService fileStorageService;

    @Autowired
    private VideoThumbnailService videoThumbnailService;

    @Autowired
    private IVideosService videosService;

    @Transactional
    public Videos uploadVideo(MultipartFile file, String title, String userId) throws IOException {
        String newFileName = createFileName(file.getOriginalFilename());
        Path filePath = fileStorageService.storeFile(file, newFileName);

        // สร้าง thumbnail โดยรับแค่ชื่อไฟล์จาก VideoThumbnailService
        String relativeThumbnailPath = "/thumbnails/" + videoThumbnailService.generateThumbnail(newFileName);

        String relativeVideoPath = "/videos/" + newFileName;

        // สร้างและบันทึกข้อมูลวิดีโอในฐานข้อมูล
        Videos video = new Videos(newFileName, relativeVideoPath, title, relativeThumbnailPath, userId);
        return videosService.save(video);
    }

    private String createFileName(String originalFileName) {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String sanitizedFileName = originalFileName.replaceAll("[^a-zA-Z0-9\\.]", "");
        return timestamp + "_" + sanitizedFileName;
    }
}
