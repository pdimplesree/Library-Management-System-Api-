package edu.aditya.library.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class StudentRegistrationRequest {

    @NotBlank
    @Pattern(regexp = "[A-Za-z0-9._-]{3,50}", message = "Student ID must be 3-50 letters, numbers, dots, underscores, or hyphens")
    private String studentId;

    @NotBlank
    @Size(max = 100)
    private String name;

    @Email
    @Size(max = 120)
    private String email;

    @NotBlank
    @Size(min = 8, max = 100)
    private String password;

    @NotBlank
    @Size(max = 50)
    private String department;

    @Min(1)
    @Max(8)
    private Integer yearOfStudy;

    @Size(max = 20)
    private String phone;

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public Integer getYearOfStudy() { return yearOfStudy; }
    public void setYearOfStudy(Integer yearOfStudy) { this.yearOfStudy = yearOfStudy; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}
