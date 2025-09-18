import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getCurrentWindowTabs,
  addLayout,
  getLayouts,
  deleteLayout,
  updateLayout,
  reorderLayouts,
  restoreWindowLayout,
} from "../controllers/storageController";

function BookmarksPage({
  onBack,
  onAddBookmark,
  onAddCurrentTabBookmark,
  onEditBookmark,
  onDeleteBookmark,
  onReorderBookmarks,
  bookmarks = [],
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bookmarkToDelete, setBookmarkToDelete] = useState(null);
  const [draggedBookmark, setDraggedBookmark] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [currentView, setCurrentView] = useState("bookmarks"); // 'bookmarks' or 'layouts'
  const [layouts, setLayouts] = useState([]); // Store layouts data
  const [showLayoutDeleteConfirm, setShowLayoutDeleteConfirm] = useState(false);
  const [layoutToDelete, setLayoutToDelete] = useState(null);
  const [draggedLayout, setDraggedLayout] = useState(null);
  const [dragOverLayoutIndex, setDragOverLayoutIndex] = useState(null);
  const [editingLayoutId, setEditingLayoutId] = useState(null);
  const [editingLayoutName, setEditingLayoutName] = useState("");
  const [expandedLayouts, setExpandedLayouts] = useState(new Set()); // Track which layouts are expanded

  // Load layouts from storage on component mount
  useEffect(() => {
    const loadLayouts = async () => {
      try {
        const storedLayouts = await getLayouts();
        setLayouts(storedLayouts);
      } catch (error) {
        console.error("Error loading layouts:", error);
      }
    };

    loadLayouts();
  }, []);

  const handleOpenAllBookmarks = () => {
    // Open all bookmarks in new tabs
    bookmarks.forEach((bookmark) => {
      if (bookmark.url) {
        window.open(bookmark.url, "_blank");
      }
    });
  };

  const handleAddToBookmarks = () => {
    if (onAddCurrentTabBookmark) {
      onAddCurrentTabBookmark();
    }
  };

  const handleAddWebsite = () => {
    if (onAddBookmark) {
      onAddBookmark();
    }
  };

  const handleAddLayout = async () => {
    try {
      // Use the storage controller to get tabs
      const tabsData = await getCurrentWindowTabs();

      if (tabsData.length === 0) {
        alert("No tabs found in the current window");
        return;
      }

      // Create layout data
      const newLayoutData = {
        name: tabsData[0].title, // First tab's title as layout name
        tabs: tabsData,
        tabCount: tabsData.length,
      };

      // Save to storage using the controller
      const savedLayout = await addLayout(newLayoutData);

      if (savedLayout) {
        // Add to local state
        setLayouts((prev) => [...prev, savedLayout]);
        console.log("Window layout saved:", savedLayout);
      } else {
        alert("Failed to save window layout. Please try again.");
      }
    } catch (error) {
      console.error("Error saving window layout:", error);
      alert("Failed to save window layout. Please try again.");
    }
  };

  const handleToggleToLayouts = () => {
    setCurrentView("layouts");
  };

  const handleToggleToBookmarks = () => {
    setCurrentView("bookmarks");
  };

  const handleRestoreLayout = async (layout) => {
    try {
      const success = await restoreWindowLayout(layout.tabs);

      if (success) {
        console.log("Window layout restored:", layout);
      } else {
        alert("Failed to restore window layout. Please try again.");
      }
    } catch (error) {
      console.error("Error restoring window layout:", error);
      alert("Failed to restore window layout. Please try again.");
    }
  };

  const handleDeleteLayoutClick = (layout) => {
    setLayoutToDelete(layout);
    setShowLayoutDeleteConfirm(true);
  };

  const handleConfirmLayoutDelete = async () => {
    if (layoutToDelete) {
      try {
        const success = await deleteLayout(layoutToDelete.id);
        if (success) {
          setLayouts((prev) =>
            prev.filter((layout) => layout.id !== layoutToDelete.id)
          );
        } else {
          alert("Failed to delete layout. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting layout:", error);
        alert("Failed to delete layout. Please try again.");
      }
    }
    setShowLayoutDeleteConfirm(false);
    setLayoutToDelete(null);
  };

  const handleCancelLayoutDelete = () => {
    setShowLayoutDeleteConfirm(false);
    setLayoutToDelete(null);
  };

  // Layout Drag and Drop handlers
  const handleLayoutDragStart = (e, layout, index) => {
    setDraggedLayout({ layout, index });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleLayoutDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverLayoutIndex(index);
  };

  const handleLayoutDragLeave = () => {
    setDragOverLayoutIndex(null);
  };

  const handleLayoutDrop = async (e, dropIndex) => {
    e.preventDefault();

    if (!draggedLayout || draggedLayout.index === dropIndex) {
      setDraggedLayout(null);
      setDragOverLayoutIndex(null);
      return;
    }

    const newLayouts = [...layouts];
    const draggedItem = newLayouts[draggedLayout.index];

    // Remove the dragged item
    newLayouts.splice(draggedLayout.index, 1);

    // Insert at new position
    const insertIndex =
      dropIndex > draggedLayout.index ? dropIndex - 1 : dropIndex;
    newLayouts.splice(insertIndex, 0, draggedItem);

    // Update storage with new order
    try {
      await reorderLayouts(newLayouts);
      setLayouts(newLayouts);
    } catch (error) {
      console.error("Error reordering layouts:", error);
    }

    setDraggedLayout(null);
    setDragOverLayoutIndex(null);
  };

  const handleLayoutDragEnd = () => {
    setDraggedLayout(null);
    setDragOverLayoutIndex(null);
  };

  const handleEditLayoutName = (layout) => {
    setEditingLayoutId(layout.id);
    setEditingLayoutName(layout.name);
  };

  const handleSaveLayoutName = async (layoutId) => {
    if (editingLayoutName.trim()) {
      try {
        const success = await updateLayout(layoutId, {
          name: editingLayoutName.trim(),
        });
        if (success) {
          setLayouts((prev) =>
            prev.map((layout) =>
              layout.id === layoutId
                ? { ...layout, name: editingLayoutName.trim() }
                : layout
            )
          );
        } else {
          alert("Failed to update layout name. Please try again.");
        }
      } catch (error) {
        console.error("Error updating layout name:", error);
        alert("Failed to update layout name. Please try again.");
      }
    }
    setEditingLayoutId(null);
    setEditingLayoutName("");
  };

  const handleCancelEditLayoutName = () => {
    setEditingLayoutId(null);
    setEditingLayoutName("");
  };

  const toggleLayoutExpansion = (layoutId) => {
    setExpandedLayouts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(layoutId)) {
        newSet.delete(layoutId);
      } else {
        newSet.add(layoutId);
      }
      return newSet;
    });
  };

  const handleOpenBookmark = (url) => {
    if (url) {
      window.open(url, "_blank");
    }
  };

  const handleEditBookmark = (bookmark) => {
    if (onEditBookmark) {
      onEditBookmark(bookmark);
    }
  };

  const handleDeleteClick = (bookmark) => {
    setBookmarkToDelete(bookmark);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (bookmarkToDelete && onDeleteBookmark) {
      onDeleteBookmark(bookmarkToDelete.id);
    }
    setShowDeleteConfirm(false);
    setBookmarkToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setBookmarkToDelete(null);
  };

  // Drag and Drop handlers
  const handleDragStart = (e, bookmark, index) => {
    setDraggedBookmark({ bookmark, index });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();

    if (!draggedBookmark || draggedBookmark.index === dropIndex) {
      setDraggedBookmark(null);
      setDragOverIndex(null);
      return;
    }

    const newBookmarks = [...bookmarks];
    const draggedItem = newBookmarks[draggedBookmark.index];

    // Remove the dragged item
    newBookmarks.splice(draggedBookmark.index, 1);

    // Insert at new position
    const insertIndex =
      dropIndex > draggedBookmark.index ? dropIndex - 1 : dropIndex;
    newBookmarks.splice(insertIndex, 0, draggedItem);

    if (onReorderBookmarks) {
      onReorderBookmarks(newBookmarks);
    }

    setDraggedBookmark(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedBookmark(null);
    setDragOverIndex(null);
  };

  const getBookmarkIconPath = (iconType) => {
    switch (iconType) {
      case "link":
        return "./assets/icons/Internet-white.png";
      case "discord":
        return "./assets/icons/Discord New-white.png";
      case "telegram":
        return "./assets/icons/Telegram App-white.png";
      case "twitter":
        return "./assets/icons/X-white.png";
      default:
        return "./assets/icons/Internet-white.png";
    }
  };

  const handleLinkClick = () => {
    window.open("https://tab-dex-ai.vercel.app/", "_blank");
  };

  const handleFileClick = () => {
    // Replace with actual TabDexAI documentation URL
    window.open(
      "https://github.com/pasindupiumal03/TabDexAI-Chrome-Extension/blob/main/README.md",
      "_blank"
    );
  };

  const handleTwitterClick = () => {
    // Replace with actual TabDexAI Twitter URL
    window.open("https://x.com/tabdexai", "_blank");
  };

  return (
    <motion.div
      className="w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 text-white p-4 relative"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {/* Solid color overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "#111728" }}
      ></div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header with Logo */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <img
              src="./assets/icons/tabdexai_logo-removebg.png"
              alt="TabDexAI Logo"
              className="w-12 h-12 object-contain"
            />
          </div>
        </div>
        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          <motion.button
            onClick={handleOpenAllBookmarks}
            className="w-full bg-white text-black font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-100 transition-colors"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Open All Bookmarks</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </motion.button>

          <motion.button
            onClick={handleAddToBookmarks}
            className="w-full text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            style={{ backgroundColor: "#6E4EFF" }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#5A3FE6")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#6E4EFF")}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Add to bookmarks</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </motion.button>
        </div>
        {/* Main Content Section */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Section Header with Toggle */}
          <div className="flex items-center mb-4 flex-shrink-0 justify-center">
            <div className="relative inline-flex rounded-lg bg-white/5 border border-white/10 p-1">
              <button
                onClick={handleToggleToBookmarks}
                className={`relative px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                  currentView === "bookmarks"
                    ? "text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <span className="relative z-10">
                  Bookmarks ({bookmarks.length})
                </span>
                {currentView === "bookmarks" && (
                  <motion.span
                    layoutId="tabdexai-tab-indicator"
                    className="absolute inset-0 rounded-md"
                    style={{ backgroundColor: "#6E4EFF" }}
                    transition={{ type: "spring", stiffness: 450, damping: 36 }}
                  />
                )}
              </button>
              <button
                onClick={handleToggleToLayouts}
                className={`relative px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                  currentView === "layouts"
                    ? "text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <span className="relative z-10">
                  Layouts ({layouts.length})
                </span>
                {currentView === "layouts" && (
                  <motion.span
                    layoutId="tabdexai-tab-indicator"
                    className="absolute inset-0 rounded-md"
                    style={{ backgroundColor: "#6E4EFF" }}
                    transition={{ type: "spring", stiffness: 450, damping: 36 }}
                  />
                )}
              </button>
            </div>
          </div>

          {/* Bookmarks View */}
          {currentView === "bookmarks" && (
            <>
              {/* Bookmarks List or Empty State */}
              {bookmarks.length > 0 ? (
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Scrollable Bookmarks List */}
                  <div className="flex-1 space-y-3 overflow-y-auto min-h-0 scrollbar-hide">
                    <AnimatePresence initial={false}>
                      {bookmarks.map((bookmark, index) => (
                        <motion.div
                          key={bookmark.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                          className={`bg-gray-800/50 rounded-lg p-3 flex items-center justify-between transition-all duration-200 ${
                            dragOverIndex === index
                              ? "bg-purple-600/20 border-2 border-purple-500"
                              : ""
                          } ${
                            draggedBookmark?.index === index ? "opacity-50" : ""
                          }`}
                          draggable
                          onDragStart={(e) =>
                            handleDragStart(e, bookmark, index)
                          }
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, index)}
                          onDragEnd={handleDragEnd}
                          whileHover={{ y: -2 }}
                        >
                          {/* Left side - Drag handle, Icon, Name */}
                          <div className="flex items-center space-x-3">
                            {/* Drag Handle */}
                            <div className="cursor-move hover:text-white">
                              <svg
                                className="w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M4 8h16M4 16h16"
                                />
                              </svg>
                            </div>

                            {/* Record Indicator */}
                            <div className="w-2 h-2 min-w-2 min-h-2 bg-red-500 rounded-full"></div>

                            {/* Bookmark Icon */}
                            <div
                              className="w-8 h-8 min-w-8 min-h-8 rounded flex items-center justify-center"
                              style={{ backgroundColor: "#6F4FFF" }}
                            >
                              <img
                                src={getBookmarkIconPath(bookmark.icon)}
                                alt={bookmark.icon}
                                className="w-5 h-5 min-w-5 min-h-5 object-contain"
                              />
                            </div>

                            {/* Bookmark Name */}
                            <span className="text-white font-medium">
                              {bookmark.name}
                            </span>
                          </div>

                          {/* Right side - Action buttons */}
                          <div className="flex items-center min-w-fit">
                            {/* Open in new tab */}
                            <motion.button
                              onClick={() => handleOpenBookmark(bookmark.url)}
                              className="p-1 hover:bg-gray-600/50 rounded transition-colors"
                              title="Open bookmark"
                              whileTap={{ scale: 0.95 }}
                            >
                              <svg
                                className="w-4 h-4 min-w-4 min-h-4 text-gray-300 hover:text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </motion.button>

                            {/* Edit bookmark */}
                            <motion.button
                              onClick={() => handleEditBookmark(bookmark)}
                              className="p-1 hover:bg-gray-600/50 rounded transition-colors"
                              title="Edit bookmark"
                              whileTap={{ scale: 0.95 }}
                            >
                              <svg
                                className="w-4 h-4 min-w-4 min-h-4 text-gray-300 hover:text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                />
                              </svg>
                            </motion.button>

                            {/* Delete bookmark */}
                            <motion.button
                              onClick={() => handleDeleteClick(bookmark)}
                              className="p-1 hover:bg-gray-600/50 rounded transition-colors"
                              title="Delete bookmark"
                              whileTap={{ scale: 0.95 }}
                            >
                              <svg
                                className="w-4 h-4 min-w-4 min-h-4 text-gray-300 hover:text-red-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Add Website Button - Always visible */}
                  <div className="flex-shrink-0 mt-4">
                    <motion.button
                      onClick={handleAddWebsite}
                      className="w-full py-3 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center space-x-2 hover:border-gray-500 hover:bg-gray-800/30 transition-colors"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-2xl text-gray-400">+</span>
                      <span className="text-gray-400">
                        Add a website to bookmarks
                      </span>
                    </motion.button>
                  </div>
                </div>
              ) : (
                /* Bookmarks Empty State */
                <motion.div
                  className="flex-1 flex flex-col items-center justify-center space-y-6 px-4"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="flex justify-center">
                    <img
                      src="./assets/icons/book-mark.png"
                      alt="Empty Bookmarks"
                      className="opacity-50 max-w-full h-auto"
                      style={{ maxHeight: "120px" }}
                    />
                  </div>
                  <p className="text-center text-sm opacity-80 max-w-sm">
                    Looks empty...add your first bookmark
                  </p>

                  <motion.button
                    onClick={handleAddWebsite}
                    className="bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg flex items-center space-x-2 hover:bg-gray-700 transition-colors"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-xl">+</span>
                    <span>Add a website to bookmarks</span>
                  </motion.button>
                </motion.div>
              )}
            </>
          )}

          {/* Layouts View */}
          {currentView === "layouts" && (
            <>
              {/* Layouts List or Empty State */}
              {layouts.length > 0 ? (
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Scrollable Layouts List */}
                  <div className="flex-1 space-y-3 overflow-y-auto min-h-0 scrollbar-hide">
                    <AnimatePresence initial={false}>
                      {layouts.map((layout, index) => (
                        <motion.div
                          key={layout.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.2 }}
                          className={`bg-gray-800/50 rounded-lg transition-all duration-200 ${
                            dragOverLayoutIndex === index
                              ? "bg-purple-600/20 border-2 border-purple-500"
                              : ""
                          } ${
                            draggedLayout?.index === index ? "opacity-50" : ""
                          }`}
                          draggable
                          onDragStart={(e) =>
                            handleLayoutDragStart(e, layout, index)
                          }
                          onDragOver={(e) => handleLayoutDragOver(e, index)}
                          onDragLeave={handleLayoutDragLeave}
                          onDrop={(e) => handleLayoutDrop(e, index)}
                          onDragEnd={handleLayoutDragEnd}
                          whileHover={{ y: -2 }}
                        >
                          {/* Main Layout Header */}
                          <div className="p-3 flex items-center justify-between">
                            {/* Left side - Drag handle, Icon, Name */}
                            <div className="flex items-center space-x-3">
                              {/* Drag Handle */}
                              <div className="cursor-move hover:text-white">
                                <svg
                                  className="w-4 h-4 text-gray-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 8h16M4 16h16"
                                  />
                                </svg>
                              </div>

                              {/* Green Record Indicator for saved layouts */}
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>

                              {/* Layout Icon - Restore Window */}
                              <div
                                className="w-8 h-8 rounded flex items-center justify-center"
                                style={{ backgroundColor: "#6F4FFF" }}
                              >
                                <img
                                  src="./assets/icons/Restore Window.png"
                                  alt="Layout"
                                  className="w-5 h-5 object-contain"
                                />
                              </div>

                              {/* Layout Name - First tab title */}
                              <div className="flex flex-col">
                                {editingLayoutId === layout.id ? (
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="text"
                                      value={editingLayoutName}
                                      onChange={(e) =>
                                        setEditingLayoutName(e.target.value)
                                      }
                                      onKeyPress={(e) => {
                                        if (e.key === "Enter") {
                                          handleSaveLayoutName(layout.id);
                                        } else if (e.key === "Escape") {
                                          handleCancelEditLayoutName();
                                        }
                                      }}
                                      onBlur={() =>
                                        handleSaveLayoutName(layout.id)
                                      }
                                      className="bg-gray-700 text-white text-sm px-2 py-1 rounded border-none outline-none focus:ring-1 focus:ring-purple-500 max-w-[120px]"
                                      autoFocus
                                    />
                                  </div>
                                ) : (
                                  <span className="text-white font-medium truncate max-w-[150px]">
                                    {layout.name}
                                  </span>
                                )}
                                <span className="text-gray-400 text-xs">
                                  {layout.tabCount} tabs
                                </span>
                              </div>

                              {/* Expand/Collapse Button */}
                              <motion.button
                                onClick={() => toggleLayoutExpansion(layout.id)}
                                className="p-1 hover:bg-gray-600/50 rounded transition-colors ml-2"
                                title={expandedLayouts.has(layout.id) ? "Collapse tabs" : "Expand tabs"}
                                whileTap={{ scale: 0.95 }}
                              >
                                <motion.svg
                                  className="w-4 h-4 text-gray-400 hover:text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  animate={{
                                    rotate: expandedLayouts.has(layout.id) ? 90 : 0
                                  }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M9 5l7 7-7 7"
                                  />
                                </motion.svg>
                              </motion.button>
                            </div>

                            {/* Right side - Action buttons */}
                            <div className="flex items-center space-x-2">
                              {/* Open Window - Opens all tabs from layout */}
                              <motion.button
                                onClick={() => {
                                  chrome.runtime.sendMessage({command: 'OPEN_TABS', tabs: layout.tabs})
                                }}
                                className="p-1 hover:bg-gray-600/50 rounded transition-colors"
                                title="Open all tabs in new window"
                                whileTap={{ scale: 0.95 }}
                              >
                                <svg
                                  className="w-4 h-4 text-gray-300 hover:text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                              </motion.button>

                              {/* Edit Layout Name */}
                              <motion.button
                                onClick={() => handleEditLayoutName(layout)}
                                className="p-1 hover:bg-gray-600/50 rounded transition-colors"
                                title="Edit layout name"
                                whileTap={{ scale: 0.95 }}
                              >
                                <svg
                                  className="w-4 h-4 text-gray-300 hover:text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                  />
                                </svg>
                              </motion.button>

                              {/* Delete Layout */}
                              <motion.button
                                onClick={() => handleDeleteLayoutClick(layout)}
                                className="p-1 hover:bg-gray-600/50 rounded transition-colors"
                                title="Delete layout"
                                whileTap={{ scale: 0.95 }}
                              >
                                <svg
                                  className="w-4 h-4 text-gray-300 hover:text-red-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </motion.button>
                            </div>
                          </div>

                          {/* Expandable Tab List */}
                          <AnimatePresence>
                            {expandedLayouts.has(layout.id) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden"
                              >
                                <div className="px-3 pb-3 border-t border-gray-700/50">
                                  <div className="space-y-2 mt-3">
                                    {layout.tabs.map((tab, tabIndex) => (
                                      <motion.div
                                        key={tabIndex}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: tabIndex * 0.05 }}
                                        className="bg-gray-700/30 rounded-md p-2 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
                                      >
                                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                                          {/* Tab Favicon */}
                                          <div className="w-4 h-4 min-w-4 min-h-4 rounded-sm bg-gray-600 flex items-center justify-center">
                                            {tab.favIconUrl ? (
                                              <img
                                                src={tab.favIconUrl}
                                                alt=""
                                                className="w-3 h-3 object-contain"
                                                onError={(e) => {
                                                  e.target.style.display = 'none';
                                                  e.target.nextSibling.style.display = 'block';
                                                }}
                                              />
                                            ) : null}
                                            <div className={tab.favIconUrl ? "hidden" : "block"}>
                                              <svg className="w-2 h-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.559-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.559.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                                              </svg>
                                            </div>
                                          </div>
                                          
                                          {/* Tab Title */}
                                          <span className="text-white text-xs truncate flex-1">
                                            {tab.title}
                                          </span>
                                        </div>

                                        {/* Open Tab Button */}
                                        <motion.button
                                          onClick={() => window.open(tab.url, '_blank')}
                                          className="p-1 hover:bg-gray-600/50 rounded transition-colors flex-shrink-0"
                                          title="Open tab"
                                          whileTap={{ scale: 0.95 }}
                                        >
                                          <svg
                                            className="w-3 h-3 text-gray-400 hover:text-white"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth="2"
                                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                            />
                                          </svg>
                                        </motion.button>
                                      </motion.div>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Add Layout Button */}
                  <div className="flex-shrink-0 mt-4">
                    <motion.button
                      onClick={handleAddLayout}
                      className="w-full py-3 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center space-x-2 hover:border-gray-500 hover:bg-gray-800/30 transition-colors"
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="text-2xl text-gray-400">+</span>
                      <span className="text-gray-400">
                        Add a window to layouts
                      </span>
                    </motion.button>
                  </div>
                </div>
              ) : (
                /* Layouts Empty State */
                <motion.div
                  className="flex-1 flex flex-col items-center justify-center space-y-6 px-4"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="flex justify-center">
                    <img
                      src="./assets/icons/Squared Menu.png"
                      alt="Empty Layouts"
                      className="opacity-50 max-w-full h-auto"
                      style={{ maxHeight: "120px" }}
                    />
                  </div>
                  <p className="text-center text-sm opacity-80 max-w-sm">
                    Looks empty...add your first layout
                  </p>

                  <motion.button
                    onClick={handleAddLayout}
                    className="bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg flex items-center space-x-2 hover:bg-gray-700 transition-colors"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-xl">+</span>
                    <span>Add a window to layouts</span>
                  </motion.button>
                </motion.div>
              )}
            </>
          )}
        </div>{" "}
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg p-4 mx-4 max-w-xs w-full shadow-xl"
              initial={{ scale: 0.95, y: 6, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: -6, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-red-100 mb-3">
                  <svg
                    className="h-5 w-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Delete Bookmark
                </h3>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                  Are you sure you want to delete
                  <br />
                  <span className="font-medium">
                    "{bookmarkToDelete?.name}"
                  </span>
                  ?<br />
                  This action cannot be undone.
                </p>
                <div className="flex space-x-2">
                  <motion.button
                    onClick={handleCancelDelete}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-3 rounded-md text-sm hover:bg-gray-300 transition-colors"
                    whileTap={{ scale: 0.98 }}
                  >
                    No
                  </motion.button>
                  <motion.button
                    onClick={handleConfirmDelete}
                    className="flex-1 bg-red-600 text-white py-2 px-3 rounded-md text-sm hover:bg-red-700 transition-colors"
                    whileTap={{ scale: 0.98 }}
                  >
                    Yes
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        {/* Layout Delete Confirmation Modal */}
        {showLayoutDeleteConfirm && (
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg p-4 mx-4 max-w-xs w-full shadow-xl"
              initial={{ scale: 0.95, y: 6, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: -6, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-red-100 mb-3">
                  <svg
                    className="h-5 w-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  Delete Layout
                </h3>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                  Are you sure you want to delete
                  <br />
                  <span className="font-medium">"{layoutToDelete?.name}"</span>?
                  <br />
                  This will remove {layoutToDelete?.tabCount} saved tabs.
                </p>
                <div className="flex space-x-2">
                  <motion.button
                    onClick={handleCancelLayoutDelete}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-3 rounded-md text-sm hover:bg-gray-300 transition-colors"
                    whileTap={{ scale: 0.98 }}
                  >
                    No
                  </motion.button>
                  <motion.button
                    onClick={handleConfirmLayoutDelete}
                    className="flex-1 bg-red-600 text-white py-2 px-3 rounded-md text-sm hover:bg-red-700 transition-colors"
                    whileTap={{ scale: 0.98 }}
                  >
                    Yes
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        {/* Bottom Navigation */}
        <div className="flex justify-center space-x-8 mt-6 pt-4 border-t border-purple-600/30">
          <motion.button
            className="p-2 rounded-lg transition-all duration-300 hover:bg-purple-600/20 hover:scale-110 active:scale-95"
            onClick={handleLinkClick}
            whileTap={{ scale: 0.95 }}
          >
            <img
              src="./assets/icons/link.png"
              alt="Link"
              className="w-6 h-6 transition-all duration-300 hover:brightness-125"
            />
          </motion.button>
          <motion.button
            className="p-2 rounded-lg transition-all duration-300 hover:bg-purple-600/20 hover:scale-110 active:scale-95"
            onClick={handleFileClick}
            whileTap={{ scale: 0.95 }}
          >
            <img
              src="./assets/icons/file.png"
              alt="File"
              className="w-6 h-6 transition-all duration-300 hover:brightness-125"
            />
          </motion.button>
          <motion.button
            className="p-2 rounded-lg transition-all duration-300 hover:bg-purple-600/20 hover:scale-110 active:scale-95"
            onClick={handleTwitterClick}
            whileTap={{ scale: 0.95 }}
          >
            <img
              src="./assets/icons/twitter.png"
              alt="Twitter"
              className="w-6 h-6 transition-all duration-300 hover:brightness-125"
            />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default BookmarksPage;
