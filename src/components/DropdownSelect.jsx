import React, { useEffect, useMemo, useRef, useState } from "react";

export function DropdownSelect({
  value,
  onChange,
  placeholder = "Не выбран",
  options,
  allowEmpty = false,
  generateYears = false,
  yearStart = 1980,
  yearEnd = new Date().getFullYear(),
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const yearOptions = useMemo(() => {
    if (!generateYears) return options || [];
    
    const years = [];
    for (let year = yearEnd; year >= yearStart; year--) {
      years.push({
        value: String(year),
        label: String(year),
      });
    }
    return years;
  }, [generateYears, yearStart, yearEnd, options]);

  const selected = useMemo(
    () => yearOptions.find((o) => String(o.value) === String(value)),
    [yearOptions, value]
  );

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="select" ref={rootRef}>
      <button
        type="button"
        className="select__button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`select__value ${selected ? "" : "select__value--muted"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <span className={`select__chevron ${open ? "select__chevron--open" : ""}`}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M7 10l5 5 5-5"
              stroke="#121212"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {open && (
        <div className="select__menu" role="listbox">
          {allowEmpty && (
            <button
              type="button"
              className={`select__option ${!value ? "select__option--selected" : ""}`}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              <span>Не выбран</span>
              {!value && <span className="select__check">✓</span>}
            </button>
          )}

          {options.map((opt) => {
            const isSelected = String(opt.value) === String(value);
            return (
              <button
                key={String(opt.value)}
                type="button"
                className={`select__option ${isSelected ? "select__option--selected" : ""}`}
                onClick={() => {
                  onChange(String(opt.value));
                  setOpen(false);
                }}
              >
                <span>{opt.label}</span>
                {isSelected && <span className="select__check">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

