package com.health.notify.repo;
import com.health.notify.model.Notification; import org.springframework.data.jpa.repository.JpaRepository;
public interface NotificationRepository extends JpaRepository<Notification, Long> {}
