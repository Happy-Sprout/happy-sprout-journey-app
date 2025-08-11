
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Bell, 
  BellOff,
  Clock,
  Users,
  User,
  Settings,
  Send,
  AlertCircle
} from "lucide-react";

type NotificationTrigger = {
  id: string;
  name: string;
  type: 'parent' | 'child';
  trigger_event: string;
  title: string;
  message: string;
  frequency: 'once' | 'daily' | 'weekly';
  enabled: boolean;
  delay_minutes?: number;
  created_at: string;
};

type NotificationTemplate = {
  id: string;
  name: string;
  category: string;
  title: string;
  message: string;
  variables: string[];
  created_at: string;
};

const NotificationsManagement = () => {
  const [activeTab, setActiveTab] = useState("parent-notifications");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Database-backed templates with fallback to mock data
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  
  // Mock data for notifications with proper interface
  const [parentNotifications, setParentNotifications] = useState<NotificationTrigger[]>([
    {
      id: "1",
      name: "Daily Check-in Reminder",
      type: "parent",
      trigger_event: "daily_checkin_missed",
      title: "Daily Check-in Reminder",
      message: "Don't forget to help {child_name} complete their daily check-in!",
      frequency: "daily",
      enabled: true,
      delay_minutes: 60,
      created_at: new Date().toISOString()
    },
    {
      id: "2", 
      name: "Weekly Progress Summary",
      type: "parent",
      trigger_event: "weekly_summary",
      title: "Weekly Progress for {child_name}",
      message: "Here's {child_name}'s weekly progress summary. They completed {completed_activities} activities this week!",
      frequency: "weekly",
      enabled: true,
      created_at: new Date().toISOString()
    },
    {
      id: "3",
      name: "Streak Achievement",
      type: "parent",
      trigger_event: "streak_milestone",
      title: "🎉 {child_name} reached a milestone!",
      message: "{child_name} has maintained a {streak_days}-day streak! Great job supporting their journey.",
      frequency: "once",
      enabled: true,
      created_at: new Date().toISOString()
    }
  ]);

  const [childNotifications, setChildNotifications] = useState<NotificationTrigger[]>([
    {
      id: "1",
      name: "Morning Motivation",
      type: "child",
      trigger_event: "morning_prompt",
      title: "Good morning, {child_name}! ☀️",
      message: "Ready to start another amazing day? Don't forget to check in with yourself!",
      frequency: "daily",
      enabled: true,
      created_at: new Date().toISOString()
    },
    {
      id: "2",
      name: "Bedtime Reflection",
      type: "child", 
      trigger_event: "evening_prompt",
      title: "Time to reflect, {child_name} 🌙",
      message: "Before bed, take a moment to think about the good things that happened today!",
      frequency: "daily",
      enabled: true,
      delay_minutes: 30,
      created_at: new Date().toISOString()
    },
    {
      id: "3",
      name: "Low Mood Support",
      type: "child",
      trigger_event: "low_mood_detected",
      title: "You've got this! 💪",
      message: "Remember, it's okay to have tough days. You are brave, kind, and amazing!",
      frequency: "once",
      enabled: true,
      created_at: new Date().toISOString()
    },
    {
      id: "4",
      name: "Daily Check-in Reminder",
      type: "child",
      trigger_event: "daily_checkin_reminder",
      title: "Time for your daily check-in! 🌟",
      message: "Hi {child_name}! How are you feeling today? Let's record your emotions and thoughts.",
      frequency: "daily",
      enabled: true,
      delay_minutes: 0,
      created_at: new Date().toISOString()
    },
    {
      id: "5",
      name: "Encouragement Message",
      type: "child",
      trigger_event: "encouragement",
      title: "You're doing great! ⭐",
      message: "Keep up the amazing work, {child_name}! Every small step counts on your emotional journey.",
      frequency: "weekly",
      enabled: true,
      created_at: new Date().toISOString()
    },
    {
      id: "6",
      name: "New Badge Earned",
      type: "child",
      trigger_event: "badge_earned",
      title: "Congratulations! 🏆",
      message: "Amazing, {child_name}! You've earned the {badge_name} badge. You should be proud!",
      frequency: "once",
      enabled: true,
      created_at: new Date().toISOString()
    }
  ]);
  
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading templates:', error);
        // Use fallback mock templates if database fails
        setTemplates([
          {
            id: "1",
            name: "Daily Check-in Reminder",
            category: "daily_checkin_reminder",
            title: "Time for your daily check-in! 🌟",
            message: "Hi {{child_name}}! How are you feeling today? Let's record your emotions and thoughts.",
            variables: ["child_name"],
            created_at: new Date().toISOString()
          },
          {
            id: "2",
            name: "Parent Progress Update",
            category: "weekly_progress",
            title: "{{child_name}}'s Weekly Progress",
            message: "{{child_name}} completed {{checkin_count}} check-ins this week and earned {{xp_earned}} XP points!",
            variables: ["child_name", "checkin_count", "xp_earned"],
            created_at: new Date().toISOString()
          },
          {
            id: "3",
            name: "Streak Achievement",
            category: "streak_milestone",
            title: "Amazing streak! 🔥",
            message: "Wow {{child_name}}! You've maintained a {{streak_days}}-day streak. Keep up the great work!",
            variables: ["child_name", "streak_days"],
            created_at: new Date().toISOString()
          }
        ]);
        return;
      }

      // Transform database data to match our interface
      const transformedTemplates: NotificationTemplate[] = data?.map(template => ({
        id: template.id,
        name: template.name,
        category: template.trigger_event,
        title: template.title_template,
        message: template.body_template,
        variables: extractVariables(template.body_template),
        created_at: template.created_at
      })) || [];

      setTemplates(transformedTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      // Fallback to mock data
      setTemplates([
        {
          id: "1",
          name: "Daily Check-in Reminder",
          category: "daily_checkin_reminder", 
          title: "Time for your daily check-in! 🌟",
          message: "Hi {{child_name}}! How are you feeling today?",
          variables: ["child_name"],
          created_at: new Date().toISOString()
        }
      ]);
    }
  };

  const extractVariables = (template: string): string[] => {
    const matches = template.match(/\{\{([^}]+)\}\}/g);
    return matches ? matches.map(match => match.replace(/[{}]/g, '')) : [];
  };
  
  const [notificationTemplates, setNotificationTemplates] = useState<NotificationTemplate[]>([
    {
      id: "1",
      name: "Daily Reminder Template",
      category: "Engagement",
      title: "Don't forget your daily check-in!",
      message: "Hi {child_name}, remember to complete your daily emotional check-in. Your feelings matter!",
      variables: ["child_name"],
      created_at: new Date().toISOString()
    },
    {
      id: "2",
      name: "Achievement Celebration",
      category: "Motivation",
      title: "🎉 Amazing work, {child_name}!",
      message: "You completed {activity_name} today! You're developing great emotional skills. Keep it up!",
      variables: ["child_name", "activity_name"],
      created_at: new Date().toISOString()
    },
    {
      id: "3",
      name: "Parent Progress Update",
      category: "Progress",
      title: "{child_name}'s Progress Update",
      message: "This week, {child_name} showed improvement in {skill_area}. They completed {activity_count} activities.",
      variables: ["child_name", "skill_area", "activity_count"],
      created_at: new Date().toISOString()
    }
  ]);

  // Form states
  const [notificationForm, setNotificationForm] = useState({
    name: "",
    trigger_event: "",
    title: "",
    message: "",
    frequency: "daily" as "once" | "daily" | "weekly",
    enabled: true,
    delay_minutes: 0
  });

  const [templateForm, setTemplateForm] = useState({
    name: "",
    category: "",
    title: "",
    message: "",
    variables: ""
  });

  const { toast } = useToast();

  const handleAddNotification = () => {
    if (!notificationForm.name.trim() || !notificationForm.title.trim()) {
      toast({ title: "Error", description: "Name and title are required", variant: "destructive" });
      return;
    }
    
    const newNotification: NotificationTrigger = {
      id: Date.now().toString(),
      name: notificationForm.name,
      type: activeTab === "parent-notifications" ? "parent" : "child",
      trigger_event: notificationForm.trigger_event,
      title: notificationForm.title,
      message: notificationForm.message,
      frequency: notificationForm.frequency,
      enabled: notificationForm.enabled,
      delay_minutes: notificationForm.delay_minutes || undefined,
      created_at: new Date().toISOString()
    };
    
    if (activeTab === "parent-notifications") {
      setParentNotifications(prev => [newNotification, ...prev]);
    } else {
      setChildNotifications(prev => [newNotification, ...prev]);
    }
    
    setNotificationForm({
      name: "",
      trigger_event: "",
      title: "",
      message: "",
      frequency: "daily",
      enabled: true,
      delay_minutes: 0
    });
    setDialogOpen(false);
    
    toast({ title: "Success", description: "Notification trigger created successfully" });
  };

  const handleAddTemplate = () => {
    if (!templateForm.name.trim() || !templateForm.title.trim()) {
      toast({ title: "Error", description: "Name and title are required", variant: "destructive" });
      return;
    }
    
    const newTemplate: NotificationTemplate = {
      id: Date.now().toString(),
      name: templateForm.name,
      category: templateForm.category || "General",
      title: templateForm.title,
      message: templateForm.message,
      variables: templateForm.variables.split(',').map(v => v.trim()).filter(v => v),
      created_at: new Date().toISOString()
    };
    
    setTemplates(prev => [newTemplate, ...prev]);
    setTemplateForm({
      name: "",
      category: "",
      title: "",
      message: "",
      variables: ""
    });
    setTemplateDialogOpen(false);
    
    toast({ title: "Success", description: "Notification template created successfully" });
  };

  const toggleNotification = (id: string, enabled: boolean) => {
    if (activeTab === "parent-notifications") {
      setParentNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, enabled } : n)
      );
    } else {
      setChildNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, enabled } : n)
      );
    }
    
    toast({ 
      title: "Updated", 
      description: `Notification ${enabled ? 'enabled' : 'disabled'}` 
    });
  };

  const handleDelete = (id: string, type: string) => {
    switch (type) {
      case 'parent':
        setParentNotifications(prev => prev.filter(n => n.id !== id));
        break;
      case 'child':
        setChildNotifications(prev => prev.filter(n => n.id !== id));
        break;
      case 'template':
        setNotificationTemplates(prev => prev.filter(t => t.id !== id));
        break;
    }
    toast({ title: "Success", description: "Item deleted successfully" });
  };

  const currentNotifications = activeTab === "parent-notifications" ? parentNotifications : childNotifications;
  const enabledCount = currentNotifications.filter(n => n.enabled).length;
  const totalCount = currentNotifications.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Notifications Management</h1>
          <p className="text-muted-foreground">
            Configure parent and child notification triggers and templates
          </p>
        </div>
        
        <Button onClick={() => setTemplateDialogOpen(true)} variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Manage Templates
        </Button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Parent Notifications
            </CardTitle>
            <Users className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{parentNotifications.length}</div>
            <p className="text-xs text-muted-foreground">
              {parentNotifications.filter(n => n.enabled).length} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Child Notifications
            </CardTitle>
            <User className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{childNotifications.length}</div>
            <p className="text-xs text-muted-foreground">
              {childNotifications.filter(n => n.enabled).length} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Templates
            </CardTitle>
            <Bell className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notificationTemplates.length}</div>
            <p className="text-xs text-muted-foreground">Reusable templates</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Triggers
            </CardTitle>
            <AlertCircle className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enabledCount}</div>
            <p className="text-xs text-muted-foreground">
              of {totalCount} triggers
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="parent-notifications">Parent Notifications</TabsTrigger>
          <TabsTrigger value="child-notifications">Child Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="parent-notifications">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Parent Notifications
                  </CardTitle>
                  <CardDescription>
                    Configure notifications and reminders for parents
                  </CardDescription>
                </div>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Notification
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Delay</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parentNotifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell className="font-medium">{notification.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{notification.trigger_event}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={notification.frequency === 'once' ? 'default' : 'secondary'}>
                          {notification.frequency}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={notification.enabled}
                            onCheckedChange={(checked) => toggleNotification(notification.id, checked)}
                          />
                          {notification.enabled ? (
                            <Bell className="h-4 w-4 text-green-500" />
                          ) : (
                            <BellOff className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {notification.delay_minutes ? (
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {notification.delay_minutes}m
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Immediate</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(notification.id, 'parent')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="child-notifications">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Child Notifications
                  </CardTitle>
                  <CardDescription>
                    Configure notifications and encouragements for children
                  </CardDescription>
                </div>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Notification
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Delay</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {childNotifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell className="font-medium">{notification.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{notification.trigger_event}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={notification.frequency === 'once' ? 'default' : 'secondary'}>
                          {notification.frequency}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={notification.enabled}
                            onCheckedChange={(checked) => toggleNotification(notification.id, checked)}
                          />
                          {notification.enabled ? (
                            <Bell className="h-4 w-4 text-green-500" />
                          ) : (
                            <BellOff className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {notification.delay_minutes ? (
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {notification.delay_minutes}m
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Immediate</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(notification.id, 'child')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add Notification Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Add {activeTab === "parent-notifications" ? "Parent" : "Child"} Notification
            </DialogTitle>
            <DialogDescription>
              Create a new notification trigger for {activeTab === "parent-notifications" ? "parents" : "children"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={notificationForm.name}
                onChange={(e) => setNotificationForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Daily Check-in Reminder"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="trigger_event">Trigger Event *</Label>
              <Select
                value={notificationForm.trigger_event}
                onValueChange={(value) => setNotificationForm(prev => ({ ...prev, trigger_event: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trigger event" />
                </SelectTrigger>
                <SelectContent>
                  {activeTab === "parent-notifications" ? (
                    <>
                      <SelectItem value="daily_checkin_missed">Daily Check-in Missed</SelectItem>
                      <SelectItem value="weekly_summary">Weekly Summary</SelectItem>
                      <SelectItem value="streak_milestone">Streak Milestone</SelectItem>
                      <SelectItem value="low_engagement">Low Engagement</SelectItem>
                      <SelectItem value="assessment_completed">Assessment Completed</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="morning_prompt">Morning Prompt</SelectItem>
                      <SelectItem value="evening_prompt">Evening Prompt</SelectItem>
                      <SelectItem value="low_mood_detected">Low Mood Detected</SelectItem>
                      <SelectItem value="achievement_unlocked">Achievement Unlocked</SelectItem>
                      <SelectItem value="friend_activity">Friend Activity</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Notification Title *</Label>
              <Input
                id="title"
                value={notificationForm.title}
                onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Title of the notification"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={notificationForm.message}
                onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Notification message (use {child_name} for personalization)"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={notificationForm.frequency}
                  onValueChange={(value: "once" | "daily" | "weekly") => 
                    setNotificationForm(prev => ({ ...prev, frequency: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Once</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="delay">Delay (minutes)</Label>
                <Input
                  id="delay"
                  type="number"
                  min="0"
                  value={notificationForm.delay_minutes}
                  onChange={(e) => setNotificationForm(prev => ({ 
                    ...prev, 
                    delay_minutes: parseInt(e.target.value) || 0 
                  }))}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="enabled"
                checked={notificationForm.enabled}
                onCheckedChange={(checked) => setNotificationForm(prev => ({ ...prev, enabled: checked }))}
              />
              <Label htmlFor="enabled">Enable notification</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNotification}>
              <Send className="h-4 w-4 mr-2" />
              Create Notification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Template Management Dialog */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Notification Templates</DialogTitle>
            <DialogDescription>
              Manage reusable notification templates
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Available Templates</h3>
              <Button 
                size="sm"
                onClick={() => {
                  // Add new template functionality
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Template
              </Button>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Variables</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notificationTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{template.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.map((variable, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {`{${variable}}`}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {template.message}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(template.id, 'template')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setTemplateDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationsManagement;
