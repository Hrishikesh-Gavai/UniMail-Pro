import React, { useState } from 'react'
import { supabase } from '../services/supabase'
import { showNotification } from '../utils/notifications'

const ComposeEmail = () => {
  const [formData, setFormData] = useState({
    from: '',
    to: [], // 👈 changed to array (can hold multiple emails)
    date: new Date().toISOString().split('T')[0],
    subject: '',
    content: '',
    pdfFile: null
  })
  const [loading, setLoading] = useState(false)

  // Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState({ from: false, to: false })
  const [activeCategory, setActiveCategory] = useState({ from: null, to: null })

  // Predefined email groups
  const emailOptions = {
    Principal: ['Principal-1@kkwagh.edu.in'],
    HOD: [
      'dkpatil370123@kkwagh.edu.in',
      'palakmlokwani@gmail.com',
      'nakshatrarao48@gmail.com',
      'dhruveshpatil7777@gmail.com'
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

  // ================== Handlers ==================
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = (e) => {
    setFormData(prev => ({ ...prev, pdfFile: e.target.files[0] }))
  }

  const toggleDropdown = (field) => {
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
        date: new Date().toISOString().split('T')[0],
        subject: '',
        content: '',
        pdfFile: null
      })
    } catch (err) {
      showNotification(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

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
                </div>
              )}
            </div>
          </div>

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
          </button>
        </form>
      </div>
    </div>
  )
}

export default ComposeEmail
