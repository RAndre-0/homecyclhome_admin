"use client";
import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiService, convertKeysToSnake } from "@/services/api-service";
import TypeInterventionSelector from "@/components/types-intervention-selector";
import { Plus } from "lucide-react";

interface CreateModelInterventionDialogProps {
    selectedModelId: number;
    onInterventionCreated: (newIntervention: any) => void;
}

export default function CreateModelInterventionDialog({ selectedModelId, onInterventionCreated }: CreateModelInterventionDialogProps) {
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
            interventionTime: interventionTime
        };

        try {
            const newIntervention = await apiService("modele-interventions", "POST", convertKeysToSnake(payload));
            onInterventionCreated(newIntervention);

            toast({ title: "Succès", description: "Intervention ajoutée avec succès." });
            setOpen(false);
            setInterventionTime("");
            setSelectedTypeIntervention(null);
        } catch (error) {
            toast({ title: "Erreur", description: "Échec de l'ajout de l'intervention." });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Plus className="cursor-pointer" />
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>Ajouter une intervention</DialogTitle>
                <DialogDescription>Remplissez les champs ci-dessous pour ajouter une intervention.</DialogDescription>
                
                <label>Type d'intervention</label>
                <TypeInterventionSelector onTypeInterventionChange={setSelectedTypeIntervention} />

                <label>Heure d'intervention</label>
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
