"use client";

import { useEffect, useMemo, useState } from "react";
import { apiService, convertKeysToCamel, convertKeysToSnake } from "@/services/api-service";
import type { TypeIntervention as TI } from "@/types/types";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export type ApiTypeIntervention = TI & { id: number };

type UpsertForm = {
    nom: string;
    duree: string;
    prixDepart: string;
};

function toApiDuration(hhmm: string): string {
    if (!hhmm) return "00:00:00";
    return /^\d{2}:\d{2}$/.test(hhmm) ? `${hhmm}:00` : hhmm;
}

function toHHmm(v: string | null | undefined): string {
    if (!v) return "00:00";
    const s = String(v);

    // ISO style "1970-01-01THH:mm[:ss]"
    if (s.includes("T")) {
        const afterT = s.split("T")[1] ?? "";
        const m = afterT.match(/^(\d{2}):(\d{2})/);
        return m ? `${m[1]}:${m[2]}` : "00:00";
    }

    // "HH:mm" ou "HH:mm:ss"
    const m = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (m) return `${m[1].padStart(2, "0")}:${m[2]}`;

    return "00:00";
}

export default function TypeInterventionManager() {
    const { toast } = useToast();

    const [refreshKey, setRefreshKey] = useState(0);
    const [items, setItems] = useState<ApiTypeIntervention[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Create dialog state
    const [createOpen, setCreateOpen] = useState<boolean>(false);
    const [createForm, setCreateForm] = useState<UpsertForm>({
        nom: "",
        duree: "00:30",
        prixDepart: "0",
    });

    // Edit dialog state
    const [editOpen, setEditOpen] = useState<boolean>(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<UpsertForm>({
        nom: "",
        duree: "00:30",
        prixDepart: "0",
    });

    // Fetch list on mount
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                const res = await apiService("types-intervention", "GET");
                const list = convertKeysToCamel<ApiTypeIntervention[]>(res);
                if (!cancelled) setItems(Array.isArray(list) ? list : []);
            } catch (e) {
                console.error(e);
                if (!cancelled) setError("Impossible de récupérer les types d’intervention.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [refreshKey]);

    const total = useMemo(() => items.length, [items]);

    // CREATE
    async function handleCreate() {
        if (createForm.nom.trim().length < 2) {
            toast({ title: "Nom invalide", description: "Au moins 2 caractères." });
            return;
        }
        try {
            const payload = convertKeysToSnake({
                ...createForm,
                duree: toApiDuration(createForm.duree),
                prixDepart: String(createForm.prixDepart ?? "0"),
            });

            await apiService("types-intervention", "POST", payload);

            setCreateOpen(false);
            setCreateForm({ nom: "", duree: "00:30", prixDepart: "0" });
            setRefreshKey((k) => k + 1);

            toast({ title: "Type créé", description: "Le type d’intervention a été ajouté." });
        } catch (e) {
            console.error(e);
            toast({ title: "Erreur", description: "Échec de la création." });
        }
    }

    // OPEN EDIT
    function openEditDialog(row: ApiTypeIntervention) {
        setEditId(row.id);
        setEditForm({
            nom: row.nom ?? "",
            duree: toHHmm(typeof row.duree === "string" ? row.duree : null),
            prixDepart: String(row.prixDepart ?? "0"),
        });
        setEditOpen(true);
    }

    // UPDATE
    async function handleUpdate() {
        if (editId == null) return;
        if (editForm.nom.trim().length < 2) {
            toast({ title: "Nom invalide", description: "Au moins 2 caractères." });
            return;
        }
        try {
            const payload = convertKeysToSnake({
                ...editForm,
                duree: toApiDuration(editForm.duree),
                prixDepart: String(editForm.prixDepart ?? "0"),
            });

            await apiService(`types-intervention/${editId}`, "PUT", payload);

            setEditOpen(false);
            setEditId(null);
            setRefreshKey((k) => k + 1);

            toast({ title: "Type mis à jour", description: "Les modifications ont été enregistrées." });
        } catch (e) {
            console.error(e);
            toast({ title: "Erreur", description: "Échec de la mise à jour." });
        }
    }

    // DELETE
    async function handleDelete(id: number) {
        try {
            await apiService(`types-intervention/${id}`, "DELETE");

            setRefreshKey((k) => k + 1);

            toast({ title: "Type supprimé", description: "Le type d’intervention a été supprimé." });
        } catch (e) {
            console.error(e);
            toast({ title: "Erreur", description: "Échec de la suppression." });
        }
    }

    if (loading) return <div className="p-5 border rounded-lg">Chargement des types…</div>;
    if (error) return <div className="p-5 border rounded-lg text-red-600">{error}</div>;

    return (
        <div className="p-5 border rounded-lg flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-semibold">Types d’intervention</h2>
                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" className="gap-2">
                            <Plus className="h-4 w-4" />
                            Nouveau type
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Créer un type d’intervention</DialogTitle>
                            <DialogDescription>Renseigne les champs ci-dessous puis valide.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-2">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Nom</Label>
                                <Input
                                    className="col-span-3"
                                    value={createForm.nom}
                                    onChange={(e) => setCreateForm((f) => ({ ...f, nom: e.target.value }))}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Durée</Label>
                                <Input
                                    type="time"
                                    className="col-span-3"
                                    value={createForm.duree}
                                    onChange={(e) => setCreateForm((f) => ({ ...f, duree: e.target.value }))}
                                    step={60}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right">Prix de départ (€)</Label>
                                <Input
                                    className="col-span-3"
                                    inputMode="decimal"
                                    value={createForm.prixDepart}
                                    onChange={(e) => setCreateForm((f) => ({ ...f, prixDepart: e.target.value }))}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleCreate}>Créer</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Separator />

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Durée</TableHead>
                        <TableHead>Prix de départ</TableHead>
                        <TableHead className="w-[120px] text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-muted-foreground">
                                Aucun type d’intervention.
                            </TableCell>
                        </TableRow>
                    ) : (
                        items.map((t) => (
                            <TableRow key={t.id}>
                                <TableCell className="font-medium">{t.nom}</TableCell>
                                <TableCell>{toHHmm(typeof t.duree === "string" ? t.duree : null)}</TableCell>
                                <TableCell>{String(t.prixDepart)} €</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="icon" className="mr-2" onClick={() => openEditDialog(t)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="destructive" size="icon" onClick={() => handleDelete(t.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifier le type d’intervention</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Nom</Label>
                            <Input
                                className="col-span-3"
                                value={editForm.nom}
                                onChange={(e) => setEditForm((f) => ({ ...f, nom: e.target.value }))}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Durée</Label>
                            <Input
                                type="time"
                                className="col-span-3"
                                value={editForm.duree}
                                onChange={(e) => setEditForm((f) => ({ ...f, duree: e.target.value }))}
                                step={60}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Prix de départ (€)</Label>
                            <Input
                                className="col-span-3"
                                inputMode="decimal"
                                value={editForm.prixDepart}
                                onChange={(e) => setEditForm((f) => ({ ...f, prixDepart: e.target.value }))}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleUpdate}>Enregistrer</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="text-sm text-muted-foreground">
                {total} type{total > 1 ? "s" : ""} configuré{total > 1 ? "s" : ""}.
            </div>
        </div>
    );
}
