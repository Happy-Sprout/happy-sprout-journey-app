
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const DashboardLoading = () => {
  return (
    <div className="flex justify-center items-center h-64">
      <LoadingSpinner message="Loading your dashboard..." />
    </div>
  );
};

export default DashboardLoading;
