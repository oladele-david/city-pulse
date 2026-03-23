export interface IssueByType {
    type: string;
    count: number;
    color: string;
}

export interface IssueByArea {
    area: string;
    count: number;
    color: string;
}

export interface HeatZone {
    zone: string;
    issueCount: number;
    avgResolutionTime: number;
    trend: 'up' | 'down' | 'stable';
}

export interface ResolutionTimeTrend {
    month: string;
    avgDays: number;
    high: number;
    medium: number;
    low: number;
}

// Issues by Type
export const issuesByType: IssueByType[] = [
    { type: 'Road Issue', count: 342, color: '#ef4444' },
    { type: 'Drainage', count: 218, color: '#3b82f6' },
    { type: 'Lighting', count: 156, color: '#f59e0b' },
    { type: 'Noise', count: 89, color: '#8b5cf6' },
    { type: 'Heat Stress', count: 67, color: '#ec4899' },
];

// Issues by Area
export const issuesByArea: IssueByArea[] = [
    { area: 'Downtown Dubai', count: 245, color: '#ef4444' },
    { area: 'Dubai Marina', count: 198, color: '#3b82f6' },
    { area: 'Deira', count: 167, color: '#f59e0b' },
    { area: 'Business Bay', count: 134, color: '#8b5cf6' },
    { area: 'JBR', count: 98, color: '#ec4899' },
    { area: 'Al Quoz', count: 76, color: '#10b981' },
    { area: 'Jumeirah', count: 54, color: '#06b6d4' },
];

// Heat Zones (Top areas with most issues)
export const heatZones: HeatZone[] = [
    { zone: 'Downtown Dubai', issueCount: 245, avgResolutionTime: 3.2, trend: 'down' },
    { zone: 'Dubai Marina', issueCount: 198, avgResolutionTime: 4.1, trend: 'up' },
    { zone: 'Deira', issueCount: 167, avgResolutionTime: 2.8, trend: 'down' },
    { zone: 'Business Bay', issueCount: 134, avgResolutionTime: 3.5, trend: 'stable' },
    { zone: 'JBR', issueCount: 98, avgResolutionTime: 5.2, trend: 'up' },
    { zone: 'Al Quoz', issueCount: 76, avgResolutionTime: 2.1, trend: 'down' },
    { zone: 'Jumeirah', issueCount: 54, avgResolutionTime: 3.8, trend: 'stable' },
    { zone: 'Dubai Hills', issueCount: 47, avgResolutionTime: 4.3, trend: 'up' },
    { zone: 'Arabian Ranches', issueCount: 32, avgResolutionTime: 2.9, trend: 'down' },
    { zone: 'Motor City', issueCount: 21, avgResolutionTime: 3.1, trend: 'stable' },
];

// Resolution Time Trend (Last 12 months) - Randomized jagged data
export const resolutionTimeTrend: ResolutionTimeTrend[] = [
    { month: 'Jan', avgDays: 4.2, high: 6.8, medium: 5.1, low: 8.2 },
    { month: 'Feb', avgDays: 3.8, high: 8.9, medium: 3.2, low: 2.1 },
    { month: 'Mar', avgDays: 4.5, high: 5.3, medium: 7.8, low: 4.5 },
    { month: 'Apr', avgDays: 3.9, high: 9.1, medium: 4.6, low: 1.8 },
    { month: 'May', avgDays: 4.1, high: 4.2, medium: 8.5, low: 3.9 },
    { month: 'Jun', avgDays: 5.2, high: 7.6, medium: 2.8, low: 6.7 },
    { month: 'Jul', avgDays: 4.8, high: 3.5, medium: 6.9, low: 5.2 },
    { month: 'Aug', avgDays: 3.6, high: 8.4, medium: 4.1, low: 2.5 },
    { month: 'Sep', avgDays: 4.3, high: 5.9, medium: 9.2, low: 7.1 },
    { month: 'Oct', avgDays: 3.7, high: 6.3, medium: 3.5, low: 3.8 },
    { month: 'Nov', avgDays: 4.0, high: 9.3, medium: 5.7, low: 1.9 },
    { month: 'Dec', avgDays: 3.5, high: 4.8, medium: 7.3, low: 4.6 },
];
