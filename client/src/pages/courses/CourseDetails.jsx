import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCourse, useEnrollCourse } from '../../hooks/useCourses'
import useAuthStore from '../../stores/auth.store'

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
}

function CourseDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const { data: course, isLoading, isError } = useCourse(id)
  const enrollMutation = useEnrollCourse(id)

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/courses/${id}` } } })
      return
    }
    try {
      await enrollMutation.mutateAsync()
    } catch (err) {
      // Error handled by mutation state
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (isError || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Course not found.</p>
          <button onClick={() => navigate('/courses')} className="mt-4 text-blue-600 hover:underline text-sm">
            Back to courses
          </button>
        </div>
      </div>
    )
  }

  const isStudent = user?.role === 'student'
  const canEnroll = isStudent && !enrollMutation.isSuccess
  const isOwner =
    user?.role === 'admin' ||
    (user?.role === 'instructor' &&
      course.instructorId?._id?.toString() === user?.id?.toString())

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <button onClick={() => navigate('/courses')} className="text-sm text-blue-600 hover:underline mb-4 block">
            ← Back to courses
          </button>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{course.topic}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_COLORS[course.difficulty]}`}>
              {course.difficulty}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">{course.title}</h1>
          <p className="text-gray-600 mb-6">{course.description}</p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
            <span>👤 {course.instructorId?.name || 'Instructor'}</span>
            <span>⏱ {course.durationWeeks} weeks</span>
            <span>👥 {course.enrolledStudents} students</span>
            <span>📚 {course.modules?.length || 0} modules</span>
          </div>

          {/* Enroll button */}
          {canEnroll && (
            <button
              onClick={handleEnroll}
              disabled={enrollMutation.isPending}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm
                         transition-colors disabled:opacity-60"
            >
              {enrollMutation.isPending ? 'Enrolling…' : 'Enroll Now — Free'}
            </button>
          )}
          {enrollMutation.isSuccess && (
            <div className="space-y-2">
              <p className="text-green-600 font-medium text-sm">✓ Enrolled successfully!</p>
              <Link
                to={`/student/courses/${id}/learn`}
                className="inline-block text-sm text-blue-600 hover:underline"
              >
                Start learning →
              </Link>
            </div>
          )}
          {enrollMutation.isError && (
            <p className="text-red-500 text-sm mt-2">
              {enrollMutation.error?.response?.data?.message || 'Enrollment failed'}
            </p>
          )}
          {!isAuthenticated && (
            <button
              onClick={() => navigate('/login', { state: { from: { pathname: `/courses/${id}` } } })}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm"
            >
              Sign in to Enroll
            </button>
          )}
        </div>
      </div>

      {/* Modules */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Course Content</h2>

        {course.modules?.length === 0 ? (
          <p className="text-gray-400 text-sm">No modules added yet.</p>
        ) : (
          <div className="space-y-3">
            {course.modules?.map((mod, idx) => (
              <div key={mod._id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 text-sm">{mod.title}</p>
                      {mod.objectives?.length > 0 && (
                        <p className="text-xs text-gray-400 mt-0.5">{mod.objectives.join(' · ')}</p>
                      )}
                    </div>
                  </div>
                  {isOwner && (
                    mod.quizId ? (
                      <span className="text-xs text-green-600 font-medium flex-shrink-0">✓ Quiz added</span>
                    ) : (
                      <Link
                        to={`/instructor/courses/${id}/quiz/${mod._id}`}
                        className="text-xs text-violet-600 hover:underline font-medium flex-shrink-0"
                      >
                        Generate Quiz →
                      </Link>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CourseDetails
