import React from 'react';
import { useEffect, useState } from "react";
import { useAuth } from '../hooks/useAuth';
import FeedbackList from '../components/feedback/FeedbackList';
const FeedbackPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);