import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import {
  Users,
  DollarSign,
  Megaphone,
  Briefcase,
  ChevronRight,
  Palette,
  Headphones,
  Building2,
  Cog,
  Scale,
  GraduationCap,
  ShieldCheck,
  FlaskConical,
  Package,
  Handshake,
} from 'lucide-react';
import API_BASE_URL from '../config';
import './TeamsList.css';

const TEAM_VISUALS = [
  {
    keywords: ['مالی', 'حسابداری', 'بودجه', 'خزانه'],
    icon: DollarSign,
    color: 'bg-emerald-500',
  },
  {
    keywords: ['بازاریابی', 'مارکتینگ', 'تبلیغات', 'برند'],
    icon: Megaphone,
    color: 'bg-fuchsia-500',
  },
  {
    keywords: ['فروش', 'تجاری', 'بازرگانی'],
    icon: Handshake,
    color: 'bg-blue-500',
  },
  {
    keywords: ['محصول', 'پروداکت'],
    icon: Package,
    color: 'bg-orange-500',
  },
  {
    keywords: ['طراحی', 'دیزاین', 'گرافیک', 'ui', 'ux'],
    icon: Palette,
    color: 'bg-pink-500',
  },
  {
    keywords: ['پشتیبانی', 'ساپورت', 'مشتری'],
    icon: Headphones,
    color: 'bg-cyan-500',
  },
  {
    keywords: ['عملیات', 'اپریشن', 'اجرایی'],
    icon: Cog,
    color: 'bg-slate-500',
  },
  {
    keywords: ['منابع انسانی', 'hr', 'استخدام'],
    icon: Building2,
    color: 'bg-rose-500',
  },
  {
    keywords: ['حقوقی', 'قرارداد', 'legal'],
    icon: Scale,
    color: 'bg-amber-600',
  },
  {
    keywords: ['آموزش', 'یادگیری', 'دانش'],
    icon: GraduationCap,
    color: 'bg-indigo-500',
  },
  {
    keywords: ['امنیت', 'حراست', 'compliance'],
    icon: ShieldCheck,
    color: 'bg-red-500',
  },
  {
    keywords: ['تحقیق', 'توسعه', 'r&d', 'آزمایش'],
    icon: FlaskConical,
    color: 'bg-violet-500',
  },
];

const FALLBACK_VISUALS = [
  { icon: Users, color: 'bg-gray-500' },
  { icon: Briefcase, color: 'bg-sky-500' },
  { icon: Building2, color: 'bg-teal-500' },
  { icon: Package, color: 'bg-lime-500' },
];

function TeamsList({ token, onTeamClick, currentUser }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, [token]);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/teams`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTeams(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFallbackVisual = (teamName) => {
    const hash = Array.from(teamName).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return FALLBACK_VISUALS[hash % FALLBACK_VISUALS.length];
  };

  const getTeamVisual = (teamName = '') => {
    const normalizedName = teamName.trim().toLowerCase();
    const matchedVisual = TEAM_VISUALS.find(({ keywords }) =>
      keywords.some((keyword) => normalizedName.includes(keyword))
    );

    if (matchedVisual) {
      return matchedVisual;
    }

    return getFallbackVisual(normalizedName || 'team');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="teams-list-container" dir="rtl">
      <div className="teams-header">
        <div>
          <h2 className="text-2xl font-semibold">تیم‌ها</h2>
          <p className="text-muted-foreground mt-1">
            {currentUser?.organization?.name ? `سازمان: ${currentUser.organization.name}` : 'مدیریت تیم‌های سازمان'}
          </p>
        </div>
      </div>

      <div className="teams-grid">
        {teams.map(team => {
          const teamVisual = getTeamVisual(team.name);
          const TeamIcon = teamVisual.icon;

          return (
          <Card 
            key={team.id} 
            className="team-card"
            onClick={() => onTeamClick(team.id)}
          >
            <div className="team-card-content">
              <div className={`team-icon ${teamVisual.color}`}>
                <TeamIcon className="w-6 h-6" />
              </div>
              <div className="team-info">
                <h3 className="team-name">{team.name}</h3>
                <p className="team-members">
                  {team.members_count === 0 ? (
                    <span className="text-orange-500">⚠️ تیم خالی</span>
                  ) : (
                    `${team.members_count} عضو`
                  )}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Card>
          );
        })}
      </div>

      {teams.length > 0 && teams.every(team => team.members_count === 0) && (
        <Card className="mt-6 p-6 bg-orange-50 border-orange-200">
          <div className="flex items-start gap-4">
            <div className="text-2xl">⚠️</div>
            <div>
              <h3 className="font-semibold text-orange-800 mb-2">
                تیم‌های خالی
              </h3>
              <p className="text-orange-700 mb-4">
                همه تیم‌ها خالی هستند. برای شروع، اعضا را به تیم‌ها اضافه کنید.
              </p>
              <p className="text-sm text-orange-600">
                تیم‌های خالی: {teams.map(t => t.name).join('، ')}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default TeamsList;
