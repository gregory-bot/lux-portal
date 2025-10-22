import { useState, useEffect } from 'react';
import { Plus, FileText, Users, Edit } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Avatar } from '../components/Avatar';
import { supabase, Assignment, Submission, Profile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export const InstructorDashboard = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<(Submission & { student: Profile })[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<(Submission & { student: Profile }) | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchAssignments();
    fetchSubmissions();
  }, []);

  const fetchAssignments = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('assignments')
      .select('*')
      .eq('instructor_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setAssignments(data);
  };

  const fetchSubmissions = async () => {
    if (!user) return;

    const { data: assignmentData } = await supabase
      .from('assignments')
      .select('id')
      .eq('instructor_id', user.id);

    if (assignmentData && assignmentData.length > 0) {
      const assignmentIds = assignmentData.map((a) => a.id);

      const { data: submissionData } = await supabase
        .from('submissions')
        .select('*, student:profiles!submissions_student_id_fkey(*)')
        .in('assignment_id', assignmentIds)
        .order('submitted_at', { ascending: false });

      if (submissionData) {
        setSubmissions(submissionData as any);
      }
    }
  };

  const handleCreateAssignment = async () => {
    if (!user || !title) return;

    setLoading(true);

    await supabase.from('assignments').insert({
      title,
      description,
      instructor_id: user.id,
      due_date: dueDate || null,
    });

    setLoading(false);
    setShowCreateModal(false);
    setTitle('');
    setDescription('');
    setDueDate('');
    fetchAssignments();
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission || !grade) return;

    setLoading(true);

    await supabase
      .from('submissions')
      .update({
        grade: parseInt(grade),
        feedback,
        status: 'graded',
      })
      .eq('id', selectedSubmission.id);

    setLoading(false);
    setShowGradeModal(false);
    setSelectedSubmission(null);
    setGrade('');
    setFeedback('');
    fetchSubmissions();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Assignment
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Assignments</p>
              <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Submissions</p>
              <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Edit className="w-6 h-6 text-yellow-700" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Grading</p>
              <p className="text-2xl font-bold text-gray-900">
                {submissions.filter((s) => !s.grade).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Recent Submissions</h2>
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <Avatar src={submission.student.avatar_url} size="md" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {submission.student.username}
                    </p>
                    <p className="text-sm text-gray-500">
                      Submitted {new Date(submission.submitted_at).toLocaleDateString()}
                    </p>
                    {submission.file_url && (
                      <a
                        href={submission.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-700 hover:underline"
                      >
                        View submission
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {submission.grade !== null && submission.grade !== undefined ? (
                    <div className="text-right">
                      <p className="text-lg font-semibold text-green-700">
                        {submission.grade}/100
                      </p>
                      <p className="text-xs text-gray-500">Graded</p>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSelectedSubmission(submission);
                        setShowGradeModal(true);
                      }}
                    >
                      Grade
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {submissions.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No submissions yet</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Assignment"
      >
        <div className="space-y-4">
          <Input
            type="text"
            label="Assignment Title"
            placeholder="Enter assignment title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all"
              rows={4}
              placeholder="Enter assignment description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Input
            type="date"
            label="Due Date (optional)"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateAssignment}
              disabled={!title || loading}
              fullWidth
            >
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showGradeModal}
        onClose={() => {
          setShowGradeModal(false);
          setSelectedSubmission(null);
          setGrade('');
          setFeedback('');
        }}
        title="Grade Submission"
      >
        {selectedSubmission && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Avatar src={selectedSubmission.student.avatar_url} size="md" />
              <div>
                <p className="font-semibold text-gray-900">
                  {selectedSubmission.student.username}
                </p>
                <a
                  href={selectedSubmission.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-700 hover:underline"
                >
                  View submission
                </a>
              </div>
            </div>

            <Input
              type="number"
              label="Grade (0-100)"
              placeholder="Enter grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              min="0"
              max="100"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feedback (optional)
              </label>
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all"
                rows={4}
                placeholder="Provide feedback for the student"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowGradeModal(false);
                  setSelectedSubmission(null);
                  setGrade('');
                  setFeedback('');
                }}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleGradeSubmission}
                disabled={!grade || loading}
                fullWidth
              >
                {loading ? 'Submitting...' : 'Submit Grade'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
