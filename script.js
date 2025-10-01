// ==========================================
// INITIAL SETUP & DATA STRUCTURE
// ==========================================

/**
 * Predefined user data with profiles
 * Each user has: id, name, bio, and profile picture
 */
const users = [
    {
        id: 1,
        name: "Nitesh Sawardekar",
        bio: "Tech enthusiast | Web Developer | Coffee lover ☕",
        profilePic: "https://i.pravatar.cc/150?img=12"
    },
    {
        id: 2,
        name: "seema Singh",
        bio: "Designer | Traveler | Photography 📸",
        profilePic: "https://i.pravatar.cc/150?img=45"
    },
    {
        id: 3,
        name: "Dead Coder",
        bio: "Entrepreneur | Fitness enthusiast | Motivational speaker 💪",
        profilePic: "https://i.pravatar.cc/150?img=33"
    }
];

/**
 * Global state management
 * - currentUserId: Tracks which user is currently logged in
 * - currentPostId: For tracking comments on specific posts
 * - uploadedImage: Stores image data URL for post creation
 */
let currentUserId = 1; // Default user is Alex Johnson
let currentPostId = null; // For comment functionality
let uploadedImage = null; // For storing uploaded image

// ==========================================
// LOCAL STORAGE FUNCTIONS
// ==========================================

/**
 * Retrieves all posts from localStorage
 * Returns empty array if no posts exist
 */
function getPosts() {
    const posts = localStorage.getItem('posts');
    return posts ? JSON.parse(posts) : [];
}

/**
 * Saves posts array to localStorage
 * Uses JSON.stringify to convert objects to string
 */
function savePosts(posts) {
    localStorage.setItem('posts', JSON.stringify(posts));
}

/**
 * Retrieves all likes from localStorage
 * Structure: { postId: [userId1, userId2, ...] }
 */
function getLikes() {
    const likes = localStorage.getItem('likes');
    return likes ? JSON.parse(likes) : {};
}

/**
 * Saves likes object to localStorage
 */
function saveLikes(likes) {
    localStorage.setItem('likes', JSON.stringify(likes));
}

/**
 * Retrieves all comments from localStorage
 * Structure: { postId: [comment1, comment2, ...] }
 */
function getComments() {
    const comments = localStorage.getItem('comments');
    return comments ? JSON.parse(comments) : {};
}

/**
 * Saves comments object to localStorage
 */
function saveComments(comments) {
    localStorage.setItem('comments', JSON.stringify(comments));
}

// ==========================================
// INITIALIZATION FUNCTION
// ==========================================

/**
 * Initialize the application when DOM is fully loaded
 * Sets up user selector, profile display, and event listeners
 */
function init() {
    // Populate user dropdown selector
    populateUserSelector();
    
    // Display current user's profile information
    updateCurrentUserProfile();
    
    // Load and display all posts in the feed
    renderFeed();
    
    // Display all users in the right sidebar
    renderAllUsers();
    
    // Setup all event listeners
    setupEventListeners();
}

// ==========================================
// USER MANAGEMENT FUNCTIONS
// ==========================================

/**
 * Populates the user dropdown with all available users
 */
function populateUserSelector() {
    const userDropdown = document.getElementById('currentUser');
    userDropdown.innerHTML = '';
    
    users.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.name;
        if (user.id === currentUserId) {
            option.selected = true;
        }
        userDropdown.appendChild(option);
    });
}

/**
 * Gets user object by user ID
 * Returns user object or null if not found
 */
function getUserById(userId) {
    return users.find(user => user.id === userId);
}

/**
 * Updates the left sidebar with current user's profile information
 * Displays profile picture, name, bio, and statistics
 */
function updateCurrentUserProfile() {
    const currentUser = getUserById(currentUserId);
    
    // Update profile picture
    document.getElementById('currentUserPic').src = currentUser.profilePic;
    document.getElementById('currentUserPic').alt = currentUser.name;
    
    // Update name and bio
    document.getElementById('currentUserName').textContent = currentUser.name;
    document.getElementById('currentUserBio').textContent = currentUser.bio;
    
    // Calculate and display statistics
    const posts = getPosts();
    const likes = getLikes();
    const comments = getComments();
    
    // Count user's posts
    const userPosts = posts.filter(post => post.userId === currentUserId).length;
    
    // Count total likes received on user's posts
    let userLikes = 0;
    posts.forEach(post => {
        if (post.userId === currentUserId && likes[post.id]) {
            userLikes += likes[post.id].length;
        }
    });
    
    // Count total comments on user's posts
    let userComments = 0;
    posts.forEach(post => {
        if (post.userId === currentUserId && comments[post.id]) {
            userComments += comments[post.id].length;
        }
    });
    
    // Display statistics
    document.getElementById('userPosts').textContent = userPosts;
    document.getElementById('userLikes').textContent = userLikes;
    document.getElementById('userComments').textContent = userComments;
}

