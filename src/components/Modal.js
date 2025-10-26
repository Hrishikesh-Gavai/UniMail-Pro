import React from 'react';
import { X, Mail, User, Calendar, FileText, Languages, Paperclip, Download, ExternalLink } from 'lucide-react';

const Modal = ({ email, onClose }) => {
  if (!email) return null;

  const downloadPdf = async (filename) => {
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
      showNotification('Failed to download PDF', 'error');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Mail size={28} />
            <div>
              <h2>Email Details</h2>
              <p className="modal-subtitle">Complete email information and translations</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="modal-section">
            <h3>
              <User size={20} />
              Sender & Recipients
            </h3>
            <div className="info-grid">
              <div className="info-item">
                <strong>From:</strong>
                <span>{email.from_user || "Not specified"}</span>
              </div>
              <div className="info-item">
                <strong>To:</strong>
                <div className="recipients-list">
                  {email.to_user?.split(',').map((recipient, index) => (
                    <span key={index} className="recipient-tag">
                      <Mail size={12} />
                      {recipient}
                    </span>
                  ))}
                </div>
              </div>
              <div className="info-item">
                <strong>
                  <Calendar size={16} />
                  Sent Date:
                </strong>
                <span>{new Date(email.sent_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div className="info-item">
                <strong>Created:</strong>
                <span>{new Date(email.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="modal-section">
            <h3>
              <FileText size={20} />
              Email Content
            </h3>
            <div className="content-section">
              <div className="content-item">
                <h4>Subject</h4>
                <div className="content-text">{email.subject || "No subject"}</div>
              </div>
              <div className="content-item">
                <h4>Message Content</h4>
                <div className="content-text preformatted">
                  {email.content.split('\n').map((line, i) => (
                    <p key={i} style={{ margin: line ? '0.5rem 0' : '0' }}>
                      {line || <br />}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {(email.subject_hindi || email.content_hindi) && (
            <div className="modal-section">
              <h3>
                <Languages size={20} />
                Hindi Translation
              </h3>
              <div className="translation-section">
                {email.subject_hindi && (
                  <div className="translation-item">
                    <h4>Subject (Hindi)</h4>
                    <div className="translation-text hindi">{email.subject_hindi}</div>
                  </div>
                )}
                {email.content_hindi && (
                  <div className="translation-item">
                    <h4>Content (Hindi)</h4>
                    <div className="translation-text hindi preformatted">
                      {email.content_hindi.split('\n').map((line, i) => (
                        <p key={i} style={{ margin: line ? '0.5rem 0' : '0' }}>
                          {line || <br />}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {(email.subject_marathi || email.content_marathi) && (
            <div className="modal-section">
              <h3>
                <Languages size={20} />
                Marathi Translation
              </h3>
              <div className="translation-section">
                {email.subject_marathi && (
                  <div className="translation-item">
                    <h4>Subject (Marathi)</h4>
                    <div className="translation-text marathi">{email.subject_marathi}</div>
                  </div>
                )}
                {email.content_marathi && (
                  <div className="translation-item">
                    <h4>Content (Marathi)</h4>
                    <div className="translation-text marathi preformatted">
                      {email.content_marathi.split('\n').map((line, i) => (
                        <p key={i} style={{ margin: line ? '0.5rem 0' : '0' }}>
                          {line || <br />}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {email.pdf_filename && (
            <div className="modal-section">
              <h3>
                <Paperclip size={20} />
                Attachments
              </h3>
              <div className="attachments-section">
                <div className="attachments-list">
                  {email.pdf_filename.split(',').map((filename, index) => (
                    <div key={index} className="attachment-item">
                      <FileText size={18} className="file-icon" />
                      <span className="attachment-name">{filename}</span>
                      <button 
                        onClick={() => downloadPdf(filename.trim())}
                        className="btn-download-attachment"
                        title="Download PDF"
                      >
                        <Download size={16} />
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-close-modal" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Mock functions for the modal (these would be imported in a real scenario)
const supabase = {
  storage: {
    from: () => ({
      download: () => Promise.resolve({ data: null, error: null })
    })
  }
};

const showNotification = (message, type) => {
  console.log(`${type}: ${message}`);
};

export default Modal;
