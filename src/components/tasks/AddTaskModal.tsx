import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Calendar } from 'lucide-react';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: any) => Promise<void>;
}

const AddTaskModal = ({ isOpen, onClose, onSubmit }: AddTaskModalProps) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('watering');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [recurrence, setRecurrence] = useState('none');
  const [interval, setInterval] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const taskData: any = {
      title,
      type,
      scheduledDate
    };

    if (recurrence !== 'none') {
      taskData.recurrence = {
        frequency: recurrence,
        interval: recurrence === 'custom_days' ? interval : 1
      };
    }

    try {
      await onSubmit(taskData);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden"
        >
          <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Schedule Task
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Task Title</label>
              <input
                type="text"
                required
                className="w-full p-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="e.g. Water tomatoes"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Task Type</label>
                <select
                  className="w-full p-2.5 rounded-xl border border-input bg-background outline-none"
                  value={type}
                  onChange={e => setType(e.target.value)}
                >
                  <option value="watering">Watering</option>
                  <option value="fertilizing">Fertilizing</option>
                  <option value="spraying">Spraying</option>
                  <option value="weeding">Weeding</option>
                  <option value="planting">Planting</option>
                  <option value="harvesting">Harvesting</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  required
                  className="w-full p-2.5 rounded-xl border border-input bg-background outline-none"
                  value={scheduledDate}
                  onChange={e => setScheduledDate(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Recurrence</label>
              <select
                className="w-full p-2.5 rounded-xl border border-input bg-background outline-none"
                value={recurrence}
                onChange={e => setRecurrence(e.target.value)}
              >
                <option value="none">One-time Task</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="custom_days">Custom interval</option>
              </select>
            </div>

            {recurrence === 'custom_days' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <label className="block text-sm font-medium mb-1">Repeat every X days</label>
                <input
                  type="number"
                  min="2"
                  className="w-full p-2.5 rounded-xl border border-input bg-background outline-none"
                  value={interval}
                  onChange={e => setInterval(Number(e.target.value))}
                />
              </motion.div>
            )}

            <div className="pt-4 flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Task'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddTaskModal;
