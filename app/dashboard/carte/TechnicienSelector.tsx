"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Technicien } from "@/types/types";

interface TechnicienSelectorProps {
  onTechnicienChange: (technicien: Technicien | null) => void;
  defaultTechnicien?: Technicien | null;
  techniciens: Technicien[];
}

export default function TechnicienSelector({ 
  onTechnicienChange, 
  defaultTechnicien, 
  techniciens 
}: TechnicienSelectorProps) {
  const [selectedTechnicienId, setSelectedTechnicienId] = useState<string>("none");

  useEffect(() => {
    setSelectedTechnicienId(defaultTechnicien ? defaultTechnicien.id.toString() : "none");
  }, [defaultTechnicien]);

  const handleSelectChange = (value: string) => {
    setSelectedTechnicienId(value);
    const technicien = techniciens.find((t) => t.id.toString() === value);
    onTechnicienChange(technicien || null);
  };

  return (
    <Select onValueChange={handleSelectChange} value={selectedTechnicienId}>
      <SelectTrigger className="w-[240px]">
        <SelectValue placeholder="Sélectionner un technicien" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Aucun technicien</SelectItem>
        {techniciens.map((technicien) => (
          <SelectItem key={technicien.id} value={technicien.id.toString()}>
            {technicien.firstName} {technicien.lastName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
