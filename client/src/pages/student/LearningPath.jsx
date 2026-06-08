import { Link, useNavigate, useParams } from 'react-router-dom'
import { useLearningPath } from '../../hooks/useStudent'
import ProgressBar from '../../components/progress/ProgressBar'
import CompletionBadge from '../../components/progress/CompletionBadge'

const STATUS_STYLES = {
  completed: 'bg-green-100 text-green-700 border-green-200',
  current: 'bg-blue-100 text-blue-700 border-blue-200',
  locked: 'bg-gray-100 text-gray-400 border-gray-200',
}

function LearningPath() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, isError } = useLearningPath(courseId)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Unable to load learning path.</p>
      </div>
    )
  }

  const { course, modules, progress, isCompleted } = data

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link to="/student/courses" className="text-sm text-blue-600 hover:underline mb-4 block">
            ← My Courses
          </Link>
          <div className="flex items-center justify-between gap-4 mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
            <CompletionBadge completed={isCompleted} label={isCompleted ? 'Course Complete' : 'In Progress'} />
          </div>
          <p className="text-gray-600 mb-4">{course.description}</p>
          <ProgressBar value={progress} label="Course progress" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Learning Roadmap</h2>
        <div className="space-y-4">
          {modules.map((mod, idx) => (
            <div
              key={mod._id}
              className={`bg-white border rounded-xl p-5 ${STATUS_STYLES[mod.status]}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-full bg-white border flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {mod.status === 'completed' ? '✓' : idx + 1}
                  </span>
                  <div>
                    <h3 className="font-medium text-gray-900">{mod.title}</h3>
                    {mod.objectives?.length > 0 && (
                      <p className="text-xs text-gray-500 mt-1">{mod.objectives.join(' · ')}</p>
                    )}
                    {mod.videoUrl && (
                      <a
                        href={mod.videoUrl.startsWith('http') ? mod.videoUrl : `https://www.youtube.com/results?search_query=${encodeURIComponent(mod.videoUrl)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                      >
                        Watch video →
                      </a>
                    )}
                    {mod.lastScore !== null && (
                      <p className="text-xs mt-1">Last score: {mod.lastScore}%</p>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {mod.status === 'locked' && (
                    <span className="text-xs text-gray-400">Locked</span>
                  )}
                  {mod.status !== 'locked' && mod.hasQuiz && (
                    <button
                      onClick={() => navigate(`/student/quiz/${mod.quizId}`)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg"
                    >
                      {mod.quizPassed ? 'Retake Quiz' : 'Take Quiz'}
                    </button>
                  )}
                  {mod.status !== 'locked' && !mod.hasQuiz && (
                    <span className="text-xs text-gray-400">No quiz yet</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LearningPath
