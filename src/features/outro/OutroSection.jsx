// OutroSection.jsx
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faEnvelopeOpen, faFileLines, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { createPortal } from 'react-dom';

import './css/OutroSection.css';
import OtBgImg from '@/assets/images/outro-background.png';

function OutroSection({ isActive, goToTop }) {
  const [copied, setCopied] = useState(false);
  const email = 'yuni9260@naver.com';

  const copyEmail = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(email);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = email;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }

    setCopied(true);
    window.setTimeout(() => setCopied(false), 3000);
  };

  return (
    <section className={`contact-section ${isActive ? 'is-visible' : ''}`}>
      <img src={OtBgImg} alt="배경이미지" className="ot-bg-image" />

      <div className="outro-text">
        <h1>보이는 UI와 느껴지는 UX</h1>

        <h2 className="outro-sub">
          <span className="line1">두 경험의 균형을 끝까지 고민하는</span>{' '}
          <span className="line2">개발자로 성장하겠습니다.</span>
        </h2>

        <p>감사합니다.</p>

        <div className="outro-links">
          <button
            type="button"
            className={`outro-link ${copied ? 'is-copied' : ''}`}
            onClick={copyEmail}
          >
            <span className="icon">
              <FontAwesomeIcon icon={copied ? faEnvelopeOpen : faEnvelope} />
            </span>
            <span className="label">{copied ? 'Copied!' : 'Contact'}</span>
          </button>

          {copied &&
            createPortal(
              <div className="copy-toast">이메일 주소가 복사되었습니다.</div>,
              document.body
            )}

          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="outro-link"
          >
            <span className="icon">
              <FontAwesomeIcon icon={faFileLines} />
            </span>
            <span className="label">Resume</span>
          </a>
        </div>
      </div>

      <button
        className={`scroll-top-button ${isActive ? 'is-visible' : ''}`}
        onClick={goToTop}
        aria-label="맨 위로 이동"
      >
        <FontAwesomeIcon icon={faArrowUp} />
      </button>
    </section>
  );
}

export default OutroSection;
