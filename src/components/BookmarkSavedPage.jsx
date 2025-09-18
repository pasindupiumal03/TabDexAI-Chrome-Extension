import React from "react";

function BookmarkSavedPage({ onBackToBookmarks, bookmarkData }) {
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
    <div className="w-full h-full bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 text-white p-4 relative">
      {/* Solid color overlay */}
      <div className="absolute inset-0" style={{ backgroundColor: '#111728' }}></div>
      
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

        {/* Main Content */}
        <div className="flex-1 bg-white rounded-lg p-6 text-black relative overflow-hidden flex flex-col">
          {/* Header with Back Button */}
          <div className="flex items-center mb-6">
            <button 
              onClick={onBackToBookmarks}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-gray-800 ml-2">Bookmarks</h1>
            <span className="ml-2 text-sm text-gray-500">(1)</span>
          </div>

          {/* Bookmark Item */}
          {bookmarkData && (
            <div className="border-b border-gray-200 pb-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* Icon */}
                  <div className="w-6 h-6 flex items-center justify-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>
                  
                  {/* Discord Icon */}
                  <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
                    <img 
                      src={`./assets/icons/${bookmarkData.icon === 'link' ? 'Internet-white.png' : 
                        bookmarkData.icon === 'discord' ? 'Discord New-white.png' :
                        bookmarkData.icon === 'telegram' ? 'Telegram App-white.png' :
                        'X-white.png'}`}
                      alt={bookmarkData.icon}
                      className="w-5 h-5 object-contain"
                    />
                  </div>
                  
                  {/* Bookmark Info */}
                  <div>
                    <h3 className="font-medium text-gray-900">{bookmarkData.name}</h3>
                  </div>
                </div>
                
                {/* Action Icons */}
                <div className="flex items-center min-w-fit">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Website Button */}
          <div className="flex-1 flex items-center justify-center">
            <button 
              onClick={onBackToBookmarks}
              className="flex items-center justify-center w-full py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-gray-500 text-sm">Add a website to bookmarks</span>
            </button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-center space-x-8 mt-6 pt-4 border-t border-purple-600/30">
          <button 
            className="p-2 rounded-lg transition-all duration-300 hover:bg-purple-600/20 hover:scale-110 active:scale-95" 
            onClick={handleLinkClick}
          >
            <img 
              src="./assets/icons/link.png" 
              alt="Link" 
              className="w-6 h-6 transition-all duration-300 hover:brightness-125"
            />
          </button>
          <button 
            className="p-2 rounded-lg transition-all duration-300 hover:bg-purple-600/20 hover:scale-110 active:scale-95" 
            onClick={handleFileClick}
          >
            <img 
              src="./assets/icons/file.png" 
              alt="File" 
              className="w-6 h-6 transition-all duration-300 hover:brightness-125"
            />
          </button>
          <button 
            className="p-2 rounded-lg transition-all duration-300 hover:bg-purple-600/20 hover:scale-110 active:scale-95" 
            onClick={handleTwitterClick}
          >
            <img 
              src="./assets/icons/twitter.png" 
              alt="Twitter" 
              className="w-6 h-6 transition-all duration-300 hover:brightness-125"
            />
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookmarkSavedPage;