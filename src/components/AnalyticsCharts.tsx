import { useMemo, useState } from 'react';
import { JobApplication, STATUS_CONFIG, ApplicationStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  saved: 'hsl(0, 30%, 70%)',
  applied: 'hsl(0, 60%, 65%)',
  under_review: 'hsl(205, 82%, 56%)',
  screening: 'hsl(0, 75%, 58%)',
  interview: 'hsl(0, 85%, 52%)',
  offer: 'hsl(0, 100%, 68%)',
  rejected: 'hsl(0, 40%, 45%)',
};

export function AnalyticsCharts({ applications }: { applications: JobApplication[] }) {
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [responseFilter, setResponseFilter] = useState<'all' | 'responded' | 'no-response'>('all');

  const monthOptions = useMemo(() => {
    const months = new Set<string>();
    for (const a of applications) {
      const d = new Date(a.dateApplied);
      if (Number.isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.add(key);
    }
    return Array.from(months)
      .sort((a, b) => b.localeCompare(a))
      .map(key => {
        const [y, m] = key.split('-').map(Number);
        const label = new Date(y, (m || 1) - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        return { key, label };
      });
  }, [applications]);

  const roleOptions = useMemo(() => {
    const roles = [...new Set(applications.map(a => a.role).filter(Boolean))];
    roles.sort((a, b) => a.localeCompare(b));
    return roles;
  }, [applications]);

  const filteredApps = useMemo(() => {
    return applications.filter(a => {
      const matchesMonth =
        monthFilter === 'all'
          ? true
          : (() => {
              const d = new Date(a.dateApplied);
              if (Number.isNaN(d.getTime())) return false;
              const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
              return key === monthFilter;
            })();

      const matchesRole = roleFilter === 'all' || a.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;

      const isResponded = ['under_review', 'screening', 'interview', 'offer', 'rejected'].includes(a.status);
      const matchesResponse =
        responseFilter === 'all' ? true : responseFilter === 'responded' ? isResponded : !isResponded;

      return matchesMonth && matchesRole && matchesStatus && matchesResponse;
    });
  }, [applications, monthFilter, roleFilter, statusFilter, responseFilter]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredApps.forEach(a => { counts[a.status] = (counts[a.status] || 0) + 1; });
    return Object.entries(counts).map(([status, count]) => ({
      name: STATUS_CONFIG[status as ApplicationStatus]?.label || status,
      value: count,
      color: STATUS_COLORS[status] || '#888',
    }));
  }, [filteredApps]);

  const timelineData = useMemo(() => {
    const byWeek: Record<string, number> = {};
    filteredApps.forEach(a => {
      const d = new Date(a.dateApplied);
      if (Number.isNaN(d.getTime())) return;
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
  }, [filteredApps]);

  const responseData = useMemo(() => {
    const responded = filteredApps.filter(a => ['under_review', 'screening', 'interview', 'offer', 'rejected'].includes(a.status)).length;
    const noResponse = filteredApps.filter(a => ['saved', 'applied'].includes(a.status)).length;
    return [
      { name: 'Responded', value: responded, color: 'hsl(0, 100%, 68%)' },
      { name: 'No Response', value: noResponse, color: 'hsl(0, 30%, 70%)' },
    ];
  }, [filteredApps]);

  if (applications.length === 0) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All months</SelectItem>
                {monthOptions.map(m => (
                  <SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                {roleOptions.map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="saved">Saved</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="screening">Screening</SelectItem>
                <SelectItem value="interview">Interview</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={responseFilter} onValueChange={(v) => setResponseFilter(v as typeof responseFilter)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Response rate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All (responded + no response)</SelectItem>
                <SelectItem value="responded">Responded only</SelectItem>
                <SelectItem value="no-response">No response only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Showing <span className="font-medium text-foreground">{filteredApps.length}</span> of{' '}
            <span className="font-medium text-foreground">{applications.length}</span> applications.
          </p>
        </CardContent>
      </Card>

      {filteredApps.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No applications match the selected filters.
          </CardContent>
        </Card>
      ) : (
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
              <Legend verticalAlign="bottom" height={36} formatter={(value: string) => <span style={{ fontSize: '12px' }}>{value}</span>} />
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
      )}
    </div>
  );
}
