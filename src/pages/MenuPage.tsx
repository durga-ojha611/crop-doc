import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { User, History, Settings, LogIn, LogOut, Mail, MessageSquare, Calendar as CalendarIcon, Plus, ChevronRight, ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useScans } from '@/hooks/useScans';
import { useForum } from '@/hooks/useForum';
import { useTasks, Task } from '@/hooks/useTasks';
import TaskAgenda from '@/components/tasks/TaskAgenda';
import TaskCalendar from '@/components/tasks/TaskCalendar';
import AddTaskModal from '@/components/tasks/AddTaskModal';
import CompleteTaskModal from '@/components/tasks/CompleteTaskModal';
import { motion, AnimatePresence } from 'framer-motion';
import PostCard from '@/components/forum/PostCard';
import { useState, useEffect } from 'react';

const MenuPage = () => {
  const navigate = useNavigate();
  const { user, signOut, isLoading } = useAuth();
  const { posts, deletePost, isDeleting, toggleLike, editPost } = useForum();
  const { tasks, todayTasks, fetchTasks, fetchTodayTasks, createTask, completeTask, snoozeTask } = useTasks();
  
  const [activeSection, setActiveSection] = useState<"menu" | "posts" | "tasks">("menu");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);
  const [calendarView, setCalendarView] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchTodayTasks();
    }
  }, [user, fetchTasks, fetchTodayTasks]);

  const handleSignOut = async () => {
    await signOut();
  };

  const myPosts = posts.filter(post => post.user_id === user?.id);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  const renderMenu = () => (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Profile Header */}
      <div className="flex flex-col items-center p-6 bg-card rounded-2xl border border-border shadow-sm">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <User className="w-10 h-10 text-primary" />
        </div>
        {user ? (
          <>
            <h2 className="text-xl font-bold text-foreground mb-1">
              {user.user_metadata?.full_name || user.displayName || 'Farmer'}
            </h2>
            <p className="text-muted-foreground text-sm flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              {user.email}
            </p>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold text-foreground mb-1">Guest User</h2>
            <p className="text-muted-foreground text-sm">Sign in to sync your data</p>
          </>
        )}
      </div>

      {/* Menu List */}
      <div className="space-y-3">
        <button 
          onClick={() => setActiveSection('posts')}
          className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:bg-accent/50 transition-colors shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-500" />
            </div>
            <p className="font-medium text-foreground">My Posts</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        <button 
          onClick={() => setActiveSection('tasks')}
          className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:bg-accent/50 transition-colors shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-green-500" />
            </div>
            <p className="font-medium text-foreground">Farm Tasks</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        <button 
          onClick={() => navigate('/fields')}
          className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:bg-accent/50 transition-colors shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="font-medium text-foreground">My Fields</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        <button 
          onClick={() => navigate('/history')}
          className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:bg-accent/50 transition-colors shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
              <History className="w-5 h-5 text-orange-500" />
            </div>
            <p className="font-medium text-foreground">Scan History</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>

        <button 
          onClick={() => navigate('/settings')}
          className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:bg-accent/50 transition-colors shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-purple-500" />
            </div>
            <p className="font-medium text-foreground">Settings</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Auth Action */}
      {user ? (
        <Button 
          variant="outline"
          className="w-full h-12 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20" 
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      ) : (
        <Button 
          className="w-full h-12 shadow-lg shadow-primary/20" 
          onClick={() => navigate('/auth')}
        >
          <LogIn className="w-4 h-4 mr-2" />
          Sign In
        </Button>
      )}
    </motion.div>
  );

  const renderPosts = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => setActiveSection('menu')} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold">My Posts</h1>
      </div>

      {!user ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <User className="w-8 h-8 opacity-50" />
          </div>
          <p>Sign in to view your posts</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      ) : myPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground space-y-4 border-2 border-dashed rounded-2xl border-muted">
           <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <MessageSquare className="w-8 h-8 opacity-50" />
          </div>
          <div>
            <p className="font-medium">No posts yet</p>
            <p className="text-sm">Share your first question with the community!</p>
          </div>
          <Button onClick={() => navigate('/community')} variant="outline">
            Go to Community
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
           <AnimatePresence>
            {myPosts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <PostCard 
                  post={post} 
                  onLike={(id, hasLiked) => toggleLike({ postId: id, hasLiked })}
                  onDelete={deletePost}
                  onEdit={editPost}
                  isDeleting={isDeleting}
                />
              </motion.div>
            ))}
           </AnimatePresence>
        </div>
      )}
    </motion.div>
  );

  const renderTasks = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => setActiveSection('menu')} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold">Farm Tasks</h1>
      </div>

      {!user ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <CalendarIcon className="w-8 h-8 opacity-50" />
          </div>
          <p>Sign in to manage your tasks</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="flex bg-muted p-1 rounded-xl">
              <button 
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!calendarView ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                onClick={() => setCalendarView(false)}
              >
                Today
              </button>
              <button 
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${calendarView ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
                onClick={() => setCalendarView(true)}
              >
                Calendar
              </button>
            </div>
            <Button size="sm" onClick={() => setIsAddModalOpen(true)} className="rounded-xl">
              <Plus className="w-4 h-4 mr-1" /> Add Task
            </Button>
          </div>

          {calendarView ? (
            <TaskCalendar tasks={tasks} />
          ) : (
            <TaskAgenda 
              tasks={todayTasks} 
              onComplete={(t) => setTaskToComplete(t)} 
              onSnooze={snoozeTask} 
            />
          )}

          <AddTaskModal 
            isOpen={isAddModalOpen} 
            onClose={() => setIsAddModalOpen(false)} 
            onSubmit={createTask} 
          />
          <CompleteTaskModal 
            isOpen={!!taskToComplete} 
            task={taskToComplete} 
            onClose={() => setTaskToComplete(null)} 
            onSubmit={completeTask} 
          />
        </>
      )}
    </motion.div>
  );

  return (
    <AppLayout>
      <div className="p-4 pb-24 min-h-[80vh]">
        {activeSection === 'menu' && (
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">App Menu</h1>
          </div>
        )}
        
        <AnimatePresence mode="wait">
          {activeSection === 'menu' && renderMenu()}
          {activeSection === 'posts' && renderPosts()}
          {activeSection === 'tasks' && renderTasks()}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default MenuPage;
