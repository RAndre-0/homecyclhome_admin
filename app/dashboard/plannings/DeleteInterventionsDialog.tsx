import { useState } from "react";
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

export default function DeleteInterventionsDialog({ onRefresh }: { onRefresh: () => void }) {
    const [selectedTechniciens, setSelectedTechniciens] = useState<string[]>([]);
    const [dateRange, setDateRange] = useState<{ startDate: Date | null; endDate: Date | null }>({
        startDate: null,
        endDate: null,
    });
    const { toast } = useToast();

    const handleDelete = async () => {
        try {
            const formattedFrom = formatDate(dateRange.startDate);
            const formattedTo = formatDate(dateRange.endDate);

            const technicianIds = selectedTechniciens.map((id) => parseInt(id, 10));

            await apiService("interventions/delete", "DELETE", {
                technicians: technicianIds,
                from: formattedFrom,
                to: formattedTo,
            });

            toast({
                title: "Interventions supprimées",
                description: `Les interventions non réservées ont été supprimées du ${formattedFrom} au ${formattedTo}.`,
            });
            onRefresh();
        } catch (error) {
            console.error("Erreur lors de la suppression des interventions", error);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Supprimer des interventions</Button>
            </DialogTrigger>
            <DialogContent className="bg-card">
                <DialogHeader>
                    <DialogTitle>Supprimer des interventions</DialogTitle>
                    <DialogDescription>
                        Sélectionnez les techniciens et la plage de dates pour supprimer les interventions.
                    </DialogDescription>
                </DialogHeader>
                <TechnicienMultiSelect onChange={setSelectedTechniciens} />
                <DatePickerWithRange onChange={setDateRange} />
                <DialogFooter>
                    <Button variant="destructive" onClick={handleDelete}>
                        Supprimer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

