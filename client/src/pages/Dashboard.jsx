import Card from '../components/ui/Card';
import { CheckCircle2, Clock3, TrendingUp } from 'lucide-react';
import './Dashboard.css';

/**
 * Dashboard page (authenticated users' home)
 * Shows daily summary and quick links
 */
function Dashboard() {
  // Placeholder user data (would come from context/API)
  const userStats = {
    focusMinutes: 95,
    completedTasks: 3,
    aiMessagesUsed: 3,
    aiMessagesLimit: 10,
    todaysChallengeComplete: false,
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Welcome back</h1>
        <p>Keep your study sessions steady and focused.</p>
      </div>

      {/* Summary Grid */}
      <div className="dashboard-grid">
        {/* Focus Card */}
        <Card className="summary-card">
          <div className="card-icon focus-icon">
            <Clock3 size={24} />
          </div>
          <div className="card-content">
            <p className="card-label">Study Time Today</p>
            <p className="card-value">{userStats.focusMinutes} min</p>
          </div>
        </Card>

        {/* Task Card */}
        <Card className="summary-card">
          <div className="card-icon task-icon">
            <CheckCircle2 size={24} />
          </div>
          <div className="card-content">
            <p className="card-label">Completed Tasks</p>
            <p className="card-value">{userStats.completedTasks}</p>
          </div>
        </Card>

        {/* AI Messages Card */}
        <Card className="summary-card">
          <div className="card-icon ai-icon">
            <TrendingUp size={24} />
          </div>
          <div className="card-content">
            <p className="card-label">AI Messages</p>
            <p className="card-value">
              {userStats.aiMessagesLimit - userStats.aiMessagesUsed} / {userStats.aiMessagesLimit}
            </p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${(userStats.aiMessagesUsed / userStats.aiMessagesLimit) * 100}%`,
                }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Daily Challenge */}
      <Card className="challenge-section">
        <div className="challenge-header">
          <h2>Focus Task</h2>
        </div>
        <p className="challenge-question">
          Explain event bubbling in JavaScript using one real UI example and one sentence on when to use
          event delegation.
        </p>
        <button className="challenge-btn">
          {userStats.todaysChallengeComplete ? 'Completed' : 'Mark as Complete'}
        </button>
      </Card>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <div className="action-card">
            <h3>Start a Discussion</h3>
            <p>Ask a question in the forums</p>
            <button>Browse Forums</button>
          </div>
          <div className="action-card">
            <h3>Join a Study Group</h3>
            <p>Connect with peers and learn together</p>
            <button>View Groups</button>
          </div>
          <div className="action-card">
            <h3>Get AI Help</h3>
            <p>Guided learning with StudyBot</p>
            <button>Open AI Tutor</button>
          </div>
          <div className="action-card">
            <h3>Explore Community</h3>
            <p>See what other learners are discussing</p>
            <button>View Leaderboard</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
