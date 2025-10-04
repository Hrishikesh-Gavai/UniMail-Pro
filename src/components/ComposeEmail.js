import React, { useState } from 'react'
import { supabase } from '../services/supabase'
import { showNotification } from '../utils/notifications'

const ComposeEmail = () => {
  const [formData, setFormData] = useState({
    from: '',
<<<<<<< HEAD
    to: '',
=======
    to: [], // 👈 changed to array (can hold multiple emails)
>>>>>>> f4af213 (Mail automation and integration done successfully)
    date: new Date().toISOString().split('T')[0],
    subject: '',
    content: '',
    pdfFile: null
  })
<<<<<<< HEAD
  const [subjectHindi, setSubjectHindi] = useState('')
  const [contentHindi, setContentHindi] = useState('')
  const [showHindi, setShowHindi] = useState({ subject: false, content: false })
  const [loading, setLoading] = useState(false)
  const [translating, setTranslating] = useState({ subject: false, content: false })
  const [showDropdown, setShowDropdown] = useState({ from: false, to: false })
  const [activeCategory, setActiveCategory] = useState({ from: null, to: null })

  // Email options data
  const emailOptions = {
    Principal: ['Principal-1@kkwagh.edu.in'],
    HOD: [
      'HOD-1@kkwagh.edu.in',
      'HOD-2@kkwagh.edu.in',
      'HOD-3@kkwagh.edu.in',
      'HOD-4@kkwagh.edu.in',
      'HOD-5@kkwagh.edu.in',
      'HOD-6@kkwagh.edu.in',
      'HOD-7@kkwagh.edu.in'
=======
  const [loading, setLoading] = useState(false)

  // Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState({ from: false, to: false })
  const [activeCategory, setActiveCategory] = useState({ from: null, to: null })

  // Predefined email groups
  const emailOptions = {
    Principal: ['Principal-1@kkwagh.edu.in'],
    HOD: [
      'dkpatil370123@kkwagh.edu.in',
      'dapagar370123@kkwagh.edu.in',
      'dhruveshpatil7777@gmail.com'
>>>>>>> f4af213 (Mail automation and integration done successfully)
    ],
    Dean: [
      'Dean-1@kkwagh.edu.in',
      'Dean-2@kkwagh.edu.in',
      'Dean-3@kkwagh.edu.in',
      'Dean-4@kkwagh.edu.in',
      'Dean-5@kkwagh.edu.in',
      'Dean-6@kkwagh.edu.in',
      'Dean-7@kkwagh.edu.in'
    ]
  }

<<<<<<< HEAD
=======
  // ================== Handlers ==================
>>>>>>> f4af213 (Mail automation and integration done successfully)
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = (e) => {
    setFormData(prev => ({ ...prev, pdfFile: e.target.files[0] }))
  }

  const toggleDropdown = (field) => {
<<<<<<< HEAD
    setShowDropdown(prev => ({ 
      ...prev, 
      [field]: !prev[field] 
    }));
    setActiveCategory(prev => ({
      ...prev,
      [field]: null // Reset category when opening dropdown
    }));
  }

  const selectEmail = (field, email) => {
    setFormData(prev => ({ ...prev, [field]: email }))
    setShowDropdown(prev => ({ ...prev, [field]: false }))
    setActiveCategory(prev => ({
      ...prev,
      [field]: null
    }));
  }

  const selectCategory = (field, category) => {
    setActiveCategory(prev => ({
      ...prev,
      [field]: category
    }));
  }

  const translateText = async (text, type) => {
    if (!text.trim()) {
      showNotification('Please enter text to translate', 'warning')
      return
    }

    setTranslating(prev => ({ ...prev, [type]: true }))

    try {
      // Using MyMemory Translation API (free)
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|hi`
      )

      if (!response.ok) {
        throw new Error('Translation API request failed')
      }

      const data = await response.json()
      
      if (data.responseStatus !== 200) {
        throw new Error('Translation failed: ' + data.responseDetails)
      }

      const translatedText = data.responseData.translatedText

      if (type === 'subject') {
        setSubjectHindi(translatedText)
        setShowHindi(prev => ({ ...prev, subject: true }))
      } else {
        setContentHindi(translatedText)
        setShowHindi(prev => ({ ...prev, content: true }))
      }
      
      showNotification('Text translated successfully', 'success')
    } catch (error) {
      console.error('Translation error:', error)
      
      // Fallback to simple transliteration if API fails
      const fallbackTranslation = simpleTransliteration(text)
      
      if (type === 'subject') {
        setSubjectHindi(fallbackTranslation)
        setShowHindi(prev => ({ ...prev, subject: true }))
      } else {
        setContentHindi(fallbackTranslation)
        setShowHindi(prev => ({ ...prev, content: true }))
      }
      
      showNotification('Used fallback translation', 'info')
    } finally {
      setTranslating(prev => ({ ...prev, [type]: false }))
    }
  }

  // Simple fallback transliteration function for common words
  const simpleTransliteration = (text) => {
    const transliterationMap = {
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

    let translated = text;
    
    // Replace common phrases (case insensitive)
    Object.entries(transliterationMap).forEach(([english, hindi]) => {
      const regex = new RegExp(`\\b${english}\\b`, 'gi');
      translated = translated.replace(regex, hindi);
    });

    return translated !== text ? translated : 'हिंदी अनुवाद: ' + text;
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      let pdfFilename = null
      
      // Upload PDF if exists
      if (formData.pdfFile) {
        // Check file size (max 40MB)
        if (formData.pdfFile.size > 40 * 1024 * 1024) {
          throw new Error('File size exceeds 40MB limit')
        }
        
        const fileExt = formData.pdfFile.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('pdfs')
          .upload(fileName, formData.pdfFile)
        
        if (uploadError) {
          console.error('Upload error details:', uploadError)
          throw new Error(`File upload failed: ${uploadError.message}`)
        }
        
        pdfFilename = fileName
        console.log('File uploaded successfully:', uploadData)
      }
      
      // Save email record
      const { data, error: insertError } = await supabase
        .from('email_records')
        .insert({
          from_user: formData.from,
          to_user: formData.to,
          subject: formData.subject,
          content: formData.content,
          subject_hindi: subjectHindi,
          content_hindi: contentHindi,
          pdf_filename: pdfFilename,
          sent_date: formData.date
        })
        .select()
      
      if (insertError) {
        console.error('Insert error details:', insertError)
        throw new Error(`Database insert failed: ${insertError.message}`)
      }
      
      console.log('Record inserted successfully:', data)
      
      // Reset form
      setFormData({
        from: '',
        to: '',
=======
    setDropdownOpen(prev => ({ ...prev, [field]: !prev[field] }))
    setActiveCategory(prev => ({ ...prev, [field]: null }))
  }

  const selectCategory = (field, category) => {
    // 👇 if category selected, put all its emails in "to"
    if (field === "to") {
      setFormData(prev => ({ ...prev, to: emailOptions[category] }))
      setDropdownOpen(prev => ({ ...prev, [field]: false }))
      setActiveCategory(prev => ({ ...prev, [field]: null }))
    } else {
      setActiveCategory(prev => ({ ...prev, [field]: category }))
    }
  }

  const selectEmail = (field, email) => {
    if (field === "to") {
      setFormData(prev => ({ ...prev, to: [email] })) // single email as array
    } else {
      setFormData(prev => ({ ...prev, [field]: email }))
    }
    setDropdownOpen(prev => ({ ...prev, [field]: false }))
    setActiveCategory(prev => ({ ...prev, [field]: null }))
  }

  // ================== Submit Handler ==================
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let pdfUrl = null

      // ✅ Step 1: Upload PDF to Supabase
      if (formData.pdfFile) {
        if (formData.pdfFile.size > 40 * 1024 * 1024) {
          throw new Error('File size exceeds 40MB')
        }

        const ext = formData.pdfFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('pdfs')
          .upload(fileName, formData.pdfFile)

        if (uploadError) throw new Error(uploadError.message)

        const { data } = supabase.storage.from('pdfs').getPublicUrl(fileName)
        pdfUrl = data.publicUrl
      }

      // ✅ Step 2: Call backend API to send email
      const response = await fetch('http://localhost:5000/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: formData.from,
          to: formData.to, // 👈 now an array
          subject: formData.subject,
          content: formData.content,
          pdfUrl
        })
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Email sending failed')

      // ✅ Step 3: Save record in Supabase DB
      const { error: insertError } = await supabase.from('email_records').insert({
        from_user: formData.from,
        to_user: formData.to.join(", "), // store as string
        subject: formData.subject,
        content: formData.content,
        pdf_filename: pdfUrl,
        sent_date: formData.date
      })

      if (insertError) throw new Error(insertError.message)

      showNotification('✅ Email sent and saved successfully!', 'success')
      setFormData({
        from: '',
        to: [],
>>>>>>> f4af213 (Mail automation and integration done successfully)
        date: new Date().toISOString().split('T')[0],
        subject: '',
        content: '',
        pdfFile: null
      })
<<<<<<< HEAD
      setSubjectHindi('')
      setContentHindi('')
      setShowHindi({ subject: false, content: false })
      
      showNotification('Email sent and saved successfully!', 'success')
    } catch (error) {
      console.error('Error submitting form:', error)
      showNotification(`Failed to send email: ${error.message}`, 'error')
=======
    } catch (err) {
      showNotification(err.message, 'error')
>>>>>>> f4af213 (Mail automation and integration done successfully)
    } finally {
      setLoading(false)
    }
  }

<<<<<<< HEAD
  return (
    <div className="page active">
      <h2 className="page-title">Compose Professional Email</h2>
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          {/* From Field */}
          <div className="form-group">
            <label className="form-label">From</label>
            <div className="input-with-dropdown">
              <input
                type="email"
                className="form-input"
                name="from"
                value={formData.from}
                onChange={handleInputChange}
                placeholder="Enter sender's email address"
                required
              />
              <button 
                type="button" 
                className="dropdown-btn"
                onClick={() => toggleDropdown('from')}
              >
                <i className="fas fa-chevron-down"></i>
              </button>
              {showDropdown.from && (
                <div className="dropdown-menu">
                  <div className="dropdown-title">
                    {activeCategory.from ? `Select ${activeCategory.from} Email` : 'Select Category'}
                    {activeCategory.from && (
                      <button 
                        className="dropdown-back"
                        onClick={() => selectCategory('from', null)}
                      >
                        <i className="fas fa-arrow-left"></i> Back
                      </button>
                    )}
                  </div>
                  
                  {!activeCategory.from ? (
                    // Show categories
                    Object.keys(emailOptions).map(category => (
                      <div 
                        key={category} 
                        className="dropdown-item category-item"
                        onClick={() => selectCategory('from', category)}
                      >
                        <i className="fas fa-folder"></i> {category}
                        <span className="dropdown-arrow">▶</span>
                      </div>
                    ))
                  ) : (
                    // Show emails for selected category
                    emailOptions[activeCategory.from].map(email => (
                      <div 
                        key={email} 
                        className="dropdown-item email-item"
                        onClick={() => selectEmail('from', email)}
                      >
                        <i className="fas fa-envelope"></i> {email}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* To Field */}
          <div className="form-group">
            <label className="form-label">To</label>
            <div className="input-with-dropdown">
              <input
                type="email"
                className="form-input"
                name="to"
                value={formData.to}
                onChange={handleInputChange}
                placeholder="Enter recipient's email address"
                required
              />
              <button 
                type="button" 
                className="dropdown-btn"
                onClick={() => toggleDropdown('to')}
              >
                <i className="fas fa-chevron-down"></i>
              </button>
              {showDropdown.to && (
                <div className="dropdown-menu">
                  <div className="dropdown-title">
                    {activeCategory.to ? `Select ${activeCategory.to} Email` : 'Select Category'}
                    {activeCategory.to && (
                      <button 
                        className="dropdown-back"
                        onClick={() => selectCategory('to', null)}
                      >
                        <i className="fas fa-arrow-left"></i> Back
                      </button>
                    )}
                  </div>
                  
                  {!activeCategory.to ? (
                    // Show categories
                    Object.keys(emailOptions).map(category => (
                      <div 
                        key={category} 
                        className="dropdown-item category-item"
                        onClick={() => selectCategory('to', category)}
                      >
                        <i className="fas fa-folder"></i> {category}
                        <span className="dropdown-arrow">▶</span>
                      </div>
                    ))
                  ) : (
                    // Show emails for selected category
                    emailOptions[activeCategory.to].map(email => (
                      <div 
                        key={email} 
                        className="dropdown-item email-item"
                        onClick={() => selectEmail('to', email)}
                      >
                        <i className="fas fa-envelope"></i> {email}
                      </div>
                    ))
                  )}
=======
  // ================== UI ==================
  return (
    <div className="page active">
      <h2 className="page-title">Compose Professional Email</h2>
      <div className="card">
        <form onSubmit={handleSubmit}>
          {/* FROM */}
          <div className="form-group">
            <label>From</label>
            <input
              type="email"
              name="from"
              value={formData.from}
              onChange={handleInputChange}
              placeholder="Sender's email"
              required
            />
          </div>

          {/* TO */}
          <div className="form-group">
            <label>To</label>
            <div className="input-with-dropdown">
              <input
                type="text"
                name="to"
                value={formData.to.join(", ")} // show as comma separated
                readOnly
                placeholder="Select recipient(s)"
                required
              />
              <button type="button" onClick={() => toggleDropdown('to')}>▾</button>
              {dropdownOpen.to && (
                <div className="dropdown-menu">
                  {!activeCategory.to
                    ? Object.keys(emailOptions).map(cat => (
                      <div key={cat} onClick={() => selectCategory('to', cat)}>📁 {cat}</div>
                    ))
                    : emailOptions[activeCategory.to].map(email => (
                      <div key={email} onClick={() => selectEmail('to', email)}>✉ {email}</div>
                    ))}
                  {activeCategory.to && <button type="button" onClick={() => selectCategory('to', null)}>← Back</button>}
>>>>>>> f4af213 (Mail automation and integration done successfully)
                </div>
              )}
            </div>
          </div>

<<<<<<< HEAD
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input 
                type="date" 
                className="form-input" 
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Subject</label>
            <div className="translation-row">
              <input 
                type="text" 
                className="form-input" 
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Enter email subject..." 
                required 
              />
              <button 
                type="button" 
                className="translate-btn"
                onClick={() => translateText(formData.subject, 'subject')}
                disabled={translating.subject}
              >
                <i className="fas fa-language"></i> 
                {translating.subject ? 'Translating...' : 'Translate'}
              </button>
            </div>
            {showHindi.subject && (
              <div className="hindi-text">
                <strong>Hindi Translation:</strong> {subjectHindi}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Email Content</label>
            <div className="translation-row">
              <textarea 
                className="form-textarea" 
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Write your email content here..." 
                required 
              ></textarea>
              <button 
                type="button" 
                className="translate-btn"
                onClick={() => translateText(formData.content, 'content')}
                disabled={translating.content}
              >
                <i className="fas fa-language"></i> 
                {translating.content ? 'Translating...' : 'Translate'}
              </button>
            </div>
            {showHindi.content && (
              <div className="hindi-text">
                <strong>Hindi Translation:</strong> {contentHindi}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Upload PDF Attachment</label>
            <div 
              className="file-upload" 
              onClick={() => document.getElementById('pdfFile').click()}
            >
              <input 
                type="file" 
                id="pdfFile" 
                accept=".pdf" 
                onChange={handleFileUpload}
                style={{ display: 'none' }} 
              />
              <div className="file-upload-icon">
                <i className="fas fa-cloud-upload-alt"></i>
              </div>
              <div className="file-upload-text">
                {formData.pdfFile ? formData.pdfFile.name : 'Click to upload PDF or drag and drop'}
              </div>
              <div className="file-upload-subtext">Maximum file size: 40MB</div>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            <i className="fas fa-paper-plane"></i> {loading ? 'Recording...' : 'Record Email'}
=======
          {/* Date */}
          <div className="form-group">
            <label>Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
          </div>

          {/* Subject */}
          <div className="form-group">
            <label>Subject</label>
            <input type="text" name="subject" value={formData.subject} onChange={handleInputChange} required />
          </div>

          {/* Content */}
          <div className="form-group">
            <label>Content</label>
            <textarea name="content" value={formData.content} onChange={handleInputChange} required />
          </div>

          {/* PDF Upload */}
          <div className="form-group">
            <label>Upload PDF</label>
            <input type="file" accept=".pdf" onChange={handleFileUpload} />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Email'}
>>>>>>> f4af213 (Mail automation and integration done successfully)
          </button>
        </form>
      </div>
    </div>
  )
}

export default ComposeEmail
