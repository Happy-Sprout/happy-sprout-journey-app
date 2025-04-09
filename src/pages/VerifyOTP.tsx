
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { MailIcon, RefreshCwIcon, AlertTriangleIcon } from "lucide-react";
import Layout from "@/components/Layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, sendOtp } = useAuth();
  const { toast } = useToast();
  
  // Extract email from location state
  const email = location.state?.email || "";
  
  useEffect(() => {
    if (!email) {
      toast({
        title: "Error",
        description: "Email address is missing. Please go back to registration.",
        variant: "destructive"
      });
      navigate("/register");
    }
  }, [email, navigate, toast]);
  
  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);
  
  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit verification code",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const success = await verifyOtp(email, otp);
      if (success) {
        navigate("/dashboard");
      } else {
        setError("Verification failed. Please check the code and try again.");
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      setError(error.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendOtp = async () => {
    setResendLoading(true);
    setError(null);
    
    try {
      const success = await sendOtp(email);
      if (success) {
        setCountdown(60); // Set a 60-second countdown
      } else {
        setError("Could not send verification code. Please try again later.");
      }
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      setError(error.message || "Could not send verification code. Please try again later.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Layout hideNav>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sprout-green/10 to-sprout-purple/10 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-sprout-purple">Happy Sprout</h1>
            <p className="text-gray-600">Verify Your Account</p>
          </div>
          
          {error && (
            <Alert className="mb-6 bg-red-50 border-red-200">
              <AlertTriangleIcon className="h-4 w-4 text-red-500" />
              <AlertTitle>Verification issue</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Enter Verification Code</CardTitle>
              <CardDescription>
                We've sent a 6-digit verification code to {email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <InputOTP 
                  value={otp} 
                  onChange={(value) => setOtp(value)}
                  maxLength={6}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  <MailIcon className="inline-block mr-1 h-4 w-4" />
                  Check your email inbox for the code
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="button" 
                className="w-full bg-sprout-purple hover:bg-sprout-purple/90 text-white" 
                onClick={handleVerify}
                disabled={loading || otp.length !== 6}
              >
                {loading ? "Verifying..." : "Verify Account"}
              </Button>
              
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResendOtp}
                  disabled={resendLoading || countdown > 0}
                  className="text-sprout-purple"
                >
                  {resendLoading ? (
                    <>
                      <RefreshCwIcon className="animate-spin mr-2 h-4 w-4" />
                      Sending...
                    </>
                  ) : countdown > 0 ? (
                    `Resend code in ${countdown}s`
                  ) : (
                    "Didn't receive the code? Resend"
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default VerifyOTP;
