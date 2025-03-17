"use client";

import React, { useState } from "react";
import { Team } from "@/types/team";
import TeamRosterFilter from "./TeamRosterFilter";
import TeamRosterDetail from "./TeamRosterDetail";

const TeamRosterList: React.FC = () => {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");

  // Sample data
  const teams: Team[] = [
    {
      id: "T-101",
      name: "Cleaning Team Alpha",
      teamLeader: "Maria Rodriguez",
      teamSize: 4,
      specialization: "Residential",
      members: [
        {
          id: "E-1001",
          name: "Maria Rodriguez",
          role: "Team Leader",
          phoneNumber: "555-123-4567",
          email: "maria.r@cleaningco.com",
          skills: ["Deep Cleaning", "Post-Construction", "Residential"],
          yearsOfExperience: 5,
          startDate: "2020-03-15",
          notes:
            "Fluent in English and Spanish. Specialized in deep cleaning techniques.",
          availability: "Full-time",
          image: "/team-members/maria-rodriguez.jpg",
        },
        {
          id: "E-1002",
          name: "David Smith",
          role: "Cleaner",
          phoneNumber: "555-234-5678",
          email: "david.s@cleaningco.com",
          skills: ["Regular Cleaning", "Carpet Cleaning", "Residential"],
          yearsOfExperience: 3,
          startDate: "2022-01-10",
          notes:
            "Detail-oriented and efficient. Great with customer interactions.",
          availability: "Part-time",
          image: "/team-members/david-smith.jpg",
        },
        {
          id: "E-1003",
          name: "Amanda Johnson",
          role: "Cleaner",
          phoneNumber: "555-345-6789",
          email: "amanda.j@cleaningco.com",
          skills: ["Deep Cleaning", "Move In/Out", "Residential"],
          yearsOfExperience: 4,
          startDate: "2021-05-20",
          notes:
            "Specialized in move-in/move-out cleanings. Trained in eco-friendly products.",
          availability: "Full-time",
          image: "/team-members/amanda-johnson.jpg",
        },
        {
          id: "E-1004",
          name: "Michael Brown",
          role: "Cleaner",
          phoneNumber: "555-456-7890",
          email: "michael.b@cleaningco.com",
          skills: ["Regular Cleaning", "Window Cleaning", "Residential"],
          yearsOfExperience: 2,
          startDate: "2023-02-15",
          notes:
            "Specialized training in window and glass cleaning techniques.",
          availability: "Full-time",
          image: "/team-members/michael-brown.jpg",
        },
      ],
      schedule: [
        {
          id: "S-1001",
          date: "2025-03-21",
          startTime: "08:00",
          endTime: "12:00",
          is_blocked: false,
          is_available: true,
          location: "Downtown District",
          notes: "Regular morning shift",
        },
        {
          id: "S-1007",
          date: "2025-03-21",
          startTime: "13:00",
          endTime: "17:00",
          is_blocked: false,
          is_available: false,
          location: "Highland Park",
          notes: "Regular afternoon shift",
          bookingId: "B-5015",
        },
        {
          id: "S-1003",
          date: "2025-03-22",
          startTime: "08:00",
          endTime: "16:00",
          is_blocked: false,
          is_available: false,
          location: "Suburban District",
          notes: "Full day shift - booked",
          bookingId: "B-5017",
        },
        {
          id: "S-1010",
          date: "2025-03-23",
          startTime: "08:00",
          endTime: "12:00",
          is_blocked: false,
          is_available: true,
          location: "Downtown District",
          notes: "Morning availability",
        },
      ],
      equipment: [
        "Professional vacuum cleaners",
        "Steam cleaners",
        "Eco-friendly cleaning supplies",
        "Residential cleaning kit",
      ],
      vehicle: "Van A-123",
      rating: 4.8,
      active: true,
      createdAt: "2020-03-15T10:23:18",
      lastUpdated: "2025-03-15T14:10:22",
    },
    {
      id: "T-102",
      name: "Cleaning Team Beta",
      teamLeader: "James Wilson",
      teamSize: 3,
      specialization: "Commercial",
      members: [
        {
          id: "E-1005",
          name: "James Wilson",
          role: "Team Leader",
          phoneNumber: "555-567-8901",
          email: "james.w@cleaningco.com",
          skills: ["Deep Cleaning", "Commercial", "Office Buildings"],
          yearsOfExperience: 6,
          startDate: "2019-06-10",
          notes:
            "Experienced in managing large commercial projects. Background in facility management.",
          availability: "Full-time",
          image: "/team-members/james-wilson.jpg",
        },
        {
          id: "E-1006",
          name: "Sarah Lee",
          role: "Cleaner",
          phoneNumber: "555-678-9012",
          email: "sarah.l@cleaningco.com",
          skills: ["Office Cleaning", "Floor Maintenance", "Commercial"],
          yearsOfExperience: 4,
          startDate: "2021-03-05",
          notes:
            "Specialized in floor care and maintenance. Certified in commercial cleaning.",
          availability: "Full-time",
          image: "/team-members/sarah-lee.jpg",
        },
        {
          id: "E-1007",
          name: "Miguel Hernandez",
          role: "Cleaner",
          phoneNumber: "555-789-0123",
          email: "miguel.h@cleaningco.com",
          skills: ["Commercial", "Industrial", "Sanitization"],
          yearsOfExperience: 3,
          startDate: "2022-04-12",
          notes:
            "Training in industrial cleaning and sanitization protocols. OSHA certified.",
          availability: "Full-time",
          image: "/team-members/miguel-hernandez.jpg",
        },
      ],
      schedule: [
        {
          id: "S-1002",
          date: "2025-03-21",
          startTime: "13:00",
          endTime: "17:00",
          is_blocked: false,
          is_available: true,
          location: "Waterfront Area",
          notes: "Afternoon shift",
        },
        {
          id: "S-1006",
          date: "2025-03-23",
          startTime: "16:00",
          endTime: "22:00",
          is_blocked: false,
          is_available: true,
          location: "Downtown District",
          notes: "Evening shift for office buildings",
        },
        {
          id: "S-1011",
          date: "2025-03-24",
          startTime: "16:00",
          endTime: "22:00",
          is_blocked: false,
          is_available: false,
          location: "Business District",
          notes: "Evening office cleaning",
          bookingId: "B-5020",
        },
      ],
      equipment: [
        "Industrial vacuum cleaners",
        "Floor scrubbers",
        "Commercial cleaning supplies",
        "Office cleaning kit",
      ],
      vehicle: "Van B-456",
      rating: 4.6,
      active: true,
      createdAt: "2019-06-10T09:15:22",
      lastUpdated: "2025-03-12T11:05:30",
    },
    {
      id: "T-103",
      name: "Cleaning Team Gamma",
      teamLeader: "Lisa Chen",
      teamSize: 3,
      specialization: "Mixed",
      members: [
        {
          id: "E-1008",
          name: "Lisa Chen",
          role: "Team Leader",
          phoneNumber: "555-890-1234",
          email: "lisa.c@cleaningco.com",
          skills: ["Deep Cleaning", "Residential", "Commercial", "Training"],
          yearsOfExperience: 7,
          startDate: "2018-05-15",
          notes:
            "Training specialist. Develops cleaning protocols and trains new staff.",
          availability: "Full-time",
          image: "/team-members/lisa-chen.jpg",
        },
        {
          id: "E-1009",
          name: "Robert Taylor",
          role: "Cleaner",
          phoneNumber: "555-901-2345",
          email: "robert.t@cleaningco.com",
          skills: ["Residential", "Commercial", "Sanitization"],
          yearsOfExperience: 3,
          startDate: "2022-01-20",
          notes: "Cross-trained in both residential and commercial cleaning.",
          availability: "Full-time",
          image: "/team-members/robert-taylor.jpg",
        },
        {
          id: "E-1010",
          name: "Emma White",
          role: "Cleaner",
          phoneNumber: "555-012-3456",
          email: "emma.w@cleaningco.com",
          skills: ["Deep Cleaning", "Residential", "Commercial"],
          yearsOfExperience: 2,
          startDate: "2023-03-10",
          notes: "Background in hospitality. Excellent attention to detail.",
          availability: "Part-time",
          image: "/team-members/emma-white.jpg",
        },
      ],
      schedule: [
        {
          id: "S-1004",
          date: "2025-03-22",
          startTime: "09:00",
          endTime: "17:00",
          is_blocked: true,
          is_available: false,
          location: "N/A",
          notes: "Team training day",
        },
        {
          id: "S-1012",
          date: "2025-03-25",
          startTime: "08:00",
          endTime: "16:00",
          is_blocked: false,
          is_available: true,
          location: "Various",
          notes: "Available for booking",
        },
      ],
      equipment: [
        "Standard vacuum cleaners",
        "Mixed cleaning supplies",
        "Training materials",
        "Residential & commercial kits",
      ],
      vehicle: "Van C-789",
      rating: 4.7,
      active: true,
      createdAt: "2018-05-15T13:45:10",
      lastUpdated: "2025-03-10T16:30:45",
    },
    {
      id: "T-104",
      name: "Special Services Team",
      teamLeader: "Carlos Mendes",
      teamSize: 3,
      specialization: "Specialized",
      members: [
        {
          id: "E-1011",
          name: "Carlos Mendes",
          role: "Team Leader",
          phoneNumber: "555-123-4567",
          email: "carlos.m@cleaningco.com",
          skills: [
            "Post-Construction",
            "Deep Cleaning",
            "Specialized Services",
          ],
          yearsOfExperience: 8,
          startDate: "2017-07-10",
          notes:
            "Expert in post-construction cleaning and specialized services.",
          availability: "Full-time",
          image: "/team-members/carlos-mendes.jpg",
        },
        {
          id: "E-1012",
          name: "Aisha Patel",
          role: "Specialist",
          phoneNumber: "555-234-5678",
          email: "aisha.p@cleaningco.com",
          skills: ["Post-Construction", "Deep Cleaning", "Industrial"],
          yearsOfExperience: 5,
          startDate: "2020-09-15",
          notes: "Specialized in heavy-duty cleaning and industrial services.",
          availability: "Full-time",
          image: "/team-members/aisha-patel.jpg",
        },
        {
          id: "E-1013",
          name: "Tom Johnson",
          role: "Specialist",
          phoneNumber: "555-345-6789",
          email: "tom.j@cleaningco.com",
          skills: [
            "Post-Construction",
            "Heavy Equipment",
            "Hard Surface Restoration",
          ],
          yearsOfExperience: 6,
          startDate: "2019-04-20",
          notes:
            "Expertise in hard surface restoration and damage remediation.",
          availability: "Full-time",
          image: "/team-members/tom-johnson.jpg",
        },
      ],
      schedule: [
        {
          id: "S-1005",
          date: "2025-03-23",
          startTime: "07:00",
          endTime: "15:00",
          is_blocked: false,
          is_available: true,
          location: "Business District",
          notes: "Available for specialized services",
        },
        {
          id: "S-1013",
          date: "2025-03-26",
          startTime: "07:00",
          endTime: "15:00",
          is_blocked: false,
          is_available: false,
          location: "Construction Site - Downtown",
          notes: "Post-construction cleaning",
          bookingId: "B-5025",
        },
      ],
      equipment: [
        "Industrial vacuums",
        "Power washers",
        "Specialized cleaning tools",
        "Heavy-duty supplies",
        "Construction cleanup kit",
      ],
      vehicle: "Truck D-101",
      rating: 4.9,
      active: true,
      createdAt: "2017-07-10T09:30:15",
      lastUpdated: "2025-03-14T10:45:30",
    },
    {
      id: "T-105",
      name: "Night Shift Team",
      teamLeader: "Nicole Andrews",
      teamSize: 4,
      specialization: "Commercial",
      members: [
        {
          id: "E-1014",
          name: "Nicole Andrews",
          role: "Team Leader",
          phoneNumber: "555-456-7890",
          email: "nicole.a@cleaningco.com",
          skills: ["Commercial", "Night Shift", "Office Buildings"],
          yearsOfExperience: 5,
          startDate: "2020-01-15",
          notes:
            "Specialized in managing night shift operations for commercial buildings.",
          availability: "Night Shift",
          image: "/team-members/nicole-andrews.jpg",
        },
        {
          id: "E-1015",
          name: "John Peterson",
          role: "Cleaner",
          phoneNumber: "555-567-8901",
          email: "john.p@cleaningco.com",
          skills: ["Commercial", "Floor Care", "Night Shift"],
          yearsOfExperience: 3,
          startDate: "2022-02-10",
          notes:
            "Expertise in floor care and maintenance during night operations.",
          availability: "Night Shift",
          image: "/team-members/john-peterson.jpg",
        },
        {
          name: "Sophia Martinez",
          role: "Cleaner",
          phoneNumber: "555-012-3456",
          email: "sophia.m@cleaningco.com",
          skills: ["Commercial", "Office Buildings", "Night Shift"],
          yearsOfExperience: 4,
          startDate: "2021-06-15",
          notes: "Specializes in office building cleaning during night hours.",
          availability: "Night Shift",
          image: "/team-members/sophia-martinez.jpg",
          id: "E-1018",
        },
        {
          id: "E-1017",
          name: "Kevin Williams",
          role: "Cleaner",
          phoneNumber: "555-123-4567",
          email: "kevin.w@cleaningco.com",
          skills: ["Commercial", "Sanitization", "Night Shift"],
          yearsOfExperience: 2,
          startDate: "2023-04-05",
          notes: "Specialized in after-hours sanitization procedures.",
          availability: "Night Shift",
          image: "/team-members/kevin-williams.jpg",
        },
      ],
      schedule: [
        {
          id: "S-1008",
          date: "2025-03-21",
          startTime: "22:00",
          endTime: "06:00",
          is_blocked: false,
          is_available: false,
          location: "Financial District",
          notes: "Overnight cleaning - booked",
          bookingId: "B-5018",
        },
        {
          id: "S-1009",
          date: "2025-03-22",
          startTime: "22:00",
          endTime: "06:00",
          is_blocked: false,
          is_available: true,
          location: "Business District",
          notes: "Overnight availability",
        },
      ],
      equipment: [
        "Commercial vacuum cleaners",
        "Floor polishers",
        "Night shift supplies",
        "Office cleaning kit",
      ],
      vehicle: "Van E-222",
      rating: 4.7,
      active: true,
      createdAt: "2020-01-15T14:30:22",
      lastUpdated: "2025-03-12T09:15:40",
    },
  ];

  // Handle filtering teams based on specialization
  const filteredTeams = teams.filter((team) => {
    if (filterType === "all") return true;
    return team.specialization.toLowerCase() === filterType.toLowerCase();
  });

  // Handle team selection
  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
    setIsDetailOpen(true);
  };

  // Handle closing team detail view
  const handleDetailClose = () => {
    setIsDetailOpen(false);
  };

  // Handle filter change
  const handleFilterChange = (filter: string) => {
    setFilterType(filter);
  };

  // Get unique specializations for filter options
  const specializations = Array.from(
    new Set(teams.map((team) => team.specialization))
  );

  return (
    <div className='container mx-auto px-4 py-6'>
      <h1 className='text-2xl font-bold mb-6'>Team Roster Management</h1>

      {/* Filter Section */}
      <TeamRosterFilter
        specializations={specializations}
        currentFilter={filterType}
        onFilterChange={handleFilterChange}
      />

      {/* Team List */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6'>
        {filteredTeams.map((team) => (
          <div
            key={team.id}
            className='bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer'
            onClick={() => handleTeamSelect(team)}>
            <div className='flex justify-between items-start mb-2'>
              <h2 className='text-lg font-semibold'>{team.name}</h2>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  team.active
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                {team.active ? "Active" : "Inactive"}
              </span>
            </div>

            <div className='text-sm text-gray-600 mb-1'>
              <span className='font-medium'>Team Leader:</span>{" "}
              {team.teamLeader}
            </div>

            <div className='text-sm text-gray-600 mb-1'>
              <span className='font-medium'>Specialization:</span>{" "}
              {team.specialization}
            </div>

            <div className='text-sm text-gray-600 mb-1'>
              <span className='font-medium'>Team Size:</span> {team.teamSize}{" "}
              members
            </div>

            <div className='text-sm text-gray-600 mb-1'>
              <span className='font-medium'>Rating:</span> {team.rating} / 5
            </div>

            <div className='text-sm text-gray-600 mb-1'>
              <span className='font-medium'>Vehicle:</span> {team.vehicle}
            </div>

            <div className='mt-3 flex justify-between items-center'>
              <div className='text-xs text-gray-500'>
                Last updated: {new Date(team.lastUpdated).toLocaleDateString()}
              </div>
              <button
                className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm'
                onClick={(e) => {
                  e.stopPropagation();
                  handleTeamSelect(team);
                }}>
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* No teams message */}
      {filteredTeams.length === 0 && (
        <div className='text-center py-8'>
          <p className='text-gray-500'>
            No teams found matching the selected filter.
          </p>
        </div>
      )}

      {isDetailOpen && selectedTeam && (
        <TeamRosterDetail
          team={selectedTeam}
          isOpen={isDetailOpen}
          onClose={handleDetailClose}
        />
      )}
    </div>
  );
};

export default TeamRosterList;
