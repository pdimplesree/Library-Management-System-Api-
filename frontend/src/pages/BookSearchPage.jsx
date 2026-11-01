import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Layers, 
  MapPin, 
  Bookmark, 
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function BookSearchPage({ initialSearchQuery = '' }) {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchBooks = async (query = '', category = 'ALL') => {
    setLoading(true);
    try {
      let res;
      if (query.trim()) {
        res = await api.searchBooks(query);
      } else {
        res = await api.getBooks(category);
      }
      if (res.success) setBooks(res.data);
    } catch (e) {
      console.error('Failed to load books:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.getCategories().then(res => {
      if (res.success) setCategories(res.data);
    }).catch(() => {});

    fetchBooks(searchQuery, selectedCategory);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBooks(searchQuery, selectedCategory);
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setSearchQuery('');
    fetchBooks('', cat);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">University Book Catalogue</h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore course textbooks, API architecture guides, and technical reference volumes across library racks.
        </p>
      </div>

      {/* Search Bar & Categories Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, author, category, or ISBN (e.g., 'API', 'Java', 'Networks')..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-aditya-500 focus:bg-white transition"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-aditya-700 hover:bg-aditya-800 text-white font-bold text-sm rounded-2xl transition shadow flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-400 uppercase mr-2">Categories:</span>
          <button
            onClick={() => handleCategorySelect('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedCategory === 'ALL'
                ? 'bg-aditya-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Books ({books.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-aditya-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-aditya-600 animate-spin mx-auto" />
          <div className="text-sm font-semibold text-slate-500">Querying Aditya University catalog API...</div>
        </div>
      ) : books.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 shadow-xs">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No Books Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            We couldn't find any books matching '{searchQuery}'. Try searching with different keywords like 'Java', 'API', or 'Algorithms'.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); fetchBooks(); }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-xs font-bold rounded-xl transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => {
            const hasAvailable = book.availableCopies > 0;

            return (
              <div
                key={book.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-aditya-50 text-aditya-700 border border-aditya-200">
                      {book.category}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      hasAvailable 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {hasAvailable ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          {book.availableCopies} Copies Available
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-rose-500" />
                          All Copies Borrowed
                        </>
                      )}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 leading-snug line-clamp-2">
                      {book.title}
                    </h3>
                    <div className="text-xs text-slate-500 mt-1 font-medium">
                      By <strong className="text-slate-700">{book.author}</strong>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {book.description || 'Reference textbook available for student issue and reading hall study.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      ISBN: {book.isbn}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      <MapPin className="w-3 h-3 text-aditya-600" />
                      {book.shelfLocation}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Total Holdings: <strong>{book.totalCopies}</strong></span>
                    <span>Publisher: {book.publisher || 'Aditya Academic'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
