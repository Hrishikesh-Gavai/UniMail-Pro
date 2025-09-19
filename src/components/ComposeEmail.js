import React, { useState } from 'react'
import { supabase } from '../services/supabase'
import { showNotification } from '../utils/notifications'

const ComposeEmail = () => {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: new Date().toISOString().split('T')[0],
    subject: '',
    content: '',
    pdfFile: null
  })
  const [subjectHindi, setSubjectHindi] = useState('')
  const [contentHindi, setContentHindi] = useState('')
  const [showHindi, setShowHindi] = useState({ subject: false, content: false })
  const [loading, setLoading] = useState(false)
  const [translating, setTranslating] = useState({ subject: false, content: false })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = (e) => {
    setFormData(prev => ({ ...prev, pdfFile: e.target.files[0] }))
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
      'this is a test': 'यह टेस्ट है'
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
        date: new Date().toISOString().split('T')[0],
        subject: '',
        content: '',
        pdfFile: null
      })
      setSubjectHindi('')
      setContentHindi('')
      setShowHindi({ subject: false, content: false })
      
      showNotification('Email sent and saved successfully!', 'success')
    } catch (error) {
      console.error('Error submitting form:', error)
      showNotification(`Failed to send email: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page active">
      <h2 className="page-title">Compose Professional Email</h2>
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          {/* From Field */}
          <div className="form-group">
            <label className="form-label">From</label>
            <input
              type="email"
              className="form-input"
              name="from"
              value={formData.from}
              onChange={handleInputChange}
              placeholder="Enter sender's email address"
              required
            />
          </div>

          {/* To Field */}
          <div className="form-group">
            <label className="form-label">To</label>
            <input
              type="email"
              className="form-input"
              name="to"
              value={formData.to}
              onChange={handleInputChange}
              placeholder="Enter recipient's email address"
              required
            />
          </div>

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
          </button>
        </form>
      </div>
    </div>
  )
}

export default ComposeEmail
