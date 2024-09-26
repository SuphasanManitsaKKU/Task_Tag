package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "videos")
public class Videos {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "file_path")
    private String filePath;

    @Column(name = "title")
    private String title;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(name = "userId", nullable = false)
    private String userId = "admin"; // ค่าเริ่มต้นเป็น "admin"

    public Videos() {
    }

    public Videos(String fileName, String filePath, String title, String thumbnailUrl) {
        this(fileName, filePath, title, thumbnailUrl, "admin");
    }
    
    public Videos(String fileName, String filePath, String title, String thumbnailUrl, String userId) {
        this.fileName = fileName;
        this.filePath = filePath;
        this.title = title;
        this.thumbnailUrl = thumbnailUrl;
        this.userId = userId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

}
