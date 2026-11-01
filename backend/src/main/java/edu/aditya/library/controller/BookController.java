package edu.aditya.library.controller;

import edu.aditya.library.dto.ApiResponse;
import edu.aditya.library.model.Book;
import edu.aditya.library.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookController {

    @Autowired
    private BookService bookService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Book>>> getAllBooks(
            @RequestParam(required = false) String category) {
        List<Book> books;
        if (category != null && !category.trim().isEmpty() && !"ALL".equalsIgnoreCase(category)) {
            books = bookService.getBooksByCategory(category);
        } else {
            books = bookService.getAllBooks();
        }
        return ResponseEntity.ok(ApiResponse.success("Books catalog retrieved", books));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Book>>> searchBooks(
            @RequestParam(name = "q", defaultValue = "") String query) {
        List<Book> books = bookService.searchBooks(query);
        return ResponseEntity.ok(ApiResponse.success("Found " + books.size() + " book(s) matching '" + query + "'", books));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getCategories() {
        List<String> categories = bookService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success("Book categories retrieved", categories));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Book>> getBookById(@PathVariable Long id) {
        return bookService.getBookById(id)
                .map(book -> ResponseEntity.ok(ApiResponse.success("Book details retrieved", book)))
                .orElse(ResponseEntity.notFound().build());
    }
}
