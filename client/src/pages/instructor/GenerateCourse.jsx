import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import aiApi from '../../services/api/ai.api'
import courseApi from '../../services/api/course.api'

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced']
const AUDIENCES = ['Beginners', 'Frontend Developers', 'Backend Developers', 'Full Stack Developers', 'Data Scientists', 'General learners']

// ─── Step 1: Generation Form ──────────────────────────────────────
function GenerateForm({ onGenerated }) {
  const [form, setForm] = useState({
    topic: '',
    targetAudience: 'General learners',
    difficulty: 'beginner',
    durationWeeks: 6,
  })
  const [errors, setErrors] = useState({})

  const generateMutation = useMutation({ mutationFn: aiApi.generateCourse })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: name === 'durationWeeks' ? Number(value) || '' : value }))
    setErrors((p) => ({ ...p, [name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.topic || form.topic.trim().length < 2) errs.topic = 'Topic must be at least 2 characters'
    if (!form.durationWeeks || form.durationWeeks < 1) errs.durationWeeks = 'Duration must be at least 1 week'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    try {
      const generated = await generateMutation.mutateAsync(form)
      onGenerated(generated, form)
    } catch (_err) {
      // error shown via mutation state
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">✨</span>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Generate Course with AI</h2>
            <p className="text-sm text-gray-500">Powered by Gemini</p>
          </div>
        </div>

        {generateMutation.isError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {generateMutation.error?.response?.data?.message || 'Generation failed. Please try again.'}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Topic <span className="text-red-400">*</span></label>
            <input
              name="topic" value={form.topic} onChange={handleChange}
              placeholder="e.g. React Hooks, Machine Learning, Docker"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                          ${errors.topic ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
            />
            {errors.topic && <p className="mt-1 text-xs text-red-600">{errors.topic}</p>}
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
            <select
              name="targetAudience" value={form.targetAudience} onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {AUDIENCES.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          {/* Difficulty + Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                name="difficulty" value={form.difficulty} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (weeks)</label>
              <input
                name="durationWeeks" type="number" min={1} max={52}
                value={form.durationWeeks} onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                            ${errors.durationWeeks ? 'border-red-400' : 'border-gray-300'}`}
              />
              {errors.durationWeeks && <p className="mt-1 text-xs text-red-600">{errors.durationWeeks}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={generateMutation.isPending}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700
                       text-white font-medium rounded-lg text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {generateMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating course…
              </span>
            ) : '✨ Generate Course'}
          </button>

          {generateMutation.isPending && (
            <p className="text-center text-xs text-gray-400 animate-pulse">
              AI is designing your course structure. This takes 5–10 seconds…
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

// ─── Step 2: Preview + Edit + Save ───────────────────────────────
function CoursePreview({ generated, formParams, onBack }) {
  const navigate = useNavigate()
  const [course, setCourse] = useState({
    title: generated.title,
    description: generated.description,
    topic: formParams.topic,
    difficulty: formParams.difficulty,
    durationWeeks: formParams.durationWeeks,
    modules: generated.modules.map((m) => ({
      title: m.title,
      objectives: m.objectives,
      videoUrl: m.videoSuggestion || '',
    })),
  })

  const saveMutation = useMutation({ mutationFn: courseApi.createCourse })

  const updateModule = (idx, field, value) => {
    setCourse((prev) => {
      const modules = [...prev.modules]
      modules[idx] = { ...modules[idx], [field]: value }
      return { ...prev, modules }
    })
  }

  const updateObjective = (moduleIdx, objIdx, value) => {
    setCourse((prev) => {
      const modules = [...prev.modules]
      const objectives = [...modules[moduleIdx].objectives]
      objectives[objIdx] = value
      modules[moduleIdx] = { ...modules[moduleIdx], objectives }
      return { ...prev, modules }
    })
  }

  const handleSave = async () => {
    try {
      const saved = await saveMutation.mutateAsync({ ...course, isAiGenerated: true })
      navigate(`/courses/${saved._id}`)
    } catch (_err) {
      // shown by mutation state
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="text-sm text-blue-600 hover:underline">← Edit prompt</button>
        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
          ✓ AI Generated
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Course Title</label>
          <input
            value={course.title}
            onChange={(e) => setCourse((p) => ({ ...p, title: e.target.value }))}
            className="w-full text-xl font-bold text-gray-900 border-b border-gray-200 focus:border-blue-500 focus:outline-none pb-1"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Description</label>
          <textarea
            value={course.description}
            onChange={(e) => setCourse((p) => ({ ...p, description: e.target.value }))}
            rows={3}
            className="w-full text-gray-700 text-sm border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Modules */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
            Modules ({course.modules.length})
          </h3>
          <div className="space-y-4">
            {course.modules.map((mod, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    value={mod.title}
                    onChange={(e) => updateModule(idx, 'title', e.target.value)}
                    className="flex-1 font-medium text-gray-800 text-sm border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="ml-8 space-y-1">
                  {mod.objectives.map((obj, oIdx) => (
                    <input
                      key={oIdx}
                      value={obj}
                      onChange={(e) => updateObjective(idx, oIdx, e.target.value)}
                      className="w-full text-xs text-gray-600 border-b border-transparent hover:border-gray-200 focus:border-blue-400 focus:outline-none py-0.5"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {saveMutation.isError && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {saveMutation.error?.response?.data?.message || 'Failed to save course'}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm
                       transition-colors disabled:opacity-60"
          >
            {saveMutation.isPending ? 'Saving…' : 'Save Course as Draft'}
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

// ─── Main Page ────────────────────────────────────────────────────
function GenerateCourse() {
  const navigate = useNavigate()
  const [generated, setGenerated] = useState(null)
  const [formParams, setFormParams] = useState(null)

  const handleGenerated = (data, params) => {
    setGenerated(data)
    setFormParams(params)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate('/instructor/dashboard')} className="text-sm text-blue-600 hover:underline mb-6 block">
          ← Back to dashboard
        </button>

        {!generated ? (
          <GenerateForm onGenerated={handleGenerated} />
        ) : (
          <CoursePreview
            generated={generated}
            formParams={formParams}
            onBack={() => setGenerated(null)}
          />
        )}
      </div>
    </div>
  )
}

export default GenerateCourse
