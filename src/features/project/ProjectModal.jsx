import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './css/ProjectModal.css';

import useIsMobileLike from '@/hooks/useIsMobileLike';

const SWIPE_THRESHOLD_PX = 28;
const SWIPE_VELOCITY_BOOST = 0.15;

function ProjectModal({ isOpen, project, onClose }) {
  const [activeItemKey, setActiveItemKey] = useState('');
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [zoom, setZoom] = useState(null);

  const isMobile = useIsMobileLike();

  const tabsRef = useRef(null);
  const bodyRef = useRef(null);
  const panelRef = useRef(null);
  const trackRef = useRef(null);
  const zoomTrackRef = useRef(null);

  const galleryScrollerRef = useRef(null);
  const galleryTotalRef = useRef(0);

  const zoomScrollerRef = useRef(null);

  const galleryStartIndexRef = useRef(0);
  const zoomStartIndexRef = useRef(0);

  const outline = useMemo(() => project?.outline ?? [], [project]);

  const itemMap = useMemo(() => {
    const map = new Map();
    outline.forEach((group) => {
      (group.items ?? []).forEach((item) => {
        if (item?.key) map.set(item.key, item);
      });
    });
    return map;
  }, [outline]);

  const mobileTabs = useMemo(() => {
    const tabs = [];
    outline.forEach((g) => {
      (g.items ?? []).forEach((it) => {
        if (!it?.key) return;
        tabs.push({ key: it.key, label: it.label });
      });
    });
    return tabs;
  }, [outline]);

  // ✅ active 탭 자동 중앙 정렬
  useEffect(() => {
    if (!isMobile || !isOpen) return;
    const root = tabsRef.current;
    if (!root) return;
    const activeEl = root.querySelector(`.tab-item[data-key="${activeItemKey}"]`);
    if (!activeEl) return;
    const rootRect = root.getBoundingClientRect();
    const elRect = activeEl.getBoundingClientRect();
    const elLeft = elRect.left - rootRect.left + root.scrollLeft;
    const target = elLeft - rootRect.width / 2 + elRect.width / 2;
    root.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
  }, [activeItemKey, isMobile, isOpen]);

  // ✅ 첫 번째 아이템 active
  useEffect(() => {
    if (!isOpen) return;
    const firstKey = outline?.[0]?.items?.[0]?.key;
    setActiveItemKey(firstKey || '');
  }, [isOpen, project?.id, outline]);

  const activeItem = useMemo(() => {
    if (!activeItemKey) return null;
    return itemMap.get(activeItemKey) ?? null;
  }, [itemMap, activeItemKey]);

  const snapGalleryTo = useCallback((idx) => {
    if (!trackRef.current) return;
    trackRef.current.classList.remove('is-dragging');
    trackRef.current.style.transform = `translateX(-${idx * 100}%)`;
  }, []);

  // ✅ NEW: 리셋할 땐 transition 없이 "즉시" 붙이기 (되돌아오는 모션 제거)
  const snapGalleryToInstant = useCallback((idx) => {
    const el = trackRef.current;
    if (!el) return;

    // is-dragging => CSS에서 transition: none;
    el.classList.add('is-dragging');
    el.style.transform = `translateX(-${idx * 100}%)`;

    // reflow 한 번 먹여서 "transition 없이 적용"을 확정
    el.getBoundingClientRect();

    // 다음 프레임부터는 원래 transition 복구
    requestAnimationFrame(() => {
      el.classList.remove('is-dragging');
    });
  }, []);

  const snapZoomTo = useCallback((idx) => {
    if (!zoomTrackRef.current) return;
    zoomTrackRef.current.classList.remove('is-dragging');
    zoomTrackRef.current.style.transform = `translateX(-${idx * 100}%)`;
  }, []);

  // =========================================================
  // ✅ 스와이프 이벤트
  // =========================================================
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const galleryEl = galleryScrollerRef.current;
    const zoomEl = zoomScrollerRef.current;

    // ---------- Gallery ----------
    const gState = { x0: 0, y0: 0, t0: 0, dx: 0, dy: 0, locked: null };

    const onGStart = (e) => {
      const t = e.touches?.[0];
      if (!t || !galleryEl) return;
      gState.x0 = t.clientX;
      gState.y0 = t.clientY;
      gState.t0 = performance.now();
      gState.dx = 0;
      gState.dy = 0;
      gState.locked = null;
      galleryStartIndexRef.current = galleryIndex;
      if (trackRef.current) trackRef.current.classList.add('is-dragging');
    };

    const onGMove = (e) => {
      const t = e.touches?.[0];
      if (!t) return;
      gState.dx = t.clientX - gState.x0;
      gState.dy = t.clientY - gState.y0;
      const ax = Math.abs(gState.dx);
      const ay = Math.abs(gState.dy);
      if (!gState.locked) {
        if (ax < 6 && ay < 6) return;
        gState.locked = ax >= ay ? 'x' : 'y';
      }
      if (gState.locked === 'x' && trackRef.current && galleryEl) {
        const offset = -(galleryStartIndexRef.current * 100);
        const dragOffset = (gState.dx / galleryEl.clientWidth) * 100;
        trackRef.current.style.transform = `translateX(calc(${offset}% + ${dragOffset}px))`;
      }
    };

    const onGEnd = () => {
      const total = galleryTotalRef.current || 0;
      if (!galleryEl || total <= 1) return;

      const dx = gState.dx;
      const dy = gState.dy;
      const dt = Math.max(1, performance.now() - gState.t0);
      const vx = dx / dt;

      if (Math.abs(dy) > Math.abs(dx)) {
        snapGalleryTo(galleryStartIndexRef.current);
        return;
      }

      const pass = Math.abs(dx) >= SWIPE_THRESHOLD_PX || Math.abs(vx) >= SWIPE_VELOCITY_BOOST;
      const startIdx = Math.max(0, Math.min(galleryStartIndexRef.current, total - 1));
      const target = pass
        ? (dx < 0 ? Math.min(startIdx + 1, total - 1) : Math.max(startIdx - 1, 0))
        : startIdx;

      setGalleryIndex(target);
      snapGalleryTo(target);
    };

    // ---------- Zoom ----------
    const zState = { x0: 0, y0: 0, t0: 0, dx: 0, dy: 0, locked: null };

    const onZStart = (e) => {
      const t = e.touches?.[0];
      if (!t || !zoomEl) return;
      zState.x0 = t.clientX;
      zState.y0 = t.clientY;
      zState.t0 = performance.now();
      zState.dx = 0;
      zState.dy = 0;
      zState.locked = null;
      zoomStartIndexRef.current = zoom?.index ?? 0;
      if (zoomTrackRef.current) zoomTrackRef.current.classList.add('is-dragging');
    };

    const onZMove = (e) => {
      const t = e.touches?.[0];
      if (!t) return;
      zState.dx = t.clientX - zState.x0;
      zState.dy = t.clientY - zState.y0;
      const ax = Math.abs(zState.dx);
      const ay = Math.abs(zState.dy);
      if (!zState.locked) {
        if (ax < 6 && ay < 6) return;
        zState.locked = ax >= ay ? 'x' : 'y';
      }
      if (zState.locked === 'x' && zoomTrackRef.current && zoomEl) {
        const offset = -(zoomStartIndexRef.current * 100);
        const dragOffset = (zState.dx / zoomEl.clientWidth) * 100;
        zoomTrackRef.current.style.transform = `translateX(calc(${offset}% + ${dragOffset}px))`;
      }
    };

    const onZEnd = () => {
      if (!zoomEl) return;
      const dx = zState.dx;
      const dy = zState.dy;
      const dt = Math.max(1, performance.now() - zState.t0);
      const vx = dx / dt;

      if (Math.abs(dy) > Math.abs(dx)) {
        snapZoomTo(zoomStartIndexRef.current);
        return;
      }

      setZoom((z) => {
        if (!z?.images?.length) return z;
        const total = z.images.length;
        const pass = Math.abs(dx) >= SWIPE_THRESHOLD_PX || Math.abs(vx) >= SWIPE_VELOCITY_BOOST;
        const startIdx = Math.max(0, Math.min(zoomStartIndexRef.current, total - 1));
        const target = pass
          ? (dx < 0 ? Math.min(startIdx + 1, total - 1) : Math.max(startIdx - 1, 0))
          : startIdx;
        requestAnimationFrame(() => snapZoomTo(target));
        if (target === (z.index ?? 0)) return z;
        return { ...z, index: target };
      });
    };

    const optsMove = { passive: false };
    const optsOther = { passive: true };

    if (galleryEl) {
      galleryEl.addEventListener('touchstart', onGStart, optsOther);
      galleryEl.addEventListener('touchmove', onGMove, optsMove);
      galleryEl.addEventListener('touchend', onGEnd, optsOther);
      galleryEl.addEventListener('touchcancel', onGEnd, optsOther);
    }
    if (zoomEl) {
      zoomEl.addEventListener('touchstart', onZStart, optsOther);
      zoomEl.addEventListener('touchmove', onZMove, optsMove);
      zoomEl.addEventListener('touchend', onZEnd, optsOther);
      zoomEl.addEventListener('touchcancel', onZEnd, optsOther);
    }

    return () => {
      if (galleryEl) {
        galleryEl.removeEventListener('touchstart', onGStart);
        galleryEl.removeEventListener('touchmove', onGMove);
        galleryEl.removeEventListener('touchend', onGEnd);
        galleryEl.removeEventListener('touchcancel', onGEnd);
      }
      if (zoomEl) {
        zoomEl.removeEventListener('touchstart', onZStart);
        zoomEl.removeEventListener('touchmove', onZMove);
        zoomEl.removeEventListener('touchend', onZEnd);
        zoomEl.removeEventListener('touchcancel', onZEnd);
      }
    };
  }, [isMobile, isOpen, galleryIndex, zoom, snapGalleryTo, snapZoomTo]);

  // ✅ zoom state 바뀔 때 track 위치 동기화
  useEffect(() => {
    if (!zoom || !isMobile) return;
    requestAnimationFrame(() => snapZoomTo(zoom.index ?? 0));
  }, [zoom, isMobile, snapZoomTo]);

  // ✅ active 바뀌면 갤러리 인덱스 리셋
  useEffect(() => {
    setGalleryIndex(0);
    if (panelRef.current) panelRef.current.scrollTo({ top: 0, behavior: 'auto' });
    if (bodyRef.current) bodyRef.current.scrollTo({ top: 0, behavior: 'auto' });

    if (isMobile) {
      snapGalleryToInstant(0);
    }
  }, [activeItemKey, isMobile, snapGalleryToInstant]);

  // ✅ 모달 열릴 때 리셋
  useEffect(() => {
    if (!isOpen) return;
    setZoom(null);
    setGalleryIndex(0);

    if (isMobile) {
      snapGalleryToInstant(0);
    }
  }, [isOpen, project?.id, isMobile, snapGalleryToInstant]);

  const closeZoom = useCallback(() => setZoom(null), []);

  // ✅ ESC / 좌우 화살표 키
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (zoom) closeZoom();
        else onClose?.();
      }
      if (!isMobile && zoom && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        const dir = e.key === 'ArrowLeft' ? -1 : 1;
        setZoom((z) => {
          if (!z?.images?.length) return z;
          const t = z.images.length;
          return { ...z, index: (z.index + dir + t) % t };
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, zoom, isMobile, closeZoom]);

  const topStacks = useMemo(() => {
    const s = project?.topStacks;
    return Array.isArray(s) ? s.filter(Boolean) : [];
  }, [project]);

  // =========================================================
  // Render helpers
  // =========================================================
  const renderText = (item) => {
    if (typeof item?.value !== 'string') return null;
    const paragraphs = item.value.split('\n').map((t) => t.trim()).filter(Boolean);
    if (paragraphs.length === 0) return null;
    return (
      <section>
        {paragraphs.map((p, idx) => <p key={idx}>{p}</p>)}
      </section>
    );
  };

  const renderList = (item) => {
    if (!Array.isArray(item?.value) || item.value.length === 0) return null;
    return (
      <section>
        <ul>
          {item.value.map((v, idx) => <li key={idx}>{v}</li>)}
        </ul>
      </section>
    );
  };

  const renderImage = (item) => {
    if (!item?.value) return null;
    const v = item.value;
    const src = typeof v === 'string' ? v : v.src;
    const alt = typeof v === 'string' ? '' : v.alt ?? '';
    const caption = typeof v === 'string' ? '' : v.caption ?? '';
    if (!src) return null;
    return (
      <section className="capture-section">
        <figure className="capture-figure">
          <img className="capture-img" src={src} alt={alt} loading="lazy" />
          {caption && <figcaption className="capture-caption">{caption}</figcaption>}
        </figure>
      </section>
    );
  };

  const renderGallery = (item) => {
    if (!Array.isArray(item?.value) || item.value.length === 0) return null;

    const images = item.value;
    const total = images.length;
    const canNavigate = total > 1;

    galleryTotalRef.current = total;

    const current = images[Math.min(galleryIndex, total - 1)];

    const goPrev = () => {
      const next = (galleryIndex - 1 + total) % total;
      setGalleryIndex(next);
      snapGalleryTo(next);
    };
    const goNext = () => {
      const next = (galleryIndex + 1) % total;
      setGalleryIndex(next);
      snapGalleryTo(next);
    };

    return (
      <section className="capture-section">
        <div className="carousel">
          <div className={`carousel-stage ${isMobile ? 'is-swipe' : ''}`}>
            {!isMobile && canNavigate && (
              <>
                <button type="button" className="carousel-btn is-prev" onClick={goPrev} aria-label="Previous image">‹</button>
                <button type="button" className="carousel-btn is-next" onClick={goNext} aria-label="Next image">›</button>
              </>
            )}

            {isMobile ? (
              <div className="carousel-scroller" ref={galleryScrollerRef}>
                <div
                  className="carousel-track"
                  ref={trackRef}
                  style={{ transform: `translateX(-${galleryIndex * 100}%)` }}
                >
                  {images.map((img, i) => (
                    <div className="carousel-slide" key={i}>
                      <img
                        className="capture-img is-clickable"
                        src={img?.src}
                        alt={img?.alt ?? ''}
                        loading="lazy"
                        onClick={() => setZoom({ images, index: i })}
                        draggable="false"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <img
                className="capture-img is-clickable"
                src={current?.src}
                alt={current?.alt ?? ''}
                loading="lazy"
                onClick={() => setZoom({ images, index: galleryIndex })}
                draggable="false"
              />
            )}
          </div>

          <div className="carousel-meta">
            {current?.caption && <div className="capture-caption">{current.caption}</div>}
            {canNavigate && (
              <div className="carousel-dots" aria-label="Gallery pagination">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`dot ${idx === galleryIndex ? 'is-active' : ''}`}
                    onClick={() => {
                      setGalleryIndex(idx);
                      if (isMobile) snapGalleryTo(idx);
                    }}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  };

  const renderRich = (item) => {
    if (!item?.value) return null;
    const { intro, sections, gallery } = item.value;
    const introParagraphs = typeof intro === 'string'
      ? intro.split('\n').map((t) => t.trim()).filter(Boolean)
      : [];
    const hasSections = Array.isArray(sections) && sections.length > 0;
    const hasGallery = Array.isArray(gallery) && gallery.length > 0;
    if (introParagraphs.length === 0 && !hasSections && !hasGallery) return null;

    return (
      <section>
        {hasGallery && renderGallery({ value: gallery })}
        {introParagraphs.map((p, idx) => <p key={idx}>{p}</p>)}
        {hasSections && sections.map((sec, i) => {
          const title = sec?.title?.trim();
          const textParagraphs = typeof sec?.text === 'string'
            ? sec.text.split('\n').map((t) => t.trim()).filter(Boolean)
            : [];
          const bullets = Array.isArray(sec?.bullets) && sec.bullets.length > 0 ? sec.bullets : null;
          return (
            <div key={i} className="rich-block">
              {title && <h4 className="rich-title">{title}</h4>}
              {textParagraphs.map((p, idx) => <p key={idx}>{p}</p>)}
              {bullets && (
                <ul className="rich-list">
                  {bullets.map((b, idx) => <li key={idx}>{b}</li>)}
                </ul>
              )}
            </div>
          );
        })}
      </section>
    );
  };

  const renderItem = (item) => {
    if (!item) return null;
    if (item.type === 'gallery') return renderGallery(item);
    if (item.type === 'image') return renderImage(item);
    if (item.type === 'rich') return renderRich(item);
    if (item.type === 'list') return renderList(item);
    return renderText(item);
  };

  const renderZoomOverlay = () => {
    if (!zoom) return null;

    const images = zoom.images ?? [];
    const total = images.length;
    const safeIndex = Math.max(0, Math.min(zoom.index ?? 0, total - 1));
    const currentZoom = images[safeIndex];
    const canNavigate = total > 1;

    const goPrevZoom = () =>
      setZoom((z) => {
        if (!z?.images?.length) return null;
        const t = z.images.length;
        return { ...z, index: (z.index - 1 + t) % t };
      });

    const goNextZoom = () =>
      setZoom((z) => {
        if (!z?.images?.length) return null;
        const t = z.images.length;
        return { ...z, index: (z.index + 1) % t };
      });

    return createPortal(
      <div className="zoom-backdrop" onClick={closeZoom} role="dialog" aria-modal="true">
        <div className="zoom-content" onClick={(e) => e.stopPropagation()}>
          <div className="zoom-viewport">
            {!isMobile && canNavigate && (
              <>
                <button type="button" className="zoom-nav zoom-prev" onClick={goPrevZoom} aria-label="Previous image">‹</button>
                <button type="button" className="zoom-nav zoom-next" onClick={goNextZoom} aria-label="Next image">›</button>
              </>
            )}

            {isMobile ? (
              <div className="zoom-scroller" ref={zoomScrollerRef} aria-label="Zoomed image gallery">
                <div
                  className="carousel-track"
                  ref={zoomTrackRef}
                  style={{ transform: `translateX(-${safeIndex * 100}%)` }}
                >
                  {images.map((img, i) => (
                    <div className="carousel-slide" key={i}>
                      <img className="zoom-img" src={img?.src} alt={img?.alt ?? ''} draggable="false" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <img className="zoom-img" src={currentZoom?.src} alt={currentZoom?.alt ?? ''} draggable="false" />
            )}
          </div>

          {(currentZoom?.caption || total > 1) && (
            <div className="zoom-caption">
              {currentZoom?.caption ?? ''}
              {total > 1 && <span className="zoom-count"> ({safeIndex + 1}/{total})</span>}
            </div>
          )}

          <button type="button" className="zoom-close" onClick={closeZoom}>닫기</button>
        </div>
      </div>,
      document.body
    );
  };

  if (!isOpen || !project) return null;

  const headerSummary =
    typeof project.summary === 'string' && project.summary.trim() ? project.summary : '· ·';

  return createPortal(
    <>
      {renderZoomOverlay()}

      <div className="project-modal-root">
        <div className="project-modal-backdrop" onClick={onClose} />

        <div className="project-modal-content">
          <button className="project-modal-close" onClick={onClose} aria-label="Close modal">×</button>

          <header className="project-modal-header">
            <h2 className="project-title">{project.title}</h2>
            <p className="project-summary">{headerSummary}</p>
            {topStacks.length > 0 && (
              <div className="project-stack-chips" aria-label="Tech stack">
                {topStacks.map((t) => (
                  <span key={t} className="stack-chip">{t}</span>
                ))}
              </div>
            )}
          </header>

          <div className="project-modal-body" ref={bodyRef}>
            {isMobile ? (
              <div className="project-modal-mobileShell">
                <nav className="project-modal-tabs" ref={tabsRef} aria-label="Project outline tabs">
                  {mobileTabs.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      className={`tab-item ${activeItemKey === t.key ? 'is-active' : ''}`}
                      data-key={t.key}
                      onClick={() => setActiveItemKey(t.key)}
                    >
                      {t.label}
                    </button>
                  ))}
                </nav>
                <div className="project-modal-panel is-mobile" ref={panelRef}>
                  {renderItem(activeItem)}
                </div>
              </div>
            ) : (
              <>
                <nav className="project-modal-nav" aria-label="Project outline">
                  {outline.map((group, idx) => (
                    <div key={group.key} className="project-nav-group">
                      <div className="project-nav-group-title">{group.label}</div>
                      <div className="project-nav-group-items">
                        {(group.items ?? []).map((item) => (
                          <button
                            key={item.key}
                            type="button"
                            className={`project-nav-item ${activeItemKey === item.key ? 'is-active' : ''}`}
                            onClick={() => setActiveItemKey(item.key)}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                      {idx !== outline.length - 1 && <hr className="project-nav-divider" />}
                    </div>
                  ))}
                </nav>
                <div className="project-modal-panel" ref={panelRef}>
                  {renderItem(activeItem)}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

export default ProjectModal;