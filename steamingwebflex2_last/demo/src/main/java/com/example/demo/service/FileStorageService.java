package com.example.demo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.exception.VideoNotFoundException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
public class FileStorageService implements IFileStorageService {

    @Value("${upload.video.directory}")
    private String videoDir; // ที่อยู่ของวิดีโอ

    @Value("${upload.thumbnail.directory}")
    private String thumbnailDir; // ที่อยู่ของ Thumbnail

    // จัดเก็บไฟล์วิดีโอ
    @Override
    public Path storeFile(MultipartFile file, String fileName) throws IOException {
        Path directoryPath = Paths.get(videoDir);
        if (!Files.exists(directoryPath)) {
            Files.createDirectories(directoryPath);
        }
        Path filePath = directoryPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        return filePath;
    }

    // สร้าง path สำหรับ thumbnail
    public Path createThumbnailPath(String thumbnailFileName) throws IOException {
        Path thumbnailDirectoryPath = Paths.get(thumbnailDir);
        if (!Files.exists(thumbnailDirectoryPath)) {
            Files.createDirectories(thumbnailDirectoryPath);
        }
        return thumbnailDirectoryPath.resolve(thumbnailFileName);
    }

    public Path getThumbnailFilePath(String fileName) {
        // ถ้ามี "/thumbnails/" ใน path, ให้ลบออกก่อน
        if (fileName.startsWith("/thumbnails/")) {
            fileName = fileName.replace("/thumbnails/", "");
        }
        return Paths.get(thumbnailDir, fileName);
    }

    // ดึง path ของไฟล์วิดีโอจากชื่อไฟล์
    public Path getVideoFilePath(String fileName) {
        // ถ้ามี "/videos/" ใน path, ให้ลบออกก่อน
        if (fileName.startsWith("/videos/")) {
            fileName = fileName.replace("/videos/", "");
        }
        return Paths.get(videoDir, fileName);
    }

    // ลบไฟล์
    @Override
    public void deleteFile(Path filePath) throws IOException {
        Files.deleteIfExists(filePath);
    }

    // ดึงไฟล์วิดีโอตามชื่อไฟล์
    @Override
    public Resource loadFileAsResource(String fileName) {
        try {
            Path filePath = Paths.get(videoDir, fileName);
            Resource resource = new FileSystemResource(filePath);

            if (!resource.exists()) {
                throw new VideoNotFoundException(null);
            }

            return resource;
        } catch (Exception e) {
            throw new RuntimeException("Failed to load video: " + fileName, e);
        }
    }

    // ดึงไฟล์ Thumbnail ตามชื่อไฟล์
    @Override
    public Resource retrieveThumbnailByName(String fileName) {
        try {
            Path thumbnailPath = Paths.get(thumbnailDir, fileName);
            Resource resource = new FileSystemResource(thumbnailPath);

            if (!resource.exists()) {
                throw new RuntimeException("Thumbnail not found: " + fileName);
            }

            return resource;
        } catch (Exception e) {
            throw new RuntimeException("Failed to load thumbnail: " + fileName, e);
        }
    }
}
