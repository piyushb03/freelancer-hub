import { useState, useMemo } from 'react';
import { useCRM } from '@/context/CRMContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isOverdue, getStatusColor, getStatusLabel, formatDate } from '@/lib/formatters';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarPage() {
  const { projects, getClientById } = useCRM();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const days: (Date | null)[] = [];
    
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  }, [year, month]);

  const getProjectsForDate = (date: Date) => {
    return projects.filter(project => {
      if (!project.deadline) return false;
      const deadline = new Date(project.deadline);
      return deadline.toDateString() === date.toDateString();
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDateProjects = selectedDate ? getProjectsForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar"
        description="View project deadlines at a glance"
      />

      <Card className="shadow-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle className="text-xl">
                {MONTHS[month]} {year}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dayProjects = getProjectsForDate(date);
              const isToday = date.toDateString() === today.toDateString();
              const hasOverdue = dayProjects.some(p => isOverdue(p.deadline) && p.status === 'in-progress');
              const isPast = date < today;

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => dayProjects.length > 0 && setSelectedDate(date)}
                  className={cn(
                    "aspect-square p-1 rounded-lg relative transition-all duration-200",
                    "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring",
                    isToday && "bg-primary/10 ring-2 ring-primary",
                    dayProjects.length > 0 && "cursor-pointer",
                    dayProjects.length === 0 && "cursor-default"
                  )}
                >
                  <div className={cn(
                    "text-sm font-medium",
                    isToday && "text-primary",
                    isPast && !isToday && "text-muted-foreground"
                  )}>
                    {date.getDate()}
                  </div>
                  
                  {dayProjects.length > 0 && (
                    <div className="absolute bottom-1 left-1 right-1 flex justify-center gap-0.5">
                      {dayProjects.slice(0, 3).map((project, i) => (
                        <div
                          key={project.id}
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            hasOverdue && project.status === 'in-progress' && isOverdue(project.deadline)
                              ? "bg-destructive"
                              : project.status === 'completed'
                                ? "bg-success"
                                : project.status === 'postponed'
                                  ? "bg-warning"
                                  : "bg-primary"
                          )}
                        />
                      ))}
                      {dayProjects.length > 3 && (
                        <span className="text-[8px] text-muted-foreground ml-0.5">
                          +{dayProjects.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">In Progress</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-muted-foreground">Completed</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-warning" />
              <span className="text-muted-foreground">Postponed</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-muted-foreground">Overdue</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Dialog */}
      <Dialog open={!!selectedDate} onOpenChange={(open) => !open && setSelectedDate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              {selectedDate && formatDate(selectedDate.toISOString())}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {selectedDateProjects.map(project => {
              const client = getClientById(project.clientId);
              const overdue = isOverdue(project.deadline) && project.status === 'in-progress';
              
              return (
                <div 
                  key={project.id}
                  className={cn(
                    "p-4 rounded-lg border",
                    overdue ? "border-destructive/50 bg-destructive/5" : "border-border"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold">{project.name}</h4>
                      {client && (
                        <p className="text-sm text-muted-foreground">{client.name}</p>
                      )}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        getStatusColor(project.status),
                        overdue && "border-destructive/50 bg-destructive/10 text-destructive"
                      )}
                    >
                      {overdue ? 'Overdue' : getStatusLabel(project.status)}
                    </Badge>
                  </div>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mt-2">{project.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
