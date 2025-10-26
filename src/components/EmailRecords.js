import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { showNotification } from '../utils/notifications';
import Modal from './Modal';
import * as XLSX from 'xlsx';
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
  Filter,
  ChevronDown,
  ChevronUp,
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

  // Refs for synchronized scrollbars
  const topScrollRef = useRef(null);
  const bottomScrollRef = useRef(null);

  useEffect(() => {
    loadEmailRecords();
  }, []);

  // Sync scroll between top and bottom scrollbars
  const syncScroll = (source) => {
    if (source === 'top' && bottomScrollRef.current) {
      bottomScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    } else if (source === 'bottom' && topScrollRef.current) {
      topScrollRef.current.scrollLeft = bottomScrollRef.current.scrollLeft;
    }
  };

  const loadEmailRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEmailRecords(data || []);
      showNotification(`Loaded ${data?.length || 0} email records`, 'success');
    } catch (error) {
      console.error('Error loading records:', error);
      showNotification('Failed to load email records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
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

      showNotification('PDF downloaded successfully', 'success');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      showNotification('Failed to download PDF', 'error');
    } finally {
      setDownloading(prev => ({ ...prev, [filename]: false }));
    }
  };

  const downloadExcel = async () => {
    try {
      if (emailRecords.length === 0) {
        showNotification('No records to download', 'warning');
        return;
      }

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
        'Download PDF': record.pdfUrl ? '➕Download PDF' : 'No PDF',
        'Created At': new Date(record.created_at).toLocaleString()
      }));

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Add hyperlinks to the "Download PDF" column
      recordsWithUrls.forEach((record, index) => {
        if (record.pdfUrl) {
          const cellAddress = XLSX.utils.encode_cell({ r: index + 1, c: 10 }); // Column K (index 10)
          if (!worksheet[cellAddress]) {
            worksheet[cellAddress] = { t: 's', v: 'Download PDF' };
          }
          worksheet[cellAddress].l = { Target: record.pdfUrl, Tooltip: "Click to download PDF" };
        }
      });

      const columnWidths = [
        { wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 40 },
        { wch: 50 }, { wch: 40 }, { wch: 50 }, { wch: 40 },
        { wch: 50 }, { wch: 20 }, { wch: 20 }, { wch: 20 }
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

      showNotification('Excel file downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error generating Excel:', error);
      showNotification('Failed to generate Excel file', 'error');
    }
  };

  const handleViewClick = (record) => {
    setSelectedEmail(record);
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

    const matchesDate = dateFilter ? record.sent_date === dateFilter : true;

    return matchesSearch && matchesDate;
  });

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <ChevronDown size={16} style={{ opacity: 0.3 }} />;
    return sortConfig.direction === 'desc' ? <ChevronDown size={16} /> : <ChevronUp size={16} />;
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading email records...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
      <div className="card">
        <div className="card-header">
          <div className="card-header-icon">
            <Database size={24} />
          </div>
          <div className="card-header-text">
            <h2>Email Records</h2>
            <p>Manage and review all your sent emails</p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-xl)',
        }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              <Search size={18} />
              Search Records
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Search by sender, recipient, subject, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              <Calendar size={18} />
              Filter by Date
            </label>
            <input
              type="date"
              className="form-input"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="button-group" style={{ marginBottom: 'var(--space-xl)' }}>
          <button className="btn btn-primary" onClick={loadEmailRecords}>
            <RefreshCw size={18} />
            Refresh
          </button>
          <button className="btn btn-success" onClick={downloadExcel}>
            <FileDown size={18} />
            Export to Excel
          </button>
          {(searchTerm || dateFilter) && (
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSearchTerm('');
                setDateFilter('');
              }}
            >
              <Filter size={18} />
              Clear Filters
            </button>
          )}
        </div>

        {/* Records Count Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-sm)',
          padding: 'var(--space-sm) var(--space-md)',
          background: 'var(--primary-ultralight)',
          borderRadius: 'var(--radius-full)',
          marginBottom: 'var(--space-lg)',
          fontSize: '0.875rem',
          fontWeight: '600',
          color: 'var(--primary)',
        }}>
          <Database size={16} />
          {filteredRecords.length} Record{filteredRecords.length !== 1 ? 's' : ''} Found
        </div>
      </div>

      {/* Table Container */}
      {filteredRecords.length === 0 ? (
        <div className="card">
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-2xl)',
          }}>
            <Database size={64} style={{ 
              color: 'var(--gray-300)', 
              margin: '0 auto var(--space-lg)' 
            }} />
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              marginBottom: 'var(--space-md)',
              color: 'var(--text-primary)',
            }}>
              No Email Records Found
            </h3>
            <p style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '1rem',
              marginBottom: 'var(--space-lg)',
            }}>
              {searchTerm || dateFilter
                ? "Try adjusting your search or filter criteria"
                : "No emails have been composed yet. Start by creating your first email!"}
            </p>
            {(searchTerm || dateFilter) && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSearchTerm('');
                  setDateFilter('');
                }}
              >
                <Filter size={18} />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="table-container">
          {/* Top Scrollbar */}
          <div 
            ref={topScrollRef}
            onScroll={() => syncScroll('top')}
            style={{
              overflowX: 'auto',
              overflowY: 'hidden',
              marginBottom: '2px',
              height: '12px',
              background: 'var(--gray-100)',
              borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
            }}
          >
            <div style={{ 
              height: '1px', 
              width: '2000px',
            }}></div>
          </div>

          {/* Main Table Wrapper */}
          <div 
            ref={bottomScrollRef}
            className="table-wrapper"
            onScroll={() => syncScroll('bottom')}
          >
            <table className="table">
              <thead>
                <tr>
                  <th style={{ cursor: 'pointer', minWidth: '200px' }} onClick={() => handleSort('from_user')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={16} />
                      From
                      {getSortIcon('from_user')}
                    </div>
                  </th>
                  <th style={{ cursor: 'pointer', minWidth: '250px' }} onClick={() => handleSort('to_user')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={16} />
                      To
                      {getSortIcon('to_user')}
                    </div>
                  </th>
                  <th style={{ cursor: 'pointer', minWidth: '300px' }} onClick={() => handleSort('subject')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={16} />
                      Subject
                      {getSortIcon('subject')}
                    </div>
                  </th>
                  <th style={{ cursor: 'pointer', minWidth: '150px' }} onClick={() => handleSort('sent_date')}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={16} />
                      Date
                      {getSortIcon('sent_date')}
                    </div>
                  </th>
                  <th style={{ minWidth: '120px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Paperclip size={16} />
                      Files
                    </div>
                  </th>
                  <th style={{ minWidth: '180px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <React.Fragment key={record.id}>
                    <tr>
                      <td>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          fontWeight: '500',
                        }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--white)',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            flexShrink: 0,
                          }}>
                            {record.from_user?.charAt(0)?.toUpperCase() || 'N'}
                          </div>
                          {record.from_user || 'Not specified'}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {record.to_user?.split(',').slice(0, 2).map((email, idx) => (
                            <span
                              key={idx}
                              style={{
                                display: 'inline-block',
                                padding: '4px 8px',
                                background: 'var(--primary-ultralight)',
                                color: 'var(--primary)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                              }}
                            >
                              {email.trim()}
                            </span>
                          ))}
                          {record.to_user?.split(',').length > 2 && (
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '4px 8px',
                                background: 'var(--gray-200)',
                                color: 'var(--text-secondary)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                              }}
                            >
                              +{record.to_user.split(',').length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div
                          style={{ 
                            cursor: 'pointer',
                            fontWeight: '500',
                            color: 'var(--primary)',
                            transition: 'color var(--transition-fast)',
                          }}
                          onClick={() => toggleRowExpand(record.id)}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-dark)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--primary)'}
                        >
                          {record.subject || "No subject"}
                        </div>
                      </td>
                      <td>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          background: 'var(--gray-100)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.875rem',
                        }}>
                          <Calendar size={14} />
                          {new Date(record.sent_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td>
                        {record.pdf_filename ? (
                          <span className="badge badge-success">
                            <Paperclip size={12} />
                            {record.pdf_filename.split(',').length} file(s)
                          </span>
                        ) : (
                          <span className="badge badge-error">No files</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleViewClick(record)}
                          >
                            <Eye size={14} />
                          </button>
                          {record.pdf_filename && (
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => downloadPdf(record.pdf_filename.split(',')[0])}
                              disabled={downloading[record.pdf_filename.split(',')[0]]}
                            >
                              {downloading[record.pdf_filename.split(',')[0]] ? (
                                <div className="loading-spinner" style={{ 
                                  width: '14px', 
                                  height: '14px',
                                  borderWidth: '2px',
                                }}></div>
                              ) : (
                                <Download size={14} />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Row Content */}
                    {expandedRow === record.id && (
                      <tr>
                        <td colSpan="6" style={{ 
                          background: 'var(--gray-50)', 
                          padding: 'var(--space-xl)',
                        }}>
                          <div style={{
                            display: 'grid',
                            gap: 'var(--space-lg)',
                          }}>
                            {/* Email Content */}
                            <div>
                              <h4 style={{
                                fontSize: '1rem',
                                fontWeight: '600',
                                marginBottom: 'var(--space-sm)',
                                color: 'var(--text-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                              }}>
                                <FileText size={18} />
                                Email Content
                              </h4>
                              <p style={{ 
                                color: 'var(--text-secondary)',
                                lineHeight: '1.6',
                                whiteSpace: 'pre-wrap',
                              }}>
                                {record.content || "No content"}
                              </p>
                            </div>

                            {/* Hindi Translation */}
                            {(record.subject_hindi || record.content_hindi) && (
                              <div style={{
                                padding: 'var(--space-lg)',
                                background: 'var(--white)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-light)',
                              }}>
                                <h4 style={{
                                  fontSize: '1rem',
                                  fontWeight: '600',
                                  marginBottom: 'var(--space-md)',
                                  color: 'var(--text-primary)',
                                }}>
                                  Hindi Translation
                                </h4>
                                {record.subject_hindi && (
                                  <div style={{ marginBottom: 'var(--space-sm)' }}>
                                    <strong style={{ color: 'var(--text-secondary)' }}>Subject:</strong>
                                    <p style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>
                                      {record.subject_hindi}
                                    </p>
                                  </div>
                                )}
                                {record.content_hindi && (
                                  <div>
                                    <strong style={{ color: 'var(--text-secondary)' }}>Content:</strong>
                                    <p style={{ 
                                      marginTop: '4px', 
                                      color: 'var(--text-secondary)',
                                      lineHeight: '1.6',
                                      whiteSpace: 'pre-wrap',
                                    }}>
                                      {record.content_hindi}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Marathi Translation */}
                            {(record.subject_marathi || record.content_marathi) && (
                              <div style={{
                                padding: 'var(--space-lg)',
                                background: 'var(--white)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-light)',
                              }}>
                                <h4 style={{
                                  fontSize: '1rem',
                                  fontWeight: '600',
                                  marginBottom: 'var(--space-md)',
                                  color: 'var(--text-primary)',
                                }}>
                                  Marathi Translation
                                </h4>
                                {record.subject_marathi && (
                                  <div style={{ marginBottom: 'var(--space-sm)' }}>
                                    <strong style={{ color: 'var(--text-secondary)' }}>Subject:</strong>
                                    <p style={{ marginTop: '4px', color: 'var(--text-secondary)' }}>
                                      {record.subject_marathi}
                                    </p>
                                  </div>
                                )}
                                {record.content_marathi && (
                                  <div>
                                    <strong style={{ color: 'var(--text-secondary)' }}>Content:</strong>
                                    <p style={{ 
                                      marginTop: '4px', 
                                      color: 'var(--text-secondary)',
                                      lineHeight: '1.6',
                                      whiteSpace: 'pre-wrap',
                                    }}>
                                      {record.content_marathi}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Attachments */}
                            {record.pdf_filename && (
                              <div>
                                <h4 style={{
                                  fontSize: '1rem',
                                  fontWeight: '600',
                                  marginBottom: 'var(--space-sm)',
                                  color: 'var(--text-primary)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                }}>
                                  <Paperclip size={18} />
                                  Attachments
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {record.pdf_filename.split(',').map((filename, index) => (
                                    <div
                                      key={index}
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: 'var(--space-md)',
                                        background: 'var(--white)',
                                        border: '1px solid var(--border-light)',
                                        borderRadius: 'var(--radius-md)',
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <FileText size={24} style={{ color: 'var(--error)' }} />
                                        <span style={{ 
                                          fontWeight: '500', 
                                          color: 'var(--text-primary)',
                                          fontSize: '0.95rem',
                                        }}>
                                          {filename.trim()}
                                        </span>
                                      </div>
                                      <button
                                        className="btn btn-sm btn-primary"
                                        onClick={() => downloadPdf(filename.trim())}
                                        disabled={downloading[filename.trim()]}
                                      >
                                        {downloading[filename.trim()] ? (
                                          <div className="loading-spinner" style={{ 
                                            width: '14px', 
                                            height: '14px',
                                            borderWidth: '2px',
                                          }}></div>
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
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Viewing Details */}
      {selectedEmail && (
        <Modal email={selectedEmail} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default EmailRecords;
