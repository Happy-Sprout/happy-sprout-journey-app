import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Search, UserPlus, Trash2, Edit, Eye } from "lucide-react";
import { format } from "date-fns";
import { crypto } from "crypto";

type Parent = {
  id: string;
  name: string;
  email: string;
  relationship: string;
  emergency_contact: string;
  additional_info?: string;
  created_at: string;
  childCount?: number;
};

type Child = {
  id: string;
  nickname: string;
  age: number;
  gender?: string;
  grade: string;
  parent_id: string;
  parent_name?: string;
  created_at: string;
};

const UserManagement = () => {
  const [parents, setParents] = useState<Parent[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'parent' | 'child' } | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [editParentForm, setEditParentForm] = useState<Partial<Parent>>({});
  const [editChildForm, setEditChildForm] = useState<Partial<Child>>({});
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [newParentForm, setNewParentForm] = useState<Partial<Parent>>({
    name: '',
    email: '',
    relationship: 'Parent',
    emergency_contact: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: parentsData, error: parentsError } = await supabase
        .from('parents')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (parentsError) throw parentsError;
      
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*, parents(name)')
        .order('created_at', { ascending: false });
        
      if (childrenError) throw childrenError;
      
      const childCounts: Record<string, number> = {};
      childrenData?.forEach(child => {
        const parentId = child.parent_id;
        childCounts[parentId] = (childCounts[parentId] || 0) + 1;
      });
      
      const formattedParents = parentsData?.map(parent => ({
        ...parent,
        childCount: childCounts[parent.id] || 0
      })) || [];
      
      const formattedChildren = childrenData?.map(child => ({
        ...child,
        parent_name: child.parents?.name
      })) || [];
      
      setParents(formattedParents);
      setChildren(formattedChildren);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load user data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!itemToDelete) return;
    
    try {
      const { id, type } = itemToDelete;
      let error;
      
      if (type === 'parent') {
        const result = await supabase
          .from('parents')
          .delete()
          .eq('id', id);
          
        error = result.error;
      } else {
        const result = await supabase
          .from('children')
          .delete()
          .eq('id', id);
          
        error = result.error;
      }
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: `${type === 'parent' ? 'Parent' : 'Child'} account deleted successfully`
      });
      
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: `Failed to delete ${itemToDelete.type}`,
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleEditParent = async () => {
    if (!selectedParent || !editParentForm) return;
    
    try {
      const { error } = await supabase
        .from('parents')
        .update({
          name: editParentForm.name,
          email: editParentForm.email,
          relationship: editParentForm.relationship,
          emergency_contact: editParentForm.emergency_contact,
          additional_info: editParentForm.additional_info
        })
        .eq('id', selectedParent.id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Parent information updated successfully"
      });
      
      fetchUsers();
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating parent:", error);
      toast({
        title: "Error",
        description: "Failed to update parent information",
        variant: "destructive"
      });
    }
  };

  const handleEditChild = async () => {
    if (!selectedChild || !editChildForm) return;
    
    try {
      const { error } = await supabase
        .from('children')
        .update({
          nickname: editChildForm.nickname,
          age: editChildForm.age,
          gender: editChildForm.gender,
          grade: editChildForm.grade
        })
        .eq('id', selectedChild.id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Child information updated successfully"
      });
      
      fetchUsers();
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating child:", error);
      toast({
        title: "Error",
        description: "Failed to update child information",
        variant: "destructive"
      });
    }
  };

  const handleAddParent = async () => {
    try {
      if (!newParentForm.name || !newParentForm.email) {
        throw new Error("Name and email are required");
      }
      
      const newId = crypto.randomUUID();
      
      const { data, error } = await supabase
        .from('parents')
        .insert([
          {
            id: newId,
            name: newParentForm.name,
            email: newParentForm.email,
            relationship: newParentForm.relationship || 'Parent',
            emergency_contact: newParentForm.emergency_contact || '',
            additional_info: newParentForm.additional_info
          }
        ])
        .select();
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "New parent added successfully"
      });
      
      fetchUsers();
      setAddUserDialogOpen(false);
      setNewParentForm({
        name: '',
        email: '',
        relationship: 'Parent',
        emergency_contact: ''
      });
    } catch (error) {
      console.error("Error adding parent:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add parent",
        variant: "destructive"
      });
    }
  };

  const filteredParents = parents.filter(parent => 
    parent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    parent.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredChildren = children.filter(child => 
    child.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (child.parent_name && child.parent_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground">
              Manage parent and child accounts
            </p>
          </div>
          <Button onClick={() => setAddUserDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name or email..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs defaultValue="parents">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="parents">Parents ({parents.length})</TabsTrigger>
            <TabsTrigger value="children">Children ({children.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="parents">
            <Card>
              <CardHeader>
                <CardTitle>Parent Accounts</CardTitle>
                <CardDescription>
                  Manage parent accounts in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Relationship</TableHead>
                      <TableHead>Children</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10">
                          Loading users...
                        </TableCell>
                      </TableRow>
                    ) : filteredParents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10">
                          No parents found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredParents.map((parent) => (
                        <TableRow key={parent.id}>
                          <TableCell>{parent.name}</TableCell>
                          <TableCell>{parent.email}</TableCell>
                          <TableCell>{parent.relationship}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{parent.childCount}</Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(parent.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedParent(parent);
                                    setViewDetailsOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedParent(parent);
                                    setEditParentForm({
                                      name: parent.name,
                                      email: parent.email,
                                      relationship: parent.relationship,
                                      emergency_contact: parent.emergency_contact,
                                      additional_info: parent.additional_info
                                    });
                                    setEditDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => {
                                    setItemToDelete({ id: parent.id, type: 'parent' });
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="children">
            <Card>
              <CardHeader>
                <CardTitle>Child Profiles</CardTitle>
                <CardDescription>
                  Manage child profiles in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Parent</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10">
                          Loading profiles...
                        </TableCell>
                      </TableRow>
                    ) : filteredChildren.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10">
                          No children found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredChildren.map((child) => (
                        <TableRow key={child.id}>
                          <TableCell>{child.nickname}</TableCell>
                          <TableCell>{child.age}</TableCell>
                          <TableCell>{child.grade}</TableCell>
                          <TableCell>{child.parent_name}</TableCell>
                          <TableCell>
                            {new Date(child.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedChild(child);
                                    setViewDetailsOpen(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedChild(child);
                                    setEditChildForm({
                                      nickname: child.nickname,
                                      age: child.age,
                                      gender: child.gender,
                                      grade: child.grade
                                    });
                                    setEditDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => {
                                    setItemToDelete({ id: child.id, type: 'child' });
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this {itemToDelete?.type} account? This action cannot be undone.
                {itemToDelete?.type === 'parent' && (
                  <p className="mt-2 text-red-500 font-semibold">Warning: This will also delete all associated child profiles.</p>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteUser}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedParent ? 'Parent Details' : selectedChild ? 'Child Profile' : 'User Details'}
              </DialogTitle>
              <DialogDescription>
                View detailed information about this user.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedParent && (
                <>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div>
                      <Label>Name</Label>
                      <p className="font-medium">{selectedParent.name}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="font-medium">{selectedParent.email}</p>
                    </div>
                    <div>
                      <Label>Relationship</Label>
                      <p>{selectedParent.relationship}</p>
                    </div>
                    <div>
                      <Label>Children</Label>
                      <p>{selectedParent.childCount || 0}</p>
                    </div>
                    <div>
                      <Label>Emergency Contact</Label>
                      <p>{selectedParent.emergency_contact || 'None provided'}</p>
                    </div>
                    <div>
                      <Label>Joined</Label>
                      <p>{format(new Date(selectedParent.created_at), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Additional Information</Label>
                    <p className="mt-1">{selectedParent.additional_info || 'No additional information provided.'}</p>
                  </div>
                </>
              )}
              
              {selectedChild && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <Label>Name</Label>
                    <p className="font-medium">{selectedChild.nickname}</p>
                  </div>
                  <div>
                    <Label>Age</Label>
                    <p>{selectedChild.age}</p>
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <p>{selectedChild.gender || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label>Grade</Label>
                    <p>{selectedChild.grade}</p>
                  </div>
                  <div>
                    <Label>Parent</Label>
                    <p>{selectedChild.parent_name}</p>
                  </div>
                  <div>
                    <Label>Created</Label>
                    <p>{format(new Date(selectedChild.created_at), "MMM d, yyyy")}</p>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button onClick={() => setViewDetailsOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedParent ? 'Edit Parent' : 'Edit Child Profile'}
              </DialogTitle>
              <DialogDescription>
                Update information for this user.
              </DialogDescription>
            </DialogHeader>
            
            {selectedParent && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="parentName">Name</Label>
                    <Input 
                      id="parentName" 
                      value={editParentForm.name || ''} 
                      onChange={(e) => setEditParentForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="parentEmail">Email</Label>
                    <Input 
                      id="parentEmail" 
                      type="email" 
                      value={editParentForm.email || ''} 
                      onChange={(e) => setEditParentForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="parentRelationship">Relationship</Label>
                    <Input 
                      id="parentRelationship" 
                      value={editParentForm.relationship || ''} 
                      onChange={(e) => setEditParentForm(prev => ({ ...prev, relationship: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input 
                      id="emergencyContact" 
                      value={editParentForm.emergency_contact || ''} 
                      onChange={(e) => setEditParentForm(prev => ({ ...prev, emergency_contact: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="additionalInfo">Additional Information</Label>
                    <Textarea 
                      id="additionalInfo" 
                      rows={3}
                      value={editParentForm.additional_info || ''} 
                      onChange={(e) => setEditParentForm(prev => ({ ...prev, additional_info: e.target.value }))}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditParent}>
                    Save Changes
                  </Button>
                </DialogFooter>
              </div>
            )}
            
            {selectedChild && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="childName">Name</Label>
                    <Input 
                      id="childName" 
                      value={editChildForm.nickname || ''} 
                      onChange={(e) => setEditChildForm(prev => ({ ...prev, nickname: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="childAge">Age</Label>
                    <Input 
                      id="childAge" 
                      type="number" 
                      min={1}
                      value={editChildForm.age || ''} 
                      onChange={(e) => setEditChildForm(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="childGender">Gender</Label>
                    <Input 
                      id="childGender" 
                      value={editChildForm.gender || ''} 
                      onChange={(e) => setEditChildForm(prev => ({ ...prev, gender: e.target.value }))}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="childGrade">Grade</Label>
                    <Input 
                      id="childGrade" 
                      value={editChildForm.grade || ''} 
                      onChange={(e) => setEditChildForm(prev => ({ ...prev, grade: e.target.value }))}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleEditChild}>
                    Save Changes
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
        
        <Dialog open={addUserDialogOpen} onOpenChange={setAddUserDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Parent</DialogTitle>
              <DialogDescription>
                Create a new parent account in the system.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newParentName">Name *</Label>
                <Input 
                  id="newParentName" 
                  value={newParentForm.name || ''} 
                  onChange={(e) => setNewParentForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Full Name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newParentEmail">Email *</Label>
                <Input 
                  id="newParentEmail" 
                  type="email" 
                  value={newParentForm.email || ''} 
                  onChange={(e) => setNewParentForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@example.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newParentRelationship">Relationship</Label>
                <Input 
                  id="newParentRelationship" 
                  value={newParentForm.relationship || ''} 
                  onChange={(e) => setNewParentForm(prev => ({ ...prev, relationship: e.target.value }))}
                  placeholder="Parent, Guardian, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newEmergencyContact">Emergency Contact</Label>
                <Input 
                  id="newEmergencyContact" 
                  value={newParentForm.emergency_contact || ''} 
                  onChange={(e) => setNewParentForm(prev => ({ ...prev, emergency_contact: e.target.value }))}
                  placeholder="Phone number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newAdditionalInfo">Additional Information</Label>
                <Textarea 
                  id="newAdditionalInfo" 
                  rows={3}
                  value={newParentForm.additional_info || ''} 
                  onChange={(e) => setNewParentForm(prev => ({ ...prev, additional_info: e.target.value }))}
                  placeholder="Any additional notes about this parent"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddUserDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddParent}>
                Add Parent
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
