import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { apiService } from "@/services/api-service";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import TypeInterventionSelector from "@/components/types-intervention-selector";
import TechnicienSelector from "@/components/technicien-selector";
import { Technicien } from "@/types/types";

interface CreateInterventionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: string | null; // Ajout de la date sélectionnée
    onRefresh: () => void;
}

export default function CreateInterventionDialog({ isOpen, onClose, selectedDate, onRefresh }: CreateInterventionDialogProps) {
    const [typeIntervention, setTypeIntervention] = useState("");
    const { toast } = useToast();
    const [selectedTypeIntervention, setSelectedTypeIntervention] = useState<number | null>(null);
    const [selectedTechnicien, setSelectedTechnicien] = useState<Technicien | null>(null);

    const handleCreate = async () => {
        if (!selectedDate || !selectedTypeIntervention || !selectedTechnicien) {
            toast({ title: "Erreur", description: "Veuillez remplir tous les champs." });
            return;
        }

        try {
            await apiService("interventions", "POST", {
                typeIntervention: selectedTypeIntervention,
                debut: selectedDate, 
                technicien: selectedTechnicien.id, 
            });
    
            toast({ title: "Succès", description: "Intervention créée avec succès." });
            onRefresh();
            onClose();
        } catch (error) {
            console.error("Erreur lors de la création", error);
            toast({ title: "Erreur", description: "Une erreur est survenue." });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-card">
                <DialogHeader>
                    <DialogTitle>Créer une intervention</DialogTitle>
                    <DialogDescription>
                        Sélectionnez un type d'intervention et confirmez la création.
                    </DialogDescription>
                </DialogHeader>
                
                <div>
                    <label>Date sélectionnée</label>
                    <Input value={selectedDate ? format(new Date(selectedDate), "yyyy-MM-dd HH:mm") : ""} readOnly />
                </div>
                
                <TypeInterventionSelector onTypeInterventionChange={setSelectedTypeIntervention} />
                
                <TechnicienSelector onTechnicienChange={setSelectedTechnicien} />

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Annuler</Button>
                    <Button onClick={handleCreate}>Créer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
