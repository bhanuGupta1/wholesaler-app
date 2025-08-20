// src/hooks/useUserStatus.js
import { useState, useEffect } from "react";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "./useAuth";

export const useUserStatus = () => {
  const { user } = useAuth();
  const [userStatus, setUserStatus] = useState({
    status: "loading", // loading, pending, approved, rejected, suspended
    accountType: null,
    businessType: null,
    canAccess: false,
    message: null,
  });

  useEffect(() => {
    if (!user?.uid) {
      setUserStatus({
        status: "guest",
        accountType: null,
        businessType: null,
        canAccess: true, // Guests can access public pages
        message: null,
      });
      return;
    }

    // Real-time listener for user status changes
    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (doc) => {
        if (!doc.exists()) {
          setUserStatus({
            status: "error",
            accountType: null,
            businessType: null,
            canAccess: false,
            message: "User profile not found",
          });
          return;
        }

        const userData = doc.data();
        const { accountType, businessType } = userData;

        // Backward compatibility: Handle old data structure
        let status = userData.status;

        // If no status field exists (old data), determine based on existing fields
        if (!status) {
          if (userData.approved === true) {
            status = "approved";
          } else if (userData.approved === false) {
            status = "rejected";
          } else if (accountType === "user") {
            status = "approved"; // Old user accounts were auto-approved
          } else {
            status = "pending"; // Old business accounts default to pending
          }
        }

        // Determine access and messaging
        let canAccess = false;
        let message = null;

        switch (status) {
          case "approved":
            canAccess = true;
            break;

          case "pending":
            if (accountType === "user") {
              canAccess = true; // Regular users don't need approval
            } else {
              canAccess = false;
              message = `Your ${accountType} account is pending admin approval. You'll receive an email once approved.`;
            }
            break;

          case "rejected":
            canAccess = false;
            message =
              userData.rejectedReason ||
              "Your account application was not approved.";
            break;

          case "suspended":
            canAccess = false;
            message =
              "Your account has been suspended. Contact support for assistance.";
            break;

          default:
            // Fallback for any edge cases - be permissive with old data
            canAccess = accountType === "user" || userData.approved !== false;
        }

        setUserStatus({
          status,
          accountType,
          businessType,
          canAccess,
          message,
          userData,
        });
      },
      (error) => {
        console.error("Error listening to user status:", error);
        setUserStatus({
          status: "error",
          accountType: null,
          businessType: null,
          canAccess: false,
          message: "Failed to load user status",
        });
      },
    );

    return () => unsubscribe();
  }, [user?.uid]);

  return userStatus;
};
