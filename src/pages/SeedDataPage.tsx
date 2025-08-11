import DataSeeder from "@/components/admin/DataSeeder";
import DataValidator from "@/components/admin/DataValidator";
import QuickDataCheck from "@/components/admin/QuickDataCheck";

const SeedDataPage = () => {
  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Seed Demo Data</h1>
        <p className="text-muted-foreground">
          Generate sample data to test the Happy Sprout analytics features.
        </p>
      </div>
      
      <div className="space-y-6">
        <DataSeeder />
        <DataValidator />
        <QuickDataCheck />
      </div>
    </div>
  );
};

export default SeedDataPage;
