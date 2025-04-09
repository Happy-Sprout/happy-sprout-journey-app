
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Search, FilterX } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type JournalFilters = {
  startDate: Date | undefined;
  endDate: Date | undefined;
  searchTerm: string;
  moodFilter: string;
};

interface JournalFiltersProps {
  filters: JournalFilters;
  setFilters: (filters: JournalFilters) => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;
}

export const JournalFilters = ({ 
  filters, 
  setFilters, 
  hasActiveFilters, 
  clearFilters 
}: JournalFiltersProps) => {
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold">Journal Entries</h3>
        
        {hasActiveFilters && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearFilters}
            className="ml-auto"
          >
            <FilterX className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>
      
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="mb-2 block">From Date</Label>
            <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.startDate ? (
                    format(filters.startDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.startDate}
                  onSelect={(date) => {
                    setFilters({ ...filters, startDate: date });
                    setStartDateOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div>
            <Label className="mb-2 block">To Date</Label>
            <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.endDate ? (
                    format(filters.endDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.endDate}
                  onSelect={(date) => {
                    setFilters({ ...filters, endDate: date });
                    setEndDateOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="mb-2 block">Search Entries</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by content..." 
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                className="pl-8"
              />
            </div>
          </div>
          
          <div>
            <Label className="mb-2 block">Filter by Mood</Label>
            <Select 
              value={filters.moodFilter}
              onValueChange={(value) => setFilters({ ...filters, moodFilter: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by mood" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Moods</SelectItem>
                <SelectItem value="10-8">Very Happy (8-10)</SelectItem>
                <SelectItem value="7-5">Good (5-7)</SelectItem>
                <SelectItem value="4-3">Okay (3-4)</SelectItem>
                <SelectItem value="2-1">Not Good (1-2)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4">
          {filters.startDate && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <span>From: {format(filters.startDate, "PP")}</span>
            </Badge>
          )}
          
          {filters.endDate && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <span>To: {format(filters.endDate, "PP")}</span>
            </Badge>
          )}
          
          {filters.searchTerm && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <span>Search: {filters.searchTerm}</span>
            </Badge>
          )}
          
          {filters.moodFilter && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <span>
                Mood: {
                  filters.moodFilter === "10-8" ? "Very Happy" :
                  filters.moodFilter === "7-5" ? "Good" :
                  filters.moodFilter === "4-3" ? "Okay" :
                  filters.moodFilter === "2-1" ? "Not Good" : ""
                }
              </span>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
