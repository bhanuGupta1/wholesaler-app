import { format } from 'date-fns';

const FeedbackItem = ({ feedback, darkMode }) => {
  return (
    <div className="p-4">
      <div className="flex items-start space-x-4">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
          darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
        } font-bold`}>
          {feedback.userName ? feedback.userName.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {feedback.userName || 'Anonymous'}
            </p>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {format(feedback.createdAt, 'MMM d, yyyy')}
            </div>
          </div>
          <div className="mt-1 flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`h-4 w-4 ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}