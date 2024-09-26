package com.example.demo.repository;

import com.example.demo.model.Videos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface IVideosRepository extends JpaRepository<Videos, Long> {
    List<Videos> findByUserId(String userId);
}

