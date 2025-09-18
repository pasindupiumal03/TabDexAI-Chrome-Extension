// Basic storage functions
export const saveToStorage = obj => new Promise(resolve => {
    chrome.storage.local.set(obj, res => resolve(true));
})

export const getFromStorage = arr => new Promise(resolve => {
    chrome.storage.local.get(arr, res => resolve(res));
})

// Chrome tabs API integration
export const getCurrentTab = async () => {
    try {
        let queryOptions = { active: true, lastFocusedWindow: true };
        // `tab` will either be a `tabs.Tab` instance or `undefined`.
        let [tab] = await chrome.tabs.query(queryOptions);
        return tab;
    } catch (error) {
        console.error('Error getting current tab:', error);
        return null;
    }
}

// Get all tabs in current window
export const getCurrentWindowTabs = async () => {
    try {
        const tabs = await chrome.tabs.query({ currentWindow: true });
        return tabs.map(tab => ({
            id: tab.id,
            title: tab.title,
            url: tab.url,
            favIconUrl: tab.favIconUrl,
            pinned: tab.pinned,
            index: tab.index
        }));
    } catch (error) {
        console.error('Error getting current window tabs:', error);
        return [];
    }
}

// Restore window layout by replacing all tabs
export const restoreWindowLayout = async (tabsData) => {
    try {
        // Get current tabs in the window
        const currentTabs = await chrome.tabs.query({ currentWindow: true });
        
        // Close all tabs except the first one
        for (let i = 1; i < currentTabs.length; i++) {
            await chrome.tabs.remove(currentTabs[i].id);
        }

        // Open all tabs from the saved layout
        for (let i = 0; i < tabsData.length; i++) {
            const tabData = tabsData[i];
            
            if (i === 0) {
                // Update the first tab instead of creating a new one
                await chrome.tabs.update(currentTabs[0].id, { url: tabData.url });
            } else {
                // Create new tabs for the rest
                await chrome.tabs.create({
                    url: tabData.url,
                    pinned: tabData.pinned,
                    index: i
                });
            }
        }
        
        return true;
    } catch (error) {
        console.error('Error restoring window layout:', error);
        return false;
    }
}

// Bookmark-specific storage functions
export const saveBookmarks = async (bookmarks) => {
    try {
        await saveToStorage({ bookmarks });
        console.log('Bookmarks saved successfully:', bookmarks);
        return true;
    } catch (error) {
        console.error('Error saving bookmarks:', error);
        return false;
    }
}

export const getBookmarks = async () => {
    try {
        const storageResult = await getFromStorage(["bookmarks"]);
        const { bookmarks } = storageResult;
        return bookmarks || []; // Return empty array if no bookmarks exist
    } catch (error) {
        console.error('Error getting bookmarks:', error);
        return [];
    }
}

// Add a new bookmark to storage
export const addBookmark = async (bookmark) => {
    try {
        const currentBookmarks = await getBookmarks();
        const newBookmark = {
            ...bookmark,
            id: bookmark.id || Date.now(),
            createdAt: new Date().toISOString()
        };
        const updatedBookmarks = [...currentBookmarks, newBookmark];
        await saveBookmarks(updatedBookmarks);
        return newBookmark;
    } catch (error) {
        console.error('Error adding bookmark:', error);
        return null;
    }
}

// Update an existing bookmark in storage
export const updateBookmark = async (bookmarkId, updatedData) => {
    try {
        const currentBookmarks = await getBookmarks();
        const updatedBookmarks = currentBookmarks.map(bookmark => 
            bookmark.id === bookmarkId 
                ? { ...bookmark, ...updatedData, updatedAt: new Date().toISOString() }
                : bookmark
        );
        await saveBookmarks(updatedBookmarks);
        return updatedBookmarks.find(bookmark => bookmark.id === bookmarkId);
    } catch (error) {
        console.error('Error updating bookmark:', error);
        return null;
    }
}

// Delete a bookmark from storage
export const deleteBookmark = async (bookmarkId) => {
    try {
        const currentBookmarks = await getBookmarks();
        const filteredBookmarks = currentBookmarks.filter(bookmark => bookmark.id !== bookmarkId);
        await saveBookmarks(filteredBookmarks);
        return true;
    } catch (error) {
        console.error('Error deleting bookmark:', error);
        return false;
    }
}

// Reorder bookmarks in storage
export const reorderBookmarks = async (newBookmarks) => {
    try {
        // Add order index to maintain sequence
        const bookmarksWithOrder = newBookmarks.map((bookmark, index) => ({
            ...bookmark,
            order: index,
            updatedAt: new Date().toISOString()
        }));
        await saveBookmarks(bookmarksWithOrder);
        return bookmarksWithOrder;
    } catch (error) {
        console.error('Error reordering bookmarks:', error);
        return null;
    }
}

// Layout-specific storage functions
export const saveLayouts = async (layouts) => {
    try {
        await saveToStorage({ layouts });
        console.log('Layouts saved successfully:', layouts);
        return true;
    } catch (error) {
        console.error('Error saving layouts:', error);
        return false;
    }
}

export const getLayouts = async () => {
    try {
        const storageResult = await getFromStorage(["layouts"]);
        const { layouts } = storageResult;
        return layouts || []; // Return empty array if no layouts exist
    } catch (error) {
        console.error('Error getting layouts:', error);
        return [];
    }
}

// Add a new layout to storage
export const addLayout = async (layout) => {
    try {
        const currentLayouts = await getLayouts();
        const newLayout = {
            ...layout,
            id: layout.id || Date.now(),
            createdAt: new Date().toISOString()
        };
        const updatedLayouts = [...currentLayouts, newLayout];
        await saveLayouts(updatedLayouts);
        return newLayout;
    } catch (error) {
        console.error('Error adding layout:', error);
        return null;
    }
}

// Update an existing layout in storage
export const updateLayout = async (layoutId, updatedData) => {
    try {
        const currentLayouts = await getLayouts();
        const updatedLayouts = currentLayouts.map(layout => 
            layout.id === layoutId 
                ? { ...layout, ...updatedData, updatedAt: new Date().toISOString() }
                : layout
        );
        await saveLayouts(updatedLayouts);
        return updatedLayouts.find(layout => layout.id === layoutId);
    } catch (error) {
        console.error('Error updating layout:', error);
        return null;
    }
}

// Delete a layout from storage
export const deleteLayout = async (layoutId) => {
    try {
        const currentLayouts = await getLayouts();
        const filteredLayouts = currentLayouts.filter(layout => layout.id !== layoutId);
        await saveLayouts(filteredLayouts);
        return true;
    } catch (error) {
        console.error('Error deleting layout:', error);
        return false;
    }
}

// Reorder layouts in storage
export const reorderLayouts = async (newLayouts) => {
    try {
        // Add order index to maintain sequence
        const layoutsWithOrder = newLayouts.map((layout, index) => ({
            ...layout,
            order: index,
            updatedAt: new Date().toISOString()
        }));
        await saveLayouts(layoutsWithOrder);
        return layoutsWithOrder;
    } catch (error) {
        console.error('Error reordering layouts:', error);
        return null;
    }
}

