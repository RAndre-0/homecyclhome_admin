"use client";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { apiService, convertKeysToCamel } from "@/services/api-service";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DeleteModelDialog } from "./DeleteModelDialog";
import { X, Clock, Timer } from "lucide-react";
import CreateModelDialog from "./CreateModelDialog";
import CreateModelInterventionDialog from "./CreateModelInterventionDialog";
import type { Model, InterventionModel, TypeIntervention } from "@/types/types";

type ModelListItem = { id: number; name: string };

dayjs.extend(utc);

export default function ModelesDePlanning() {
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const data = await apiService("modeles-planning", "GET");

        const detailedModels = await Promise.all(
          (data as ModelListItem[]).map(async (model) => {
            const detailedModel = await apiService(
              `modeles-planning/${model.id}`,
              "GET"
            );
            return convertKeysToCamel(detailedModel) as Model;
          })
        );

        setModels(detailedModels);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des interventions", error);
        setError("Erreur lors de la récupération des interventions");
        setLoading(false);
      }
    };
    fetchModels();
  }, []);

  const removeIntervention = async (interventionId: number) => {
    try {
      await apiService(`modele-interventions/${interventionId}`, "DELETE");

      if (selectedModel) {
        const updatedInterventions = selectedModel.modeleInterventions.filter(
          (intervention) => intervention.id !== interventionId
        );

        setSelectedModel({ ...selectedModel, modeleInterventions: updatedInterventions });

        setModels((prev) =>
          prev.map((model) =>
            model.id === selectedModel.id
              ? { ...model, modeleInterventions: updatedInterventions }
              : model
          )
        );
      }

      toast({ title: "Succès", description: "Intervention supprimée avec succès." });
    } catch {
      toast({ title: "Erreur", description: "Échec de la suppression de l'intervention." });
    }
  };

  // Normalise ce que renvoie le dialog (qui peut contenir typeIntervention = number)
  const handleInterventionCreated = (raw: any) => {
    void (async () => {
      let typeIntervention: TypeIntervention;

      if (typeof raw?.typeIntervention === "number") {
        const ti = await apiService(`types-intervention/${raw.typeIntervention}`, "GET");
        typeIntervention = convertKeysToCamel(ti) as TypeIntervention;
      } else {
        // On s'assure que les champs requis existent
        const obj = raw?.typeIntervention ?? {};
        typeIntervention = {
          id: obj.id,
          nom: obj.nom ?? "—",
          // Valeurs par défaut safe si l’API ne les fournit pas
          duree: obj.duree ?? "00:00:00",
          prixDepart: obj.prixDepart ?? 0,
        } as TypeIntervention;
      }

      const normalized: InterventionModel = {
        ...raw,
        typeIntervention,
      };

      if (!selectedModel) return;

      const updatedInterventions: InterventionModel[] = [
        ...selectedModel.modeleInterventions,
        normalized,
      ];

      setSelectedModel({
        ...selectedModel,
        modeleInterventions: updatedInterventions,
      });

      setModels((prev) =>
        prev.map((model) =>
          model.id === selectedModel.id
            ? { ...model, modeleInterventions: updatedInterventions }
            : model
        )
      );
    })();
  };

  if (loading) return <div>Chargement en cours...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-row gap-5">
        <div className="p-5 w-1/3 border rounded-lg flex flex-col gap-5">
          <div className="border-b pb-2 flex flex-row justify-between">
            <h1 className="text-3xl font-semibold">Modèles</h1>
            <CreateModelDialog
              onModelCreated={(newModel) => {
                setModels((prevModels) => [...prevModels, newModel]);
              }}
            />
          </div>

          {models.map((model) => (
            <div key={model.id} className="flex items-center justify-between">
              <Button onClick={() => setSelectedModel(model)}>{model.name}</Button>
              <DeleteModelDialog
                modelId={model.id}
                onDelete={() => {
                  setModels((prev) => prev.filter((m) => m.id !== model.id));
                  if (selectedModel?.id === model.id) setSelectedModel(null);
                }}
              />
            </div>
          ))}
        </div>

        <div className="w-2/3 p-5 border rounded-lg">
          {selectedModel ? (
            <div>
              <div className="border-b pb-2 mb-4 flex flex-row justify-between">
                <h2 className="text-3xl font-semibold">
                  Interventions du modèle: {selectedModel.name}
                </h2>

                <CreateModelInterventionDialog
                  selectedModelId={selectedModel.id}
                  onInterventionCreated={handleInterventionCreated}
                />
              </div>

              {selectedModel.modeleInterventions.length > 0 ? (
                selectedModel.modeleInterventions.map((intervention) => (
                  <div
                    key={intervention.id}
                    className={`mb-4 rounded-lg p-3 border-x-4 flex flex-row justify-between ${intervention.typeIntervention?.nom === "Maintenance"
                        ? "border-emerald-400"
                        : "border-cyan-200"
                      }`}
                  >
                    <div>
                      <p>{intervention.typeIntervention?.nom || "Type inconnu"}</p>
                      <div className="flex">
                        <div className="flex items-center justify-start mr-4">
                          <Clock className="mr-2" />
                          <p>{dayjs(intervention.interventionTime).format("HH:mm")}</p>
                        </div>
                        <div className="flex items-center justify-start">
                          <Timer className="mr-2" />
                          <p>
                            {intervention.typeIntervention?.duree
                              ? dayjs(intervention.typeIntervention.duree).format("HH:mm")
                              : "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <X
                      className="cursor-pointer"
                      onClick={() => removeIntervention(intervention.id)}
                    />
                  </div>
                ))
              ) : (
                <p>Aucune intervention pour ce modèle.</p>
              )}
            </div>
          ) : (
            <p>Sélectionnez un modèle pour voir les détails</p>
          )}
        </div>
      </div>
    </div>
  );
}
