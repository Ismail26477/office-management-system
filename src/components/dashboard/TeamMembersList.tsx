"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Phone } from "lucide-react";
import { fetchEmployees } from "@/api/employees";

const statusColors = {
  online: "bg-success",
  away: "bg-warning",
  offline: "bg-muted-foreground",
};

interface TeamMember {
  _id: string;
  name: string;
  department: string;
  status: string;
  avatar?: string;
}

export function TeamMembersList() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        setIsLoading(true);
        console.log("[v0] Loading team members from database...");
        const employees = await fetchEmployees();
        console.log("[v0] Employees fetched:", employees);

        // Get first 5 employees for the team members list
        const activeMembers = employees.slice(0, 5).map((emp: any) => ({
          _id: emp._id || emp.id,
          name: emp.name || "Unknown",
          department: emp.department || "N/A",
          status: emp.status === "active" ? "online" : emp.status === "on_leave" ? "away" : "offline",
          avatar: emp.avatar,
        }));

        console.log("[v0] Active members prepared:", activeMembers);
        setTeamMembers(activeMembers);
        setError(null);
      } catch (err) {
        console.error("[v0] Error loading team members:", err);
        setError("Failed to load team members");
      } finally {
        setIsLoading(false);
      }
    };

    loadTeamMembers();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border/50 shadow-sm">
        <div className="p-5 border-b border-border/50">
          <h3 className="font-semibold text-foreground">Team Members</h3>
          <p className="text-sm text-muted-foreground">Active team members today</p>
        </div>
        <div className="p-8 text-center text-muted-foreground">Loading team members...</div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-sm">
      <div className="p-5 border-b border-border/50">
        <h3 className="font-semibold text-foreground">Team Members</h3>
        <p className="text-sm text-muted-foreground">Active team members today</p>
      </div>
      <div className="divide-y divide-border/50">
        {error ? (
          <div className="p-8 text-center text-muted-foreground">{error}</div>
        ) : teamMembers.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No team members found</div>
        ) : (
          teamMembers.map((member) => (
            <div key={member._id} className="p-4 flex items-center gap-3 hover:bg-accent/50 transition-colors">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member.avatar || "/placeholder.svg"} />
                  <AvatarFallback>{member.name.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <span
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card ${statusColors[member.status as keyof typeof statusColors]}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{member.name}</p>
                <p className="text-xs text-muted-foreground truncate">{member.department}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <MessageSquare className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-4">
        <Button variant="ghost" className="w-full text-primary hover:text-primary hover:bg-primary/5">
          View All Members
        </Button>
      </div>
    </div>
  );
}
