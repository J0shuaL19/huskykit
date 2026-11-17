import { request } from './request';

export const getAcademicPosts = (query, signal) =>
  request('/academic-posts' + (query ? '?' + query : ''), { signal });
export const getAcademicPost = (id, signal) =>
  request('/academic-posts/' + encodeURIComponent(id), { signal });
export const saveAcademicPost = (post, id) =>
  request('/academic-posts' + (id ? '/' + encodeURIComponent(id) : ''), {
    method: id ? 'PUT' : 'POST',
    body: post,
  });
export const deleteAcademicPost = (id) =>
  request('/academic-posts/' + encodeURIComponent(id), { method: 'DELETE' });