/**
 * Displays all users in the right sidebar
 * Excludes the current user from the list
 */
function renderAllUsers() {
    const usersList = document.getElementById('allUsersList');
    usersList.innerHTML = '';
    
    users.forEach(user => {
        // Skip current user
        if (user.id === currentUserId) return;
        
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.onclick = () => showUserProfile(user.id);
        
        userItem.innerHTML = `
            <img src="${user.profilePic}" alt="${user.name}" class="user-item-pic">
            <div class="user-item-info">
                <h5>${user.name}</h5>
                <p>${user.bio}</p>
            </div>
        `;
        
        usersList.appendChild(userItem);
    });
}

// ==========================================
// POST CREATION FUNCTIONS
// ==========================================

/**
 * Creates a new post and saves it to localStorage
 * Validates that content or image is provided
 */
function createPost() {
    const content = document.getElementById('postContent').value.trim();
    
    // Validation: Post must have content or image
    if (!content && !uploadedImage) {
        alert('Please write something or upload an image!');
        return;
    }
    
    const posts = getPosts();
    
    // Create new post object
    const newPost = {
        id: Date.now(), // Unique ID based on timestamp
        userId: currentUserId,
        content: content,
        image: uploadedImage,
        timestamp: new Date().toISOString(),
        isShared: false,
        originalPostId: null
    };
    
    // Add post to beginning of array (newest first)
    posts.unshift(newPost);
    savePosts(posts);
    
    // Clear form
    document.getElementById('postContent').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    uploadedImage = null;
    document.getElementById('charCount').textContent = '0';
    
    // Refresh feed and profile stats
    renderFeed();
    updateCurrentUserProfile();
}

/**
 * Handles character count for post textarea
 * Shows warning colors when approaching limit
 */
function updateCharCount() {
    const textarea = document.getElementById('postContent');
    const charCount = document.getElementById('charCount');
    const currentLength = textarea.value.length;
    
    charCount.textContent = currentLength;
    
    // Visual feedback based on character count
    if (currentLength > 250) {
        charCount.parentElement.classList.add('danger');
        charCount.parentElement.classList.remove('warning');
    } else if (currentLength > 200) {
        charCount.parentElement.classList.add('warning');
        charCount.parentElement.classList.remove('danger');
    } else {
        charCount.parentElement.classList.remove('warning', 'danger');
    }
}

/**
 * Handles image upload and preview
 * Converts image to Data URL for storage in localStorage
 */
function handleImageUpload(event) {
    const file = event.target.files[0];
    
    if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file!');
            return;
        }
        
        const reader = new FileReader();
        
        // When file is loaded, create preview
        reader.onload = function(e) {
            uploadedImage = e.target.result;
            
            const preview = document.getElementById('imagePreview');
            preview.innerHTML = `
                <img src="${uploadedImage}" alt="Preview" class="preview-image">
                <button class="remove-image" onclick="removeImage()">
                    <i class="fas fa-times"></i>
                </button>
            `;
        };
        
        reader.readAsDataURL(file);
    }
}

/**
 * Removes uploaded image from preview
 */
function removeImage() {
    uploadedImage = null;
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('imageUpload').value = '';
}

// ==========================================
// FEED RENDERING FUNCTIONS
// ==========================================

/**
 * Renders all posts in the feed
 * Displays posts in reverse chronological order
 */
function renderFeed() {
    const feedContainer = document.getElementById('feedContainer');
    const posts = getPosts();
    
    // Check if there are any posts
    if (posts.length === 0) {
        feedContainer.innerHTML = `
            <div class="empty-feed">
                <i class="fas fa-comments"></i>
                <h3>No posts yet</h3>
                <p>Be the first to share something!</p>
            </div>
        `;
        return;
    }
    
    feedContainer.innerHTML = '';
    
    // Render each post
    posts.forEach(post => {
        const postCard = createPostCard(post);
        feedContainer.appendChild(postCard);
    });
}

