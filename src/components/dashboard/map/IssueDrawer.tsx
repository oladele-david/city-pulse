import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Cancel01Icon,
    CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Issue } from "@/data/mockIssues";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { AiAnalysisModal } from "./drawer/AiAnalysisModal";
import { IssueHeader } from "./drawer/IssueHeader";
import { StatusSelector } from "./drawer/StatusSelector";
import { IssueTimeline } from "./drawer/IssueTimeline";
import { AiAnalysisSection } from "./drawer/AiAnalysisSection";

interface IssueDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    issue: Issue | null;
}

interface AiAnalysis {
    rootCause: string;
    recommendation: string;
}

export const IssueDrawer = ({ isOpen, onClose, issue }: IssueDrawerProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<string>("");
    const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis | null>(null);
    const [isGeneratingAi, setIsGeneratingAi] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);

    // Simulate loading and state sync when issue changes
    useEffect(() => {
        if (issue) {
            setIsLoading(true);
            setCurrentStatus(issue.status);
            setAiAnalysis(null); // Reset AI analysis when new issue loads
            // Simulate network delay for "loading" fresh data
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [issue]);

    const handleStatusChange = (value: string) => {
        setCurrentStatus(value);
        toast.success(`Status updated to ${value === 'in_progress' ? 'In Progress' : value.charAt(0).toUpperCase() + value.slice(1)}`);
    };

    const handleMarkResolved = () => {
        setCurrentStatus("resolved");
        toast.success("Issue marked as resolved");
    };

    const generateAiAnalysis = async () => {
        if (!issue) return;

        setIsGeneratingAi(true);

        try {
            const rawApiKey = import.meta.env.VITE_GROQ_API;
            const apiKey = rawApiKey?.trim();

            if (!apiKey) {
                // Return mock data if API key is missing for demo purposes
                setTimeout(() => {
                    setAiAnalysis({
                        rootCause: "Infrastructure stress analysis indicates a 92% probability of sub-surface degradation due to thermal expansion cycles common in this region's climate.",
                        recommendation: "Immediate dispatch of a Geo-Technical team for ground-penetrating radar survey. Recommend prioritizing reinforcement of primary supporting structures within 72 hours."
                    });
                    setIsGeneratingAi(false);
                    toast.info("Showing predictive simulation (API key missing)");
                }, 2000);
                return;
            }

            const prompt = `You are a municipal infrastructure analyst. Analyze this incident:
Incident Type: ${issue.type}
Severity: ${issue.severity}
Location: ${issue.location_name}
Active Reports: ${issue.reports_count}
Title: ${issue.title}
Description: ${issue.description}

You must return a JSON object with exactly two keys:
1. "rootCause": (string) A 2-sentence technical analysis of the likely cause.
2. "recommendation": (string) A 2-sentence strategic action plan.

Respond ONLY with the JSON object.`;

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a highly professional structural engineer and municipal analyst for CityPulse GovOps. You provide data-driven insights in valid JSON format only.'
                        },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.1,
                    response_format: { type: "json_object" }
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Groq API Error Response:', errorData);
                throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
            }

            const data = await response.json();
            const content = data.choices[0]?.message?.content;

            if (!content) throw new Error('No content received from AI');

            const result = JSON.parse(content);

            setAiAnalysis({
                rootCause: result.rootCause || "Analysis inconclusive due to data gaps.",
                recommendation: result.recommendation || "Maintain standard observation protocols."
            });

            toast.success("AI Analysis Complete");
        } catch (error) {
            console.error('AI Error:', error);
            toast.error("AI Generation failed. Check console for details.");
        } finally {
            setIsGeneratingAi(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="absolute top-4 bottom-4 right-4 w-96 bg-background/95 backdrop-blur-md shadow-2xl rounded-xl z-20 border border-border/10 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 ease-out">
                {/* Header */}
                <div className="p-4 border-b flex justify-between items-center bg-muted/30">
                    <h3 className="font-semibold">Issue Details</h3>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background/50" onClick={onClose}>
                        <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar hover:[&::-webkit-scrollbar-thumb]:bg-border/50">
                    {issue ? (
                        isLoading ? (
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <Skeleton className="h-5 w-24 rounded-full" />
                                    <Skeleton className="h-5 w-20 rounded-full" />
                                </div>
                                <Skeleton className="h-8 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <div className="space-y-2 pt-4">
                                    <Skeleton className="h-10 w-full" />
                                </div>
                                <div className="space-y-2 pt-2">
                                    <Skeleton className="h-32 w-full" />
                                </div>
                            </div>
                        ) : (
                            <>
                                <IssueHeader issue={issue} />

                                <StatusSelector
                                    currentStatus={currentStatus}
                                    onStatusChange={handleStatusChange}
                                />

                                <IssueTimeline issue={issue} />

                                <AiAnalysisSection
                                    aiAnalysis={aiAnalysis}
                                    isGenerating={isGeneratingAi}
                                    onGenerate={generateAiAnalysis}
                                    onViewFull={() => setIsAiModalOpen(true)}
                                />
                            </>
                        )
                    ) : (
                        <div className="flex h-full items-center justify-center text-center text-muted-foreground p-8">
                            <p>Select a marker on the map to view details</p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {issue && !isLoading && (
                    <div className="p-4 border-t bg-muted/30">
                        <Button
                            className="w-full h-12 gap-2 rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95 text-white"
                            onClick={handleMarkResolved}
                            disabled={currentStatus === "resolved"}
                        >
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-5 h-5" />
                            <span className="font-semibold">
                                {currentStatus === "resolved" ? "Case Resolved" : "Acknowledge & Resolve"}
                            </span>
                        </Button>
                    </div>
                )}
            </div>

            <AiAnalysisModal
                isOpen={isAiModalOpen}
                onClose={() => setIsAiModalOpen(false)}
                analysis={aiAnalysis}
                isGenerating={isGeneratingAi}
            />
        </>
    );
};