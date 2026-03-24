export interface ActivityContribution {
    id: string;
    type: 'report' | 'confirmation' | 'resolution';
    title: string;
    location: string;
    timestamp: string;
    fullDate: string;
    points: number;
    status: 'pending' | 'verified' | 'resolved' | 'rejected';
    description?: string;
    category?: string;
    images?: string[];
}

export const activityContributions: ActivityContribution[] = [
    {
        id: 'act-1',
        type: 'resolution',
        title: "Pothole alignment completed",
        location: "Downtown Dubai, Near Mall",
        timestamp: "2h ago",
        fullDate: "January 2, 2026 • 08:30 AM",
        points: 5,
        status: 'resolved',
        description: "The road maintenance team has successfully resurfaced the reported area. Thank you for your alert!",
        category: "Roads"
    },
    {
        id: 'act-2',
        type: 'report',
        title: "Malfunctioning Streetlight",
        location: "Dubai Marina, Cluster G",
        timestamp: "1d ago",
        fullDate: "January 1, 2026 • 10:15 PM",
        points: 3,
        status: 'verified',
        description: "Light pole #402 flickers constantly, creating visibility issues for drivers at night.",
        category: "Lighting"
    },
    {
        id: 'act-3',
        type: 'confirmation',
        title: "Confirmed: Drainage Issue",
        location: "Jumeirah Beach Road",
        timestamp: "3d ago",
        fullDate: "December 30, 2025 • 02:20 PM",
        points: 1,
        status: 'verified',
        description: "You confirmed that the drainage block near the bus stop is indeed active.",
        category: "Drainage"
    },
    {
        id: 'act-4',
        type: 'report',
        title: "Illegal Waste Dumping",
        location: "Al Quoz Industrial 3",
        timestamp: "5d ago",
        fullDate: "December 28, 2025 • 11:45 AM",
        points: 0,
        status: 'pending',
        description: "Construction debris dumped on the sidewalk. Blocking pedestrian path.",
        category: "Waste"
    },
    {
        id: 'act-5',
        type: 'resolution',
        title: "Noise complaint addressed",
        location: "Business Bay",
        timestamp: "1w ago",
        fullDate: "December 26, 2025 • 01:10 AM",
        points: 5,
        status: 'resolved',
        description: "Authorities have intervened regarding late-night construction noise.",
        category: "Noise"
    }
];
