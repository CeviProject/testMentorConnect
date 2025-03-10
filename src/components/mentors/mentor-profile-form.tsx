import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updateMentorProfile, getMentorProfile } from "@/lib/api";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";

const domains = [
  { id: "software-development", label: "Software Development" },
  { id: "data-science", label: "Data Science" },
  { id: "ux-ui-design", label: "UX/UI Design" },
  { id: "product-management", label: "Product Management" },
  { id: "marketing", label: "Marketing" },
  { id: "business-strategy", label: "Business Strategy" },
  { id: "career-development", label: "Career Development" },
  { id: "leadership", label: "Leadership" },
  { id: "machine-learning", label: "Machine Learning" },
  { id: "blockchain", label: "Blockchain" },
  { id: "mobile-development", label: "Mobile Development" },
  { id: "devops", label: "DevOps" },
  { id: "cloud-computing", label: "Cloud Computing" },
  { id: "cybersecurity", label: "Cybersecurity" },
  { id: "artificial-intelligence", label: "Artificial Intelligence" },
];

const formSchema = z.object({
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  domains: z.array(z.string()).min(1, "Select at least one domain"),
  experienceYears: z.coerce
    .number()
    .min(0, "Experience years must be a positive number"),
  hourlyRate: z.coerce
    .number()
    .min(1, "Hourly rate must be at least 1")
    .max(1000, "Hourly rate cannot exceed 1000"),
  education: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  languages: z.array(z.string()).optional(),
  socialLinks: z
    .object({
      linkedin: z.string().optional(),
      github: z.string().optional(),
      twitter: z.string().optional(),
      website: z.string().optional(),
    })
    .optional(),
});

export function MentorProfileForm() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bio: "",
      domains: [],
      experienceYears: 0,
      hourlyRate: 50,
      education: "",
      company: "",
      position: "",
      languages: [],
      socialLinks: {
        linkedin: "",
        github: "",
        twitter: "",
        website: "",
      },
    },
  });

  useEffect(() => {
    if (user) {
      fetchMentorProfile();
    }
  }, [user]);

  // Force refresh when role changes
  useEffect(() => {
    if (user?.role === "mentor") {
      fetchMentorProfile();
    }
  }, [user?.role]);

  const fetchMentorProfile = async () => {
    try {
      setIsLoading(true);
      if (user) {
        const profile = await getMentorProfile(user.id);
        if (profile) {
          form.reset({
            bio: profile.bio || "",
            domains: profile.domains || [],
            experienceYears: profile.experienceYears || 0,
            hourlyRate: profile.hourlyRate || 50,
            education: profile.education || "",
            company: profile.company || "",
            position: profile.position || "",
            languages: profile.languages || [],
            socialLinks: profile.socialLinks || {
              linkedin: "",
              github: "",
              twitter: "",
              website: "",
            },
          });
        }
      }
    } catch (error) {
      console.error("Error fetching mentor profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      if (user) {
        await updateMentorProfile(user.id, {
          bio: values.bio,
          domains: values.domains,
          experienceYears: values.experienceYears,
          hourlyRate: values.hourlyRate,
          education: values.education,
          company: values.company,
          position: values.position,
          languages: values.languages,
          socialLinks: values.socialLinks,
        });
        setSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Mentor Profile</CardTitle>
        <CardDescription>
          Set up your mentor profile to attract mentees
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <AlertDescription>Profile updated successfully!</AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell mentees about your experience and expertise..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This will be displayed on your public profile
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="domains"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Expertise Domains</FormLabel>
                    <FormDescription>
                      Select the areas where you can provide mentorship
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {domains.map((domain) => (
                      <FormField
                        key={domain.id}
                        control={form.control}
                        name="domains"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={domain.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(domain.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          domain.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== domain.id,
                                          ),
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {domain.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="experienceYears"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Experience</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly Rate ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="1000" {...field} />
                    </FormControl>
                    <FormDescription>
                      Set your rate per hour for mentoring sessions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="education"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Education</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. MS Computer Science, Stanford University"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Company</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Google, Microsoft, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Position</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Senior Software Engineer"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Social Links</FormLabel>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="socialLinks.linkedin"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="LinkedIn URL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="socialLinks.github"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="GitHub URL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="socialLinks.twitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Twitter URL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="socialLinks.website"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Personal Website URL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Profile"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
