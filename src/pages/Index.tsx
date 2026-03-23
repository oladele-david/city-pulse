import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">CityPulse GovOps</h1>
        <p className="text-muted-foreground text-lg">
          Advanced Civic Infrastructure Intelligence Platform
        </p>
        <div className="pt-4">
          <Link to="/login">
            <Button size="lg">Log In to Portal</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
