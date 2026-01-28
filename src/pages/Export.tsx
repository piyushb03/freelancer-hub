import { useCRM } from '@/context/CRMContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, FileSpreadsheet, Download } from 'lucide-react';
import { formatTime, formatCurrency, getStatusLabel, formatDate } from '@/lib/formatters';
import { toast } from 'sonner';

export default function Export() {
  const { projects, clients, getTotalTimeForProject, getClientById } = useCRM();

  const generateCSV = () => {
    if (projects.length === 0) {
      toast.error('No projects to export');
      return;
    }

    const headers = ['Project Name', 'Client', 'Status', 'Hourly Rate', 'Time Tracked (hours)', 'Earnings', 'Deadline', 'Description'];
    
    const rows = projects.map(project => {
      const client = getClientById(project.clientId);
      const timeInSeconds = getTotalTimeForProject(project.id);
      const timeInHours = (timeInSeconds / 3600).toFixed(2);
      const earnings = ((timeInSeconds / 3600) * project.hourlyRate).toFixed(2);
      
      return [
        `"${project.name}"`,
        `"${client?.name || 'N/A'}"`,
        getStatusLabel(project.status),
        project.hourlyRate.toFixed(2),
        timeInHours,
        earnings,
        project.deadline ? formatDate(project.deadline) : 'No deadline',
        `"${project.description.replace(/"/g, '""')}"`
      ].join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `freelance-crm-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('CSV exported successfully!');
  };

  const generatePDF = () => {
    if (projects.length === 0) {
      toast.error('No projects to export');
      return;
    }

    const totalEarnings = projects.reduce((acc, project) => {
      const timeInHours = getTotalTimeForProject(project.id) / 3600;
      return acc + (timeInHours * project.hourlyRate);
    }, 0);

    const totalHours = projects.reduce((acc, project) => {
      return acc + getTotalTimeForProject(project.id);
    }, 0);

    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>FreelanceCRM Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          h1 { color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 10px; }
          h2 { color: #666; margin-top: 30px; }
          .summary { display: flex; gap: 40px; margin: 20px 0; padding: 20px; background: #f5f5f5; border-radius: 8px; }
          .summary-item { text-align: center; }
          .summary-value { font-size: 24px; font-weight: bold; color: #0d9488; }
          .summary-label { font-size: 12px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background: #f5f5f5; font-weight: 600; }
          .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
          .in-progress { background: #e0f2fe; color: #0369a1; }
          .completed { background: #dcfce7; color: #15803d; }
          .postponed { background: #fef3c7; color: #b45309; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <h1>FreelanceCRM Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
        
        <div class="summary">
          <div class="summary-item">
            <div class="summary-value">${projects.length}</div>
            <div class="summary-label">Total Projects</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${(totalHours / 3600).toFixed(1)}h</div>
            <div class="summary-label">Total Hours</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">$${totalEarnings.toFixed(2)}</div>
            <div class="summary-label">Total Earnings</div>
          </div>
          <div class="summary-item">
            <div class="summary-value">${clients.length}</div>
            <div class="summary-label">Total Clients</div>
          </div>
        </div>

        <h2>Projects</h2>
        <table>
          <thead>
            <tr>
              <th>Project</th>
              <th>Client</th>
              <th>Status</th>
              <th>Rate</th>
              <th>Hours</th>
              <th>Earnings</th>
            </tr>
          </thead>
          <tbody>
            ${projects.map(project => {
              const client = getClientById(project.clientId);
              const timeInSeconds = getTotalTimeForProject(project.id);
              const timeInHours = (timeInSeconds / 3600).toFixed(2);
              const earnings = ((timeInSeconds / 3600) * project.hourlyRate).toFixed(2);
              const statusClass = project.status;
              
              return `
                <tr>
                  <td>${project.name}</td>
                  <td>${client?.name || 'N/A'}</td>
                  <td><span class="status ${statusClass}">${getStatusLabel(project.status)}</span></td>
                  <td>$${project.hourlyRate}/hr</td>
                  <td>${timeInHours}h</td>
                  <td>$${earnings}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>This report was generated by FreelanceCRM</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      
      // Small delay to ensure content is loaded
      setTimeout(() => {
        printWindow.print();
      }, 250);
      
      toast.success('PDF ready to print/save!');
    } else {
      toast.error('Please allow popups to generate PDF');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Export Data"
        description="Export your project data for reporting or backup"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CSV Export */}
        <Card className="shadow-md hover-lift">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-success/10">
                <FileSpreadsheet className="w-6 h-6 text-success" />
              </div>
              <div>
                <CardTitle className="text-lg">Export to CSV</CardTitle>
                <CardDescription>
                  Download data in spreadsheet format
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Export all project data including time tracked and earnings to a CSV file. 
              Perfect for importing into Excel or Google Sheets.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Project details & status</li>
              <li>• Client information</li>
              <li>• Time tracked & earnings</li>
              <li>• Deadlines & descriptions</li>
            </ul>
            <Button 
              onClick={generateCSV} 
              className="w-full gap-2"
              disabled={projects.length === 0}
            >
              <Download className="w-4 h-4" />
              Download CSV
            </Button>
          </CardContent>
        </Card>

        {/* PDF Export */}
        <Card className="shadow-md hover-lift">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-destructive/10">
                <FileText className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-lg">Export to PDF</CardTitle>
                <CardDescription>
                  Generate a printable report
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Generate a formatted PDF report with project summaries, 
              time tracking data, and earnings overview.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Professional report layout</li>
              <li>• Summary statistics</li>
              <li>• Project breakdown table</li>
              <li>• Print or save as PDF</li>
            </ul>
            <Button 
              onClick={generatePDF} 
              variant="outline"
              className="w-full gap-2"
              disabled={projects.length === 0}
            >
              <FileText className="w-4 h-4" />
              Generate PDF Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Data Preview */}
      {projects.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Export Preview</CardTitle>
            <CardDescription>
              {projects.length} projects will be included in the export
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Project</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Client</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Time</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.slice(0, 5).map(project => {
                    const client = getClientById(project.clientId);
                    const timeSpent = getTotalTimeForProject(project.id);
                    const earnings = (timeSpent / 3600) * project.hourlyRate;
                    
                    return (
                      <tr key={project.id} className="border-b border-border/50">
                        <td className="py-3 px-4 font-medium">{project.name}</td>
                        <td className="py-3 px-4 text-muted-foreground">{client?.name || 'N/A'}</td>
                        <td className="py-3 px-4">{formatTime(timeSpent)}</td>
                        <td className="py-3 px-4 text-accent font-medium">{formatCurrency(earnings)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {projects.length > 5 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  ... and {projects.length - 5} more projects
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
