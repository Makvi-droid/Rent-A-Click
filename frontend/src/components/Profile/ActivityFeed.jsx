
import { Activity } from 'lucide-react';


const ActivityFeed = ({ activities }) => (
  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
      <Activity className="w-5 h-5 text-purple-400" />
      Recent Activity
    </h3>
    
    
  </div>
);

export default ActivityFeed