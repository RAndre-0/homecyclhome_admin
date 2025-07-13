"use client";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { apiService, convertKeysToCamel } from "@/services/api-service";
import { TypeIntervention } from "@/types/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DeleteModelDialog } from "./DeleteModelDialog";
import { X, Clock, Timer, Plus } from "lucide-react";
import CreateModelDialog from "./CreateModelDialog";
import CreateModelInterventionDialog from "./CreateModelInterventionDialog";
import { Model } from "@/types/types";

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
                    data.map(async (model: { id: number; name: string }) => {
                        const detailedModel = await apiService(`modeles-planning/${model.id}`, "GET");
                        return convertKeysToCamel(detailedModel);
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

                setModels(models.map(model =>
                    model.id === selectedModel.id
                        ? { ...model, modeleInterventions: updatedInterventions }
                        : model
                ));
            }

            toast({ title: "Succès", description: "Intervention supprimée avec succès." });
        } catch (error) {
            toast({ title: "Erreur", description: "Échec de la suppression de l'intervention." });
        }
    };

    if (loading) {
        return <div>Chargement en cours...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }
    
    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-row gap-5">
                <div className="p-5 w-1/3 border rounded-lg flex flex-col gap-5">
                    <div className="border-b pb-2 flex flex-row justify-between">
                        <h1 className="text-3xl font-semibold">Modèles</h1>
                        <CreateModelDialog onModelCreated={(newModel) => {
                            setModels((prevModels) => [...prevModels, newModel]);
                        }} />
                    </div>

                    {models.map((model) => (
                        <div className="flex items-center justify-between">
                            <Button key={model.id} onClick={() => setSelectedModel(model)}>{model.name}</Button>
                            <DeleteModelDialog
                                modelId={model.id}
                                onDelete={() => {
                                    setModels(models.filter(m => m.id !== model.id));
                                    if (selectedModel?.id === model.id) {
                                        setSelectedModel(null);
                                    }
                                }}
                            />

                        </div>
                    ))}
                </div>
                <div className="w-2/3 p-5 border rounded-lg">
                    {selectedModel ? (
                        <div>
                            <div className="border-b pb-2 mb-4 flex flex-row justify-between">
                                <h2 className="text-3xl font-semibold">Interventions du modèle: {selectedModel.name}</h2>
                                <CreateModelInterventionDialog
                                    selectedModelId={selectedModel.id}
                                    onInterventionCreated={(newIntervention) => {
                                        const updatedInterventions = [...selectedModel.modeleInterventions, newIntervention];
                                        setSelectedModel({ ...selectedModel, modeleInterventions: updatedInterventions });

                                        setModels(models.map(model =>
                                            model.id === selectedModel.id
                                                ? { ...model, modeleInterventions: updatedInterventions }
                                                : model
                                        ));
                                    }}
                                />
                            </div>

                            {selectedModel.modeleInterventions.length > 0 ? (
                                selectedModel.modeleInterventions.map((intervention) => (
                                    <div key={intervention.id} className={`mb-4 rounded-lg p-3 border-x-4 flex flex-row justify-between ${intervention.typeIntervention?.nom === "Maintenance" ? "border-emerald-400" : "border-cyan-200"}`}>
                                        <div>
                                            <p>{intervention.typeIntervention?.nom || "Type inconnu"}</p>
                                            <div className="flex">
                                                <div className="flex items-center justify-start mr-4">
                                                    <Clock className="mr-2" />
                                                    <p>{dayjs(intervention.interventionTime).format("HH:mm")}</p>
                                                </div>
                                                <div className="flex items-center justify-start">
                                                    <Timer className="mr-2" />
                                                    {/* <p>{formatDuration(String(intervention.typeIntervention?.duree))}</p> */}
                                                    <p>{dayjs(intervention.typeIntervention?.duree).format("HH:mm")}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <X className="cursor-pointer" onClick={() => removeIntervention(intervention.id)}></X>
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
