import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CreateLevyPayload, LevyRecord } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type LevyFormProps = {
  initialValue?: LevyRecord | null;
  onSubmit: (payload: CreateLevyPayload) => Promise<void>;
  onCancel?: () => void;
  submitLabel: string;
};

export function LevyForm({
  initialValue,
  onSubmit,
  onCancel,
  submitLabel,
}: LevyFormProps) {
  const [title, setTitle] = useState(initialValue?.title ?? "");
  const [description, setDescription] = useState(initialValue?.description ?? "");
  const [levyType, setLevyType] = useState<CreateLevyPayload["levyType"]>(
    initialValue?.levyType ?? "sanitation_levy",
  );
  const [amount, setAmount] = useState(String(initialValue?.amount ?? ""));
  const [dueDate, setDueDate] = useState(
    initialValue?.dueDate ? initialValue.dueDate.slice(0, 10) : "",
  );
  const [targetType, setTargetType] = useState<CreateLevyPayload["targetType"]>(
    initialValue?.targetType ?? "community",
  );
  const [selectedLgaId, setSelectedLgaId] = useState(
    initialValue?.targetLga?.id ?? initialValue?.targetCommunity?.lgaId ?? "",
  );
  const [targetCommunityId, setTargetCommunityId] = useState(
    initialValue?.targetCommunityId ?? "",
  );
  const [targetLgaId, setTargetLgaId] = useState(initialValue?.targetLgaId ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lgasQuery = useQuery({
    queryKey: ["lgas"],
    queryFn: () => api.listLgas(),
  });

  const communitiesQuery = useQuery({
    queryKey: ["communities", selectedLgaId],
    queryFn: () => api.listCommunitiesByLga(selectedLgaId),
    enabled: Boolean(selectedLgaId),
  });

  useEffect(() => {
    if (targetType === "lga") {
      setTargetCommunityId("");
      if (!targetLgaId && selectedLgaId) {
        setTargetLgaId(selectedLgaId);
      }
      return;
    }

    setTargetLgaId("");
  }, [selectedLgaId, targetLgaId, targetType]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({
        title,
        description,
        levyType,
        amount: Number(amount),
        dueDate: new Date(`${dueDate}T00:00:00.000Z`).toISOString(),
        targetType,
        targetCommunityId: targetType === "community" ? targetCommunityId : undefined,
        targetLgaId: targetType === "lga" ? targetLgaId || selectedLgaId : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="levy-title">Title</Label>
          <Input
            id="levy-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Quarterly sanitation levy"
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="levy-description">Description</Label>
          <Textarea
            id="levy-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe what this levy covers and who it applies to."
            className="min-h-28"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Levy Type</Label>
          <Select
            value={levyType}
            onValueChange={(value) =>
              setLevyType(value as CreateLevyPayload["levyType"])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select levy type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sanitation_levy">Sanitation levy</SelectItem>
              <SelectItem value="environmental_fee">Environmental fee</SelectItem>
              <SelectItem value="community_due">Community due</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="levy-amount">Amount (NGN)</Label>
          <Input
            id="levy-amount"
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="levy-due-date">Due Date</Label>
          <Input
            id="levy-due-date"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Target Type</Label>
          <Select
            value={targetType}
            onValueChange={(value) =>
              setTargetType(value as CreateLevyPayload["targetType"])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select target" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="community">Community</SelectItem>
              <SelectItem value="lga">LGA</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{targetType === "community" ? "Community LGA" : "Target LGA"}</Label>
          <Select
            value={targetType === "community" ? selectedLgaId : targetLgaId || selectedLgaId}
            onValueChange={(value) => {
              setSelectedLgaId(value);
              setTargetCommunityId("");
              if (targetType === "lga") {
                setTargetLgaId(value);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={lgasQuery.isLoading ? "Loading LGAs..." : "Select LGA"}
              />
            </SelectTrigger>
            <SelectContent>
              {(lgasQuery.data ?? []).map((lga) => (
                <SelectItem key={lga.id} value={lga.id}>
                  {lga.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {targetType === "community" && (
          <div className="space-y-2 md:col-span-2">
            <Label>Target Community</Label>
            <Select value={targetCommunityId} onValueChange={setTargetCommunityId}>
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    communitiesQuery.isLoading
                      ? "Loading communities..."
                      : "Select community"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {(communitiesQuery.data ?? []).map((community) => (
                  <SelectItem key={community.id} value={community.id}>
                    {community.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
