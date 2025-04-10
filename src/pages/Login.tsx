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
import { InfoIcon, AlertTriangleIcon } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { loginWithEmail, isLoggedIn, user } = useAuth();
  const { checkAdminStatus } = useAdmin();
  const { toast } = useToast();

  // Check if already logged in
  useEffect(() => {
    const checkLoginAndAdmin = async () => {
      if (isLoggedIn && user) {
        // Check if the user is an admin and redirect accordingly
        const isAdmin = await checkAdminStatus();
        console.log("Admin check on login page:", isAdmin);
        
        if (isAdmin) {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }
    };

    checkLoginAndAdmin();
  }, [isLoggedIn, user, navigate, checkAdminStatus]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      console.log("Login attempt with:", email);
      await loginWithEmail(email, password);
      
      // Wait briefly to ensure auth state has updated
      setTimeout(async () => {
        // Check if the user is an admin and redirect accordingly
        const isAdmin = await checkAdminStatus();
        console.log("User is admin after login:", isAdmin);
        
        if (isAdmin) {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
        
        setLoading(false);
      }, 500);
    } catch (error: any) {
      console.error("Login error in component:", error);
      setError(error.message || "Login failed. Please check your credentials.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sprout-green/10 to-sprout-purple/10 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-sprout-purple">Happy Sprout</h1>
          <p className="text-gray-600">Nurturing Social-Emotional Growth</p>
        </div>
        
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <InfoIcon className="h-4 w-4 text-blue-500" />
          <AlertTitle>Admin Access</AlertTitle>
          <AlertDescription>
            To access the admin panel, register a normal user account, and then use the Supabase dashboard to set them as an admin.
          </AlertDescription>
        </Alert>
        
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
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-sprout-purple hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
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
