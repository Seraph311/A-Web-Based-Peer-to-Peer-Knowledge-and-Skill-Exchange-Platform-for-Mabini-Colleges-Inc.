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
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 mb-8 border border-primary-200 dark:border-primary-800 animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></span>
              Exclusively for Mabini Colleges Inc.
            </span>

            <h1 className="text-6xl sm:text-7xl font-heading font-extrabold text-gray-900 dark:text-white leading-[1.1] mb-8 tracking-tight animate-fade-in-up-delay-1">
              Learn Together,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-warm-500 dark:from-primary-400 dark:to-warm-400">
                Grow Together
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed font-body animate-fade-in-up-delay-2">
              StudyBridge connects Mabini Colleges students, instructors,
              and alumni in one structured platform for peer learning
              and knowledge sharing.
            </p>

            <div className="flex gap-4 justify-center flex-wrap animate-fade-in-up-delay-3">
              {isApproved ? (
                <Link
                  to="/dashboard"
                  className="px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-heading font-semibold transition-all duration-300 shadow-lg shadow-primary-200 dark:shadow-primary-900 hover:shadow-xl hover:scale-105"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="px-8 py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-heading font-semibold transition-all duration-300 shadow-lg shadow-primary-200 dark:shadow-primary-900 hover:shadow-xl hover:scale-105"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/forum"
                    className="px-8 py-3 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-heading font-semibold border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:border-primary-300 dark:hover:border-primary-600"
                  >
                    Browse Forum
                  </Link>
                </>
              )}
            </div>

            <div className="flex gap-12 justify-center flex-wrap mt-16">
              <div className="text-center">
                <div className="text-5xl font-heading font-bold text-gray-900 dark:text-white">
                  9+
                </div>
                <div className="text-base text-gray-500 dark:text-gray-400 mt-2 font-body">
                  Departments
                </div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-heading font-bold text-gray-900 dark:text-white">
                  3
                </div>
                <div className="text-base text-gray-500 dark:text-gray-400 mt-2 font-body">
                  Ways to Learn
                </div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-heading font-bold text-gray-900 dark:text-white">
                  ∞
                </div>
                <div className="text-base text-gray-500 dark:text-gray-400 mt-2 font-body">
                  Knowledge Shared
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-28 px-4 bg-white dark:bg-gray-900">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm font-heading font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-4 block">
              Features
            </span>
            <h2 className="text-4xl sm:text-5xl font-heading font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Everything you need to learn smarter
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-body max-w-xl mx-auto">
              One platform. Multiple ways to collaborate, share, and grow
              with your Mabini Colleges community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="group bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xl hover:shadow-primary-100 dark:hover:shadow-primary-900/20 transition-all duration-300 relative overflow-hidden animate-fade-in-up">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100 to-transparent dark:from-primary-900/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mb-6 shadow-lg shadow-primary-200 dark:shadow-primary-900/50">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-3">Community Forum</h3>
                <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed">
                  Post academic questions and get answers from
                  verified peers, instructors, and alumni within
                  Mabini Colleges.
                </p>
              </div>
            </div>

            <div className="group bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xl hover:shadow-primary-100 dark:hover:shadow-primary-900/20 transition-all duration-300 relative overflow-hidden animate-fade-in-up-delay-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-warm-100 to-transparent dark:from-warm-900/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-warm-500 to-warm-600 flex items-center justify-center mb-6 shadow-lg shadow-warm-200 dark:shadow-warm-900/50">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-3">Peer Matching</h3>
                <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed">
                  Find peers with the skills you need. Connect for
                  private 1-on-1 sessions or open group study rooms.
                </p>
              </div>
            </div>

            <div className="group bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xl hover:shadow-primary-100 dark:hover:shadow-primary-900/20 transition-all duration-300 relative overflow-hidden animate-fade-in-up-delay-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100 to-transparent dark:from-primary-900/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mb-6 shadow-lg shadow-primary-200 dark:shadow-primary-900/50 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-900 dark:text-white mb-3">Recognition System</h3>
                <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed">
                  Earn contribution points, unlock badge levels, and
                  climb the leaderboard for every question answered
                  and session led.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-28 px-4 bg-gray-50 dark:bg-gray-950">
          <div className="text-center mb-16">
            <span className="text-sm font-heading font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-4 block">
              Getting Started
            </span>
            <h2 className="text-4xl sm:text-5xl font-heading font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              How StudyBridge works
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg font-body max-w-xl mx-auto">
              Get started in four simple steps and join thousands of students already learning together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary-200 dark:shadow-primary-900/50">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-xs font-heading font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">
                Step 1
              </div>
              <h3 className="font-heading font-semibold text-gray-900 dark:text-white mb-2">
                Register
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-body">
                Sign up with your Mabini Colleges credentials
                and verify your identity.
              </p>
            </div>

            <div className="text-center relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-warm-500 to-warm-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-warm-200 dark:shadow-warm-900/50">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="text-xs font-heading font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">
                Step 2
              </div>
              <h3 className="font-heading font-semibold text-gray-900 dark:text-white mb-2">
                Explore
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-body">
                Browse the forum, search for topics, and find
                peers with the skills you need.
              </p>
            </div>

            <div className="text-center relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-200 dark:shadow-blue-900/50">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="text-xs font-heading font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">
                Step 3
              </div>
              <h3 className="font-heading font-semibold text-gray-900 dark:text-white mb-2">
                Collaborate
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-body">
                Post questions, join study sessions, and share
                your knowledge with the community.
              </p>
            </div>

            <div className="text-center relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-200 dark:shadow-purple-900/50">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div className="text-xs font-heading font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-2">
                Step 4
              </div>
              <h3 className="font-heading font-semibold text-gray-900 dark:text-white mb-2">
                Earn Recognition
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-body">
                Accumulate points, unlock badges, and build your
                academic reputation.
              </p>
            </div>
          </div>
        </section>

        <section className="py-24 px-4 bg-gradient-to-r from-primary-600 via-primary-500 to-warm-500 dark:from-primary-800 dark:via-primary-700 dark:to-warm-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
          <div className="text-center max-w-2xl mx-auto relative z-10">
            <h2 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-6 leading-tight">
              Ready to start<br/>learning together?
            </h2>
            <p className="text-primary-100 text-lg mb-10 font-body">
              Join the Mabini Colleges peer learning community today.
            </p>
            <Link
              to="/register"
              className="inline-block px-10 py-4 rounded-2xl bg-white hover:bg-gray-50 text-primary-700 font-heading font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
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
