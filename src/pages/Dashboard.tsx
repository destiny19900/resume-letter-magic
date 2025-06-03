import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Plus, User, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [coverLetters, setCoverLetters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Success",
        description: "Successfully signed out!",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchCoverLetters = async () => {
      const { data, error } = await supabase
        .from('cover_letters')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      setCoverLetters(data || []);
      setLoading(false);
    };
    if (user?.id) fetchCoverLetters();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">CoverCraft</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigate("/profile")}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Create and manage your cover letters</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card 
            className="p-6 border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => navigate("/create-cover-letter")}
          >
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Plus className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">New Cover Letter</h3>
                <p className="text-gray-600">Create a new cover letter</p>
              </div>
            </div>
          </Card>

          <Card 
            className="p-6 border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => navigate("/cover-letters")}
          >
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">My Documents</h3>
                <p className="text-gray-600">View saved cover letters</p>
              </div>
            </div>
          </Card>

          <Card 
            className="p-6 border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => navigate("/profile")}
          >
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Update Profile</h3>
                <p className="text-gray-600">Manage your information</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Cover Letters */}
        <Card className="p-6 border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Cover Letters</h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading cover letters...</p>
            </div>
          ) : coverLetters.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">You haven't created any cover letters yet</p>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => navigate("/create-cover-letter")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Cover Letter
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coverLetters.slice(0, 6).map((letter) => (
                <Card key={letter.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/edit-cover-letter/${letter.id}`)}>
                  <div className="p-4">
                    <div className="font-semibold text-lg">{letter.title}</div>
                    <div className="text-gray-600 text-sm">{letter.company_name} {letter.position_title && `- ${letter.position_title}`}</div>
                    <div className="text-xs text-gray-400 mt-1">{new Date(letter.created_at).toLocaleDateString()}</div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
