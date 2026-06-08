import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import quizApi from '../../services/api/quiz.api'

function TakeQuiz() {
  const { quizId } = useParams()
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showFeedback, setShowFeedback] = useState(false)

  const { data: quiz, isLoading, isError } = useQuery({
    queryKey: ['quiz', 'take', quizId],
    queryFn: () => quizApi.getQuizForTaking(quizId),
    enabled: !!quizId,
  })

  const submitMutation = useMutation({
    mutationFn: () => {
      const formatted = quiz.questions.map((q) => ({
        questionId: q.questionId,
        selectedOption: answers[q.questionId],
      }))
      return quizApi.submitQuiz(quizId, formatted)
    },
  })

  useEffect(() => {
    setShowFeedback(false)
  }, [currentIndex])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isError || !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Quiz not available.</p>
      </div>
    )
  }

  const question = quiz.questions[currentIndex]
  const total = quiz.questions.length
  const selected = answers[question.questionId]
  const allAnswered = quiz.questions.every((q) => answers[q.questionId] !== undefined)

  const handleSelect = (optionIndex) => {
    setAnswers((prev) => ({ ...prev, [question.questionId]: optionIndex }))
    setShowFeedback(true)
  }

  const handleSubmit = async () => {
    try {
      const result = await submitMutation.mutateAsync()
      navigate(`/student/quiz/results/${result.attemptId}`, { state: { result } })
    } catch (_err) {
      // shown via mutation
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back
          </button>
          <span className="text-sm text-gray-500">
            Question {currentIndex + 1} of {total}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="h-1.5 bg-gray-100 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            />
          </div>

          <h2 className="text-lg font-semibold text-gray-900 mb-6">{question.text}</h2>

          <div className="space-y-3">
            {question.options.map((opt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(idx)}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors ${
                  selected === idx
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {showFeedback && selected !== undefined && (
            <div className="mt-4 p-3 rounded-lg bg-indigo-50 border border-indigo-100 text-sm text-indigo-700">
              Answer recorded. Review explanations after submitting.
            </div>
          )}

          {submitMutation.isError && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {submitMutation.error?.response?.data?.message || 'Submission failed'}
            </div>
          )}

          <div className="flex gap-3 mt-8">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => i - 1)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-40"
            >
              Previous
            </button>

            {currentIndex < total - 1 ? (
              <button
                type="button"
                disabled={selected === undefined}
                onClick={() => setCurrentIndex((i) => i + 1)}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-40"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                disabled={!allAnswered || submitMutation.isPending}
                onClick={handleSubmit}
                className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium disabled:opacity-40"
              >
                {submitMutation.isPending ? 'Submitting…' : 'Submit Quiz'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TakeQuiz
