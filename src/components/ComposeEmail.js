import React, { useState, useRef } from "react";
import { supabase } from "../services/supabase";
import { showNotification } from "../utils/notifications";

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
  const [showTranslation, setShowTranslation] = useState({ 
    hindi: { subject: false, content: false }, 
    marathi: { subject: false, content: false } 
  });

  const fileInputRef = useRef(null);
  const toInputRef = useRef(null);

  const emailOptions = {
    Principal: ["Principal-1@kkwagh.edu.in"],
    HOD: [
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

  // --- Input handlers ---
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

  // --- PDF Upload ---
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
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

  // --- Translation Logic ---
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
      // Using MyMemory Translation API (free)
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
      
      setShowTranslation(prev => ({ 
        ...prev, 
        [language]: { ...prev[language], [type]: true } 
      }));
      
      showNotification(`${language.charAt(0).toUpperCase() + language.slice(1)} translation successful`, 'success');
    } catch (error) {
      console.error('Translation error:', error);
      
      // Fallback to simple transliteration if API fails
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
      
      setShowTranslation(prev => ({ 
        ...prev, 
        [language]: { ...prev[language], [type]: true } 
      }));
      
      showNotification('Used fallback transliteration', 'info');
    } finally {
      setTranslating(prev => ({ 
        ...prev, 
        [language]: { ...prev[language], [type]: false } 
      }));
    }
  };

  // Simple fallback transliteration function for common words
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
      'project': 'परियोजना',
      'report': 'रिपोर्ट',
      'deadline': 'अंतिम तिथि',
      'approval': 'अनुमोदन',
      'review': 'समीक्षा',
      'update': 'अद्यतन',
      'information': 'जानकारी',
      'please': 'कृपया',
      'kindly': 'कृपया',
      'regards': 'शुभकामनाएं',
      'sincerely': 'भवदीय',
      'dear': 'प्रिय',
      'hello': 'नमस्कार',
      'good morning': 'शुभ प्रभात',
      'good afternoon': 'शुभ अपराह्न',
      'good evening': 'शुभ संध्या',
      'welcome': 'स्वागत है',
      'congratulations': 'बधाई हो',
      'sorry': 'क्षमा करें',
      'help': 'मदद',
      'support': 'सहायता',
      'question': 'प्रश्न',
      'answer': 'उत्तर',
      'problem': 'समस्या',
      'solution': 'समाधान',
      'team': 'टीम',
      'company': 'कंपनी',
      'office': 'कार्यालय',
      'work': 'काम',
      'job': 'नौकरी',
      'salary': 'वेतन',
      'invoice': 'चालान',
      'payment': 'भुगतान',
      'bank': 'बैंक',
      'account': 'खाता',
      'number': 'संख्या',
      'date': 'तारीख',
      'time': 'समय',
      'day': 'दिन',
      'week': 'सप्ताह',
      'month': 'महीना',
      'year': 'वर्ष',
      'today': 'आज',
      'tomorrow': 'कल',
      'yesterday': 'कल'
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
      'project': 'प्रकल्प',
      'report': 'अहवाल',
      'deadline': 'अंतिम मुदत',
      'approval': 'मंजुरी',
      'review': 'पुनरावलोकन',
      'update': 'अद्ययावत',
      'information': 'माहिती',
      'please': 'कृपया',
      'kindly': 'कृपया',
      'regards': 'शुभेच्छा',
      'sincerely': 'विनम्र',
      'dear': 'प्रिय',
      'hello': 'नमस्कार',
      'good morning': 'शुभ प्रभात',
      'good afternoon': 'शुभ दुपार',
      'good evening': 'शुभ संध्या',
      'welcome': 'स्वागत आहे',
      'congratulations': 'अभिनंदन',
      'sorry': 'माफ करा',
      'help': 'मदत',
      'support': 'आधार',
      'question': 'प्रश्न',
      'answer': 'उत्तर',
      'problem': 'समस्या',
      'solution': 'उपाय',
      'team': 'संघ',
      'company': 'कंपनी',
      'office': 'कार्यालय',
      'work': 'काम',
      'job': 'नोकरी',
      'salary': 'पगार',
      'invoice': 'चलन',
      'payment': 'पेमेंट',
      'bank': 'बँक',
      'account': 'खाते',
      'number': 'क्रमांक',
      'date': 'तारीख',
      'time': 'वेळ',
      'day': 'दिवस',
      'week': 'आठवडा',
      'month': 'महिना',
      'year': 'वर्ष',
      'today': 'आज',
      'tomorrow': 'उद्या',
      'yesterday': 'काल'
    };

    const translationMap = language === 'hindi' ? hindiMap : marathiMap;
    let translated = text;
    
    // Replace common phrases (case insensitive)
    Object.entries(translationMap).forEach(([english, translatedWord]) => {
      const regex = new RegExp(`\\b${english}\\b`, 'gi');
      translated = translated.replace(regex, translatedWord);
    });

    return translated !== text ? translated : `${language === 'hindi' ? 'हिंदी' : 'मराठी'} अनुवाद: ` + text;
  };

  // --- Save record ---
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
      
      // Reset form but keep From email
      setFormData({
        from: formData.from, // Keep the from email
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
      
      setShowTranslation({ 
        hindi: { subject: false, content: false }, 
        marathi: { subject: false, content: false } 
      });
      
      if (onRecordSaved) onRecordSaved(insertedRow);
    } catch (err) {
      console.error("Error saving email record:", err);
      showNotification("Failed to save email record", "error");
    } finally {
      setLoading(false);
    }
  };

  // --- Open Gmail & Save ---
  const openGmailAndSave = async () => {
    if (!formData.to.length) {
      showNotification("Please add at least one recipient", "error");
      return;
    }

    // Construct Gmail URL with all recipients and content including translations
    const toEmails = formData.to.join(',');
    const subject = formData.subject || '';
    let body = formData.content || '';
    
    // Add translations to the email body
    if (formData.contentHindi || formData.contentMarathi) {
      body += '\n\n--- Translations ---\n';
      
      if (formData.contentHindi) {
        body += `\nHindi:\n${formData.contentHindi}\n`;
      }
      
      if (formData.contentMarathi) {
        body += `\nMarathi:\n${formData.contentMarathi}\n`;
      }
    }
    
    // Gmail URL structure
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(toEmails)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open Gmail in new tab
    const gmailWindow = window.open(gmailUrl, '_blank');
    
    if (gmailWindow) {
      showNotification("Opening Gmail with your email content and translations...", "success");
      
      // Save the record after a short delay
      setTimeout(async () => {
        await saveEmailRecord();
      }, 1000);
    } else {
      showNotification("Please allow popups for Gmail to open", "error");
    }
  };

  return (
    <div className="page active">
      <h2 className="page-title">Compose Professional Email</h2>
      <div className="card">
        {/* From - Simple manual input */}
        <div className="form-group">
          <label>From Email</label>
          <input 
            type="email" 
            name="from" 
            value={formData.from} 
            onChange={handleInputChange} 
            placeholder="your-email@domain.com" 
            className="form-input"
          />
        </div>

        {/* To - Multiple recipients with dropdown */}
        <div className="form-group">
          <label>To Recipients</label>
          <div className="email-input-container">
            <div className="selected-emails">
              {formData.to.map((email) => (
                <span key={email} className="email-chip">
                  {email} 
                  <button type="button" onClick={() => removeEmail(email)}>×</button>
                </span>
              ))}
              <input 
                ref={toInputRef}
                type="text" 
                className="email-input" 
                placeholder="Type email and press Enter, or select from dropdown..." 
                onKeyDown={handleManualEmailInput}
                onBlur={(e) => {
                  // Add email when input loses focus if there's content
                  if (e.target.value.trim() && isValidEmail(e.target.value.trim())) {
                    addEmail(e.target.value.trim());
                    e.target.value = "";
                  }
                }}
              />
              <button type="button" className="dropdown-btn" onClick={toggleDropdown}>
                <i className="fas fa-chevron-down"></i>
              </button>
            </div>

            {dropdownOpen && (
              <div className="dropdown-menu">
                {!activeFolder ? (
                  <>
                    <div className="dropdown-title">
                      Select Recipient Group
                    </div>
                    {Object.keys(emailOptions).map((folder) => (
                      <div key={folder} className="dropdown-item folder" onClick={() => setActiveFolder(folder)}>
                        <i className="fas fa-folder"></i> {folder} 
                        <span className="folder-count">({emailOptions[folder].length})</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div className="dropdown-title">
                      <button className="back-btn" onClick={() => setActiveFolder(null)}>
                        <i className="fas fa-arrow-left"></i> Back
                      </button>
                      {activeFolder}
                    </div>
                    {emailOptions[activeFolder].map((email) => (
                      <div key={email} className="dropdown-item" onClick={() => addEmail(email)}>
                        <i className="fas fa-envelope"></i> {email}
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
          <div className="email-hint">
            💡 Add multiple recipients by typing emails and pressing Enter, or select from groups above
          </div>
        </div>

        {/* Subject with Translation Buttons */}
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
                disabled={translating.hindi.subject}
                className="translate-btn hindi-btn"
              >
                <i className="fas fa-language"></i>
                {translating.hindi.subject ? "..." : "Hindi"}
              </button>
              <button 
                type="button"
                onClick={() => translateText(formData.subject, 'subject', 'marathi')}
                disabled={translating.marathi.subject}
                className="translate-btn marathi-btn"
              >
                <i className="fas fa-language"></i>
                {translating.marathi.subject ? "..." : "Marathi"}
              </button>
            </div>
          </div>
        </div>

        {/* Content with Translation Buttons */}
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
                disabled={translating.hindi.content}
                className="translate-btn hindi-btn"
              >
                <i className="fas fa-language"></i>
                {translating.hindi.content ? "..." : "Hindi"}
              </button>
              <button 
                type="button"
                onClick={() => translateText(formData.content, 'content', 'marathi')}
                disabled={translating.marathi.content}
                className="translate-btn marathi-btn"
              >
                <i className="fas fa-language"></i>
                {translating.marathi.content ? "..." : "Marathi"}
              </button>
            </div>
          </div>
        </div>
        
        <div className="form-group">
          <label>Sent Date</label>
          <input 
            type="date" 
            name="sentDate" 
            value={formData.sentDate} 
            onChange={handleInputChange} 
            className="form-input"
          />
        </div>

        {/* PDF Upload */}
        <div className="form-group">
          <label>Attach PDF Files</label>
          <div className="file-upload-area">
            <input 
              ref={fileInputRef} 
              type="file" 
              accept=".pdf" 
              multiple 
              onChange={handleFileUpload} 
              style={{ display: 'none' }}
            />
            <button 
              type="button" 
              className="file-upload-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <i className="fas fa-cloud-upload-alt"></i>
              Choose PDF Files
            </button>
            <div className="file-upload-hint">
              Maximum 40MB per file. You'll need to attach these manually in Gmail.
            </div>
            {formData.pdfFiles.length > 0 && (
              <div className="file-list">
                <p><strong>Files to attach in Gmail:</strong></p>
                <ul>
                  {formData.pdfFiles.map((f, i) => (
                    <li key={i}>
                      <i className="fas fa-file-pdf"></i> {f.name} 
                      <span className="file-size">({(f.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="actions">
          <button 
            type="button"
            onClick={openGmailAndSave} 
            disabled={loading}
            className="primary-btn"
          >
            <i className="fab fa-google"></i>
            Open in Gmail & Save
          </button>
          <button 
            type="button"
            onClick={saveEmailRecord} 
            disabled={loading}
            className="secondary-btn"
          >
            <i className="fas fa-save"></i>
            Save Only
          </button>
        </div>

        {/* Translation Results */}
        {(formData.subjectHindi || formData.contentHindi || formData.subjectMarathi || formData.contentMarathi) && (
          <div className="translated-box">
            <h4>
              <i className="fas fa-language"></i>
              Translations
            </h4>
            
            {/* Hindi Translations */}
            {(formData.subjectHindi || formData.contentHindi) && (
              <div className="language-section">
                <h5>Hindi</h5>
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
            
            {/* Marathi Translations */}
            {(formData.subjectMarathi || formData.contentMarathi) && (
              <div className="language-section">
                <h5>Marathi</h5>
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

export default ComposeEmail;
