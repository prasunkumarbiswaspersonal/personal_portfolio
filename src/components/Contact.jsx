import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, AlertTriangle, Copy, Check, RotateCcw } from 'lucide-react';

const CONTACT_EMAIL = 'prasun.oct27@gmail.com';
const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '1b15a1bd-6193-4f1c-8f54-6bbc2639af64';
const FORMSPREE_ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT || '';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const buildMailtoHref = ({ name, email, subject, message }) => {
  const body = `From: ${name} (${email})\n\n${message}`;
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'sent' | 'mailto_ready' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    if (status === 'error') {
      setStatus('idle');
      setErrorMessage('');
    }
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const resetForm = () => {
    setStatus('idle');
    setErrorMessage('');
    setCopied(false);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleCopyDraft = async () => {
    const formatted = `To: ${CONTACT_EMAIL}\nSubject: ${formData.subject.trim()}\nFrom: ${formData.name.trim()} (${formData.email.trim()})\n\n${formData.message.trim()}`;
    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      subject: formData.subject.trim(),
      message: formData.message.trim()
    };

    if (!trimmed.name || !trimmed.email || !trimmed.subject || !trimmed.message) {
      setStatus('error');
      setErrorMessage('Please fill in all fields before transmitting.');
      return;
    }

    if (!EMAIL_REGEX.test(trimmed.email)) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    // Dispatch via configured serverless relay (Web3Forms / Formspree)
    if (FORMSPREE_ENDPOINT || WEB3FORMS_ACCESS_KEY) {
      try {
        if (FORMSPREE_ENDPOINT) {
          const response = await fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json'
            },
            body: JSON.stringify(trimmed)
          });

          if (!response.ok) {
            throw new Error(`Submission failed (${response.status})`);
          }
        } else {
          const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json'
            },
            body: JSON.stringify({
              access_key: WEB3FORMS_ACCESS_KEY,
              name: trimmed.name,
              email: trimmed.email,
              subject: trimmed.subject,
              message: trimmed.message,
              from_name: 'Prasun Portfolio Contact'
            })
          });

          const data = await response.json();
          if (!response.ok || !data.success) {
            throw new Error(data.message || 'Transmission rejected by mail relay.');
          }
        }

        setStatus('sent');
        setTimeout(() => {
          resetForm();
        }, 4000);
        return;
      } catch (err) {
        setStatus('error');
        setErrorMessage(err.message || 'Unable to send right now. Please try your email app below.');
        return;
      }
    }

    const mailtoUrl = buildMailtoHref(trimmed);
    window.location.href = mailtoUrl;
    setStatus('mailto_ready');
  };

  const mailtoUrl = buildMailtoHref({
    name: formData.name.trim(),
    email: formData.email.trim(),
    subject: formData.subject.trim(),
    message: formData.message.trim()
  });

  return (
    <section id="contact" className="py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-96 bg-target/5 rounded-none blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading flex flex-wrap items-center justify-center tracking-wide md:tracking-widest text-sensor mb-4">
            <span className="text-target mr-3 md:mr-4">04.</span> CONTACT // COMMS
          </h2>
          <h3 className="text-2xl md:text-3xl font-mono font-bold text-white mb-5 tracking-wider">
            Get In Touch
          </h3>
          <p className="text-lg md:text-xl text-phosphor/95 mb-10 max-w-2xl mx-auto leading-relaxed">
            Whether you have a question about my projects, want to discuss a potential collaboration, or just want to say hi, my inbox is always open.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hud-frame liquid-glass p-6 sm:p-8 md:p-12 rounded-none border border-sensor/20"
        >
          {status === 'sent' ? (
            <div className="text-center py-12" role="status" aria-live="polite">
              <div className="w-20 h-20 bg-target/20 rounded-none flex items-center justify-center mx-auto mb-4 border border-target/40">
                <Send className="h-10 w-10 text-target" />
              </div>
              <h4 className="text-3xl font-bold text-white mb-2">Message Dispatched!</h4>
              <p className="text-phosphor/95 text-lg">Thanks for reaching out. I'll get back to you soon.</p>
            </div>
          ) : status === 'mailto_ready' ? (
            <div className="text-center py-10 space-y-6" role="status" aria-live="polite">
              <div className="w-20 h-20 bg-sensor/10 rounded-none flex items-center justify-center mx-auto border border-sensor/40">
                <Mail className="h-10 w-10 text-sensor" />
              </div>
              <div>
                <h4 className="text-2xl md:text-3xl font-bold text-white mb-2">Email Draft Prepared</h4>
                <p className="text-phosphor/90 text-base md:text-lg max-w-lg mx-auto">
                  Your email client should open with your message pre-filled to{' '}
                  <span className="text-sensor font-mono">{CONTACT_EMAIL}</span>.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={mailtoUrl}
                  className="btn-hud px-6 py-3 font-bold inline-flex items-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Open Email App
                </a>
                <button
                  type="button"
                  onClick={handleCopyDraft}
                  className="btn-hud !border-sensor/40 !text-phosphor hover:!border-sensor hover:!text-sensor px-6 py-3 font-bold inline-flex items-center gap-2"
                >
                  {copied ? <Check className="w-5 h-5 text-sensor" /> : <Copy className="w-5 h-5" />}
                  {copied ? 'Copied Draft!' : 'Copy Message'}
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="btn-hud !border-target/40 !text-target px-5 py-3 font-bold inline-flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Edit Message
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {status === 'error' && errorMessage && (
                <div
                  role="alert"
                  className="p-4 bg-target/10 border border-target/50 text-white font-mono text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-target flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                  <a
                    href={mailtoUrl}
                    className="text-xs font-mono text-sensor underline hover:text-white flex-shrink-0"
                  >
                    USE EMAIL APP INSTEAD →
                  </a>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-base font-mono text-sensor/95 mb-2 font-semibold tracking-wider">
                    NAME
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                    className="w-full px-5 py-3.5 bg-void/60 border border-sensor/30 rounded-none text-white font-mono text-base md:text-lg focus:border-sensor focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sensor/50 transition-colors placeholder:text-slate-500"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-base font-mono text-sensor/95 mb-2 font-semibold tracking-wider">
                    EMAIL
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    className="w-full px-5 py-3.5 bg-void/60 border border-sensor/30 rounded-none text-white font-mono text-base md:text-lg focus:border-sensor focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sensor/50 transition-colors placeholder:text-slate-500"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-base font-mono text-sensor/95 mb-2 font-semibold tracking-wider">
                  SUBJECT
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3.5 bg-void/60 border border-sensor/30 rounded-none text-white font-mono text-base md:text-lg focus:border-sensor focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sensor/50 transition-colors placeholder:text-slate-500"
                  placeholder="Project Inquiry"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-base font-mono text-sensor/95 mb-2 font-semibold tracking-wider">
                  MESSAGE
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-5 py-3.5 bg-void/60 border border-sensor/30 rounded-none text-white font-mono text-base md:text-lg focus:border-sensor focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sensor/50 transition-colors resize-none placeholder:text-slate-500"
                  placeholder="Your message here..."
                />
              </div>

              <div className="text-center">
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="btn-hud px-10 py-4 text-lg md:text-xl font-bold tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'submitting' ? (
                    <span className="flex items-center">
                      <span className="animate-spin h-5 w-5 mr-2 border-2 border-sensor border-t-transparent rounded-none"></span>
                      Transmitting...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Send className="mr-2 h-5 w-5" />
                      Send Message
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12"
        >
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="btn-hud bg-void/75 backdrop-blur-md px-10 py-4 text-lg md:text-xl font-bold tracking-wider"
          >
            <Mail className="mr-3 h-5 w-5" />
            Direct Email
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
