import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, ChevronDown, ChevronUp, Trash2, MoreVertical, Edit2 } from 'lucide-react';
import { ForumPost, useForumComments } from '@/hooks/useForum';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import CommentSection from './CommentSection';
import EditPostDialog from './EditPostDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PostCardProps {
  post: ForumPost;
  onLike: (postId: string, hasLiked: boolean) => void;
  onDelete?: (postId: string) => void;
  onEdit?: (postId: string, updates: { title: string; content: string; crop_type?: string; image?: File | null; current_image_url?: string | null }) => Promise<void>;
  isDeleting?: boolean;
}

const PostCard = ({ post, onLike, onDelete, onEdit, isDeleting }: PostCardProps) => {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const { comments, isLoading: commentsLoading, createComment, deleteComment, isCreating } = useForumComments(post.id);

  const [isEditOpen, setIsEditOpen] = useState(false);

  const authorName = post.author_name || 'Anonymous Farmer';
  const initials = authorName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const isAuthor = user?.id === post.user_id;

  return (
    <>
      <Card className="overflow-hidden border-border/60 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 border border-border">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-foreground text-sm">{authorName}</span>
                {post.crop_type && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 h-5 bg-secondary/50 text-secondary-foreground hover:bg-secondary/70">
                    {post.crop_type}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                {post.updated_at !== post.created_at && <span className="ml-1">(edited)</span>}
              </p>
            </div>
          </div>

          {isAuthor && (onDelete || onEdit) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Post
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onClick={() => onDelete(post.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Post
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardHeader>

        <CardContent className="pb-3 space-y-3">
          <div>
            <h3 className="font-semibold text-foreground mb-1.5 leading-tight">{post.title}</h3>
            <p className="text-muted-foreground text-sm whitespace-pre-wrap leading-relaxed">{post.content}</p>
          </div>

          {post.image_url && (
            <div className="rounded-xl overflow-hidden border border-border bg-muted/30">
              <img
                src={post.image_url}
                alt="Post attachment"
                className="w-full max-h-80 object-cover hover:scale-[1.02] transition-transform duration-500"
                loading="lazy"
              />
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-0 flex-col gap-3">
          <div className="flex items-center justify-between w-full pt-2 border-t border-border/50">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-1.5 h-8 px-2 ${post.user_has_liked ? 'text-red-500 hover:text-red-600 hover:bg-red-500/10' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => user && onLike(post.id, post.user_has_liked)}
                disabled={!user}
              >
                <Heart className={`h-4 w-4 ${post.user_has_liked ? 'fill-current' : ''}`} />
                <span className="text-xs font-medium">{post.likes_count > 0 ? post.likes_count : 'Like'}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 h-8 px-2 text-muted-foreground hover:text-primary hover:bg-primary/10"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs font-medium">{post.comments_count > 0 ? post.comments_count : 'Comment'}</span>
                {showComments ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
              </Button>
            </div>
          </div>

          {/* Comment Preview - Show recent 2 comments if not expanded */}
          {!showComments && comments && comments.length > 0 && (
            <div className="w-full bg-muted/20 rounded-lg p-3 space-y-2">
              {comments.slice(-2).map((comment) => (
                <div key={comment.id} className="flex gap-2">
                  <span className="text-xs font-semibold text-foreground whitespace-nowrap">{comment.author_name || 'User'}:</span>
                  <p className="text-xs text-muted-foreground line-clamp-1">{comment.content}</p>
                </div>
              ))}
              {comments.length > 2 && (
                <button
                  onClick={() => setShowComments(true)}
                  className="text-[10px] text-primary hover:underline font-medium pt-1"
                >
                  View all {comments.length} comments
                </button>
              )}
            </div>
          )}

          {showComments && (
            <CommentSection
              comments={comments}
              isLoading={commentsLoading}
              onAddComment={createComment}
              onDeleteComment={deleteComment}
              isCreating={isCreating}
              postAuthorId={post.user_id}
              postAuthorName={post.author_name}
            />
          )}
        </CardFooter>
      </Card>

      {onEdit && (
        <EditPostDialog
          post={post}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onEdit={onEdit}
        />
      )}
    </>
  );
};

export default PostCard;
