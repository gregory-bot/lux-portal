import { useState } from 'react';
import { GraduationCap, Upload, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Avatar } from '../components/Avatar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export const ProfileSetupPage = () => {
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'student' | 'instructor'>('student');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [linkedinHandle, setLinkedinHandle] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!user) {
      setError('No user found. Please sign in again.');
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        username,
        role,
        avatar_url: avatarUrl,
        linkedin_handle: linkedinHandle,
        twitter_handle: twitterHandle,
        fee_paid: role === 'instructor' ? true : false,
      });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">LuxDev</h1>
        </div>

        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-900">
          Complete Your Profile
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Avatar src={avatarUrl} size="xl" />
            <Input
              type="url"
              label="Avatar URL"
              placeholder="https://example.com/avatar.jpg"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
          </div>

          <Input
            type="text"
            label="Username"
            placeholder="Choose a unique username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              I am a
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={role === 'student'}
                  onChange={() => setRole('student')}
                  className="w-4 h-4 text-blue-700 focus:ring-blue-700"
                />
                <span className="text-gray-700">Student</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="instructor"
                  checked={role === 'instructor'}
                  onChange={() => setRole('instructor')}
                  className="w-4 h-4 text-blue-700 focus:ring-blue-700"
                />
                <span className="text-gray-700">Instructor</span>
              </label>
            </div>
          </div>

          <Input
            type="text"
            label="LinkedIn Handle (optional)"
            placeholder="linkedin.com/in/yourhandle"
            value={linkedinHandle}
            onChange={(e) => setLinkedinHandle(e.target.value)}
          />

          <Input
            type="text"
            label="Twitter Handle (optional)"
            placeholder="@yourhandle"
            value={twitterHandle}
            onChange={(e) => setTwitterHandle(e.target.value)}
          />

          {role === 'student' && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Note: Students must have their fees paid to access the platform. Contact administration to update your fee status.
              </p>
            </div>
          )}

          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? 'Creating profile...' : 'Complete Setup'}
          </Button>
        </form>
      </div>
    </div>
  );
};
