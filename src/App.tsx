import nmitLogo from './nmit logo.jpg';
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Sparkles, 
  PlusCircle, 
  Bookmark, 
  Award, 
  AlertTriangle, 
  Clock, 
  GraduationCap, 
  TrendingUp, 
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { LecturePulseProvider, useLecturePulse } from './context/LecturePulseContext';
import { TopBar } from './components/TopBar';
import { LectureCard } from './components/LectureCard';
import { LectureDetailModal } from './components/LectureDetailModal';
import { SubmitLectureReviewModal } from './components/SubmitLectureReviewModal';
import { SubmitTeacherCommentModal } from './components/SubmitTeacherCommentModal';
import { AddLectureModal } from './components/AddLectureModal';
import { TeacherDirectory } from './components/TeacherDirectory';
import { RatingAnalyticsView } from './components/RatingAnalyticsView';
import { WatchlistView } from './components/WatchlistView';
import { CompareDrawer } from './components/CompareDrawer';
import { Lecture, TeacherProfile } from './types';

// Images generated via generate_image tool
const HERO_IMAGE_URL = '/src/assets/images/hero_lecture_hall_1791526528311.jpg';
const STUDY_DESK_IMAGE_URL = '/src/assets/images/student_study_workspace_1791526543399.jpg';

