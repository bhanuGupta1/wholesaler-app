// src/pages/admin/AdminSupportTickets.jsx - Complete Support Tickets Management
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ticket,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Mail,
  Calendar,
  Tag,
  Flag,
  Reply,
  Eye,
  Filter,
  Search,
  RefreshCw,
  Download,
  MessageSquare,
  Headphones,
  FileText,
  ArrowUpRight,
} from "lucide-react";

const AdminSupportTickets = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [processing, setProcessing] = useState(false);

  // Filters and search
  const [filters, setFilters] = useState({
    status: "all",
    category: "all",
    priority: "all",
    dateRange: "30d",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Fetch all support tickets
  const fetchSupportTickets = async () => {
    try {
      setLoading(true);
      const ticketsQuery = query(
        collection(db, "supportTickets"),
        orderBy("createdAt", "desc"),
      );

      const querySnapshot = await getDocs(ticketsQuery);
      const ticketData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate
          ? doc.data().createdAt.toDate()
          : new Date(doc.data().createdAt),
        updatedAt: doc.data().updatedAt?.toDate
          ? doc.data().updatedAt.toDate()
          : new Date(doc.data().updatedAt),
      }));

      setTickets(ticketData);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupportTickets();
  }, []);

  // Filter and sort tickets
  const filteredTickets = useMemo(() => {
    let filtered = tickets.filter((ticket) => {
      // Search filter
      const matchesSearch =
        searchTerm.trim() === "" ||
        ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.ticketId?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const matchesStatus =
        filters.status === "all" || ticket.status === filters.status;

      // Category filter
      const matchesCategory =
        filters.category === "all" || ticket.category === filters.category;

      // Priority filter
      const matchesPriority =
        filters.priority === "all" || ticket.priority === filters.priority;

      // Date range filter
      const now = new Date();
      const ticketDate = ticket.createdAt;
      let matchesDate = true;

      if (filters.dateRange !== "all") {
        const days = parseInt(filters.dateRange.replace("d", ""));
        const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        matchesDate = ticketDate >= cutoff;
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory &&
        matchesPriority &&
        matchesDate
      );
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "createdAt" || sortBy === "updatedAt") {
        aValue = aValue instanceof Date ? aValue : new Date(aValue);
        bValue = bValue instanceof Date ? bValue : new Date(bValue);
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [tickets, searchTerm, filters, sortBy, sortOrder]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === "open").length;
    const inProgress = tickets.filter((t) => t.status === "in_progress").length;
    const resolved = tickets.filter((t) => t.status === "resolved").length;
    const closed = tickets.filter((t) => t.status === "closed").length;
    const highPriority = tickets.filter((t) => t.priority === "high").length;

    // Calculate average response time (in hours)
    const respondedTickets = tickets.filter(
      (t) => t.responses && t.responses.length > 0,
    );
    const avgResponseTime =
      respondedTickets.length > 0
        ? respondedTickets.reduce((sum, ticket) => {
            const firstResponse = ticket.responses[0];
            const responseTime =
              (firstResponse.createdAt - ticket.createdAt) / (1000 * 60 * 60); // hours
            return sum + responseTime;
          }, 0) / respondedTickets.length
        : 0;

    return {
      total,
      open,
      inProgress,
      resolved,
      closed,
      highPriority,
      avgResponseTime: avgResponseTime.toFixed(1),
    };
  }, [tickets]);

  // Update ticket status
  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      setProcessing(true);
      const ticketRef = doc(db, "supportTickets", ticketId);
      await updateDoc(ticketRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        lastUpdatedBy: user.email,
      });

      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                status: newStatus,
                updatedAt: new Date(),
                lastUpdatedBy: user.email,
              }
            : t,
        ),
      );
    } catch (error) {
      console.error("Error updating ticket status:", error);
    } finally {
      setProcessing(false);
    }
  };

  // Add response to ticket
  const addTicketResponse = async () => {
    if (!selectedTicket || !responseMessage.trim()) return;

    try {
      setProcessing(true);
      const ticketRef = doc(db, "supportTickets", selectedTicket.id);

      const response = {
        message: responseMessage,
        respondedBy: user.email,
        respondedAt: serverTimestamp(),
        type: "admin_response",
      };

      // Get current responses or initialize empty array
      const currentResponses = selectedTicket.responses || [];
      const updatedResponses = [...currentResponses, response];

      await updateDoc(ticketRef, {
        responses: updatedResponses,
        status: "in_progress",
        updatedAt: serverTimestamp(),
        lastUpdatedBy: user.email,
      });

      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicket.id
            ? {
                ...t,
                responses: updatedResponses,
                status: "in_progress",
                updatedAt: new Date(),
                lastUpdatedBy: user.email,
              }
            : t,
        ),
      );

      setShowResponseModal(false);
      setResponseMessage("");
      setSelectedTicket(null);
    } catch (error) {
      console.error("Error adding ticket response:", error);
    } finally {
      setProcessing(false);
    }
  };

  // Export tickets to CSV
  const exportToCSV = () => {
    const headers = [
      "Ticket ID",
      "Date",
      "User",
      "Email",
      "Subject",
      "Category",
      "Priority",
      "Status",
      "Message",
      "Responses",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredTickets.map((ticket) =>
        [
          ticket.ticketId || ticket.id,
          ticket.createdAt?.toLocaleDateString() || "N/A",
          `"${ticket.userName || "Unknown"}"`,
          ticket.userEmail || "N/A",
          `"${ticket.subject || ""}"`,
          ticket.category || "general",
          ticket.priority || "medium",
          ticket.status || "open",
          `"${(ticket.message || "").replace(/"/g, '""')}"`,
          `"${(ticket.responses || []).length} responses"`,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `support-tickets-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return darkMode
          ? "text-red-400 bg-red-900/20"
          : "text-red-600 bg-red-100";
      case "in_progress":
        return darkMode
          ? "text-yellow-400 bg-yellow-900/20"
          : "text-yellow-600 bg-yellow-100";
      case "resolved":
        return darkMode
          ? "text-green-400 bg-green-900/20"
          : "text-green-600 bg-green-100";
      case "closed":
        return darkMode
          ? "text-gray-400 bg-gray-900/20"
          : "text-gray-600 bg-gray-100";
      default:
        return darkMode
          ? "text-gray-400 bg-gray-900/20"
          : "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return darkMode ? "text-red-400" : "text-red-600";
      case "medium":
        return darkMode ? "text-yellow-400" : "text-yellow-600";
      case "low":
        return darkMode ? "text-green-400" : "text-green-600";
      default:
        return darkMode ? "text-gray-400" : "text-gray-600";
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high":
        return "🚨";
      case "medium":
        return "⚠️";
      case "low":
        return "🔵";
      default:
        return "⚪";
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}
      >
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-center py-12">
            <div
              className={`text-center ${darkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <div>Loading support tickets...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className={`text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                Support Tickets Management
              </h1>
              <p
                className={`mt-1 text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                Manage and respond to user support requests and tickets
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={exportToCSV}
                className={`px-4 py-2 rounded-lg text-sm transition-all border ${
                  darkMode
                    ? "bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-600"
                    : "bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
                }`}
              >
                <Download className="h-4 w-4 mr-2 inline" />
                Export CSV
              </button>
              <button
                onClick={fetchSupportTickets}
                disabled={loading}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  darkMode
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 inline ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
              <Link
                to="/admin"
                className={`px-4 py-2 rounded-lg text-sm transition-all border ${
                  darkMode
                    ? "bg-gray-800 hover:bg-gray-700 text-blue-400 border-blue-500/50"
                    : "bg-white hover:bg-gray-50 text-blue-600 border-blue-500/50"
                }`}
              >
                ← Back to Admin
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          {[
            {
              title: "Total Tickets",
              value: stats.total,
              icon: Ticket,
              color: "blue",
            },
            {
              title: "Open",
              value: stats.open,
              icon: AlertTriangle,
              color: "red",
            },
            {
              title: "In Progress",
              value: stats.inProgress,
              icon: Clock,
              color: "yellow",
            },
            {
              title: "Resolved",
              value: stats.resolved,
              icon: CheckCircle,
              color: "green",
            },
            {
              title: "High Priority",
              value: stats.highPriority,
              icon: Flag,
              color: "orange",
            },
            {
              title: "Avg Response",
              value: `${stats.avgResponseTime}h`,
              icon: Headphones,
              color: "purple",
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-lg border ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`p-3 rounded-lg ${
                    stat.color === "blue"
                      ? "bg-blue-100 text-blue-600"
                      : stat.color === "red"
                        ? "bg-red-100 text-red-600"
                        : stat.color === "yellow"
                          ? "bg-yellow-100 text-yellow-600"
                          : stat.color === "green"
                            ? "bg-green-100 text-green-600"
                            : stat.color === "orange"
                              ? "bg-orange-100 text-orange-600"
                              : "bg-purple-100 text-purple-600"
                  }`}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p
                    className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {stat.title}
                  </p>
                  <p
                    className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    {stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters and Search */}
        <div
          className={`p-6 rounded-lg border ${
            darkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          } mb-6`}
        >
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
              </div>
            </div>

            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className={`px-3 py-2 rounded-lg border ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, category: e.target.value }))
              }
              className={`px-3 py-2 rounded-lg border ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="all">All Categories</option>
              <option value="general">General</option>
              <option value="account">Account</option>
              <option value="orders">Orders</option>
              <option value="inventory">Inventory</option>
              <option value="technical">Technical</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, priority: e.target.value }))
              }
              className={`px-3 py-2 rounded-lg border ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={filters.dateRange}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, dateRange: e.target.value }))
              }
              className={`px-3 py-2 rounded-lg border ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              }`}
            >
              <option value="all">All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label
                  className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                >
                  Sort by:
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={`px-3 py-1 rounded border ${
                    darkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="createdAt">Date Created</option>
                  <option value="updatedAt">Last Updated</option>
                  <option value="priority">Priority</option>
                  <option value="status">Status</option>
                </select>
                <button
                  onClick={() =>
                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                  }
                  className={`px-2 py-1 rounded ${
                    darkMode
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>

            <div
              className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              Showing {filteredTickets.length} of {tickets.length} tickets
            </div>
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredTickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`p-6 rounded-lg border ${
                  darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                } hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <Ticket
                          className={`h-4 w-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        />
                        <span
                          className={`font-mono text-sm ${darkMode ? "text-blue-400" : "text-blue-600"}`}
                        >
                          {ticket.ticketId || ticket.id.substring(0, 8)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <User
                          className={`h-4 w-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        />
                        <span
                          className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {ticket.userName || "Unknown User"}
                        </span>
                        <span
                          className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        >
                          ({ticket.userEmail})
                        </span>
                      </div>

                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}
                      >
                        {ticket.status?.replace("_", " ") || "open"}
                      </span>

                      <span
                        className={`text-sm font-medium ${getPriorityColor(ticket.priority)}`}
                      >
                        <span className="mr-1">
                          {getPriorityIcon(ticket.priority)}
                        </span>
                        {ticket.priority || "medium"} priority
                      </span>

                      <span
                        className={`text-xs ${darkMode ? "text-gray-500" : "text-gray-400"}`}
                      >
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {formatDate(ticket.createdAt)}
                      </span>
                    </div>

                    <h3
                      className={`text-lg font-semibold mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}
                    >
                      {ticket.subject}
                    </h3>

                    <div className="flex items-center gap-2 mb-3">
                      <Tag
                        className={`h-4 w-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                      />
                      <span
                        className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                      >
                        {ticket.category || "general"}
                      </span>
                      {ticket.responses && ticket.responses.length > 0 && (
                        <>
                          <MessageSquare
                            className={`h-4 w-4 ml-4 ${darkMode ? "text-blue-400" : "text-blue-500"}`}
                          />
                          <span
                            className={`text-sm ${darkMode ? "text-blue-400" : "text-blue-500"}`}
                          >
                            {ticket.responses.length} response
                            {ticket.responses.length !== 1 ? "s" : ""}
                          </span>
                        </>
                      )}
                    </div>

                    <p
                      className={`text-sm mb-4 ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                    >
                      {ticket.message?.length > 200
                        ? `${ticket.message.substring(0, 200)}...`
                        : ticket.message}
                    </p>

                    {ticket.responses && ticket.responses.length > 0 && (
                      <div
                        className={`p-4 rounded-lg border-l-4 ${
                          darkMode
                            ? "bg-blue-900/20 border-blue-400"
                            : "bg-blue-50 border-blue-400"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Reply
                            className={`h-4 w-4 ${darkMode ? "text-blue-400" : "text-blue-600"}`}
                          />
                          <span
                            className={`text-sm font-medium ${darkMode ? "text-blue-400" : "text-blue-600"}`}
                          >
                            Latest Response by{" "}
                            {
                              ticket.responses[ticket.responses.length - 1]
                                .respondedBy
                            }
                          </span>
                        </div>
                        <p
                          className={`text-sm ${darkMode ? "text-blue-200" : "text-blue-700"}`}
                        >
                          {
                            ticket.responses[ticket.responses.length - 1]
                              .message
                          }
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setShowResponseModal(true);
                      }}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        darkMode
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      <Reply className="h-3 w-3 mr-1 inline" />
                      Respond
                    </button>

                    <select
                      value={ticket.status || "open"}
                      onChange={(e) =>
                        updateTicketStatus(ticket.id, e.target.value)
                      }
                      disabled={processing}
                      className={`px-2 py-1 rounded text-xs border ${
                        darkMode
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>

                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        darkMode
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      <Eye className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredTickets.length === 0 && (
            <div
              className={`text-center py-12 ${
                darkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              } rounded-lg border`}
            >
              <Ticket
                className={`mx-auto h-12 w-12 mb-4 ${
                  darkMode ? "text-gray-600" : "text-gray-400"
                }`}
              />
              <h3
                className={`text-lg font-medium mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}
              >
                No tickets found
              </h3>
              <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                {searchTerm || Object.values(filters).some((f) => f !== "all")
                  ? "Try adjusting your search or filters"
                  : "No support tickets have been submitted yet"}
              </p>
            </div>
          )}
        </div>

        {/* Response Modal */}
        <AnimatePresence>
          {showResponseModal && selectedTicket && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowResponseModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-4xl rounded-lg border ${
                  darkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                } p-6 max-h-[80vh] overflow-y-auto`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3
                    className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    Respond to Ticket:{" "}
                    {selectedTicket.ticketId ||
                      selectedTicket.id.substring(0, 8)}
                  </h3>
                  <button
                    onClick={() => setShowResponseModal(false)}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode
                        ? "hover:bg-gray-700 text-gray-400"
                        : "hover:bg-gray-100 text-gray-500"
                    }`}
                  >
                    ✕
                  </button>
                </div>

                {/* Ticket Details */}
                <div
                  className={`p-4 rounded-lg mb-6 ${
                    darkMode ? "bg-gray-700" : "bg-gray-50"
                  }`}
                >
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <User
                          className={`h-4 w-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        />
                        <span
                          className={`font-medium ${darkMode ? "text-white" : "text-gray-900"}`}
                        >
                          {selectedTicket.userName} ({selectedTicket.userEmail})
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar
                          className={`h-4 w-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        />
                        <span
                          className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                        >
                          {formatDate(selectedTicket.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Tag
                          className={`h-4 w-4 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
                        />
                        <span
                          className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                        >
                          {selectedTicket.category} - {selectedTicket.priority}{" "}
                          priority
                        </span>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.status)}`}
                      >
                        {selectedTicket.status?.replace("_", " ") || "open"}
                      </span>
                    </div>
                  </div>

                  <h4
                    className={`font-medium mb-2 ${darkMode ? "text-white" : "text-gray-900"}`}
                  >
                    {selectedTicket.subject}
                  </h4>
                  <p
                    className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}
                  >
                    {selectedTicket.message}
                  </p>
                </div>

                {/* Previous Responses */}
                {selectedTicket.responses &&
                  selectedTicket.responses.length > 0 && (
                    <div className="mb-6">
                      <h4
                        className={`font-medium mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}
                      >
                        Previous Responses ({selectedTicket.responses.length})
                      </h4>
                      <div className="space-y-4 max-h-60 overflow-y-auto">
                        {selectedTicket.responses.map((response, index) => (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border-l-4 ${
                              darkMode
                                ? "bg-blue-900/20 border-blue-400"
                                : "bg-blue-50 border-blue-400"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Reply
                                className={`h-4 w-4 ${darkMode ? "text-blue-400" : "text-blue-600"}`}
                              />
                              <span
                                className={`text-sm font-medium ${darkMode ? "text-blue-400" : "text-blue-600"}`}
                              >
                                {response.respondedBy}
                              </span>
                              <span
                                className={`text-xs ${darkMode ? "text-blue-300" : "text-blue-500"}`}
                              >
                                {formatDate(
                                  response.respondedAt?.toDate
                                    ? response.respondedAt.toDate()
                                    : response.respondedAt,
                                )}
                              </span>
                            </div>
                            <p
                              className={`text-sm ${darkMode ? "text-blue-200" : "text-blue-700"}`}
                            >
                              {response.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* New Response */}
                <div className="mb-4">
                  <label
                    className={`block text-sm font-medium mb-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Your Response
                  </label>
                  <textarea
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    rows={6}
                    placeholder="Type your response to the user..."
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowResponseModal(false)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      darkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addTicketResponse}
                    disabled={!responseMessage.trim() || processing}
                    className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                      darkMode
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {processing ? "Sending..." : "Send Response"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminSupportTickets;
