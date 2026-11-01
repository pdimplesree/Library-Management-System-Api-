package edu.aditya.library;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SmartLibraryApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartLibraryApplication.class, args);
        System.out.println("==================================================================");
        System.out.println(" Aditya University Smart Library Management System is running!    ");
        System.out.println(" API Server: http://localhost:8080                                ");
        System.out.println(" Health / Info: http://localhost:8080/api/library/occupancy      ");
        System.out.println("==================================================================");
    }
}
