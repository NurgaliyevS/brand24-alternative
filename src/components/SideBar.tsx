
import React from 'react';
import { 
  BarChart3, 
  Bookmark, 
  Bell, 
  Settings, 
  Search,
  TrendingUp,
  Users,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const Sidebar = ({ activeView, onViewChange }: SidebarProps) => {
  const menuItems = [
    { id: 'feed', label: 'Feed', icon: MessageSquare },
    // { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
    // { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    // { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const keywords = [
    { id: 'reddit-brand', label: 'reddit brand', color: 'bg-green-500' },
    { id: 'social-monitoring', label: 'social monitoring', color: 'bg-orange-500' },
    { id: 'competitor-analysis', label: 'competitor analysis', color: 'bg-blue-500' },
    { id: 'brand-sentiment', label: 'brand sentiment', color: 'bg-purple-500' },
    { id: 'reddit-api', label: 'reddit api', color: 'bg-red-500' },
  ];

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen p-4">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
          <Search className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-gray-900">RedditLens</span>
      </div>

      {/* Main Menu */}
      <nav className="space-y-1 mb-8">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
              activeView === item.id
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Keywords Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Keywords</h3>
          <button className="text-blue-600 hover:text-blue-700">
            <span className="text-xs">+ Add keyword</span>
          </button>
        </div>
        <div className="space-y-2">
          {keywords.map((keyword) => (
            <div key={keyword.id} className="flex items-center gap-2 px-2 py-1 text-sm text-gray-700">
              <div className={`w-2 h-2 rounded-full ${keyword.color}`}></div>
              <span className="flex-1 truncate">{keyword.label}</span>
              <button className="text-gray-400 hover:text-gray-600">
                <span className="text-xs">•••</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Trial Info */}
      <div className="mt-8 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700 font-medium mb-1">Free Trial</p>
        <p className="text-xs text-blue-600 mb-2">Trial ends in 4 days. Upgrade now</p>
      </div>
    </div>
  );
};

export default Sidebar;
