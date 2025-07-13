"use client"

import * as React from "react";
import { addMonths, addYears, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { fr } from 'date-fns/locale';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export function DatePickerWithRange({
    className,
    onChange,
}: { className?: string; onChange: (range: { startDate: Date | null; endDate: Date | null }) => void }) {
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: addMonths(new Date(), -1),
        to: addYears(new Date(), 1),
    });

    const handleDateChange = (range: DateRange | undefined) => {
        setDate(range);
        onChange({
            startDate: range?.from || null,
            endDate: range?.to || null,
        });
    };

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[300px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "d MMM, y", { locale: fr })} -{" "}
                                    {format(date.to, "d MMM, y", { locale: fr })}
                                </>
                            ) : (
                                format(date.from, "d MMM, y", { locale: fr })
                            )
                        ) : (
                            <span>Sélectionner une date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={handleDateChange}
                        numberOfMonths={2}
                        locale={fr}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}

