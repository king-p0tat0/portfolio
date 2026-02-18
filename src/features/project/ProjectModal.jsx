import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './css/ProjectModal.css';

import useIsMobileLike from '@/hooks/useIsMobileLike';

function ProjectModal({ isOpen, project, onClose }) {
  const [activeItemKey, setActiveItemKey] = useState('');
  const [galleryIndex, setGalleryIndex] = useState(0);

  // zoom: { images: [], index: number }
  const [zoom, setZoom] = useState(null);

  const isMobile = useIsMobileLike();
  const tabsRef = useRef(null);

  // ✅ Mobile zoom swipe
  const zoomScrollerRef = useRef(null);
  const zoomTickingRef = useRef(false);

  const bodyRef = useRef(null);
  const panelRef = useRef(null);

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
    const elLeft = (elRect.left - rootRect.left) + root.scrollLeft;
    const target = elLeft - (rootRect.width / 2) + (elRect.width / 2);

    root.scrollTo({
      left: Math.max(0, target),
      behavior: 'smooth',
    });
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

  // ✅ active 바뀌면 갤러리 인덱스 리셋
  useEffect(() => {
    setGalleryIndex(0);

    // ✅ 탭 이동 시 스크롤을 항상 상단으로 리셋
    if (panelRef.current) {
      panelRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }

    if (bodyRef.current) {
      bodyRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [activeItemKey]);

  // ✅ 모달 열릴 때 리셋
  useEffect(() => {
    if (!isOpen) return;
    setZoom(null);
    setGalleryIndex(0);
  }, [isOpen, project?.id]);

  const closeZoom = useCallback(() => setZoom(null), []);

  // ✅ ESC 닫기 (zoom이면 zoom 닫기 우선)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (zoom) closeZoom();
        else onClose?.();
      }

      // ✅ PC zoom에서만 좌우키 네비
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

  const renderText = (item) => {
    if (typeof item?.value !== 'string') return null;

    const paragraphs = item.value
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    if (paragraphs.length === 0) return null;

    return (
      <section>
        {paragraphs.map((p, idx) => (
          <p key={idx}>{p}</p>
        ))}
      </section>
    );
  };

  const renderList = (item) => {
    if (!Array.isArray(item?.value) || item.value.length === 0) return null;

    return (
      <section>
        <ul>
          {item.value.map((v, idx) => (
            <li key={idx}>{v}</li>
          ))}
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
    const current = images[Math.min(galleryIndex, total - 1)];
    const canNavigate = total > 1;

    const goPrev = () => setGalleryIndex((i) => (i - 1 + total) % total);
    const goNext = () => setGalleryIndex((i) => (i + 1) % total);

    return (
      <section className="capture-section">
        <div className="carousel">
          <div className="carousel-stage">
            {canNavigate && (
              <>
                <button
                  type="button"
                  className="carousel-btn is-prev"
                  onClick={goPrev}
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="carousel-btn is-next"
                  onClick={goNext}
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            )}

            <img
              className="capture-img is-clickable"
              src={current.src}
              alt={current.alt ?? ''}
              loading="lazy"
              onClick={() => setZoom({ images, index: galleryIndex })}
            />
          </div>

          <div className="carousel-meta">
            {current.caption && <div className="capture-caption">{current.caption}</div>}

            {canNavigate && (
              <div className="carousel-dots" aria-label="Gallery pagination">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`dot ${idx === galleryIndex ? 'is-active' : ''}`}
                    onClick={() => setGalleryIndex(idx)}
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

    const introParagraphs =
      typeof intro === 'string'
        ? intro.split('\n').map((t) => t.trim()).filter(Boolean)
        : [];

    const hasSections = Array.isArray(sections) && sections.length > 0;
    const hasGallery = Array.isArray(gallery) && gallery.length > 0;

    if (introParagraphs.length === 0 && !hasSections && !hasGallery) return null;

    return (
      <section>
        {hasGallery && renderGallery({ value: gallery })}

        {introParagraphs.map((p, idx) => (
          <p key={idx}>{p}</p>
        ))}

        {hasSections &&
          sections.map((sec, i) => {
            const title = sec?.title?.trim();
            const textParagraphs =
              typeof sec?.text === 'string'
                ? sec.text.split('\n').map((t) => t.trim()).filter(Boolean)
                : [];
            const bullets = Array.isArray(sec?.bullets) && sec.bullets.length > 0 ? sec.bullets : null;

            return (
              <div key={i} className="rich-block">
                {title && <h4 className="rich-title">{title}</h4>}
                {textParagraphs.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
                {bullets && (
                  <ul className="rich-list">
                    {bullets.map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
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

  // ✅ Mobile zoom 열리면 해당 index로 스크롤 맞추기
  useEffect(() => {
    if (!zoom || !isMobile) return;

    const scroller = zoomScrollerRef.current;
    if (!scroller) return;

    requestAnimationFrame(() => {
      const w = scroller.clientWidth || 1;
      scroller.scrollLeft = (zoom.index ?? 0) * w;
    });
  }, [zoom, isMobile]);

  // ✅ Mobile zoom 스크롤 시 현재 index 계산
  const onZoomScroll = useCallback(() => {
    const scroller = zoomScrollerRef.current;
    if (!scroller || zoomTickingRef.current) return;

    zoomTickingRef.current = true;

    requestAnimationFrame(() => {
      const w = scroller.clientWidth || 1;
      const idx = Math.round(scroller.scrollLeft / w);

      setZoom((z) => {
        if (!z) return z;
        const total = z.images?.length ?? 0;
        const safe = Math.max(0, Math.min(idx, Math.max(0, total - 1)));
        if (z.index === safe) return z;
        return { ...z, index: safe };
      });

      zoomTickingRef.current = false;
    });
  }, []);

  // ✅ Zoom Overlay (portal to body)
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
            {/* PC: nav 버튼 유지 */}
            {!isMobile && canNavigate && (
              <>
                <button
                  type="button"
                  className="zoom-nav zoom-prev"
                  onClick={goPrevZoom}
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="zoom-nav zoom-next"
                  onClick={goNextZoom}
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            )}

            {/* Mobile: 스와이프(스크롤 스냅) / PC: 단일 이미지 */}
            {isMobile ? (
              <div
                className="zoom-scroller"
                ref={zoomScrollerRef}
                onScroll={onZoomScroll}
                aria-label="Zoomed image gallery"
              >
                {images.map((img, i) => (
                  <div className="zoom-slide" key={i}>
                    <img className="zoom-img" src={img?.src} alt={img?.alt ?? ''} />
                  </div>
                ))}
              </div>
            ) : (
              <img className="zoom-img" src={currentZoom?.src} alt={currentZoom?.alt ?? ''} />
            )}
          </div>

          {(currentZoom?.caption || total > 1) && (
            <div className="zoom-caption">
              {currentZoom?.caption ?? ''}
              {total > 1 && <span className="zoom-count"> ({safeIndex + 1}/{total})</span>}
            </div>
          )}

          <button type="button" className="zoom-close" onClick={closeZoom}>
            닫기
          </button>
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
      {/* ✅ Zoom은 모달 내부가 아니라 body에 따로 portal (fixed 깨짐/치우침 해결) */}
      {renderZoomOverlay()}

      <div className="project-modal-root">
        <div className="project-modal-backdrop" onClick={onClose} />

        <div className="project-modal-content">
          <button className="project-modal-close" onClick={onClose} aria-label="Close modal">
            ×
          </button>

          <header className="project-modal-header">
            <h2 className="project-title">{project.title}</h2>
            <p className="project-summary">{headerSummary}</p>

            {topStacks.length > 0 && (
              <div className="project-stack-chips" aria-label="Tech stack">
                {topStacks.map((t) => (
                  <span key={t} className="stack-chip">
                    {t}
                  </span>
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
