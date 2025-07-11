// app/page.js
// Clean homepage for Misti Italian Learning App

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 mb-6">
            Benvenuto a Misti
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8">
            Your comprehensive Italian learning companion with premium audio and smart spaced repetition
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all transform hover:scale-105 shadow-lg">
              Start Learning
            </button>
            <button className="border-2 border-teal-600 text-teal-600 px-8 py-3 rounded-lg font-semibold hover:bg-teal-50 transition-all">
              Browse Dictionary
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Smart Learning</h3>
            <p className="text-gray-600">
              Spaced repetition algorithm adapts to your progress for optimal memory retention
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🎵</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Premium Audio</h3>
            <p className="text-gray-600">
              High-quality Italian neural voices for authentic pronunciation practice
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Rich Content</h3>
            <p className="text-gray-600">
              Comprehensive dictionary with grammatical tags and example usage
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-teal-600">2000+</div>
            <div className="text-gray-600">Italian Words</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600">4</div>
            <div className="text-gray-600">Premium Voices</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-600">CEFR</div>
            <div className="text-gray-600">Level Support</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">Free</div>
            <div className="text-gray-600">To Use</div>
          </div>
        </div>
      </div>
    </div>
  )
}
