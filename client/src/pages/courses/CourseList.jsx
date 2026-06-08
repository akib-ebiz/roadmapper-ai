import { useState } from 'react'
import { useCourses } from '../../hooks/useCourses'
import CourseCard from '../../components/course/CourseCard'

const DIFFICULTIES = ['', 'beginner', 'intermediate', 'advanced']

function CourseList() {
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading, isError } = useCourses({
    page,
    limit: 12,
    search: search || undefined,
    difficulty: difficulty || undefined,
  })

  const courses = data?.courses || []
  const totalPages = data?.totalPages || 1

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Browse Courses</h1>
          <p className="text-gray-500 text-sm">Discover AI-powered learning experiences</p>

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <input
              type="text"
              placeholder="Search courses…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={difficulty}
              onChange={(e) => { setDifficulty(e.target.value); setPage(1) }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{d ? d.charAt(0).toUpperCase() + d.slice(1) : 'All Levels'}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 h-64 animate-pulse" />
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="text-center py-16">
            <p className="text-red-500">Failed to load courses. Please try again.</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && courses.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-gray-500">No courses found. Try adjusting your search.</p>
          </div>
        )}

        {/* Course grid */}
        {!isLoading && courses.length > 0 && (
          <>
            <p className="text-sm text-gray-500 mb-5">{data.total} course{data.total !== 1 ? 's' : ''} found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">Page {page} of {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default CourseList
