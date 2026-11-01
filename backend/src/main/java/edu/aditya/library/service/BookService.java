package edu.aditya.library.service;

import edu.aditya.library.dto.BookRequest;
import edu.aditya.library.model.Book;
import edu.aditya.library.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public List<Book> searchBooks(String query) {
        if (query == null || query.trim().isEmpty()) {
            return bookRepository.findAll();
        }
        return bookRepository.searchBooks(query.trim());
    }

    public List<Book> getBooksByCategory(String category) {
        return bookRepository.findByCategoryIgnoreCase(category);
    }

    public List<String> getAllCategories() {
        return bookRepository.findDistinctCategories();
    }

    public Optional<Book> getBookById(Long id) {
        return bookRepository.findById(id);
    }

    @Transactional
    public Book addBook(BookRequest request) {
        bookRepository.findByIsbn(request.getIsbn()).ifPresent(b -> {
            throw new RuntimeException("Book with ISBN " + request.getIsbn() + " already exists in catalog.");
        });

        Book book = new Book(
                request.getIsbn().trim(),
                request.getTitle().trim(),
                request.getAuthor().trim(),
                request.getCategory().trim(),
                request.getPublisher(),
                request.getTotalCopies(),
                request.getTotalCopies(), // initially all copies are available
                request.getShelfLocation(),
                request.getDescription()
        );

        return bookRepository.save(book);
    }

    @Transactional
    public Book updateBook(Long id, BookRequest request) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found with ID: " + id));

        book.setTitle(request.getTitle().trim());
        book.setAuthor(request.getAuthor().trim());
        book.setCategory(request.getCategory().trim());
        book.setPublisher(request.getPublisher());
        book.setShelfLocation(request.getShelfLocation());
        book.setDescription(request.getDescription());

        // Update total and available copies proportionally
        int copyDelta = request.getTotalCopies() - book.getTotalCopies();
        book.setTotalCopies(request.getTotalCopies());
        int newAvailable = Math.max(0, book.getAvailableCopies() + copyDelta);
        book.setAvailableCopies(newAvailable);

        return bookRepository.save(book);
    }
}
