import { useCRM } from '@/context/CRMContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { 
  FolderKanban, 
  Clock, 
  DollarSign, 
  AlertCircle,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';
import { formatTime, formatCurrency, formatDateShort, isOverdue, daysUntil } from '@/lib/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { projects, clients, getTotalTimeForProject, getTodayTrackedTime } = useCRM();

  const activeProjects = projects.filter(p => p.status === 'in-progress');
  const totalHours = projects.reduce((acc, p) => acc + getTotalTimeForProject(p.id), 0);
  const todayTime = getTodayTrackedTime();

  const totalEarnings = projects.reduce((acc, project) => {
    const timeInHours = getTotalTimeForProject(project.id) / 3600;
    return acc + (timeInHours * project.hourlyRate);
  }, 0);

  const upcomingDeadlines = projects
    .filter(p => p.status === 'in-progress' && p.deadline)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5);

  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'No client';
  };

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Dashboard" 
        description="Welcome back! Here's an overview of your freelance business."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="Active Projects"
          value={activeProjects.length}
          subtitle={`${projects.length} total projects`}
          icon={<FolderKanban className="w-6 h-6 text-primary-foreground" />}
          variant="primary"
        />
        <StatCard
          title="Total Tracked"
          value={formatTime(totalHours)}
          subtitle={`Today: ${formatTime(todayTime)}`}
          icon={<Clock className="w-6 h-6 text-muted-foreground" />}
        />
        <StatCard
          title="Total Earnings"
          value={formatCurrency(totalEarnings)}
          icon={<DollarSign className="w-6 h-6 text-accent-foreground" />}
          variant="accent"
        />
        <StatCard
          title="Total Clients"
          value={clients.length}
          subtitle="Active partnerships"
          icon={<Users className="w-6 h-6 text-muted-foreground" />}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Upcoming Deadlines
            </CardTitle>
            <Link to="/calendar">
              <Button variant="ghost" size="sm">View Calendar</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No upcoming deadlines
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((project) => {
                  const days = daysUntil(project.deadline);
                  const overdue = isOverdue(project.deadline);
                  
                  return (
                    <div 
                      key={project.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {project.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {getClientName(project.clientId)}
                        </p>
                      </div>
                      <Badge 
                        variant="outline"
                        className={cn(
                          "ml-3",
                          overdue 
                            ? "border-destructive/50 bg-destructive/10 text-destructive"
                            : days <= 3
                              ? "border-warning/50 bg-warning/10 text-warning"
                              : "border-muted-foreground/30"
                        )}
                      >
                        {overdue ? 'Overdue' : days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days} days`}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Recent Projects
            </CardTitle>
            <Link to="/projects">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No projects yet</p>
                <Link to="/projects">
                  <Button size="sm">Create Project</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((project) => {
                  const timeSpent = getTotalTimeForProject(project.id);
                  const earnings = (timeSpent / 3600) * project.hourlyRate;
                  
                  return (
                    <div 
                      key={project.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {project.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(timeSpent)} tracked
                        </p>
                      </div>
                      <div className="text-right ml-3">
                        <p className="font-semibold text-accent">
                          {formatCurrency(earnings)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(project.hourlyRate)}/hr
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {(projects.length === 0 || clients.length === 0) && (
        <Card className="shadow-md border-dashed">
          <CardContent className="py-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Get Started</h3>
              <p className="text-muted-foreground mb-6">
                Start tracking your freelance work by adding clients and projects.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/clients">
                  <Button className="gap-2">
                    <Users className="w-4 h-4" />
                    Add Your First Client
                  </Button>
                </Link>
                <Link to="/projects">
                  <Button variant="outline" className="gap-2">
                    <FolderKanban className="w-4 h-4" />
                    Create a Project
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
