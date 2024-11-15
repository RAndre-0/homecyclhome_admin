"use client"
import { apiService } from "@/services/api-service";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function EditUser() {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast()
    const [formData, setFormData] = useState({ email: "", password: "", roles: [] });
    const router = useRouter();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiService(`users`, 'POST', formData);
            toast({
                title: "Utilisateur créé avec succès",
                description: "Un utilisateur a bien été ajouté à l'application.",
                variant: "success",
            });
            router.push("/dashboard/utilisateurs");
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la création de l'utilisateur.",
                variant: "destructive",
            });
            console.error("Error creating user:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <p>Chargement...</p>
            </div>
        );
    }
    return (
        <div className="min-h-screen flex items-start justify-center">
            <div className="max-w-md w-full p-6 rounded-md shadow-md">
                <h2 className="text-2xl font-bold mb-4">Nouvel utilisateur</h2>
                <form onSubmit={handleSubmit} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="email@exemple.com"
                            required
                            onChange={handleInputChange}
                            disabled={loading}
                        />
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="password"
                            required
                            onChange={handleInputChange}
                            disabled={loading}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <span className="loader" /> : "Créer un utilisateur"}
                    </Button>
                </form>
            </div>
        </div>
    );
}