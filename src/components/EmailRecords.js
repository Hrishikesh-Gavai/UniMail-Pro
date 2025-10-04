import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../services/supabase'
import { showNotification } from '../utils/notifications'
import Modal from './Modal'
import * as XLSX from 'xlsx'

const EmailRecords = () => {
  const [emailRecords, setEmailRecords] = useState([])
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const modalRef = useRef(null)

  // Load email records on component mount
  useEffect(() => {
    loadEmailRecords()
  }, [])

  // Scroll to modal when it opens
  useEffect(() => {
    if (selectedEmail && modalRef.current) {
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        modalRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center'
        })
      }, 100)
    }
  }, [selectedEmail])

  const loadEmailRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('email_records')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setEmailRecords(data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error loading records:', error)
      showNotification('Failed to load records', 'error')
      setLoading(false)
    }
  }

  const downloadPdf = async (filename) => {
    try {
      const { data, error } = await supabase.storage
        .from('pdfs')
        .download(filename)
      
      if (error) throw error
      
      // Create a blob URL and trigger download
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      showNotification('PDF downloaded successfully', 'success')
    } catch (error) {
      console.error('Error downloading PDF:', error)
      showNotification('Failed to download PDF', 'error')
    }
  }

const downloadExcel = async () => {
  try {
    if (emailRecords.length === 0) {
      showNotification('No records to download', 'warning')
      return
    }

    // First, get public URLs for all PDFs
    const recordsWithUrls = await Promise.all(
      emailRecords.map(async (record) => {
        if (record.pdf_filename) {
          const { data: { publicUrl } } = supabase.storage
            .from('pdfs')
            .getPublicUrl(record.pdf_filename);
          return { ...record, pdfUrl: publicUrl };
        }
        return { ...record, pdfUrl: null };
      })
    );

    // Prepare data for Excel
    const excelData = recordsWithUrls.map(record => ({
      'From': record.from_user,
      'To': record.to_user,
      'Date': new Date(record.sent_date).toLocaleDateString(),
      'Subject': record.subject,
      'Content': record.content,
      'Subject (Hindi)': record.subject_hindi || '',
      'Content (Hindi)': record.content_hindi || '',
      'PDF Attachment': record.pdf_filename ? 'Available' : 'No Attachment',
      'Created At': new Date(record.created_at).toLocaleString()
    }))

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(excelData)
    
    // Add hyperlinks to the worksheet
    recordsWithUrls.forEach((record, index) => {
      if (record.pdfUrl) {
        // PDF Attachment is in column H (8th column, index 7)
        const cellAddress = XLSX.utils.encode_cell({ r: index + 1, c: 7 });
        
        // Create a cell object with the hyperlink
        if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
        worksheet[cellAddress].l = { Target: record.pdfUrl, Tooltip: 'Click to download PDF' };
        worksheet[cellAddress].v = '🔗 Download PDF';
        
      }
    });

    // Set column widths for better readability
    const columnWidths = [
      { wch: 25 }, // From
      { wch: 25 }, // To
      { wch: 15 }, // Date
      { wch: 40 }, // Subject
      { wch: 50 }, // Content
      { wch: 40 }, // Subject (Hindi)
      { wch: 50 }, // Content (Hindi)
      { wch: 20 }, // PDF Attachment
      { wch: 20 }  // Created At
    ]
    worksheet['!cols'] = columnWidths

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Email Records')
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    
    // Create download link
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `email-records-${new Date().toISOString().split('T')[0]}.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    showNotification('Excel file downloaded with PDF links!', 'success')
  } catch (error) {
    console.error('Error generating Excel:', error)
    showNotification('Failed to generate Excel file', 'error')
  }
}

  const handleViewClick = (record) => {
    setSelectedEmail(record)
  }

  const handleCloseModal = () => {
    setSelectedEmail(null)
  }

  const filteredRecords = emailRecords.filter(record => {
    const matchesSearch = 
      record.from_user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.to_user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.content.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDate = dateFilter ? 
      record.sent_date === dateFilter : true
    
    return matchesSearch && matchesDate
  })

  if (loading) {
    return (
      <div className="page active">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading email records...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page active">
      <div className="records-header">
        <h2 className="page-title">Email Records</h2>
        <button className="download-btn" onClick={downloadExcel}>
          <i className="fas fa-download"></i> Download Excel For Detailed Records
        </button>
      </div>

      <div className="card">
        <div className="filters">
          <div className="search-box">
            <i className="fas fa-search search-icon"></i>
            <input 
              type="text" 
              className="form-input search-input" 
              placeholder="Search emails..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <input 
            type="date" 
            className="form-input" 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table className="records-table">
            <thead>
              <tr>
                <th>From</th>
                <th>To</th>
                <th>Subject</th>
                <th>Date</th>
                <th>PDF</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#6b6b80' }}>
                    <i className="fas fa-inbox" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}></i>
                    No email records found
                  </td>
                </tr>
              ) : (
                filteredRecords.map(record => (
                  <tr key={record.id}>
                    <td>{record.from_user}</td>
                    <td>{record.to_user}</td>
                    <td>{record.subject}</td>
                    <td>{new Date(record.sent_date).toLocaleDateString()}</td>
                    <td>
                      {record.pdf_filename ? (
                        <i className="fas fa-check" style={{ color: '#06ffa5' }}></i>
                      ) : (
                        <i className="fas fa-times" style={{ color: '#ff006e' }}></i>
                      )}
                    </td>
                    <td>
                      <button 
                        className="btn-small btn-view"
                        onClick={() => handleViewClick(record)}
                      >
                        <i className="fas fa-eye"></i> View
                      </button>
                      {record.pdf_filename && (
                        <button 
                          className="btn-small btn-download"
                          onClick={() => downloadPdf(record.pdf_filename)}
                        >
                          <i className="fas fa-download"></i> PDF
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div ref={modalRef}>
        {selectedEmail && (
          <Modal email={selectedEmail} onClose={handleCloseModal} />
        )}
      </div>
    </div>
  )
}

export default EmailRecords