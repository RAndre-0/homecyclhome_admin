"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import frLocale from "@fullcalendar/core/locales/fr";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useEffect, useState } from "react";
import { apiService, convertKeysToCamel } from "@/services/api-service";
import { Intervention, Technicien } from "@/types/types";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import InterventionDetailsDialog from './InterventionDetailsDialog';
import CreateInterventionDialog from "./CreateInterventiondialog";

dayjs.extend(duration);

interface CalendarProps {
  selectedTechnicien: Technicien | null;
  onRefresh: () => void;
}

export default function FullCalendarAdmin({ selectedTechnicien, onRefresh }: CalendarProps) {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isDialog2Open, setDialog2Open] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Récupérer les interventions d'un technicien
  useEffect(() => {
    if (selectedTechnicien) {
      const fetchInterventions = async () => {
        try {
          const data = await apiService(
            `interventions/technicien/${selectedTechnicien.id}`,
            "GET"
          );
          setInterventions(data);
        } catch (error) {
          console.error("Erreur lors de la récupération des interventions", error);
        }
      };
      fetchInterventions();
    } else {
      setInterventions([]);
    }
  }, [selectedTechnicien]);

  const handleEventClick = (info: any) => {
    info.jsEvent.preventDefault(); // Empêche la navigation par défaut
    const clickedIntervention = interventions.find(intervention => intervention.id === parseInt(info.event.id));
    if (clickedIntervention) {
        setSelectedIntervention(convertKeysToCamel(clickedIntervention)); // Convertit les clés en camelCase
        setDialogOpen(true);
    }
};

  // Gérer le clic sur une date vide
  const handleDateClick = (arg: any) => {
    setSelectedDate(arg.dateStr); // Stocke la date cliquée
    setDialog2Open(true); // Ouvre le formulaire
  };

  return (
    <>
    <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
        initialView="timeGridWeek"
        weekends={false}
        events={interventions.map((intervention) => ({
          id: intervention.id.toString(),
          title: intervention.typeIntervention?.nom ?? 'Intervention',
          start: intervention.debut,
          end: intervention.fin || undefined,
          color: intervention.client ? "#3e69a0" : "#757575",
      }))}
        eventClick={handleEventClick}
        locale={frLocale}
        selectable={true}
        allDaySlot={false}
        slotMinTime={"09:00:00"}
        slotMaxTime={"18:00:00"}
        height={"100%"}
        dateClick={handleDateClick}
        timeZone="Europe/Paris"
    />
    <InterventionDetailsDialog
        intervention={selectedIntervention}
        isOpen={isDialogOpen}
        onClose={() => setDialogOpen(false)}
    />
      <CreateInterventionDialog
        isOpen={isDialog2Open}
        onClose={() => setDialog2Open(false)}
        selectedDate={selectedDate} // Passe la date sélectionnée
        onRefresh={onRefresh} // Rafraîchit les interventions
      />
</>
  );
}

function renderEventContent(eventInfo: any) {
  return (
    <>
      <b>{eventInfo.timeText}</b>
      <br />
      <i>{eventInfo.event.title}</i>
    </>
  );
}