/**
 * Creates a post card element with all functionality
 * Includes user info, content, image, and action buttons
 */
function createPostCard(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post-card';
    
    const user = getUserById(post.userId);
    const likes = getLikes();
    const comments = getComments();
    
    // Check if current user has liked this post
    const isLiked = likes[post.id] && likes[post.id].includes(currentUserId);
    const likeCount = likes[post.id] ? likes[post.id].length : 0;
    const commentCount = comments[post.id] ? comments[post.id].length : 0;
    
    // Format timestamp to readable format
    const timestamp = formatTimestamp(post.timestamp);
    
    // Build post HTML
    let postHTML = `
        <div class="post-header">
            <div class="post-user-info">
                <img src="${user.profilePic}" alt="${user.name}" class="post-user-pic" onclick="showUserProfile(${user.id})">
                <div class="post-user-details">
                    <h4 onclick="showUserProfile(${user.id})">${user.name}</h4>
                    <span class="post-timestamp">${timestamp}</span>
                </div>
            </div>
            ${post.isShared ? '<div class="shared-badge"><i class="fas fa-share"></i> Shared Post</div>' : ''}
        </div>
        
        <div class="post-content">
            <p class="post-text">${escapeHTML(post.content)}</p>
            ${post.image ? `<img src="${post.image}" alt="Post image" class="post-image">` : ''}
        </div>
        
        <div class="post-actions">
            <button class="action-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike(${post.id})">
                <i class="fas fa-heart"></i>
                <span>${likeCount} Like${likeCount !== 1 ? 's' : ''}</span>
            </button>
            <button class="action-btn" onclick="openCommentModal(${post.id})">
                <i class="fas fa-comment"></i>
                <span>${commentCount} Comment${commentCount !== 1 ? 's' : ''}</span>
            </button>
            ${!post.isShared ? `<button class="action-btn" onclick="sharePost(${post.id})">
                <i class="fas fa-share"></i>
                <span>Share</span>
            </button>` : ''}
        </div>
    `;
    
    postDiv.innerHTML = postHTML;
    return postDiv;
}

/**
 * Formats ISO timestamp to readable format
 * Example: "2 hours ago", "Just now", "Mar 15, 2025"
 */
function formatTimestamp(timestamp) {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now - postDate) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
        return postDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    }
}

/**
 * Escapes HTML to prevent XSS attacks
 * Converts special characters to HTML entities
 */
function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ==========================================
// LIKE FUNCTIONALITY
// ==========================================

/**
 * Toggles like on a post for the current user
 * Adds or removes user ID from post's like array
 */
function toggleLike(postId) {
    const likes = getLikes();
    
    // Initialize likes array for post if it doesn't exist
    if (!likes[postId]) {
        likes[postId] = [];
    }
    
    const userIndex = likes[postId].indexOf(currentUserId);
    
    if (userIndex === -1) {
        // User hasn't liked yet - add like
        likes[postId].push(currentUserId);
    } else {
        // User has liked - remove like
        likes[postId].splice(userIndex, 1);
    }
    
    saveLikes(likes);
    renderFeed();
    updateCurrentUserProfile();
}

// ==========================================
// COMMENT FUNCTIONALITY
// ==========================================

/**
 * Opens the comment modal for a specific post
 * Loads and displays all existing comments
 */
function openCommentModal(postId) {
    currentPostId = postId;
    const modal = document.getElementById('commentModal');
    modal.classList.add('active');
    
    // Clear and load comments
    document.getElementById('commentInput').value = '';
    renderComments();
}

/**
 * Closes the comment modal
 */
function closeCommentModal() {
    const modal = document.getElementById('commentModal');
    modal.classList.remove('active');
    currentPostId = null;
}

/**
 * Adds a new comment to the current post
 */
function addComment() {
    const commentInput = document.getElementById('commentInput');
    const commentText = commentInput.value.trim();
    
    if (!commentText) {
        alert('Please write a comment!');
        return;
    }
    
    const comments = getComments();
    
    // Initialize comments array for post if it doesn't exist
    if (!comments[currentPostId]) {
        comments[currentPostId] = [];
    }
    
    // Create new comment object
    const newComment = {
        id: Date.now(),
        userId: currentUserId,
        text: commentText,
        timestamp: new Date().toISOString()
    };
    
    comments[currentPostId].push(newComment);
    saveComments(comments);
    
    // Clear input and refresh
    commentInput.value = '';
    renderComments();
    renderFeed();
    updateCurrentUserProfile();
}

