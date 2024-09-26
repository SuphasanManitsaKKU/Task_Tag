package com.example.demo.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Path;

public interface IFileStorageService {
    Path storeFile(MultipartFile file, String fileName) throws IOException;
    void deleteFile(Path filePath) throws IOException;
    Resource loadFileAsResource(String fileName);
    // เพิ่มเมธอด retrieveThumbnailByName
    Resource retrieveThumbnailByName(String fileName);

    // เพิ่ม method ที่จำเป็น
    Path createThumbnailPath(String thumbnailFileName) throws IOException;
    Path getVideoFilePath(String fileName);
    Path getThumbnailFilePath(String fileName);
}


