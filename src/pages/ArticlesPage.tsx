import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Bookmark, Share2, Plus, Twitter, Linkedin, Repeat2 } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Avatar } from '../components/Avatar';
import { supabase, Article, Profile } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ArticleWithDetails extends Article {
  author: Profile;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  is_bookmarked: boolean;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: Profile;
}

export const ArticlesPage = () => {
  const [articles, setArticles] = useState<ArticleWithDetails[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<ArticleWithDetails | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    if (!user) return;

    const { data: articlesData } = await supabase
      .from('articles')
      .select('*, author:profiles!articles_author_id_fkey(*)')
      .order('created_at', { ascending: false });

    if (articlesData) {
      const articlesWithDetails = await Promise.all(
        articlesData.map(async (article) => {
          const { count: likesCount } = await supabase
            .from('article_likes')
            .select('*', { count: 'exact', head: true })
            .eq('article_id', article.id);

          const { count: commentsCount } = await supabase
            .from('article_comments')
            .select('*', { count: 'exact', head: true })
            .eq('article_id', article.id);

          const { data: likeData } = await supabase
            .from('article_likes')
            .select('id')
            .eq('article_id', article.id)
            .eq('user_id', user.id)
            .maybeSingle();

          const { data: bookmarkData } = await supabase
            .from('article_bookmarks')
            .select('id')
            .eq('article_id', article.id)
            .eq('user_id', user.id)
            .maybeSingle();

          return {
            ...article,
            likes_count: likesCount || 0,
            comments_count: commentsCount || 0,
            is_liked: !!likeData,
            is_bookmarked: !!bookmarkData,
          };
        })
      );

      setArticles(articlesWithDetails as any);
    }
  };

  const fetchComments = async (articleId: string) => {
    const { data } = await supabase
      .from('article_comments')
      .select('*, user:profiles!article_comments_user_id_fkey(*)')
      .eq('article_id', articleId)
      .order('created_at', { ascending: false });

    if (data) {
      setComments(data as any);
    }
  };

  const handleCreateArticle = async () => {
    if (!user || !title || !content) return;

    setLoading(true);

    await supabase.from('articles').insert({
      author_id: user.id,
      title,
      content,
      image_url: imageUrl,
    });

    setLoading(false);
    setShowCreateModal(false);
    setTitle('');
    setContent('');
    setImageUrl('');
    fetchArticles();
  };

  const toggleLike = async (articleId: string, isLiked: boolean) => {
    if (!user) return;

    if (isLiked) {
      await supabase
        .from('article_likes')
        .delete()
        .eq('article_id', articleId)
        .eq('user_id', user.id);
    } else {
      await supabase.from('article_likes').insert({
        article_id: articleId,
        user_id: user.id,
      });
    }

    fetchArticles();
  };

  const toggleBookmark = async (articleId: string, isBookmarked: boolean) => {
    if (!user) return;

    if (isBookmarked) {
      await supabase
        .from('article_bookmarks')
        .delete()
        .eq('article_id', articleId)
        .eq('user_id', user.id);
    } else {
      await supabase.from('article_bookmarks').insert({
        article_id: articleId,
        user_id: user.id,
      });
    }

    fetchArticles();
  };

  const handleComment = async () => {
    if (!user || !selectedArticle || !commentContent.trim()) return;

    await supabase.from('article_comments').insert({
      article_id: selectedArticle.id,
      user_id: user.id,
      content: commentContent,
    });

    setCommentContent('');
    fetchComments(selectedArticle.id);
    fetchArticles();
  };

  const shareExternal = (platform: 'twitter' | 'linkedin', article: ArticleWithDetails) => {
    const text = encodeURIComponent(article.title);
    const url = encodeURIComponent(window.location.href);

    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    } else {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
        '_blank'
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Article
        </Button>
      </div>

      <div className="space-y-6">
        {articles.map((article) => (
          <Card key={article.id}>
            <div className="flex items-start gap-3 mb-4">
              <Avatar src={article.author.avatar_url} size="md" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{article.author.username}</p>
                <p className="text-sm text-gray-500">
                  {new Date(article.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3">{article.title}</h3>

            {article.image_url && (
              <img
                src={article.image_url}
                alt={article.title}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
            )}

            <p className="text-gray-700 mb-4 whitespace-pre-wrap">{article.content}</p>

            <div className="flex items-center gap-6 pt-4 border-t">
              <button
                onClick={() => toggleLike(article.id, article.is_liked)}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <Heart
                  className={`w-5 h-5 ${
                    article.is_liked ? 'fill-red-600 text-red-600' : ''
                  }`}
                />
                <span className="text-sm">{article.likes_count}</span>
              </button>

              <button
                onClick={() => {
                  setSelectedArticle(article);
                  setShowCommentModal(true);
                  fetchComments(article.id);
                }}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">{article.comments_count}</span>
              </button>

              <button
                onClick={() => toggleBookmark(article.id, article.is_bookmarked)}
                className="flex items-center gap-2 text-gray-600 hover:text-yellow-600 transition-colors"
              >
                <Bookmark
                  className={`w-5 h-5 ${
                    article.is_bookmarked ? 'fill-yellow-600 text-yellow-600' : ''
                  }`}
                />
              </button>

              <div className="relative group">
                <button className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
                <div className="absolute bottom-full mb-2 left-0 hidden group-hover:flex bg-white shadow-lg rounded-lg p-2 gap-2">
                  <button
                    onClick={() => shareExternal('twitter', article)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Share on Twitter"
                  >
                    <Twitter className="w-5 h-5 text-blue-500" />
                  </button>
                  <button
                    onClick={() => shareExternal('linkedin', article)}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Share on LinkedIn"
                  >
                    <Linkedin className="w-5 h-5 text-blue-700" />
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    }}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Copy Link"
                  >
                    <Repeat2 className="w-5 h-5 text-green-600" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {articles.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No articles yet. Be the first to post!</p>
        </div>
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Article"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            type="text"
            label="Title"
            placeholder="Enter article title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Input
            type="url"
            label="Image URL (optional)"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent transition-all"
              rows={8}
              placeholder="Write your article content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)} fullWidth>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateArticle}
              disabled={!title || !content || loading}
              fullWidth
            >
              {loading ? 'Publishing...' : 'Publish'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showCommentModal}
        onClose={() => {
          setShowCommentModal(false);
          setSelectedArticle(null);
          setComments([]);
        }}
        title="Comments"
        size="lg"
      >
        <div className="space-y-4">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <Avatar src={comment.user.avatar_url} size="sm" />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900">
                    {comment.user.username}
                  </p>
                  <p className="text-gray-700 mt-1">{comment.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(comment.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No comments yet. Be the first to comment!
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <input
              type="text"
              placeholder="Write a comment..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleComment();
              }}
            />
            <Button
              variant="primary"
              onClick={handleComment}
              disabled={!commentContent.trim()}
            >
              Comment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
