import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../services/supabase";
import { showNotification, showPromiseNotification } from "../utils/notifications";
import { InlineLoading } from "./LoadingScreen"; // Add this import
import { 
  Mail, Send, Save, Upload, FileText, ChevronDown, Folder, 
  ArrowLeft, X, Languages, User, Calendar, Info, Trash2 
} from 'lucide-react';

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
        "Dean-1@kkwagh.edu.in", "Dean-2@kkwagh.edu.in", "Dean-3@kkwagh.edu.in",
        "Dean-4@kkwagh.edu.in", "Dean-5@kkwagh.edu.in", "Dean-6@kkwagh.edu.in", "Dean-7@kkwagh.edu.in",
      ]
    },
    "Department Heads": {
      "HOD": [
        "hrishikeshgavai@gmail.com", "dkpatil370123@kkwagh.edu.in", "dapagar370123@kkwagh.edu.in",
        "dhruveshpatil7777@gmail.com", "nakshatrarao48@gmail.com", "pmlokwani370123@kkwagh.edu.in",
        "hagavai370123@kkwagh.edu.in", "ranjit.pawar5142@gmail.com",
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

    // Use promise notification for file uploads
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

    // Use promise notification for translation
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

    // Use promise notification for the entire process
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
    <div className="page active">
      <div className="page-header">
        <h2 className="page-title">
          <Mail size={32} />
          Compose Professional Email
        </h2>
        <p className="page-subtitle">Create and send professional emails with multi-language support</p>
      </div>
      
      <div className="card">
        <div className="form-group">
          <label>
            <User size={18} />
            From Email
          </label>
          <input 
            type="email" 
            name="from" 
            value={formData.from} 
            onChange={handleInputChange} 
            placeholder="your-email@domain.com" 
            className="form-input"
          />
          <div className="form-hint">Your email address will be saved for future use</div>
        </div>

        <div className="form-group">
          <div className="form-label-row">
            <label>
              <Mail size={18} />
              To Recipients
            </label>
            {formData.to.length > 0 && (
              <button 
                type="button" 
                className="clear-all-btn"
                onClick={clearAllEmails}
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className="email-input-container" ref={dropdownRef}>
            <div className={`selected-emails ${formData.to.length > 0 ? 'has-emails' : ''}`}>
              {formData.to.map((email) => (
                <span key={email} className="email-chip">
                  {email} 
                  <button 
                    type="button" 
                    onClick={() => removeEmail(email)}
                    className="chip-remove"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
              <input 
                ref={toInputRef}
                type="text" 
                className="email-input" 
                placeholder={formData.to.length === 0 ? "Type email and press Enter, or select from dropdown..." : "Add more recipients..."}
                value={emailInput}
                onChange={handleEmailInputChange}
                onKeyDown={handleManualEmailInput}
                onBlur={(e) => {
                  if (emailInput.trim() && isValidEmail(emailInput.trim())) {
                    addEmail(emailInput.trim());
                    setEmailInput("");
                  }
                }}
              />
              <button 
                type="button" 
                className="dropdown-btn" 
                onClick={toggleDropdown}
                title="Select from email groups"
              >
                <ChevronDown size={20} />
              </button>
            </div>

            {dropdownOpen && (
              <div className="dropdown-menu">
                {!activeFolder ? (
                  <>
                    <div className="dropdown-header">
                      Select Recipient Group
                    </div>
                    {Object.entries(emailOptions).map(([category, groups]) => (
                      <div key={category} className="dropdown-category">
                        <div className="category-title">{category}</div>
                        {Object.entries(groups).map(([folder, emails]) => (
                          <div key={folder} className="dropdown-item folder" onClick={() => setActiveFolder({category, folder})}>
                            <Folder size={16} />
                            {folder} 
                            <span className="folder-count">{emails.length}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <button className="back-btn" onClick={() => setActiveFolder(null)}>
                      <ArrowLeft size={16} />
                      Back to Groups
                    </button>
                    <div className="dropdown-header">
                      {activeFolder.folder} ({emailOptions[activeFolder.category][activeFolder.folder].length})
                    </div>
                    {emailOptions[activeFolder.category][activeFolder.folder].map((email) => (
                      <div key={email} className="dropdown-item" onClick={() => addEmail(email)}>
                        <Mail size={16} />
                        {email}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
          <div className="form-hint">
            <Info size={16} />
            Add multiple recipients by typing emails and pressing Enter, or select from organized groups above
          </div>
        </div>

        <div className="form-group">
          <label>Email Subject</label>
          <div className="translation-controls">
            <input 
              type="text" 
              name="subject" 
              value={formData.subject} 
              onChange={handleInputChange} 
              placeholder="Enter email subject..." 
              className="form-input"
            />
            <div className="translation-buttons">
              <button 
                type="button"
                onClick={() => translateText(formData.subject, 'subject', 'hindi')}
                disabled={translating.hindi.subject || !formData.subject.trim()}
                className="translate-btn hindi-btn"
                title="Translate to Hindi"
              >
                {translating.hindi.subject ? (
                  <InlineLoading size="small" text="Translating..." />
                ) : (
                  <>
                    <Languages size={16} />
                    Hindi
                  </>
                )}
              </button>
              <button 
                type="button"
                onClick={() => translateText(formData.subject, 'subject', 'marathi')}
                disabled={translating.marathi.subject || !formData.subject.trim()}
                className="translate-btn marathi-btn"
                title="Translate to Marathi"
              >
                {translating.marathi.subject ? (
                  <InlineLoading size="small" text="Translating..." />
                ) : (
                  <>
                    <Languages size={16} />
                    Marathi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Email Content</label>
          <div className="translation-controls">
            <textarea 
              name="content" 
              value={formData.content} 
              onChange={handleInputChange} 
              rows={6} 
              placeholder="Write your email content here..."
              className="form-textarea"
            />
            <div className="translation-buttons">
              <button 
                type="button"
                onClick={() => translateText(formData.content, 'content', 'hindi')}
                disabled={translating.hindi.content || !formData.content.trim()}
                className="translate-btn hindi-btn"
                title="Translate to Hindi"
              >
                {translating.hindi.content ? (
                  <InlineLoading size="small" text="Translating..." />
                ) : (
                  <>
                    <Languages size={16} />
                    Hindi
                  </>
                )}
              </button>
              <button 
                type="button"
                onClick={() => translateText(formData.content, 'content', 'marathi')}
                disabled={translating.marathi.content || !formData.content.trim()}
                className="translate-btn marathi-btn"
                title="Translate to Marathi"
              >
                {translating.marathi.content ? (
                  <InlineLoading size="small" text="Translating..." />
                ) : (
                  <>
                    <Languages size={16} />
                    Marathi
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <label>
            <Calendar size={18} />
            Sent Date
          </label>
          <input 
            type="date" 
            name="sentDate" 
            value={formData.sentDate} 
            onChange={handleInputChange} 
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label>
            <FileText size={18} />
            Attach PDF Files
          </label>
          <div 
            className={`file-upload-area ${dragOver ? 'drag-over' : ''} ${formData.pdfFiles.length > 0 ? 'has-files' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input 
              ref={fileInputRef} 
              type="file" 
              accept=".pdf" 
              multiple 
              onChange={handleFileInputChange} 
              style={{ display: 'none' }}
            />
            <div className="upload-content">
              <FileText size={48} className="upload-icon" />
              <button 
                type="button" 
                className="file-upload-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={20} />
                Choose PDF Files
              </button>
              <div className="file-upload-hint">
                Drag and drop PDF files here or click to browse. Max 40MB per file.
              </div>
            </div>
            
            {formData.pdfFiles.length > 0 && (
              <div className="file-list">
                <div className="file-list-header">
                  <span>Files to attach in Gmail ({formData.pdfFiles.length})</span>
                </div>
                <ul>
                  {formData.pdfFiles.map((file, index) => (
                    <li key={index}>
                      <FileText size={18} className="file-icon" />
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                      <button 
                        type="button"
                        className="file-remove"
                        onClick={() => removeFile(index)}
                        title="Remove file"
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="actions">
          <button 
            type="button"
            onClick={openGmailAndSave} 
            disabled={loading || !formData.to.length || !formData.subject.trim()}
            className="primary-btn"
          >
            {loading ? (
              <InlineLoading size="medium" text="Processing..." />
            ) : (
              <>
                <Send size={20} />
                Open in Gmail & Save
              </>
            )}
          </button>
          <button 
            type="button"
            onClick={saveEmailRecord} 
            disabled={loading || !formData.to.length || !formData.subject.trim()}
            className="secondary-btn"
          >
            {loading ? (
              <InlineLoading size="medium" text="Saving..." />
            ) : (
              <>
                <Save size={20} />
                Save Record Only
              </>
            )}
          </button>
          <button 
            type="button"
            onClick={clearForm}
            disabled={loading}
            className="clear-btn"
          >
            <Trash2 size={20} />
            Clear Form
          </button>
        </div>

        {(formData.subjectHindi || formData.contentHindi || formData.subjectMarathi || formData.contentMarathi) && (
          <div className="translated-box">
            <h4>
              <Languages size={24} />
              Translations
            </h4>
            
            {(formData.subjectHindi || formData.contentHindi) && (
              <div className="language-section">
                <h5>
                  <Languages size={18} />
                  Hindi Translation
                </h5>
                {formData.subjectHindi && (
                  <div className="translated-item">
                    <strong>Subject:</strong>
                    <div className="hindi-content">{formData.subjectHindi}</div>
                  </div>
                )}
                {formData.contentHindi && (
                  <div className="translated-item">
                    <strong>Content:</strong>
                    <div className="hindi-content">{formData.contentHindi}</div>
                  </div>
                )}
              </div>
            )}
            
            {(formData.subjectMarathi || formData.contentMarathi) && (
              <div className="language-section">
                <h5>
                  <Languages size={18} />
                  Marathi Translation
                </h5>
                {formData.subjectMarathi && (
                  <div className="translated-item">
                    <strong>Subject:</strong>
                    <div className="marathi-content">{formData.subjectMarathi}</div>
                  </div>
                )}
                {formData.contentMarathi && (
                  <div className="translated-item">
                    <strong>Content:</strong>
                    <div className="marathi-content">{formData.contentMarathi}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComposeEmail;
