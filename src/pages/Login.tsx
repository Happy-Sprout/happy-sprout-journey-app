
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/contexts/AdminContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, AlertTriangleIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { loginWithEmail, isLoggedIn, user } = useAuth();
  const { checkAdminStatus } = useAdmin();
  const { toast } = useToast();

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Check if already logged in and redirect if needed
  useEffect(() => {
    if (!isLoggedIn || !user) return;
    
    const checkAuthAndRedirect = async () => {
      try {
        const isAdmin = await checkAdminStatus();
        if (isAdmin) {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        navigate("/dashboard");
      }
    };
    
    checkAuthAndRedirect();
  }, [isLoggedIn, user, navigate, checkAdminStatus]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Validate email format
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address (e.g., name@example.com)");
      setLoading(false);
      return;
    }
    
    try {
      console.log("Login attempt with:", email);
      await loginWithEmail(email, password);
      // Navigation is handled by the useEffect hook
    } catch (error: unknown) {
      console.error("Login error in component:", error);
      const errorMessage = error instanceof Error ? error.message : "Login failed. Please check your credentials.";
      setError(errorMessage);
      setLoading(false);
    }
  };
  
  const handleResetPassword = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to reset your password.",
        variant: "destructive"
      });
      return;
    }
    
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address (e.g., name@example.com).",
        variant: "destructive"
      });
      return;
    }
    
    setResetLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for a link to reset your password.",
      });
    } catch (error: unknown) {
      console.error("Password reset error:", error);
      const errorMessage = error instanceof Error ? error.message : "Could not send password reset email. Please try again.";
      toast({
        title: "Password Reset Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sprout-green/10 to-sprout-purple/10 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-sprout-purple">Happy Sprout</h1>
          <p className="text-gray-600">Nurturing Social-Emotional Growth</p>
        </div>
        
        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertTriangleIcon className="h-4 w-4 text-red-500" />
            <AlertTitle>Login failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>Welcome Back!</CardTitle>
            <CardDescription>
              Login to continue your journey with Happy Sprout
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
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
                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={resetLoading}
                    className="text-sm text-sprout-purple hover:underline"
                  >
                    {resetLoading ? "Sending..." : "Forgot Password?"}
                  </button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
              <p className="text-sm text-gray-600 text-center">
                Don't have an account?{" "}
                <Link to="/register" className="text-sprout-purple hover:underline">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
