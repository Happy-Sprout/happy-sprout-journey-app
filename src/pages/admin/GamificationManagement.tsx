
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertTriangle, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Trophy, 
  Target,
  Flame,
  Award,
  Zap,
  Crown,
  Medal
} from "lucide-react";
import { Link } from "react-router-dom";

type StreakRule = {
  id: string;
  name: string;
  description: string;
  target_days: number;
  activity_type: string;
  reward_xp: number;
  badge_id?: string;
  enabled: boolean;
  created_at: string;
};

type XPRule = {
  id: string;
  activity_name: string;
  activity_type: string;
  base_xp: number;
  bonus_multiplier: number;
  daily_limit?: number;
  enabled: boolean;
  created_at: string;
};

type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  unlock_condition: string;
  xp_reward: number;
  enabled: boolean;
  created_at: string;
};

const GamificationManagement = () => {
  const [activeTab, setActiveTab] = useState("streak-rules");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Mock data for gamification elements
  const [streakRules, setStreakRules] = useState<StreakRule[]>([
    {
      id: "1",
      name: "Daily Check-in Streak",
      description: "Complete daily emotional check-ins for consecutive days",
      target_days: 7,
      activity_type: "daily_checkin",
      reward_xp: 100,
      badge_id: "streak_master",
      enabled: true,
      created_at: new Date().toISOString()
    },
    {
      id: "2",
      name: "Journal Writing Streak",
      description: "Write in journal for consecutive days",
      target_days: 5,
      activity_type: "journal_entry",
      reward_xp: 150,
      badge_id: "storyteller",
      enabled: true,
      created_at: new Date().toISOString()
    },
    {
      id: "3",
      name: "SEL Assessment Streak",
      description: "Complete SEL assessments regularly",
      target_days: 3,
      activity_type: "sel_assessment",
      reward_xp: 200,
      enabled: true,
      created_at: new Date().toISOString()
    }
  ]);

  const [xpRules, setXpRules] = useState<XPRule[]>([
    {
      id: "1",
      activity_name: "Daily Check-in",
      activity_type: "daily_checkin",
      base_xp: 10,
      bonus_multiplier: 1.2,
      daily_limit: 15,
      enabled: true,
      created_at: new Date().toISOString()
    },
    {
      id: "2",
      activity_name: "Journal Entry",
      activity_type: "journal_entry",
      base_xp: 25,
      bonus_multiplier: 1.5,
      daily_limit: 50,
      enabled: true,
      created_at: new Date().toISOString()
    },
    {
      id: "3",
      activity_name: "SEL Assessment",
      activity_type: "sel_assessment",
      base_xp: 50,
      bonus_multiplier: 2.0,
      daily_limit: 100,
      enabled: true,
      created_at: new Date().toISOString()
    },
    {
      id: "4",
      activity_name: "Mindfulness Activity",
      activity_type: "mindfulness",
      base_xp: 20,
      bonus_multiplier: 1.3,
      daily_limit: 40,
      enabled: true,
      created_at: new Date().toISOString()
    }
  ]);

  const [badges, setBadges] = useState<Badge[]>([
    {
      id: "1",
      name: "First Steps",
      description: "Complete your first daily check-in",
      icon: "👶",
      category: "Getting Started",
      rarity: "Common",
      unlock_condition: "Complete 1 daily check-in",
      xp_reward: 25,
      enabled: true,
      created_at: new Date().toISOString()
    },
    {
      id: "2",
      name: "Streak Master",
      description: "Maintain a 7-day check-in streak",
      icon: "🔥",
      category: "Consistency",
      rarity: "Rare",
      unlock_condition: "7-day check-in streak",
      xp_reward: 100,
      enabled: true,
      created_at: new Date().toISOString()
    },
    {
      id: "3",
      name: "Emotion Explorer",
      description: "Complete 10 different mood entries",
      icon: "🎭",
      category: "Self-Awareness",
      rarity: "Epic",
      unlock_condition: "10 different mood types logged",
      xp_reward: 200,
      enabled: true,
      created_at: new Date().toISOString()
    },
    {
      id: "4",
      name: "SEL Champion",
      description: "Master all 5 SEL competencies",
      icon: "👑",
      category: "Achievement",
      rarity: "Legendary",
      unlock_condition: "Score 80%+ in all SEL areas",
      xp_reward: 500,
      enabled: true,
      created_at: new Date().toISOString()
    }
  ]);

  // Form states
  const [streakForm, setStreakForm] = useState({
    name: "",
    description: "",
    target_days: 1,
    activity_type: "",
    reward_xp: 0,
    enabled: true
  });

  const [xpForm, setXpForm] = useState({
    activity_name: "",
    activity_type: "",
    base_xp: 0,
    bonus_multiplier: 1.0,
    daily_limit: 0,
    enabled: true
  });

  const [badgeForm, setBadgeForm] = useState({
    name: "",
    description: "",
    icon: "",
    category: "",
    rarity: "Common" as "Common" | "Rare" | "Epic" | "Legendary",
    unlock_condition: "",
    xp_reward: 0,
    enabled: true
  });

  const { toast } = useToast();

  const handleAddStreakRule = () => {
    if (!streakForm.name.trim()) {
      toast({ title: "Error", description: "Name is required", variant: "destructive" });
      return;
    }
    
    const newRule: StreakRule = {
      id: Date.now().toString(),
      name: streakForm.name,
      description: streakForm.description,
      target_days: streakForm.target_days,
      activity_type: streakForm.activity_type,
      reward_xp: streakForm.reward_xp,
      enabled: streakForm.enabled,
      created_at: new Date().toISOString()
    };
    
    setStreakRules(prev => [newRule, ...prev]);
    setStreakForm({
      name: "",
      description: "",
      target_days: 1,
      activity_type: "",
      reward_xp: 0,
      enabled: true
    });
    setDialogOpen(false);
    
    toast({ title: "Success", description: "Streak rule created successfully" });
  };

  const handleAddXPRule = () => {
    if (!xpForm.activity_name.trim()) {
      toast({ title: "Error", description: "Activity name is required", variant: "destructive" });
      return;
    }
    
    const newRule: XPRule = {
      id: Date.now().toString(),
      activity_name: xpForm.activity_name,
      activity_type: xpForm.activity_type,
      base_xp: xpForm.base_xp,
      bonus_multiplier: xpForm.bonus_multiplier,
      daily_limit: xpForm.daily_limit || undefined,
      enabled: xpForm.enabled,
      created_at: new Date().toISOString()
    };
    
    setXpRules(prev => [newRule, ...prev]);
    setXpForm({
      activity_name: "",
      activity_type: "",
      base_xp: 0,
      bonus_multiplier: 1.0,
      daily_limit: 0,
      enabled: true
    });
    setDialogOpen(false);
    
    toast({ title: "Success", description: "XP rule created successfully" });
  };

  const handleAddBadge = () => {
    if (!badgeForm.name.trim()) {
      toast({ title: "Error", description: "Badge name is required", variant: "destructive" });
      return;
    }
    
    const newBadge: Badge = {
      id: Date.now().toString(),
      name: badgeForm.name,
      description: badgeForm.description,
      icon: badgeForm.icon || "🏆",
      category: badgeForm.category,
      rarity: badgeForm.rarity,
      unlock_condition: badgeForm.unlock_condition,
      xp_reward: badgeForm.xp_reward,
      enabled: badgeForm.enabled,
      created_at: new Date().toISOString()
    };
    
    setBadges(prev => [newBadge, ...prev]);
    setBadgeForm({
      name: "",
      description: "",
      icon: "",
      category: "",
      rarity: "Common",
      unlock_condition: "",
      xp_reward: 0,
      enabled: true
    });
    setDialogOpen(false);
    
    toast({ title: "Success", description: "Badge created successfully" });
  };

  const handleDelete = (id: string, type: string) => {
    switch (type) {
      case 'streak':
        setStreakRules(prev => prev.filter(r => r.id !== id));
        break;
      case 'xp':
        setXpRules(prev => prev.filter(r => r.id !== id));
        break;
      case 'badge':
        setBadges(prev => prev.filter(b => b.id !== id));
        break;
    }
    toast({ title: "Success", description: "Item deleted successfully" });
  };

  const toggleEnabled = (id: string, enabled: boolean, type: string) => {
    switch (type) {
      case 'streak':
        setStreakRules(prev => prev.map(r => r.id === id ? { ...r, enabled } : r));
        break;
      case 'xp':
        setXpRules(prev => prev.map(r => r.id === id ? { ...r, enabled } : r));
        break;
      case 'badge':
        setBadges(prev => prev.map(b => b.id === id ? { ...b, enabled } : b));
        break;
    }
    toast({ title: "Updated", description: `Item ${enabled ? 'enabled' : 'disabled'}` });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'bg-gray-100 text-gray-800';
      case 'Rare': return 'bg-blue-100 text-blue-800';
      case 'Epic': return 'bg-purple-100 text-purple-800';
      case 'Legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gamification Management</h1>
          <p className="text-muted-foreground">
            Configure streak rules, XP allocation, and badges to motivate children
          </p>
        </div>
        
        <Link to="/admin/streak-correction">
          <Button variant="outline" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Streak Correction Utility
          </Button>
        </Link>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Streak Rules
            </CardTitle>
            <Flame className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streakRules.length}</div>
            <p className="text-xs text-muted-foreground">
              {streakRules.filter(r => r.enabled).length} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              XP Rules
            </CardTitle>
            <Zap className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{xpRules.length}</div>
            <p className="text-xs text-muted-foreground">
              {xpRules.filter(r => r.enabled).length} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Badges
            </CardTitle>
            <Award className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{badges.length}</div>
            <p className="text-xs text-muted-foreground">
              {badges.filter(b => b.enabled).length} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total XP Pool
            </CardTitle>
            <Target className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {xpRules.filter(r => r.enabled).reduce((sum, r) => sum + (r.daily_limit || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">Daily XP limit</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="streak-rules">Streak Rules</TabsTrigger>
          <TabsTrigger value="xp-allocation">XP Allocation</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
        </TabsList>
        
        <TabsContent value="streak-rules">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="h-5 w-5" />
                    Streak Rules
                  </CardTitle>
                  <CardDescription>
                    Configure streak rules to encourage consistent engagement
                  </CardDescription>
                </div>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Streak Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Activity Type</TableHead>
                    <TableHead>Target Days</TableHead>
                    <TableHead>Reward XP</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {streakRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{rule.activity_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          <Flame className="h-4 w-4 text-orange-500" />
                          {rule.target_days} days
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          {rule.reward_xp} XP
                        </span>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={(checked) => toggleEnabled(rule.id, checked, 'streak')}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(rule.id, 'streak')}
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
        
        <TabsContent value="xp-allocation">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    XP Allocation
                  </CardTitle>
                  <CardDescription>
                    Configure XP points allocation for different activities
                  </CardDescription>
                </div>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add XP Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity</TableHead>
                    <TableHead>Base XP</TableHead>
                    <TableHead>Bonus Multiplier</TableHead>
                    <TableHead>Daily Limit</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {xpRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.activity_name}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          {rule.base_xp} XP
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">×{rule.bonus_multiplier}</Badge>
                      </TableCell>
                      <TableCell>
                        {rule.daily_limit ? (
                          <span className="text-sm">{rule.daily_limit} XP</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">No limit</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={(checked) => toggleEnabled(rule.id, checked, 'xp')}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(rule.id, 'xp')}
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
        
        <TabsContent value="badges">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Badges & Achievements
                  </CardTitle>
                  <CardDescription>
                    Configure badges and achievements to celebrate milestones
                  </CardDescription>
                </div>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Badge
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Badge</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Rarity</TableHead>
                    <TableHead>XP Reward</TableHead>
                    <TableHead>Unlock Condition</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {badges.map((badge) => (
                    <TableRow key={badge.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{badge.icon}</span>
                          <div>
                            <div className="font-medium">{badge.name}</div>
                            <div className="text-sm text-muted-foreground">{badge.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{badge.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRarityColor(badge.rarity)}>
                          {badge.rarity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          {badge.xp_reward} XP
                        </span>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {badge.unlock_condition}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={badge.enabled}
                          onCheckedChange={(checked) => toggleEnabled(badge.id, checked, 'badge')}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(badge.id, 'badge')}
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
      
      {/* Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Add {activeTab === "streak-rules" ? "Streak Rule" : 
                   activeTab === "xp-allocation" ? "XP Rule" : "Badge"}
            </DialogTitle>
            <DialogDescription>
              Create a new {activeTab === "streak-rules" ? "streak rule" : 
                           activeTab === "xp-allocation" ? "XP allocation rule" : "badge"} 
              for the gamification system
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {activeTab === "streak-rules" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="streak_name">Name *</Label>
                  <Input
                    id="streak_name"
                    value={streakForm.name}
                    onChange={(e) => setStreakForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Daily Check-in Streak"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="streak_description">Description</Label>
                  <Textarea
                    id="streak_description"
                    value={streakForm.description}
                    onChange={(e) => setStreakForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this streak tracks..."
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="target_days">Target Days</Label>
                    <Input
                      id="target_days"
                      type="number"
                      min="1"
                      value={streakForm.target_days}
                      onChange={(e) => setStreakForm(prev => ({ 
                        ...prev, 
                        target_days: parseInt(e.target.value) || 1 
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reward_xp">Reward XP</Label>
                    <Input
                      id="reward_xp"
                      type="number"
                      min="0"
                      value={streakForm.reward_xp}
                      onChange={(e) => setStreakForm(prev => ({ 
                        ...prev, 
                        reward_xp: parseInt(e.target.value) || 0 
                      }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="activity_type">Activity Type</Label>
                  <Input
                    id="activity_type"
                    value={streakForm.activity_type}
                    onChange={(e) => setStreakForm(prev => ({ ...prev, activity_type: e.target.value }))}
                    placeholder="e.g., daily_checkin, journal_entry"
                  />
                </div>
              </>
            )}
            
            {activeTab === "xp-allocation" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="activity_name">Activity Name *</Label>
                  <Input
                    id="activity_name"
                    value={xpForm.activity_name}
                    onChange={(e) => setXpForm(prev => ({ ...prev, activity_name: e.target.value }))}
                    placeholder="e.g., Daily Check-in"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="xp_activity_type">Activity Type</Label>
                  <Input
                    id="xp_activity_type"
                    value={xpForm.activity_type}
                    onChange={(e) => setXpForm(prev => ({ ...prev, activity_type: e.target.value }))}
                    placeholder="e.g., daily_checkin"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="base_xp">Base XP</Label>
                    <Input
                      id="base_xp"
                      type="number"
                      min="0"
                      value={xpForm.base_xp}
                      onChange={(e) => setXpForm(prev => ({ 
                        ...prev, 
                        base_xp: parseInt(e.target.value) || 0 
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bonus_multiplier">Bonus Multiplier</Label>
                    <Input
                      id="bonus_multiplier"
                      type="number"
                      step="0.1"
                      min="1.0"
                      value={xpForm.bonus_multiplier}
                      onChange={(e) => setXpForm(prev => ({ 
                        ...prev, 
                        bonus_multiplier: parseFloat(e.target.value) || 1.0 
                      }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="daily_limit">Daily XP Limit (optional)</Label>
                  <Input
                    id="daily_limit"
                    type="number"
                    min="0"
                    value={xpForm.daily_limit}
                    onChange={(e) => setXpForm(prev => ({ 
                      ...prev, 
                      daily_limit: parseInt(e.target.value) || 0 
                    }))}
                    placeholder="0 = no limit"
                  />
                </div>
              </>
            )}
            
            {activeTab === "badges" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="badge_name">Badge Name *</Label>
                  <Input
                    id="badge_name"
                    value={badgeForm.name}
                    onChange={(e) => setBadgeForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., First Steps"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="badge_description">Description</Label>
                  <Textarea
                    id="badge_description"
                    value={badgeForm.description}
                    onChange={(e) => setBadgeForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this badge represents..."
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="badge_icon">Icon (Emoji)</Label>
                    <Input
                      id="badge_icon"
                      value={badgeForm.icon}
                      onChange={(e) => setBadgeForm(prev => ({ ...prev, icon: e.target.value }))}
                      placeholder="🏆"
                      maxLength={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="badge_category">Category</Label>
                    <Input
                      id="badge_category"
                      value={badgeForm.category}
                      onChange={(e) => setBadgeForm(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g., Achievement"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rarity">Rarity</Label>
                    <select
                      id="rarity"
                      value={badgeForm.rarity}
                      onChange={(e) => setBadgeForm(prev => ({ 
                        ...prev, 
                        rarity: e.target.value as "Common" | "Rare" | "Epic" | "Legendary" 
                      }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="Common">Common</option>
                      <option value="Rare">Rare</option>
                      <option value="Epic">Epic</option>
                      <option value="Legendary">Legendary</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="xp_reward">XP Reward</Label>
                    <Input
                      id="xp_reward"
                      type="number"
                      min="0"
                      value={badgeForm.xp_reward}
                      onChange={(e) => setBadgeForm(prev => ({ 
                        ...prev, 
                        xp_reward: parseInt(e.target.value) || 0 
                      }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unlock_condition">Unlock Condition</Label>
                  <Input
                    id="unlock_condition"
                    value={badgeForm.unlock_condition}
                    onChange={(e) => setBadgeForm(prev => ({ ...prev, unlock_condition: e.target.value }))}
                    placeholder="e.g., Complete 5 journal entries"
                  />
                </div>
              </>
            )}
            
            <div className="flex items-center space-x-2">
              <Switch
                id="enabled"
                checked={activeTab === "streak-rules" ? streakForm.enabled : 
                         activeTab === "xp-allocation" ? xpForm.enabled : badgeForm.enabled}
                onCheckedChange={(checked) => {
                  if (activeTab === "streak-rules") {
                    setStreakForm(prev => ({ ...prev, enabled: checked }));
                  } else if (activeTab === "xp-allocation") {
                    setXpForm(prev => ({ ...prev, enabled: checked }));
                  } else {
                    setBadgeForm(prev => ({ ...prev, enabled: checked }));
                  }
                }}
              />
              <Label htmlFor="enabled">Enable immediately</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (activeTab === "streak-rules") handleAddStreakRule();
              else if (activeTab === "xp-allocation") handleAddXPRule();
              else handleAddBadge();
            }}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GamificationManagement;
