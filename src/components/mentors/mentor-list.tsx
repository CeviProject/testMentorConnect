import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMentors } from "@/lib/api";
import { User } from "@/types";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const domains = [
  "Software Development",
  "Data Science",
  "UX/UI Design",
  "Product Management",
  "Marketing",
  "Business Strategy",
  "Career Development",
  "Leadership",
];

export function MentorList() {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<User[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("");

  useEffect(() => {
    fetchMentors();
  }, []);

  useEffect(() => {
    filterMentors();
  }, [searchTerm, selectedDomain, mentors]);

  const fetchMentors = async () => {
    try {
      setIsLoading(true);
      const data = await getMentors();
      setMentors(data);
      setFilteredMentors(data);
    } catch (error) {
      console.error("Error fetching mentors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterMentors = () => {
    let filtered = [...mentors];

    if (searchTerm) {
      filtered = filtered.filter(
        (mentor) =>
          mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mentor.bio?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedDomain) {
      filtered = filtered.filter((mentor) =>
        mentor.domains?.includes(selectedDomain),
      );
    }

    setFilteredMentors(filtered);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Find a Mentor</h2>
        <p className="text-muted-foreground">
          Browse our community of expert mentors
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by name or bio"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <Select value={selectedDomain} onValueChange={setSelectedDomain}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by domain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Domains</SelectItem>
              {domains.map((domain) => (
                <SelectItem key={domain} value={domain}>
                  {domain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">Loading...</div>
      ) : filteredMentors.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No mentors found</h3>
          <p className="text-muted-foreground mt-2">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMentors.map((mentor) => (
            <Card key={mentor.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={mentor.avatar} alt={mentor.name} />
                    <AvatarFallback>{mentor.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{mentor.name}</CardTitle>
                    <CardDescription>
                      {mentor.hourlyRate
                        ? `$${mentor.hourlyRate}/hour`
                        : "Rate not specified"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm line-clamp-3">
                  {mentor.bio || "No bio available"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {mentor.domains?.map((domain) => (
                    <Badge key={domain} variant="secondary">
                      {domain}
                    </Badge>
                  )) || (
                    <span className="text-xs text-muted-foreground">
                      No domains specified
                    </span>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  onClick={() => navigate(`/mentors/${mentor.id}`)}
                >
                  View Profile
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
