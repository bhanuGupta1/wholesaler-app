import { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';

const PendingApprovals = () => {
  const { user } = useAuth();
  const [pendingUsers, setPendingUsers] = useState([]);

  useEffect(() => {
    const fetchPending = async () => {
      const snapshot = await getDocs(collection(db, 'users'));
      const unapproved = snapshot.docs
        .filter(doc => doc.data().accountType !== 'user' && doc.data().approved === false)
        .map(doc => ({ id: doc.id, ...doc.data() }));
      setPendingUsers(unapproved);
    };

    fetchPending();
  }, []);

  const handleDecision = async (id, approved) => {
    await updateDoc(doc(db, 'users', id), { approved });
    setPendingUsers(prev => prev.filter(user => user.id !== id));
  };

  if (user?.accountType !== 'admin') {
    return <div className="p-8 text-center text-lg">Access Denied</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Pending Account Approvals</h1>
      {pendingUsers.length === 0 ? (
        <p>No pending approvals.</p>
      ) : (
        <ul className="space-y-4">
          {pendingUsers.map((u) => (
            <li key={u.id} className="p-4 border rounded shadow flex justify-between items-center">
              <div>
                <p><strong>{u.displayName}</strong> ({u.email})</p>
                <p className="text-sm text-gray-500">Type: {u.accountType}</p>
              </div>
              <div className="space-x-2">
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded"
                  onClick={() => handleDecision(u.id, true)}
                >
                  Approve
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => handleDecision(u.id, false)}
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PendingApprovals;
