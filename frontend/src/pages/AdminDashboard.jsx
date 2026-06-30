import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { Users, MessageSquare, Server, Shield, UserPlus, Activity, Home } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { Link, useNavigate } from "react-router";
import PageLoader from "../components/PageLoader";

function StatCard({ title, value, icon: Icon, colorClass }) {
  return (
    <div
      className="p-6 rounded-2xl shadow-xl border transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "var(--bg-card)",
        borderColor: "var(--border-color)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold tracking-wider uppercase opacity-80" style={{ color: "var(--text-muted)" }}>
          {title}
        </h3>
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-4xl font-bold" style={{ color: "var(--text-main)" }}>
        {value}
      </p>
    </div>
  );
}

function AdminDashboard() {
  const { authUser } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authUser && !authUser.isAdmin) {
      navigate("/");
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get("/admin/stats");
        setStats(res.data);
      } catch (error) {
        console.error("Failed to load admin stats", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [authUser, navigate]);

  if (isLoading) return <PageLoader />;

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-400">Error loading dashboard</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full p-4 sm:p-8 relative overflow-hidden"
      style={{ background: "var(--bg-app)" }}
    >
      <div className="max-w-6xl mx-auto space-y-8 relative z-10 animate-fadeIn">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b" style={{ borderColor: "var(--border-color)" }}>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/20 text-red-500 rounded-xl">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>
                Admin Dashboard
              </h1>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Platform overview and management
              </p>
            </div>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:bg-slate-700/50"
            style={{ color: "var(--text-main)", background: "var(--bg-input)" }}
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Back to App</span>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={Users}
            colorClass="bg-blue-500/20 text-blue-400"
          />
          <StatCard
            title="Total Messages"
            value={stats.totalMessages.toLocaleString()}
            icon={MessageSquare}
            colorClass="bg-emerald-500/20 text-emerald-400"
          />
          <StatCard
            title="Total Groups"
            value={stats.totalGroups.toLocaleString()}
            icon={Server}
            colorClass="bg-purple-500/20 text-purple-400"
          />
          <StatCard
            title="Online Users"
            value={stats.onlineUsersCount.toLocaleString()}
            icon={Activity}
            colorClass="bg-rose-500/20 text-rose-400 animate-pulse"
          />
        </div>

        {/* Recent Users Table */}
        <div
          className="rounded-2xl shadow-xl border overflow-hidden"
          style={{ background: "var(--bg-card)", borderColor: "var(--border-color)" }}
        >
          <div className="p-6 border-b" style={{ borderColor: "var(--border-color)" }}>
            <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: "var(--text-main)" }}>
              <UserPlus className="w-5 h-5 text-indigo-400" />
              Recent Signups
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase" style={{ background: "var(--bg-input)", color: "var(--text-muted)" }}>
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b last:border-0 hover:bg-slate-700/10 transition-colors"
                    style={{ borderColor: "var(--border-color)" }}
                  >
                    <td className="px-6 py-4 font-medium flex items-center gap-3">
                      <img src={user.profilePic || "/avatar.png"} alt={user.fullName} className="w-8 h-8 rounded-full" />
                      <span style={{ color: "var(--text-main)" }}>{user.fullName}</span>
                    </td>
                    <td className="px-6 py-4" style={{ color: "var(--text-muted)" }}>{user.email}</td>
                    <td className="px-6 py-4" style={{ color: "var(--text-muted)" }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {user.isOnline ? (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">Online</span>
                      ) : (
                        <span className="px-2 py-1 bg-slate-500/20 text-slate-400 rounded-full text-xs font-semibold">Offline</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;
