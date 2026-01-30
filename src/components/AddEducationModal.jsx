import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEducationStore } from "../store/educationStore.js";
import { DropdownSelect } from "./DropdownSelect.jsx";

const currentYear = new Date().getFullYear();

const baseYearSchema = z
  .string()
  .min(1, "Выберите год")
  .refine(
    (val) => {
      const n = Number(val);
      return Number.isInteger(n) && n >= 1980 && n <= currentYear;
    },
    { message: `Год от 1980 до ${currentYear}` }
  );

const educationSchema = z
  .object({
    institution: z
      .string()
      .min(1, "Введите учебное заведение")
      .max(256, "Максимум 256 символов"),
    program: z
      .string()
      .min(1, "Введите специальность")
      .max(256, "Максимум 256 символов")
      .regex(/^[\p{L}\p{N}\s]+$/u, "Только буквы и цифры"),
    startYear: baseYearSchema,
    endYear: z
      .string()
      .optional()
      .refine(
        (val) => !val || (/^\d{4}$/.test(val) && Number(val) >= 1980 && Number(val) <= currentYear),
        { message: `Год от 1980 до ${currentYear}` }
      )
      .or(z.literal("")),
    studyForm: z
      .string()
      .min(1, "Выберите форму обучения"),
    documentTitle: z
      .string()
      .min(1, "Введите название документа")
      .max(256, "Максимум 256 символов")
      .optional(),
    documentUrl: z
      .string()
      .url("Введите корректную ссылку на документ (https://...)")
      .optional()
      .or(z.literal(""))
  })
  .superRefine((data, ctx) => {
    if (data.endYear && data.startYear) {
      const start = Number(data.startYear);
      const end = Number(data.endYear);
      if (end < start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Год окончания не может быть раньше года начала",
          path: ["endYear"]
        });
      }
    }
  });

