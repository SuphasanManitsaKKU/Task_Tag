package com.example.demo.controller;

import com.example.demo.exception.VideoNotFoundException;
import com.example.demo.model.Videos;
import com.example.demo.service.StreamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/stream")
public class StreamController {

    @Autowired
    private StreamService streamService;

    @GetMapping("/videos")
    public ResponseEntity<List<Videos>> getAllVideos() {
        List<Videos> videos = streamService.findAll();
        return ResponseEntity.ok(videos); // ส่งข้อมูลทั้งหมดของวิดีโอไปเป็น JSON
    }

    @GetMapping("/videos/stream/{fileName}")
    public ResponseEntity<Resource> streamVideo(@PathVariable String fileName) {
        try {
            // ใช้ StreamService เพื่อเรียกข้อมูลไฟล์จาก path ที่ dynamic
            Resource resource = streamService.retrieveContentByName(fileName); // ใช้ method ที่ดึงไฟล์วิดีโอจาก
                                                                               // StreamService

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                    .contentType(MediaTypeFactory.getMediaType(resource).orElse(MediaType.APPLICATION_OCTET_STREAM))
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @GetMapping(value = "/{id}", produces = "video/mp4")
    public Mono<Resource> streamContent(@PathVariable Long id) {
        return streamService.retrieveContent(id);
    }

    @GetMapping("/thumbnails/{fileName}")
    public ResponseEntity<Resource> getThumbnail(@PathVariable String fileName) {
        try {
            // ใช้ StreamService เพื่อเรียกข้อมูล thumbnail จาก path ที่ dynamic
            Resource resource = streamService.retrieveThumbnailByName(fileName); // ใช้ method ใหม่ใน StreamService

            return ResponseEntity.ok()
                    .contentType(MediaTypeFactory.getMediaType(resource).orElse(MediaType.IMAGE_JPEG))
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadVideo(@RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("userId") String userId) {
        try {
            // Log ข้อมูล request และข้อมูลไฟล์
            System.out.println("Received request to upload video: " + title);
            System.out.println("File Name: " + file.getOriginalFilename());
            System.out.println("File Size: " + file.getSize());
            System.out.println("File Content Type: " + file.getContentType());

            // เรียก service เพื่อบันทึกข้อมูล โดยส่งค่า userId ไปด้วย
            Videos savedVideo = streamService.uploadVideo(file, title, userId);
            System.out.println("saveVideo passed");

            // ตรวจสอบว่าการบันทึกสำเร็จหรือไม่
            if (savedVideo != null) {
                System.out.println("Video saved successfully with ID: " + savedVideo.getId());
                return ResponseEntity.ok("File uploaded and data saved successfully.");
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Failed to save video to the database.");
            }
        } catch (IOException e) {
            e.printStackTrace(); // Log ข้อผิดพลาด
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload the file: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                    .body(e.getMessage());
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteVideo(@PathVariable Long id) {
        try {
            streamService.deleteVideo(id);
            return ResponseEntity.ok("File and thumbnail deleted successfully.");
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to delete the file: " + e.getMessage());
        } catch (VideoNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    // เพิ่มเส้นทางเพื่อดึงข้อมูลวิดีโอที่ตรงกับ userId
    @GetMapping("/videos/user/{userId}")
    public ResponseEntity<List<Videos>> getVideosByUserId(@PathVariable String userId) {
        List<Videos> videos = streamService.getVideosByUserId(userId);
        if (videos.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(videos); // ส่งข้อมูลวิดีโอที่ตรงกับ userId ไปเป็น JSON
    }

    @GetMapping("/videos/{id}")
    public ResponseEntity<Videos> getVideoById(@PathVariable Long id) {
        try {
            Videos video = streamService.findVideoById(id); // เรียกใช้ method ใน StreamService
            return ResponseEntity.ok(video); // ส่งข้อมูลวิดีโอเป็น JSON
        } catch (VideoNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PutMapping("/videos/{id}/title")
    public ResponseEntity<String> updateVideoTitle(@PathVariable Long id, @RequestParam("title") String title) {
        try {
            streamService.updateVideoTitle(id, title);
            return ResponseEntity.ok("Title updated successfully.");
        } catch (VideoNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update title.");
        }
    }

}
