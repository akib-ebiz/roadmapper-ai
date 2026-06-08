import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import aiApi from '../../services/api/ai.api'
import { useCourse } from '../../hooks/useCourses'

const DIFFICULTIES = ['easy', 'medium', 'hard']

function GenerateForm({ moduleTitle, onGenerated }) {
  const [difficulty, setDifficulty] = useState('medium')
  const { courseId, moduleId } = useParams()

  const generateMutation = useMutation({
    mutationFn: () => aiApi.generateQuiz(moduleId, { difficulty }),
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = await generateMutation.mutateAsync()
      onGenerated(data, { courseId, moduleId, difficulty })
    } catch (_err) {
      // shown via mutation state
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">📝</span>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Generate Quiz with AI</h2>
            <p className="text-sm text-gray-500">Module: {moduleTitle}</p>
          </div>
        </div>

        {generateMutation.isError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {generateMutation.error?.response?.data?.message || 'Generation failed. Please try again.'}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={generateMutation.isPending}
            className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700
                       text-white font-medium rounded-lg text-sm transition-all disabled:opacity-60"
          >
            {generateMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating quiz…
              </span>
            ) : '📝 Generate Quiz'}
          </button>

          {generateMutation.isPending && (
            <p className="text-center text-xs text-gray-400 animate-pulse">
              AI is writing questions. This takes a few seconds…
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

function QuizPreview({ generated, meta, onBack }) {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState(generated.questions)

  const saveMutation = useMutation({
    mutationFn: () =>
      aiApi.saveQuiz({
        courseId: meta.courseId,
        moduleId: meta.moduleId,
        difficulty: meta.difficulty,
        questions,
      }),
  })

  const updateQuestion = (idx, field, value) => {
    setQuestions((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
  }

  const updateOption = (qIdx, oIdx, value) => {
    setQuestions((prev) => {
      const next = [...prev]
      const options = [...next[qIdx].options]
      options[oIdx] = value
      next[qIdx] = { ...next[qIdx], options }
      return next
    })
  }

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync()
      navigate(`/courses/${meta.courseId}`)
    } catch (_err) {
      // shown via mutation state
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="text-sm text-blue-600 hover:underline">← Regenerate</button>
        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
          ✓ AI Generated via {generated.provider}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
        {questions.map((q, idx) => (
          <div key={idx} className="border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 text-xs font-bold flex items-center justify-center">
                {idx + 1}
              </span>
              <input
                value={q.text}
                onChange={(e) => updateQuestion(idx, 'text', e.target.value)}
                className="flex-1 font-medium text-sm text-gray-800 border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="ml-8 space-y-2">
              {q.options.map((opt, oIdx) => (
                <label key={oIdx} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={`correct-${idx}`}
                    checked={q.correctOption === oIdx}
                    onChange={() => updateQuestion(idx, 'correctOption', oIdx)}
                  />
                  <input
                    value={opt}
                    onChange={(e) => updateOption(idx, oIdx, e.target.value)}
                    className="flex-1 text-gray-600 border-b border-transparent hover:border-gray-200 focus:border-blue-400 focus:outline-none"
                  />
                </label>
              ))}
            </div>

            <textarea
              value={q.explanation}
              onChange={(e) => updateQuestion(idx, 'explanation', e.target.value)}
              rows={2}
              placeholder="Explanation"
              className="ml-8 w-[calc(100%-2rem)] text-xs text-gray-500 border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        ))}

        {saveMutation.isError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {saveMutation.error?.response?.data?.message || 'Failed to save quiz'}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg text-sm disabled:opacity-60"
          >
            {saveMutation.isPending ? 'Saving…' : 'Save Quiz to Module'}
          </button>
          <button
            onClick={onBack}
            className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
          >
            Regenerate
          </button>
        </div>
      </div>
    </div>
  )
}

function GenerateQuiz() {
  const navigate = useNavigate()
  const { courseId } = useParams()
  const { data: course, isLoading } = useCourse(courseId)
  const [generated, setGenerated] = useState(null)
  const [meta, setMeta] = useState(null)

  const { moduleId } = useParams()
  const module = course?.modules?.find((m) => m._id?.toString() === moduleId)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Module not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(`/courses/${courseId}`)}
          className="text-sm text-blue-600 hover:underline mb-6 block"
        >
          ← Back to course
        </button>

        {!generated ? (
          <GenerateForm moduleTitle={module.title} onGenerated={(data, m) => { setGenerated(data); setMeta(m) }} />
        ) : (
          <QuizPreview generated={generated} meta={meta} onBack={() => setGenerated(null)} />
        )}
      </div>
    </div>
  )
}

export default GenerateQuiz
