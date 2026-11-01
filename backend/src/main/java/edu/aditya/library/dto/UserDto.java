package edu.aditya.library.dto;

import edu.aditya.library.model.Role;
import edu.aditya.library.model.User;

public class UserDto {
    private Long id;
    private String studentId;
    private String name;
    private String email;
    private Role role;
    private String department;
    private Integer yearOfStudy;
    private String phone;
    private Boolean isInside;

    public UserDto() {}

    public UserDto(User user) {
        this.id = user.getId();
        this.studentId = user.getStudentId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.department = user.getDepartment();
        this.yearOfStudy = user.getYearOfStudy();
        this.phone = user.getPhone();
        this.isInside = user.getIsInside();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Integer getYearOfStudy() { return yearOfStudy; }
    public void setYearOfStudy(Integer yearOfStudy) { this.yearOfStudy = yearOfStudy; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Boolean getIsInside() { return isInside; }
    public void setIsInside(Boolean inside) { isInside = inside; }
}
