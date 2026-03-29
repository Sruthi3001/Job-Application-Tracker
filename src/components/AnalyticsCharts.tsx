import { useMemo } from 'react';
import { JobApplication, STATUS_CONFIG, ApplicationStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  saved: 'hsl(0, 30%, 70%)',
  applied: 'hsl(0, 60%, 65%)',
  screening: 'hsl(0, 75%, 58%)',
  interview: 'hsl(0, 85%, 52%)',
  offer: 'hsl(0, 100%, 68%)',
  rejected: 'hsl(0, 40%, 45%)',
};

export function AnalyticsCharts({ applications }: { applications: JobApplication[] }) {
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach(a => { counts[a.status] = (counts[a.status] || 0) + 1; });
    return Object.entries(counts).map(([status, count]) => ({
      name: STATUS_CONFIG[status as ApplicationStatus]?.label || status,
      value: count,
      color: STATUS_COLORS[status] || '#888',
    }));
  }, [applications]);

  const timelineData = useMemo(() => {
    const byWeek: Record<string, number> = {};
    applications.forEach(a => {
      const d = new Date(a.dateApplied);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split('T')[0];
      byWeek[key] = (byWeek[key] || 0) + 1;
    });
    return Object.entries(byWeek)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count,
      }));
  }, [applications]);

  const responseData = useMemo(() => {
    const responded = applications.filter(a => ['screening', 'interview', 'offer', 'rejected'].includes(a.status)).length;
    const noResponse = applications.filter(a => ['saved', 'applied'].includes(a.status)).length;
    return [
      { name: 'Responded', value: responded, color: 'hsl(0, 100%, 68%)' },
      { name: 'No Response', value: noResponse, color: 'hsl(0, 30%, 70%)' },
    ];
  }, [applications]);

  if (applications.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Applications Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(220, 10%, 46%)" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(220, 10%, 46%)" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(214, 20%, 90%)' }} />
              <Line type="monotone" dataKey="count" stroke="hsl(0, 100%, 68%)" strokeWidth={2} dot={{ fill: 'hsl(0, 100%, 68%)' }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(0, 35%, 85%)' }} />
              <recharts.Legend verticalAlign="bottom" height={36} formatter={(value: string) => <span style={{ fontSize: '12px' }}>{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Response Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={responseData} layout="vertical">
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(220, 10%, 46%)" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(220, 10%, 46%)" width={90} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(214, 20%, 90%)' }} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {responseData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
