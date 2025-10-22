import { useState, useEffect } from 'react';
import { Upload, FileText, Clock, CheckCircle } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { supabase, Assignment, Submission } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const StudentDashboard = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchAssignments();
    fetchSubmissions();
  }, []);

  const fetchAssignments = async () => {
    const { data } = await supabase
      .from('assignments')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setAssignments(data);
  };

  const fetchSubmissions = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('submissions')
      .select('*')
      .eq('student_id', user.id);

    if (data) setSubmissions(data);
  };

  const handleSubmit = async () => {
    if (!selectedAssignment || !user || !fileUrl) return;

    setLoading(true);

    const existingSubmission = submissions.find(
      (s) => s.assignment_id === selectedAssignment.id
    );

    if (existingSubmission) {
      await supabase
        .from('submissions')
        .update({ file_url: fileUrl, submitted_at: new Date().toISOString() })
        .eq('id', existingSubmission.id);
    } else {
      await supabase.from('submissions').insert({
        assignment_id: selectedAssignment.id,
        student_id: user.id,
        file_url: fileUrl,
        status: 'submitted',
      });
    }

    setLoading(false);
    setSelectedAssignment(null);
    setFileUrl('');
    fetchSubmissions();
  };

  const getSubmissionStatus = (assignmentId: string) => {
    return submissions.find((s) => s.assignment_id === assignmentId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Assignments</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {assignments.map((assignment) => {
          const submission = getSubmissionStatus(assignment.id);
          const isSubmitted = !!submission;
          const isGraded = submission?.grade !== null && submission?.grade !== undefined;

          return (
            <Card key={assignment.id} hover>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl font-semibold text-gray-900">
                  {assignment.title}
                </h3>
                {isGraded ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : isSubmitted ? (
                  <Clock className="w-5 h-5 text-yellow-500" />
                ) : (
                  <FileText className="w-5 h-5 text-gray-400" />
                )}
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2">
                {assignment.description}
              </p>

              {assignment.due_date && (
                <p className="text-sm text-gray-500 mb-4">
                  Due: {new Date(assignment.due_date).toLocaleDateString()}
                </p>
              )}

              {isGraded && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-semibold text-green-700">
                    Grade: {submission.grade}/100
                  </p>
                  {submission.feedback && (
                    <p className="text-sm text-green-600 mt-1">
                      {submission.feedback}
                    </p>
                  )}
                </div>
              )}

              {isSubmitted && !isGraded && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    Submitted - Awaiting grading
                  </p>
                </div>
              )}

              <Button
                variant={isSubmitted ? 'secondary' : 'primary'}
                fullWidth
                onClick={() => setSelectedAssignment(assignment)}
              >
                {isSubmitted ? 'Resubmit' : 'Submit Assignment'}
              </Button>
            </Card>
          );
        })}
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No assignments available yet</p>
        </div>
      )}

      <Modal
        isOpen={!!selectedAssignment}
        onClose={() => {
          setSelectedAssignment(null);
          setFileUrl('');
        }}
        title="Submit Assignment"
      >
        {selectedAssignment && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {selectedAssignment.title}
              </h3>
              <p className="text-gray-600 mt-2">{selectedAssignment.description}</p>
            </div>

            <Input
              type="url"
              label="File URL"
              placeholder="https://example.com/your-assignment.pdf"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
            />

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                Upload your file to a cloud storage service and paste the public URL here.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedAssignment(null);
                  setFileUrl('');
                }}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={!fileUrl || loading}
                fullWidth
              >
                {loading ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
