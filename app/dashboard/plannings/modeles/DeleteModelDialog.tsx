import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api-service";
import { X } from "lucide-react";

export function DeleteModelDialog({ modelId, onDelete }: { modelId: number; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      await apiService(`modeles-planning/${modelId}`, "DELETE");
      onDelete();
      toast({ title: "Succès", description: "Modèle de planning supprimé avec succès." });
      setOpen(false);
    } catch (error) {
      console.error("Erreur lors de la suppression du modèle", error);
      toast({ title: "Erreur", description: "Erreur lors de la suppression du modèle." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <X className="cursor-pointer"></X>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer ce modèle ? Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
          <Button variant="destructive" onClick={handleDelete}>Confirmer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
