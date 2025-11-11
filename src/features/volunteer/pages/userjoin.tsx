import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, Award } from 'lucide-react';

type Volunteer = {
  id: number;
  title: string;
  organization: string;
  location: string;
  date: string;
  time: string;
  participants: number;
  status: string;
  category: string;
  hoursEarned: number;
  image: string;
};

const MyVolunteersPage = () => {
  const [joinedVolunteers, setJoinedVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  // Mock user data
  const currentUser = {
    id: 1,
    name: "Sarah Johnson"
  };

  // Mock data for volunteers the user has joined
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockJoinedVolunteers = [
        {
          id: 1,
          title: "Beach Cleanup Drive",
          organization: "Ocean Guardians",
          location: "Sunset Beach, CA",
          date: "2025-11-15",
          time: "9:00 AM - 12:00 PM",
          participants: 45,
          status: "upcoming",
          category: "Environment",
          hoursEarned: 0,
          image: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=400&h=250&fit=crop"
        },
        {
          id: 2,
          title: "Food Bank Distribution",
          organization: "Community Kitchen",
          location: "Downtown Community Center",
          date: "2025-11-08",
          time: "2:00 PM - 6:00 PM",
          participants: 30,
          status: "completed",
          category: "Community",
          hoursEarned: 4,
          image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&h=250&fit=crop"
        },
        {
          id: 3,
          title: "Animal Shelter Care",
          organization: "Paws & Hearts Shelter",
          location: "Riverside Animal Shelter",
          date: "2025-10-28",
          time: "10:00 AM - 2:00 PM",
          participants: 15,
          status: "completed",
          category: "Animals",
          hoursEarned: 4,
          image: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=400&h=250&fit=crop"
        },
        {
          id: 4,
          title: "Youth Mentoring Program",
          organization: "Future Leaders Foundation",
          location: "Lincoln High School",
          date: "2025-11-20",
          time: "3:00 PM - 5:00 PM",
          participants: 25,
          status: "upcoming",
          category: "Education",
          hoursEarned: 0,
          image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=250&fit=crop"
        }
      ];
      setJoinedVolunteers(mockJoinedVolunteers);
      setLoading(false);
    }, 500);
  }, []);

  const totalHours = joinedVolunteers.reduce((sum, vol) => sum + vol.hoursEarned, 0);
  const upcomingCount = joinedVolunteers.filter(v => v.status === 'upcoming').length;
  const completedCount = joinedVolunteers.filter(v => v.status === 'completed').length;

  const filteredVolunteers = joinedVolunteers.filter(vol => {
    if (activeFilter === 'all') return true;
    return vol.status === activeFilter;
  });

  const getStatusBadge = (status: string) => {
    if (status === 'upcoming') {
      return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Upcoming</span>;
    }
    return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Completed</span>;
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      Environment: 'bg-green-500',
      Community: 'bg-purple-500',
      Animals: 'bg-orange-500',
      Education: 'bg-blue-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">My Volunteer Activities</h1>
          <p className="text-blue-100 text-lg">Welcome back, {currentUser.name}!</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Activities</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{joinedVolunteers.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Upcoming Events</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{upcomingCount}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button 
              onClick={() => setActiveFilter('all')}
              className={`px-6 py-3 font-medium ${activeFilter === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
            >
              All Activities ({joinedVolunteers.length})
            </button>
            <button 
              onClick={() => setActiveFilter('upcoming')}
              className={`px-6 py-3 font-medium ${activeFilter === 'upcoming' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
            >
              Upcoming ({upcomingCount})
            </button>
            <button 
              onClick={() => setActiveFilter('completed')}
              className={`px-6 py-3 font-medium ${activeFilter === 'completed' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
            >
              Completed ({completedCount})
            </button>
          </div>
        </div>

        {/* Volunteer Activities List */}
        <div className="space-y-6">
          {filteredVolunteers.map((volunteer) => (
            <div key={volunteer.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="md:flex">
                <div className="md:w-1/3">
                  <img 
                    src={volunteer.image} 
                    alt={volunteer.title}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-2/3 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-3 h-3 rounded-full ${getCategoryColor(volunteer.category)}`}></span>
                        <span className="text-sm text-gray-600 font-medium">{volunteer.category}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-1">{volunteer.title}</h3>
                      <p className="text-gray-600 font-medium">{volunteer.organization}</p>
                    </div>
                    {getStatusBadge(volunteer.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center text-gray-700">
                      <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                      <span>{new Date(volunteer.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Clock className="w-5 h-5 mr-2 text-blue-600" />
                      <span>{volunteer.time}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                      <span>{volunteer.location}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Users className="w-5 h-5 mr-2 text-blue-600" />
                      <span>{volunteer.participants} participants</span>
                    </div>
                  </div>

                  {volunteer.status === 'completed' && volunteer.hoursEarned > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center">
                        <Award className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-green-800 font-medium">
                          You earned {volunteer.hoursEarned} volunteer hours!
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                      View Details
                    </button>
                    {volunteer.status === 'upcoming' && (
                      <button className="px-6 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium">
                        Cancel Registration
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {joinedVolunteers.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Activities Yet</h3>
            <p className="text-gray-600 mb-6">Start making a difference by joining your first volunteer activity!</p>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Browse Opportunities
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyVolunteersPage;