export interface Issue {
    id: string;
    type: "road" | "drainage" | "lighting" | "noise" | "heat";
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    severity: "low" | "medium" | "high";
    status: "open" | "in_progress" | "resolved";
    confidence: number;
    reports_count: number;
    location_name: string;
    created_at: string;
    updates: {
        status: string;
        timestamp: string;
        description: string;
    }[];
}

const generateDubaiPoints = (): Issue[] => {
    const issues: Issue[] = [];

    // Core areas for clustering
    const centers = [
        { lat: 25.1972, lon: 55.2744, name: "Downtown Dubai" },
        { lat: 25.0772, lon: 55.1378, name: "Dubai Marina" },
        { lat: 25.2635, lon: 55.3087, name: "Deira" },
        { lat: 25.1524, lon: 55.2323, name: "Al Quoz" },
    ];

    const types = ["road", "drainage", "lighting", "noise", "heat"] as const;
    const severities = ["low", "medium", "high"] as const;
    const statuses = ["open", "in_progress", "resolved"] as const;

    let idCounter = 1;

    centers.forEach(center => {
        // Generate ~15 points around each center
        for (let i = 0; i < 15; i++) {
            const lat = center.lat + (Math.random() - 0.5) * 0.04;
            const lon = center.lon + (Math.random() - 0.5) * 0.04;
            const type = types[Math.floor(Math.random() * types.length)];
            const severity = severities[Math.floor(Math.random() * severities.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const confidence = 0.6 + Math.random() * 0.4; // 60-100%

            issues.push({
                id: `ISSUE-${idCounter++}`,
                type,
                title: `${type === 'road' ? 'Pothole' : type === 'drainage' ? 'Blocked Drain' : type === 'lighting' ? 'Streetlight Outage' : type === 'noise' ? 'Construction Noise' : 'High Heat Zone'} detected`,
                description: `Reported issue in ${center.name} area requiring attention.`,
                latitude: lat,
                longitude: lon,
                severity,
                status,
                confidence,
                reports_count: Math.floor(Math.random() * 20) + 1,
                location_name: center.name,
                created_at: new Date(Date.now() - Math.random() * 86400000 * 3).toISOString(), // Last 3 days
                updates: [
                    {
                        status: "Issue Detected",
                        timestamp: "2 hours ago",
                        description: "System flagged potential issue based on citizen reports."
                    },
                    {
                        status: "Verification Pending",
                        timestamp: "1 hour ago",
                        description: "Awaiting operator review."
                    }
                ]
            });
        }
    });

    return issues;
};

export const mockIssues = generateDubaiPoints();
