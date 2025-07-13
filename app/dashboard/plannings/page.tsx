"use client";

import { useState, useEffect } from "react";
import FullCalendarAdmin from "./FullCalendarAdmin";
import { Technicien } from "@/types/types";
import { apiService } from "@/services/api-service";
import DeleteInterventionsDialog from "./DeleteInterventionsDialog";
import CreateInterventionsDialog from "./CreateInterventionsDialog";
import TechnicienSelector from "@/components/technicien-selector";

export default function Plannings() {
  const [selectedTechnicien, setSelectedTechnicien] = useState<Technicien | null>(null);
  const [techniciensList, setTechniciensList] = useState<{ value: string; label: string }[]>([]);
  const [refreshKey, setRefreshKey] = useState(0); // Utilisé pour forcer le rafraîchissement

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

  const refreshInterventions = () => {
      setRefreshKey((prevKey) => prevKey + 1);
  };

  return (
      <>
          <div className="flex justify-between">
          <TechnicienSelector onTechnicienChange={setSelectedTechnicien} defaultTechnicien={selectedTechnicien} />

              <div className="flex gap-5">
                  <DeleteInterventionsDialog onRefresh={refreshInterventions} />
                  <CreateInterventionsDialog onRefresh={refreshInterventions} />
              </div>
          </div>
          <FullCalendarAdmin selectedTechnicien={selectedTechnicien} key={refreshKey} onRefresh={refreshInterventions} />
      </>
  );
}