function MainApp() {
  const { lectures, teachers, student, watchlist } = useLecturePulse();

  // Navigation state
  const [activeTab, setActiveTab] = useState<'lectures' | 'teachers' | 'analytics' | 'watchlist'>('lectures');
  
  // Filter & Search states for lectures
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [filterCriteria, setFilterCriteria] = useState<'all' | 'top_rated' | 'exam_essential' | 'high_rigor' | 'fast_paced'>('all');
  const [sortBy, setSortBy] = useState<'highest_rated' | 'most_reviews' | 'difficulty' | 'pacing' | 'recent'>('highest_rated');

  // Selected modals state
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [ratingTargetLecture, setRatingTargetLecture] = useState<Lecture | null>(null);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);

  const [commentTargetTeacher, setCommentTargetTeacher] = useState<TeacherProfile | null>(null);
  const [isTeacherCommentModalOpen, setIsTeacherCommentModalOpen] = useState(false);

  const [isAddLectureModalOpen, setIsAddLectureModalOpen] = useState(false);

  // For navigating from lecture to specific teacher
  const [focusedTeacherId, setFocusedTeacherId] = useState<string | null>(null);

  const departments = ['All', 'Computer Science', 'Mathematics', 'Data Science', 'Electrical Engineering', 'Neuroscience & Biology'];

  // Filtered & sorted lectures
  const filteredLectures = useMemo(() => {
    return lectures
      .filter((lec) => {
        // Search
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          lec.title.toLowerCase().includes(query) ||
          lec.courseCode.toLowerCase().includes(query) ||
          lec.courseName.toLowerCase().includes(query) ||
          lec.professorName.toLowerCase().includes(query) ||
          lec.tags.some((t) => t.toLowerCase().includes(query));

        // Department
        const matchesDept = selectedDept === 'All' || lec.department.toLowerCase().includes(selectedDept.toLowerCase());

        // Quick criteria
        let matchesCriteria = true;
        if (filterCriteria === 'top_rated') matchesCriteria = lec.ratings.overall >= 4.5;
        if (filterCriteria === 'exam_essential') matchesCriteria = !!lec.alertFlags.isExamPrepCritical;
        if (filterCriteria === 'high_rigor') matchesCriteria = lec.ratings.difficulty >= 4.2;
        if (filterCriteria === 'fast_paced') matchesCriteria = lec.ratings.pacing >= 4.0;

        return matchesSearch && matchesDept && matchesCriteria;
      })
      .sort((a, b) => {
        if (sortBy === 'highest_rated') return b.ratings.overall - a.ratings.overall;
        if (sortBy === 'most_reviews') return b.ratings.totalRatingsCount - a.ratings.totalRatingsCount;
        if (sortBy === 'difficulty') return b.ratings.difficulty - a.ratings.difficulty;
        if (sortBy === 'pacing') return b.ratings.pacing - a.ratings.pacing;
        if (sortBy === 'recent') return new Date(b.date).getTime() - new Date(a.date).getTime();
        return 0;
      });
  }, [lectures, searchQuery, selectedDept, filterCriteria, sortBy]);

  // Handlers
  const handleOpenLectureDetail = (lec: Lecture) => {
    setSelectedLecture(lec);
    setIsDetailModalOpen(true);
  };

  const handleOpenRateModal = (lec: Lecture) => {
    setRatingTargetLecture(lec);
    setIsRateModalOpen(true);
  };

  const handleOpenTeacherModal = (teacher: TeacherProfile) => {
    setCommentTargetTeacher(teacher);
    setIsTeacherCommentModalOpen(true);
  };

  const handleSelectTeacherById = (teacherId: string) => {
    setFocusedTeacherId(teacherId);
    setActiveTab('teachers');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewTeacherLectures = (teacherId: string) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    if (teacher) {
      setSearchQuery(teacher.coursesTaught[0]?.code || teacher.name);
      setActiveTab('lectures');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col text-neutral-900 selection:bg-amber-100 selection:text-amber-900">
      {/* Top Bar Navigation */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'teachers') setFocusedTeacherId(null);
        }}
        onOpenAddLectureModal={() => setIsAddLectureModalOpen(true)}
        onOpenQuickRateModal={() => {
          setRatingTargetLecture(lectures[0] || null);
          setIsRateModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'lectures' && (
          <div>
            {/* Student Hero Header with Academic Visual */}
            <div className="relative bg-neutral-900 text-white overflow-hidden border-b border-neutral-800">
              {/* Background photography with measured scrim */}
              <div className="absolute inset-0 z-0">
                <img
                  src={HERO_IMAGE_URL}
                  alt="Modern university lecture hall"
                  className="w-full h-full object-cover object-center opacity-30"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/80 to-transparent" />
              </div>

              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="max-w-3xl">
                  {/* Clean unboxed kicker metadata */}
                  <div className="flex items-center gap-2 text-xs text-neutral-400 mb-3">
                    <span>Fall 2026 Semester</span>
                    <span aria-hidden="true" className="text-neutral-600">·</span>
                    <span>Student Peer Evaluation Network</span>
                    <span aria-hidden="true" className="text-neutral-600">·</span>
                    <span className="text-amber-400">Live Campus Telemetry</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3 text-balance">
                    Monitor Lecture Ratings, Pace & Concept Rigor
                  </h1>

                  <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-2xl mb-6">
                    Real, unvarnished feedback from classmates who attended live. Track lecture clarity, pacing warnings, and exam problem alignment.
                  </p>

                  {/* Primary Hero Search Bar */}
                  <div className="relative max-w-xl">
                    <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search lecture topic, course code (CS201, MATH310), or professor..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-24 py-3 text-xs sm:text-sm bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-neutral-900 placeholder:text-neutral-400 rounded-xl border border-white/20 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all shadow-lg"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-white px-2 py-1"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Quick Action row */}
                  <div className="flex flex-wrap items-center gap-3 mt-4 text-xs">
                    <span className="text-neutral-400 font-medium">Quick Searches:</span>
                    {['CS201 Red-Black', 'Bolzano-Weierstrass', 'DATA204 Momentum', 'Pipelining Hazards'].map((sample) => (
                      <button
                        key={sample}
                        onClick={() => setSearchQuery(sample)}
                        className="text-neutral-300 hover:text-white hover:underline transition-colors"
                      >
                        {sample}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Deck & Segmented Controls Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm mb-6 space-y-3.5">
                {/* Row 1: Department Segmented Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    <span className="text-xs font-semibold text-neutral-500 mr-1 shrink-0">Department:</span>
                    {departments.map((dept) => (
                      <button
                        key={dept}
                        onClick={() => setSelectedDept(dept)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                          selectedDept === dept
                            ? 'bg-neutral-900 text-white'
                            : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200'
                        }`}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>

                  {/* Register New Lecture Trigger */}
                  <button
                    onClick={() => setIsAddLectureModalOpen(true)}
                    className="text-xs font-medium text-neutral-700 hover:text-neutral-900 flex items-center gap-1 shrink-0 self-end sm:self-auto"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Register New Lecture from Syllabus</span>
                  </button>
                </div>

                {/* Row 2: Criteria Filter & Sorting */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-neutral-100 text-xs">
                  {/* Functional criteria filter tabs */}
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="font-semibold text-neutral-500 mr-1">Filter by:</span>
                    {[
                      { id: 'all', label: 'All Lectures' },
                      { id: 'top_rated', label: 'Top Rated (4.5+ ★)' },
                      { id: 'exam_essential', label: 'Exam Essential' },
                      { id: 'high_rigor', label: 'High Rigor Alert' },
                      { id: 'fast_paced', label: 'Fast Paced' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setFilterCriteria(tab.id as any)}
                        className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                          filterCriteria === tab.id
                            ? 'bg-neutral-200 text-neutral-900 font-semibold'
                            : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Sorting Dropdown */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="text-neutral-500">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1 text-xs font-medium text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    >
                      <option value="highest_rated">Highest Overall Rating</option>
                      <option value="most_reviews">Most Student Reviews</option>
                      <option value="difficulty">Highest Rigor / Difficulty</option>
                      <option value="pacing">Fastest Paced</option>
                      <option value="recent">Recently Delivered</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Lecture Count & Active Filters Indicator */}
              <div className="flex items-center justify-between text-xs text-neutral-500 mb-4 px-1">
                <span>
                  Showing <strong className="text-neutral-900 font-mono tabular-nums">{filteredLectures.length}</strong> lectures
                  {searchQuery && ` matching "${searchQuery}"`}
                  {selectedDept !== 'All' && ` in ${selectedDept}`}
                </span>

                {(searchQuery || selectedDept !== 'All' || filterCriteria !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedDept('All');
                      setFilterCriteria('all');
                    }}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    Reset all filters
                  </button>
                )}
              </div>

              {/* Lecture Cards Grid */}
              {filteredLectures.length === 0 ? (
                <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center max-w-lg mx-auto">
                  <AlertTriangle className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-neutral-900">No lectures found</h3>
                  <p className="text-xs text-neutral-500 mt-1 mb-4">
                    No lectures matched your current search filters or criteria.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedDept('All');
                      setFilterCriteria('all');
                    }}
                    className="px-4 py-2 text-xs font-semibold bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredLectures.map((lecture) => (
                    <LectureCard
                      key={lecture.id}
                      lecture={lecture}
                      onSelectLecture={handleOpenLectureDetail}
                      onSelectTeacherById={handleSelectTeacherById}
                      onOpenRateModal={handleOpenRateModal}
                    />
                  ))}
                </div>
              )}

              {/* Student Study Companion Callout Card with Workspace Image */}
              <div className="mt-12 bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-3 items-stretch">
                <div className="md:col-span-2 p-6 sm:p-8 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-semibold text-neutral-500 mb-1">
                      Student Study Companion
                    </div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-2">
                      Need tips on how to talk to your professors?
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-4 max-w-xl">
                      Visit our dedicated Professor Directory where students share verified insider advice on how to approach each professor, make a great impression in office hours, and secure undergrad research opportunities.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setActiveTab('teachers')}
                      className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors shadow-sm"
                    >
                      Browse Professor Intel & Advice
                    </button>
                    <button
                      onClick={() => setActiveTab('analytics')}
                      className="px-4 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                    >
                      View Campus Rating Analytics
                    </button>
                  </div>
                </div>

                <div className="relative h-48 md:h-full min-h-[160px]">
                  <img
                    src={STUDY_DESK_IMAGE_URL}
                    alt="Student university study workspace"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-neutral-900/10 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Professor Intel & Advice Directory */}
        {activeTab === 'teachers' && (
          <TeacherDirectory
            onOpenAddCommentModal={handleOpenTeacherModal}
            onViewTeacherLectures={handleViewTeacherLectures}
            selectedTeacherId={focusedTeacherId}
          />
        )}

        {/* Tab 3: Rating Analytics */}
        {activeTab === 'analytics' && (
          <RatingAnalyticsView
            onSelectLecture={handleOpenLectureDetail}
            onSelectTeacherById={handleSelectTeacherById}
          />
        )}

        {/* Tab 4: Student Watchlist */}
        {activeTab === 'watchlist' && (
          <WatchlistView
            onSelectLecture={handleOpenLectureDetail}
            onSelectTeacherById={handleSelectTeacherById}
            onNavigateToLectures={() => setActiveTab('lectures')}
          />
        )}
      </main>

      {/* Floating Side-by-Side Comparison Drawer */}
      <CompareDrawer
        onSelectLecture={handleOpenLectureDetail}
        onSelectTeacherById={handleSelectTeacherById}
      />

      {/* Detail Modal */}
      <LectureDetailModal
        lecture={selectedLecture}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onSelectTeacherById={handleSelectTeacherById}
        onOpenRateModal={handleOpenRateModal}
      />

      {/* Submit Lecture Evaluation Modal */}
      <SubmitLectureReviewModal
        lecture={ratingTargetLecture}
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
      />

      {/* Submit Teacher Advice Modal */}
      <SubmitTeacherCommentModal
        teacher={commentTargetTeacher}
        isOpen={isTeacherCommentModalOpen}
        onClose={() => setIsTeacherCommentModalOpen(false)}
      />

      {/* Register New Lecture Modal */}
      <AddLectureModal
        isOpen={isAddLectureModalOpen}
        onClose={() => setIsAddLectureModalOpen(false)}
      />

      {/* Clean Editorial Footer (Anti-Slop compliant: No fake engines or telemetry tickers) */}
      <footer className="bg-white border-t border-neutral-200 mt-16 py-8 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900">LectureRate</span>
            <span aria-hidden="true" className="text-neutral-300">·</span>
            <span>Student-driven lecture monitoring & evaluation platform</span>
          </div>

          <div className="flex items-center gap-4 text-neutral-600">
            <span>Logged in as: <strong className="text-neutral-900">{student.name}</strong> ({student.handle})</span>
            <span aria-hidden="true" className="text-neutral-300">·</span>
            <span>Independent Student Initiative</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LecturePulseProvider>
      <MainApp />
    </LecturePulseProvider>
  );
}
