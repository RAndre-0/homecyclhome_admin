"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiService } from "@/services/api-service";

interface TypeIntervention {
  id: number;
  nom: string;
}

interface TypeInterventionSelectorProps {
  onTypeInterventionChange: (typeId: number | null) => void;
}

export default function TypeInterventionSelector({ onTypeInterventionChange }: TypeInterventionSelectorProps) {
  const [typesIntervention, setTypesIntervention] = useState<TypeIntervention[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string>("default");

  useEffect(() => {
    const fetchTypesIntervention = async () => {
      try {
        const data = await apiService("types-intervention", "GET");
        setTypesIntervention(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des types d'intervention", error);
      }
    };
    fetchTypesIntervention();
  }, []);

  const handleSelectChange = (value: string) => {
    setSelectedTypeId(value);
    onTypeInterventionChange(value !== "default" ? parseInt(value, 10) : null);
  };

  return (
    <Select onValueChange={handleSelectChange} value={selectedTypeId}>
      <SelectTrigger className="w-[240px]">
        <SelectValue placeholder="Type d'intervention" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="default" disabled>
          Sélectionner un type
        </SelectItem>
        {typesIntervention.map((type) => (
          <SelectItem key={type.id} value={type.id.toString()}>
            {type.nom}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
