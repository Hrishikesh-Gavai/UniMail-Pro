import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { showNotification, showPromiseNotification } from '../utils/notifications';
import Modal from './Modal';
import LoadingScreen, { SkeletonLoader, InlineLoading } from './LoadingScreen'; // Add this import
import * as XLSX from 'xlsx';
import { 
  Database, Search, Calendar, RefreshCw, Download, FileText, 
  Eye, User, Mail, Paperclip, FileDown, Filter, ChevronDown, ChevronUp, ExternalLink 
} from 'lucide-react';

const EmailRecords = () => {
  const [emailRecords, setEmailRecords] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    loadEmailRecords();
  }, []);

  const loadEmailRecords = async () => {
    // Use promise notification for loading records
    showPromiseNotification(
      new Promise(async (resolve, reject) => {
        try {
          setLoading(true);
          const { data, error } = await supabase
            .from('email_records')
            .select('*')
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          setEmailRecords(data || []);
          resolve(data);
        } catch (error) {
          console.error('Error loading records:', error);
          reject(error);
        } finally {
          setLoading(false);
        }
      }),
      {
        loading: 'Loading email records...',
        success: (data) => `Successfully loaded ${data?.length || 0} email records`,
        error: 'Failed to load email records'
      }
    );
  };

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
    showNotification(`Sorted by ${key.replace('_', ' ')} ${direction}`, 'info', 2000);
  };

  const sortedRecords = [...emailRecords].sort((a, b) => {
    if (sortConfig.key === 'sent_date' || sortConfig.key === 'created_at') {
      return sortConfig.direction === 'desc' 
        ? new Date(b[sortConfig.key]) - new Date(a[sortConfig.key])
        : new Date(a[sortConfig.key]) - new Date(b[sortConfig.key]);
    }
    
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'desc' ? 1 : -1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'desc' ? -1 : 1;
    }
    return 0;
  });

  const downloadPdf = async (filename) => {
    showPromiseNotification(
      new Promise(async (resolve, reject) => {
        setDownloading(prev => ({ ...prev, [filename]: true }));
        try {
          const { data, error } = await supabase.storage
            .from('pdfs')
            .download(filename);
          
          if (error) throw error;
          
          const url = URL.createObjectURL(data);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          resolve(filename);
        } catch (error) {
          console.error('Error downloading PDF:', error);
          reject(error);
        } finally {
          setDownloading(prev => ({ ...prev, [filename]: false }));
        }
      }),
      {
        loading: `Downloading ${filename}...`,
        success: (filename) => `Successfully downloaded ${filename}`,
        error: (error) => `Failed to download PDF: ${error.message}`
      }
    );
  };

  const downloadExcel = async () => {
    if (emailRecords.length === 0) {
      showNotification('No records to download', 'warning');
      return;
    }

    showPromiseNotification(
      new Promise(async (resolve, reject) => {
        try {
          const recordsWithUrls = await Promise.all(
            emailRecords.map(async (record) => {
              let pdfUrl = null;
              if (record.pdf_filename) {
                const { data: { publicUrl } } = supabase.storage
                  .from('pdfs')
                  .getPublicUrl(record.pdf_filename);
                pdfUrl = publicUrl;
              }
              return { ...record, pdfUrl };
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
            'PDF Link': record.pdfUrl || '',
            'Created At': new Date(record.created_at).toLocaleString()
          }));

          const workbook = XLSX.utils.book_new();
          const worksheet = XLSX.utils.json_to_sheet(excelData);
          
          const columnWidths = [
            { wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 40 }, 
            { wch: 50 }, { wch: 40 }, { wch: 50 }, { wch: 40 }, 
            { wch: 50 }, { wch: 20 }, { wch: 50 }, { wch: 20 }
          ];
          worksheet['!cols'] = columnWidths;

          XLSX.utils.book_append_sheet(workbook, worksheet, 'Email Records');
          
          const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
          const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `email-records-${new Date().toISOString().split('T')[0]}.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          resolve();
        } catch (error) {
          console.error('Error generating Excel:', error);
          reject(error);
        }
      }),
      {
        loading: 'Generating Excel file...',
        success: 'Excel file downloaded successfully!',
        error: 'Failed to generate Excel file'
      }
    );
  };

  const handleViewClick = (record) => {
    setSelectedEmail(record);
    showNotification(`Viewing details for: ${record.subject || 'No subject'}`, 'info', 3000);
  };

  const handleCloseModal = () => {
    setSelectedEmail(null);
  };

  const toggleRowExpand = (recordId) => {
    setExpandedRow(expandedRow === recordId ? null : recordId);
  };

  const filteredRecords = sortedRecords.filter(record => {
    const matchesSearch = 
      record.from_user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.to_user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.subject_hindi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.content_hindi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.subject_marathi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.content_marathi?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = dateFilter ? 
      record.sent_date === dateFilter : true;
    
    return matchesSearch && matchesDate;
  });

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ChevronDown size={14} className="sort-icon" />;
    return sortConfig.direction === 'desc' 
      ? <ChevronDown size={14} className="sort-icon active" />
      : <ChevronUp size={14} className="sort-icon active" />;
  };

  if (loading) {
    return (
      <div className="page active">
        <LoadingScreen 
          type="database"
          message="Loading Email Records"
          subtitle="Fetching your email history from the database"
        />
      </div>
    );
  }

  return (
    <div className="page active">
      <div className="page-header">
        <h2 className="page-title">
          <Database size={32} />
          Email Records
        </h2>
        <p className="page-subtitle">Manage and review all your sent emails</p>
      </div>

      <div className="card">
        <div className="records-header">
          <div className="records-stats">
            <span className="stat-badge total">
              <Database size={16} />
              Total: {emailRecords.length}
            </span>
            <span className="stat-badge filtered">
              <Filter size={16} />
              Showing: {filteredRecords.length}
            </span>
            <span className="stat-badge with-attachments">
              <Paperclip size={16} />
              With Attachments: {emailRecords.filter(r => r.pdf_filename).length}
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
          
          <div className="date-filter-container">
            <Calendar size={18} className="date-filter-icon" />
            <input 
              type="date" 
              className="date-filter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            {dateFilter && (
              <button 
                className="clear-date-filter"
                onClick={() => setDateFilter('')}
                title="Clear date filter"
              >
                ×
              </button>
            )}
          </div>
          
          <button 
            onClick={loadEmailRecords}
            className="refresh-btn"
            title="Refresh records"
          >
            <RefreshCw size={20} />
          </button>
          
          <button 
            className="download-excel-btn" 
            onClick={downloadExcel}
            disabled={emailRecords.length === 0}
          >
            <FileDown size={20} />
            Export Excel
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
                  : "No emails have been composed yet. Start by creating your first email!"
                }
              </p>
              {searchTerm || dateFilter ? (
                <button 
                  className="clear-filters-btn"
                  onClick={() => {
                    setSearchTerm('');
                    setDateFilter('');
                    showNotification('Filters cleared', 'info');
                  }}
                >
                  Clear All Filters
                </button>
              ) : null}
            </div>
          ) : (
            <table className="records-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('from_user')}>
                    <User size={16} />
                    From {getSortIcon('from_user')}
                  </th>
                  <th onClick={() => handleSort('to_user')}>
                    <Mail size={16} />
                    To {getSortIcon('to_user')}
                  </th>
                  <th onClick={() => handleSort('subject')}>
                    Subject {getSortIcon('subject')}
                  </th>
                  <th onClick={() => handleSort('sent_date')}>
                    <Calendar size={16} />
                    Date {getSortIcon('sent_date')}
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
                  <React.Fragment key={record.id}>
                    <tr className={expandedRow === record.id ? 'expanded' : ''}>
                      <td className="email-cell">
                        <div className="email-address">
                          <User size={16} />
                          {record.from_user || "Not specified"}
                        </div>
                      </td>
                      <td className="email-cell">
                        <div className="recipients">
                          {record.to_user?.split(',').slice(0, 2).map((email, idx) => (
                            <span key={idx} className="recipient-email">
                              <Mail size={12} />
                              {email}
                            </span>
                          ))}
                          {record.to_user?.split(',').length > 2 && (
                            <span className="more-recipients">
                              +{record.to_user.split(',').length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="subject-cell">
                        <div 
                          className="subject-text" 
                          title={record.subject}
                          onClick={() => toggleRowExpand(record.id)}
                        >
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
                            title="View full details"
                          >
                            <Eye size={16} />
                            View
                          </button>
                          {record.pdf_filename && (
                            <button 
                              onClick={() => toggleRowExpand(record.id)}
                              className="btn-expand"
                              title="Show attachments"
                            >
                              <FileText size={16} />
                              Files
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    
                    {expandedRow === record.id && (
                      <tr className="expanded-details">
                        <td colSpan="6">
                          <div className="expanded-content">
                            <div className="expanded-section">
                              <h4>Email Content</h4>
                              <div className="content-preview">
                                {record.content || "No content"}
                              </div>
                            </div>
                            
                            {(record.subject_hindi || record.content_hindi) && (
                              <div className="expanded-section">
                                <h4>Hindi Translation</h4>
                                {record.subject_hindi && (
                                  <div className="translation-preview">
                                    <strong>Subject:</strong> {record.subject_hindi}
                                  </div>
                                )}
                                {record.content_hindi && (
                                  <div className="translation-preview">
                                    <strong>Content:</strong> {record.content_hindi}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {(record.subject_marathi || record.content_marathi) && (
                              <div className="expanded-section">
                                <h4>Marathi Translation</h4>
                                {record.subject_marathi && (
                                  <div className="translation-preview">
                                    <strong>Subject:</strong> {record.subject_marathi}
                                  </div>
                                )}
                                {record.content_marathi && (
                                  <div className="translation-preview">
                                    <strong>Content:</strong> {record.content_marathi}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {record.pdf_filename && (
                              <div className="expanded-section">
                                <h4>Attachments</h4>
                                <div className="attachment-list">
                                  {record.pdf_filename.split(',').map((filename, index) => (
                                    <div key={index} className="attachment-item">
                                      <FileText size={16} />
                                      <span className="attachment-name">{filename}</span>
                                      <button 
                                        onClick={() => downloadPdf(filename.trim())}
                                        disabled={downloading[filename]}
                                        className="btn-download-small"
                                        title="Download PDF"
                                      >
                                        {downloading[filename] ? (
                                          <InlineLoading size="small" text="Downloading..." />
                                        ) : (
                                          <>
                                            <Download size={14} />
                                            Download
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="expanded-actions">
                              <button 
                                onClick={() => handleViewClick(record)}
                                className="btn-view-full"
                              >
                                <ExternalLink size={16} />
                                View Full Details
                              </button>
                              <button 
                                onClick={() => toggleRowExpand(record.id)}
                                className="btn-collapse"
                              >
                                Collapse
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {filteredRecords.length > 0 && (
          <div className="table-footer">
            <div className="records-info">
              Showing {filteredRecords.length} of {emailRecords.length} records
              {sortConfig.key && ` • Sorted by ${sortConfig.key.replace('_', ' ')} ${sortConfig.direction}`}
            </div>
            <div className="records-actions">
              <button 
                onClick={loadEmailRecords}
                className="refresh-btn-text"
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
  );
};

export default EmailRecords;
