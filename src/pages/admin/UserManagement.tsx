
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
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Search, UserPlus, Trash2, Edit, Eye } from "lucide-react";

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
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch parents
      const { data: parentsData, error: parentsError } = await supabase
        .from('parents')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (parentsError) throw parentsError;
      
      // Fetch children
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*, parents(name)')
        .order('created_at', { ascending: false });
        
      if (childrenError) throw childrenError;
      
      // Count children per parent
      const childCounts: Record<string, number> = {};
      childrenData?.forEach(child => {
        const parentId = child.parent_id;
        childCounts[parentId] = (childCounts[parentId] || 0) + 1;
      });
      
      // Format parent data with child count
      const formattedParents = parentsData?.map(parent => ({
        ...parent,
        childCount: childCounts[parent.id] || 0
      })) || [];
      
      // Format children data with parent name
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
        // Delete parent (cascade will delete children)
        const result = await supabase
          .from('parents')
          .delete()
          .eq('id', id);
          
        error = result.error;
      } else {
        // Delete child
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
          <Button>
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
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
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
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem>
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
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
