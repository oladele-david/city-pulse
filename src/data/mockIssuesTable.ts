export interface IssueTableRow {
    id: string;
    issueId: string;
    type: string;
    location: string;
    severity: "low" | "medium" | "high";
    status: "open" | "in_progress" | "resolved";
    confidence: number;
    lastUpdated: string;
    reportsCount: number;
}

const generateIssueTableData = (): IssueTableRow[] => {
    const locations = [
        "Downtown Dubai", "Dubai Marina", "Deira", "Al Quoz", "Jumeirah",
        "Business Bay", "JBR", "Dubai Hills", "Arabian Ranches", "Motor City"
    ];

    // PRD-aligned terms
    const types = ["Road Issue", "Drainage", "Lighting", "Noise", "Heat Stress"];
    const severities: ("low" | "medium" | "high")[] = ["low", "medium", "high"];
    const statuses: ("open" | "in_progress" | "resolved")[] = ["open", "in_progress", "resolved"];

    const issues: IssueTableRow[] = [];

    for (let i = 1; i <= 50; i++) {
        const randomDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

        issues.push({
            id: `issue-${i}`,
            issueId: `#${367280 + i}`,
            type: types[Math.floor(Math.random() * types.length)],
            location: locations[Math.floor(Math.random() * locations.length)],
            severity: severities[Math.floor(Math.random() * severities.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            confidence: Math.round((0.5 + Math.random() * 0.5) * 100), // 50-100%
            lastUpdated: randomDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            reportsCount: Math.floor(Math.random() * 10) + 1
        });
    }

    return issues.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
};

export const mockIssuesTable = generateIssueTableData();
