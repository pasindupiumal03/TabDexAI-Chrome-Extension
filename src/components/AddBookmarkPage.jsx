import React, { useState, useEffect } from "react";

function AddBookmarkPage({ onBack, onSave, editingBookmark, currentTabInfo }) {
  const [bookmarkName, setBookmarkName] = useState("");
  const [bookmarkUrl, setBookmarkUrl] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("link"); // link, discord, telegram, twitter

  // Effect to populate form based on editing or current tab data
  useEffect(() => {
    if (editingBookmark) {
      // Editing existing bookmark
      setBookmarkName(editingBookmark.name || "");
      setBookmarkUrl(editingBookmark.url || "");
      setSelectedIcon(editingBookmark.icon || "link");
    } else if (currentTabInfo) {
      // Adding current tab as bookmark
      setBookmarkName(currentTabInfo.title || "");
      setBookmarkUrl(currentTabInfo.url || "");
      setSelectedIcon("link"); // Default to link icon for web pages
    } else {
      // Manual entry
      setBookmarkName("");
      setBookmarkUrl("");
      setSelectedIcon("link");
    }
  }, [editingBookmark, currentTabInfo]);

  const iconOptions = [
    { id: "link", iconPath: "./assets/icons/Internet-white.png", alt: "Link" },
    { id: "discord", iconPath: "./assets/icons/Discord New-white.png", alt: "Discord" },
    { id: "telegram", iconPath: "./assets/icons/Telegram App-white.png", alt: "Telegram" },
    { id: "twitter", iconPath: "./assets/icons/X-white.png", alt: "Twitter" }
  ];

  const handleSaveBookmark = () => {
    if (!bookmarkName.trim() || !bookmarkUrl.trim()) {
      alert('Please fill in both name and URL fields');
      return;
    }

    const bookmarkData = {
      name: bookmarkName.trim(),
      url: bookmarkUrl.trim(),
      icon: selectedIcon,
      id: editingBookmark?.id || Date.now() // Use existing ID for editing, new ID for new bookmark
    };
    
    if (onSave) {
      onSave(bookmarkData);
    }
    console.log(editingBookmark ? "Updating bookmark:" : "Saving bookmark:", bookmarkData);
  };

  const handleLinkClick = () => {
    window.open('https://tab-dex-ai.vercel.app/', '_blank');
  };

  const handleFileClick = () => {
    window.open('https://github.com/pasindupiumal03/TabDexAI-Chrome-Extension/blob/main/README.md', '_blank');
  };

  const handleTwitterClick = () => {
    window.open('https://x.com/tabdexai', '_blank');
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 text-white p-3 relative overflow-hidden">
      {/* Solid color overlay */}
      <div className="absolute inset-0" style={{ backgroundColor: '#111728' }}></div>
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Header with Logo */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <img 
              src="./assets/icons/tabdexai_logo-removebg.png" 
              alt="TabDexAI Logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
        </div>

        {/* Main Content - Fixed height to prevent overflow */}
        <div className="flex-1 bg-[#e9e9e9] rounded-lg p-4 text-black relative overflow-hidden flex flex-col min-h-0">
          {/* Large bookmark icon at top */}
          <div className="flex justify-center flex-shrink-0 mt-5">
            <img 
              src="./assets/icons/book-mark.png" 
              alt="Empty Bookmarks" 
              className="max-w-full h-auto"
              style={{ maxHeight: '50px' }}
            />
          </div>

          {/* Form Fields Container */}
          <div className="flex-1 flex flex-col space-y-4 min-h-0">
            {/* Name Field */}
            <div className="flex-shrink-0">
              <label className="block text-gray-600 text-sm font-medium mb-2">
                Name
              </label>
              <input
                type="text"
                value={bookmarkName}
                onChange={(e) => setBookmarkName(e.target.value)}
                className="w-full bg-gray-800 text-white p-3 text-sm rounded-lg border-none outline-none"
                placeholder="Enter bookmark name"
              />
            </div>

            {/* URL Field */}
            <div className="flex-shrink-0">
              <label className="block text-gray-600 text-sm font-medium mb-2">
                Url
              </label>
              <input
                type="url"
                value={bookmarkUrl}
                onChange={(e) => setBookmarkUrl(e.target.value)}
                className="w-full bg-gray-800 text-white p-3 text-sm rounded-lg border-none outline-none"
                placeholder="Enter website URL"
              />
            </div>

            {/* Icon Selection */}
            <div className="flex-shrink-0">
              <label className="block text-gray-600 text-sm font-medium mb-3">
                Choose an icon
              </label>
              <div className="flex space-x-3 justify-center">
                {iconOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedIcon(option.id)}
                    className={`w-14 h-14 rounded-lg flex items-center justify-center transition-all ${
                      selectedIcon === option.id ? 'shadow-lg' : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{ 
                      backgroundColor: selectedIcon === option.id ? '#6F4FFF' : '#969eac'
                    }}
                  >
                    <img 
                      src={option.iconPath} 
                      alt={option.alt} 
                      className="w-7 h-7 object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex-shrink-0 space-y-3 pt-3">
              <button
                onClick={handleSaveBookmark}
                className="w-full text-white font-semibold py-3 px-4 rounded-lg transition-colors text-sm hover:shadow-lg active:scale-95"
                style={{ backgroundColor: '#6E4EFF' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#5A3FE6'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#6E4EFF'}
              >
                {editingBookmark ? 'Update bookmark' : 'Save to bookmarks'}
              </button>
              
              <button
                onClick={onBack}
                className="w-full text-center bg-transparent text-gray-600 font-medium px-4 text-sm active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-center space-x-8 mt-4 pt-3 border-t border-purple-600/30 flex-shrink-0">
          <button 
            className="p-1 rounded-lg transition-all duration-300 hover:bg-purple-600/20 hover:scale-110 active:scale-95" 
            onClick={handleLinkClick}
          >
            <img 
              src="./assets/icons/link.png" 
              alt="Link" 
              className="w-4 h-4 transition-all duration-300 hover:brightness-125"
            />
          </button>
          <button 
            className="p-1 rounded-lg transition-all duration-300 hover:bg-purple-600/20 hover:scale-110 active:scale-95" 
            onClick={handleFileClick}
          >
            <img 
              src="./assets/icons/file.png" 
              alt="File" 
              className="w-4 h-4 transition-all duration-300 hover:brightness-125"
            />
          </button>
          <button 
            className="p-1 rounded-lg transition-all duration-300 hover:bg-purple-600/20 hover:scale-110 active:scale-95" 
            onClick={handleTwitterClick}
          >
            <img 
              src="./assets/icons/twitter.png" 
              alt="Twitter" 
              className="w-4 h-4 transition-all duration-300 hover:brightness-125"
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddBookmarkPage;
