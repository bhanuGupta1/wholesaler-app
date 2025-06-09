import RatingForm from "../components/feedback/RatingForm";
import FeedbackList from "../components/feedback/FeedbackList";

const FeedbackPage = () => {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Give Feedback</h1>
      <p className="mb-6 text-gray-600">We'd love to hear your thoughts about our service!</p>

      <div className="mb-6">
        <RatingForm />
      </div>

      <div>
        <FeedbackList />
      </div>
    </div>
  );
};

export default FeedbackPage;
