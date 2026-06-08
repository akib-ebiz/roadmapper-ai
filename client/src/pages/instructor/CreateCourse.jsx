import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateCourse } from '../../hooks/useCourses'

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced']

function CreateCourse() {
  const navigate = useNavigate()
  const createMutation = useCreateCourse()

  const [form, setForm] = useState({
    title: '',
    description: '',
    topic: '',
    difficulty: 'beginner',
    durationWeeks: '',
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: name === 'durationWeeks' ? Number(value) || '' : value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validate = () => {
    const errs = {}
    if (!form.title || form.title.length < 5) errs.title = 'Title must be at least 5 characters'
    if (!form.description || form.description.length < 10) errs.description = 'Description must be at least 10 characters'
    if (!form.topic) errs.topic = 'Topic is required'
    if (!form.durationWeeks || form.durationWeeks < 1) errs.durationWeeks = 'Duration must be at least 1 week'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      const course = await createMutation.mutateAsync(form)
      navigate(`/courses/${course._id}`)
    } catch (err) {
      const serverErrors = err.response?.data?.errors || []
      const fieldErrors = {}
      serverErrors.forEach(({ field, message }) => { fieldErrors[field] = message })
      setErrors(fieldErrors)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:underline mb-6 block">
          ← Back
        </button>

        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Create New Course</h1>
          <p className="text-sm text-gray-500 mb-6">Fill in the details to start building your course</p>

          {createMutation.isError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {createMutation.error?.response?.data?.message || 'Failed to create course'}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
              <input
                name="title" value={form.title} onChange={handleChange}
                placeholder="e.g. React Fundamentals"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                            ${errors.title ? 'border-red-400' : 'border-gray-300'}`}
              />
              {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description" value={form.description} onChange={handleChange}
                placeholder="Describe what students will learn…"
                rows={4}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none
                            ${errors.description ? 'border-red-400' : 'border-gray-300'}`}
              />
              {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
              <input
                name="topic" value={form.topic} onChange={handleChange}
                placeholder="e.g. React, Python, Data Science"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                            ${errors.topic ? 'border-red-400' : 'border-gray-300'}`}
              />
              {errors.topic && <p className="mt-1 text-xs text-red-600">{errors.topic}</p>}
            </div>

            {/* Difficulty + Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  name="difficulty" value={form.difficulty} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (weeks)</label>
                <input
                  name="durationWeeks" type="number" min={1} max={52}
                  value={form.durationWeeks} onChange={handleChange}
                  placeholder="e.g. 6"
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500
                              ${errors.durationWeeks ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.durationWeeks && <p className="mt-1 text-xs text-red-600">{errors.durationWeeks}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm
                         transition-colors disabled:opacity-60"
            >
              {createMutation.isPending ? 'Creating…' : 'Create Course'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateCourse
