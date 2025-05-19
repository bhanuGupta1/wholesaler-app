import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

const InvoicePage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const orderRef = doc(db, 'orders', id);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
          setOrder({
            id: orderSnap.id,
            ...orderSnap.data()
          });

          const itemsRef = collection(db, 'orderItems');
          const q = query(itemsRef, where('orderId', '==', id));
          const itemsSnap = await getDocs(q);

          const orderItems = [];
          itemsSnap.forEach(doc => {
            orderItems.push({
              id: doc.id,
              ...doc.data()
            });
          });

          setItems(orderItems);
        } else {
          console.error("Order not found");
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  return <div></div>;
};

export default InvoicePage;
