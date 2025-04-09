
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { JournalEntry, JournalFilters } from "@/types/journal";
import { JournalEntryItem } from "./JournalEntryItem";
import { JournalFilters as JournalFiltersComponent } from "@/components/JournalFilters";
import { parseISO, isAfter, isBefore, format } from "date-fns";

type JournalHistoryProps = {
  entries: JournalEntry[];
  filters: JournalFilters;
  setFilters: (filters: JournalFilters) => void;
  onNewEntry: () => void;
};

export const JournalHistory = ({ 
  entries, 
  filters, 
  setFilters, 
  onNewEntry 
}: JournalHistoryProps) => {
  const hasActiveFilters = useMemo(() => {
    return (
      !!filters.startDate ||
      !!filters.endDate ||
      !!filters.searchTerm ||
      !!filters.moodFilter
    );
  }, [filters]);
  
  const clearFilters = () => {
    setFilters({
      startDate: undefined,
      endDate: undefined,
      searchTerm: "",
      moodFilter: "",
    });
  };
  
  const filteredEntries = useMemo(() => {
    let filtered = [...entries];
    
    if (filters.startDate) {
      filtered = filtered.filter(entry => {
        const entryDate = parseISO(entry.date);
        return isAfter(entryDate, filters.startDate) || entry.date === format(filters.startDate, "yyyy-MM-dd");
      });
    }
    
    if (filters.endDate) {
      filtered = filtered.filter(entry => {
        const entryDate = parseISO(entry.date);
        return isBefore(entryDate, filters.endDate) || entry.date === format(filters.endDate, "yyyy-MM-dd");
      });
    }
    
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(entry => {
        return (
          entry.wentWell.toLowerCase().includes(searchLower) ||
          entry.wentBadly.toLowerCase().includes(searchLower) ||
          entry.gratitude.toLowerCase().includes(searchLower) ||
          entry.challenge.toLowerCase().includes(searchLower) ||
          entry.tomorrowPlan.toLowerCase().includes(searchLower)
        );
      });
    }
    
    if (filters.moodFilter) {
      const [high, low] = filters.moodFilter.split("-").map(Number);
      filtered = filtered.filter(entry => {
        return entry.mood <= high && entry.mood >= low;
      });
    }
    
    return filtered;
  }, [entries, filters]);
  
  return (
    <div>
      <JournalFiltersComponent 
        filters={filters}
        setFilters={setFilters}
        hasActiveFilters={hasActiveFilters}
        clearFilters={clearFilters}
      />
      
      {filteredEntries.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">
            {hasActiveFilters 
              ? "No Entries Match Your Filters" 
              : "No Journal Entries Yet"}
          </h2>
          <p className="text-gray-600 mb-6">
            {hasActiveFilters 
              ? "Try adjusting or clearing your filters to see more entries."
              : "Start writing in your journal to see your entries here."}
          </p>
          {hasActiveFilters ? (
            <Button variant="outline" onClick={clearFilters}>
              Clear All Filters
            </Button>
          ) : (
            <Button className="sprout-button" onClick={onNewEntry}>
              Create First Entry
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredEntries.map((entry) => (
            <JournalEntryItem key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
};
