"use client";
import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
import { Polygon, Technicien } from '@/types/types';
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import type { Feature, Polygon as GeoJSONPolygon } from "geojson";
import L from "leaflet";
import { useState, useEffect, useRef, useCallback } from 'react';
import { apiService } from "@/services/api-service";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import TechnicienSelector from './TechnicienSelector';
import { useToast } from "@/hooks/use-toast";

const styles = {
  map: {
    width: "100%",
    height: "80vh",
    overflow: "hidden",
    zIndex: "0",
  },
};

interface ExtendedPolylineOptions extends L.PolylineOptions {
  id?: number;
}

type ExtendedPolygonLayer = L.Polygon & { options: ExtendedPolylineOptions };

export default function Map() {
  const [polygons, setPolygons] = useState<Polygon[]>([]);
  const [zoneSelected, setZoneSelected] = useState<Polygon | null>(null);
  const [techniciens, setTechniciens] = useState<Technicien[]>([]);
  const deletingIds = useRef(new Set<number>());
  const featureGroupRef = useRef<L.FeatureGroup | null>(null);
  const polygonsRef = useRef<Polygon[]>([]);
  const editingIds = useRef(new Set<number>());
  const { toast } = useToast();

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const data = await apiService("zones", "GET") as Polygon[];
        setPolygons(data);
      } catch (error) {
        console.error("Error fetching zones", error);
      }
    };
    fetchZones();

    const fetchTechniciens = async () => {
      try {
        const fetchedTechniciens = await apiService("users/role-ROLE_TECHNICIEN", "GET") as Technicien[];
        setTechniciens(fetchedTechniciens);
      } catch (error) {
        console.error("Error fetching techniciens", error);
      }
    };
    fetchTechniciens();
  }, []);

  useEffect(() => {
    polygonsRef.current = polygons;
  }, [polygons]);

  // Création d'une zone
  const savePolygon = async (polygon: Polygon) => {
    try {
      const response = await apiService("zones", "POST", polygon) as { id: number };
      setPolygons((prevPolygons) => [...prevPolygons, { ...polygon, id: response.id }]);
      toast({ title: "Succès", description: "Zone créée avec succès." });
    } catch (err: unknown) {
      const e = err as any;
      const errorMessage =
        e?.error ??
        e?.response?.data?.error ??
        e?.message ??
        "Échec de la création de la zone.";
      toast({ title: "Erreur", description: errorMessage });
    }
  };

  const _onCreate = (e: L.DrawEvents.Created) => {
    const layer = e.layer as L.Polygon;
    const feature = layer.toGeoJSON() as Feature<GeoJSONPolygon>;
    const ring = feature.geometry.coordinates[0] as [number, number][];

    const payload: Polygon = {
      id: 0,
      name: `Zone${Math.floor(Math.random() * 1_000_000_000)}`,
      color: "#FF5733",
      coordinates: ring.map(([lng, lat]) => ({ longitude: lng, latitude: lat })),
      technicien: null,
    };

    savePolygon(payload);
  };

  // Modification d'une zone
  const updatePolygon = async (polygon: Polygon) => {
    try {
      await apiService(`zones/${polygon.id}/edit`, "PUT", {
        ...polygon,
        technicien: polygon.technicien || null,
      });
      setPolygons((prevPolygons) =>
        prevPolygons.map((p) => (p.id === polygon.id ? polygon : p))
      );
      toast({ title: "Succès", description: "Zone modifiée avec succès." });
    } catch (err: unknown) {
      const e = err as any;
      const errorMessage =
        e?.error ??
        e?.response?.data?.error ??
        e?.message ??
        "Échec de la modification de la zone.";
      toast({ title: "Erreur", description: errorMessage });
    }
  };

  const _onEditPath = (e: L.DrawEvents.Edited) => {
    e.layers.eachLayer((layer: L.Layer) => {
      if (!(layer instanceof L.Polygon)) return;
      const poly = layer as ExtendedPolygonLayer;
      const layerId = poly.options.id;
      if (!layerId) return;

      if (editingIds.current.has(layerId)) return;
      editingIds.current.add(layerId);

      const feature = poly.toGeoJSON() as Feature<GeoJSONPolygon>;
      const ring = feature.geometry.coordinates[0] as [number, number][];
      const updatedCoordinates = ring.map(([lng, lat]) => ({
        longitude: lng,
        latitude: lat,
      }));

      const updatedPolygon = polygonsRef.current.find((p) => p.id === layerId);
      if (!updatedPolygon) {
        editingIds.current.delete(layerId);
        return;
      }

      const newPolygonData = { ...updatedPolygon, coordinates: updatedCoordinates };
      updatePolygon(newPolygonData).finally(() => {
        editingIds.current.delete(layerId);
      });
    });
  };

  // Suppression d'une zone
  const deletePolygon = async (id: number) => {
    if (deletingIds.current.has(id)) {
      console.warn(`Suppression déjà en cours pour la zone ${id}`);
      return;
    }
    deletingIds.current.add(id);
    try {
      await apiService(`zones/${id}`, "DELETE");
      setPolygons((prevPolygons) => prevPolygons.filter((polygon) => polygon.id !== id));
      toast({ title: "Succès", description: "Suppression réussie." });
    } catch (error) {
      console.error(`Erreur lors de la suppression de la zone ${id} :`, error);
      toast({ title: "Erreur", description: "Échec de la suppression." });
    } finally {
      deletingIds.current.delete(id);
    }
  };

  const _onDeleted = (e: L.DrawEvents.Deleted) => {
    e.layers.eachLayer((layer: L.Layer) => {
      if (!(layer instanceof L.Polygon)) return;
      const poly = layer as ExtendedPolygonLayer;
      const layerId = poly.options.id;
      if (layerId) deletePolygon(layerId);
    });
  };

  const addPolygonsToFeatureGroup = useCallback(() => {
    const featureGroup = featureGroupRef.current;
    if (!featureGroup) return;

    featureGroup.clearLayers();
    polygons.forEach((polygon) => {
      if (!polygon.coordinates) {
        console.warn(`Les coordonnées sont indéfinies pour le polygon avec l'ID ${polygon.id}`);
        return;
      }
      const leafletPolygon = new L.Polygon(
        polygon.coordinates.map((p) => [p.latitude, p.longitude]),
        { color: polygon.color, fillColor: polygon.color, id: polygon.id } as ExtendedPolylineOptions
      );

      leafletPolygon.on("click", () => {
        setZoneSelected(polygon);
      });

      featureGroup.addLayer(leafletPolygon);
    });
  }, [polygons]);

  useEffect(() => {
    addPolygonsToFeatureGroup();
  }, [addPolygonsToFeatureGroup]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{zoneSelected ? `Modifier la zone ${zoneSelected.name}` : "Aucune zone sélectionnée"}</CardTitle>
        </CardHeader>
        <CardContent>
          {zoneSelected && (
            <>
              <Label htmlFor="zoneName">Nom de la zone</Label>
              <Input
                type="text"
                id="zoneName"
                value={zoneSelected.name}
                onChange={(e) =>
                  setZoneSelected((prev) => ({ ...prev!, name: e.target.value }))
                }
              />
              <Label htmlFor="zoneColor">Couleur de la zone</Label>
              <Input
                type="color"
                id="zoneColor"
                value={zoneSelected.color}
                onChange={(e) =>
                  setZoneSelected((prev) => ({ ...prev!, color: e.target.value }))
                }
              />
              <Label htmlFor="technicienSelect">Technicien</Label>
              <TechnicienSelector
                techniciens={techniciens}
                defaultTechnicien={
                  techniciens.find((t) => t.id === zoneSelected?.technicien?.id) || null
                }
                onTechnicienChange={(selectedTechnicien) =>
                  setZoneSelected((prev) => ({
                    ...prev!,
                    technicien: selectedTechnicien,
                  }))
                }
              />

              <Button
                onClick={() => updatePolygon(zoneSelected)}
                className="btn btn-primary mt-2"
              >
                Sauvegarder
              </Button>
            </>
          )}
        </CardContent>
      </Card>
      <MapContainer
        style={styles.map}
        center={[45.757704, 4.834099]}
        zoom={13}
        scrollWheelZoom={true}
        className="rounded-xl"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FeatureGroup ref={featureGroupRef}>
          <EditControl
            position="topright"
            onCreated={_onCreate}
            onDeleted={_onDeleted}
            onEdited={_onEditPath}
            draw={{
              rectangle: false,
              polyline: false,
              circle: false,
              circlemarker: false,
              marker: false,
            }}
          />
        </FeatureGroup>
      </MapContainer>
    </>
  );
}
