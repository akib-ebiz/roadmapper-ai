import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import courseApi from '../services/api/course.api'

// ─── Query Keys ────────────────────────────────────────────────────
export const courseKeys = {
  all: ['courses'],
  list: (params) => ['courses', 'list', params],
  detail: (id) => ['courses', 'detail', id],
  mine: ['courses', 'mine'],
}

// ─── Hooks ─────────────────────────────────────────────────────────

/**
 * Fetch paginated/filtered course list
 */
export const useCourses = (params = {}) =>
  useQuery({
    queryKey: courseKeys.list(params),
    queryFn: () => courseApi.getCourses(params),
  })

/**
 * Fetch a single course by ID
 */
export const useCourse = (id) =>
  useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: () => courseApi.getCourse(id),
    enabled: !!id,
  })

/**
 * Fetch my courses (instructor = created, student = enrolled)
 */
export const useMyCourses = () =>
  useQuery({
    queryKey: courseKeys.mine,
    queryFn: () => courseApi.getMyCourses(),
  })

/**
 * Create course mutation
 */
export const useCreateCourse = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: courseApi.createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.all })
    },
  })
}

/**
 * Update course mutation
 */
export const useUpdateCourse = (id) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => courseApi.updateCourse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: courseKeys.mine })
    },
  })
}

/**
 * Delete course mutation
 */
export const useDeleteCourse = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: courseApi.deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.all })
    },
  })
}

/**
 * Publish course mutation
 */
export const usePublishCourse = (id) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => courseApi.publishCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: courseKeys.mine })
    },
  })
}

/**
 * Enroll in course mutation
 */
export const useEnrollCourse = (id) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => courseApi.enrollCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: courseKeys.mine })
    },
  })
}
