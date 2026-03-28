import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function LandingPage() {
  const { token, user } = useAuth();
  const isApproved = Boolean(token && user?.status === 'approved');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main>
        <section className="relative overflow-hidden min-h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary-200 dark:bg-primary-900 opacity-30 blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary-300 dark:bg-primary-800 opacity-20 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 mb-6">
              🎓 Exclusively for Mabini Colleges Inc.
            </span>

            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
              Learn Together,<br />
              <span className="text-primary-600 dark:text-primary-400">
                Grow Together
              </span>
            </h1>

            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10">
              StudyBridge connects Mabini Colleges students, instructors,
              and alumni in one structured platform for peer learning
              and knowledge sharing.
            </p>

            <div className="flex gap-4 justify-center flex-wrap">
              {isApproved ? (
                <Link
                  to="/dashboard"
                  className="px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition shadow-lg shadow-primary-200 dark:shadow-primary-900"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition shadow-lg shadow-primary-200 dark:shadow-primary-900"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/forum"
                    className="px-8 py-3 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold border border-gray-200 dark:border-gray-700 transition"
                  >
                    Browse Forum
                  </Link>
                </>
              )}
            </div>

            <div className="flex gap-8 justify-center flex-wrap mt-14">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  9+
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Departments
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  3
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Ways to Learn
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  ∞
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Knowledge Shared
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 px-4 bg-white dark:bg-gray-900">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to learn smarter
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              One platform. Multiple ways to collaborate, share, and grow
              with your Mabini Colleges community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all duration-200">
              <div className="text-3xl mb-4">💬</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Community Forum</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Post academic questions and get answers from
                verified peers, instructors, and alumni within
                Mabini Colleges.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all duration-200">
              <div className="text-3xl mb-4">🤝</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Peer Matching</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Find peers with the skills you need. Connect for
                private 1-on-1 sessions or open group study rooms.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all duration-200">
              <div className="text-3xl mb-4">🏆</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Recognition System</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Earn contribution points, unlock badge levels, and
                climb the leaderboard for every question answered
                and session led.
              </p>
            </div>
          </div>
        </section>

        <section className="py-24 px-4 bg-gray-50 dark:bg-gray-950">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              How StudyBridge works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-2xl mx-auto mb-4">
                📝
              </div>
              <div className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">
                Step 1
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Register
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Sign up with your Mabini Colleges credentials
                and verify your identity.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-2xl mx-auto mb-4">
                🔍
              </div>
              <div className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">
                Step 2
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Explore
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Browse the forum, search for topics, and find
                peers with the skills you need.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-2xl mx-auto mb-4">
                💡
              </div>
              <div className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">
                Step 3
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Collaborate
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Post questions, join study sessions, and share
                your knowledge with the community.
              </p>
            </div>

            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-2xl mx-auto mb-4">
                ⭐
              </div>
              <div className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">
                Step 4
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Earn Recognition
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Accumulate points, unlock badges, and build your
                academic reputation.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-primary-600 dark:bg-primary-800">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to start learning together?
            </h2>
            <p className="text-primary-100 mb-8">
              Join the Mabini Colleges peer learning community today.
            </p>
            <Link
              to="/register"
              className="inline-block px-8 py-3 rounded-xl bg-white hover:bg-gray-50 text-primary-700 font-semibold transition shadow-lg"
            >
              Create your account
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xl font-bold">
            <span className="text-primary-600 dark:text-primary-400">
              Study
            </span>
            <span className="text-gray-800 dark:text-white">Bridge</span>
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            © 2025 StudyBridge · Mabini Colleges Inc.
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            A peer-to-peer knowledge exchange platform.
            Not an official institutional service.
          </p>
        </div>
      </footer>
    </div>
  );
}
