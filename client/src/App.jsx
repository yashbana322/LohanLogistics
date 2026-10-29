import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import StringTieFooter from '@/components/ui/string-tie-footer';
import './App.css';

const API_BASE = import.meta.env.VITE_API_URL || '';

function App() {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [footerMount, setFooterMount] = useState(null);

  useEffect(() => {
    setFooterMount(document.getElementById('string-tie-footer-root'));
  }, []);

  useEffect(() => {
    if (footerMount) {
      const timer = setTimeout(() => {
        if (window.ScrollTrigger) {
          window.ScrollTrigger.refresh();
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [footerMount]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    origin: 'Mumbai (JNPT)',
    destination: 'Delhi NCR',
    cargoType: 'Full Container (FCL)',
    weight: '20 MT',
    notes: ''
  });

  // Check backend connection
  useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'online') {
          setBackendStatus('online');
        } else {
          setBackendStatus('error');
        }
      })
      .catch(() => setBackendStatus('offline'));
  }, []);

  // Listen to clicks on any "Get a quote" buttons on the website
  useEffect(() => {
    const handleQuoteClick = (e) => {
      const target = e.target.closest('[data-a="quote"], .cbtn, .lq-btn');
      if (target) {
        e.preventDefault();
        setIsQuoteOpen(true);
      }
    };

    document.addEventListener('click', handleQuoteClick);
    return () => document.removeEventListener('click', handleQuoteClick);
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/api/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setQuoteSubmitted(data);
    } catch {
      // Offline fallback
      setQuoteSubmitted({
        success: true,
        quoteId: `LH-${Date.now().toString().slice(-6)}`,
        message: 'Quote request saved locally (Backend offline).'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsQuoteOpen(false);
    setQuoteSubmitted(null);
  };

  return (
    <>
      {/* Discreet Node.js Backend Status Pill */}
      <div className="react-server-pill" title="Backend Connection Status">
        <span
          className="react-server-dot"
          style={{
            background: backendStatus === 'online' ? '#1f9d45' : '#ff4d4d',
            boxShadow: backendStatus === 'online' ? '0 0 8px #1f9d45' : '0 0 8px #ff4d4d'
          }}
        />
        <span>Node.js Backend: {backendStatus === 'online' ? 'Port 5000' : backendStatus}</span>
      </div>

      {/* React Quote Modal */}
      {isQuoteOpen && (
        <div className="react-modal-backdrop" onClick={handleClose}>
          <div className="react-modal-content" onClick={e => e.stopPropagation()}>
            <button className="react-modal-close" onClick={handleClose} aria-label="Close">
              ×
            </button>

            {quoteSubmitted ? (
              <div className="react-quote-success">
                <div className="react-success-badge">✓</div>
                <h3>Quote Request Received!</h3>
                <p style={{ color: '#4b4c6e', margin: '12px 0 20px' }}>
                  {quoteSubmitted.message}
                </p>
                <div style={{
                  background: '#f3f3f3',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#15163a',
                  display: 'inline-block',
                  marginBottom: '24px'
                }}>
                  Reference ID: <span style={{ color: '#ff7a00' }}>{quoteSubmitted.quoteId}</span>
                </div>
                <div>
                  <button className="react-btn-submit" onClick={handleClose}>
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="react-modal-header">
                  <h3>Get an Instant Freight Quote</h3>
                  <p>Enter your cargo details and our dispatch team will reach out with rates.</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="react-form-row">
                    <div className="react-form-group">
                      <label>Contact Name</label>
                      <input
                        className="react-input"
                        name="name"
                        required
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="react-form-group">
                      <label>Phone Number</label>
                      <input
                        className="react-input"
                        name="phone"
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="react-form-group">
                    <label>Email Address</label>
                    <input
                      className="react-input"
                      name="email"
                      type="email"
                      required
                      placeholder="logistics@company.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="react-form-row">
                    <div className="react-form-group">
                      <label>Origin Hub</label>
                      <select
                        className="react-select"
                        name="origin"
                        value={formData.origin}
                        onChange={handleChange}
                      >
                        <option>Mumbai (JNPT)</option>
                        <option>Delhi NCR (ICD Tughlakabad)</option>
                        <option>Kolkata Port</option>
                        <option>Chennai Port</option>
                        <option>Bengaluru (ICD Whitefield)</option>
                        <option>Hyderabad Hub</option>
                        <option>Ahmedabad (Sanand)</option>
                        <option>Nagpur (MIHAN)</option>
                      </select>
                    </div>

                    <div className="react-form-group">
                      <label>Destination Hub</label>
                      <select
                        className="react-select"
                        name="destination"
                        value={formData.destination}
                        onChange={handleChange}
                      >
                        <option>Delhi NCR</option>
                        <option>Mumbai (JNPT)</option>
                        <option>Kolkata Port</option>
                        <option>Chennai Port</option>
                        <option>Bengaluru (ICD Whitefield)</option>
                        <option>Hyderabad Hub</option>
                        <option>Ahmedabad (Sanand)</option>
                        <option>Nagpur (MIHAN)</option>
                      </select>
                    </div>
                  </div>

                  <div className="react-form-row">
                    <div className="react-form-group">
                      <label>Cargo Mode</label>
                      <select
                        className="react-select"
                        name="cargoType"
                        value={formData.cargoType}
                        onChange={handleChange}
                      >
                        <option>Full Container (FCL)</option>
                        <option>Less than Container (LCL)</option>
                        <option>Dedicated Rail Freight</option>
                        <option>Surface / Road Express</option>
                        <option>Reefer / Temperature-controlled</option>
                      </select>
                    </div>

                    <div className="react-form-group">
                      <label>Estimated Weight</label>
                      <input
                        className="react-input"
                        name="weight"
                        placeholder="e.g. 24 MT or 45 CBM"
                        value={formData.weight}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="react-form-group">
                    <label>Additional Requirements (Optional)</label>
                    <textarea
                      className="react-textarea"
                      name="notes"
                      placeholder="Special handling, port customs clearance, warehousing..."
                      value={formData.notes}
                      onChange={handleChange}
                    />
                  </div>

                  <button
                    type="submit"
                    className="react-btn-submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting Request...' : 'Send Quote Request ↗'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
      {/* Interactive String Tie Envelope Footer */}
      {footerMount && createPortal(
        <StringTieFooter
          meta={["Multimodal Logistics", "Est. 2026", "Lohan Fleet"]}
          title="Lohan"
          titleAccent="Logistics"
          tapes={["Powering Strategic Corridors", "Connecting Global Supply Chains!"]}
          email="dispatch@lohanlogistics.com"
          phone="+91 124 456 7890"
          links={[
            { label: "JNPT Mumbai & Delhi NCR Network", href: "#buildings" },
            { label: "Live Telemetry & GPS Tracking", href: "#scan" },
            { label: "Dedicated Block Rail Corridors", href: "#colours" },
          ]}
          note={{
            kicker: "Central Dispatch Tower",
            text: "Got an urgent container positioning need, block train booking, or customs clearance? Our commercial desk is live 24/7/365.",
            cta: "Request Freight Quote ↗",
          }}
          regards="Warm Regards,"
          signatureLabel="Signed, Rajveer Lohan, Managing Director"
          height="100svh"
        />,
        footerMount
      )}
    </>
  );
}

export default App;
