import { useState } from "react";
import { cn } from "@/lib/utils";
import { mockIssuesTable, IssueTableRow } from "@/data/mockIssuesTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
    SearchIcon,
    FilterHorizontalIcon,
    ArrowLeft01Icon,
    ArrowRight01Icon,
    Tick02Icon,
    File02Icon,
    Download01Icon
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { StatusUpdateModal } from "@/components/dashboard/StatusUpdateModal";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 15;

const Issues = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

    // Local state for issues to allow inline updates
    const [issues, setIssues] = useState<IssueTableRow[]>(mockIssuesTable);

    // Filter issues
    const filteredIssues = issues.filter(issue => {
        const matchesSearch = issue.issueId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            issue.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            issue.type.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || issue.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Pagination
    const totalPages = Math.ceil(filteredIssues.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentIssues = filteredIssues.slice(startIndex, endIndex);

    // Selection Handlers
    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIssues(currentIssues.map(issue => issue.id));
        } else {
            setSelectedIssues([]);
        }
    };

    const handleSelectIssue = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIssues(prev => [...prev, id]);
        } else {
            setSelectedIssues(prev => prev.filter(itemId => itemId !== id));
        }
    };

    // Bulk Action Handler
    const handleBulkUpdate = () => {
        const updatedIssues = issues.map(issue => {
            if (selectedIssues.includes(issue.id)) {
                return { ...issue, status: "in_progress" as const };
            }
            return issue;
        });
        setIssues(updatedIssues);
        setSelectedIssues([]);
        setIsBulkModalOpen(false);
        toast.success(`${selectedIssues.length} issues marked as In Progress`);
    };

    // Inline Status Update Handler
    const handleInlineStatusChange = (id: string, newStatus: IssueTableRow['status']) => {
        const updatedIssues = issues.map(issue => {
            if (issue.id === id) {
                return { ...issue, status: newStatus };
            }
            return issue;
        });
        setIssues(updatedIssues);
        toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "high": return "text-red-700 bg-red-50 border-red-200";
            case "medium": return "text-orange-700 bg-orange-50 border-orange-200";
            case "low": return "text-yellow-700 bg-yellow-50 border-yellow-200";
            default: return "text-gray-700 bg-gray-50 border-gray-200";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "resolved": return "text-emerald-700 bg-emerald-50 border-emerald-200";
            case "in_progress": return "text-orange-700 bg-orange-50 border-orange-200";
            case "open": return "text-red-700 bg-red-50 border-red-200";
            default: return "text-gray-700 bg-gray-50 border-gray-200";
        }
    };

    return (
        <div className="space-y-6">
            <StatusUpdateModal
                isOpen={isBulkModalOpen}
                onClose={() => setIsBulkModalOpen(false)}
                onConfirm={handleBulkUpdate}
                count={selectedIssues.length}
            />

            {/* Main Card Container */}
            <div className="rounded-2xl border bg-card shadow-sm overflow-hidden bg-white">

                {/* Embedded Header with Controls */}
                <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b bg-white">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-lg font-semibold tracking-tight text-foreground">Issues</h1>
                            <p className="text-xs text-muted-foreground mr-4">Manage civic issues</p>
                        </div>
                        {selectedIssues.length > 0 && (() => {
                            const allInProgress = selectedIssues.every(id => {
                                const issue = issues.find(i => i.id === id);
                                return issue?.status === 'in_progress';
                            });
                            return (
                                <Button
                                    size="sm"
                                    onClick={() => setIsBulkModalOpen(true)}
                                    disabled={allInProgress}
                                    className="h-8 gap-2 text-xs animate-in fade-in zoom-in duration-200 rounded-2xl"
                                >
                                    <HugeiconsIcon icon={Tick02Icon} className="w-3.5 h-3.5" />
                                    {allInProgress ? `Already In Progress` : `Mark ${selectedIssues.length} In Progress`}
                                </Button>
                            );
                        })()}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="relative w-[240px]">
                            <HugeiconsIcon icon={SearchIcon} className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-8 text-xs rounded-2xl bg-background border-input focus-visible:ring-0"
                            />
                        </div>

                        {/* Filter */}
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-auto min-w-[90px] h-8 text-xs rounded-2xl gap-2 px-3 border-input bg-background font-medium focus:ring-0 focus:ring-offset-0">
                                <HugeiconsIcon icon={FilterHorizontalIcon} className="w-3.5 h-3.5" />
                                <span>Filter</span>
                            </SelectTrigger>
                            <SelectContent align="end">
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Export Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-8 text-xs rounded-2xl gap-2 px-3 border-input bg-background font-medium focus-visible:ring-0">
                                    <span>Export</span>
                                    <HugeiconsIcon icon={ArrowRight01Icon} className="w-3.5 h-3.5 rotate-90" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem className="gap-2 cursor-pointer">
                                    <HugeiconsIcon icon={File02Icon} className="w-4 h-4" />
                                    Export as CSV
                                </DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 cursor-pointer">
                                    <HugeiconsIcon icon={Download01Icon} className="w-4 h-4" />
                                    Export as PDF
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#fbfcff] border-b">
                            <tr>
                                <th className="py-3 px-4 w-[40px]">
                                    <Checkbox
                                        checked={currentIssues.length > 0 && selectedIssues.length === currentIssues.length}
                                        onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                                    />
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Issue Type</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</th>
                                <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reports</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Severity</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Confidence</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Updated</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentIssues.map((issue) => (
                                <tr
                                    key={issue.id}
                                    className="border-b last:border-0 hover:bg-muted/5 transition-colors group"
                                >
                                    <td className="py-3 px-4">
                                        <Checkbox
                                            checked={selectedIssues.includes(issue.id)}
                                            onCheckedChange={(checked) => handleSelectIssue(issue.id, checked as boolean)}
                                        />
                                    </td>
                                    <td className="py-3 px-4 text-sm font-medium text-foreground">{issue.type}</td>
                                    <td className="py-3 px-4 text-sm text-muted-foreground">{issue.location}</td>
                                    <td className="py-3 px-4 text-sm text-muted-foreground text-center">{issue.reportsCount}</td>
                                    <td className="py-3 px-4 text-left">
                                        <span className={cn(
                                            "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize",
                                            getSeverityColor(issue.severity)
                                        )}>
                                            {issue.severity}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-left">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className={cn(
                                                    "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize cursor-pointer hover:opacity-80 transition-opacity focus:outline-none",
                                                    getStatusColor(issue.status)
                                                )}>
                                                    {issue.status === "in_progress" ? "In Progress" : issue.status}
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start">
                                                <DropdownMenuItem onClick={() => handleInlineStatusChange(issue.id, 'open')}>Open</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleInlineStatusChange(issue.id, 'in_progress')}>In Progress</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleInlineStatusChange(issue.id, 'resolved')}>Resolved</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className="text-xs text-muted-foreground font-medium">{issue.confidence}%</span>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-muted-foreground">{issue.lastUpdated}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-4 py-3 border-t bg-white">
                    <p className="text-xs text-muted-foreground">
                        Showing <span className="font-medium text-foreground">{startIndex + 1}</span> to <span className="font-medium text-foreground">{Math.min(endIndex, filteredIssues.length)}</span> of <span className="font-medium text-foreground">{filteredIssues.length}</span> results
                    </p>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-2xl"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                        >
                            <HugeiconsIcon icon={ArrowLeft01Icon} className="w-3.5 h-3.5" />
                        </Button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setCurrentPage(page)}
                                    className={cn(
                                        "h-7 w-7 p-0 font-normal rounded-2xl text-xs",
                                        currentPage === page ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted-foreground hover:bg-muted/50"
                                    )}
                                >
                                    {page}
                                </Button>
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 rounded-2xl"
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                        >
                            <HugeiconsIcon icon={ArrowRight01Icon} className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Issues;
