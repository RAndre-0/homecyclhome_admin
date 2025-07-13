export interface Zone {
  id: number;
  name: string;
  color: string;
  coordinates: Coordinate[];
  technicien: Technicien | null;
}

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface Polygon {
  id?: number;
  name: string;
  color?: string;
  coordinates?: Coordinate[];
  technicien?: Technicien | null;
}

export interface Technicien {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

export interface Client {
  id: number;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
}

export interface TypeIntervention {
  nom: string;
  duree: string | number | Date | null | undefined;
  prixDepart: string | null;
}

export interface Intervention {
  id: number;
  debut: string;
  fin: string | null;
  commentaireClient: string | null;
  photo: string | null;
  veloCategorie: string | null;
  veloElectrique: boolean | null;
  veloModele: string | null;
  veloMarque: string | null;
  adresse: string | null;
  typeIntervention: TypeIntervention | null;
  client: Client | null;
  technicien: Technicien | null;
}

export interface ModelePlanning {
  id: number;
  name: string;
}

export interface InterventionModel {
  id: number;
  interventionTime: string;
  typeIntervention: TypeIntervention;
}

export interface Model {
  id: number;
  name: string;
  modeleInterventions: InterventionModel[];
}
