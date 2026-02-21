import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users, DollarSign, Megaphone, Briefcase, ChevronRight } from 'lucide-react';
import API_BASE_URL from '../config';
import './TeamsList.css';

function TeamsList({ token, onTeamClick }) {
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganization();
  }, []);

  const fetchOrganization = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/organizations/default`);
      if (response.ok) {
        const data = await response.json();
        setOrganization(data);
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTeamIcon = (teamName) => {
    if (teamName.includes('مالی')) return <DollarSign className="w-6 h-6" />;
    if (teamName.includes('بازاریابی')) return <Megaphone className="w-6 h-6" />;
    if (teamName.includes('فروش')) return <Briefcase className="w-6 h-6" />;
    return <Users className="w-6 h-6" />;
  };

  const getTeamColor = (teamName) => {
    if (teamName.includes('مالی')) return 'bg-green-500';
    if (teamName.includes('بازاریابی')) return 'bg-purple-500';
    if (teamName.includes('فروش')) return 'bg-blue-500';
    return 'bg-gray-500';
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
            {organization ? `سازمان: ${organization.name}` : 'مدیریت تیم‌های سازمان'}
          </p>
        </div>
      </div>

      <div className="teams-grid">
        {organization?.teams?.map(team => (
          <Card 
            key={team.id} 
            className="team-card"
            onClick={() => onTeamClick(team.id)}
          >
            <div className="team-card-content">
              <div className={`team-icon ${getTeamColor(team.name)}`}>
                {getTeamIcon(team.name)}
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
        ))}
      </div>

      {organization?.teams?.every(team => team.members_count === 0) && (
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
                تیم‌های خالی: {organization.teams.map(t => t.name).join('، ')}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default TeamsList;
