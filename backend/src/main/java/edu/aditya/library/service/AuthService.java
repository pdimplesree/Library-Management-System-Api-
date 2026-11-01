package edu.aditya.library.service;

import edu.aditya.library.config.JwtUtil;
import edu.aditya.library.dto.AuthResponse;
import edu.aditya.library.dto.LoginRequest;
import edu.aditya.library.dto.UserDto;
import edu.aditya.library.model.User;
import edu.aditya.library.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthResponse login(LoginRequest request) {
        String identifier = request.getIdentifier().trim();
        Optional<User> userOpt = userRepository.findByStudentIdOrEmail(identifier, identifier);

        if (userOpt.isEmpty()) {
            throw new RuntimeException("Invalid credentials: User not found with ID or Email " + identifier);
        }

        User user = userOpt.get();
        if (request.getRole() == null || !user.getRole().name().equalsIgnoreCase(request.getRole().trim())) {
            throw new RuntimeException("This account does not belong to the selected login role.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials: Incorrect password");
        }

        String token = jwtUtil.generateToken(user.getStudentId(), user.getId(), user.getRole().name());
        UserDto userDto = new UserDto(user);

        return new AuthResponse(token, userDto, "Login successful. Welcome back, " + user.getName());
    }

    public UserDto getCurrentUserDto(User user) {
        if (user == null) {
            throw new RuntimeException("Unauthorized: No authenticated user session");
        }
        return new UserDto(user);
    }
}
