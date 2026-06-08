import { useQuery } from '@tanstack/react-query'
import dashboardApi from '../services/api/dashboard.api'
import studentApi from '../services/api/student.api'

export const studentKeys = {
  dashboard: ['student', 'dashboard'],
  courses: ['student', 'courses'],
  learningPath: (courseId) => ['student', 'learningPath', courseId],
}

export const useStudentDashboard = () =>
  useQuery({
    queryKey: studentKeys.dashboard,
    queryFn: () => dashboardApi.getStudentDashboard(),
  })

export const useStudentCourses = () =>
  useQuery({
    queryKey: studentKeys.courses,
    queryFn: () => studentApi.getStudentCourses(),
  })

export const useLearningPath = (courseId) =>
  useQuery({
    queryKey: studentKeys.learningPath(courseId),
    queryFn: () => studentApi.getLearningPath(courseId),
    enabled: !!courseId,
  })
