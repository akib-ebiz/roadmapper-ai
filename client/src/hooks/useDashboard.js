import { useQuery } from '@tanstack/react-query'
import dashboardApi from '../services/api/dashboard.api'

export const dashboardKeys = {
  student: ['dashboard', 'student'],
  instructor: ['dashboard', 'instructor'],
  instructorCourses: ['dashboard', 'instructor', 'courses'],
  instructorQuizzes: ['dashboard', 'instructor', 'quizzes'],
  admin: ['dashboard', 'admin'],
}

export const useStudentDashboard = () =>
  useQuery({
    queryKey: dashboardKeys.student,
    queryFn: () => dashboardApi.getStudentDashboard(),
  })

export const useInstructorDashboard = () =>
  useQuery({
    queryKey: dashboardKeys.instructor,
    queryFn: () => dashboardApi.getInstructorDashboard(),
  })

export const useInstructorCourses = () =>
  useQuery({
    queryKey: dashboardKeys.instructorCourses,
    queryFn: () => dashboardApi.getInstructorCourses(),
  })

export const useInstructorQuizzes = () =>
  useQuery({
    queryKey: dashboardKeys.instructorQuizzes,
    queryFn: () => dashboardApi.getInstructorQuizzes(),
  })

export const useAdminDashboard = () =>
  useQuery({
    queryKey: dashboardKeys.admin,
    queryFn: () => dashboardApi.getAdminDashboard(),
  })
