import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useEducationStore = create(
  persist(
    (set) => ({
      educations: [],
      addEducation: (education) =>
        set((state) => ({
          educations: [...state.educations, { id: crypto.randomUUID(), ...education }]
        }))
    }),
    {
      name: "education-store"
    }
  )
);

