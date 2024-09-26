package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.file.Path;

@Service
public class VideoThumbnailService {

    @Autowired
    private IFileStorageService fileStorageService;  // เรียกใช้ FileStorageService

    public String generateThumbnail(String fileName) throws IOException {
        System.out.println("Starting thumbnail generation for: " + fileName);
    
        // ใช้ FileStorageService ในการจัดการโฟลเดอร์และ path สำหรับ thumbnail
        String thumbnailFileName = fileName.substring(0, fileName.lastIndexOf('.')) + ".jpg";
        Path thumbnailPath = fileStorageService.createThumbnailPath(thumbnailFileName);
    
        // เรียกใช้งาน FFmpeg เพื่อสร้าง thumbnail
        ProcessBuilder processBuilder = new ProcessBuilder(
                "ffmpeg", "-i", fileStorageService.getVideoFilePath(fileName).toString(), 
                "-ss", "00:00:02", "-vframes", "1", "-update", "1", thumbnailPath.toString());
    
        Process process = processBuilder.start();
        StreamGobbler errorGobbler = new StreamGobbler(process.getErrorStream(), "ERROR");
        StreamGobbler outputGobbler = new StreamGobbler(process.getInputStream(), "OUTPUT");
        errorGobbler.start();
        outputGobbler.start();
    
        try {
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                throw new IOException("FFmpeg process failed with exit code: " + exitCode);
            }
            // เปลี่ยนให้คืนค่าเฉพาะชื่อไฟล์ โดยไม่รวม "/thumbnails/"
            return thumbnailFileName;  
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Thumbnail generation interrupted", e);
        }
    }    

    private static class StreamGobbler extends Thread {
        private InputStream inputStream;
        private String type;

        public StreamGobbler(InputStream inputStream, String type) {
            this.inputStream = inputStream;
            this.type = type;
        }

        @Override
        public void run() {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    System.out.println(type + "> " + line);
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
