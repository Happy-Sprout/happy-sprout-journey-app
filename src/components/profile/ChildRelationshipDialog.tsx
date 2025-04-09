
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ChildRelationshipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  relationshipValue: string;
  setRelationshipValue: (value: string) => void;
  onSave: () => void;
}

const ChildRelationshipDialog = ({
  open,
  onOpenChange,
  relationshipValue,
  setRelationshipValue,
  onSave
}: ChildRelationshipDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">Edit Relationship</DialogTitle>
          <DialogDescription className="text-center">
            Define the relationship between this child and the parent
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Label htmlFor="relationship" className="block">Relationship</Label>
          <Select
            value={relationshipValue}
            onValueChange={setRelationshipValue}
          >
            <SelectTrigger id="relationship" className="w-full">
              <SelectValue placeholder="Select a relationship" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Son">Son</SelectItem>
              <SelectItem value="Daughter">Daughter</SelectItem>
              <SelectItem value="Stepchild">Stepchild</SelectItem>
              <SelectItem value="Foster Child">Foster Child</SelectItem>
              <SelectItem value="Grandchild">Grandchild</SelectItem>
              <SelectItem value="Nephew">Nephew</SelectItem>
              <SelectItem value="Niece">Niece</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            className="sprout-button" 
            onClick={onSave}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChildRelationshipDialog;
