import React, { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { showNotification } from '../utils/notifications'
import Modal from './Modal'
import * as XLSX from 'xlsx'
import { 
  Database, 
  Search, 
  Calendar, 
  RefreshCw, 
  Download, 
  FileText, 
  Eye, 
  User, 
  Mail, 
  Paperclip,
  FileDown,
  Filter
} from 'lucide-react'

const EmailRecords = () => {
  const [emailRecords, setEmailRecords] = useState([])
  const [selectedEmail, setSelectedEmail] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState({})

  useEffect(() => {
    loadEmailRecords()
  }, [])

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
    setDownloading(prev => ({ ...prev, [filename]: true }))
    try {
      const { data, error } = await supabase.storage
        .from('pdfs')
        .download(filename)
      
      if (error) throw error
      
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
    } finally {
      setDownloading(prev => ({ ...prev, [filename]: false }))
    }
  }

  const downloadExcel = async () => {
    try {
      if (emailRecords.length === 0) {
        showNotification('No records to download', 'warning')
        return
      }

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

      const excelData = recordsWithUrls.map(record => ({
        'From': record.from_user,
        'To': record.to_user,
        'Date': new Date(record.sent_date).toLocaleDateString(),
        'Subject': record.subject,
        'Content': record.content,
        'Subject (Hindi)': record.subject_hindi || '',
        'Content (Hindi)': record.content_hindi || '',
        'Subject (Marathi)': record.subject_marathi || '',
        'Content (Marathi)': record.content_marathi || '',
        'PDF Attachment': record.pdf_filename ? 'Available' : 'No Attachment',
        'Created At': new Date(record.created_at).toLocaleString()
      }))

      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(excelData)
      
      recordsWithUrls.forEach((record, index) => {
        if (record.pdfUrl) {
          const cellAddress = XLSX.utils.encode_cell({ r: index + 1, c: 9 });
          if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
          worksheet[cellAddress].l = { Target: record.pdfUrl, Tooltip: 'Click to download PDF' };
          worksheet[cellAddress].v = 'Download PDF';
        }
      });

      const columnWidths = [
        { wch: 25 },
        { wch: 25 },
        { wch: 15 },
        { wch: 40 },
        { wch: 50 },
        { wch: 40 },
        { wch: 50 },
        { wch: 40 },
        { wch: 50 },
        { wch: 20 },
        { wch: 20 }
      ]
      worksheet['!cols'] = columnWidths

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Email Records')
      
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `email-records-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      showNotification('Excel file downloaded with PDF links and translations!', 'success')
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
      record.from_user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.to_user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.subject_hindi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.content_hindi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.subject_marathi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.content_marathi?.toLowerCase().includes(searchTerm.toLowerCase())
    
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
      <div className="card">
        <div className="records-header">
          <h2 className="page-title">
            <Database size={32} />
            Email Records
          </h2>
          <div className="records-stats">
            <span className="stat-badge">
              <Database size={16} />
              Total: {emailRecords.length}
            </span>
            <span className="stat-badge">
              <Filter size={16} />
              Filtered: {filteredRecords.length}
            </span>
          </div>
        </div>

        <div className="filters">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search emails by sender, recipient, subject, content, or translations..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <Calendar size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
            <input 
              type="date" 
              className="date-filter"
              style={{ paddingLeft: '2.5rem' }}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          <button 
            onClick={loadEmailRecords}
            className="refresh-btn"
            title="Refresh records"
          >
            <RefreshCw size={20} />
          </button>
          <button className="download-excel-btn" onClick={downloadExcel}>
            <FileDown size={20} />
            Download Excel
          </button>
        </div>

        <div className="table-container">
          {filteredRecords.length === 0 ? (
            <div className="empty-state">
              <Database size={64} className="empty-icon" />
              <h3>No email records found</h3>
              <p>
                {searchTerm || dateFilter 
                  ? "Try adjusting your search or filter criteria" 
                  : "No emails have been composed yet."
                }
              </p>
            </div>
          ) : (
            <table className="records-table">
              <thead>
                <tr>
                  <th>
                    <User size={16} />
                    From
                  </th>
                  <th>
                    <Mail size={16} />
                    To
                  </th>
                  <th>Subject</th>
                  <th>
                    <Calendar size={16} />
                    Date
                  </th>
                  <th>
                    <Paperclip size={16} />
                    Attachments
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(record => (
                  <tr key={record.id}>
                    <td className="email-cell">
                      <div className="email-address">
                        <User size={16} />
                        {record.from_user}
                      </div>
                    </td>
                    <td className="email-cell">
                      <div className="recipients">
                        {record.to_user?.split(',').map((email, idx) => (
                          <span key={idx} className="recipient-email">
                            <Mail size={12} />
                            {email}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="subject-cell">
                      <div className="subject-text" title={record.subject}>
                        {record.subject || "No subject"}
                      </div>
                    </td>
                    <td className="date-cell">
                      {new Date(record.sent_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="attachment-cell">
                      {record.pdf_filename ? (
                        <span className="attachment-badge">
                          <Paperclip size={14} />
                          {record.pdf_filename.split(',').length} file(s)
                        </span>
                      ) : (
                        <span className="no-attachment">—</span>
                      )}
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleViewClick(record)}
                          className="btn-view"
                          title="View details"
                        >
                          <Eye size={16} />
                          View
                        </button>
                        {record.pdf_filename && record.pdf_filename.split(',').map((filename) => (
                          <button 
                            key={filename}
                            onClick={() => downloadPdf(filename.trim())}
                            disabled={downloading[filename]}
                            className="btn-download"
                            title="Download PDF"
                          >
                            <Download size={16} />
                            {downloading[filename] ? "..." : "PDF"}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {filteredRecords.length > 0 && (
          <div className="table-footer">
            <div className="records-info">
              Showing {filteredRecords.length} of {emailRecords.length} records
            </div>
            <div className="records-actions">
              <button 
                onClick={loadEmailRecords}
                className="refresh-btn"
                style={{ width: 'auto', padding: '0.5rem 1rem' }}
                title="Refresh records"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedEmail && (
        <Modal email={selectedEmail} onClose={handleCloseModal} />
      )}
    </div>
  )
}

export default EmailRecords
