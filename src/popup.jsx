import React, { useState, useEffect } from "react";
import {
  saveToStorage,
  getFromStorage,
  getCurrentTab,
  saveBookmarks,
  getBookmarks,
  addBookmark,
  updateBookmark,
  deleteBookmark,
  reorderBookmarks,
} from "./controllers/storageController.js";
import { createRoot } from "react-dom/client";
import "./index.css";
import WelcomePage from "./components/WelcomePage.jsx";
import BookmarksPage from "./components/BookmarksPage.jsx";
import AddBookmarkPage from "./components/AddBookmarkPage.jsx";
import BookmarkSavedPage from "./components/BookmarkSavedPage.jsx";

function Popup() {
  const [currentPage, setCurrentPage] = useState("bookmarks"); // 'welcome', 'bookmarks', 'addBookmark', or 'bookmarkSaved'
  const [bookmarks, setBookmarks] = useState([]);
  const [lastSavedBookmark, setLastSavedBookmark] = useState(null);
  const [editingBookmark, setEditingBookmark] = useState(null); // For editing existing bookmarks
  const [currentTabInfo, setCurrentTabInfo] = useState(null); // For auto-filling current tab data
  const [loading, setLoading] = useState(false); // For loading states
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Load bookmarks from storage on component mount
  useEffect(() => {
    loadBookmarksFromStorage();

    const checkLoginState = async () => {
      const storedLoginState = await getFromStorage("walletAddress");
      if (storedLoginState.walletAddress) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };

    checkLoginState();
  }, []);

  const loadBookmarksFromStorage = async () => {
    try {
      setLoading(true);
      const storedBookmarks = await getBookmarks();
      setBookmarks(storedBookmarks);
      console.log("Loaded bookmarks from storage:", storedBookmarks);
    } catch (error) {
      console.error("Error loading bookmarks:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to get current tab information using enhanced storageController
  const getCurrentTabInfo = async () => {
    try {
      const tab = await getCurrentTab();
      if (tab) {
        return {
          title: tab.title,
          url: tab.url,
          favIconUrl: tab.favIconUrl,
        };
      }
      return null;
    } catch (error) {
      console.error("Error getting tab info:", error);
      return null;
    }
  };

  const handlePhantomConnect = async () => {
    try {
      setLoading(true);
      console.log("Connecting to Phantom wallet via content script...");

      // Ask background to open the dedicated connect tab and orchestrate load
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage(
          { type: "TABDEXAI_OPEN_CONNECT_TAB", url: "https://tab-dex-ai.vercel.app/extension" },
          (res) => resolve(res || {})
        );
      });

      if (response?.error) {
        if (response.error === "PHANTOM_NOT_FOUND") {
          if (confirm("Phantom wallet not found. Open install page?")) {
            chrome.tabs.create({ url: "https://phantom.app/download" });
          }
        } else {
          alert(`Failed to connect: ${response.error}`);
        }
        return;
      }

      const address = response?.address;
      if (!address) {
        alert("No address returned from Phantom.");
        return;
      }

      // Save address directly via chrome.storage.local if present
      if (response?.address) {
        try {
          await new Promise((resolve) => chrome.storage?.local?.set?.({ walletAddress: response.address }, resolve));
        } catch (_) {}
      }
      // Background owns the lifecycle of the helper tab; nothing to close here

      // Save address to storage
      await saveToStorage({
        walletAddress: address,
        walletProvider: "phantom",
      });
      console.log("Wallet connected:", address);
      setIsLoggedIn(true)

      // Navigate to bookmarks after successful connection
      setCurrentPage("bookmarks");
    } catch (error) {
      console.error("Error during Phantom connect:", error);
      alert("Error connecting to wallet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToWelcome = () => {
    setCurrentPage("welcome");
  };

  const handleAddBookmark = () => {
    setEditingBookmark(null); // Clear editing state for new bookmark
    setCurrentTabInfo(null); // Clear tab info for manual entry
    setCurrentPage("addBookmark");
  };

  const handleAddCurrentTabBookmark = async () => {
    setEditingBookmark(null); // Clear editing state
    const tabInfo = await getCurrentTabInfo();
    setCurrentTabInfo(tabInfo);
    setCurrentPage("addBookmark");
  };

  const handleEditBookmark = (bookmark) => {
    setEditingBookmark(bookmark);
    setCurrentPage("addBookmark");
  };

  const handleBackToBookmarks = () => {
    setEditingBookmark(null); // Clear editing state
    setCurrentTabInfo(null); // Clear tab info
    setCurrentPage("bookmarks");
  };

  const handleSaveBookmark = async (bookmarkData) => {
    try {
      setLoading(true);
      let savedBookmark;

      if (editingBookmark) {
        // Update existing bookmark using storageController
        savedBookmark = await updateBookmark(editingBookmark.id, bookmarkData);
        if (savedBookmark) {
          setBookmarks((prev) =>
            prev.map((bookmark) =>
              bookmark.id === editingBookmark.id ? savedBookmark : bookmark
            )
          );
        }
        setEditingBookmark(null);
      } else {
        // Add new bookmark using storageController
        savedBookmark = await addBookmark(bookmarkData);
        if (savedBookmark) {
          setBookmarks((prev) => [...prev, savedBookmark]);
        }
      }

      if (savedBookmark) {
        setLastSavedBookmark(savedBookmark);
        setCurrentPage("bookmarks"); // Navigate directly to bookmarks page
        console.log("Bookmark saved:", savedBookmark);
      } else {
        alert("Failed to save bookmark. Please try again.");
      }
    } catch (error) {
      console.error("Error saving bookmark:", error);
      alert("Error saving bookmark. Please try again.");
    } finally {
      setLoading(false);
      setCurrentTabInfo(null); // Clear tab info after saving
    }
  };

  const handleDeleteBookmark = async (bookmarkId) => {
    try {
      setLoading(true);
      const success = await deleteBookmark(bookmarkId);
      if (success) {
        setBookmarks((prev) =>
          prev.filter((bookmark) => bookmark.id !== bookmarkId)
        );
        console.log("Bookmark deleted successfully");
      } else {
        alert("Failed to delete bookmark. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      alert("Error deleting bookmark. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReorderBookmarks = async (newBookmarks) => {
    try {
      const reorderedBookmarks = await reorderBookmarks(newBookmarks);
      if (reorderedBookmarks) {
        setBookmarks(reorderedBookmarks);
        console.log("Bookmarks reordered successfully");
      }
    } catch (error) {
      console.error("Error reordering bookmarks:", error);
    }
  };

  const handleBackToBookmarksFromSaved = () => {
    setCurrentPage("bookmarks");
  };

  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-gray-600">Processing...</p>
          </div>
        </div>
      )}
      {!isLoggedIn && <WelcomePage onConnect={handlePhantomConnect} />}
      {isLoggedIn && (
        <>
          {currentPage === "bookmarks" && (
            <BookmarksPage
              onBack={handleBackToWelcome}
              onAddBookmark={handleAddBookmark}
              onAddCurrentTabBookmark={handleAddCurrentTabBookmark}
              onEditBookmark={handleEditBookmark}
              onDeleteBookmark={handleDeleteBookmark}
              onReorderBookmarks={handleReorderBookmarks}
              bookmarks={bookmarks}
            />
          )}
          {currentPage === "addBookmark" && (
            <AddBookmarkPage
              onBack={handleBackToBookmarks}
              onSave={handleSaveBookmark}
              editingBookmark={editingBookmark}
              currentTabInfo={currentTabInfo}
            />
          )}
          {currentPage === "bookmarkSaved" && (
            <BookmarkSavedPage
              onBackToBookmarks={handleBackToBookmarksFromSaved}
              bookmarkData={lastSavedBookmark}
            />
          )}
        </>
      )}
    </>
  );
}

const root = createRoot(document.getElementById("react-target"));
root.render(<Popup />);
