
import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Save, Shield, Bell, Mail, Lock, Server, Database } from "lucide-react";

const generalFormSchema = z.object({
  siteName: z.string().min(2, {
    message: "Site name must be at least 2 characters.",
  }),
  supportEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

const securityFormSchema = z.object({
  enableTwoFactor: z.boolean().default(false),
  passwordResetTimeout: z.number().min(1).max(72),
  maxLoginAttempts: z.number().min(1).max(10),
});

const notificationFormSchema = z.object({
  enableEmailNotifications: z.boolean().default(true),
  enableFlaggedContentAlerts: z.boolean().default(true),
  alertsThreshold: z.number().min(1).max(10),
});

type GeneralFormValues = z.infer<typeof generalFormSchema>;
type SecurityFormValues = z.infer<typeof securityFormSchema>;
type NotificationFormValues = z.infer<typeof notificationFormSchema>;

const SettingsManagement = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const generalForm = useForm<GeneralFormValues>({
    resolver: zodResolver(generalFormSchema),
    defaultValues: {
      siteName: "Happy Sprout",
      supportEmail: "support@happysprout.com",
    },
  });

  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      enableTwoFactor: false,
      passwordResetTimeout: 24,
      maxLoginAttempts: 5,
    },
  });

  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      enableEmailNotifications: true,
      enableFlaggedContentAlerts: true,
      alertsThreshold: 3,
    },
  });

  const onGeneralSubmit = async (data: GeneralFormValues) => {
    setIsLoading(true);
    try {
      // In a real application, this would save to the database
      console.log("General settings submitted:", data);
      const { error } = await supabase
        .from('app_settings')
        .upsert([
          {
            category: 'general',
            settings: data
          }
        ]);
      
      if (error) throw error;
      
      toast({
        title: "Settings Saved",
        description: "General settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSecuritySubmit = async (data: SecurityFormValues) => {
    setIsLoading(true);
    try {
      console.log("Security settings submitted:", data);
      const { error } = await supabase
        .from('app_settings')
        .upsert([
          {
            category: 'security',
            settings: data
          }
        ]);
      
      if (error) throw error;
      
      toast({
        title: "Settings Saved",
        description: "Security settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onNotificationSubmit = async (data: NotificationFormValues) => {
    setIsLoading(true);
    try {
      console.log("Notification settings submitted:", data);
      const { error } = await supabase
        .from('app_settings')
        .upsert([
          {
            category: 'notification',
            settings: data
          }
        ]);
      
      if (error) throw error;
      
      toast({
        title: "Settings Saved",
        description: "Notification settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage application settings and configurations
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Database
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Manage basic application settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...generalForm}>
                  <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)} className="space-y-6">
                    <FormField
                      control={generalForm.control}
                      name="siteName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Site Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            This is the name displayed in the browser tab and emails.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={generalForm.control}
                      name="supportEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Support Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormDescription>
                            Email address for user support inquiries.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Save Changes
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure application security options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...securityForm}>
                  <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                    <FormField
                      control={securityForm.control}
                      name="enableTwoFactor"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Two-Factor Authentication</FormLabel>
                            <FormDescription>
                              Require users to provide a second form of identification when logging in.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={securityForm.control}
                      name="passwordResetTimeout"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password Reset Timeout (hours)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={1} 
                              max={72} 
                              {...field} 
                              onChange={e => field.onChange(parseInt(e.target.value) || 24)} 
                            />
                          </FormControl>
                          <FormDescription>
                            How long a password reset link remains valid.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={securityForm.control}
                      name="maxLoginAttempts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Login Attempts</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={1} 
                              max={10} 
                              {...field} 
                              onChange={e => field.onChange(parseInt(e.target.value) || 5)} 
                            />
                          </FormControl>
                          <FormDescription>
                            Maximum number of failed login attempts before account is locked.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Save Security Settings
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how notifications are sent to users and administrators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...notificationForm}>
                  <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                    <FormField
                      control={notificationForm.control}
                      name="enableEmailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Email Notifications</FormLabel>
                            <FormDescription>
                              Send notifications to users via email.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={notificationForm.control}
                      name="enableFlaggedContentAlerts"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Flagged Content Alerts</FormLabel>
                            <FormDescription>
                              Notify administrators when content is flagged by the system.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={notificationForm.control}
                      name="alertsThreshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alerts Threshold</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={1} 
                              max={10} 
                              {...field} 
                              onChange={e => field.onChange(parseInt(e.target.value) || 3)} 
                            />
                          </FormControl>
                          <FormDescription>
                            Minimum severity level to trigger admin alerts (1-10).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Save Notification Settings
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Settings */}
          <TabsContent value="database">
            <Card>
              <CardHeader>
                <CardTitle>Database Configuration</CardTitle>
                <CardDescription>
                  View database status and perform maintenance tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Database Status</Label>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span>Connected</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Database Information</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Provider:</p>
                      <p>Supabase Postgres</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Version:</p>
                      <p>15.1.0</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Region:</p>
                      <p>us-east-1</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Last Backup:</p>
                      <p>April 10, 2025 02:30 AM</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label>Maintenance Options</Label>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline">Create Backup</Button>
                    <Button variant="outline">Optimize Database</Button>
                    <Button variant="outline">Check Integrity</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default SettingsManagement;
