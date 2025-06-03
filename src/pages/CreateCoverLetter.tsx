import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, ArrowLeft, Loader, Upload } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";

const CreateCoverLetter = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    companyName: "",
    positionTitle: "",
    jobDescription: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [generatedContent, setGeneratedContent] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data } = await supabase.from('user_profiles').select('*').eq('user_id', user?.id).single();
      setUserProfile(data);
    };
    if (user?.id) fetchUserProfile();
  }, [user]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCvFile(file);
    }
  };

  const handleGenerate = async () => {
    if (!formData.jobDescription || (!userProfile?.cv_content && !cvFile)) {
      toast({
        title: "Missing Information",
        description: "Please provide both a job description and upload your CV.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let cvContent = userProfile?.cv_content;
      if (!cvContent && cvFile) {
        cvContent = await cvFile.text();
      }

      // Get user info from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      const combinedProfile = {
        ...userProfile,
        ...profile,
      };

      // Call the edge function to generate cover letter
      const { data, error } = await supabase.functions.invoke('generate-cover-letter', {
        body: {
          jobDescription: formData.jobDescription,
          cvContent,
          companyName: formData.companyName,
          positionTitle: formData.positionTitle,
          userProfile: combinedProfile,
        },
      });

      if (error) throw error;

      setGeneratedContent(data.coverLetterContent);
      toast({
        title: "Success",
        description: "Cover letter generated successfully!",
      });
    } catch (error) {
      console.error('Error generating cover letter:', error);
      toast({
        title: "Error",
        description: "Failed to generate cover letter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedContent || !formData.title) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and generate content first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('cover_letters')
        .insert({
          user_id: user?.id,
          title: formData.title,
          content: generatedContent,
          job_description: formData.jobDescription,
          company_name: formData.companyName,
          position_title: formData.positionTitle,
        });

      if (error) throw error;

      // Upload CV if provided
      if (cvFile) {
        const fileName = `${user?.id}/${Date.now()}_${cvFile.name}`;
        await supabase.storage
          .from('cv-files')
          .upload(fileName, cvFile);

        // Update user profile with CV info
        await supabase
          .from('user_profiles')
          .upsert({
            user_id: user?.id,
            cv_filename: cvFile.name,
            cv_content: await cvFile.text(),
          });
      }

      toast({
        title: "Success",
        description: "Cover letter saved successfully!",
      });
      navigate("/dashboard");
    } catch (error) {
      console.error('Error saving cover letter:', error);
      toast({
        title: "Error",
        description: "Failed to save cover letter. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;
    let y = margin;
    doc.setFont('helvetica', '');
    doc.setFontSize(18);
    doc.text(formData.title || 'Cover Letter', margin, y);
    y += 30;
    doc.setFontSize(12);
    // Split the generated content into paragraphs for better formatting
    const paragraphs = generatedContent.split(/\n{2,}/);
    paragraphs.forEach((para) => {
      const lines = doc.splitTextToSize(para.trim(), 500);
      doc.text(lines, margin, y);
      y += lines.length * 18 + 10;
    });
    doc.save(`${formData.title || 'cover-letter'}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Create Cover Letter</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>Cover Letter Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Cover Letter Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Software Developer at TechCorp"
                />
              </div>

              <div>
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Company name"
                />
              </div>

              <div>
                <Label htmlFor="position">Position Title</Label>
                <Input
                  id="position"
                  value={formData.positionTitle}
                  onChange={(e) => setFormData({ ...formData, positionTitle: e.target.value })}
                  placeholder="Job title"
                />
              </div>

              {!userProfile?.cv_content && (
                <div>
                  <Label htmlFor="cv-upload">Upload Your CV/Resume</Label>
                  <div className="mt-2">
                    <input
                      id="cv-upload"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('cv-upload')?.click()}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {cvFile ? cvFile.name : "Choose CV File"}
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="job-description">Job Description</Label>
                <Textarea
                  id="job-description"
                  value={formData.jobDescription}
                  onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                  placeholder="Paste the job description here..."
                  className="min-h-[200px]"
                />
              </div>

              <Button onClick={handleGenerate} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Cover Letter"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Content */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Cover Letter</CardTitle>
            </CardHeader>
            <CardContent>
              {generatedContent ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Textarea
                      value={generatedContent}
                      onChange={(e) => setGeneratedContent(e.target.value)}
                      className="min-h-[400px] pr-10"
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 p-2 rounded hover:bg-gray-100"
                      onClick={() => { navigator.clipboard.writeText(generatedContent); toast({ title: 'Copied!', description: 'Cover letter copied to clipboard.' }); }}
                      aria-label="Copy to clipboard"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm0 0v2a2 2 0 0 0 2 2h6" /></svg>
                    </button>
                  </div>
                  <Button onClick={handleSave} className="w-full">
                    Save Cover Letter
                  </Button>
                  <Button onClick={handleDownloadPDF} className="w-full mt-2">Download as PDF</Button>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Your generated cover letter will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CreateCoverLetter;
