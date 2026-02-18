import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import './css/ProjectSection.css';

import EzMain from '@/assets/images/projects/ezboard/ez1.png';
import FeMain from '@/assets/images/projects/feelyeon/fe1.png';
import WiMain from '@/assets/images/projects/withme/wi1.png';
import NeMain from '@/assets/images/projects/nexspace/ne1.png';
import PoMain from '@/assets/images/projects/portfolio/po1.png';

import ProjectModal from './ProjectModal';
import { projects } from '@/data/projects';

const ProjectSection = ({ isActive, setIsModalOpen, isModalOpen }) => {
  const sectionRef = useRef(null);

  const [isVisible, setIsVisible] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  // ✅ Hero infinite carousel index (with clones)
  // heroIndex range: 0..slides.length+1
  // real slides are 1..slides.length
  const [heroIndex, setHeroIndex] = useState(1);
  const [heroTransition, setHeroTransition] = useState(true);

  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isHeroBtnHovered, setIsHeroBtnHovered] = useState(false);

  const gridRef = useRef(null);
  const [swipeDir, setSwipeDir] = useState('right');
  const [hasSwiped, setHasSwiped] = useState(false);

  // ✅ hero drag state (refs for perf)
  const heroViewportRef = useRef(null);
  const heroTrackRef = useRef(null);
  const dragRef = useRef({
    active: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    dx: 0,
    dy: 0,
    width: 1,
    baseIndex: 1,
    moved: false,
    raf: 0,
    lockedAxis: null, // 'x' | 'y' | null
  });

  // ✅ slides 고정 (매 렌더마다 새 배열 생성 방지)
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
        description:
          'React를 기반으로 개발한 인터랙티브 웹 포트폴리오로, 직접 개발한 프로젝트를 담았습니다.',
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
      // idx: 0..n+1  => real: 0..n-1
      const n = slides.length;
      if (n === 0) return 0;
      if (idx === 0) return n - 1;
      if (idx === n + 1) return 0;
      return idx - 1;
    },
    [slides.length]
  );

  const realIndex = useMemo(
    () => normalizeHeroIndexToReal(heroIndex),
    [heroIndex, normalizeHeroIndexToReal]
  );

  const currentContent = useMemo(() => {
    // hovered / selected 우선
    const bySelected = selectedProjectId
      ? slides.find((s) => s.id === selectedProjectId)
      : null;
    const byHover = hoveredItem ? slides.find((s) => s.id === hoveredItem) : null;
    const byHero = slides[realIndex] ?? slides[0];
    return bySelected || byHover || byHero || slides[0];
  }, [selectedProjectId, hoveredItem, slides, realIndex]);

  const selectedProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return projects.find((p) => p.id === selectedProjectId) ?? null;
  }, [selectedProjectId, projects]);

  // ✅ 자동 슬라이드 (모달/hover/hero버튼/드래그 중이면 pause)
  useEffect(() => {
    if (isModalOpen) return;
    if (hoveredItem !== null) return;
    if (isHeroBtnHovered) return;
    if (dragRef.current.active) return;

    const intervalId = window.setInterval(() => {
      setHeroTransition(true);
      setHeroIndex((prev) => prev + 1);
    }, 4500);

    return () => clearInterval(intervalId);
  }, [hoveredItem, isModalOpen, isHeroBtnHovered]);

  // ✅ Intersection Observer
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

  // ✅ Grid swipe hint
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

  // ✅ hero transition end: clone edge fix (seamless loop)
  const onHeroTransitionEnd = useCallback(
    (e) => {
      // ✅ hero-track에서 발생한 transition만 처리 (버블링 방지)
      if (e && e.target !== heroTrackRef.current) return;

      const n = slides.length;
      if (n === 0) return;

      // clone 영역이면 transition 없이 진짜 위치로 점프
      if (heroIndex === 0) {
        setHeroTransition(false);
        setHeroIndex(n);
        return;
      }

      if (heroIndex === n + 1) {
        setHeroTransition(false);
        setHeroIndex(1);
        return;
      }
    },
    [heroIndex, slides.length]
  );

  // ✅ when transition is turned off for the jump, re-enable next tick
  useEffect(() => {
    if (!heroTransition) {
      const id = requestAnimationFrame(() => setHeroTransition(true));
      return () => cancelAnimationFrame(id);
    }
  }, [heroTransition]);

  // ----------------------------
  // Hero drag handlers (pointer)
  // ----------------------------
  const clearRaf = () => {
    const st = dragRef.current;
    if (st.raf) cancelAnimationFrame(st.raf);
    st.raf = 0;
  };

  const applyDragTransform = useCallback(() => {
    const track = heroTrackRef.current;
    const v = heroViewportRef.current;
    if (!track || !v) return;

    const st = dragRef.current;
    const base = -st.baseIndex * st.width;
    const x = base + st.dx;

    // ✅ 드래그 중엔 px transform
    track.style.transform = `translate3d(${x}px, 0, 0)`;
  }, []);

  const queueApply = () => {
    const st = dragRef.current;
    if (st.raf) return;
    st.raf = requestAnimationFrame(() => {
      st.raf = 0;
      applyDragTransform();
    });
  };

  const onHeroPointerDown = useCallback(
    (e) => {
      const v = heroViewportRef.current;
      const track = heroTrackRef.current;
      if (!v || !track) return;

      // only primary button / touch
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      const rect = v.getBoundingClientRect();
      const st = dragRef.current;

      st.active = true;
      st.pointerId = e.pointerId;
      st.startX = e.clientX;
      st.startY = e.clientY;
      st.dx = 0;
      st.dy = 0;
      st.width = rect.width || 1;
      st.baseIndex = heroIndex;
      st.moved = false;
      st.lockedAxis = null;

      // 손가락 따라가게(클래스 transition off)
      setHeroTransition(false);

      v.setPointerCapture?.(e.pointerId);
      clearRaf();
    },
    [heroIndex]
  );

  const onHeroPointerMove = useCallback(
    (e) => {
      const v = heroViewportRef.current;
      if (!v) return;

      const st = dragRef.current;
      if (!st.active || st.pointerId !== e.pointerId) return;

      st.dx = e.clientX - st.startX;
      st.dy = e.clientY - st.startY;

      const ax = Math.abs(st.dx);
      const ay = Math.abs(st.dy);

      // axis lock: 처음 움직임으로 수평/수직 결정
      if (!st.lockedAxis) {
        if (ax < 6 && ay < 6) return;
        st.lockedAxis = ax >= ay ? 'x' : 'y';
      }

      // 수직이면 스와이프 개입 안 함
      if (st.lockedAxis === 'y') return;

      st.moved = true;
      queueApply();
    },
    [applyDragTransform]
  );

  const finishHeroDrag = useCallback((e) => {
    const v = heroViewportRef.current;
    const track = heroTrackRef.current;
    if (!v || !track) return;

    const st = dragRef.current;
    if (!st.active || st.pointerId !== e.pointerId) return;

    st.active = false;

    // 수평 드래그가 아니면 종료 (tap/vertical)
    if (st.lockedAxis !== 'x' || !st.moved) {
      // ✅ inline px transform 제거 후, React % transform으로 복귀
      track.style.transform = '';
      setHeroTransition(true);
      setHeroIndex(st.baseIndex);

      st.pointerId = null;
      clearRaf();
      return;
    }

    const threshold = Math.min(80, st.width * 0.18);
    let next = st.baseIndex;

    // swipe left -> next, swipe right -> prev
    if (st.dx <= -threshold) next = st.baseIndex + 1;
    else if (st.dx >= threshold) next = st.baseIndex - 1;

    // ✅ inline px transform 제거 → 이후 React % transform 사용
    track.style.transform = '';

    setHeroTransition(true);
    setHeroIndex(next);

    st.pointerId = null;
    clearRaf();
  }, []);

  const onHeroPointerUp = useCallback((e) => finishHeroDrag(e), [finishHeroDrag]);
  const onHeroPointerCancel = useCallback(
    (e) => finishHeroDrag(e),
    [finishHeroDrag]
  );

  // ✅ hoveredItem이 생기면 heroIndex도 같이 맞춰줌
  useEffect(() => {
    if (!hoveredItem) return;
    const idx = slides.findIndex((s) => s.id === hoveredItem);
    if (idx < 0) return;
    setHeroTransition(true);
    setHeroIndex(idx + 1); // real->heroIndex(클론 포함)
  }, [hoveredItem, slides]);

  // ✅ selectedProjectId로 열 때도 heroIndex 싱크
  const openProject = useCallback(
    (id) => {
      setSelectedProjectId(id);
      const idx = slides.findIndex((s) => s.id === id);
      if (idx >= 0) {
        setHeroTransition(true);
        setHeroIndex(idx + 1);
      }
      setIsModalOpen(true);
    },
    [slides, setIsModalOpen]
  );

  return (
    <div
      ref={sectionRef}
      className={`project-section ${isVisible ? 'is-visible' : ''}`}
    >
      {/* Hero */}
      <div
        className="hero-section"
        ref={heroViewportRef}
        onPointerDown={onHeroPointerDown}
        onPointerMove={onHeroPointerMove}
        onPointerUp={onHeroPointerUp}
        onPointerCancel={onHeroPointerCancel}
      >
        <div className="hero-background hero-carousel">
          <div
            className={`hero-track ${heroTransition ? 'is-animating' : ''}`}
            ref={heroTrackRef}
            style={{
              transform: `translate3d(${-heroIndex * 100}%, 0, 0)`,
            }}
            onTransitionEnd={onHeroTransitionEnd}
          >
            {heroSlides.map((s, i) => (
              <div className="hero-slide" key={`${s.id}-${i}`}>
                <img
                  src={s.image}
                  alt={`${s.title} Background`}
                  draggable="false"
                />
              </div>
            ))}
          </div>

          <div className="hero-overlay"></div>
        </div>

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
                onMouseEnter={() => setIsHeroBtnHovered(true)}
                onMouseLeave={() => setIsHeroBtnHovered(false)}
                onFocus={() => setIsHeroBtnHovered(true)}
                onBlur={() => setIsHeroBtnHovered(false)}
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
              className={`project-card ${
                hoveredItem === item.id ? 'active' : ''
              }`}
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
          className={`swipe-hint ${
            swipeDir === 'left' ? 'is-left' : 'is-right'
          } ${!hasSwiped ? 'is-nudge' : ''}`}
          aria-hidden="true"
        >
          {swipeDir === 'left' ? (
            <>
              Back <span className="swipe-hint__arrow">←</span>
            </>
          ) : (
            <>
              Swipe to explore more{' '}
              <span className="swipe-hint__arrow">→</span>
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
        }}
      />
    </div>
  );
};

export default ProjectSection;
