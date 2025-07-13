import { format } from "date-fns";

// Formate les dates en 'Y-m-d'
export const formatDate = (date: Date | null) => {
    return date ? format(date, 'yyyy-MM-dd') : null;
};

// Formate les dates et heures en 'Y-m-d H:i:s'
export const formatDateTime = (date: Date | null) => {
    return date ? format(date, 'yyyy-MM-dd HH:mm:ss') : null;
};