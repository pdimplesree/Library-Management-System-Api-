package edu.aditya.library.service;

import edu.aditya.library.model.BookLoan;
import edu.aditya.library.repository.BookLoanRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class ScheduledReminderService {

    private static final Logger logger = LoggerFactory.getLogger(ScheduledReminderService.class);

    @Autowired
    private BookLoanRepository loanRepository;

    @Autowired
    private NotificationService notificationService;

    @Scheduled(fixedRateString = "${library.schedule.reminder-rate-ms:60000}")
    @Transactional
    public void scanAndGenerateReminders() {
        LocalDate today = LocalDate.now();

        // 1. Process Overdue Loans
        List<BookLoan> overdueLoans = loanRepository.findOverdueLoans(today);
        for (BookLoan loan : overdueLoans) {
            if (!"OVERDUE".equalsIgnoreCase(loan.getStatus())) {
                loan.setStatus("OVERDUE");
                loanRepository.save(loan);
            }
            long daysOverdue = ChronoUnit.DAYS.between(loan.getDueDate(), today);
            String title = "OVERDUE ALERT: " + loan.getBook().getTitle();
            String message = "Your borrowed book '" + loan.getBook().getTitle() +
                    "' was due on " + loan.getDueDate() + " (" + daysOverdue + " day(s) overdue). Please return it immediately.";
            notificationService.createNotification(loan.getUser(), title, message, "OVERDUE_ALERT");
        }

        // 2. Process Upcoming Deadlines (within next 3 days)
        LocalDate threeDaysAhead = today.plusDays(3);
        List<BookLoan> upcomingLoans = loanRepository.findLoansDueBetween(today, threeDaysAhead);
        for (BookLoan loan : upcomingLoans) {
            long daysLeft = ChronoUnit.DAYS.between(today, loan.getDueDate());
            String title = "Upcoming Due Date: " + loan.getBook().getTitle();
            String message = "Reminder: Your borrowed book '" + loan.getBook().getTitle() +
                    "' is due in " + daysLeft + " day(s) on " + loan.getDueDate() + ". Return or renew soon.";
            notificationService.createNotification(loan.getUser(), title, message, "DUE_DATE_REMINDER");
        }

        logger.info("Executed scheduled due-date reminder scan. Processed {} overdue loans and {} upcoming loans.",
                overdueLoans.size(), upcomingLoans.size());
    }

    public int triggerManualScan() {
        scanAndGenerateReminders();
        return (int) loanRepository.countByStatus("OVERDUE");
    }
}
