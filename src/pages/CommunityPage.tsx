import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import PostCard from '@/components/forum/PostCard';
import CreatePostDialog from '@/components/forum/CreatePostDialog';
import { useForum } from '@/hooks/useForum';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Search, Filter, ArrowUpDown, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CommunityPage = () => {
  const { posts, isLoading, createPost, isCreating, toggleLike, deletePost, isDeleting, editPost } = useForum();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');

  const filteredPosts = posts
    .filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCrop = selectedCrop === 'all' || post.crop_type === selectedCrop;
      return matchesSearch && matchesCrop;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else {
        return b.likes_count - a.likes_count;
      }
    });

  const handleCreatePost = async (post: { title: string; content: string; crop_type?: string; image?: File | null }) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    return await createPost(post);
  };

  return (
    <AppLayout>
      <div className="pb-24 pt-6 px-4 max-w-2xl mx-auto">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Community</h1>
              <p className="text-muted-foreground text-sm">Connect with other farmers</p>
            </div>

            <CreatePostDialog onSubmit={handleCreatePost} isCreating={isCreating} />
          </div>

          {/* Search and Filters */}
          <div className="space-y-3 sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2 -mx-4 px-4 border-b border-border/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/50 border-transparent focus:bg-background transition-colors rounded-xl"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                <SelectTrigger className="w-[140px] h-9 rounded-lg border-muted-foreground/20 bg-card text-xs">
                  <Filter className="w-3 h-3 mr-2" />
                  <SelectValue placeholder="All Crops" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Crops</SelectItem>
                  <SelectItem value="Rice">Rice</SelectItem>
                  <SelectItem value="Wheat">Wheat</SelectItem>
                  <SelectItem value="Corn">Corn</SelectItem>
                  <SelectItem value="Tomato">Tomato</SelectItem>
                  <SelectItem value="Potato">Potato</SelectItem>
                  <SelectItem value="Cotton">Cotton</SelectItem>
                  <SelectItem value="Sugarcane">Sugarcane</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger className="w-[130px] h-9 rounded-lg border-muted-foreground/20 bg-card text-xs">
                  <ArrowUpDown className="w-3 h-3 mr-2" />
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-4 min-h-[50vh]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm">Loading community posts...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-border">
                <p>No posts found. Be the first to start a discussion!</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredPosts.map((post) => (
                  <motion.div
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <PostCard
                      post={post}
                      onLike={(id, hasLiked) => toggleLike({ postId: id, hasLiked })}
                      onDelete={user?.id === post.user_id ? deletePost : undefined}
                      onEdit={user?.id === post.user_id ? editPost : undefined}
                      isDeleting={isDeleting}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CommunityPage;
