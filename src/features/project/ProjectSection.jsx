import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const [isHeroBtnHovered, setIsHeroBtnHovered] = useState(false);

  const gridRef = useRef(null);
  const [swipeDir, setSwipeDir] = useState('right');

  const [hasSwiped, setHasSwiped] = useState(false);

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

  const selectedProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return projects.find((p) => p.id === selectedProjectId) ?? null;
  }, [selectedProjectId, projects]);

  const currentContent = useMemo(() => {
    const bySelected = selectedProjectId
      ? slides.find((s) => s.id === selectedProjectId)
      : null;
    const byHover = hoveredItem ? slides.find((s) => s.id === hoveredItem) : null;
    const bySlide = slides[currentSlide];

    return bySelected || byHover || bySlide || slides[0];
  }, [selectedProjectId, hoveredItem, currentSlide, slides]);

  // ✅ 자동 슬라이드
  // - 모달 열림 / 카드 hover / hero 버튼 hover 시 pause
  // - interval + timeout 모두 cleanup
  useEffect(() => {
    if (isModalOpen) return;
    if (hoveredItem !== null) return;
    if (isHeroBtnHovered) return;

    let timeoutId = null;

    const intervalId = window.setInterval(() => {
      setIsTransitioning(true);

      timeoutId = window.setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setIsTransitioning(false);
      }, 300);
    }, 4500);

    return () => {
      clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [slides.length, hoveredItem, isModalOpen, isHeroBtnHovered]);

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

  return (
    <div
      ref={sectionRef}
      className={`project-section ${isVisible ? 'is-visible' : ''}`}
    >
      {/* Hero */}
      <div className="hero-section">
        <div className="hero-background">
          <img
            src={currentContent.image}
            alt={`${currentContent.title} Background`}
            className={isTransitioning ? 'fade-out' : 'fade-in'}
          />
          <div className="hero-overlay"></div>
        </div>

        <div className="hero-content">
          <div
            className={`hero-info ${hoveredItem ? 'content-changing' : ''} ${
              isTransitioning ? 'fade-out' : 'fade-in'
            }`}
          >
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
                onClick={() => {
                  setSelectedProjectId(currentContent.id);
                  setCurrentSlide(slides.findIndex((s) => s.id === currentContent.id));
                  setIsModalOpen(true);
                }}
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
              onMouseEnter={() => {
                setHoveredItem(item.id);
                setCurrentSlide(slides.findIndex((s) => s.id === item.id));
              }}
              onMouseLeave={() => setHoveredItem(null)}
              onClick={() => {
                setSelectedProjectId(item.id);
                setCurrentSlide(slides.findIndex((s) => s.id === item.id));
                setIsModalOpen(true);
              }}
            >
              <div className="card-image">
                <img src={item.image} alt={item.title} />
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
              <>Back <span className="swipe-hint__arrow">←</span></>
            ) : (
              <>Swipe to explore more <span className="swipe-hint__arrow">→</span></>
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
