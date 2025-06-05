const Settings = () => {
  return (
    <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Account & Settings</h1>
        <div className="sidebar_tone rounded-lg p-6">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Profile Settings</h3>
                    <div className="space-y-3">
                        <input 
                            type="text" 
                            placeholder="Your Name" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-2">Preferences</h3>
                    <div className="space-y-3">
                        <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span>Auto-save summaries as PDF</span>
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <span>Email notifications</span>
                        </label>
                    </div>
                </div>
                <button className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition">
                        Save Changes
                </button>
            </div>
        </div>
    </div>
);
}

export default Settings;