import { useEducationStore } from "../store/educationStore.js";

export function EducationList() {
  const educations = useEducationStore((s) => s.educations);

  if (!educations.length) {
    return (
      <section className="list">
        <h2 className="list__title">Сохранённые образования</h2>
        <p className="list__empty">Пока нет добавленных записей.</p>
      </section>
    );
  }

  return (
    <section className="list">
      <h2 className="list__title">Сохранённые образования</h2>
      <div className="list__grid">
        {educations.map((e) => (
          <article key={e.id} className="list-card">
            <h3 className="list-card__title">{e.documentTitle}</h3>
            <p className="list-card__institution">{e.institution}</p>
            {e.program && <p className="list-card__program">{e.program}</p>}
            <div className="list-card__meta">
              {e.level && <span className="list-card__pill">{e.level}</span>}
              {(e.startYear || e.endYear) && (
                <span className="list-card__years">
                  {e.startYear || "—"} — {e.endYear || "—"}
                </span>
              )}
            </div>
            {e.documentUrl && (
              <a
                className="list-card__link"
                href={e.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Открыть документ
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

