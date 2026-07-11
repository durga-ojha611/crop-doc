import { Task } from '@/hooks/useTasks';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TaskCalendarProps {
  tasks: Task[];
}

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const TaskCalendar = ({ tasks }: TaskCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Map tasks by day
  const tasksByDay: Record<number, Task[]> = {};
  tasks.forEach(task => {
    const taskDate = new Date(task.scheduledDate);
    if (taskDate.getFullYear() === year && taskDate.getMonth() === month) {
      const day = taskDate.getDate();
      if (!tasksByDay[day]) tasksByDay[day] = [];
      tasksByDay[day].push(task);
    }
  });

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-4 flex items-center justify-between bg-muted/50 border-b border-border">
        <h2 className="font-bold text-lg">{monthName} {year}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 text-center border-b border-border text-xs font-semibold text-muted-foreground">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="py-2">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-[minmax(60px,auto)]">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="border-b border-r border-border/50 bg-muted/20" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayTasks = tasksByDay[day] || [];
          const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
          
          return (
            <div key={day} className={`p-1 border-b border-r border-border/50 min-h-[80px] ${isToday ? 'bg-primary/5' : ''}`}>
              <div className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                {day}
              </div>
              <div className="mt-1 space-y-1">
                {dayTasks.map((t, idx) => (
                  <div 
                    key={idx} 
                    className={`text-[10px] leading-tight px-1.5 py-0.5 rounded truncate ${
                      t.status === 'done' ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'
                    }`}
                    title={t.title}
                  >
                    {t.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskCalendar;
