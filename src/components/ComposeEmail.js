import React, { useState, useRef, useEffect } from "react";
import { supabase } from "../services/supabase";
import { showNotification } from "../utils/notifications";

const ComposeEmail = ({ onRecordSaved }) => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const [formData, setFormData] = useState({
    from: "",
    to: [],
    subject: "",
    content: "",
    pdfFiles: [],
    pdfFileNames: [],
    subjectHindi: "",
    contentHindi: "",
    sentDate: new Date().toISOString().split("T")[0],
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeFolder, setActiveFolder] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gmailLoggedIn, setGmailLoggedIn] = useState(false);
  const [gmailUser, setGmailUser] = useState("");

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

  // Check if user is logged into Gmail
  useEffect(() => {
    checkGmailLogin();
  }, []);

  const checkGmailLogin = () => {
    // Try to detect Gmail login status
    const gmailCheck = document.createElement('iframe');
    gmailCheck.src = 'https://mail.google.com/mail/u/0/';
    gmailCheck.style.display = 'none';
    document.body.appendChild(gmailCheck);

    gmailCheck.onload = () => {
      try {
        // If we can access the iframe content, user might be logged in
        const gmailDoc = gmailCheck.contentDocument || gmailCheck.contentWindow.document;
        const userElement = gmailDoc.querySelector('[email]');
        if (userElement) {
          const email = userElement.getAttribute('email');
          setGmailUser(email);
          setFormData(prev => ({ ...prev, from: email }));
          setGmailLoggedIn(true);
          showNotification(`Auto-detected Gmail: ${email}`, "success");
        } else {
          setGmailLoggedIn(false);
          setFormData(prev => ({ ...prev, from: "" }));
        }
      } catch (error) {
        // Cross-origin restriction - use alternative method
        detectGmailAlternative();
      }
      document.body.removeChild(gmailCheck);
    };

    gmailCheck.onerror = () => {
      detectGmailAlternative();
      document.body.removeChild(gmailCheck);
    };
  };

  const detectGmailAlternative = () => {
    // Alternative method: Check for Gmail cookies or localStorage
    const hasGmailCookie = document.cookie.includes('GMAIL') || 
                          document.cookie.includes('gmail') ||
                          document.cookie.includes('google');
    
    if (hasGmailCookie) {
      setGmailLoggedIn(true);
      setFormData(prev => ({ ...prev, from: "your-gmail@gmail.com" }));
      showNotification("Gmail detected. Email will be sent from your logged-in account.", "info");
    } else {
      setGmailLoggedIn(false);
      setFormData(prev => ({ ...prev, from: "" }));
      showNotification("Please log into Gmail for automatic sender detection", "warning");
    }
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

  // --- Translate to Hindi ---
  const translateToHindi = async () => {
    if (!formData.subject && !formData.content) {
      showNotification("Enter subject or content to translate", "warning");
      return;
    }
    
    setTranslating(true);
    
    try {
      // First try your backend API
      if (backendUrl) {
        const resp = await fetch(`${backendUrl}/api/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            text: `${formData.subject}\n\n${formData.content}`.trim(), 
            target: "hi" 
          }),
        });
        
        if (resp.ok) {
          const data = await resp.json();
          const parts = (data.translatedText || "").split("\n\n");
          setFormData((prev) => ({
            ...prev,
            subjectHindi: parts[0] || "",
            contentHindi: parts.slice(1).join("\n\n") || "",
          }));
          showNotification("Translated to Hindi successfully!", "success");
          setTranslating(false);
          return;
        }
      }

      // Fallback to Google Translate API (free tier)
      await translateWithGoogleAPI();
      
    } catch (err) {
      console.error("Translation error:", err);
      // Ultimate fallback - simple transliteration
      setFormData((prev) => ({
        ...prev,
        subjectHindi: simpleTransliteration(formData.subject || ""),
        contentHindi: simpleTransliteration(formData.content || ""),
      }));
      showNotification("Used fallback transliteration", "info");
      setTranslating(false);
    }
  };

  const translateWithGoogleAPI = async () => {
    // Using Google Translate API (free but limited)
    const textToTranslate = `${formData.subject}\n\n${formData.content}`.trim();
    
    try {
      // This is a simple approach - you might want to use a proper translation service
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(textToTranslate)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const translatedText = data[0].map(item => item[0]).join('');
        const parts = translatedText.split('\n\n');
        
        setFormData((prev) => ({
          ...prev,
          subjectHindi: parts[0] || "",
          contentHindi: parts.slice(1).join('\n\n') || "",
        }));
        showNotification("Translated to Hindi using Google API!", "success");
      } else {
        throw new Error('Google API failed');
      }
    } catch (error) {
      throw error; // Re-throw to trigger fallback
    } finally {
      setTranslating(false);
    }
  };

  const simpleTransliteration = (text) => {
    if (!text) return "";
    // Basic English to Hindi mapping for common words
    const transliterationMap = {
      'hello': 'नमस्ते',
      'email': 'ईमेल', 
      'message': 'संदेश',
      'thank you': 'धन्यवाद',
      'dear': 'प्रिय',
      'sir': 'महोदय',
      'madam': 'महोदया',
      'regards': 'सादर',
      'hello': 'नमस्कार',
      'good morning': 'शुभ प्रभात',
      'good afternoon': 'शुभ अपराह्न',
      'good evening': 'शुभ संध्या',
      'please': 'कृपया',
      'request': 'निवेदन',
      'information': 'जानकारी',
      'document': 'दस्तावेज़',
      'important': 'महत्वपूर्ण',
      'meeting': 'बैठक',
      'college': 'कॉलेज',
      'university': 'विश्वविद्यालय',
      'student': 'छात्र',
      'faculty': 'संकाय',
      'department': 'विभाग'
    };

    let translated = text;
    
    // Replace common phrases
    Object.entries(transliterationMap).forEach(([english, hindi]) => {
      const regex = new RegExp(`\\b${english}\\b`, 'gi');
      translated = translated.replace(regex, hindi);
    });

    return translated === text ? `[Hindi Translation] ${text}` : translated;
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

  // --- Open Gmail & Save ---
  const openGmailAndSave = async () => {
    if (!formData.to.length) {
      showNotification("Please add at least one recipient", "error");
      return;
    }

    // Construct Gmail URL with all recipients and content
    const toEmails = formData.to.join(',');
    const subject = formData.subject || '';
    const body = formData.content || '';
    
    // Gmail URL structure that will use the logged-in user's account
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(toEmails)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open Gmail in new tab
    const gmailWindow = window.open(gmailUrl, '_blank');
    
    if (gmailWindow) {
      showNotification("Opening Gmail with your email content...", "success");
      
      // Save the record after a short delay
      setTimeout(async () => {
        await saveEmailRecord();
      }, 1000);
    } else {
      showNotification("Please allow popups for Gmail to open", "error");
    }
  };

  const handleLoginGmail = () => {
    window.open('https://mail.google.com', '_blank');
    setTimeout(() => {
      checkGmailLogin();
    }, 2000);
  };

  return (
    <div className="page active">
      <h2 className="page-title">Compose Professional Email</h2>
      <div className="card">
        {/* From - Auto-detected Gmail */}
        <div className="form-group">
          <label>From Email</label>
          <div className="gmail-detection-area">
            {gmailLoggedIn ? (
              <div className="gmail-detected">
                <i className="fab fa-google"></i>
                <span className="gmail-email">{formData.from}</span>
                <span className="gmail-status">✓ Gmail detected</span>
                <button 
                  type="button" 
                  className="refresh-gmail-btn"
                  onClick={checkGmailLogin}
                  title="Refresh Gmail detection"
                >
                  <i className="fas fa-sync-alt"></i>
                </button>
              </div>
            ) : (
              <div className="gmail-not-detected">
                <i className="fab fa-google"></i>
                <span>Gmail not detected</span>
                <button 
                  type="button" 
                  className="login-gmail-btn"
                  onClick={handleLoginGmail}
                >
                  <i className="fas fa-sign-in-alt"></i>
                  Login to Gmail
                </button>
                <div className="manual-email-input">
                  <input 
                    type="email" 
                    name="from" 
                    value={formData.from} 
                    onChange={handleInputChange} 
                    placeholder="Or enter your email manually..." 
                    className="form-input"
                  />
                </div>
              </div>
            )}
          </div>
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

        {/* Subject & Content */}
        <div className="form-group">
          <label>Subject</label>
          <input 
            type="text" 
            name="subject" 
            value={formData.subject} 
            onChange={handleInputChange} 
            placeholder="Email subject..." 
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label>Email Content</label>
          <textarea 
            name="content" 
            value={formData.content} 
            onChange={handleInputChange} 
            rows={6} 
            placeholder="Write your email content here..."
            className="form-textarea"
          />
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
            onClick={translateToHindi} 
            disabled={translating}
            className="translate-btn"
          >
            <i className="fas fa-language"></i>
            {translating ? "Translating..." : "Translate to Hindi"}
          </button>
          <button 
            type="button"
            onClick={openGmailAndSave} 
            disabled={loading || !gmailLoggedIn}
            className="primary-btn"
            title={!gmailLoggedIn ? "Please log into Gmail first" : "Open in Gmail and save record"}
          >
            <i className="fab fa-google"></i>
            {gmailLoggedIn ? "Open in Gmail & Save" : "Login to Gmail First"}
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

        {/* Hindi Translation Result */}
        {(formData.subjectHindi || formData.contentHindi) && (
          <div className="translated-box">
            <h4>
              <i className="fas fa-language"></i>
              Hindi Translation
            </h4>
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
      </div>
    </div>
  );
};

export default ComposeEmail;
