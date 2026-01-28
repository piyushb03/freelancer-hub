import { useCRM } from '@/context/CRMContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatCard } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Timer, 
  Play, 
  Square, 
  Clock,
  DollarSign,
  FolderKanban,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatTime, formatCurrency, getStatusColor, getStatusLabel } from '@/lib/formatters';
import { Link } from 'react-router-dom';

export default function TimeTracking() {
  const { 
    projects, 
    clients,
    timerState, 
    elapsedTime, 
    startTimer, 
    stopTimer,
    getTotalTimeForProject,
    getTodayTrackedTime,
    sessions,
    deleteSession,
    getClientById
  } = useCRM();

  const activeProjects = projects.filter(p => p.status === 'in-progress');
  const todayTime = getTodayTrackedTime();
  
  const totalEarnings = projects.reduce((acc, project) => {
    const timeInHours = getTotalTimeForProject(project.id) / 3600;
    return acc + (timeInHours * project.hourlyRate);
  }, 0);

  const activeProject = timerState.projectId 
    ? projects.find(p => p.id === timerState.projectId)
    : null;

  const recentSessions = [...sessions]
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Time Tracking"
        description="Track time on your projects and calculate earnings"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Today's Time"
          value={formatTime(todayTime)}
          icon={<Clock className="w-6 h-6 text-primary-foreground" />}
          variant="primary"
        />
        <StatCard
          title="Active Projects"
          value={activeProjects.length}
          icon={<FolderKanban className="w-6 h-6 text-muted-foreground" />}
        />
        <StatCard
          title="Total Earnings"
          value={formatCurrency(totalEarnings)}
          icon={<DollarSign className="w-6 h-6 text-accent-foreground" />}
          variant="accent"
        />
      </div>

      {/* Active Timer */}
      {timerState.isRunning && activeProject && (
        <Card className="border-primary/50 shadow-glow">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center animate-pulse-glow">
                    <Timer className="w-8 h-8 text-primary-foreground" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Currently tracking</p>
                  <h3 className="text-xl font-bold">{activeProject.name}</h3>
                  <p className="text-3xl font-mono font-bold text-primary mt-1">
                    {formatTime(elapsedTime)}
                  </p>
                </div>
              </div>
              <Button 
                size="lg" 
                variant="destructive"
                className="gap-2"
                onClick={stopTimer}
              >
                <Square className="w-5 h-5" />
                Stop Timer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <EmptyState
          icon={<Timer className="w-8 h-8 text-muted-foreground" />}
          title="No projects to track"
          description="Create a project first to start tracking time."
          action={
            <Link to="/projects">
              <Button className="gap-2">
                <FolderKanban className="w-4 h-4" />
                Create a Project
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => {
              const client = getClientById(project.clientId);
              const timeSpent = getTotalTimeForProject(project.id);
              const earnings = (timeSpent / 3600) * project.hourlyRate;
              const isTracking = timerState.isRunning && timerState.projectId === project.id;
              
              return (
                <Card 
                  key={project.id} 
                  className={cn(
                    "shadow-md transition-all duration-300",
                    isTracking && "border-primary/50 shadow-glow"
                  )}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate">{project.name}</CardTitle>
                        {client && (
                          <p className="text-sm text-muted-foreground truncate">
                            {client.name}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className={cn("shrink-0 text-xs", getStatusColor(project.status))}>
                        {getStatusLabel(project.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-2xl font-bold">
                          {isTracking ? formatTime(timeSpent + elapsedTime) : formatTime(timeSpent)}
                        </p>
                        <p className="text-xs text-muted-foreground">Time Tracked</p>
                      </div>
                      <div className="p-3 rounded-lg bg-accent/10">
                        <p className="text-2xl font-bold text-accent">
                          {formatCurrency(isTracking ? ((timeSpent + elapsedTime) / 3600) * project.hourlyRate : earnings)}
                        </p>
                        <p className="text-xs text-muted-foreground">Earnings</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{formatCurrency(project.hourlyRate)}/hr</span>
                    </div>

                    {isTracking ? (
                      <Button 
                        variant="destructive" 
                        className="w-full gap-2"
                        onClick={stopTimer}
                      >
                        <Square className="w-4 h-4" />
                        Stop Timer
                      </Button>
                    ) : (
                      <Button 
                        className="w-full gap-2"
                        onClick={() => startTimer(project.id)}
                        disabled={project.status === 'completed'}
                      >
                        <Play className="w-4 h-4" />
                        Start Timer
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Recent Sessions</h2>
          <Card className="shadow-md">
            <CardContent className="divide-y divide-border py-0">
              {recentSessions.map((session) => {
                const project = projects.find(p => p.id === session.projectId);
                if (!project) return null;
                
                return (
                  <div 
                    key={session.id}
                    className="flex items-center justify-between py-4"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{project.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.startTime).toLocaleDateString()} · {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-mono font-semibold">{formatTime(session.duration)}</p>
                        <p className="text-sm text-accent">
                          {formatCurrency((session.duration / 3600) * project.hourlyRate)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteSession(session.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
