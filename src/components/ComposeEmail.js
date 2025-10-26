import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../services/supabase";
import { showNotification, showPromiseNotification } from "../utils/notifications";
import { InlineLoading } from "./LoadingScreen";
import { Mail, Send, Save, Upload, FileText, ChevronDown, Folder, ArrowLeft, X, Languages, User, Calendar, Info, Trash2, Paperclip } from 'lucide-react';

const ComposeEmail = ({ onRecordSaved }) => {
  const [formData, setFormData] = useState({
    from: "",
    to: [],
    subject: "",
    content: "",
    pdfFiles: [],
    pdfFileNames: [],
    subjectHindi: "",
    contentHindi: "",
    subjectMarathi: "",
    contentMarathi: "",
    sentDate: new Date().toISOString().split("T")[0],
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeFolder, setActiveFolder] = useState(null);
  const [translating, setTranslating] = useState({
    hindi: { subject: false, content: false },
    marathi: { subject: false, content: false }
  });
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [emailInput, setEmailInput] = useState("");

  const fileInputRef = useRef(null);
  const toInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Email options
  const emailOptions = {
    "Administration": {
      "Principal": ["Principal-1@kkwagh.edu.in"],
      "Dean": [
        "Dean-1@kkwagh.edu.in",
        "Dean-2@kkwagh.edu.in",
        "Dean-3@kkwagh.edu.in",
        "Dean-4@kkwagh.edu.in",
        "Dean-5@kkwagh.edu.in",
        "Dean-6@kkwagh.edu.in",
        "Dean-7@kkwagh.edu.in",
      ]
    },
    "Department Heads": {
      "HOD": [
        "hrishikeshgavai@gmail.com",
        "dkpatil370123@kkwagh.edu.in",
        "dapagar370123@kkwagh.edu.in",
        "dhruveshpatil7777@gmail.com",
        "nakshatrarao48@gmail.com",
        "pmlokwani370123@kkwagh.edu.in",
        "hagavai370123@kkwagh.edu.in",
        "ranjit.pawar5142@gmail.com",
      ]
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
        setActiveFolder(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailInputChange = (e) => {
    setEmailInput(e.target.value);
  };

  const handleManualEmailInput = (e) => {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      e.preventDefault();
      const newEmail = emailInput.trim().replace(/[,;\s]+$/, "");

      if (newEmail && isValidEmail(newEmail)) {
        addEmail(newEmail);
      } else if (newEmail && !isValidEmail(newEmail)) {
        showNotification("Please enter a valid email address", "error");
      }
      setEmailInput("");
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const addEmail = (email) => {
    if (!formData.to.includes(email)) {
      setFormData((prev) => ({ ...prev, to: [...prev.to, email] }));
      showNotification(`Added ${email}`, "success");
    } else {
      showNotification("Email already added", "warning");
    }
    setDropdownOpen(false);
    setActiveFolder(null);
    if (toInputRef.current) {
      toInputRef.current.focus();
    }
  };

  const removeEmail = (email) => {
    setFormData((prev) => ({
      ...prev,
      to: prev.to.filter((e) => e !== email),
    }));
    showNotification(`Removed ${email}`, "info");
  };

  const clearAllEmails = () => {
    setFormData((prev) => ({ ...prev, to: [] }));
    showNotification("All recipients cleared", "info");
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
    setActiveFolder(null);
  };

  const handleFileUpload = async (files) => {
    if (!files.length) return;

    const validFiles = Array.from(files).filter(file => {
      if (file.type !== 'application/pdf') {
        showNotification(`${file.name}: Only PDF files are allowed`, "error");
        return false;
      }
      if (file.size > 40 * 1024 * 1024) {
        showNotification(`${file.name}: File size exceeds 40MB limit`, "error");
        return false;
      }
      return true;
    });

    showPromiseNotification(
      Promise.all(
        validFiles.map(async (file) => {
          try {
            const fileName = `${Date.now()}-${file.name}`;
            const { error } = await supabase.storage.from("pdfs").upload(fileName, file);

            if (error) throw error;

            setFormData((prev) => ({
              ...prev,
              pdfFiles: [...prev.pdfFiles, file],
              pdfFileNames: [...prev.pdfFileNames, fileName],
            }));

            return fileName;
          } catch (err) {
            console.error("PDF upload error:", err);
            throw new Error(`Failed to upload: ${file.name}`);
          }
        })
      ),
      {
        loading: `Uploading ${validFiles.length} file(s)...`,
        success: `Successfully uploaded ${validFiles.length} file(s)`,
        error: 'Some files failed to upload'
      }
    );
  };

  const handleFileInputChange = (e) => {
    handleFileUpload(Array.from(e.target.files));
    e.target.value = '';
  };

  const removeFile = (index) => {
    const fileName = formData.pdfFiles[index].name;
    setFormData(prev => ({
      ...prev,
      pdfFiles: prev.pdfFiles.filter((_, i) => i !== index),
      pdfFileNames: prev.pdfFileNames.filter((_, i) => i !== index)
    }));
    showNotification(`Removed ${fileName}`, "info");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(Array.from(e.dataTransfer.files));
  };

  const translateText = async (text, type, language) => {
    if (!text.trim()) {
      showNotification('Please enter text to translate', 'warning');
      return;
    }

    showPromiseNotification(
      new Promise(async (resolve, reject) => {
        setTranslating(prev => ({
          ...prev,
          [language]: { ...prev[language], [type]: true }
        }));

        try {
          const langPair = language === 'hindi' ? 'en|hi' : 'en|mr';
          const response = await fetch(
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`
          );

          if (!response.ok) {
            throw new Error('Translation API request failed');
          }

          const data = await response.json();

          if (data.responseStatus !== 200) {
            throw new Error('Translation failed: ' + data.responseDetails);
          }

          const translatedText = data.responseData.translatedText;

          if (type === 'subject') {
            setFormData(prev => ({
              ...prev,
              [`subject${language.charAt(0).toUpperCase() + language.slice(1)}`]: translatedText
            }));
          } else {
            setFormData(prev => ({
              ...prev,
              [`content${language.charAt(0).toUpperCase() + language.slice(1)}`]: translatedText
            }));
          }

          resolve(translatedText);
        } catch (error) {
          console.error('Translation error:', error);
          reject(error);
        } finally {
          setTranslating(prev => ({
            ...prev,
            [language]: { ...prev[language], [type]: false }
          }));
        }
      }),
      {
        loading: `Translating to ${language}...`,
        success: `${language.charAt(0).toUpperCase() + language.slice(1)} translation completed`,
        error: 'Translation failed. Please try again.'
      }
    );
  };

  const saveEmailRecord = async () => {
    if (!formData.to.length) {
      showNotification("Please add at least one recipient", "error");
      return;
    }

    if (!formData.subject.trim()) {
      showNotification("Please add a subject", "error");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("email_records")
        .insert([
          {
            from_user: formData.from || "Not specified",
            to_user: formData.to.join(","),
            subject: formData.subject,
            content: formData.content,
            subject_hindi: formData.subjectHindi,
            content_hindi: formData.contentHindi,
            subject_marathi: formData.subjectMarathi,
            content_marathi: formData.contentMarathi,
            pdf_filename: formData.pdfFileNames.length ? formData.pdfFileNames.join(",") : null,
            sent_date: formData.sentDate,
          },
        ])
        .select();

      if (error) throw error;

      const insertedRow = data[0];
      showNotification("Email record saved successfully!", "success");

      // Reset form but keep sender email
      setFormData({
        from: formData.from,
        to: [],
        subject: "",
        content: "",
        pdfFiles: [],
        pdfFileNames: [],
        subjectHindi: "",
        contentHindi: "",
        subjectMarathi: "",
        contentMarathi: "",
        sentDate: new Date().toISOString().split("T")[0],
      });
      setEmailInput("");

      if (onRecordSaved) onRecordSaved(insertedRow);
    } catch (err) {
      console.error("Error saving email record:", err);
      showNotification("Failed to save email record", "error");
    } finally {
      setLoading(false);
    }
  };

  const openGmailAndSave = async () => {
    if (!formData.to.length) {
      showNotification("Please add at least one recipient", "error");
      return;
    }

    if (!formData.subject.trim()) {
      showNotification("Please add a subject", "error");
      return;
    }

    showPromiseNotification(
      new Promise(async (resolve, reject) => {
        try {
          const toEmails = formData.to.join(',');
          const subject = formData.subject || '';
          let body = formData.content || '';

          // Add translations to email body
          if (formData.contentHindi || formData.contentMarathi) {
            body += '\n\n--- Translations ---\n';
            if (formData.contentHindi) {
              body += `\nHindi:\n${formData.contentHindi}\n`;
            }
            if (formData.contentMarathi) {
              body += `\nMarathi:\n${formData.contentMarathi}\n`;
            }
          }

          const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(toEmails)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          const gmailWindow = window.open(gmailUrl, '_blank');

          if (gmailWindow) {
            // Auto-save after a short delay
            setTimeout(async () => {
              await saveEmailRecord();
              resolve();
            }, 1000);
          } else {
            throw new Error('Please allow popups for Gmail to open');
          }
        } catch (error) {
          reject(error);
        }
      }),
      {
        loading: 'Opening Gmail and saving record...',
        success: 'Gmail opened successfully! Email record saved.',
        error: 'Failed to open Gmail. Please check popup settings.'
      }
    );
  };

  const clearForm = () => {
    setFormData({
      from: formData.from,
      to: [],
      subject: "",
      content: "",
      pdfFiles: [],
      pdfFileNames: [],
      subjectHindi: "",
      contentHindi: "",
      subjectMarathi: "",
      contentMarathi: "",
      sentDate: new Date().toISOString().split("T")[0],
    });
    setEmailInput("");
    showNotification("Form cleared", "info");
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-header-icon">
          <Mail size={24} />
        </div>
        <div className="card-header-text">
          <h2>Compose Email</h2>
          <p>Create and send professional emails with multi-language support</p>
        </div>
      </div>

      {/* From Field */}
      <div className="form-group">
        <label className="form-label">
          <User size={18} />
          From
        </label>
        <input
          type="email"
          name="from"
          className="form-input"
          placeholder="sender@example.com (optional)"
          value={formData.from}
          onChange={handleInputChange}
        />
      </div>

      {/* To Field with Dropdown */}
      <div className="form-group">
        <label className="form-label">
          <Mail size={18} />
          To <span className="required">*</span>
        </label>

        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            padding: '12px',
            border: '2px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--white)',
            minHeight: '48px',
            transition: 'all var(--transition-base)'
          }}>
            {formData.to.map((email, index) => (
              <span
                key={index}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  background: 'var(--primary)',
                  color: 'var(--white)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                {email}
                <button
                  onClick={() => removeEmail(email)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    color: 'var(--white)',
                    cursor: 'pointer',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                >
                  <X size={12} />
                </button>
              </span>
            ))}

            <input
              ref={toInputRef}
              type="email"
              className="form-input"
              placeholder={formData.to.length === 0 ? "Type email and press Enter..." : "Add more..."}
              value={emailInput}
              onChange={handleEmailInputChange}
              onKeyDown={handleManualEmailInput}
              style={{
                flex: 1,
                minWidth: '200px',
                border: 'none',
                padding: '4px 8px',
                outline: 'none',
                background: 'transparent',
              }}
            />

            <button
              onClick={toggleDropdown}
              className="btn btn-secondary btn-sm"
              style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}
            >
              <ChevronDown size={16} />
              Quick Select
            </button>
          </div>

          {formData.to.length > 0 && (
            <button
              onClick={clearAllEmails}
              className="btn btn-danger btn-sm"
              style={{ marginTop: '8px' }}
            >
              <Trash2 size={16} />
              Clear All Recipients
            </button>
          )}

          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '8px',
              background: 'var(--white)',
              border: '2px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-xl)',
              zIndex: 'var(--z-dropdown)',
              maxHeight: '400px',
              overflowY: 'auto',
            }}>
              {Object.entries(emailOptions).map(([category, subcategories]) => (
                <div key={category} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <div
                    style={{
                      padding: '12px 16px',
                      background: 'var(--gray-50)',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      transition: 'background var(--transition-fast)',
                    }}
                    onClick={() => setActiveFolder(activeFolder === category ? null : category)}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--gray-100)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--gray-50)'}
                  >
                    <Folder size={16} />
                    {category}
                    <ChevronDown 
                      size={16} 
                      style={{ 
                        marginLeft: 'auto',
                        transform: activeFolder === category ? 'rotate(180deg)' : 'rotate(0)',
                        transition: 'transform var(--transition-base)',
                      }} 
                    />
                  </div>

                  {activeFolder === category && (
                    <div>
                      {Object.entries(subcategories).map(([subcat, emails]) => (
                        <div key={subcat}>
                          <div style={{
                            padding: '10px 32px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            color: 'var(--text-secondary)',
                            background: 'var(--bg-tertiary)',
                          }}>
                            {subcat}
                          </div>
                          {emails.map((email) => (
                            <div
                              key={email}
                              onClick={() => addEmail(email)}
                              style={{
                                padding: '10px 48px',
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                color: 'var(--text-secondary)',
                                transition: 'all var(--transition-fast)',
                                background: formData.to.includes(email) ? 'var(--primary-ultralight)' : 'transparent',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--primary-ultralight)';
                                e.currentTarget.style.color = 'var(--primary)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = formData.to.includes(email) ? 'var(--primary-ultralight)' : 'transparent';
                                e.currentTarget.style.color = 'var(--text-secondary)';
                              }}
                            >
                              {email}
                              {formData.to.includes(email) && (
                                <span style={{ 
                                  marginLeft: '8px', 
                                  color: 'var(--success)', 
                                  fontWeight: '600' 
                                }}>
                                  ✓ Added
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Subject Field */}
      <div className="form-group">
        <label className="form-label">
          <FileText size={18} />
          Subject <span className="required">*</span>
        </label>
        <input
          type="text"
          name="subject"
          className="form-input"
          placeholder="Enter email subject"
          value={formData.subject}
          onChange={handleInputChange}
        />
      </div>

      {/* Content Field */}
      <div className="form-group">
        <label className="form-label">
          <FileText size={18} />
          Content
        </label>
        <textarea
          name="content"
          className="form-textarea"
          placeholder="Write your email content here..."
          value={formData.content}
          onChange={handleInputChange}
          rows={6}
        />
      </div>

      {/* Translation Section */}
      <div style={{
        background: 'var(--gray-50)',
        padding: 'var(--space-xl)',
        borderRadius: 'var(--radius-md)',
        marginBottom: 'var(--space-xl)',
        border: '1px solid var(--border-light)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-lg)',
        }}>
          <Languages size={20} style={{ color: 'var(--primary)' }} />
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>Multi-Language Translation</h3>
        </div>

        {/* Hindi Translation */}
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 'var(--space-sm)',
          }}>
            <label className="form-label" style={{ marginBottom: 0 }}>
              Hindi Translation
            </label>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => translateText(formData.subject, 'subject', 'hindi')}
                disabled={translating.hindi.subject || !formData.subject.trim()}
              >
                {translating.hindi.subject ? <InlineLoading /> : <Languages size={14} />}
                Translate Subject
              </button>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => translateText(formData.content, 'content', 'hindi')}
                disabled={translating.hindi.content || !formData.content.trim()}
              >
                {translating.hindi.content ? <InlineLoading /> : <Languages size={14} />}
                Translate Content
              </button>
            </div>
          </div>
          <input
            type="text"
            name="subjectHindi"
            className="form-input"
            placeholder="Hindi subject (auto-translated)"
            value={formData.subjectHindi}
            onChange={handleInputChange}
            style={{ marginBottom: 'var(--space-sm)' }}
          />
          <textarea
            name="contentHindi"
            className="form-textarea"
            placeholder="Hindi content (auto-translated)"
            value={formData.contentHindi}
            onChange={handleInputChange}
            rows={4}
          />
        </div>

        {/* Marathi Translation */}
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: 'var(--space-sm)',
          }}>
            <label className="form-label" style={{ marginBottom: 0 }}>
              Marathi Translation
            </label>
            <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => translateText(formData.subject, 'subject', 'marathi')}
                disabled={translating.marathi.subject || !formData.subject.trim()}
              >
                {translating.marathi.subject ? <InlineLoading /> : <Languages size={14} />}
                Translate Subject
              </button>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => translateText(formData.content, 'content', 'marathi')}
                disabled={translating.marathi.content || !formData.content.trim()}
              >
                {translating.marathi.content ? <InlineLoading /> : <Languages size={14} />}
                Translate Content
              </button>
            </div>
          </div>
          <input
            type="text"
            name="subjectMarathi"
            className="form-input"
            placeholder="Marathi subject (auto-translated)"
            value={formData.subjectMarathi}
            onChange={handleInputChange}
            style={{ marginBottom: 'var(--space-sm)' }}
          />
          <textarea
            name="contentMarathi"
            className="form-textarea"
            placeholder="Marathi content (auto-translated)"
            value={formData.contentMarathi}
            onChange={handleInputChange}
            rows={4}
          />
        </div>
      </div>

      {/* File Upload Section */}
      <div className="form-group">
        <label className="form-label">
          <Paperclip size={18} />
          Attachments (PDF only, max 40MB)
        </label>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border-medium)'}`,
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-xl)',
            textAlign: 'center',
            background: dragOver ? 'var(--primary-ultralight)' : 'var(--gray-50)',
            transition: 'all var(--transition-base)',
            cursor: 'pointer',
          }}
          onClick={() => fileInputRef.current.click()}
        >
          <Upload size={32} style={{ 
            color: dragOver ? 'var(--primary)' : 'var(--text-muted)',
            marginBottom: 'var(--space-sm)',
          }} />
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {dragOver ? 'Drop files here' : 'Drag & drop PDF files here, or click to browse'}
          </p>
          <p style={{ margin: 0, marginTop: '4px', color: 'var(--text-light)', fontSize: '0.875rem' }}>
            Maximum file size: 40MB per file
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />

        {formData.pdfFiles.length > 0 && (
          <div style={{ marginTop: 'var(--space-md)' }}>
            {formData.pdfFiles.map((file, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 'var(--space-md)',
                  background: 'var(--white)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--space-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <FileText size={24} style={{ color: 'var(--error)' }} />
                  <div>
                    <p style={{ margin: 0, fontWeight: '500', fontSize: '0.95rem' }}>{file.name}</p>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="btn btn-danger btn-sm"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sent Date */}
      <div className="form-group">
        <label className="form-label">
          <Calendar size={18} />
          Sent Date
        </label>
        <input
          type="date"
          name="sentDate"
          className="form-input"
          value={formData.sentDate}
          onChange={handleInputChange}
        />
      </div>

      {/* Action Buttons */}
      <div className="button-group">
        <button
          onClick={openGmailAndSave}
          className="btn btn-primary btn-lg"
          disabled={loading || !formData.to.length || !formData.subject.trim()}
        >
          {loading ? <InlineLoading /> : <Send size={18} />}
          Open in Gmail & Save
        </button>

        <button
          onClick={saveEmailRecord}
          className="btn btn-success btn-lg"
          disabled={loading || !formData.to.length || !formData.subject.trim()}
        >
          {loading ? <InlineLoading /> : <Save size={18} />}
          Save Record Only
        </button>

        <button
          onClick={clearForm}
          className="btn btn-secondary"
          disabled={loading}
        >
          <Trash2 size={18} />
          Clear Form
        </button>
      </div>

      <div style={{
        marginTop: 'var(--space-lg)',
        padding: 'var(--space-md)',
        background: 'var(--primary-ultralight)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--primary-light)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 'var(--space-sm)',
      }}>
        <Info size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          <strong style={{ color: 'var(--primary)' }}>Tip:</strong> You can type email addresses directly or use the Quick Select dropdown to choose from predefined contacts. Press Enter, comma, or Tab to add multiple emails.
        </div>
      </div>
    </div>
  );
};

export default ComposeEmail;
