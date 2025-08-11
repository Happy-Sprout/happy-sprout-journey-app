import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SuccessBadge, WarningBadge } from "@/components/ui/badge-extensions";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { AlertTriangle, CheckCircle, Clock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { JournalFlag, JournalFilterState } from "@/types/admin";

const JournalMonitoring = () => {
  const [flags, setFlags] = useState<JournalFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<JournalFilterState>({
    severity: "all",
    status: "all"
  });
  const [selectedFlag, setSelectedFlag] = useState<JournalFlag | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");
  const [resolutionAction, setResolutionAction] = useState("reviewed");
  const { toast } = useToast();

  useEffect(() => {
    fetchFlaggedEntries();
  }, []);

  const fetchFlaggedEntries = async () => {
    setLoading(true);
    try {
      // First get journal monitoring records
      const { data: monitoringData, error: monitoringError } = await supabase
        .from('journal_monitoring')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (monitoringError) throw monitoringError;
      
      if (monitoringData && monitoringData.length > 0) {
        // Get journal entries separately
        const entryIds = monitoringData.map(item => item.entry_id);
        const { data: journalData, error: journalError } = await supabase
          .from('journal_entries')
          .select('id, title, content, created_at, child_id')
          .in('id', entryIds);

        if (journalError) throw journalError;

        // Get children data
        const childIds = journalData?.map(entry => entry.child_id).filter(Boolean) || [];
        const { data: childrenData, error: childrenError } = await supabase
          .from('children')
          .select('id, nickname, age, parent_id')
          .in('id', childIds);

        if (childrenError) throw childrenError;

        // Get parent data
        const parentIds = childrenData?.map(child => child.parent_id).filter(Boolean) || [];
        const { data: parentsData, error: parentsError } = await supabase
          .from('parents')
          .select('id, name, email')
          .in('id', parentIds);

        if (parentsError) throw parentsError;

        // Combine the data
        const formattedData: JournalFlag[] = monitoringData.map(item => {
          const journalEntry = journalData?.find(entry => entry.id === item.entry_id);
          const child = childrenData?.find(c => c.id === journalEntry?.child_id);
          const parent = parentsData?.find(p => p.id === child?.parent_id);

          return {
            ...item,
            journal_entry: journalEntry ? {
              title: journalEntry.title,
              content: journalEntry.content,
              created_at: journalEntry.created_at
            } : null,
            child: child ? {
              nickname: child.nickname,
              age: child.age,
              parent_id: child.parent_id
            } : null,
            parent: parent ? {
              name: parent.name,
              email: parent.email
            } : null
          };
        });

        setFlags(formattedData);
      } else {
        setFlags([]);
      }
    } catch (error) {
      console.error("Error fetching flagged entries:", error);
      toast({
        title: "Error",
        description: "Failed to load flagged journal entries",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedFlag) return;
    
    try {
      const { error } = await supabase
        .from('journal_monitoring')
        .update({
          status: resolutionAction,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id || null
        })
        .eq('id', selectedFlag.id);
        
      if (error) throw error;
      
      await supabase
        .from('user_activity_logs')
        .insert([
          {
            user_id: (await supabase.auth.getUser()).data.user?.id || null,
            user_type: 'admin',
            action_type: 'journal_review',
            action_details: {
              flag_id: selectedFlag.id,
              entry_id: selectedFlag.entry_id,
              resolution: resolutionAction,
              note: resolutionNote
            }
          }
        ]);
      
      toast({
        title: "Success",
        description: "Journal entry status updated successfully"
      });
      
      setFlags(prev => prev.map(flag => 
        flag.id === selectedFlag.id 
          ? { 
              ...flag, 
              status: resolutionAction as 'reviewed' | 'dismissed', 
              reviewed_at: new Date().toISOString()
            } 
          : flag
      ));
      
      setResolveDialogOpen(false);
      setResolutionNote("");
    } catch (error) {
      console.error("Error updating flag status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };

  const filteredFlags = flags.filter(flag => {
    if (filter.severity !== "all" && flag.severity !== filter.severity) {
      return false;
    }
    
    if (filter.status !== "all" && flag.status !== filter.status) {
      return false;
    }
    
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        (flag.child?.nickname?.toLowerCase().includes(searchLower) || false) ||
        (flag.journal_entry?.title?.toLowerCase().includes(searchLower) || false) ||
        (flag.journal_entry?.content?.toLowerCase().includes(searchLower) || false) ||
        flag.flag_reason.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const getSeverityDisplay = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive" className="font-medium">High</Badge>;
      case 'medium':
        return <WarningBadge className="font-medium">Medium</WarningBadge>;
      case 'low':
        return <Badge variant="outline" className="font-medium">Low</Badge>;
      default:
        return severity;
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'reviewed':
        return <SuccessBadge className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Reviewed</SuccessBadge>;
      case 'dismissed':
        return <Badge variant="secondary" className="flex items-center gap-1">Dismissed</Badge>;
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Journal Monitoring</h1>
        <p className="text-muted-foreground">
          Review and manage flagged journal entries
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search flagged entries..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Select 
            value={filter.severity} 
            onValueChange={(value) => setFilter(prev => ({ ...prev, severity: value }))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={filter.status} 
            onValueChange={(value) => setFilter(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Flagged Entries</CardTitle>
          <CardDescription>
            Journal entries that were automatically flagged for review
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Child</TableHead>
                <TableHead>Flag Reason</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    Loading flagged entries...
                  </TableCell>
                </TableRow>
              ) : filteredFlags.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    No flagged entries found
                  </TableCell>
                </TableRow>
              ) : (
                filteredFlags.map((flag) => (
                  <TableRow key={flag.id}>
                    <TableCell>{flag.child?.nickname || 'Unknown'}</TableCell>
                    <TableCell>{flag.flag_reason}</TableCell>
                    <TableCell>{getSeverityDisplay(flag.severity)}</TableCell>
                    <TableCell>{getStatusDisplay(flag.status)}</TableCell>
                    <TableCell>{format(new Date(flag.created_at), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        className="mr-2"
                        onClick={() => {
                          setSelectedFlag(flag);
                          setDetailsOpen(true);
                        }}
                      >
                        View
                      </Button>
                      {flag.status === 'pending' && (
                        <Button 
                          onClick={() => {
                            setSelectedFlag(flag);
                            setResolveDialogOpen(true);
                          }}
                        >
                          Resolve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Flagged Journal Entry
            </DialogTitle>
            <DialogDescription>
              Review the flagged journal entry content
            </DialogDescription>
          </DialogHeader>
          
          {selectedFlag && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Child Information</h3>
                  <p><span className="font-medium">Name:</span> {selectedFlag.child?.nickname}</p>
                  <p><span className="font-medium">Age:</span> {selectedFlag.child?.age}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Parent Information</h3>
                  <p><span className="font-medium">Name:</span> {selectedFlag.parent?.name}</p>
                  <p><span className="font-medium">Email:</span> {selectedFlag.parent?.email}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">Flag Details</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">Severity:</span> 
                  {getSeverityDisplay(selectedFlag.severity)}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">Status:</span> 
                  {getStatusDisplay(selectedFlag.status)}
                </div>
                <p><span className="font-medium">Reason:</span> {selectedFlag.flag_reason}</p>
                <p><span className="font-medium">Date:</span> {format(new Date(selectedFlag.created_at), "MMM d, yyyy")}</p>
              </div>
              
              <div className="border rounded-md p-4 bg-slate-50">
                <h3 className="font-semibold mb-2">Journal Entry</h3>
                <h4 className="text-lg font-medium">{selectedFlag.journal_entry?.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Written on {format(new Date(selectedFlag.journal_entry?.created_at || Date.now()), "MMMM d, yyyy")}
                </p>
                <div className="whitespace-pre-wrap">
                  {selectedFlag.journal_entry?.content}
                </div>
              </div>
              
              {selectedFlag.status !== 'pending' && (
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Review Information</h3>
                  <p><span className="font-medium">Reviewed:</span> {selectedFlag.reviewed_at ? format(new Date(selectedFlag.reviewed_at), "MMMM d, yyyy") : 'Not reviewed'}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
            {selectedFlag?.status === 'pending' && (
              <Button 
                onClick={() => {
                  setDetailsOpen(false);
                  setResolveDialogOpen(true);
                }}
              >
                Resolve
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Flagged Entry</DialogTitle>
            <DialogDescription>
              Update the status of this flagged journal entry
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Resolution</h3>
              <Select value={resolutionAction} onValueChange={setResolutionAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reviewed">Mark as Reviewed</SelectItem>
                  <SelectItem value="dismissed">Dismiss Flag</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Resolution Notes (optional)</h3>
              <Textarea
                placeholder="Add any notes about how this was handled..."
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus}>
              Save Resolution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JournalMonitoring;
