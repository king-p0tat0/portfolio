import React, { useState, useEffect, useRef, useCallback } from 'react';

import Navigation from '@/layouts/nav/Navigation.jsx';
import IntroSection from '@/features/intro/IntroSection.jsx';
import ProfileSection from '@/features/profile/ProfileSection.jsx';
import ProjectSection from '@/features/project/ProjectSection.jsx';
import OutroSection from '@/features/outro/OutroSection.jsx';

import './App.css';

/* =========================
   mobile-like detection
========================= */
const useIsMobileLike = () => {
  const [isMobileLike, setIsMobileLike] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse), (max-width: 768px)');
    const update = () => setIsMobileLike(mq.matches);
    update();

    if (mq.addEventListener) {
      mq.addEventListener('change', update);
      return () => mq.removeEventListener('change', update);
    }

    mq.addListener(update);
    return () => mq.removeListener(update);
  }, []);

  return isMobileLike;
};

function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const lockRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMobileLike = useIsMobileLike();

  // ✅ 각 슬라이드 DOM ref (active slide의 스크롤 상태를 확인하려고)
  const slideRefs = useRef([]);

  const slides = [
    { id: 'intro', label: 'Intro', component: <IntroSection /> },
    { id: 'profile', label: 'Profile', component: <ProfileSection /> },
    { id: 'project', label: 'Project', component: <ProjectSection /> },
    { id: 'outro', label: 'Outro', component: <OutroSection /> },
  ];

  /* =========================
     helpers
  ========================= */
  const lockInput = useCallback((ms = 700) => {
    if (lockRef.current) return true;
    lockRef.current = setTimeout(() => {
      lockRef.current = null;
    }, ms);
    return false;
  }, []);

  const getActiveEl = useCallback(() => {
    return slideRefs.current[currentSlide] || null;
  }, [currentSlide]);

  const isAtTop = useCallback((el) => {
    if (!el) return true;
    return el.scrollTop <= 0;
  }, []);

  const isAtBottom = useCallback((el) => {
    if (!el) return true;
    // 소수점/반올림 오차 방지
    const threshold = 1;
    return el.scrollTop + el.clientHeight >= el.scrollHeight - threshold;
  }, []);

  const scrollActiveToTop = useCallback(() => {
    const el = getActiveEl();
    if (!el) return;
    el.scrollTo({ top: 0, behavior: 'instant' });
  }, [getActiveEl]);

  /* =========================
     slide 이동
  ========================= */
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.min(prev + 1, slides.length - 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  const goToTop = useCallback(() => {
    setCurrentSlide(0);
  }, []);

  // ✅ 슬라이드 바뀌면 해당 슬라이드의 내부 스크롤을 맨 위로 올려주는 게 UX 좋음
  useEffect(() => {
    scrollActiveToTop();
  }, [currentSlide, scrollActiveToTop]);

  /* =========================
     PC: Wheel (내부 스크롤 우선)
  ========================= */
  useEffect(() => {
    // ✅ 트랙패드/가속 휠 대비: delta 누적
    let acc = 0;

    const handleWheel = (event) => {
      if (isModalOpen) return;

      // ✅ 모바일은 여기서 안 막음 (모바일은 touch에서 처리)
      if (isMobileLike) return;

      event.preventDefault();

      // ✅ 전환 중 추가 입력 차단
      if (lockInput(850)) return;

      // ✅ delta 누적 (trackpad는 작은 값이 여러번 들어옴)
      acc += event.deltaY;

      // ✅ 임계값: 작으면 너무 민감, 크면 반응 느림
      const THRESHOLD = 90;

      if (acc > THRESHOLD) {
        acc = 0;
        nextSlide();
        return;
      }

      if (acc < -THRESHOLD) {
        acc = 0;
        prevSlide();
        return;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      acc = 0;
      if (lockRef.current) {
        clearTimeout(lockRef.current);
        lockRef.current = null;
      }
    };
  }, [isModalOpen, isMobileLike, lockInput, nextSlide, prevSlide]);

  /* =========================
     Mobile: Swipe (내부 스크롤 우선)
     - active slide가 top/bottom일 때만 슬라이드 전환
  ========================= */
  useEffect(() => {
    if (!isMobileLike) return;

    let startX = 0;
    let startY = 0;
    let moved = false;

    const onTouchStart = (e) => {
      if (isModalOpen) return;
      const t = e.touches?.[0];
      if (!t) return;

      startX = t.clientX;
      startY = t.clientY;
      moved = false;
    };

    const onTouchMove = (e) => {
      if (isModalOpen) return;
      const t = e.touches?.[0];
      if (!t) return;

      const dx = t.clientX - startX;
      const dy = t.clientY - startY;

      // 세로 제스처가 확실해지면 "슬라이드 제스처 가능성"만 기록
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 6) {
        moved = true;
      }
      // ✅ 여기서 preventDefault를 무조건 하면 내부 스크롤이 막힘
      // => end 시점에 조건을 보고 슬라이드 전환만 처리 (스크롤은 브라우저가 처리)
    };

    const onTouchEnd = (e) => {
      if (isModalOpen) return;
      if (!moved) return;

      const el = getActiveEl();
      if (!el) return;

      const t = e.changedTouches?.[0];
      if (!t) return;

      const dx = t.clientX - startX;
      const dy = t.clientY - startY;

      // 세로 스와이프만
      if (Math.abs(dy) <= Math.abs(dx)) return;

      const SWIPE_THRESHOLD = 70;
      if (Math.abs(dy) < SWIPE_THRESHOLD) return;

      // 위로 스와이프(dy < 0) => 다음 슬라이드
      if (dy < 0) {
        // ✅ 내부 스크롤이 맨 아래일 때만 넘김
        if (!isAtBottom(el)) return;
        if (lockInput()) return;
        nextSlide();
      } else {
        // 아래로 스와이프(dy > 0) => 이전 슬라이드
        if (!isAtTop(el)) return;
        if (lockInput()) return;
        prevSlide();
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      if (lockRef.current) {
        clearTimeout(lockRef.current);
        lockRef.current = null;
      }
    };
  }, [isMobileLike, isModalOpen, getActiveEl, isAtBottom, isAtTop, lockInput, nextSlide, prevSlide]);

  const activeId = slides[currentSlide].id;

  return (
    <div className="app">
      <div className={`app-nav ${activeId === 'project' ? 'is-project' : ''}`}>
          <Navigation
            items={slides.map((slide) => ({ id: slide.id, label: slide.label }))}
            activeItem={activeId}
            onItemClick={(sectionId) => {
              const index = slides.findIndex((slide) => slide.id === sectionId);
              if (index !== -1) goToSlide(index);
            }}
            position="left"
          />
      </div>

      <div className="slide-container">
        <div
          className="slides-wrapper"
          style={{ transform: `translateY(-${currentSlide * 100}vh)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`slide ${index === currentSlide ? 'is-active' : ''}`}
              ref={(el) => (slideRefs.current[index] = el)}
              tabIndex={index === currentSlide ? 0 : -1}
            >
              {React.cloneElement(slide.component, {
                isActive: currentSlide === index,
                goToTop,
                setIsModalOpen,
                isModalOpen,
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
