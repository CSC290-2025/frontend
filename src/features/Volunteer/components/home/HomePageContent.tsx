import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Bus, 
  Calendar, 
  CloudSun, 
  Heart, 
  Brain, 
  Phone, 
  User, 
  Settings, 
  Wallet,
  LogOut,
  Search,
  SlidersHorizontal,
  Sparkles,
  Bike,
  Users,
  Trash2
} from "lucide-react";

const HomePageContent = () => {
  const navigate = useNavigate();

  const sidebarItems = [
    { icon: LayoutDashboard, label: "City insights", subtitle: "Dashboard and quick service" },
    { icon: Bus, label: "Transport", subtitle: "Bus timing and routes" },
    { icon: Calendar, label: "Events", subtitle: "Activities and volunteer", active: true },
    { icon: CloudSun, label: "Weather reports", subtitle: "Forcast & Air Quality" },
    { icon: Heart, label: "Healthcare", subtitle: "Hospital & Emergency services" },
    { icon: Brain, label: "Know AI", subtitle: "Learning with AI" },
    { icon: Phone, label: "Contact us", subtitle: "Report issues" },
  ];

  const categories = [
    { icon: Sparkles, label: "Events", subtitle: "Activities and volunteer" },
    { icon: Bike, label: "Free cycle", subtitle: "Activities and volunteer" },
    { icon: Users, label: "Volunteer", subtitle: "Activities and volunteer" },
    { icon: Trash2, label: "Waste Management", subtitle: "Activities and volunteer" },
  ];

  const volunteerJobs = Array(8).fill(null).map((_, i) => ({
    id: i + 1,
    title: "Teaching",
    date: "14 Sep 2025",
    participated: "47/55",
  }));

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-foreground">VolunteerHub</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item, index) => (
            <button
              key={index}
              className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors ${
                item.active 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <item.icon className="h-5 w-5 mt-0.5 shrink-0" />
              <div className="text-left">
                <div className="font-medium text-sm">{item.label}</div>
                <div className="text-xs opacity-70">{item.subtitle}</div>
              </div>
            </button>
          ))}
        </nav>

        <div className="p-4 space-y-2 border-t">
          <button className="w-full flex items-center gap-3 p-3 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <User className="h-5 w-5" />
            <span className="text-sm font-medium">Profile</span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <Settings className="h-5 w-5" />
            <span className="text-sm font-medium">Setting</span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <Wallet className="h-5 w-5" />
            <span className="text-sm font-medium">E-wallet</span>
          </button>
          <Button 
            variant="default" 
            className="w-full justify-start gap-3 bg-primary/20 text-primary hover:bg-primary/30"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-sm font-medium">Log out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Category Filters */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            {categories.map((category, index) => (
              <button
                key={index}
                className="bg-card border rounded-xl p-6 hover:shadow-md transition-shadow text-left"
              >
                <category.icon className="h-6 w-6 mb-3" />
                <h3 className="font-semibold text-foreground mb-1">{category.label}</h3>
                <p className="text-xs text-muted-foreground">{category.subtitle}</p>
              </button>
            ))}
          </div>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search for volunteer works"
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Fillter
            </Button>
          </div>

          {/* Volunteer Jobs */}
          <h2 className="text-3xl font-bold mb-6 text-foreground">Volunteer Jobs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {volunteerJobs.map((job) => (
              <div
                key={job.id}
                className="bg-card border rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/detail/`)}
              >
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <Users className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-2">{job.title}</h3>
                  <p className="text-sm text-muted-foreground mb-1">{job.date}</p>
                  <p className="text-sm text-muted-foreground mb-4">Participated {job.participated}</p>
                  <Button className="w-full bg-success hover:bg-success/90">
                    Join
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePageContent;
