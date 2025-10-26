import React from 'react';
import { X, Mail, User, Calendar, FileText, Paperclip, Download, Languages } from 'lucide-react';
import { supabase } from '../services/supabase';

const Modal = ({ email, onClose }) => {
  const [downloading, setDownloading] = React.useState(false);

  const downloadPdf = async (filename) => {
    setDownloading(true);
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
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '1200px',
          maxHeight: '75  vh',
          width: '95%',
        }}
      >
        <div className="modal-header" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
          <h2 style={{ fontSize: '1.25rem' }}>
            <Mail size={20} />
            Email Details
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ 
          padding: 'var(--space-lg)',
          overflowY: 'auto',
          maxHeight: 'calc(80vh - 140px)',
        }}>
          {/* Grid Layout for compact display */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--space-md)',
            marginBottom: 'var(--space-lg)',
          }}>
            {/* From Section */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '6px',
                fontSize: '0.8rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
              }}>
                <User size={14} style={{ color: 'var(--primary)' }} />
                From
              </div>
              <div style={{
                padding: '10px 12px',
                background: 'var(--gray-50)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                fontSize: '0.9rem',
              }}>
                {email.from_user || 'Not specified'}
              </div>
            </div>

            {/* Date Section */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '6px',
                fontSize: '0.8rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
              }}>
                <Calendar size={14} style={{ color: 'var(--primary)' }} />
                Sent Date
              </div>
              <div style={{
                padding: '10px 12px',
                background: 'var(--gray-50)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                fontSize: '0.9rem',
              }}>
                {new Date(email.sent_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>

          {/* To Section - Full Width */}
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '6px',
              fontSize: '0.8rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
            }}>
              <Mail size={14} style={{ color: 'var(--primary)' }} />
              To
            </div>
            <div style={{
              padding: '10px 12px',
              background: 'var(--gray-50)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
            }}>
              {email.to_user?.split(',').map((recipient, idx) => (
                <span
                  key={idx}
                  style={{
                    display: 'inline-block',
                    padding: '3px 10px',
                    background: 'var(--primary-ultralight)',
                    color: 'var(--primary)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                  }}
                >
                  {recipient.trim()}
                </span>
              ))}
            </div>
          </div>

          {/* Subject Section */}
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '6px',
              fontSize: '0.8rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
            }}>
              <FileText size={14} style={{ color: 'var(--primary)' }} />
              Subject
            </div>
            <div style={{
              padding: '10px 12px',
              background: 'var(--gray-50)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-light)',
              fontWeight: '500',
              fontSize: '0.95rem',
            }}>
              {email.subject || 'No subject'}
            </div>
          </div>

          {/* Content Section */}
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '6px',
              fontSize: '0.8rem',
              fontWeight: '600',
              color: 'var(--text-primary)',
            }}>
              <FileText size={14} style={{ color: 'var(--primary)' }} />
              Content
            </div>
            <div style={{
              padding: '12px',
              background: 'var(--gray-50)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-light)',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              maxHeight: '120px',
              overflowY: 'auto',
              fontSize: '0.9rem',
            }}>
              {email.content || 'No content'}
            </div>
          </div>

          {/* Translations - Side by Side */}
          {(email.subject_hindi || email.content_hindi || email.subject_marathi || email.content_marathi) && (
            <div style={{
              marginBottom: 'var(--space-md)',
              padding: 'var(--space-md)',
              background: 'var(--gray-50)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-light)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: 'var(--space-md)',
                fontSize: '0.85rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
              }}>
                <Languages size={16} style={{ color: 'var(--primary)' }} />
                Translations
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 'var(--space-md)',
              }}>
                {/* Hindi Translation */}
                {(email.subject_hindi || email.content_hindi) && (
                  <div>
                    <h4 style={{
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: 'var(--text-primary)',
                    }}>
                      Hindi
                    </h4>
                    {email.content_hindi && (
                      <div style={{
                        padding: '10px',
                        background: 'var(--white)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-light)',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap',
                        maxHeight: '100px',
                        overflowY: 'auto',
                        fontSize: '0.85rem',
                      }}>
                        {email.content_hindi}
                      </div>
                    )}
                  </div>
                )}

                {/* Marathi Translation */}
                {(email.subject_marathi || email.content_marathi) && (
                  <div>
                    <h4 style={{
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      marginBottom: '8px',
                      color: 'var(--text-primary)',
                    }}>
                      Marathi
                    </h4>
                    {email.content_marathi && (
                      <div style={{
                        padding: '10px',
                        background: 'var(--white)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-light)',
                        lineHeight: '1.6',
                        whiteSpace: 'pre-wrap',
                        maxHeight: '100px',
                        overflowY: 'auto',
                        fontSize: '0.85rem',
                      }}>
                        {email.content_marathi}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Attachments Section */}
          {email.pdf_filename && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '8px',
                fontSize: '0.8rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
              }}>
                <Paperclip size={14} style={{ color: 'var(--primary)' }} />
                Attachments
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {email.pdf_filename.split(',').map((filename, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      background: 'var(--gray-50)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-light)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText size={20} style={{ color: 'var(--error)' }} />
                      <span style={{ fontWeight: '500', fontSize: '0.85rem' }}>
                        {filename.trim()}
                      </span>
                    </div>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => downloadPdf(filename.trim())}
                      disabled={downloading}
                    >
                      {downloading ? (
                        <div className="loading-spinner" style={{
                          width: '14px',
                          height: '14px',
                          borderWidth: '2px',
                        }}></div>
                      ) : (
                        <>
                          <Download size={12} />
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

        <div className="modal-footer" style={{ 
          position: 'sticky', 
          bottom: 0, 
          background: 'var(--gray-50)', 
          zIndex: 10,
          padding: 'var(--space-md) var(--space-lg)',
        }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
