import Chat from '@/components/Chat';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">📱</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">MobileGenius</h1>
                <p className="text-sm text-gray-600">AI-Powered Phone Shopping Assistant</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
              <span>✅ Safe & Secure</span>
              <span>🤖 AI-Powered</span>
              <span>📊 Real Comparisons</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Interface */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Chat />
      </div>

      {/* Footer */}
      <footer className="mt-16 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">How it works</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>💬 Ask about any phone in natural language</li>
                <li>🔍 Get personalized recommendations</li>
                <li>⚖️ Compare phones side-by-side</li>
                <li>🛡️ Safe from misleading information</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Example Queries</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>"Best camera phone under ₹30k"</li>
                <li>"Compare iPhone 15 vs Galaxy S24"</li>
                <li>"Gaming phone with 120Hz display"</li>
                <li>"Explain OIS vs EIS in cameras"</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Safety Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>🔒 Adversarial prompt protection</li>
                <li>✅ Fact-checked information only</li>
                <li>🚫 No bias or brand defamation</li>
                <li>⚡ Real-time safety validation</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>© 2024 MobileGenius. Built with Next.js, Google Gemini AI, and ❤️</p>
          </div>
        </div>
      </footer>
    </main>
  );
}