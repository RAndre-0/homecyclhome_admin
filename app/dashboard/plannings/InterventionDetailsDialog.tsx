import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Intervention } from "@/types/types";
import { apiService } from "@/services/api-service";
import { useToast } from "@/hooks/use-toast";
import { log } from "node:console";

// Définition de l'interface du composant
interface InterventionDetailsProps {
    intervention: Intervention | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function InterventionDetailsDialog({ intervention, isOpen, onClose }: InterventionDetailsProps) {
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false); // État pour gérer la confirmation de suppression
    const [isDeleting, setIsDeleting] = useState(false); // État pour gérer l'état de suppression en cours
    const { toast } = useToast();

    if (!intervention) return null;

    const isReserved = !!intervention.client;

    // Fonction pour gérer la suppression après confirmation
    const handleDelete = async () => {
        if (isConfirmingDelete) {
            setIsDeleting(true); // Indiquer que la suppression est en cours
            try {
                const response = await apiService(`interventions/${intervention.id}`, "DELETE");

                // Afficher un toast de confirmation de suppression
                toast({
                    title:"Confirmation",
                    description: "Intervention supprimée avec succès"
                });

                // Fermer le dialogue après la suppression
                onClose();
            } catch (error) {
                console.error("Erreur lors de la suppression:", error);
                toast({
                    title:"Erreur",
                    description: "Erreur lors de la suppression de l'intervention"
                });
            } finally {
                setIsDeleting(false); // Réinitialiser l'état de suppression
            }
        } else {
            setIsConfirmingDelete(true); // Activer la confirmation de suppression
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-card">
                <DialogHeader>
                    <DialogTitle>
                        {isReserved ? "Intervention réservée" : "Intervention disponible"}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    {isReserved && (
                        <>
                            <p>
                                <strong>Client :</strong> {`${intervention.client?.firstName ?? "Non défini"} ${intervention.client?.lastName ?? "Non défini"}`}
                            </p>
                            <p>
                                <strong>Email :</strong> {intervention.client?.email ?? "Non défini"}
                            </p>
                            <p>
                                <strong>Adresse :</strong> {intervention.adresse ?? "Non définie"}
                            </p>
                            <p>
                                <strong>Vélo :</strong> {`${intervention.veloCategorie ?? "Non défini"} - ${intervention.veloMarque ?? "Non définie"} ${intervention.veloModele ?? ""}`}
                            </p>
                            <p>
                                <strong>Électrique :</strong> {intervention.veloElectrique ? "Oui" : "Non"}
                            </p>
                            {intervention.commentaireClient && (
                                <p>
                                    <strong>Commentaire :</strong> {intervention.commentaireClient}
                                </p>
                            )}
                            {intervention.photo && (
                                <img src={intervention.photo} alt="Photo du vélo" />
                            )}
                        </>
                    )}
                    <p>
                        <strong>Technicien :</strong> {`${intervention.technicien?.firstName ?? "Non défini"} ${intervention.technicien?.lastName ?? "Non défini"}`}
                    </p>
                    <p>
                        <strong>Type d’intervention :</strong> {intervention.typeIntervention?.nom ?? "Non défini"}
                    </p>
                    <p>
                        <strong>Durée :</strong> {formatDuration(intervention.typeIntervention?.duree)}
                    </p>
                    <p>
                        <strong>Prix :</strong> {intervention.typeIntervention?.prixDepart ?? "Non défini"} €
                    </p>
                </div>
                <DialogFooter>
                    {isConfirmingDelete ? (
                        <div className="space-x-2">
                            <Button onClick={handleDelete} className="bg-red-500" disabled={isDeleting}>
                                {isDeleting ? "Suppression..." : "Confirmer la suppression"}
                            </Button>
                            <Button onClick={() => setIsConfirmingDelete(false)} className="bg-gray-500">
                                Annuler
                            </Button>
                        </div>
                    ) : (
                        <Button onClick={handleDelete} className="bg-red-500" disabled={isDeleting}>
                            {isDeleting ? "Suppression..." : "Supprimer l'intervention"}
                        </Button>
                    )}
                    <Button onClick={onClose}>Fermer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Fonction de formatage de la durée
function formatDuration(duration: string | number | Date | null | undefined): string {
    if (!duration) return "Non définie";
    if (typeof duration === "string") {
        // Extraction des heures et minutes
        const match = duration.match(/T(\d{2}):(\d{2}):\d{2}/);
        if (match) {
            const hours = parseInt(match[1], 10);
            const minutes = parseInt(match[2], 10);
            return `${hours}h ${minutes}m`;
        }
         // Retourne la durée si c'est déjà une string valide
        return duration;
    }
    if (typeof duration === "number") {
        // Suppose que c'est une durée en minutes
        return `${duration} min`;
    }
    if (duration instanceof Date) {
        // Affiche l'heure locale
        return duration.toLocaleTimeString();
    }
    return "Non définie";
}

