import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import './css/ProjectSection.css';

import EzMain from '@/assets/images/projects/ezboard/ez1.png';
import FeMain from '@/assets/images/projects/feelyeon/fe1.png';
import WiMain from '@/assets/images/projects/withme/wi1.png';
import NeMain from '@/assets/images/projects/nexspace/ne1.png';
import PoMain from '@/assets/images/projects/portfolio/po1.png';

import ProjectModal from './ProjectModal';
import { projects } from '@/data/projects';

const AUTO_INTERVAL = 4500;
const AUTO_RESTART_DELAY = 300;

const ProjectSection = ({ setIsModalOpen, isModalOpen }) => {
  // ✅ Touch detect (표시/UI용 정도로만 사용)
  const [isTouchLike, setIsTouchLike] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const coarse = window.matchMedia?.('(hover: none) and (pointer: coarse)')?.matches ?? false;
    const hasTouchPoints = (navigator.maxTouchPoints ?? 0) > 0;
    const hasOntouch = 'ontouchstart' in window;
    setIsTouchLike(coarse || hasTouchPoints || hasOntouch);
  }, []);

  const sectionRef = useRef(null);

  const [isVisible, setIsVisible] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  // ✅ Hero infinite carousel index (with clones)
  const [heroIndex, setHeroIndex] = useState(1);
  const [heroTransition, setHeroTransition] = useState(true);

  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // ✅ PC에서만 hover로 auto pause
  const [isHeroBtnHovered, setIsHeroBtnHovered] = useState(false);

  const gridRef = useRef(null);
  const [swipeDir, setSwipeDir] = useState('right');
  const [hasSwiped, setHasSwiped] = useState(false);

  // ✅ hero refs
  const heroViewportRef = useRef(null);
  const heroTrackRef = useRef(null);

  // ✅ drag state
  const dragRef = useRef({
    active: false,
    source: null,
    pointerId: null,
    touchId: null,
    startX: 0,
    startY: 0,
    dx: 0,
    dy: 0,
    width: 1,
    baseIndex: 1,
    moved: false,
    raf: 0,
    lockedAxis: null,
  });

  // ✅ auto slide
  const autoTimerRef = useRef(null);
  const restartTimeoutRef = useRef(null);

  // ✅ transition 중 연타/중복 tick 방지
  const animatingRef = useRef(false);

  // ✅ 드래그/스와이프 후 auto 재시작 지연
  const pendingAutoRestartRef = useRef(false);

  // ✅ slides
  const slides = useMemo(
    () => [
      {
        id: 'ez-board',
        title: 'EZ Board',
        subtitle: 'Mechanical Keyboard Shop',
        image: EzMain,
        description:
          "'Easy & Friendly'를 뜻하는 EZ처럼 누구나 손쉽게 키보드의 매력을 즐길 수 있도록 기획된 온라인 키보드 전문 쇼핑몰입니다.",
        year: '2024',
        type: '팀 프로젝트',
      },
      {
        id: 'feelyeon',
        title: '필연(必然)',
        subtitle: 'Stationery Store',
        image: FeMain,
        description:
          '손끝에서 시작된 손글씨의 인연과 운명처럼 이어지는 기록의 가치를 담아낸\n감성 문구 스토어입니다.',
        year: '2024',
        type: '팀 프로젝트',
      },
      {
        id: 'withme',
        title: 'withme',
        subtitle: 'Pet Health Management Platform',
        image: WiMain,
        description:
          '1:1 문진부터 수의사 상담, 그리고 쇼핑까지.\n반려견의 건강과 일상을 가장 가까이에서 함께하는 올인원 케어 플랫폼입니다.',
        year: '2025',
        type: '팀 프로젝트',
      },
      {
        id: 'nexspace',
        title: 'Nexspace ERP',
        subtitle: 'Advanced Procurement System',
        image: NeMain,
        description:
          '사내 구매 요청부터 프로젝트 평가까지의 전 과정을 효율적으로 관리하고, 팀 협업과 업무 공간 운영을 지원하는 웹 기반 통합 워크스페이스 솔루션입니다.',
        year: '2025',
        type: '팀 프로젝트',
      },
      {
        id: 'portfolio',
        title: 'Pages by Seoyun',
        subtitle: 'React Web Portfolio',
        image: PoMain,
        description: 'React를 기반으로 개발한 인터랙티브 웹 포트폴리오로, 직접 개발한 프로젝트를 담았습니다.',
        year: '2025',
        type: '개인 프로젝트',
      },
    ],
    []
  );

  // ✅ hero render list with clones: [last, ...slides, first]
  const heroSlides = useMemo(() => {
    if (slides.length === 0) return [];
    const first = slides[0];
    const last = slides[slides.length - 1];
    return [last, ...slides, first];
  }, [slides]);

  const normalizeHeroIndexToReal = useCallback(
    (idx) => {
      const n = slides.length;
      if (n === 0) return 0;
      if (idx === 0) return n - 1;
      if (idx === n + 1) return 0;
      return idx - 1;
    },
    [slides.length]
  );

  const realIndex = useMemo(() => normalizeHeroIndexToReal(heroIndex), [heroIndex, normalizeHeroIndexToReal]);

  const currentContent = useMemo(() => {
    const bySelected = selectedProjectId ? slides.find((s) => s.id === selectedProjectId) : null;
    const byHover = hoveredItem ? slides.find((s) => s.id === hoveredItem) : null;
    const byHero = slides[realIndex] ?? slides[0];
    return bySelected || byHover || byHero || slides[0];
  }, [selectedProjectId, hoveredItem, slides, realIndex]);

  const selectedProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return projects.find((p) => p.id === selectedProjectId) ?? null;
  }, [selectedProjectId]);

  // ----------------------------
  // Auto controls
  // ----------------------------
  const stopAuto = useCallback(() => {
    if (autoTimerRef.current) {
      clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    }
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
  }, []);

  const canAuto = useCallback(() => {
    if (isModalOpen) return false;
    if (hoveredItem !== null) return false;

    // ✅ PC만 hover pause
    if (!isTouchLike && isHeroBtnHovered) return false;

    if (dragRef.current.active) return false;
    if (animatingRef.current) return false;
    return true;
  }, [isModalOpen, hoveredItem, isHeroBtnHovered, isTouchLike]);

  const startAuto = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!canAuto()) return;

    stopAuto();
    autoTimerRef.current = window.setInterval(() => {
      const n = slides.length;
      if (n === 0) return;
      if (animatingRef.current) return;

      animatingRef.current = true;
      setHeroTransition(true);
      setHeroIndex((prev) => {
        const next = prev + 1;
        return next > n + 1 ? n + 1 : next;
      });
    }, AUTO_INTERVAL);
  }, [canAuto, stopAuto, slides.length]);

  const scheduleAutoRestart = useCallback(() => {
    if (typeof window === 'undefined') return;
    stopAuto();
    restartTimeoutRef.current = window.setTimeout(() => {
      startAuto();
    }, AUTO_RESTART_DELAY);
  }, [startAuto, stopAuto]);

  useEffect(() => {
    startAuto();
    return () => stopAuto();
  }, [startAuto, stopAuto]);

  // ----------------------------
  // Observers / hints
  // ----------------------------
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;

      if (!hasSwiped && scrollLeft > 4) setHasSwiped(true);

      const atStart = scrollLeft <= 2;
      const atEnd = scrollLeft + clientWidth >= scrollWidth - 2;

      if (atEnd && !atStart) setSwipeDir('left');
      else setSwipeDir('right');
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [hasSwiped]);

  // ----------------------------
  // Hero transition end: clone fix + restart auto
  // ----------------------------
  const onHeroTransitionEnd = useCallback(
    (e) => {
      if (e && e.target !== heroTrackRef.current) return;

      const n = slides.length;
      if (n === 0) return;

      if (heroIndex <= 0) {
        setHeroTransition(false);
        setHeroIndex(n);
        animatingRef.current = false;

        if (pendingAutoRestartRef.current) {
          pendingAutoRestartRef.current = false;
          requestAnimationFrame(scheduleAutoRestart);
        }
        return;
      }

      if (heroIndex >= n + 1) {
        setHeroTransition(false);
        setHeroIndex(1);
        animatingRef.current = false;

        if (pendingAutoRestartRef.current) {
          pendingAutoRestartRef.current = false;
          requestAnimationFrame(scheduleAutoRestart);
        }
        return;
      }

      animatingRef.current = false;

      if (pendingAutoRestartRef.current) {
        pendingAutoRestartRef.current = false;
        scheduleAutoRestart();
      }
    },
    [heroIndex, slides.length, scheduleAutoRestart]
  );

  useEffect(() => {
    if (!heroTransition) {
      const id = requestAnimationFrame(() => setHeroTransition(true));
      return () => cancelAnimationFrame(id);
    }
  }, [heroTransition]);

  // ----------------------------
  // Drag helpers
  // ----------------------------
  const clearRaf = useCallback(() => {
    const st = dragRef.current;
    if (st.raf) cancelAnimationFrame(st.raf);
    st.raf = 0;
  }, []);

  const applyDragTransform = useCallback(() => {
    const track = heroTrackRef.current;
    if (!track) return;

    const st = dragRef.current;
    track.style.setProperty('--drag-x', `${st.dx}px`);
  }, []);

  const queueApply = useCallback(() => {
    const st = dragRef.current;
    if (st.raf) return;
    st.raf = requestAnimationFrame(() => {
      st.raf = 0;
      applyDragTransform();
    });
  }, [applyDragTransform]);

  const beginDrag = useCallback(
    (clientX, clientY, idForCapture = null, source = 'pointer') => {
      const v = heroViewportRef.current;
      if (!v) return false;

      const st = dragRef.current;

      // ✅ 이미 드래그 중이면 다른 소스 시작은 무시
      if (st.active) return false;
      if (animatingRef.current) return false;

      const rect = v.getBoundingClientRect();

      st.active = true;
      st.source = source;

      st.pointerId = source === 'pointer' ? idForCapture : null;
      st.touchId = source === 'touch' ? idForCapture : null;

      st.startX = clientX;
      st.startY = clientY;
      st.dx = 0;
      st.dy = 0;
      st.width = rect.width || 1;
      st.baseIndex = heroIndex;
      st.moved = false;
      st.lockedAxis = null;

      setHeroTransition(false);
      clearRaf();
      stopAuto();

      const track = heroTrackRef.current;
      if (track) track.style.setProperty('--drag-x', '0px');

      return true;
    },
    [heroIndex, clearRaf, stopAuto]
  );

  const moveDrag = useCallback(
    (clientX, clientY) => {
      const st = dragRef.current;
      if (!st.active) return { locked: null };

      st.dx = clientX - st.startX;
      st.dy = clientY - st.startY;

      const ax = Math.abs(st.dx);
      const ay = Math.abs(st.dy);

      if (!st.lockedAxis) {
        if (ax < 6 && ay < 6) return { locked: null };
        st.lockedAxis = ax >= ay ? 'x' : 'y';
      }

      if (st.lockedAxis === 'y') return { locked: 'y' };

      st.moved = true;
      queueApply();
      return { locked: 'x' };
    },
    [queueApply]
  );

  const endDrag = useCallback(() => {
    const track = heroTrackRef.current;
    if (!track) return;

    const st = dragRef.current;
    if (!st.active) return;

    st.active = false;
    st.source = null;

    // ✅ 드래그 오프셋 정리
    track.style.setProperty('--drag-x', '0px');

    // 탭/세로스크롤
    if (st.lockedAxis !== 'x' || !st.moved) {
      setHeroTransition(true);
      setHeroIndex(st.baseIndex);

      st.pointerId = null;
      st.touchId = null;
      clearRaf();

      scheduleAutoRestart();
      return;
    }

    const threshold = Math.min(80, st.width * 0.18);
    let next = st.baseIndex;

    if (st.dx <= -threshold) next = st.baseIndex + 1;
    else if (st.dx >= threshold) next = st.baseIndex - 1;

    // ✅ 경계 클램프 (clone 범위)
    const n = slides.length;
    if (next < 0) next = 0;
    if (next > n + 1) next = n + 1;

    setHeroTransition(true);

    if (next !== st.baseIndex) {
      animatingRef.current = true;
      pendingAutoRestartRef.current = true;
    } else {
      scheduleAutoRestart();
    }

    setHeroIndex(next);

    st.pointerId = null;
    st.touchId = null;
    clearRaf();
  }, [clearRaf, scheduleAutoRestart, slides.length]);

  const onHeroPointerDown = useCallback(
    (e) => {
      const isTouchPointer = e.pointerType === 'touch' || e.pointerType === 'pen';
      if (!isTouchPointer && (navigator.maxTouchPoints ?? 0) === 0) return;

      const v = heroViewportRef.current;
      if (!v) return;

      const ok = beginDrag(e.clientX, e.clientY, e.pointerId, 'pointer');
      if (!ok) return;

      v.setPointerCapture?.(e.pointerId);
    },
    [beginDrag]
  );

  const onHeroPointerMove = useCallback(
    (e) => {
      const st = dragRef.current;
      if (!st.active || st.source !== 'pointer') return;
      if (st.pointerId == null || st.pointerId !== e.pointerId) return;
      moveDrag(e.clientX, e.clientY);
    },
    [moveDrag]
  );

  const onHeroPointerUp = useCallback(
    (e) => {
      const st = dragRef.current;
      if (!st.active || st.source !== 'pointer') return;
      if (st.pointerId == null || st.pointerId !== e.pointerId) return;
      endDrag();
    },
    [endDrag]
  );

  const onHeroPointerCancel = useCallback(
    (e) => {
      const st = dragRef.current;
      if (!st.active) return;
      if (st.pointerId == null || st.pointerId !== e.pointerId) return;
      endDrag();
    },
    [endDrag]
  );

  // ----------------------------
  // ✅ iOS 안정화: native touch (capture + passive:false)
  // ----------------------------
  useEffect(() => {
    const el = heroViewportRef.current;
    if (!el) return;

    const handleTouchStart = (e) => {
      const st = dragRef.current;
      if (st.active) return;

      const t = e.touches?.[0];
      if (!t) return;
      beginDrag(t.clientX, t.clientY, t.identifier, 'touch');
    };

    const handleTouchMove = (e) => {
      const st = dragRef.current;
      if (!st.active) return;

      const touchId = st.touchId;
      const list = Array.from(e.touches || []);
      const t = list.find((x) => x.identifier === touchId) || list[0];
      if (!t) return;

      const { locked } = moveDrag(t.clientX, t.clientY);

      // ✅ 가로로 잠기면 스크롤/제스처를 막아야 스와이프가 안 씹힘
      if (locked === 'x') e.preventDefault();
    };

    const handleTouchEnd = (e) => {
      const st = dragRef.current;
      if (!st.active) return;

      const stillActive = Array.from(e.touches || []).some((x) => x.identifier === st.touchId);
      if (stillActive) return;

      endDrag();
    };

    const handleTouchCancel = () => endDrag();

    // ✅ capture + passive 조합이 iOS에서 제스처 경쟁에 가장 강함
    el.addEventListener('touchstart', handleTouchStart, { passive: false, capture: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true, capture: true });
    el.addEventListener('touchcancel', handleTouchCancel, { passive: true, capture: true });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart, { capture: true });
      el.removeEventListener('touchmove', handleTouchMove, { capture: true });
      el.removeEventListener('touchend', handleTouchEnd, { capture: true });
      el.removeEventListener('touchcancel', handleTouchCancel, { capture: true });
    };
  }, [beginDrag, moveDrag, endDrag]);

  // ----------------------------
  // Hover sync
  // ----------------------------
  useEffect(() => {
    if (!hoveredItem) return;
    const idx = slides.findIndex((s) => s.id === hoveredItem);
    if (idx < 0) return;

    setHeroTransition(true);
    setHeroIndex(idx + 1);
    scheduleAutoRestart();
  }, [hoveredItem, slides, scheduleAutoRestart]);

  // ----------------------------
  // Open project
  // ----------------------------
  const openProject = useCallback(
    (id) => {
      scheduleAutoRestart();
      setSelectedProjectId(id);

      const idx = slides.findIndex((s) => s.id === id);
      if (idx >= 0) {
        setHeroTransition(true);
        setHeroIndex(idx + 1);
      }

      setIsModalOpen(true);
    },
    [slides, setIsModalOpen, scheduleAutoRestart]
  );

  return (
    <div ref={sectionRef} className={`project-section ${isVisible ? 'is-visible' : ''}`}>
      {/* Hero */}
      <div className="hero-section">
        {/* ✅ swipe 영역 = hero-background(hero-carousel)만 */}
        <div
          className="hero-background hero-carousel"
          ref={heroViewportRef}
          // ✅ viewport에만 touch-action 부여
          style={{ touchAction: 'pan-y' }}
          onPointerDown={onHeroPointerDown}
          onPointerMove={onHeroPointerMove}
          onPointerUp={onHeroPointerUp}
          onPointerCancel={onHeroPointerCancel}
        >
          <div
            className={`hero-track ${heroTransition ? 'is-animating' : ''}`}
            ref={heroTrackRef}
            style={{
              '--hero-i': heroIndex,
              // ✅ 여기서 drag-x를 0으로 덮어쓰지 않기 (리렌더 시 끊김 방지)
              // '--drag-x': '0px',
            }}
            onTransitionEnd={onHeroTransitionEnd}
          >
            {heroSlides.map((s, i) => (
              <div className="hero-slide" key={`${s.id}-${i}`}>
                <img src={s.image} alt={`${s.title} Background`} draggable="false" />
              </div>
            ))}
          </div>

          <div className="hero-overlay" />
        </div>

        {/* content */}
        <div className="hero-content">
          <div className="hero-info">
            <h1 className="hero-title">{currentContent.title}</h1>
            <h2 className="hero-subtitle">{currentContent.subtitle}</h2>

            <div className="hero-meta">
              <span className="year">{currentContent.year}</span>
            </div>

            <p className="hero-description">{currentContent.description}</p>
            <div className="hero-type">{currentContent.type}</div>

            <div className="hero-cta">
              <button
                type="button"
                className="hero-btn hero-btn-primary"
                onMouseEnter={() => {
                  if (!isTouchLike) setIsHeroBtnHovered(true);
                }}
                onMouseLeave={() => {
                  if (!isTouchLike) setIsHeroBtnHovered(false);
                }}
                onClick={() => openProject(currentContent.id)}
              >
                <span className="hero-btn-icon" aria-hidden>
                  ℹ
                </span>
                상세 보기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="project-grid-section">
        <h3 className="section-title">Crafted Works</h3>

        <div className="project-grid" ref={gridRef}>
          {slides.map((item) => (
            <div
              key={item.id}
              className={`project-card ${hoveredItem === item.id ? 'active' : ''}`}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => openProject(item.id)}
            >
              <div className="card-image">
                <img src={item.image} alt={item.title} draggable="false" />
              </div>

              <div className="card-overlay">
                <div className="card-overlay-content">
                  <h4 className="card-title">{item.title}</h4>

                  <div className="card-meta">
                    <span className="card-year">{item.year}</span>
                    <span className="card-type">{item.type}</span>
                  </div>

                  <div className="card-action">
                    <span className="view-more">자세히 보기</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p
          className={`swipe-hint ${swipeDir === 'left' ? 'is-left' : 'is-right'} ${!hasSwiped ? 'is-nudge' : ''}`}
          aria-hidden="true"
        >
          {swipeDir === 'left' ? (
            <>
              Back <span className="swipe-hint__arrow">←</span>
            </>
          ) : (
            <>
              Swipe to explore more <span className="swipe-hint__arrow">→</span>
            </>
          )}
        </p>
      </div>

      <ProjectModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => {
          setSelectedProjectId(null);
          setHoveredItem(null);
          setIsModalOpen(false);

          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }

          scheduleAutoRestart();
        }}
      />
    </div>
  );
};

export default ProjectSection;
