import { Task } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { Droplet, Sprout, Bug, Scissors, Leaf, Tractor, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const getTaskIcon = (type: Task['type']) => {
  switch (type) {
    case 'watering': return <Droplet className="w-5 h-5 text-blue-500" />;
    case 'fertilizing': return <Sprout className="w-5 h-5 text-emerald-500" />;
    case 'spraying': return <Bug className="w-5 h-5 text-amber-500" />;
    case 'weeding': return <Scissors className="w-5 h-5 text-red-500" />;
    case 'planting': return <Leaf className="w-5 h-5 text-green-500" />;
    case 'harvesting': return <Tractor className="w-5 h-5 text-yellow-600" />;
    default: return <Activity className="w-5 h-5 text-gray-500" />;
  }
};

interface TaskAgendaProps {
  tasks: Task[];
  onComplete: (task: Task) => void;
  onSnooze: (taskId: string) => void;
}

const TaskAgenda = ({ tasks, onComplete, onSnooze }: TaskAgendaProps) => {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-2xl">
        <Activity className="w-12 h-12 opacity-50 mb-3" />
        <p className="font-medium">No pending tasks for today!</p>
        <p className="text-sm">Enjoy your day or schedule a new task.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => {
        const isOverdue = new Date(task.scheduledDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
        return (
          <motion.div
            key={task._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 bg-card rounded-xl border flex items-center justify-between shadow-sm ${
              isOverdue ? 'border-destructive/50 bg-destructive/5' : 'border-border'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border border-border">
                {getTaskIcon(task.type)}
              </div>
              <div>
                <p className="font-medium text-foreground">{task.title}</p>
                <div className="flex items-center gap-2 text-xs">
                  {isOverdue && <span className="text-destructive font-semibold">Overdue</span>}
                  <span className="text-muted-foreground uppercase">{task.type}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button size="sm" onClick={() => onComplete(task)}>
                Mark Done
              </Button>
              <Button size="sm" variant="outline" className="text-xs" onClick={() => onSnooze(task._id)}>
                Snooze
              </Button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default TaskAgenda;
