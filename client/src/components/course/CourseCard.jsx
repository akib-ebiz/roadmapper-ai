import { Link } from 'react-router-dom'

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
}

function CourseCard({ course }) {
  const { _id, title, description, topic, difficulty, durationWeeks, enrolledStudents, instructorId } = course

  return (
    <Link to={`/courses/${_id}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
        {/* Thumbnail placeholder */}
        <div className="h-40 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <span className="text-4xl">📚</span>
        </div>

        <div className="p-4 flex flex-col flex-1">
          {/* Topic + Difficulty */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{topic}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_COLORS[difficulty] || 'bg-gray-100 text-gray-600'}`}>
              {difficulty}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>

          {/* Description */}
          <p className="text-xs text-gray-500 line-clamp-2 flex-1 mb-3">{description}</p>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3 mt-auto">
            <span>{instructorId?.name || 'Instructor'}</span>
            <div className="flex items-center gap-3">
              <span>{durationWeeks}w</span>
              <span>{enrolledStudents} students</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default CourseCard
