import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../services/supabase";
import { showNotification } from "../utils/notifications";
import { 
  Mail, 
  Send, 
  Save, 
  Upload, 
  FileText, 
  ChevronDown, 
  Folder, 
  ArrowLeft, 
  X,
  Languages,
  User,
  Calendar
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

  const fileInputRef = useRef(null);
  const toInputRef = useRef(null);
  const dropdownRef = useRef(null);

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

  const emailOptions = {
    Principal: ["Principal-1@kkwagh.edu.in"],
    HOD: [
      "hrishikeshgavai@gmail.com",
      "dkpatil370123@kkwagh.edu.in",
      "dapagar370123@kkwagh.edu.in",
      "dhruveshpatil7777@gmail.com",
      "nakshatrarao48@gmail.com",
      "pmlokwani370123@kkwagh.edu.in",
      "hagavai370123@kkwagh.edu.in",
      "ranjit.pawar5142@gmail.com",
    ],
    Dean: [
      "Dean-1@kkwagh.edu.in",
      "Dean-2@kkwagh.edu.in",
      "Dean-3@kkwagh.edu.in",
      "Dean-4@kkwagh.edu.in",
      "Dean-5@kkwagh.edu.in",
      "Dean-6@kkwagh.edu.in",
      "Dean-7@kkwagh.edu.in",
    ],
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleManualEmailInput = (e) => {
    if (e.key === "Enter" || e.key === "," || e.key === "Tab") {
      e.preventDefault();
      const newEmail = e.target.value.trim().replace(/[,;\s]+$/, "");
      if (newEmail && isValidEmail(newEmail) && !formData.to.includes(newEmail)) {
        setFormData((prev) => ({ ...prev, to: [...prev.to, newEmail] }));
        e.target.value = "";
      } else if (newEmail && !isValidEmail(newEmail)) {
        showNotification("Please enter a valid email address", "error");
      }
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const addEmail = (email) => {
    if (!formData.to.includes(email)) {
      setFormData((prev) => ({ ...prev, to: [...prev.to, email] }));
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
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
    setActiveFolder(null);
  };

  const handleFileUpload = async (files) => {
    if (!files.length) return;

    for (let file of files) {
      try {
        if (file.size > 40 * 1024 * 1024) {
          showNotification(`${file.name}: exceeds 40MB`, "error");
          continue;
        }

        const fileName = `${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from("pdfs").upload(fileName, file);
        if (error) throw error;

        setFormData((prev) => ({
          ...prev,
          pdfFiles: [...prev.pdfFiles, file],
          pdfFileNames: [...prev.pdfFileNames, fileName],
        }));

        showNotification(`Uploaded: ${file.name}`, "success");
      } catch (err) {
        console.error("PDF upload error:", err);
        showNotification(`Failed to upload: ${file.name}`, "error");
      }
    }
  };

  const handleFileInputChange = (e) => {
    handleFileUpload(Array.from(e.target.files));
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
      
      showNotification(`${language.charAt(0).toUpperCase() + language.slice(1)} translation successful`, 'success');
    } catch (error) {
      console.error('Translation error:', error);
      
      const fallbackTranslation = simpleTransliteration(text, language);
      
      if (type === 'subject') {
        setFormData(prev => ({ 
          ...prev, 
          [`subject${language.charAt(0).toUpperCase() + language.slice(1)}`]: fallbackTranslation 
        }));
      } else {
        setFormData(prev => ({ 
          ...prev, 
          [`content${language.charAt(0).toUpperCase() + language.slice(1)}`]: fallbackTranslation 
        }));
      }
      
      showNotification('Used fallback transliteration', 'info');
    } finally {
      setTranslating(prev => ({ 
        ...prev, 
        [language]: { ...prev[language], [type]: false } 
      }));
    }
  };

  const simpleTransliteration = (text, language) => {
    const hindiMap = {
      'hello': 'नमस्ते',
      'email': 'ईमेल',
      'message': 'संदेश',
      'important': 'महत्वपूर्ण',
      'meeting': 'बैठक',
      'document': 'दस्तावेज़',
      'request': 'अनुरोध',
      'thank you': 'धन्यवाद',
      'urgent': 'अत्यावश्यक',
    };

    const marathiMap = {
      'hello': 'नमस्कार',
      'email': 'ईमेल',
      'message': 'संदेश',
      'important': 'महत्वाचे',
      'meeting': 'बैठक',
      'document': 'दस्तऐवज',
      'request': 'विनंती',
      'thank you': 'धन्यवाद',
      'urgent': 'तातडीचे',
    };

    const translationMap = language === 'hindi' ? hindiMap : marathiMap;
    let translated = text;
    
    Object.entries(translationMap).forEach(([english, translatedWord]) => {
      const regex = new RegExp(`\\b${english}\\b`, 'gi');
      translated = translated.replace(regex, translatedWord);
    });

    return translated !== text ? translated : `${language === 'hindi' ? 'हिंदी' : 'मराठी'} अनुवाद: ` + text;
  };

  const saveEmailRecord = async () => {
    if (!formData.to.length) {
      showNotification("Please add at least one recipient", "error");
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
      showNotification("Email record saved!", "success");
      
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

    const toEmails = formData.to.join(',');
    const subject = formData.subject || '';
    let body = formData.content || '';
    
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
      showNotification("Opening Gmail with your email content and translations...", "success");
      
      setTimeout(async () => {
        await saveEmailRecord();
      }, 1000);
    } else {
      showNotification("Please allow popups for Gmail to open", "error");
    }
  };

  return (
    <div className="page active">
      <h2 className="page-title">
        <Mail size={32} />
        Compose Professional Email
      </h2>
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
        </div>

        <div className="form-group">
          <label>
            <Mail size={18} />
            To Recipients
          </label>
          <div className="email-input-container" ref={dropdownRef}>
            <div className="selected-emails">
              {formData.to.map((email) => (
                <span key={email} className="email-chip">
                  {email} 
                  <button type="button" onClick={() => removeEmail(email)}>
                    <X size={14} />
                  </button>
                </span>
              ))}
              <input 
                ref={toInputRef}
                type="text" 
                className="email-input" 
                placeholder="Type email and press Enter, or select from dropdown..." 
                onKeyDown={handleManualEmailInput}
                onBlur={(e) => {
                  if (e.target.value.trim() && isValidEmail(e.target.value.trim())) {
                    addEmail(e.target.value.trim());
                    e.target.value = "";
                  }
                }}
              />
              <button type="button" className="dropdown-btn" onClick={toggleDropdown}>
                <ChevronDown size={20} />
              </button>
            </div>

            {dropdownOpen && (
              <div className="dropdown-menu">
                {!activeFolder ? (
                  <>
                    <div className="dropdown-item" style={{ fontWeight: '600', color: 'var(--text-primary)', borderBottom: '2px solid var(--border-medium)' }}>
                      Select Recipient Group
                    </div>
                    {Object.keys(emailOptions).map((folder) => (
                      <div key={folder} className="dropdown-item folder" onClick={() => setActiveFolder(folder)}>
                        <Folder size={16} />
                        {folder} 
                        <span className="folder-count">{emailOptions[folder].length}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <button className="back-btn" onClick={() => setActiveFolder(null)}>
                      <ArrowLeft size={16} />
                      Back to Groups
                    </button>
                    {emailOptions[activeFolder].map((email) => (
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
          <div className="email-hint">
            <Info size={16} />
            Add multiple recipients by typing emails and pressing Enter, or select from groups above
          </div>
        </div>

        <div className="form-group">
          <label>Subject</label>
          <div className="translation-controls">
            <input 
              type="text" 
              name="subject" 
              value={formData.subject} 
              onChange={handleInputChange} 
              placeholder="Email subject..." 
              className="form-input"
            />
            <div className="translation-buttons">
              <button 
                type="button"
                onClick={() => translateText(formData.subject, 'subject', 'hindi')}
                disabled={translating.hindi.subject || !formData.subject.trim()}
                className="translate-btn hindi-btn"
              >
                <Languages size={16} />
                {translating.hindi.subject ? "Translating..." : "Hindi"}
              </button>
              <button 
                type="button"
                onClick={() => translateText(formData.subject, 'subject', 'marathi')}
                disabled={translating.marathi.subject || !formData.subject.trim()}
                className="translate-btn marathi-btn"
              >
                <Languages size={16} />
                {translating.marathi.subject ? "Translating..." : "Marathi"}
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
              >
                <Languages size={16} />
                {translating.hindi.content ? "Translating..." : "Hindi"}
              </button>
              <button 
                type="button"
                onClick={() => translateText(formData.content, 'content', 'marathi')}
                disabled={translating.marathi.content || !formData.content.trim()}
                className="translate-btn marathi-btn"
              >
                <Languages size={16} />
                {translating.marathi.content ? "Translating..." : "Marathi"}
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
            className={`file-upload-area ${dragOver ? 'drag-over' : ''}`}
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
            <button 
              type="button" 
              className="file-upload-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={20} />
              Choose PDF Files
            </button>
            <div className="file-upload-hint">
              Maximum 40MB per file. Drag and drop files here or click to browse. You'll need to attach these manually in Gmail.
            </div>
            {formData.pdfFiles.length > 0 && (
              <div className="file-list">
                <p><strong>Files to attach in Gmail:</strong></p>
                <ul>
                  {formData.pdfFiles.map((f, i) => (
                    <li key={i}>
                      <FileText size={18} className="file-icon" />
                      {f.name} 
                      <span className="file-size">({(f.size / 1024 / 1024).toFixed(2)} MB)</span>
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
            disabled={loading || !formData.to.length}
            className="primary-btn"
          >
            <Send size={20} />
            {loading ? "Saving..." : "Open in Gmail & Save"}
          </button>
          <button 
            type="button"
            onClick={saveEmailRecord} 
            disabled={loading || !formData.to.length}
            className="secondary-btn"
          >
            <Save size={20} />
            {loading ? "Saving..." : "Save Only"}
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
                  Hindi
                </h5>
                {formData.subjectHindi && (
                  <div className="translated-item">
                    <strong>Subject:</strong> {formData.subjectHindi}
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
                  Marathi
                </h5>
                {formData.subjectMarathi && (
                  <div className="translated-item">
                    <strong>Subject:</strong> {formData.subjectMarathi}
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

// Add missing Info icon component
const Info = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

export default ComposeEmail;
