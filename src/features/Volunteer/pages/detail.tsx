import React, { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, Clock, Users, Share2, Heart, Award, Star } from 'lucide-react';

export default function VolunteerDetailPage() {
  const [isJoined, setIsJoined] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Volunteer Jobs</span>
          </button>
          <div className="flex gap-3">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <Heart className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl h-96 flex items-center justify-center overflow-hidden">
              <div className="text-center text-white">
                <div className="flex justify-center gap-4 mb-4">
                  {[1, 2, 3, 4].map((person) => (
                    <div
                      key={person}
                      className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-sm"
                    />
                  ))}
                </div>
                <div className="text-6xl font-bold opacity-20">TEACHING</div>
              </div>
            </div>

            {/* Title and Organization */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-800 mb-2">
                    Teaching Volunteer Program
                  </h1>
                  <p className="text-lg text-gray-600">
                    by Community Education Center
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-lime-100 px-4 py-2 rounded-full">
                  <Award className="w-5 h-5 text-lime-600" />
                  <span className="font-semibold text-lime-700">Featured</span>
                </div>
              </div>
            </div>

            {/* Quick Info Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <Calendar className="w-6 h-6 text-blue-500 mb-2" />
                <div className="text-sm text-gray-600">Date</div>
                <div className="font-semibold text-gray-800">14 Sep 2025</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <Clock className="w-6 h-6 text-blue-500 mb-2" />
                <div className="text-sm text-gray-600">Time</div>
                <div className="font-semibold text-gray-800">9:00 AM - 3:00 PM</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <Users className="w-6 h-6 text-blue-500 mb-2" />
                <div className="text-sm text-gray-600">Volunteers</div>
                <div className="font-semibold text-gray-800">47/55 Joined</div>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">About This Opportunity</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Join us in making a difference in children education! We are looking for passionate volunteers to help teach basic literacy and numeracy skills to underprivileged children in our community.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                This is a wonderful opportunity to give back to the community while developing your teaching and mentoring skills. No prior teaching experience is required - just bring your enthusiasm and willingness to help!
              </p>
              <p className="text-gray-700 leading-relaxed">
                You will be working with small groups of children aged 7-12, helping them with homework, reading activities, and educational games. All teaching materials will be provided.
              </p>
            </div>

            {/* What You'll Do */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">What You  will Do</h2>
              <ul className="space-y-3">
                {[
                  'Assist with classroom activities and lesson plans',
                  'Help students with reading and writing exercises',
                  'Support students with math problems and homework',
                  'Organize educational games and group activities',
                  'Provide one-on-one mentoring when needed'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-lime-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-semibold text-gray-800">{index + 1}</span>
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Requirements</h2>
              <ul className="space-y-2">
                {[
                  'Age 18 or above',
                  'Good communication skills',
                  'Patience and enthusiasm for working with children',
                  'Commitment to attend full session',
                  'Background check (will be provided)'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Location */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Location</h2>
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-5 h-5 text-blue-500 mt-1" />
                <div>
                  <div className="font-semibold text-gray-800">Community Education Center</div>
                  <div className="text-gray-600">123 Learning Street, Central District</div>
                  <div className="text-gray-600">Bangkok, Thailand 10100</div>
                </div>
              </div>
              <div className="bg-gray-200 rounded-xl h-64 flex items-center justify-center">
                <MapPin className="w-12 h-12 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Join Card */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 sticky top-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Spots Available</span>
                  <span className="font-bold text-gray-800">8 left</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-lime-400 h-2 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <button
                onClick={() => setIsJoined(!isJoined)}
                className={`w-full py-4 rounded-full font-semibold text-lg transition-colors mb-4 ${
                  isJoined
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    : 'bg-lime-400 text-gray-800 hover:bg-lime-500'
                }`}
              >
                {isJoined ? 'Joined ✓' : 'Join Now'}
              </button>

              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold text-gray-800">6 hours</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Category</span>
                  <span className="font-semibold text-gray-800">Education</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Difficulty</span>
                  <span className="font-semibold text-gray-800">Beginner</span>
                </div>
              </div>
            </div>

            {/* Organizer Info */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-4">Organized By</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
                <div>
                  <div className="font-semibold text-gray-800">Community Ed Center</div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>4.8 (127 reviews)</span>
                  </div>
                </div>
              </div>
              <button className="w-full py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium">
                View Profile
              </button>
            </div>

            {/* Impact Stats */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
              <h3 className="font-bold mb-4">Impact</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-3xl font-bold">500+</div>
                  <div className="text-blue-100 text-sm">Children Helped</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">1,200</div>
                  <div className="text-blue-100 text-sm">Volunteer Hours</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">95%</div>
                  <div className="text-blue-100 text-sm">Satisfaction Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}