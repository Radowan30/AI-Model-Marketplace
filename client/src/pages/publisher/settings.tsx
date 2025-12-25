import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { CURRENT_USER } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { User, Building2 } from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [bio, setBio] = useState("");

  // Track original values to detect changes
  const [originalValues, setOriginalValues] = useState({
    name: "",
    email: "",
    company: "",
    bio: ""
  });

  // Initialize form with current user data
  useEffect(() => {
    const initialValues = {
      name: CURRENT_USER.name,
      email: CURRENT_USER.email,
      company: CURRENT_USER.company || "",
      bio: CURRENT_USER.bio || ""
    };

    setName(initialValues.name);
    setEmail(initialValues.email);
    setCompany(initialValues.company);
    setBio(initialValues.bio);
    setOriginalValues(initialValues);
  }, []);

  // Check if form has been modified
  const isDirty = () => {
    return (
      name !== originalValues.name ||
      email !== originalValues.email ||
      company !== originalValues.company ||
      bio !== originalValues.bio
    );
  };

  const handleSave = () => {
    // In a real app, this would be an API call
    // For now, we'll update the CURRENT_USER object (note: this won't persist across refreshes)
    // In a real implementation, you'd store in localStorage or make an API call

    toast({
      title: "Settings Saved Successfully",
      description: "Your profile has been updated.",
    });

    // Update original values to reflect the save
    setOriginalValues({
      name,
      email,
      company,
      bio
    });
  };

  const handleCancel = () => {
    // Reset form to original values
    setName(originalValues.name);
    setEmail(originalValues.email);
    setCompany(originalValues.company);
    setBio(originalValues.bio);

    toast({
      title: "Changes Discarded",
      description: "Your settings have been reset to the last saved values.",
      variant: "default",
    });
  };

  return (
    <Layout type="dashboard">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-heading font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>

        <Separator />

        {/* Profile Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your personal information and how others see you on the platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  placeholder="e.g., Dr. Aminah Hassan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Company / Organization
              </Label>
              <Input
                id="company"
                placeholder="e.g., MIMOS Berhad"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Optional - Your company or organization name
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                className="min-h-[120px]"
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 500))}
                maxLength={500}
              />
              <p className={cn(
                "text-xs text-right",
                bio.length > 450 ? "text-destructive" : "text-muted-foreground"
              )}>
                {bio.length} / 500 characters
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={!isDirty()}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isDirty() || !name.trim() || !email.trim()}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Layout>
  );
}
