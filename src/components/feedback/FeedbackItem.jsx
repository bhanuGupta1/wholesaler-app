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
                 fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {feedback.comment}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeedbackItem;