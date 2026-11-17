export const topics = [
  ['study-tips', 'Study tips'],
  ['course-planning', 'Course planning'],
  ['group-projects', 'Group projects'],
  ['academic-resources', 'Academic resources'],
];
export const programs = ['Computer Science', 'Information Systems', 'Data Science', 'Other'];
export const topicLabel = (value) => topics.find(([key]) => key === value)?.[1] || value;
