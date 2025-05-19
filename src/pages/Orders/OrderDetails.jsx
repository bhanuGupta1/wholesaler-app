// Add inside useEffect, replace placeholder logic
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

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
