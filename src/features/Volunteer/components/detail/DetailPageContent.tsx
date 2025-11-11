import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar, MapPin, Users, Clock, Heart } from 'lucide-react';
import { toast } from 'sonner';

const DetailPageContent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const opportunity = {
    id: 1,
    title: 'Beach Cleanup Drive',
    description:
      "Join us in cleaning up our local beaches and protecting marine life. This is a family-friendly event where we'll spend the morning collecting trash, recyclables, and debris from the beach.",
    fullDescription:
      "Our beaches are vital ecosystems that need our protection. Join our team of dedicated volunteers as we work together to keep our shorelines clean and safe for both people and wildlife. We'll provide all necessary equipment including gloves, trash bags, and collection tools. This is a great opportunity to meet like-minded people while making a tangible difference in your community.",
    location: 'Santa Monica Beach',
    address: '1550 Pacific Coast Highway, Santa Monica, CA 90401',
    date: '2024-03-15',
    time: '9:00 AM - 12:00 PM',
    volunteers: 12,
    needed: 20,
    category: 'Environment',
    organizer: 'Green Earth Initiative',
    requirements: [
      'Comfortable walking shoes',
      'Sun protection (hat, sunscreen)',
      'Water bottle',
      'Enthusiasm to help!',
    ],
  };

  const handleJoinVolunteer = () => {
    toast.success('Successfully joined the volunteer opportunity!');
    navigate('/my-volunteers');
  };

  return (
    <div className="bg-background min-h-screen">
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Opportunities
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="mb-4 flex items-start justify-between">
                  <Badge variant="secondary">{opportunity.category}</Badge>
                  <Badge variant="outline" className="gap-1">
                    <Users className="h-3 w-3" />
                    {opportunity.volunteers}/{opportunity.needed} volunteers
                  </Badge>
                </div>
                <CardTitle className="text-3xl">{opportunity.title}</CardTitle>
                <CardDescription className="text-base">
                  {opportunity.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-2 text-lg font-semibold">
                    About This Opportunity
                  </h3>
                  <p className="text-muted-foreground">
                    {opportunity.fullDescription}
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-3 text-lg font-semibold">What to Bring</h3>
                  <ul className="space-y-2">
                    {opportunity.requirements.map((req, index) => (
                      <li
                        key={index}
                        className="text-muted-foreground flex items-center gap-2"
                      >
                        <div className="bg-primary h-1.5 w-1.5 rounded-full" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="text-primary mt-0.5 h-5 w-5" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-muted-foreground text-sm">
                        {new Date(opportunity.date).toLocaleDateString(
                          'en-US',
                          {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="text-primary mt-0.5 h-5 w-5" />
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-muted-foreground text-sm">
                        {opportunity.time}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="text-primary mt-0.5 h-5 w-5" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-muted-foreground text-sm">
                        {opportunity.location}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {opportunity.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Heart className="text-primary mt-0.5 h-5 w-5" />
                    <div>
                      <p className="font-medium">Organized by</p>
                      <p className="text-muted-foreground text-sm">
                        {opportunity.organizer}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <Button
                  onClick={handleJoinVolunteer}
                  className="w-full"
                  size="lg"
                >
                  Join as Volunteer
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DetailPageContent;
