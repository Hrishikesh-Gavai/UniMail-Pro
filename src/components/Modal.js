import React from 'react';
import { X, Mail, User, Calendar, FileText, Languages } from 'lucide-react';

const Modal = ({ email, onClose }) => {
  if (!email) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <Mail size={28} />
            Email Details
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="modal-body">
          <div>
            <h3>
              <User size={18} />
              From
            </h3>
            <p>{email.from_user}</p>
            
            <h3>
              <Mail size={18} />
              To
            </h3>
            <p>{email.to_user}</p>
            
            <h3>
              <Calendar size={18} />
              Date
            </h3>
            <p>{new Date(email.sent_date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
            
            <h3>
              <FileText size={18} />
              Subject
            </h3>
            <p>{email.subject}</p>
          </div>
          
          <div>
            {email.subject_hindi && (
              <>
                <h3>
                  <Languages size={18} />
                  Subject (Hindi)
                </h3>
                <p className="translation-content">{email.subject_hindi}</p>
              </>
            )}
            
            {email.subject_marathi && (
              <>
                <h3>
                  <Languages size={18} />
                  Subject (Marathi)
                </h3>
                <p className="translation-content">{email.subject_marathi}</p>
              </>
            )}
            
            <h3>
              <FileText size={18} />
              Content
            </h3>
            <div style={{ marginBottom: '1.5rem' }}>
              {email.content.split('\n').map((line, i) => (
                <p key={i} style={{ margin: line ? '0.5rem 0' : '0' }}>
                  {line || <br />}
                </p>
              ))}
            </div>
            
            {email.content_hindi && (
              <>
                <h3>
                  <Languages size={18} />
                  Content (Hindi)
                </h3>
                <div style={{ marginBottom: '1.5rem' }}>
                  {email.content_hindi.split('\n').map((line, i) => (
                    <p key={i} style={{ margin: line ? '0.5rem 0' : '0' }}>
                      {line || <br />}
                    </p>
                  ))}
                </div>
              </>
            )}
            
            {email.content_marathi && (
              <>
                <h3>
                  <Languages size={18} />
                  Content (Marathi)
                </h3>
                <div>
                  {email.content_marathi.split('\n').map((line, i) => (
                    <p key={i} style={{ margin: line ? '0.5rem 0' : '0' }}>
                      {line || <br />}
                    </p>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
