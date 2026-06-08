import { Link, useLocation, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import quizApi from '../../services/api/quiz.api'
import CompletionBadge from '../../components/progress/CompletionBadge'

function QuizResults() {
  const { attemptId } = useParams()
  const location = useLocation()
  const cached = location.state?.result

  const { data: attempt, isLoading } = useQuery({
    queryKey: ['quiz', 'attempt', attemptId],
    queryFn: () => quizApi.getAttempt(attemptId),
    enabled: !!attemptId && !cached,
  })

  const result = cached || attempt

  if (isLoading && !cached) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Results not found.</p>
      </div>
    )
  }

  const correctCount = result.results.filter((r) => r.isCorrect).length
  const total = result.results.length

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6 text-center">
          <p className="text-sm text-gray-500 mb-2">Your Score</p>
          <p className={`text-5xl font-bold ${result.passed ? 'text-green-600' : 'text-red-500'}`}>
            {result.score}%
          </p>
          <div className="mt-4 flex justify-center">
            <CompletionBadge
              completed={result.passed}
              label={result.passed ? 'Passed' : 'Did not pass (70% required)'}
            />
          </div>
          <p className="text-sm text-gray-500 mt-4">
            {correctCount} of {total} correct
          </p>
          {result.moduleCompleted && (
            <p className="text-sm text-green-600 font-medium mt-2">✓ Module marked complete!</p>
          )}
          {result.courseProgress !== undefined && (
            <p className="text-xs text-gray-400 mt-1">Course progress: {result.courseProgress}%</p>
          )}
        </div>

        <div className="space-y-4 mb-8">
          {result.results.map((q, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-xl border p-5 ${
                q.isCorrect ? 'border-green-200' : 'border-red-200'
              }`}
            >
              <div className="flex items-start gap-2 mb-3">
                <span className={`text-lg ${q.isCorrect ? 'text-green-600' : 'text-red-500'}`}>
                  {q.isCorrect ? '✓' : '✗'}
                </span>
                <p className="font-medium text-gray-900 text-sm">{q.text}</p>
              </div>
              <div className="ml-7 space-y-1 text-sm">
                {q.options.map((opt, oIdx) => (
                  <p
                    key={oIdx}
                    className={
                      oIdx === q.correctOption
                        ? 'text-green-700 font-medium'
                        : oIdx === q.selectedOption && !q.isCorrect
                          ? 'text-red-600'
                          : 'text-gray-500'
                    }
                  >
                    {opt}
                    {oIdx === q.correctOption && ' (correct)'}
                    {oIdx === q.selectedOption && oIdx !== q.correctOption && ' (your answer)'}
                  </p>
                ))}
              </div>
              {q.explanation && (
                <p className="ml-7 mt-3 text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                  {q.explanation}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <Link
            to="/student/courses"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
          >
            Back to My Courses
          </Link>
        </div>
      </div>
    </div>
  )
}

export default QuizResults
