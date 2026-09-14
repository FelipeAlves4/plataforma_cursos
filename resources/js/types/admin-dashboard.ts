export type Period = '7d' | '30d' | '90d' | 'year' | 'all';

export type Change = number | null;

export type GrowthPoint = {
    date: string;
    label: string;
    value: number;
};

export type DashboardData = {
    period: Period;
    summary: {
        students: { total: number; new: number; change: Change };
        activeStudents: { total: number; percentage: number; change: Change };
        revenue: { amountCents: number; sales: number; change: Change };
        completionRate: { percentage: number; change: Change };
    };
    studentsGrowth: GrowthPoint[];
    revenueGrowth: GrowthPoint[];
    coursePerformance: {
        id: number;
        title: string;
        students: number;
        started: number;
        completed: number;
        completionRate: number;
        averageProgress: number;
    }[];
    engagement: { active: number; inactive: number; notStarted: number; atRisk: number };
    atRiskStudents: {
        userId: number;
        name: string;
        courseId: number;
        course: string;
        progress: number;
        lastActivityAt: string | null;
        status: 'Não iniciou' | 'Baixo progresso' | 'Inativo' | 'Risco de abandono';
    }[];
    dropoffPoints: { lesson: string; arrived: number; stalled: number; rate: number }[];
    recentActivity: { id: string; type: 'enrollment' | 'started' | 'completion' | 'sale' | 'student'; title: string; occurredAt: string }[];
};
