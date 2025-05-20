return (
  <div className="border border-gray-200 rounded-md overflow-hidden">
    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
      <h3 className="text-sm font-medium text-gray-700">Recent Customer Reviews</h3>
    </div>

    <div className="divide-y divide-gray-200">
      {feedback.map(item => (
        <div key={item.id} className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-900">{item.title || 'Review'}</p>
              <div className="mt-1 mb-2">
                <StarRating initialRating={item.rating} readOnly={true} />
              </div>
            </div>
            <span className="text-xs text-gray-500">
              {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : ''}
            </span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{item.comment}</p>
        </div>
      ))}
    </div>

    <div className="bg-gray-50 px-4 py-3 text-center">
      <Link 
        to={`/products/${productId}/feedback`}
        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
      >
        View all reviews
      </Link>
    </div>
  </div>
);
