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
import InterventionDetailsDialog from "./InterventionDetailsDialog";
import CreateInterventionDialog from "./CreateInterventionDialog";
import { EventClickArg } from "@fullcalendar/core";
import { DateClickArg } from "@fullcalendar/interaction";


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

  useEffect(() => {
    if (selectedTechnicien) {
      const fetchInterventions = async () => {
        try {
          const data = await apiService(`interventions/technicien/${selectedTechnicien.id}`, "GET");
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

const handleEventClick = (info: EventClickArg) => {
  info.jsEvent?.preventDefault();
  const clicked = interventions.find(i => i.id.toString() === info.event.id);
  if (clicked) {
    setSelectedIntervention(convertKeysToCamel(clicked));
    setDialogOpen(true);
  }
};

const handleDateClick = (arg: DateClickArg) => {
  setSelectedDate(arg.dateStr);
  setDialog2Open(true);
};

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
        initialView="timeGridWeek"
        weekends={false}
        events={interventions.map((intervention) => ({
          id: intervention.id.toString(),
          title: intervention.typeIntervention?.nom ?? "Intervention",
          start: intervention.debut,
          end: intervention.fin || undefined,
          color: intervention.client ? "#3e69a0" : "#757575",
        }))}
        eventClick={handleEventClick}
        locale={frLocale}
        selectable
        allDaySlot={false}
        slotMinTime="09:00:00"
        slotMaxTime="18:00:00"
        height="100%"
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
        selectedDate={selectedDate}
        onRefresh={onRefresh}
      />
    </>
  );
}

// function renderEventContent(eventInfo: EventContentArg) {
//   return (
//     <>
//       <b>{eventInfo.timeText}</b>
//       <br />
//       <i>{eventInfo.event.title}</i>
//     </>
//   );
// }
