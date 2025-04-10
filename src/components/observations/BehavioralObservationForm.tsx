
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import MultipleCheckboxGroup from "@/components/MultipleCheckboxGroup";
import EmotionTrackingSlider from "@/components/EmotionTrackingSlider";

const behaviorFrequencyOptions = [
  { value: "rare", label: "Rare", description: "Observed once or twice" },
  { value: "occasional", label: "Occasional", description: "Observed a few times" },
  { value: "frequent", label: "Frequent", description: "Observed regularly" },
  { value: "consistent", label: "Consistent", description: "Observed almost all the time" },
];

const behaviorContextOptions = [
  { value: "classroom", label: "Classroom", description: "During structured learning activities" },
  { value: "playground", label: "Playground/Recess", description: "During free play or recess" },
  { value: "social", label: "Social Interactions", description: "During interactions with peers" },
  { value: "transition", label: "Transitions", description: "Moving between activities or locations" },
  { value: "home", label: "Home Environment", description: "Behaviors observed at home" },
];

const behaviorCategorySchema = z.object({
  name: z.string(),
  date: z.string(),
  childName: z.string(),
  observerRole: z.string(),
  behaviorType: z.string(),
  behaviorDescription: z.string().min(10, "Please provide a detailed description"),
  frequency: z.array(z.string()).min(1, "Please select at least one frequency"),
  context: z.array(z.string()).min(1, "Please select at least one context"),
  impulseControl: z.number().min(1).max(10),
  attention: z.number().min(1).max(10),
  empathy: z.number().min(1).max(10),
  emotionalRegulation: z.number().min(1).max(10),
  notes: z.string().optional(),
});

type BehaviorCategoryFormValues = z.infer<typeof behaviorCategorySchema>;

const BehavioralObservationForm = () => {
  const { toast } = useToast();
  const [impulseControl, setImpulseControl] = useState(5);
  const [attention, setAttention] = useState(5);
  const [empathy, setEmpathy] = useState(5);
  const [emotionalRegulation, setEmotionalRegulation] = useState(5);
  const [frequency, setFrequency] = useState<string[]>([]);
  const [context, setContext] = useState<string[]>([]);
  
  const form = useForm<BehaviorCategoryFormValues>({
    resolver: zodResolver(behaviorCategorySchema),
    defaultValues: {
      name: "",
      date: new Date().toISOString().split('T')[0],
      childName: "",
      observerRole: "teacher",
      behaviorType: "positive",
      behaviorDescription: "",
      frequency: [],
      context: [],
      impulseControl: 5,
      attention: 5,
      empathy: 5,
      emotionalRegulation: 5,
      notes: ""
    },
  });

  const handleFrequencyToggle = (value: string) => {
    setFrequency(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value) 
        : [...prev, value]
    );
    form.setValue("frequency", 
      frequency.includes(value) 
        ? frequency.filter(item => item !== value) 
        : [...frequency, value],
      { shouldValidate: true }
    );
  };

  const handleContextToggle = (value: string) => {
    setContext(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value) 
        : [...prev, value]
    );
    form.setValue("context", 
      context.includes(value) 
        ? context.filter(item => item !== value) 
        : [...context, value],
      { shouldValidate: true }
    );
  };

  const onSubmit = async (values: BehaviorCategoryFormValues) => {
    try {
      // Here you would save the data to your backend
      console.log("Form values:", values);
      
      // Simulate a success response
      toast({
        title: "Observation saved",
        description: "Your behavioral observation has been recorded successfully.",
      });
      
      // Reset form
      form.reset();
      setFrequency([]);
      setContext([]);
      setImpulseControl(5);
      setAttention(5);
      setEmpathy(5);
      setEmotionalRegulation(5);
    } catch (error) {
      console.error("Error saving observation:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your observation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Behavioral Observation</CardTitle>
        <CardDescription>
          Record and track student behaviors and SEL competencies
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-left block">Observer Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-left block">Observation Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="childName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-left block">Child Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Child's name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="observerRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-left block">Your Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="counselor">Counselor</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="behaviorType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-left block">Behavior Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select behavior type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="positive">Positive Behavior</SelectItem>
                      <SelectItem value="challenging">Challenging Behavior</SelectItem>
                      <SelectItem value="neutral">Neutral Observation</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="behaviorDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-left block">Behavior Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the observed behavior in detail..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <MultipleCheckboxGroup
                label="Frequency"
                options={behaviorFrequencyOptions}
                selectedValues={frequency}
                onChange={handleFrequencyToggle}
                required
              />
              
              <MultipleCheckboxGroup
                label="Context"
                options={behaviorContextOptions}
                selectedValues={context}
                onChange={handleContextToggle}
                required
              />
            </div>
            
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="impulseControl"
                render={({ field }) => (
                  <FormItem>
                    <EmotionTrackingSlider 
                      label="Impulse Control" 
                      value={impulseControl} 
                      onChange={(value) => {
                        setImpulseControl(value);
                        field.onChange(value);
                      }}
                      leftLabel="Needs Support"
                      rightLabel="Very Strong"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="attention"
                render={({ field }) => (
                  <FormItem>
                    <EmotionTrackingSlider 
                      label="Attention/Focus" 
                      value={attention} 
                      onChange={(value) => {
                        setAttention(value);
                        field.onChange(value);
                      }}
                      leftLabel="Easily Distracted"
                      rightLabel="Highly Focused"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="empathy"
                render={({ field }) => (
                  <FormItem>
                    <EmotionTrackingSlider 
                      label="Empathy" 
                      value={empathy} 
                      onChange={(value) => {
                        setEmpathy(value);
                        field.onChange(value);
                      }}
                      leftLabel="Limited"
                      rightLabel="Very Empathetic"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="emotionalRegulation"
                render={({ field }) => (
                  <FormItem>
                    <EmotionTrackingSlider 
                      label="Emotional Regulation" 
                      value={emotionalRegulation} 
                      onChange={(value) => {
                        setEmotionalRegulation(value);
                        field.onChange(value);
                      }}
                      leftLabel="Reactive"
                      rightLabel="Well-Regulated"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-left block">Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional observations or context..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Button type="submit">Save Observation</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default BehavioralObservationForm;
