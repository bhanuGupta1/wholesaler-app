import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { format } from 'date-fns';

/**
 * InvoicePage Component
 * 
 * Displays a printable invoice for a specific order.
 * 
 * Features:
 * - Shows invoice header with company and order information
 * - Shows customer billing information
 * - Shows all items with prices, quantities, and totals
 * - Provides a print button
 * - Loading state handling
 */