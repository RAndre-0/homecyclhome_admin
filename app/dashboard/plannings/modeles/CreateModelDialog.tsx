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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api-service";
import { Plus } from "lucide-react";
import { Model } from "@/types/types";

interface CreateModelDialogProps {
    onModelCreated: (newModel: Model) => void;
}


export default function CreateModelDialog({ onModelCreated }: CreateModelDialogProps) {
    const [newModelName, setNewModelName] = useState("");
    const { toast } = useToast();
    const [open, setOpen] = useState(false);

    const createModel = async () => {
        if (newModelName.length > 2) {
          try {
            const newModel: Model = await apiService("modeles-planning", "POST", { name: newModelName });
            setNewModelName("");
            toast({ title: "Succès", description: "Modèle créé avec succès." });
            setOpen(false);
            onModelCreated(newModel);
          } catch (error) {
            toast({ title: "Erreur", description: "Échec de la création du modèle." });
          }
        } else {
          toast({ title: "Erreur", description: "3 caractères minimum." });
        }
      };
      


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Plus className="cursor-pointer" />
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Créer un nouveau modèle</DialogTitle>
                    <DialogDescription>
                        Entrez le nom du nouveau modèle et cliquez sur "Créer".
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="modelName" className="text-right">
                            Nom
                        </Label>
                        <Input
                            id="modelName"
                            value={newModelName}
                            onChange={(e) => setNewModelName(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={createModel}>Créer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}