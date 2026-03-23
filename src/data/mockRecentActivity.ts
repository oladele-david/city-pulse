export interface ActivityItem {
    id: number | string;
    title: string;
    time: string;
    severity?: "low" | "medium" | "high";
}

export const mockRecentActivity: ActivityItem[] = [
    { id: 1, title: "New road issue detected in Al Quoz", time: "10 minutes ago", severity: "medium" },
    { id: 2, title: "Maintenance completed in Sector 4", time: "1 hour ago", severity: "low" },
    { id: 3, title: "High usage alert: Downtown Parking", time: "2 hours ago", severity: "high" },
    { id: 4, title: "Traffic signal malfunction reported", time: "4 hours ago", severity: "medium" },
    { id: 5, title: "Waste collection delayed in JVC", time: "5 hours ago", severity: "low" },
    { id: 6, title: "Street light outage in Marina", time: "6 hours ago", severity: "low" },
    { id: 7, title: "Accident reported on SZR", time: "7 hours ago", severity: "high" },
    { id: 8, title: "Public park water leak detected", time: "8 hours ago", severity: "medium" },
    { id: 9, title: "Illegal dumping reported", time: "9 hours ago", severity: "medium" },
    { id: 10, title: "Bus stop damage reported", time: "10 hours ago", severity: "low" },
    { id: 11, title: "Pedestrian crossing signal failed", time: "11 hours ago", severity: "high" },
    { id: 12, title: "Maintenance crew deployed", time: "12 hours ago", severity: "low" },
];