export function AddEducationModal({ isOpen, onClose }) {
  const addEducation = useEducationStore((s) => s.addEducation);

  const years = Array.from({ length: currentYear - 1980 + 1 }, (_, i) =>
    String(currentYear - i)
  );
  const yearOptions = years.map((y) => ({ value: y, label: y }));
  
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      institution: "",
      program: "",
      startYear: "",
      endYear: "",
      studyForm: "",
      documentTitle: "Диплом.pdf",
      documentUrl: ""
    }
  });
  
  const startYear = watch("startYear");
  const endYear = watch("endYear");
  
  const endYearOptions = startYear
    ? yearOptions.filter((opt) => Number(opt.value) >= Number(startYear))
    : yearOptions;
  const studyFormOptions = [
    { value: "Очная", label: "Очная" },
    { value: "Заочная", label: "Заочная" },
    { value: "Очно-заочная", label: "Очно-заочная" },
    { value: "Дистанционная", label: "Дистанционная" }
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (startYear && endYear && Number(endYear) < Number(startYear)) {
      setValue("endYear", "");
    }
  }, [startYear, endYear, setValue]);

  const onSubmit = (data) => {
    addEducation(data);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal__header">
          <h2 className="modal__title">Образование</h2>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <g clipPath="url(#clip0_7_619)">
              <path 
                d="M14.1209 12L23.5605 2.56137C24.1465 1.97541 24.1465 1.02538 23.5605 0.43947C22.9745 -0.14649 22.0245 -0.14649 21.4386 0.43947L12 9.87905L2.56137 0.43947C1.97541 -0.14649 1.02538 -0.14649 0.43947 0.43947C-0.146443 1.02543 -0.14649 1.97545 0.43947 2.56137L9.87905 12L0.43947 21.4386C-0.14649 22.0246 -0.14649 22.9746 0.43947 23.5605C1.02543 24.1464 1.97545 24.1465 2.56137 23.5605L12 14.1209L21.4386 23.5605C22.0245 24.1465 22.9745 24.1465 23.5605 23.5605C24.1464 22.9745 24.1464 22.0245 23.5605 21.4386L14.1209 12Z" 
                fill="#8C8C8C"
              />
            </g>
            <defs>
              <clipPath id="clip0_7_619">
                <rect width="24" height="24" fill="white"/>
              </clipPath>
            </defs>
          </svg>
          </button>
        </header>

        <form className="modal__form" onSubmit={handleSubmit(onSubmit)}>
          <div className="modal__form-body">
          <div className="form-row">
            <label className="form-label">
              Учебное заведение
              <textarea
                className={`form-textarea ${
                  errors.institution ? "form-input--error" : ""
                }`}
                placeholder="Институт Компьютерных технологий и Информационной безопасности (ИКТИБ)"
                maxLength={256}
                {...register("institution")}
              />
              {errors.institution && (
                <span className="form-error">{errors.institution.message}</span>
              )}
            </label>
          </div>

          <div className="form-row">
            <label className="form-label">
              Специальность
              <input
                type="text"
                className={`form-input ${errors.program ? "form-input--error" : ""}`}
                placeholder="Прикладная информатика и математика"
                maxLength={256}
                {...register("program")}
              />
              {errors.program && (
                <span className="form-error">{errors.program.message}</span>
              )}
            </label>
          </div>

          <div className="form-row form-row--years">
            <label className="form-label">
              Год начала обучения
              <Controller
                control={control}
                name="startYear"
                render={({ field }) => (
                  <div className={errors.startYear ? "field-error" : ""}>
                    <DropdownSelect
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Не выбран"
                      options={yearOptions}
                    />
                  </div>
                )}
              />
              {errors.startYear && (
                <span className="form-error">{errors.startYear.message}</span>
              )}
            </label>

            <label className="form-label">
              Год окончания обучения
              <Controller
                control={control}
                name="endYear"
                render={({ field }) => (
                  <div className={errors.endYear ? "field-error" : ""}>
                    <DropdownSelect
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Не выбран"
                      options={endYearOptions}
                      allowEmpty
                    />
                  </div>
                )}
              />
              {errors.endYear && <span className="form-error">{errors.endYear.message}</span>}
            </label>
          </div>

          <div className="form-row">
            <label className="form-label">
              Форма обучения
              <Controller
                control={control}
                name="studyForm"
                render={({ field }) => (
                  <div className={errors.studyForm ? "field-error" : ""}>
                    <DropdownSelect
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Не выбрана"
                      options={studyFormOptions}
                    />
                  </div>
                )}
              />
              {errors.studyForm && (
                <span className="form-error">{errors.studyForm.message}</span>
              )}
            </label>
          </div>

          <div className="form-row">
            <button
              type="button"
              className="upload-link"
            >
              <span className="upload-link__icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clip-path="url(#clip0_7_1054)">
                    <path d="M16.4625 4.16372L13.8488 1.54997C12.8573 0.557719 11.5388 0.0117188 10.1363 0.0117188H6.75C5.04525 0.0117188 3.55275 1.16297 3.12225 2.81072C3.01725 3.21122 3.25725 3.62147 3.65775 3.72647C4.06125 3.82922 4.46925 3.59072 4.57275 3.19022C4.8315 2.20247 5.727 1.51172 6.75 1.51172H10.1363C10.26 1.51172 10.3785 1.53572 10.5 1.54697V5.26172C10.5 6.50222 11.5095 7.51172 12.75 7.51172H16.4632C16.4753 7.63322 16.5 7.75322 16.5 7.87547V14.2617C16.5 15.5022 15.4905 16.5117 14.25 16.5117H6.75C6.2325 16.5117 5.7465 16.3407 5.34375 16.019C5.02125 15.7617 4.5495 15.812 4.28925 16.1345C4.0305 16.4585 4.08225 16.9302 4.4055 17.189C5.067 17.7192 5.8995 18.0117 6.74925 18.0117H14.2493C16.317 18.0117 17.9993 16.3295 17.9993 14.2617V7.87547C17.9993 6.47372 17.4532 5.15522 16.4618 4.16372H16.4625ZM12.75 6.01172C12.3368 6.01172 12 5.67572 12 5.26172V2.02397C12.282 2.18672 12.5512 2.37347 12.7875 2.60972L15.4012 5.22347C15.6345 5.45672 15.8205 5.72747 15.9833 6.01097H12.7493L12.75 6.01172ZM7.5 12.0005H13.5C13.914 12.0005 14.25 12.3357 14.25 12.7505C14.25 13.1652 13.914 13.5005 13.5 13.5005H7.5C7.086 13.5005 6.75 13.1652 6.75 12.7505C6.75 12.3357 7.086 12.0005 7.5 12.0005ZM5.25 14.1357V10.5732C5.93025 10.0227 6.375 9.19172 6.375 8.25047C6.375 6.59597 5.0295 5.25047 3.375 5.25047C1.7205 5.25047 0.375 6.59597 0.375 8.25047C0.375 9.19172 0.81975 10.0227 1.5 10.5732V14.1357C1.5 14.603 2.09325 14.8032 2.37675 14.432L3.375 13.1247L4.37325 14.432C4.65675 14.8032 5.25 14.603 5.25 14.1357ZM3.375 6.75047C4.20225 6.75047 4.875 7.42322 4.875 8.25047C4.875 9.07772 4.20225 9.75047 3.375 9.75047C2.54775 9.75047 1.875 9.07772 1.875 8.25047C1.875 7.42322 2.54775 6.75047 3.375 6.75047ZM8.25 10.5005C7.836 10.5005 7.5 10.1652 7.5 9.75047C7.5 9.33572 7.836 9.00047 8.25 9.00047H13.5C13.914 9.00047 14.25 9.33572 14.25 9.75047C14.25 10.1652 13.914 10.5005 13.5 10.5005H8.25Z" fill="black"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_7_1054">
                    <rect width="18" height="18" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>


              </span>
              <span className="upload-link__text">Загрузить подтверждающий документ</span>
            </button>
          </div>
          </div>

          <footer className="modal__footer">
            <button type="submit" className="btn btn--save" disabled={isSubmitting}>
              Сохранить
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