/**
 * Renders all comments for the current post
 */
function renderComments() {
    const commentsList = document.getElementById('commentsList');
    const comments = getComments();
    const postComments = comments[currentPostId] || [];
    
    if (postComments.length === 0) {
        commentsList.innerHTML = '<p class="text-center" style="color: var(--text-secondary); padding: 20px;">No comments yet. Be the first to comment!</p>';
        return;
    }
    
    commentsList.innerHTML = '';
    
    // Render each comment
    postComments.forEach(comment => {
        const commentDiv = createCommentElement(comment);
        commentsList.appendChild(commentDiv);
    });
}

/**
 * Creates a comment element with edit/delete options
 */
function createCommentElement(comment) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment-item';
    commentDiv.id = `comment-${comment.id}`;
    
    const user = getUserById(comment.userId);
    const timestamp = formatTimestamp(comment.timestamp);
    
    // Check if comment belongs to current user
    const isOwnComment = comment.userId === currentUserId;
    
    commentDiv.innerHTML = `
        <div class="comment-header">
            <span class="comment-user">${user.name}</span>
            <span class="comment-time">${timestamp}</span>
        </div>
        <p class="comment-text">${escapeHTML(comment.text)}</p>
        ${isOwnComment ? `
            <div class="comment-actions">
                <button class="comment-action-btn" onclick="startEditComment(${comment.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="comment-action-btn delete" onclick="deleteComment(${comment.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        ` : ''}
    `;
    
    return commentDiv;
}

/**
 * Starts the edit mode for a comment
 * Replaces comment text with an input field
 */
function startEditComment(commentId) {
    const comments = getComments();
    const postComments = comments[currentPostId];
    const comment = postComments.find(c => c.id === commentId);
    
    const commentDiv = document.getElementById(`comment-${commentId}`);
    
    // Replace comment text with edit form
    commentDiv.innerHTML = `
        <div class="comment-header">
            <span class="comment-user">${getUserById(comment.userId).name}</span>
        </div>
        <div class="edit-comment-form">
            <textarea class="edit-comment-input" id="edit-${commentId}">${escapeHTML(comment.text)}</textarea>
            <div class="edit-actions">
                <button class="btn-save" onclick="saveEditComment(${commentId})">Save</button>
                <button class="btn-cancel" onclick="renderComments()">Cancel</button>
            </div>
        </div>
    `;
}

/**
 * Saves the edited comment
 */
function saveEditComment(commentId) {
    const newText = document.getElementById(`edit-${commentId}`).value.trim();
    
    if (!newText) {
        alert('Comment cannot be empty!');
        return;
    }
    
    const comments = getComments();
    const postComments = comments[currentPostId];
    const comment = postComments.find(c => c.id === commentId);
    
    comment.text = newText;
    saveComments(comments);
    renderComments();
}

/**
 * Deletes a comment after confirmation
 */
function deleteComment(commentId) {
    if (!confirm('Are you sure you want to delete this comment?')) {
        return;
    }
    
    const comments = getComments();
    const postComments = comments[currentPostId];
    const index = postComments.findIndex(c => c.id === commentId);
    
    if (index !== -1) {
        postComments.splice(index, 1);
        saveComments(comments);
        renderComments();
        renderFeed();
        updateCurrentUserProfile();
    }
}

// ==========================================
// SHARE FUNCTIONALITY
// ==========================================

/**
 * Shares a post to the current user's feed
 * Creates a new post that references the original
 */
function sharePost(originalPostId) {
    const posts = getPosts();
    const originalPost = posts.find(p => p.id === originalPostId);
    
    if (!originalPost) {
        alert('Post not found!');
        return;
    }
    
    // Prevent sharing own posts
    if (originalPost.userId === currentUserId) {
        alert('You cannot share your own post!');
        return;
    }
    
    // Check if already shared
    const alreadyShared = posts.some(
        p => p.userId === currentUserId && 
        p.isShared && 
        p.originalPostId === originalPostId
    );
    
    if (alreadyShared) {
        alert('You have already shared this post!');
        return;
    }
    
    // Create shared post
    const sharedPost = {
        id: Date.now(),
        userId: currentUserId,
        content: originalPost.content,
        image: originalPost.image,
        timestamp: new Date().toISOString(),
        isShared: true,
        originalPostId: originalPostId,
        originalUserId: originalPost.userId
    };
    
    posts.unshift(sharedPost);
    savePosts(posts);
    renderFeed();
    updateCurrentUserProfile();
    
    alert('Post shared successfully!');
}

// ==========================================
// USER SEARCH FUNCTIONALITY
// ==========================================

/**
 * Handles user search input
 * Filters users and displays matching results
 */
function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const query = searchInput.value.trim().toLowerCase();
    
    // Hide results if search is empty
    if (!query) {
        searchResults.classList.remove('active');
        return;
    }
    
    // Filter users based on search query
    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(query) ||
        user.bio.toLowerCase().includes(query)
    );
    
    // Display results
    if (filteredUsers.length === 0) {
        searchResults.innerHTML = '<div class="no-results">No users found</div>';
    } else {
        searchResults.innerHTML = '';
        filteredUsers.forEach(user => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.onclick = () => {
                showUserProfile(user.id);
                searchInput.value = '';
                searchResults.classList.remove('active');
            };
            
            resultItem.innerHTML = `
                <img src="${user.profilePic}" alt="${user.name}" class="search-result-pic">
                <div class="search-result-info">
                    <h4>${user.name}</h4>
                    <p>${user.bio}</p>
                </div>
            `;
            
            searchResults.appendChild(resultItem);
        });
    }
    
    searchResults.classList.add('active');
}

