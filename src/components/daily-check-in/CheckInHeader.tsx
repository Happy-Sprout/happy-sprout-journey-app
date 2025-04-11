
import { ReactNode } from "react";
import { ChildProfile } from "@/contexts/UserContext";

interface CheckInHeaderProps {
  currentChild?: ChildProfile;
}

const CheckInHeader = ({ currentChild }: CheckInHeaderProps) => {
  return (
    <div className="mb-6 text-center">
      <h1 className="text-2xl md:text-3xl font-bold">
        Daily Emotion Check-In
      </h1>
      <p className="text-gray-600 mt-2">
        Hi {currentChild?.nickname}! Let's talk about how you're feeling today.
      </p>
    </div>
  );
};

export default CheckInHeader;
