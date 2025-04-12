
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  id?: string;
  maxDate?: Date;
}

const DatePickerField = ({
  label,
  value,
  onChange,
  required = false,
  id = "dob",
  maxDate = new Date(),
}: DatePickerFieldProps) => {
  // Convert string date to Date object for the calendar
  const [date, setDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined
  );

  // Update the calendar date when the input value changes
  useEffect(() => {
    if (value) {
      setDate(new Date(value));
    } else {
      setDate(undefined);
    }
  }, [value]);

  // Handle date selection from calendar
  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      // Format the date as YYYY-MM-DD for the input field
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      onChange(formattedDate);
    } else {
      setDate(undefined);
      onChange("");
    }
  };

  // Calculate the start year for the calendar (100 years ago)
  const fromYear = new Date().getFullYear() - 100;
  // Current year for max date
  const toYear = new Date().getFullYear();

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Calendar popover for better UX */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-auto justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "MMMM d, yyyy") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleSelect}
              disabled={(date) => date > maxDate}
              initialFocus
              captionLayout="dropdown-buttons"
              fromYear={fromYear}
              toYear={toYear}
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        
        {/* Standard date input for fallback */}
        <div className="relative flex-grow">
          <Input
            id={id}
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className="sprout-input"
            max={format(maxDate, "yyyy-MM-dd")}
          />
        </div>
      </div>
      
      {date && (
        <p className="text-sm text-gray-500">
          Selected: {format(date, "MMMM d, yyyy")}
        </p>
      )}
    </div>
  );
};

export default DatePickerField;
