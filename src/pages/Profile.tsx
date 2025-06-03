import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, ArrowLeft, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.js",
  import.meta.url
).toString();

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    address: "",
    phone_number: "",
    cv_filename: "",
    cv_content: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvFilename, setCvFilename] = useState(profile.cv_filename || "");
  const [cvUploading, setCvUploading] = useState(false);
  const [cvContent, setCvContent] = useState(profile.cv_content || "");

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      // Get profile from profiles table
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      // Get user profile from user_profiles table
      const { data: userProfileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      setProfile({
        full_name: profileData?.full_name || "",
        email: profileData?.email || user?.email || "",
        address: userProfileData?.address || "",
        phone_number: userProfileData?.phone_number || "",
        cv_filename: userProfileData?.cv_filename || "",
        cv_content: userProfileData?.cv_content || "",
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Fetch latest cv_content if missing
      let cv_content = profile.cv_content;
      let cv_filename = profile.cv_filename;
      if (!cv_content) {
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('cv_content, cv_filename')
          .eq('user_id', user?.id)
          .single();
        cv_content = userProfile?.cv_content || "";
        cv_filename = userProfile?.cv_filename || "";
      }

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          full_name: profile.full_name,
          email: profile.email,
        });

      if (profileError) throw profileError;

      // Update user_profiles table
      const { error: userProfileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user?.id,
          address: profile.address,
          phone_number: profile.phone_number,
          cv_filename,
          cv_content,
        }, { onConflict: 'user_id' });

      if (userProfileError) {
        toast({
          title: "Error",
          description: userProfileError.message || "Failed to update profile.",
          variant: "destructive",
        });
        throw userProfileError;
      }

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      if (!error?.message?.includes('already shown')) {
        toast({
          title: "Error",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setCvUploading(true);
    setCvFile(file);
    setCvFilename(file.name);
    let text = "";
    if (file.type === "application/pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(" ") + " ";
      }
    } else if (file.name.endsWith(".docx")) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      text = result.value;
    } else {
      text = await file.text();
    }
    setCvContent(text);
    // Upload file to Supabase Storage
    const fileName = `${user?.id}/${Date.now()}_${file.name}`;
    await supabase.storage.from('cv-files').upload(fileName, file);
    // Save to user_profiles
    const { error: userProfileError } = await supabase.from('user_profiles').upsert({
      user_id: user?.id,
      cv_filename: file.name,
      cv_content: text,
    }, { onConflict: 'user_id' });
    if (userProfileError) {
      toast({
        title: "Error",
        description: userProfileError.message || "Failed to upload resume.",
        variant: "destructive",
      });
      setCvUploading(false);
      return;
    }
    setProfile((prev) => ({
      ...prev,
      cv_filename: file.name,
      cv_content: text,
    }));
    setCvUploading(false);
    toast({ title: "Success", description: "Resume uploaded and parsed!" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button variant='outline' onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-2">
              <User className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Profile</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  value={profile.phone_number}
                  onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  placeholder="Enter your address"
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="cv-upload">Resume (CV)</Label>
                {cvFilename ? (
                  <div className="mb-2">Uploaded: {cvFilename}</div>
                ) : (
                  <>
                    <input
                      id="cv-upload"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleResumeUpload}
                      className="hidden"
                    />
                    <Button
                      variant='outline'
                      onClick={() => document.getElementById('cv-upload')?.click()}
                      className="w-full"
                      disabled={cvUploading}
                    >
                      {cvUploading ? "Uploading..." : "Upload Resume"}
                    </Button>
                  </>
                )}
              </div>

              <Button onClick={handleSave} disabled={loading} className="w-full">
                {loading ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
