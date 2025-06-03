import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ArrowLeft, Edit, Download, Copy } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";

const CoverLetterDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coverLetter, setCoverLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState("");

  useEffect(() => {
    const fetchCoverLetter = async () => {
      const { data, error } = await supabase
        .from('cover_letters')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        toast({ title: 'Error', description: 'Failed to load cover letter.', variant: 'destructive' });
        setLoading(false);
        return;
      }
      setCoverLetter(data);
      setContent(data.content);
      setLoading(false);
    };
    if (id) fetchCoverLetter();
  }, [id]);

  const handleSave = async () => {
    const { error } = await supabase
      .from('cover_letters')
      .update({ content })
      .eq('id', id);
    if (error) {
      toast({ title: 'Error', description: 'Failed to update cover letter.', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Cover letter updated.' });
      setEditing(false);
      setCoverLetter({ ...coverLetter, content });
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;
    let y = margin;
    doc.setFont('helvetica', '');
    doc.setFontSize(18);
    doc.text(coverLetter.title || 'Cover Letter', margin, y);
    y += 30;
    doc.setFontSize(12);
    const paragraphs = content.split(/\n{2,}/);
    paragraphs.forEach((para) => {
      const lines = doc.splitTextToSize(para.trim(), 500);
      doc.text(lines, margin, y);
      y += lines.length * 18 + 10;
    });
    doc.save(`${coverLetter.title || 'cover-letter'}.pdf`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  if (!coverLetter) {
    return <div className="min-h-screen flex items-center justify-center">Not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4 flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-2">
            <FileText className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Cover Letter Details</span>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-6 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">{coverLetter.title}</CardTitle>
            <div className="text-gray-600 text-sm">
              {coverLetter.company_name && <p>{coverLetter.company_name}</p>}
              {coverLetter.position_title && <p>{coverLetter.position_title}</p>}
              <p>{new Date(coverLetter.created_at).toLocaleDateString()}</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <strong>Job Description:</strong>
              <div className="bg-gray-100 rounded p-2 text-sm mt-1 whitespace-pre-line">{coverLetter.job_description}</div>
            </div>
            <div className="mb-4 relative">
              <strong>Cover Letter:</strong>
              {editing ? (
                <textarea
                  className="w-full min-h-[300px] border rounded p-2 mt-1"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                />
              ) : (
                <div className="bg-gray-50 rounded p-2 mt-1 whitespace-pre-line min-h-[300px]">{content}</div>
              )}
              <button
                type="button"
                className="absolute top-0 right-0 p-2 rounded hover:bg-gray-100"
                onClick={() => { navigator.clipboard.writeText(content); toast({ title: 'Copied!', description: 'Cover letter copied to clipboard.' }); }}
                aria-label="Copy to clipboard"
              >
                <Copy className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            {editing ? (
              <Button onClick={handleSave} className="mr-2">Save</Button>
            ) : (
              <Button onClick={() => setEditing(true)} className="mr-2"><Edit className="w-4 h-4 mr-1" />Edit</Button>
            )}
            <Button onClick={handleDownloadPDF} className="ml-2"><Download className="w-4 h-4 mr-1" />Download PDF</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CoverLetterDetail; 