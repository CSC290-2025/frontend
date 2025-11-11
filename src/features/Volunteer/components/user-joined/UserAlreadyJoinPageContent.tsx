import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, CheckCircle2 } from "lucide-react";

const UserAlreadyJoinPageContent = () => {
  const navigate = useNavigate();

  const joinedOpportunities = [
    {
      id: 1,
      title: "Beach Cleanup Drive",
      description: "Join us in cleaning up our local beaches and protecting marine life.",
      location: "Santa Monica Beach",
      date: "2024-03-15",
      time: "9:00 AM - 12:00 PM",
      category: "Environment",
      status: "upcoming"
    },
    {
      id: 3,
      title: "Elder Care Visit",
      description: "Spend time with elderly residents, share stories and bring joy.",
      location: "Sunshine Care Home",
      date: "2024-03-18",
      time: "2:00 PM - 5:00 PM",
      category: "Health",
      status: "upcoming"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Volunteer Activities</h1>
              <p className="text-muted-foreground mt-1">Track your volunteer commitments and impact</p>
            </div>
            <Button onClick={() => navigate("/board")}>
              Find More Opportunities
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {joinedOpportunities.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">You have not joined any volunteer opportunities yet.</p>
              <Button onClick={() => navigate("/board")}>Browse Opportunities</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {joinedOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{opportunity.category}</Badge>
                        <Badge variant="outline" className="gap-1 bg-success/10 text-success border-success/20">
                          <CheckCircle2 className="h-3 w-3" />
                          Joined
                        </Badge>
                      </div>
                      <CardTitle>{opportunity.title}</CardTitle>
                      <CardDescription className="mt-2">{opportunity.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(opportunity.date).toLocaleDateString()} at {opportunity.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {opportunity.location}
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => navigate(`/detail/${opportunity.id}`)}>
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserAlreadyJoinPageContent;
