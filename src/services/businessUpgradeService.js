// src/services/businessUpgradeService.js
import {
  doc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

/**
 * Request upgrade from buyer to seller
 * @param {string} userId - User ID requesting upgrade
 * @param {Object} upgradeData - Additional data for the upgrade request
 */
export const requestSellerUpgrade = async (userId, upgradeData = {}) => {
  try {
    // Create an upgrade request document
    const upgradeRequest = {
      userId,
      currentType: "buyer",
      requestedType: "seller",
      status: "pending",
      requestedAt: serverTimestamp(),
      ...upgradeData,
    };

    // Add to upgrade requests collection
    const requestRef = await addDoc(
      collection(db, "upgradeRequests"),
      upgradeRequest,
    );

    // Update user document to indicate pending upgrade
    await updateDoc(doc(db, "users", userId), {
      upgradeStatus: "pending_seller_upgrade",
      upgradeRequestId: requestRef.id,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      requestId: requestRef.id,
      message: "Upgrade request submitted successfully",
    };
  } catch (error) {
    console.error("Error requesting seller upgrade:", error);
    throw new Error("Failed to submit upgrade request");
  }
};

/**
 * Check if user has pending upgrade request
 * @param {Object} user - User object
 */
export const hasPendingUpgrade = (user) => {
  return user?.upgradeStatus === "pending_seller_upgrade";
};

/**
 * Get upgrade status message
 * @param {Object} user - User object
 */
export const getUpgradeStatusMessage = (user) => {
  switch (user?.upgradeStatus) {
    case "pending_seller_upgrade":
      return "Your seller upgrade request is pending admin approval.";
    case "upgrade_approved":
      return "Your upgrade has been approved! You are now a seller.";
    case "upgrade_rejected":
      return "Your upgrade request was rejected. Contact support for details.";
    default:
      return null;
  }
};

export default {
  requestSellerUpgrade,
  hasPendingUpgrade,
  getUpgradeStatusMessage,
};
