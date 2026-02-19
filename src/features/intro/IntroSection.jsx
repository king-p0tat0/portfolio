import React, { useState, useEffect, useMemo  } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './css/IntroSection.css';
import BgImg from '@/assets/images/background.png';

const IntroSection = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 767);

  const titleText = useMemo(
    () => (isMobile ? '보이는 것 이상의\n가치를 만들다' : '보이는 것 이상의 가치를 만들다'),
    [isMobile]
  );

  const [displayedTitle, setDisplayedTitle] = useState('');
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [typingComplete, setTypingComplete] = useState(false);

  // ✅ 화면 리사이즈 감지
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 767);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ✅ titleText가 바뀌면(모바일<->PC) 타이핑 다시 시작
  useEffect(() => {
    let cancelled = false;

    const startTyping = async () => {
      // 리셋
      setDisplayedTitle('');
      setTypingComplete(false);
      setShowSubtitle(false);
      setShowDescription(false);
      setShowScrollDown(false);

      await new Promise(r => setTimeout(r, 200));

      for (let i = 0; i <= titleText.length; i++) {
        if (cancelled) return;
        await new Promise(r => setTimeout(r, 80));
        setDisplayedTitle(titleText.substring(0, i));
      }

      setTypingComplete(true);
      setTimeout(() => !cancelled && setShowSubtitle(true), 400);
      setTimeout(() => !cancelled && setShowDescription(true), 1200);
      setTimeout(() => !cancelled && setShowScrollDown(true), 2000);
    };

    startTyping();
    return () => {
      cancelled = true;
    };
  }, [titleText]);

  return (
    <>
      <img src={BgImg} alt="배경이미지" className="bg-image" />

      <section className="main-section">
        <div className="main-content">
          <h1 className="main-title">
            <span className={`typing-text ${typingComplete ? 'typing-complete' : ''}`} id="typing-title">
              {displayedTitle}
              <span className="typing-cursor" aria-hidden="true">|</span>
            </span>
          </h1>
          <h2 className={`main-subtitle ${showSubtitle ? 'subtitle-visible' : ''}`} id="subtitle">
            {isMobile ? (
              <>사용자의 마음까지 설계하는<br/>Empathetic Developer</>
            ) : (
              '사용자의 마음까지 설계하는 Empathetic Developer'
            )}
          </h2>
          <p className={`main-description ${showDescription ? 'description-visible' : ''}`} id="description">
            {isMobile ? (
              <>안녕하세요, 신입 개발자 정서윤입니다<span className="accent-dot"></span></>
            ) : (
              <>안녕하세요, 신입 개발자 정서윤입니다<span className="accent-dot"></span></>
            )}
          </p>
        </div>

        <div className={`scroll-down ${showScrollDown ? 'show' : ''}`}>
          <div className="mouse">
            <div className="wheel"></div>
          </div>
          <div className="scroll-text">SCROLL DOWN</div>
        </div>
      </section>
    </>
  );
};

export default IntroSection;