// ==========================================
// USER PROFILE MODAL
// ==========================================

/**
 * Opens user profile modal with their posts and statistics
 */
function showUserProfile(userId) {
    const user = getUserById(userId);
    const modal = document.getElementById('userProfileModal');
    
    // Set user information
    document.getElementById('modalUserPic').src = user.profilePic;
    document.getElementById('modalUserName').textContent = user.name;
    document.getElementById('modalUserBio').textContent = user.bio;
    
    // Calculate and display statistics
    const posts = getPosts();
    const likes = getLikes();
    const comments = getComments();
    
    const userPosts = posts.filter(post => post.userId === userId);
    
    let totalLikes = 0;
    let totalComments = 0;
    
    userPosts.forEach(post => {
        if (likes[post.id]) {
            totalLikes += likes[post.id].length;
        }
        if (comments[post.id]) {
            totalComments += comments[post.id].length;
        }
    });
    
    document.getElementById('modalUserPosts').textContent = userPosts.length;
    document.getElementById('modalUserLikes').textContent = totalLikes;
    document.getElementById('modalUserComments').textContent = totalComments;
    
    // Display user's posts
    const modalPostsContainer = document.querySelector('.modal-posts-container');
    
    if (userPosts.length === 0) {
        modalPostsContainer.innerHTML = '<p class="text-center" style="color: var(--text-secondary); padding: 20px;">No posts yet</p>';
    } else {
        modalPostsContainer.innerHTML = '';
        userPosts.forEach(post => {
            const postCard = createPostCard(post);
            modalPostsContainer.appendChild(postCard);
        });
    }
    
    modal.classList.add('active');
}

/**
 * Closes user profile modal
 */
function closeUserProfileModal() {
    const modal = document.getElementById('userProfileModal');
    modal.classList.remove('active');
}

// ==========================================
// EVENT LISTENERS SETUP
// ==========================================

/**
 * Sets up all event listeners for the application
 */
function setupEventListeners() {
    // User selector change
    document.getElementById('currentUser').addEventListener('change', function(e) {
        currentUserId = parseInt(e.target.value);
        updateCurrentUserProfile();
        renderFeed();
        renderAllUsers();
    });
    
    // Create post button
    document.getElementById('createPostBtn').addEventListener('click', createPost);
    
    // Post textarea character count
    document.getElementById('postContent').addEventListener('input', updateCharCount);
    
    // Image upload
    document.getElementById('imageUpload').addEventListener('change', handleImageUpload);
    
    // Search input
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    
    // Close search results when clicking outside
    document.addEventListener('click', function(e) {
        const searchContainer = document.querySelector('.search-container');
        if (!searchContainer.contains(e.target)) {
            document.getElementById('searchResults').classList.remove('active');
        }
    });
    
    // Add comment button
    document.getElementById('addCommentBtn').addEventListener('click', addComment);
    
    // Close modals when clicking on close button or outside
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
        });
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
    
    // Enter key to post
    document.getElementById('postContent').addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            createPost();
        }
    });
    
    // Enter key to comment
    document.getElementById('commentInput').addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            addComment();
        }
    });
}

// ==========================================
// INITIALIZE APPLICATION
// ==========================================

// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', init);

