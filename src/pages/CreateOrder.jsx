import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { ProductCard } from './GuestDashboard'; // Reuse ProductCard
import ThemeToggle from '../components/common/ThemeToggle';
