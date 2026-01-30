import React, { useEffect, useMemo, useRef, useState } from "react";
import { useEducationStore } from "../store/educationStore.js";

const placeholderDocs = [
  {
    id: "example-1",
    institution:
      "Институт Компьютерных технологий и Информационной безопасности (ИКТИБ)",
    program: "Прикладная информатика и математика",
    studyForm: "Очное (дневное обучение)",
    startYear: "2021",
    endYear: "2025",
    documentTitle: "Диплом.pdf",
    documentUrl: "https://example.com/diplom.pdf"
  }
];

export function EducationSlider() {
  const educations = useEducationStore((s) => s.educations);
  const [currentIndex, setCurrentIndex] = useState(0);
  const viewportRef = useRef(null);
  const [layout, setLayout] = useState({
    cardWidth: 320,
    gap: 16,
    viewportWidth: 0
  });

  const docs = useMemo(() => {
    const base = educations.length ? educations : placeholderDocs;
    return base.map((e) => ({
      id: e.id ?? `${e.institution}-${e.startYear}`,
      institution: e.institution,
      program: e.program,
      studyForm: e.studyForm ?? e.level,
      years:
        e.startYear && e.endYear
          ? `${e.startYear} - ${e.endYear} год`
          : e.startYear
          ? `${e.startYear} год`
          : "",
      documentTitle: e.documentTitle || "Диплом.pdf",
      documentUrl: e.documentUrl
    }));
  }, [educations]);

  const visibleCount = useMemo(() => {
    const step = layout.cardWidth + layout.gap;
    if (!layout.viewportWidth || step <= 0) return 1;
    return Math.max(1, Math.floor((layout.viewportWidth + layout.gap) / step));
  }, [layout.cardWidth, layout.gap, layout.viewportWidth]);

  const maxIndex = Math.max(0, docs.length - visibleCount);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < maxIndex;

  const goPrev = () => {
    if (hasPrev) setCurrentIndex((i) => i - 1);
  };

  const goNext = () => {
    if (hasNext) setCurrentIndex((i) => i + 1);
  };

  const handleOpen = (doc) => {
    if (!doc?.documentUrl) return;
    window.open(doc.documentUrl, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const readLayout = () => {
      const sliderEl = el.closest(".slider") ?? el;
      const styles = getComputedStyle(sliderEl);
      const cardWidth = parseFloat(styles.getPropertyValue("--card-width")) || 320;
      const gap = parseFloat(styles.getPropertyValue("--card-gap")) || 16;
      const viewportWidth = el.getBoundingClientRect().width || 0;
      setLayout({ cardWidth, gap, viewportWidth });
    };

    readLayout();

    const ro = new ResizeObserver(() => readLayout());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setCurrentIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  const translateX = currentIndex * (layout.cardWidth + layout.gap);

  return (
    <section className="slider">
      <button
        type="button"
        className="slider__arrow slider__arrow--left"
        onClick={goPrev}
        aria-label="Предыдущий документ"
        disabled={!hasPrev}
      >
        <svg 
          width="28" 
          height="28" 
          viewBox="0 0 28 28" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          >
          <path d="M7.00001 14C7.00569 14.6138 7.253 15.2006 7.68835 15.6333L12.6933 20.65C12.9119 20.8673 13.2076 20.9893 13.5158 20.9893C13.8241 20.9893 14.1198 20.8673 14.3383 20.65C14.4477 20.5415 14.5345 20.4125 14.5937 20.2703C14.6529 20.1282 14.6834 19.9757 14.6834 19.8217C14.6834 19.6677 14.6529 19.5152 14.5937 19.373C14.5345 19.2308 14.4477 19.1018 14.3383 18.9933L10.5 15.1667L22.1667 15.1667C22.4761 15.1667 22.7728 15.0437 22.9916 14.825C23.2104 14.6062 23.3333 14.3094 23.3333 14C23.3333 13.6906 23.2104 13.3938 22.9916 13.175C22.7728 12.9562 22.4761 12.8333 22.1667 12.8333L10.5 12.8333L14.3383 8.995C14.558 8.77686 14.6821 8.48038 14.6832 8.17079C14.6843 7.8612 14.5623 7.56385 14.3442 7.34417C14.126 7.12448 13.8296 7.00044 13.52 6.99935C13.2104 6.99826 12.913 7.12019 12.6933 7.33833L7.68834 12.355C7.25016 12.7906 7.00261 13.3822 7.00001 14Z" 
            fill="black"
          />
        </svg>
      </button>

      <div className="slider__viewport" ref={viewportRef}>
        <div
          className="slider__track"
          style={{ transform: `translateX(-${translateX}px)` }}
        >
          {docs.map((doc) => (
            <article
              key={doc.id}
              className="slider-card"
              onClick={() => handleOpen(doc)}
            >
              <h3 className="slider-card__institution">{doc.institution}</h3>
              <p className="slider-card__program">{doc.program}</p>
              <p className="slider-card__study-form">{doc.studyForm}</p>
              {doc.years && <p className="slider-card__years">{doc.years}</p>}
              <button
                type="button"
                className="slider-card__link"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpen(doc);
                }}
              >
                <span className="slider-card__link-icon">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_7_298)">
                      <path d="M16.4625 4.16372L13.8488 1.54997C12.8573 0.557719 11.5388 0.0117188 10.1363 0.0117188H6.75C5.04525 0.0117188 3.55275 1.16297 3.12225 2.81072C3.01725 3.21122 3.25725 3.62147 3.65775 3.72647C4.06125 3.82922 4.46925 3.59072 4.57275 3.19022C4.8315 2.20247 5.727 1.51172 6.75 1.51172H10.1363C10.26 1.51172 10.3785 1.53572 10.5 1.54697V5.26172C10.5 6.50222 11.5095 7.51172 12.75 7.51172H16.4632C16.4753 7.63322 16.5 7.75322 16.5 7.87547V14.2617C16.5 15.5022 15.4905 16.5117 14.25 16.5117H6.75C6.2325 16.5117 5.7465 16.3407 5.34375 16.019C5.02125 15.7617 4.5495 15.812 4.28925 16.1345C4.0305 16.4585 4.08225 16.9302 4.4055 17.189C5.067 17.7192 5.8995 18.0117 6.74925 18.0117H14.2493C16.317 18.0117 17.9993 16.3295 17.9993 14.2617V7.87547C17.9993 6.47372 17.4532 5.15522 16.4618 4.16372H16.4625ZM12.75 6.01172C12.3368 6.01172 12 5.67572 12 5.26172V2.02397C12.282 2.18672 12.5512 2.37347 12.7875 2.60972L15.4012 5.22347C15.6345 5.45672 15.8205 5.72747 15.9833 6.01097H12.7493L12.75 6.01172ZM7.5 12.0005H13.5C13.914 12.0005 14.25 12.3357 14.25 12.7505C14.25 13.1652 13.914 13.5005 13.5 13.5005H7.5C7.086 13.5005 6.75 13.1652 6.75 12.7505C6.75 12.3357 7.086 12.0005 7.5 12.0005ZM5.25 14.1357V10.5732C5.93025 10.0227 6.375 9.19172 6.375 8.25047C6.375 6.59597 5.0295 5.25047 3.375 5.25047C1.7205 5.25047 0.375 6.59597 0.375 8.25047C0.375 9.19172 0.81975 10.0227 1.5 10.5732V14.1357C1.5 14.603 2.09325 14.8032 2.37675 14.432L3.375 13.1247L4.37325 14.432C4.65675 14.8032 5.25 14.603 5.25 14.1357ZM3.375 6.75047C4.20225 6.75047 4.875 7.42322 4.875 8.25047C4.875 9.07772 4.20225 9.75047 3.375 9.75047C2.54775 9.75047 1.875 9.07772 1.875 8.25047C1.875 7.42322 2.54775 6.75047 3.375 6.75047ZM8.25 10.5005C7.836 10.5005 7.5 10.1652 7.5 9.75047C7.5 9.33572 7.836 9.00047 8.25 9.00047H13.5C13.914 9.00047 14.25 9.33572 14.25 9.75047C14.25 10.1652 13.914 10.5005 13.5 10.5005H8.25Z" fill="black"/>
                    </g>
                    <defs>
                      <clipPath id="clip0_7_298">
                      <rect width="18" height="18" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>

                
                </span>
                <span className="slider-card__link-text">{doc.documentTitle}</span>
              </button>
            </article>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="slider__arrow slider__arrow--right"
        onClick={goNext}
        aria-label="Следующий документ"
        disabled={!hasNext}
      >
        <svg 
          width="28" 
          height="28" 
          viewBox="0 0 28 28" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M21 14C20.9943 13.3862 20.747 12.7994 20.3116 12.3667L15.3066 7.35C15.088 7.13271 14.7923 7.01074 14.4841 7.01074C14.1759 7.01074 13.8802 7.13271 13.6616 7.35C13.5523 7.45846 13.4655 7.58749 13.4063 7.72966C13.347 7.87183 13.3165 8.02432 13.3165 8.17833C13.3165 8.33235 13.347 8.48484 13.4063 8.62701C13.4655 8.76918 13.5523 8.89821 13.6616 9.00667L17.5 12.8333H5.83329C5.52387 12.8333 5.22713 12.9563 5.00833 13.175C4.78954 13.3938 4.66663 13.6906 4.66663 14C4.66663 14.3094 4.78954 14.6062 5.00833 14.825C5.22713 15.0438 5.52387 15.1667 5.83329 15.1667H17.5L13.6616 19.005C13.4419 19.2231 13.3179 19.5196 13.3168 19.8292C13.3157 20.1388 13.4377 20.4361 13.6558 20.6558C13.8739 20.8755 14.1704 20.9996 14.48 21.0007C14.7896 21.0017 15.0869 20.8798 15.3066 20.6617L20.3116 15.645C20.7498 15.2094 20.9974 14.6178 21 14Z" 
          fill="black"
          />
        </svg>

      </button>
    </section>
  );
}

