
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';

export interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange: (date: string) => void;
  required?: boolean;
  maxDate?: Date;
  minDate?: Date;
  error?: string;
  placeholder?: string;
}

const DatePickerField = ({
  label,
  value,
  onChange,
  required = false,
  maxDate,
  minDate,
  error,
  placeholder = "Pick a date",
}: DatePickerFieldProps) => {
  const [date, setDate] = useState<Date | undefined>(value ? new Date(value) : undefined);
  
  useEffect(() => {
    if (value) {
      setDate(new Date(value));
    } else {
      setDate(undefined);
    }
  }, [value]);
  
  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      onChange(selectedDate.toISOString().split('T')[0]); // ISO format YYYY-MM-DD
    } else {
      onChange('');
    }
  };
  
  // Calculate a reasonable year range for the calendar
  const currentYear = new Date().getFullYear();
  const fromYear = 1990;
  const toYear = currentYear;
  
  return (
    <div className="space-y-2">
      <Label htmlFor="date-picker">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date-picker"
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground',
              error ? 'border-red-500' : ''
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, 'MMMM d, yyyy') : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-50" align="start" sideOffset={4}>
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            disabled={(date) =>
              (maxDate ? date > maxDate : false) ||
              (minDate ? date < minDate : false)
            }
            initialFocus
            captionLayout="dropdown-buttons"
            fromYear={fromYear}
            toYear={toYear}
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default DatePickerField;
