import { format } from "date-fns";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

// Formate les dates en 'Y-m-d'
export const formatDate = (date: Date | null) => {
    return date ? format(date, 'yyyy-MM-dd') : null;
};

// Formate les dates et heures en 'Y-m-d H:i:s'
export const formatDateTime = (date: Date | null) => {
    return date ? format(date, 'yyyy-MM-dd HH:mm:ss') : null;
};

// Formate les dates en heure UTC 'H:i', ex: '1970-01-01T00:30:00+00:00' -> '00:30'
export const formatTimeUtc = (isoString: string | null) =>
  isoString ? dayjs.utc(isoString).format("HH:mm") : null;
