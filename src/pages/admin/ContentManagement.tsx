
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Search,
  BookOpen,
  Users,
  Quote
} from "lucide-react";

type DailyQuestion = {
  id: string;
  question: string;
  category: string;
  age_group: string;
  created_at: string;
};

type RoleplayScenario = {
  id: string;
  title: string;
  description: string;
  situation: string;
  target_skills: string[];
  age_group: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  created_at: string;
};

type MotivationalQuote = {
  id: string;
  quote: string;
  author: string;
  category: string;
  age_appropriate: boolean;
  created_at: string;
};

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState("daily-questions");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Daily Questions State
  const [dailyQuestions, setDailyQuestions] = useState<DailyQuestion[]>([
    {
      id: "1",
      question: "How did you handle a challenging situation today?",
      category: "Self-Management",
      age_group: "8-12",
      created_at: new Date().toISOString()
    },
    {
      id: "2", 
      question: "What made you feel grateful today?",
      category: "Self-Awareness",
      age_group: "6-10",
      created_at: new Date().toISOString()
    },
    {
      id: "3",
      question: "How did you help someone today?",
      category: "Social Awareness",
      age_group: "7-12",
      created_at: new Date().toISOString()
    }
  ]);
  
  // Roleplay Scenarios State
  const [roleplayScenarios, setRoleplayScenarios] = useState<RoleplayScenario[]>([
    {
      id: "1",
      title: "Playground Conflict Resolution",
      description: "Learning to resolve disagreements with friends",
      situation: "Two friends want to play different games during recess",
      target_skills: ["Compromise", "Communication", "Empathy"],
      age_group: "6-9",
      difficulty: "Easy",
      created_at: new Date().toISOString()
    },
    {
      id: "2",
      title: "Classroom Team Project",
      description: "Working effectively in a group setting",
      situation: "Group members have different ideas for a school project",
      target_skills: ["Collaboration", "Leadership", "Problem-solving"],
      age_group: "9-12",
      difficulty: "Medium",
      created_at: new Date().toISOString()
    }
  ]);
  
  // Motivational Quotes State
  const [motivationalQuotes, setMotivationalQuotes] = useState<MotivationalQuote[]>([
    {
      id: "1",
      quote: "You are braver than you believe, stronger than you seem, and smarter than you think.",
      author: "A.A. Milne",
      category: "Self-Confidence",
      age_appropriate: true,
      created_at: new Date().toISOString()
    },
    {
      id: "2",
      quote: "Kindness is a language which the deaf can hear and the blind can see.",
      author: "Mark Twain", 
      category: "Kindness",
      age_appropriate: true,
      created_at: new Date().toISOString()
    },
    {
      id: "3",
      quote: "The only way to do great work is to love what you do.",
      author: "Steve Jobs",
      category: "Motivation",
      age_appropriate: true,
      created_at: new Date().toISOString()
    }
  ]);

  // Dialog States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Form States
  const [questionForm, setQuestionForm] = useState({ question: "", category: "", age_group: "" });
  const [scenarioForm, setScenarioForm] = useState({ 
    title: "", description: "", situation: "", target_skills: "", age_group: "", difficulty: "Easy" as const
  });
  const [quoteForm, setQuoteForm] = useState({ quote: "", author: "", category: "", age_appropriate: true });

  const { toast } = useToast();

  const handleAddQuestion = () => {
    if (!questionForm.question.trim()) {
      toast({ title: "Error", description: "Question is required", variant: "destructive" });
      return;
    }
    
    const newQuestion: DailyQuestion = {
      id: Date.now().toString(),
      question: questionForm.question,
      category: questionForm.category || "General",
      age_group: questionForm.age_group || "All Ages",
      created_at: new Date().toISOString()
    };
    
    setDailyQuestions(prev => [newQuestion, ...prev]);
    setQuestionForm({ question: "", category: "", age_group: "" });
    setDialogOpen(false);
    
    toast({ title: "Success", description: "Daily question added successfully" });
  };

  const handleAddScenario = () => {
    if (!scenarioForm.title.trim()) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" });
      return;
    }
    
    const newScenario: RoleplayScenario = {
      id: Date.now().toString(),
      title: scenarioForm.title,
      description: scenarioForm.description,
      situation: scenarioForm.situation,
      target_skills: scenarioForm.target_skills.split(',').map(s => s.trim()).filter(s => s),
      age_group: scenarioForm.age_group || "All Ages",
      difficulty: scenarioForm.difficulty,
      created_at: new Date().toISOString()
    };
    
    setRoleplayScenarios(prev => [newScenario, ...prev]);
    setScenarioForm({ title: "", description: "", situation: "", target_skills: "", age_group: "", difficulty: "Easy" });
    setDialogOpen(false);
    
    toast({ title: "Success", description: "Role-play scenario added successfully" });
  };

  const handleAddQuote = () => {
    if (!quoteForm.quote.trim()) {
      toast({ title: "Error", description: "Quote is required", variant: "destructive" });
      return;
    }
    
    const newQuote: MotivationalQuote = {
      id: Date.now().toString(),
      quote: quoteForm.quote,
      author: quoteForm.author || "Unknown",
      category: quoteForm.category || "General",
      age_appropriate: quoteForm.age_appropriate,
      created_at: new Date().toISOString()
    };
    
    setMotivationalQuotes(prev => [newQuote, ...prev]);
    setQuoteForm({ quote: "", author: "", category: "", age_appropriate: true });
    setDialogOpen(false);
    
    toast({ title: "Success", description: "Motivational quote added successfully" });
  };

  const handleDelete = (id: string, type: string) => {
    switch (type) {
      case 'question':
        setDailyQuestions(prev => prev.filter(q => q.id !== id));
        break;
      case 'scenario':
        setRoleplayScenarios(prev => prev.filter(s => s.id !== id));
        break;
      case 'quote':
        setMotivationalQuotes(prev => prev.filter(q => q.id !== id));
        break;
    }
    toast({ title: "Success", description: "Item deleted successfully" });
  };

  const openAddDialog = (type: string) => {
    setEditMode(false);
    setSelectedItem(null);
    setDialogOpen(true);
  };

  const filteredQuestions = dailyQuestions.filter(q => 
    q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredScenarios = roleplayScenarios.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredQuotes = motivationalQuotes.filter(q => 
    q.quote.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-muted-foreground">
            Manage daily questions, role-play scenarios, and motivational quotes
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              className="pl-10 w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Daily Questions
            </CardTitle>
            <BookOpen className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyQuestions.length}</div>
            <p className="text-xs text-muted-foreground">Active questions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Role-play Scenarios
            </CardTitle>
            <Users className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roleplayScenarios.length}</div>
            <p className="text-xs text-muted-foreground">Available scenarios</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Motivational Quotes
            </CardTitle>
            <Quote className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{motivationalQuotes.length}</div>
            <p className="text-xs text-muted-foreground">Inspirational quotes</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="daily-questions">Daily Questions</TabsTrigger>
          <TabsTrigger value="roleplay">Role-play Scenarios</TabsTrigger>
          <TabsTrigger value="quotes">Motivational Quotes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily-questions">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Daily Questions</CardTitle>
                  <CardDescription>
                    Manage questions for daily check-ins and reflections
                  </CardDescription>
                </div>
                <Button onClick={() => openAddDialog('question')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Age Group</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuestions.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell className="font-medium max-w-xs">
                        {question.question}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{question.category}</Badge>
                      </TableCell>
                      <TableCell>{question.age_group}</TableCell>
                      <TableCell>
                        {new Date(question.created_at).toLocaleDateString()}
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
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(question.id, 'question')}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="roleplay">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Role-play Scenarios</CardTitle>
                  <CardDescription>
                    Manage role-play scenarios for social skills development
                  </CardDescription>
                </div>
                <Button onClick={() => openAddDialog('scenario')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Scenario
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Skills</TableHead>
                    <TableHead>Age Group</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredScenarios.map((scenario) => (
                    <TableRow key={scenario.id}>
                      <TableCell className="font-medium">{scenario.title}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {scenario.target_skills.slice(0, 2).map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {scenario.target_skills.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{scenario.target_skills.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{scenario.age_group}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={scenario.difficulty === 'Easy' ? 'default' : 
                                   scenario.difficulty === 'Medium' ? 'secondary' : 'destructive'}
                        >
                          {scenario.difficulty}
                        </Badge>
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
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(scenario.id, 'scenario')}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="quotes">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Motivational Quotes</CardTitle>
                  <CardDescription>
                    Manage the collection of motivational quotes for children
                  </CardDescription>
                </div>
                <Button onClick={() => openAddDialog('quote')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Quote
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quote</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Age Appropriate</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-medium max-w-md">
                        "{quote.quote}"
                      </TableCell>
                      <TableCell>{quote.author}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{quote.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={quote.age_appropriate ? "default" : "secondary"}>
                          {quote.age_appropriate ? "Yes" : "No"}
                        </Badge>
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
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(quote.id, 'quote')}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Edit" : "Add"} {
                activeTab === "daily-questions" ? "Daily Question" :
                activeTab === "roleplay" ? "Role-play Scenario" :
                "Motivational Quote"
              }
            </DialogTitle>
            <DialogDescription>
              {activeTab === "daily-questions" && "Create a thoughtful question for daily check-ins"}
              {activeTab === "roleplay" && "Design a scenario to help children practice social skills"}
              {activeTab === "quotes" && "Add an inspiring quote for children"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {activeTab === "daily-questions" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="question">Question *</Label>
                  <Textarea
                    id="question"
                    value={questionForm.question}
                    onChange={(e) => setQuestionForm(prev => ({ ...prev, question: e.target.value }))}
                    placeholder="Enter the daily question..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={questionForm.category}
                      onChange={(e) => setQuestionForm(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g., Self-Awareness"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age_group">Age Group</Label>
                    <Input
                      id="age_group"
                      value={questionForm.age_group}
                      onChange={(e) => setQuestionForm(prev => ({ ...prev, age_group: e.target.value }))}
                      placeholder="e.g., 6-10"
                    />
                  </div>
                </div>
              </>
            )}
            
            {activeTab === "roleplay" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={scenarioForm.title}
                    onChange={(e) => setScenarioForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter scenario title..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={scenarioForm.description}
                    onChange={(e) => setScenarioForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the scenario..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="situation">Situation</Label>
                  <Textarea
                    id="situation"
                    value={scenarioForm.situation}
                    onChange={(e) => setScenarioForm(prev => ({ ...prev, situation: e.target.value }))}
                    placeholder="Describe the scenario situation..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_skills">Target Skills (comma-separated)</Label>
                  <Input
                    id="target_skills"
                    value={scenarioForm.target_skills}
                    onChange={(e) => setScenarioForm(prev => ({ ...prev, target_skills: e.target.value }))}
                    placeholder="e.g., Empathy, Communication, Problem-solving"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scenario_age_group">Age Group</Label>
                    <Input
                      id="scenario_age_group"
                      value={scenarioForm.age_group}
                      onChange={(e) => setScenarioForm(prev => ({ ...prev, age_group: e.target.value }))}
                      placeholder="e.g., 8-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <select
                      id="difficulty"
                      value={scenarioForm.difficulty}
                      onChange={(e) => setScenarioForm(prev => ({ ...prev, difficulty: e.target.value as 'Easy' | 'Medium' | 'Hard' }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>
              </>
            )}
            
            {activeTab === "quotes" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="quote">Quote *</Label>
                  <Textarea
                    id="quote"
                    value={quoteForm.quote}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, quote: e.target.value }))}
                    placeholder="Enter the motivational quote..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      value={quoteForm.author}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, author: e.target.value }))}
                      placeholder="Quote author"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quote_category">Category</Label>
                    <Input
                      id="quote_category"
                      value={quoteForm.category}
                      onChange={(e) => setQuoteForm(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g., Motivation"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="age_appropriate"
                    checked={quoteForm.age_appropriate}
                    onChange={(e) => setQuoteForm(prev => ({ ...prev, age_appropriate: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="age_appropriate">Age appropriate for children</Label>
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              if (activeTab === "daily-questions") handleAddQuestion();
              else if (activeTab === "roleplay") handleAddScenario();
              else handleAddQuote();
            }}>
              {editMode ? "Save Changes" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentManagement;
