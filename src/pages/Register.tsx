
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
import { AlertTriangleIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUpWithEmail } = useAuth();

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate email format
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address (e.g., name@example.com)");
      return;
    }
    
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
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4 text-gray-500" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-left block">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon className="h-4 w-4 text-gray-500" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
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
                      I accept the{" "}
                      <button
                        type="button"
                        className="text-sprout-purple hover:underline"
                        onClick={() => setShowTermsDialog(true)}
                      >
                        Terms & Conditions
                      </button>
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
                      I accept the{" "}
                      <button
                        type="button"
                        className="text-sprout-purple hover:underline"
                        onClick={() => setShowPrivacyDialog(true)}
                      >
                        Privacy Policy
                      </button>
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
      
      {/* Terms & Conditions Dialog */}
      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Terms & Conditions</DialogTitle>
            <DialogDescription>
              Last updated: April 11, 2025
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 my-4">
            <h3 className="text-lg font-semibold">1. Acceptance of Terms</h3>
            <p>
              By accessing or using Happy Sprout ("the Application"), you agree to be bound by these Terms and Conditions. 
              If you do not agree to all of these terms, you may not use the Application.
            </p>
            
            <h3 className="text-lg font-semibold">2. Services Description</h3>
            <p>
              Happy Sprout provides tools for tracking and supporting children's social-emotional development through 
              journaling, mood tracking, and other activities. The Application is intended for use by parents and 
              guardians of children.
            </p>
            
            <h3 className="text-lg font-semibold">3. User Accounts</h3>
            <p>
              You are responsible for maintaining the confidentiality of your account information and for all activities 
              that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
            </p>
            
            <h3 className="text-lg font-semibold">4. Child Privacy</h3>
            <p>
              By creating an account and using this service, you confirm that you are the parent or legal guardian of 
              any child profiles you create within the Application. You consent to the collection and use of your child's 
              information as described in our Privacy Policy.
            </p>
            
            <h3 className="text-lg font-semibold">5. Data Usage</h3>
            <p>
              Information collected through the Application will be used solely for the purposes of providing and improving 
              the Application's services. We prioritize the security and privacy of all user data, especially children's data.
            </p>
            
            <h3 className="text-lg font-semibold">6. Limitations</h3>
            <p>
              The Application is not a substitute for professional medical or psychological advice, diagnosis, or treatment. 
              Always seek the advice of qualified health providers with any questions regarding your child's health.
            </p>
            
            <h3 className="text-lg font-semibold">7. Changes to Terms</h3>
            <p>
              We reserve the right to modify these terms at any time. Your continued use of the Application after such changes 
              constitutes your acceptance of the new terms.
            </p>
            
            <h3 className="text-lg font-semibold">8. Contact Information</h3>
            <p>
              If you have any questions about these Terms, please contact us at support@happysprout.example.com.
            </p>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() => setShowTermsDialog(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Privacy Policy Dialog */}
      <Dialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Privacy Policy</DialogTitle>
            <DialogDescription>
              Last updated: April 11, 2025
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 my-4">
            <h3 className="text-lg font-semibold">1. Information We Collect</h3>
            <p>
              We collect information you provide directly to us when you create an account and use our services, including:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Personal information such as name and email address</li>
              <li>Child profile information including name, age, and developmental information</li>
              <li>Content created within the Application such as journal entries and mood tracking data</li>
            </ul>
            
            <h3 className="text-lg font-semibold">2. How We Use Information</h3>
            <p>
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide, maintain, and improve our services</li>
              <li>Personalize your experience</li>
              <li>Monitor and analyze usage patterns and trends</li>
              <li>Communicate with you about the Application</li>
            </ul>
            
            <h3 className="text-lg font-semibold">3. Sharing of Information</h3>
            <p>
              We do not share personal information with companies, organizations, or individuals outside of Happy Sprout except 
              in the following cases:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>With your consent</li>
              <li>For legal reasons if required by law</li>
              <li>With service providers who process data on our behalf, subject to strict confidentiality obligations</li>
            </ul>
            
            <h3 className="text-lg font-semibold">4. Children's Privacy</h3>
            <p>
              We are committed to protecting children's privacy. We only collect information about children with parental 
              consent. Parents can review, edit, and delete their children's information at any time.
            </p>
            
            <h3 className="text-lg font-semibold">5. Data Security</h3>
            <p>
              We maintain administrative, technical, and physical safeguards designed to protect the personal information 
              we maintain against unauthorized access or disclosure.
            </p>
            
            <h3 className="text-lg font-semibold">6. Your Rights</h3>
            <p>
              You have the right to access, correct, or delete your personal information and your child's information. 
              You can exercise these rights by accessing your account settings or contacting us directly.
            </p>
            
            <h3 className="text-lg font-semibold">7. Changes to Privacy Policy</h3>
            <p>
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new 
              privacy policy on this page and updating the effective date.
            </p>
            
            <h3 className="text-lg font-semibold">8. Contact Us</h3>
            <p>
              If you have any questions about this Privacy Policy, please contact us at privacy@happysprout.example.com.
            </p>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() => setShowPrivacyDialog(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Register;
