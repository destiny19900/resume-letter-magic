import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CoverLetter {
  id: string;
  title: string;
  company_name: string;
  position_title: string;
  content: string;
  created_at: string;
}

const CoverLetters = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoverLetters();
  }, [user]);

  const fetchCoverLetters = async () => {
    try {
      const { data, error } = await supabase
        .from('cover_letters')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoverLetters(data || []);
    } catch (error) {
      console.error('Error fetching cover letters:', error);
      toast({
        title: "Error",
        description: "Failed to load cover letters.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cover_letters')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCoverLetters(coverLetters.filter(letter => letter.id !== id));
      toast({
        title: "Success",
        description: "Cover letter deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting cover letter:', error);
      toast({
        title: "Error",
        description: "Failed to delete cover letter.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cover letters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-2">
                <FileText className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">My Cover Letters</span>
              </div>
            </div>
            <Button onClick={() => navigate("/create-cover-letter")}>
              <Plus className="w-4 h-4 mr-2" />
              New Cover Letter
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {coverLetters.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No cover letters yet</h3>
              <p className="text-gray-600 mb-4">Create your first cover letter to get started</p>
              <Button onClick={() => navigate("/create-cover-letter")}>
                <Plus className="w-4 h-4 mr-2" />
                Create Cover Letter
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coverLetters.map((letter) => (
              <Card key={letter.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/cover-letter/${letter.id}`)}>
                <CardHeader>
                  <CardTitle className="text-lg">{letter.title}</CardTitle>
                  <div className="text-sm text-gray-600">
                    {letter.company_name && <p>{letter.company_name}</p>}
                    {letter.position_title && <p>{letter.position_title}</p>}
                    <p>{new Date(letter.created_at).toLocaleDateString()}</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                    {letter.content.substring(0, 150)}...
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={e => { e.stopPropagation(); handleDelete(letter.id); }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(letter.content); toast({ title: 'Copied!', description: 'Cover letter copied to clipboard.' }); }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm0 0v2a2 2 0 0 0 2 2h6" /></svg>
                      Copy
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CoverLetters;
