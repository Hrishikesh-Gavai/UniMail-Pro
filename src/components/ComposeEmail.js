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
  const [showDropdown, setShowDropdown] = useState({ from: false, to: false })
  const [activeCategory, setActiveCategory] = useState({ from: null, to: null })

  // Backend URL from env
  const backendUrl = import.meta.env.VITE_BACKEND_URL

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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = (e) => {
    setFormData(prev => ({ ...prev, pdfFile: e.target.files[0] }))
  }

  const toggleDropdown = (field) => {
    setShowDropdown(prev => ({ ...prev, [field]: !prev[field] }))
    setActiveCategory(prev => ({ ...prev, [field]: null }))
  }

  const selectEmail = (field, email) => {
    setFormData(prev => ({ ...prev, [field]: email }))
    setShowDropdown(prev => ({ ...prev, [field]: false }))
    setActiveCategory(prev => ({ ...prev, [field]: null }))
  }

  const selectCategory = (field, category) => {
    setActiveCategory(prev => ({ ...prev, [field]: category }))
  }

  // ✅ Updated translation using backend
  const translateText = async (text, type) => {
    if (!text.trim()) {
      showNotification('Please enter text to translate', 'warning')
      return
    }

    setTranslating(prev => ({ ...prev, [type]: true }))

    try {
      const response = await fetch(`${backendUrl}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, target: "hi" }) // Hindi
      })

      if (!response.ok) throw new Error('Translation API request failed')

      const data = await response.json()
      const translatedText = data.translatedText

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
      showNotification('Translation failed', 'error')
    } finally {
      setTranslating(prev => ({ ...prev, [type]: false }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let pdfFilename = null

      if (formData.pdfFile) {
        if (formData.pdfFile.size > 40 * 1024 * 1024) {
          throw new Error('File size exceeds 40MB limit')
        }

        const fileExt = formData.pdfFile.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('pdfs')
          .upload(fileName, formData.pdfFile)

        if (uploadError) throw new Error(`File upload failed: ${uploadError.message}`)

        pdfFilename = fileName
      }

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

      if (insertError) throw new Error(`Database insert failed: ${insertError.message}`)

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
              <button type="button" className="dropdown-btn" onClick={() => toggleDropdown('from')}>
                <i className="fas fa-chevron-down"></i>
              </button>
              {showDropdown.from && (
                <div className="dropdown-menu">
                  <div className="dropdown-title">
                    {activeCategory.from ? `Select ${activeCategory.from} Email` : 'Select Category'}
                    {activeCategory.from && (
                      <button className="dropdown-back" onClick={() => selectCategory('from', null)}>
                        <i className="fas fa-arrow-left"></i> Back
                      </button>
                    )}
                  </div>
                  {!activeCategory.from
                    ? Object.keys(emailOptions).map(category => (
                        <div key={category} className="dropdown-item category-item" onClick={() => selectCategory('from', category)}>
                          <i className="fas fa-folder"></i> {category}
                          <span className="dropdown-arrow">▶</span>
                        </div>
                      ))
                    : emailOptions[activeCategory.from].map(email => (
                        <div key={email} className="dropdown-item email-item" onClick={() => selectEmail('from', email)}>
                          <i className="fas fa-envelope"></i> {email}
                        </div>
                      ))}
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
              <button type="button" className="dropdown-btn" onClick={() => toggleDropdown('to')}>
                <i className="fas fa-chevron-down"></i>
              </button>
              {showDropdown.to && (
                <div className="dropdown-menu">
                  <div className="dropdown-title">
                    {activeCategory.to ? `Select ${activeCategory.to} Email` : 'Select Category'}
                    {activeCategory.to && (
                      <button className="dropdown-back" onClick={() => selectCategory('to', null)}>
                        <i className="fas fa-arrow-left"></i> Back
                      </button>
                    )}
                  </div>
                  {!activeCategory.to
                    ? Object.keys(emailOptions).map(category => (
                        <div key={category} className="dropdown-item category-item" onClick={() => selectCategory('to', category)}>
                          <i className="fas fa-folder"></i> {category}
                          <span className="dropdown-arrow">▶</span>
                        </div>
                      ))
                    : emailOptions[activeCategory.to].map(email => (
                        <div key={email} className="dropdown-item email-item" onClick={() => selectEmail('to', email)}>
                          <i className="fas fa-envelope"></i> {email}
                        </div>
                      ))}
                </div>
              )}
            </div>
          </div>

          {/* Date, Subject, Content, PDF, Submit */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" className="form-input" name="date" value={formData.date} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Subject</label>
            <div className="translation-row">
              <input type="text" className="form-input" name="subject" value={formData.subject} onChange={handleInputChange} placeholder="Enter email subject..." required />
              <button type="button" className="translate-btn" onClick={() => translateText(formData.subject, 'subject')} disabled={translating.subject}>
                <i className="fas fa-language"></i> {translating.subject ? 'Translating...' : 'Translate'}
              </button>
            </div>
            {showHindi.subject && <div className="hindi-text"><strong>Hindi Translation:</strong> {subjectHindi}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Email Content</label>
            <div className="translation-row">
              <textarea className="form-textarea" name="content" value={formData.content} onChange={handleInputChange} placeholder="Write your email content here..." required></textarea>
              <button type="button" className="translate-btn" onClick={() => translateText(formData.content, 'content')} disabled={translating.content}>
                <i className="fas fa-language"></i> {translating.content ? 'Translating...' : 'Translate'}
              </button>
            </div>
            {showHindi.content && <div className="hindi-text"><strong>Hindi Translation:</strong> {contentHindi}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Upload PDF Attachment</label>
            <div className="file-upload" onClick={() => document.getElementById('pdfFile').click()}>
              <input type="file" id="pdfFile" accept=".pdf" onChange={handleFileUpload} style={{ display: 'none' }} />
              <div className="file-upload-icon"><i className="fas fa-cloud-upload-alt"></i></div>
              <div className="file-upload-text">{formData.pdfFile ? formData.pdfFile.name : 'Click to upload PDF or drag and drop'}</div>
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
