import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { createPortal } from 'react-dom';

import ProfileImgPC from '@/assets/images/profile/profile-image-pc.png';
import ProfileImgMobile from '@/assets/images/profile/profile-image-mobile.png';

import { faAngleDown } from '@fortawesome/free-solid-svg-icons';

import JavaIcon from '@/assets/images/icon/java.png';
import SqlIcon from '@/assets/images/icon/sql.png';
import HtmlIcon from '@/assets/images/icon/html.png';
import CssIcon from '@/assets/images/icon/css.png';
import ReactIcon from '@/assets/images/icon/react.png';
import GitHubIcon from '@/assets/images/icon/github.png';
import NotionIcon from '@/assets/images/icon/notion.png';

import JavaIconMobile from '@/assets/images/icon/java-mobile.png';
import SqlIconMobile from '@/assets/images/icon/sql-mobile.png';
import NotionIconMobile from '@/assets/images/icon/notion-mobile.png';

import './css/ProfileSection.css';

const SHEET = {
  PROFILE: 'profile',
  EXPERIENCE: 'experience',
  SKILLS: 'skills',
};

const useIsMobileLike = () => {
  const [isMobileLike, setIsMobileLike] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(
      `
      (max-width: 768px),
      ((hover: none) and (pointer: coarse)),
      (orientation: landscape) and (max-height: 520px)
      `
    );

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


function ProfileSection({ setIsModalOpen, isActive }) {
  const isMobile = useIsMobileLike();

  // 어떤 시트를 열었는지
  const [openSheet, setOpenSheet] = useState(null);

  // DOM 마운트 여부 / 애니메이션 open class
  const [sheetMounted, setSheetMounted] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const openBottomSheet = useCallback((sheetKey) => {
    setOpenSheet(sheetKey); // 내용 지정
    setSheetMounted(true); // DOM 생성
    requestAnimationFrame(() => setSheetOpen(true)); // 다음 프레임에 open → 트랜지션
  }, []);

  const closeSheet = useCallback(() => {
    // aria-hidden/focus 경고 방지: 닫기 전에 포커스 제거
    document.activeElement?.blur?.();
    setSheetOpen(false); // 닫힘 애니메이션 시작
  }, []);

  // 시트 열리면 App의 slide 제스처/휠 잠금
  useEffect(() => {
    setIsModalOpen?.(sheetMounted && sheetOpen);
  }, [sheetMounted, sheetOpen, setIsModalOpen]);

  // ESC 닫기
  useEffect(() => {
    if (!sheetMounted) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeSheet();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [sheetMounted, closeSheet]);

  // 닫힘 애니메이션 끝난 뒤 언마운트 + 내용 비우기
  useEffect(() => {
    if (!sheetMounted) return;
    if (sheetOpen) return;

    const t = setTimeout(() => {
      setSheetMounted(false);
      setOpenSheet(null);
    }, 260); // CSS transition 시간과 맞추기

    return () => clearTimeout(t);
  }, [sheetMounted, sheetOpen]);

  const languages = useMemo(
    () => [
      {
        src: JavaIcon,
        mobileSrc: JavaIconMobile,
        alt: 'Java icon',
        className: 'java-icon',
      },
      {
        src: SqlIcon,
        mobileSrc: SqlIconMobile,
        alt: 'SQL icon',
        className: 'sql-icon',
      },
    ],
    []
  );

  const frontends = useMemo(
    () => [
      { src: HtmlIcon, alt: 'HTML icon', className: 'html-icon' },
      { src: CssIcon, alt: 'CSS icon', className: 'css-icon' },
      { src: ReactIcon, alt: 'React icon', className: 'react-icon' },
    ],
    []
  );

  const tools = useMemo(
    () => [
      { src: GitHubIcon, alt: 'GitHub icon' },
      {
        src: NotionIcon,
        mobileSrc: NotionIconMobile,
        alt: 'Notion icon',
      },
    ],
    []
  );

  const experiences = useMemo(
    () => [
      { period: '2024.11~2024.12', project: "키보드 쇼핑몰 'EZ Board' 개발" },
      { period: '2024.12~2025.01', project: "필기구 쇼핑몰 '필연(必然)' 개발" },
      { period: '2025.01~2025.02', project: "반려견 문진 관리 시스템 '위드미' 개발" },
      { period: '2025.02~2025.03', project: "통합구매관리 시스템 'Nexspace ERP' 개발 및 배포" },
    ],
    []
  );

  const sheetTitle =
    openSheet === SHEET.PROFILE
      ? 'About Me'
      : openSheet === SHEET.EXPERIENCE
        ? 'Development Experience'
        : openSheet === SHEET.SKILLS
          ? 'Skills & Tools'
          : '';

  // ✅ Scroll hint 조건: 모바일 + 현재(Profile) 슬라이드 + 시트 닫힘
  const showScrollHint = isMobile && isActive && !sheetMounted;

  // "잠깐 있다가" 등장 (갑툭튀 방지)
  const [hintVisible, setHintVisible] = useState(false);

  useEffect(() => {
    if (!showScrollHint) {
      setHintVisible(false);
      return;
    }
    const t = setTimeout(() => setHintVisible(true), 1200);
    return () => clearTimeout(t);
  }, [showScrollHint]);

  return (
    <div className="profile-section">
      <div className="profile-container">
        {/* ================================
            Left: Image + Name + Info
        ================================= */}
        <div className="profile-image">
          <img src={isMobile ? ProfileImgMobile : ProfileImgPC} alt="Profile" />

          <section className="profile-name">
            <p className="profile-name--kr">정서윤</p>
            <p className="profile-name--en">Jung Seoyun</p>
          </section>

          <dl className="profile-info">
            <div className="profile-info__item">
              <dt className="profile-info__label">Birth Date</dt>
              <dd className="profile-info__value">2000.09.26</dd>
            </div>
            <div className="profile-info__item">
              <dt className="profile-info__label">Mobile</dt>
              <dd className="profile-info__value">010.7667.9260</dd>
            </div>
            <div className="profile-info__item">
              <dt className="profile-info__label">E-mail</dt>
              <dd className="profile-info__value">yuni9260@naver.com</dd>
            </div>
          </dl>
        </div>

        {/* ================================
            Right: Content
        ================================= */}
        <div className="profile-content">
          <h1 className="profile-title">
            <span className="title-line1">Beyond Interface</span>
            <br className="mobile-only" />
            <span className="title-line2">화면 너머의 마음을 설계합니다.</span>
          </h1>

          <div className="profile-descriptions">
            <p className="profile-description">
              풀스택 개발자 과정을 수료하며 백엔드부터 프론트엔드까지 다양한 영역을 경험했지만
            </p>
            <p className="profile-description">
              그중 사용자와 가장 가까운 접점인 UI · UX 설계에 가장 큰 열정을 쏟으며 그만큼의 보람을 느꼈습니다.
            </p>
            <p className="profile-description">
              UI는 단순한 화면이 아니라 UX 위에서 코드로 완성되는{' '}
              <span className="profile-description--highlight">사용자 경험의 핵심</span>이라고 생각합니다.
            </p>
          </div>

          <section className="development-experience">
            <div className="title-with-bar">
              <div className="title-bar" />
              <h2 className="experience-title">Development Experience</h2>
            </div>

            <ul className="experience-list">
              {experiences.map((exp, index) => (
                <li className="experience-item" key={index}>
                  <span className="experience-period">{exp.period}</span>
                  <span className="experience-project">{exp.project}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="skills-tools">
            <div className="title-with-bar">
              <div className="title-bar" />
              <h2 className="skill-title">Skills & Tools</h2>
            </div>

            <div className="skills-tools__groups">
              <div className="skills-tools__group">
                <h3 className="skills-tools__title">Language</h3>
                <ul className="skills-tools__list">
                  {languages.map((item, index) => (
                    <li className="skills-tools__item" key={index}>
                      <img
                        src={isMobile && item.mobileSrc ? item.mobileSrc : item.src}
                        alt={item.alt}
                        className={`icon-image ${item.className || ''}`}
                      />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="skills-tools__group">
                <h3 className="skills-tools__title">Frontend</h3>
                <ul className="skills-tools__list">
                  {frontends.map((item, index) => (
                    <li className="skills-tools__item" key={index}>
                      <img src={item.src} alt={item.alt} className={`icon-image ${item.className || ''}`} />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="skills-tools__group">
                <h3 className="skills-tools__title">Cooperation</h3>
                <ul className="skills-tools__list">
                  {tools.map((item, index) => (
                    <li className="skills-tools__item" key={index}>
                      <img
                        src={isMobile && item.mobileSrc ? item.mobileSrc : item.src}
                        alt={item.alt}
                        className="icon-image"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 모바일 전용 버튼 (PC에서는 숨김) */}
          <div className="mobile-sheet-actions">
            <button type="button" className="sheet-btn" onClick={() => openBottomSheet(SHEET.PROFILE)}>
              About Me
            </button>
            <button type="button" className="sheet-btn" onClick={() => openBottomSheet(SHEET.EXPERIENCE)}>
              Development Experience
            </button>
            <button type="button" className="sheet-btn" onClick={() => openBottomSheet(SHEET.SKILLS)}>
              Skills & Tools
            </button>
          </div>
        </div>
      </div>

      {showScrollHint &&
        createPortal(
          <div className={`scroll-hint ${hintVisible ? 'is-visible' : ''}`} aria-hidden={!hintVisible}>
            <span className="scroll-hint__text">VIEW PROJECTS</span>

            <span className="scroll-hint__iconWrap" aria-hidden="true">
              <FontAwesomeIcon className="scroll-hint__icon" icon={faAngleDown} />
            </span>
          </div>,
          document.body
        )}

      {/* Bottom Sheet */}
      {sheetMounted &&
        createPortal(
          <div className={`bottom-sheet ${sheetOpen ? 'is-open' : ''}`}>
            <div className="bottom-sheet__backdrop" onClick={closeSheet} />

            <div className="bottom-sheet__panel" role="dialog" aria-modal="true">
              <div className="bottom-sheet__handle" />

              <div className="bottom-sheet__header">
                <h3 className="bottom-sheet__title">{sheetTitle}</h3>
                <button type="button" className="bottom-sheet__close" onClick={closeSheet}>
                  ✕
                </button>
              </div>

              <div className="bottom-sheet__body">
                {openSheet === SHEET.PROFILE && (
                  <div className="sheet-profile">
                    <div className="sheet-profile__intro">
                      <p className="sheet-profile__desc">
                        UI는 단순한 화면이 아니라 UX 위에서 코드로 완성되는{' '}
                        <span className="sheet-profile__hl">사용자 경험의 핵심</span>이라고 생각합니다.
                      </p>
                    </div>

                    <dl className="sheet-profile-info">
                      <div className="profile-info__item">
                        <dt className="profile-info__label">Birth Date</dt>
                        <dd className="profile-info__value">2000.09.26</dd>
                      </div>
                      <div className="profile-info__item">
                        <dt className="profile-info__label">Mobile</dt>
                        <dd className="profile-info__value">010.7667.9260</dd>
                      </div>
                      <div className="profile-info__item">
                        <dt className="profile-info__label">E-mail</dt>
                        <dd className="profile-info__value">yuni9260@naver.com</dd>
                      </div>
                    </dl>
                  </div>
                )}

                {openSheet === SHEET.EXPERIENCE && (
                  <ul className="sheet-experience">
                    {experiences.map((exp, idx) => (
                      <li key={idx} className="sheet-experience__item">
                        <div className="sheet-experience__period">{exp.period}</div>
                        <div className="sheet-experience__project">{exp.project}</div>
                      </li>
                    ))}
                  </ul>
                )}

                {openSheet === SHEET.SKILLS && (
                  <div className="sheet-skills">
                    <div className="sheet-skills__group">
                      <h4 className="sheet-skills__group-title">Language</h4>
                      <div className="sheet-skills__icons">
                        {languages.map((it, idx) => (
                          <img
                            key={idx}
                            src={isMobile && it.mobileSrc ? it.mobileSrc : it.src}
                            alt={it.alt}
                            className="icon-image"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="sheet-skills__group">
                      <h4 className="sheet-skills__group-title">Frontend</h4>
                      <div className="sheet-skills__icons">
                        {frontends.map((it, idx) => (
                          <img
                            key={idx}
                            src={it.src}
                            alt={it.alt}
                            className={`icon-image ${it.className || ''}`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="sheet-skills__group">
                      <h4 className="sheet-skills__group-title">Cooperation</h4>
                      <div className="sheet-skills__icons">
                        {tools.map((it, idx) => (
                          <img
                            key={idx}
                            src={isMobile && it.mobileSrc ? it.mobileSrc : it.src}
                            alt={it.alt}
                            className="icon-image"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default ProfileSection;
