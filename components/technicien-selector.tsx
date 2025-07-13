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
import { Technicien } from "@/types/types";

interface TechnicienSelectorProps {
  onTechnicienChange: (technicien: Technicien | null) => void;
  defaultTechnicien?: Technicien | null;
}

export default function TechnicienSelector({ onTechnicienChange, defaultTechnicien }: TechnicienSelectorProps) {
  const [techniciens, setTechniciens] = useState<Technicien[]>([]);
  const [selectedTechnicienId, setSelectedTechnicienId] = useState<string>(
      defaultTechnicien ? defaultTechnicien.id.toString() : "default"
  );

  useEffect(() => {
    const fetchTechniciens = async () => {
      try {
        const data = await apiService("users/role-ROLE_TECHNICIEN", "GET");
        setTechniciens(data);
        if (data.length > 0 && !defaultTechnicien) {
          setSelectedTechnicienId(data[0].id.toString());
          onTechnicienChange(data[0]);
        } else if (defaultTechnicien) {
          setSelectedTechnicienId(defaultTechnicien.id.toString());
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des techniciens", error);
      }
    };
    fetchTechniciens();
  }, [defaultTechnicien]);

  const handleSelectChange = (value: string) => {
    setSelectedTechnicienId(value);
    const technicien = techniciens.find((t) => t.id.toString() === value);
    onTechnicienChange(technicien || null);
  };

  return (
    <Select onValueChange={handleSelectChange} value={selectedTechnicienId}>
      <SelectTrigger className="w-[240px]">
        <SelectValue placeholder="Technicien" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="default" disabled>
          Sélectionner un technicien
        </SelectItem>
        {techniciens.map((technicien) => (
          <SelectItem key={technicien.id} value={technicien.id.toString()}>
            {technicien.firstName} {technicien.lastName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
