"use client";

import { useState } from "react";
import FullCalendarAdmin from "./FullCalendarAdmin";
import { Technicien } from "@/types/types";
import DeleteInterventionsDialog from "./DeleteInterventionsDialog";
import CreateInterventionsDialog from "./CreateInterventionsDialog";
import TechnicienSelector from "@/components/technicien-selector";

export default function Plannings() {
  const [selectedTechnicien, setSelectedTechnicien] = useState<Technicien | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshInterventions = () => setRefreshKey((prev) => prev + 1);

  return (
    <>
      <div className="flex justify-between">
        <TechnicienSelector
          onTechnicienChange={setSelectedTechnicien}
          defaultTechnicien={selectedTechnicien}
        />

        <div className="flex gap-5">
          <DeleteInterventionsDialog onRefresh={refreshInterventions} />
          <CreateInterventionsDialog onRefresh={refreshInterventions} />
        </div>
      </div>

      <FullCalendarAdmin
        selectedTechnicien={selectedTechnicien}
        key={refreshKey}
        onRefresh={refreshInterventions}
      />
    </>
  );
}
