import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  "software-development",
  "data-science",
  "ux-ui-design",
  "product-management",
  "marketing",
  "business-strategy",
  "career-development",
  "leadership",
  "machine-learning",
  "blockchain",
  "mobile-development",
  "devops",
  "cloud-computing",
  "cybersecurity",
  "artificial-intelligence",
];

const domainLabels: Record<string, string> = {
  "software-development": "Software Development",
  "data-science": "Data Science",
  "ux-ui-design": "UX/UI Design",
  "product-management": "Product Management",
  marketing: "Marketing",
  "business-strategy": "Business Strategy",
  "career-development": "Career Development",
  leadership: "Leadership",
  "machine-learning": "Machine Learning",
  blockchain: "Blockchain",
  "mobile-development": "Mobile Development",
  devops: "DevOps",
  "cloud-computing": "Cloud Computing",
  cybersecurity: "Cybersecurity",
  "artificial-intelligence": "Artificial Intelligence",
};

export function MentorList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mentors, setMentors] = useState<User[]>([]);
  const [filteredMentors, setFilteredMentors] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("all");

  useEffect(() => {
    fetchMentors();
  }, []);

  // Fetch when domain changes
  useEffect(() => {
    fetchMentors();
  }, [selectedDomain]);

  // Force fetch on component mount
  useEffect(() => {
    console.log("MentorList component mounted");
    fetchMentors();
  }, []);

  useEffect(() => {
    filterMentors();
  }, [searchTerm, selectedDomain, mentors]);

  // Set the domain from URL parameter if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const domainParam = params.get("domain");
    if (domainParam) {
      setSelectedDomain(domainParam);
    }
  }, []);

  const fetchMentors = async () => {
    try {
      setIsLoading(true);
      // Try to fetch from API first
      try {
        const data = await getMentors(selectedDomain || undefined);
        console.log("Fetched mentors:", data);
        if (data && data.length > 0) {
          setMentors(data);
          setFilteredMentors(data);
          return;
        }
      } catch (apiError) {
        console.error("API error, falling back to mock data:", apiError);
      }

      // Fallback to mock data
      const mockMentors = [
        {
          id: "mentor-1",
          email: "john@example.com",
          name: "John Smith",
          role: "mentor",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
          bio: "Senior software engineer with 10+ years of experience in web development, cloud architecture, and team leadership.",
          domains: ["software-development", "leadership", "career-development"],
          hourlyRate: 75,
          experienceYears: 10,
        },
        {
          id: "mentor-2",
          email: "sarah@example.com",
          name: "Sarah Johnson",
          role: "mentor",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
          bio: "Data scientist specializing in machine learning and AI applications. Former research lead at Google.",
          domains: ["data-science", "software-development"],
          hourlyRate: 90,
          experienceYears: 8,
        },
        {
          id: "mentor-3",
          email: "michael@example.com",
          name: "Michael Chen",
          role: "mentor",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
          bio: "Product manager with experience at startups and Fortune 500 companies. Passionate about user-centered design.",
          domains: ["product-management", "ux-ui-design", "business-strategy"],
          hourlyRate: 65,
          experienceYears: 6,
        },
        {
          id: "mentor-4",
          email: "lisa@example.com",
          name: "Lisa Rodriguez",
          role: "mentor",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisa",
          bio: "Marketing executive with expertise in digital marketing, brand strategy, and growth hacking.",
          domains: ["marketing", "business-strategy"],
          hourlyRate: 70,
          experienceYears: 12,
        },
      ];

      setMentors(mockMentors);
      setFilteredMentors(mockMentors);
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

    if (selectedDomain && selectedDomain !== "all") {
      filtered = filtered.filter((mentor) =>
        mentor.domains?.includes(selectedDomain),
      );
    }

    // Sort by availability count (mentors with more available slots first)
    filtered.sort((a, b) => {
      // Use the availabilityCount from the database if available
      const aAvailability = a.availabilityCount || 0;
      const bAvailability = b.availabilityCount || 0;

      // If availability counts are equal, sort by hourly rate
      if (bAvailability === aAvailability) {
        return (a.hourlyRate || 0) - (b.hourlyRate || 0);
      }

      return bAvailability - aAvailability;
    });

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
              <SelectItem value="all">All Domains</SelectItem>
              {domains.map((domain) => (
                <SelectItem key={domain} value={domain}>
                  {domainLabels[domain] || domain}
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
                      {domainLabels[domain] || domain}
                    </Badge>
                  )) || (
                    <span className="text-xs text-muted-foreground">
                      No domains specified
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  <Badge
                    variant={mentor.availabilityCount ? "success" : "outline"}
                    className={
                      mentor.availabilityCount
                        ? "bg-green-100 text-green-800"
                        : ""
                    }
                  >
                    {mentor.availabilityCount
                      ? `${mentor.availabilityCount} available slots`
                      : "No available slots"}
                  </Badge>
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
