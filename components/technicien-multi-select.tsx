"use client";

import { useState, useEffect } from "react";
import { MultiSelect } from "@/components/multi-select";
import { apiService } from "@/services/api-service";
import { Technicien } from "@/types/types";

interface TechnicienMultiSelectProps {
  onChange: (selectedTechniciens: string[]) => void; // Fonction appelée lorsque la sélection change
  maxCount?: number; // Nombre maximal de techniciens sélectionnables
}

export default function TechnicienMultiSelect({
  onChange,
  maxCount = 5,
}: TechnicienMultiSelectProps) {
  const [techniciensList, setTechniciensList] = useState<{ value: string; label: string }[]>([]);
  const [selectedTechniciens, setSelectedTechniciens] = useState<string[]>([]);

  // Charger la liste des techniciens
  useEffect(() => {
    const fetchTechniciens = async () => {
      try {
        const data = await apiService("users/role-ROLE_TECHNICIEN", "GET");
        const options = data.map((technicien: Technicien) => ({
          value: technicien.id.toString(),
          label: `${technicien.firstName} ${technicien.lastName}`,
        }));
        setTechniciensList(options);
      } catch (error) {
        console.error("Erreur lors de la récupération des techniciens", error);
      }
    };
    fetchTechniciens();
  }, []);

  // Met à jour la sélection et appelle le callback parent
  const handleChange = (selected: string[]) => {
    setSelectedTechniciens(selected);
    onChange(selected);
  };

  return (
    <div>
      <MultiSelect
        options={techniciensList}
        onValueChange={handleChange}
        defaultValue={selectedTechniciens}
        placeholder="Sélectionner des techniciens"
        variant="inverted"
        maxCount={maxCount}
      />
    </div>
  );
}
