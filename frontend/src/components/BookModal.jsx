import React, { useState, useEffect } from 'react';
import { X, BookPlus, Save, AlertCircle, Sparkles } from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Artificial Intelligence & Data Science',
  'Electronics & Comm',
  'Mechanical Eng',
  'Electrical & Electronics',
  'Civil Eng',
  'Management Studies (MBA)',
  'Applied Science & Humanities',
  'General Reference',
];

const GOOGLE_PALETTE = [
  { name: 'Google Blue', hex: '#1a73e8' },
  { name: 'Teal', hex: '#0d9488' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Indigo', hex: '#4f46e5' },
  { name: 'Purple', hex: '#7c3aed' },
  { name: 'Amber', hex: '#d97706' },
  { name: 'Crimson', hex: '#dc2626' },
  { name: 'Slate', hex: '#475569' },
];

export default function BookModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
}) {
  const isEdit = !!initialData;

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    department: 'Computer Science',
    totalCopies: 5,
    availableCopies: 5,
    shelfLocation: 'Floor 2, Bay CS-01',
    edition: '1st Edition',
    publishedYear: new Date().getFullYear(),
    publisher: 'PSG Academic Press',
    description: '',
    coverColor: '#1a73e8',
    tags: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        author: initialData.author || '',
        isbn: initialData.isbn || '',
        department: initialData.department || 'Computer Science',
        totalCopies: initialData.totalCopies || 1,
        availableCopies: initialData.availableCopies !== undefined ? initialData.availableCopies : 1,
        shelfLocation: initialData.shelfLocation || 'Floor 2, Bay CS-01',
        edition: initialData.edition || '1st Edition',
        publishedYear: initialData.publishedYear || new Date().getFullYear(),
        publisher: initialData.publisher || 'PSG Academic Press',
        description: initialData.description || '',
        coverColor: initialData.coverColor || '#1a73e8',
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : '',
      });
    } else {
      setFormData({
        title: '',
        author: '',
        isbn: '',
        department: 'Computer Science',
        totalCopies: 5,
        availableCopies: 5,
        shelfLocation: 'Floor 2, Bay CS-01',
        edition: '1st Edition',
        publishedYear: new Date().getFullYear(),
        publisher: 'PSG Academic Press',
        description: '',
        coverColor: '#1a73e8',
        tags: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.author.trim()) newErrors.author = 'Author name is required';
    if (!formData.isbn.trim()) newErrors.isbn = 'ISBN / Accession code is required';
    if (parseInt(formData.totalCopies, 10) < 1) newErrors.totalCopies = 'Must have at least 1 copy';
    if (parseInt(formData.availableCopies, 10) > parseInt(formData.totalCopies, 10)) {
      newErrors.availableCopies = 'Available copies cannot exceed total copies';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...formData,
      totalCopies: parseInt(formData.totalCopies, 10),
      availableCopies: parseInt(formData.availableCopies, 10),
      publishedYear: parseInt(formData.publishedYear, 10),
      tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    });
  };

  // Helper to suggest shelf location based on department
  const handleDepartmentChange = (dept) => {
    let shelf = formData.shelfLocation;
    if (!isEdit) {
      if (dept.includes('Computer')) shelf = 'Floor 2, Bay CS-02';
      else if (dept.includes('Information')) shelf = 'Floor 2, Bay IT-04';
      else if (dept.includes('Artificial')) shelf = 'Floor 3, Bay AI-01';
      else if (dept.includes('Electronics')) shelf = 'Floor 1, Bay ECE-03';
      else if (dept.includes('Mechanical')) shelf = 'Floor 1, Bay MECH-02';
      else if (dept.includes('Electrical')) shelf = 'Floor 1, Bay EEE-01';
      else if (dept.includes('Civil')) shelf = 'Floor 1, Bay CIVIL-01';
      else if (dept.includes('MBA')) shelf = 'Floor 3, Bay MBA-02';
      else shelf = 'Floor 2, Bay ASH-01';
    }
    setFormData((prev) => ({ ...prev, department: dept, shelfLocation: shelf }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-gray-200/90 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Bar */}
        <div
          className="p-5 text-white flex items-center justify-between"
          style={{ backgroundColor: formData.coverColor || '#1a73e8' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <BookPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {isEdit ? 'Update Book Record' : 'Add New Book to PSG Library'}
              </h2>
              <p className="text-xs text-white/80">
                {isEdit ? `Editing ID: ${initialData._id}` : 'Catalog a new physical volume in the library stack'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Book Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Introduction to Algorithms (CLRS)"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 focus:outline-none focus:ring-2 ${
                errors.title
                  ? 'border-red-400 focus:ring-red-200'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
              }`}
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Author & ISBN Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Author(s) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="e.g. Thomas H. Cormen, Ronald Rivest"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-900 focus:outline-none focus:ring-2 ${
                  errors.author
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                }`}
              />
              {errors.author && <p className="text-xs text-red-500 mt-1">{errors.author}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                ISBN / Accession Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                placeholder="e.g. 978-0262033848"
                className={`w-full px-4 py-2.5 rounded-xl border font-mono text-sm text-gray-900 focus:outline-none focus:ring-2 ${
                  errors.isbn
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                }`}
              />
              {errors.isbn && <p className="text-xs text-red-500 mt-1">{errors.isbn}</p>}
            </div>
          </div>

          {/* Department & Shelf Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Department / Discipline <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.department}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Physical Shelf Location
              </label>
              <input
                type="text"
                value={formData.shelfLocation}
                onChange={(e) => setFormData({ ...formData, shelfLocation: e.target.value })}
                placeholder="e.g. Floor 2, Bay CS-01"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Copies Management */}
          <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-200/70 space-y-3">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Stock & Availability Management
            </span>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Total Inventory Copies <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.totalCopies}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 1;
                    setFormData((prev) => ({
                      ...prev,
                      totalCopies: val,
                      availableCopies: isEdit ? prev.availableCopies : val,
                    }));
                  }}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                {errors.totalCopies && <p className="text-xs text-red-500 mt-1">{errors.totalCopies}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Currently Available Copies
                </label>
                <input
                  type="number"
                  min="0"
                  max={formData.totalCopies}
                  value={formData.availableCopies}
                  onChange={(e) => setFormData({ ...formData, availableCopies: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                {errors.availableCopies && <p className="text-xs text-red-500 mt-1">{errors.availableCopies}</p>}
              </div>
            </div>
          </div>

          {/* Edition, Year, Publisher */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Edition</label>
              <input
                type="text"
                value={formData.edition}
                onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                placeholder="4th Edition"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Year</label>
              <input
                type="number"
                value={formData.publishedYear}
                onChange={(e) => setFormData({ ...formData, publishedYear: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Publisher</label>
              <input
                type="text"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                placeholder="MIT Press"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Description / Synopsis
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief summary of book contents or syllabus units..."
              className="w-full px-4 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Google Material Color Theme */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Accent Cover Theme (Google Material Palette)
            </label>
            <div className="flex items-center gap-2">
              {GOOGLE_PALETTE.map((c) => (
                <button
                  type="button"
                  key={c.hex}
                  onClick={() => setFormData({ ...formData, coverColor: c.hex })}
                  style={{ backgroundColor: c.hex }}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    formData.coverColor === c.hex ? 'scale-125 ring-2 ring-offset-2 ring-blue-500 shadow-sm' : 'opacity-80 hover:opacity-100'
                  }`}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Footer CTAs */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-full text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : isEdit ? 'Update Book' : 'Add to Catalog'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

