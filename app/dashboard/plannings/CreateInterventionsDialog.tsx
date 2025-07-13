import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import TechnicienMultiSelect from "@/components/technicien-multi-select";
import { DatePickerWithRange } from "@/components/ui/date-range";
import { apiService } from "@/services/api-service";
import { formatDate } from "@/services/date-formatting";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ModelePlanning = {
    id: number;
    name: string;
};

export default function CreateInterventionsDialog({ onRefresh }: { onRefresh: () => void }) {
    const [selectedTechniciens, setSelectedTechniciens] = useState<string[]>([]);
    const [dateRange, setDateRange] = useState<{ startDate: Date | null; endDate: Date | null }>({
        startDate: null,
        endDate: null,
    });
    const [modeles, setModeles] = useState<ModelePlanning[]>([]);
    const [selectedModele, setSelectedModele] = useState<number | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const fetchModeles = async () => {
            try {
                const response = await apiService("modeles-planning", "GET");
                setModeles(response);
            } catch (error) {
                console.error("Erreur lors de la récupération des modèles", error);
            }
        };

        fetchModeles();
    }, []);

    const handleCreate = async () => {
        try {
            if (!selectedModele) {
                toast({ title: "Erreur", description: "Veuillez sélectionner un modèle." });
                return;
            }

            const formattedFrom = formatDate(dateRange.startDate);
            const formattedTo = formatDate(dateRange.endDate);

            if (!formattedFrom || !formattedTo) {
                toast({ title: "Erreur", description: "Veuillez sélectionner une plage de dates valide." });
                return;
            }

            const technicianIds = selectedTechniciens.map((id) => parseInt(id, 10));

            await apiService(`new-interventions`, "POST", {
                model: selectedModele,
                technicians: technicianIds,
                from: formattedFrom,
                to: formattedTo,
            });

            toast({
                title: "Succès",
                description: `Les interventions ont été créées à partir du modèle.`,
            });
            onRefresh();
        } catch (error) {
            console.error("Erreur lors de la création des interventions", error);
            toast({ title: "Erreur", description: "Une erreur s'est produite lors de la création des interventions." });
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Créer des interventions</Button>
            </DialogTrigger>
            <DialogContent className="bg-card">
                <DialogHeader>
                    <DialogTitle>Créer des interventions</DialogTitle>
                    <DialogDescription>
                        Sélectionnez un modèle, les techniciens, et la plage de dates pour créer des interventions.
                    </DialogDescription>
                </DialogHeader>
                <Select onValueChange={(value) => setSelectedModele(parseInt(value, 10))}>
                    <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un modèle" />
                    </SelectTrigger>
                    <SelectContent>
                        {modeles.map((modele) => (
                            <SelectItem key={modele.id} value={modele.id.toString()}>
                                {modele.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <TechnicienMultiSelect onChange={setSelectedTechniciens} />
                <DatePickerWithRange onChange={setDateRange} />
                <DialogFooter>
                    <Button onClick={handleCreate}>
                        Créer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

