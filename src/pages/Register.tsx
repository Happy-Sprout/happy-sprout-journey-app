import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangleIcon } from "lucide-react";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUpWithEmail } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }
    
    if (!acceptTerms || !acceptPrivacy) {
      toast({
        title: "Terms not accepted",
        description: "You must accept the Terms & Conditions and Privacy Policy",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signUpWithEmail(email, password, name);
      
      toast({
        title: "Account created",
        description: "Your account was created successfully. Please log in now.",
      });
      
      navigate("/login");
    } catch (error: any) {
      console.error("Signup error:", error);
      
      if (error.message) {
        if (error.message.includes("already registered")) {
          setError("This email is already registered. Please log in instead.");
          setTimeout(() => navigate("/login"), 3000);
        } else {
          setError(error.message || "Could not create your account. Please try again.");
        }
      } else {
        setError("Could not create your account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout hideNav>
      <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/">
              <img 
                src="/lovable-uploads/c1e8ccec-8b46-4a25-853f-255a861762d1.png" 
                alt="Happy Sprout" 
                className="w-24 h-24 mx-auto mb-4"
              />
            </Link>
            <h1 className="text-3xl font-bold">Create Account</h1>
            <p className="text-gray-600 mt-2">Join Happy Sprout to start your child's emotional growth journey</p>
          </div>
          
          {error && (
            <Alert className="mb-6 bg-red-50 border-red-200">
              <AlertTriangleIcon className="h-4 w-4 text-red-500" />
              <AlertTitle>Registration issue</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-left block">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-left block">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="parent@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-left block">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-left block">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={acceptTerms} 
                    onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                    required
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label 
                      htmlFor="terms" 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I accept the Terms & Conditions
                    </label>
                    <p className="text-xs text-gray-500">
                      This includes consent for your child to use the application.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="privacy" 
                    checked={acceptPrivacy} 
                    onCheckedChange={(checked) => setAcceptPrivacy(checked as boolean)}
                    required
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label 
                      htmlFor="privacy" 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      I accept the Privacy Policy
                    </label>
                    <p className="text-xs text-gray-500">
                      Your data and your child's data will be handled according to our privacy policy.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button
                type="submit"
                className="w-full bg-sprout-purple hover:bg-sprout-purple/90 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-sprout-purple font-medium hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
