"use client";
import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiService, convertKeysToSnake } from "@/services/api-service";
import TypeInterventionSelector from "@/components/types-intervention-selector";
import { Plus } from "lucide-react";
import type { InterventionModel } from "@/types/types";

interface ModelIntervention {
    id: number;
    typeIntervention: number | { id: number; nom?: string };
    modelePlanning: number | { id: number; name?: string };
    interventionTime: string; // "HH:mm"
}

interface CreateModelInterventionDialogProps {
    selectedModelId: number;
    onInterventionCreated: () => void;
}

export default function CreateModelInterventionDialog({
    selectedModelId,
    onInterventionCreated,
}: CreateModelInterventionDialogProps) {
    const [open, setOpen] = useState(false);
    const [interventionTime, setInterventionTime] = useState("");
    const [selectedTypeIntervention, setSelectedTypeIntervention] = useState<number | null>(null);
    const { toast } = useToast();

    const createIntervention = async () => {
        if (!selectedTypeIntervention || !interventionTime) {
            toast({ title: "Erreur", description: "Veuillez remplir tous les champs." });
            return;
        }

        const payload = {
            typeIntervention: selectedTypeIntervention,
            modelePlanning: selectedModelId,
            interventionTime: interventionTime,
        };

        try {
            await apiService(
                "modele-interventions",
                "POST",
                convertKeysToSnake(payload)
            );
            onInterventionCreated();      // déclenche le refetch côté parent
            setOpen(false);               // ferme la modal
            setSelectedTypeIntervention(null); // reset champs
            setInterventionTime("");           // reset champs
            toast({ title: "Succès", description: "Intervention ajoutée au modèle." });
        } catch (e) {
            console.error(e);
            toast({ title: "Erreur", description: "Création impossible." });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Plus className="cursor-pointer" />
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Ajouter une intervention</DialogTitle>
                <DialogDescription>
                    Remplissez les champs ci-dessous pour ajouter une intervention.
                </DialogDescription>

                <label>Type d&apos;intervention</label>
                <TypeInterventionSelector onTypeInterventionChange={setSelectedTypeIntervention} />

                <label>Heure d&apos;intervention</label>
                <Input
                    type="time"
                    value={interventionTime}
                    onChange={(e) => setInterventionTime(e.target.value)}
                />

                <Button onClick={createIntervention}>Ajouter</Button>
            </DialogContent>
        </Dialog>
    );
}
