import React from 'react'

const Modal = ({ email, onClose }) => {
  if (!email) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ 
            margin: '0', 
            background: 'linear-gradient(135deg, #00d4ff 0%, #7b2cbf 50%, #06ffa5 100%)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent', 
            backgroundClip: 'text' 
          }}>
            Email Details
          </h2>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body" style={{ padding: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <h3 style={{ color: '#00d4ff', marginBottom: '0.5rem' }}>From</h3>
              <p style={{ marginBottom: '1.5rem' }}>{email.from_user}</p>
              
              <h3 style={{ color: '#00d4ff', marginBottom: '0.5rem' }}>To</h3>
              <p style={{ marginBottom: '1.5rem' }}>{email.to_user}</p>
              
              <h3 style={{ color: '#00d4ff', marginBottom: '0.5rem' }}>Date</h3>
              <p style={{ marginBottom: '1.5rem' }}>{new Date(email.sent_date).toLocaleDateString()}</p>
            </div>
            <div>
              <h3 style={{ color: '#00d4ff', marginBottom: '0.5rem' }}>Subject</h3>
              <p style={{ marginBottom: '1.5rem' }}>{email.subject}</p>
              
              {email.subject_hindi && (
                <>
                  <h3 style={{ color: '#00d4ff', marginBottom: '0.5rem' }}>Subject (Hindi)</h3>
                  <p style={{ marginBottom: '1.5rem' }}>{email.subject_hindi}</p>
                </>
              )}
              
              <h3 style={{ color: '#00d4ff', marginBottom: '0.5rem' }}>Content</h3>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                {email.content.split('\n').map((line, i) => (
                  <p key={i} style={{ margin: line ? '0.5rem 0' : '0' }}>
                    {line || <br />}
                  </p>
                ))}
              </div>
              
              {email.content_hindi && (
                <>
                  <h3 style={{ color: '#00d4ff', marginBottom: '0.5rem' }}>Content (Hindi)</h3>
                  <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                    {email.content_hindi.split('\n').map((line, i) => (
                      <p key={i} style={{ margin: line ? '0.5rem 0' : '0' }}>
                        {line || <br />}
                      </p>
                    ))}
                  </div>
                </>
              )}
              
              <h3 style={{ color: '#00d4ff', marginBottom: '0.5rem' }}>Attachment</h3>
              <p>{email.pdf_filename ? email.pdf_filename : 'No attachment'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal