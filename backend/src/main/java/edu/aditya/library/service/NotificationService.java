package edu.aditya.library.service;

import edu.aditya.library.model.Notification;
import edu.aditya.library.model.User;
import edu.aditya.library.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public Notification markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + notificationId));

        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied: You cannot modify another student's notification.");
        }

        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        for (Notification n : list) {
            if (!n.getIsRead()) {
                n.setIsRead(true);
                notificationRepository.save(n);
            }
        }
    }

    @Transactional
    public Notification createNotification(User user, String title, String message, String type) {
        // Prevent duplicate notification within 24 hours
        LocalDateTime yesterday = LocalDateTime.now().minusHours(24);
        if (notificationRepository.existsByUserIdAndTitleAndCreatedAtAfter(user.getId(), title, yesterday)) {
            return null; // Already notified recently
        }

        Notification notification = new Notification(user, title, message, type);
        return notificationRepository.save(notification);
    }
}
