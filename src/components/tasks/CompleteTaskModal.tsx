import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, CheckCircle, Camera } from 'lucide-react';
import { Task } from '@/hooks/useTasks';

interface CompleteTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, notes?: string, image?: string) => Promise<void>;
}

const CompleteTaskModal = ({ task, isOpen, onClose, onSubmit }: CompleteTaskModalProps) => {
  const [notes, setNotes] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(task._id, notes, imagePreview || undefined);
      setNotes('');
      setImagePreview(null);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !task) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden"
        >
          <div className="p-4 border-b border-border flex justify-between items-center bg-success/10">
            <h2 className="font-bold text-lg flex items-center gap-2 text-success">
              <CheckCircle className="w-5 h-5" />
              Complete Task
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div className="bg-muted/50 p-3 rounded-xl border border-border/50">
              <p className="font-medium text-sm text-muted-foreground">Task</p>
              <p className="font-semibold">{task.title}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
              <textarea
                className="w-full p-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none h-24"
                placeholder="Any observations?"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Photo Proof (Optional)</label>
              
              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-border h-40">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <Button 
                    size="icon" 
                    variant="destructive" 
                    className="absolute top-2 right-2 rounded-full h-8 w-8"
                    onClick={() => setImagePreview(null)}
                    type="button"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-24 border-2 border-dashed border-input rounded-xl flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  <Camera className="w-6 h-6 mb-1 opacity-50" />
                  <span className="text-sm font-medium">Capture or Upload</span>
                </button>
              )}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageCapture}
              />
            </div>

            <div className="pt-4 flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-success hover:bg-success/90 text-success-foreground" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Mark as Done'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CompleteTaskModal;
