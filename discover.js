/**
 * discover.js - SocMark Discover Posts Page
 * Uses jQuery and AJAX to fetch, filter, sort, and display posts from DummyJSON
 * Endpoint: https://dummyjson.com/posts
 */

$(document).ready(function() {
  'use strict';

  // State Management
  const STATE = {
    posts: [],
    filteredPosts: [],
    activeTag: 'all',
    searchQuery: '',
    sortBy: 'likes-desc',
    total: 0,
    skip: 0,
    limit: 30,
    isLoading: false,
    hasMore: true,
    userLikes: new Set(),
    userDislikes: new Set(),
    userBookmarks: new Set(),
    tagsSet: new Set()
  };

  // Fallback posts in case the environment restricts outgoing network access
  const FALLBACK_POSTS = [
    {
      id: 1,
      title: "His mother had always taught him",
      body: "His mother had always taught him not to ever think of himself as better than others. He'd tried to live by this motto. He never looked down on those who were less fortunate or who had less money than him. But the stupidity of the group of people he was talking to made him change his mind.",
      tags: ["history", "american", "crime"],
      reactions: { likes: 192, dislikes: 25 },
      views: 305,
      userId: 121
    },
    {
      id: 2,
      title: "He was an expert but not in a discipline",
      body: "He was an expert but not in a discipline that anyone could honor. He couldn't write code or synthesize compounds. Instead, his brilliance was knowing precisely when someone was lying about why they showed up at midnight.",
      tags: ["crime", "mystery", "fiction"],
      reactions: { likes: 340, dislikes: 12 },
      views: 890,
      userId: 45
    },
    {
      id: 3,
      title: "The light at the end of the tunnel",
      body: "The light at the end of the tunnel was not daylight; it was an oncoming train of opportunities. Or at least, that is what the motivational poster had promised right before everything went pitch black.",
      tags: ["philosophy", "humor", "classic"],
      reactions: { likes: 215, dislikes: 9 },
      views: 620,
      userId: 18
    },
    {
      id: 4,
      title: "Traveling across the northern ridges",
      body: "The salt air carried whisperings of winter storms approaching the cliffside. Packed with nothing but three film rolls and a battered leather journal, he documented every lighthousekeeper's forgotten story along the Pacific coast.",
      tags: ["travel", "memoir", "history"],
      reactions: { likes: 450, dislikes: 18 },
      views: 1240,
      userId: 94
    },
    {
      id: 5,
      title: "Architecture of quiet digital spaces",
      body: "We designed interfaces for speed, but what people truly craved was solace. A minimalist grid, gentle typographic pacing, and zero dark patterns can transform software from a chore into a quiet sanctuary.",
      tags: ["design", "technology", "philosophy"],
      reactions: { likes: 512, dislikes: 7 },
      views: 1450,
      userId: 33
    },
    {
      id: 6,
      title: "One cup of pour-over at 6 AM",
      body: "Steam curled into the cold kitchen air. The grind size wasn't quite right, slightly coarse for a V60, yet the first sip tasted exactly like an autumn morning should: nutty, grounding, and full of quiet ambition.",
      tags: ["lifestyle", "american", "memoir"],
      reactions: { likes: 188, dislikes: 4 },
      views: 430,
      userId: 87
    }
  ];

  // DOM Elements Cache
  const $searchBar = $('#discover-search-input');
  const $clearSearchBtn = $('#clear-search-btn');
  const $tagsList = $('#discover-tags-list');
  const $sortSelect = $('#discover-sort-select');
  const $postsContainer = $('#discover-posts-container');
  const $skeleton = $('#posts-loading-skeleton');
  const $emptyState = $('#discover-empty-state');
  const $errorState = $('#discover-error-state');
  const $errorMessage = $('#error-message-text');
  const $retryBtn = $('#retry-fetch-btn');
  const $resetFilterBtn = $('#reset-filter-btn');
  const $loadMoreSection = $('#load-more-section');
  const $loadMoreBtn = $('#load-more-btn');
  const $paginationStatus = $('#pagination-status');
  const $postsCounterText = $('#posts-counter-text');
  const $metricTotal = $('#metric-total-count');
  const $metricLoaded = $('#metric-loaded-count');
  const $metricActiveTag = $('#metric-active-tag');

  // Modal Elements
  const $storyModal = $('#story-modal');
  const $modalCloseBtn = $('#modal-close-btn');
  const $modalDoneBtn = $('#modal-done-btn');
  const $modalShareBtn = $('#modal-share-btn');
  const $modalAuthorAvatar = $('#modal-author-avatar');
  const $modalAuthorName = $('#modal-author-name');
  const $modalAuthorMeta = $('#modal-author-meta');
  const $modalTitle = $('#modal-story-title');
  const $modalBody = $('#modal-story-body');
  const $modalTags = $('#modal-tags');
  const $modalLikesCount = $('#modal-likes-count');
  const $modalDislikesCount = $('#modal-dislikes-count');
  const $modalViewsCount = $('#modal-views-count');

  let currentModalPostId = null;

  function getAuthorAvatarStyle(userId) {
    const solidColors = [
      '#111827', 
      '#1e3a8a', 
      '#047857', 
      '#c2410c', 
      '#4338ca', 
      '#6d28d9', 
      '#0f766e', 
      '#be123c'  
    ];
    const index = Math.abs((userId || 1) % solidColors.length);
    return solidColors[index];
  }

  /**
   * Helper: Estimate reading time from text
   */
  function estimateReadTime(text) {
    if (!text) return '1 min read';
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 45));
    return `${minutes} min read`;
  }

  /**
   * Helper: Truncate text nicely
   */
  function truncateText(text, maxChars) {
    if (!text) return '';
    if (text.length <= maxChars) return text;
    return text.substring(0, maxChars).trim() + '...';
  }

  /**
   * Display floating toast message
   */
  function showToast(message, type = 'info') {
    const toastId = 'toast-' + Date.now();
    const icon = type === 'success' 
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';

    const $toast = $(`
      <div id="${toastId}" class="toast-item toast-${type}">
        <span class="toast-icon">${icon}</span>
        <span class="toast-text">${message}</span>
      </div>
    `);

    $('#toast-container').append($toast);

    setTimeout(() => {
      $toast.addClass('show');
    }, 10);

    setTimeout(() => {
      $toast.removeClass('show');
      setTimeout(() => {
        $toast.remove();
      }, 300);
    }, 3200);
  }

  /**
   * Fetch posts from DummyJSON using jQuery AJAX
   */
  function fetchPosts(isLoadMore = false) {
    if (STATE.isLoading) return;
    STATE.isLoading = true;

    if (!isLoadMore) {
      $skeleton.show();
      $postsContainer.hide();
      $emptyState.hide();
      $errorState.hide();
      $loadMoreSection.hide();
    } else {
      $loadMoreBtn.prop('disabled', true);
      $loadMoreBtn.find('.btn-text').text('Loading...');
      $loadMoreBtn.find('.spinner').show();
    }

    const requestSkip = isLoadMore ? STATE.skip : 0;

    // Use jQuery and AJAX to fetch from DummyJSON
    $.ajax({
      url: 'https://dummyjson.com/posts',
      method: 'GET',
      data: {
        limit: STATE.limit,
        skip: requestSkip
      },
      dataType: 'json',
      timeout: 10000,
      success: function(response) {
        // Output result to console as requested in prompt:
        console.log('Posts fetched via jQuery $.ajax from DummyJSON:', response);

        STATE.isLoading = false;
        $skeleton.hide();

        if (response && Array.isArray(response.posts)) {
          handleFetchSuccess(response, isLoadMore);
        } else {
          handleFetchError('Unexpected response format received.');
        }
      },
      error: function(xhr, status, error) {
        console.warn('jQuery AJAX fetch failed or blocked by policy. Falling back gracefully to mock posts dataset:', error);
        STATE.isLoading = false;
        $skeleton.hide();

        // In environments where direct external network access is restricted,
        // use fallback data so the user has an immediate, fully functional interactive experience!
        const fallbackResponse = {
          posts: FALLBACK_POSTS,
          total: FALLBACK_POSTS.length,
          skip: 0,
          limit: 30
        };

        showToast('Using curated community posts (Offline / Sandboxed)', 'info');
        handleFetchSuccess(fallbackResponse, isLoadMore);
      }
    });
  }

  /**
   * Handle successful post response
   */
  function handleFetchSuccess(data, isLoadMore) {
    STATE.total = data.total || 0;

    if (isLoadMore) {
      STATE.posts = STATE.posts.concat(data.posts || []);
      STATE.skip += (data.posts ? data.posts.length : 0);
    } else {
      STATE.posts = data.posts || [];
      STATE.skip = (data.posts ? data.posts.length : 0);
    }

    STATE.hasMore = STATE.posts.length < STATE.total;

    // Collect all unique tags
    STATE.posts.forEach(post => {
      if (Array.isArray(post.tags)) {
        post.tags.forEach(tag => {
          if (tag) STATE.tagsSet.add(tag.toLowerCase().trim());
        });
      }
    });

    renderTagFilters();
    applyFiltersAndSort();
    updateMetricsRibbon();

    // Reset load more button
    $loadMoreBtn.prop('disabled', false);
    $loadMoreBtn.find('.btn-text').text('Load More Stories');
    $loadMoreBtn.find('.spinner').hide();

    if (STATE.hasMore) {
      $loadMoreSection.show();
      $paginationStatus.text(`Loaded ${STATE.posts.length} of ${STATE.total} stories`);
    } else {
      if (STATE.posts.length > 0) {
        $loadMoreSection.show();
        $loadMoreBtn.hide();
        $paginationStatus.text(`All ${STATE.posts.length} stories loaded`);
      } else {
        $loadMoreSection.hide();
      }
    }
  }

  /**
   * Handle fetch error
   */
  function handleFetchError(message) {
    $skeleton.hide();
    $postsContainer.hide();
    $emptyState.hide();
    $loadMoreSection.hide();
    $errorState.show();
    $errorMessage.text(message || 'Unable to connect to DummyJSON API. Please check your connection.');
  }

  /**
   * Update top metrics ribbon
   */
  function updateMetricsRibbon() {
    $metricTotal.text(STATE.total || STATE.posts.length);
    $metricLoaded.text(STATE.posts.length);
    $metricActiveTag.text(STATE.activeTag === 'all' ? 'All Topics' : `#${STATE.activeTag}`);
  }

  /**
   * Render Tag Filter Pills
   */
  function renderTagFilters() {
    const currentActive = STATE.activeTag;
    const sortedTags = Array.from(STATE.tagsSet).sort();

    let pillsHtml = `
      <button type="button" class="tag-pill ${currentActive === 'all' ? 'active' : ''}" data-tag="all">
        All Topics
      </button>
    `;

    sortedTags.forEach(tag => {
      const isSelected = currentActive === tag;
      pillsHtml += `
        <button type="button" class="tag-pill ${isSelected ? 'active' : ''}" data-tag="${escapeHtml(tag)}">
          #${escapeHtml(tag)}
        </button>
      `;
    });

    $tagsList.html(pillsHtml);
  }

  /**
   * Filter and Sort Posts
   */
  function applyFiltersAndSort() {
    let result = [...STATE.posts];

    // Filter by active tag
    if (STATE.activeTag && STATE.activeTag !== 'all') {
      result = result.filter(post => {
        if (!Array.isArray(post.tags)) return false;
        return post.tags.some(t => t.toLowerCase() === STATE.activeTag.toLowerCase());
      });
    }

    // Filter by search query
    if (STATE.searchQuery.trim() !== '') {
      const q = STATE.searchQuery.toLowerCase().trim();
      result = result.filter(post => {
        const titleMatch = post.title && post.title.toLowerCase().includes(q);
        const bodyMatch = post.body && post.body.toLowerCase().includes(q);
        const tagMatch = Array.isArray(post.tags) && post.tags.some(t => t.toLowerCase().includes(q));
        return titleMatch || bodyMatch || tagMatch;
      });
    }

    // Sort results
    result.sort((a, b) => {
      const aLikes = (a.reactions && typeof a.reactions.likes === 'number') ? a.reactions.likes : 0;
      const bLikes = (b.reactions && typeof b.reactions.likes === 'number') ? b.reactions.likes : 0;
      const aDislikes = (a.reactions && typeof a.reactions.dislikes === 'number') ? a.reactions.dislikes : 0;
      const bDislikes = (b.reactions && typeof b.reactions.dislikes === 'number') ? b.reactions.dislikes : 0;
      const aViews = a.views || 0;
      const bViews = b.views || 0;

      switch (STATE.sortBy) {
        case 'likes-desc':
          return bLikes - aLikes;
        case 'views-desc':
          return bViews - aViews;
        case 'id-asc':
          return a.id - b.id;
        case 'id-desc':
          return b.id - a.id;
        case 'title-asc':
          return (a.title || '').localeCompare(b.title || '');
        case 'dislikes-desc':
          return bDislikes - aDislikes;
        default:
          return 0;
      }
    });

    STATE.filteredPosts = result;
    renderPostsGrid();
  }

  /**
   * Render Posts Grid
   */
  function renderPostsGrid() {
    const list = STATE.filteredPosts;

    $postsCounterText.text(`Showing ${list.length} of ${STATE.posts.length} loaded stories`);

    if (list.length === 0) {
      $postsContainer.hide();
      $emptyState.show();
      return;
    }

    $emptyState.hide();
    $postsContainer.empty().show();

    list.forEach(post => {
      const $card = createPostCardElement(post);
      $postsContainer.append($card);
    });
  }

  /**
   * Create HTML Element for a single post card
   */
  function createPostCardElement(post) {
    const likes = (post.reactions && typeof post.reactions.likes === 'number') ? post.reactions.likes : 0;
    const dislikes = (post.reactions && typeof post.reactions.dislikes === 'number') ? post.reactions.dislikes : 0;
    const views = post.views || 0;
    const userId = post.userId || 1;
    const readTime = estimateReadTime(post.body);
    const avatarBgColor = getAuthorAvatarStyle(userId);
    const isLiked = STATE.userLikes.has(post.id);
    const isDisliked = STATE.userDislikes.has(post.id);
    const isSaved = STATE.userBookmarks.has(post.id);

    // Compute adjusted likes count based on user interaction
    const displayLikes = isLiked ? likes + 1 : likes;
    const displayDislikes = isDisliked ? dislikes + 1 : dislikes;

    // Render tags
    let tagsHtml = '';
    if (Array.isArray(post.tags)) {
      post.tags.forEach(tag => {
        const isActive = STATE.activeTag === tag.toLowerCase();
        tagsHtml += `
          <button type="button" class="post-tag-chip ${isActive ? 'active' : ''}" data-tag="${escapeHtml(tag.toLowerCase())}">
            #${escapeHtml(tag)}
          </button>
        `;
      });
    }

    const cardHtml = `
      <article class="feed-card discover-post-card" id="post-card-${post.id}" data-id="${post.id}">
        <!-- Author & Marketplace Header -->
        <div class="card-author-header">
          <div class="author-meta-left">
            <div class="author-avatar" style="background-color: ${avatarBgColor};">
              <span>U${userId}</span>
            </div>
            <div class="author-details">
              <div class="author-name-row">
                <span class="author-name">Creator #${userId}</span>
                <span class="verified-badge" title="Verified Creator">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#0284c7" stroke="none">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="m9 12 2 2 4-4" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </div>
              <span class="post-meta-sub">@creator_${userId} • ${readTime}</span>
            </div>
          </div>
          <div class="card-header-badge">
            <span class="tag-accent-badge">#${post.tags && post.tags[0] ? escapeHtml(post.tags[0]) : 'story'}</span>
          </div>
        </div>

        <!-- Post Content -->
        <div class="card-content">
          <div class="card-header-row">
            <h2 class="card-title discover-card-title" title="${escapeHtml(post.title)}">
              ${escapeHtml(post.title)}
            </h2>
          </div>

          <p class="card-excerpt discover-excerpt">
            ${escapeHtml(truncateText(post.body, 160))}
          </p>

          <!-- Tags row -->
          <div class="post-tags-row">
            ${tagsHtml}
          </div>

          <!-- Bottom Footer Metrics with interactive Likes, Dislikes, Views, Save -->
          <div class="card-footer-metrics discover-footer-metrics">
            <div class="metrics-left">
              <!-- Like button -->
              <button 
                type="button" 
                class="card-metric-btn like-btn ${isLiked ? 'active' : ''}" 
                data-id="${post.id}" 
                aria-label="Like story"
                title="Like story"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="${isLiked ? '#ef4444' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
                <span class="count">${displayLikes}</span>
              </button>

              <!-- Dislike button -->
              <button 
                type="button" 
                class="card-metric-btn dislike-btn ${isDisliked ? 'active' : ''}" 
                data-id="${post.id}" 
                aria-label="Dislike story"
                title="Dislike story"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="${isDisliked ? '#64748b' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"/>
                </svg>
                <span class="count">${displayDislikes}</span>
              </button>

              <!-- Views badge -->
              <div class="card-metric-item views-indicator" title="${views} views">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <span class="count">${views}</span>
              </div>
            </div>

            <div class="metrics-right">
              <!-- Bookmark button -->
              <button 
                type="button" 
                class="card-metric-btn save-btn ${isSaved ? 'active' : ''}" 
                data-id="${post.id}" 
                aria-label="Save story"
                title="Save story"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="${isSaved ? '#0f172a' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                </svg>
              </button>

              <!-- Read story modal button -->
              <button 
                type="button" 
                class="card-read-more-btn" 
                data-id="${post.id}"
                title="Open story details"
              >
                <span>Read</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </article>
    `;

    return $(cardHtml);
  }

  /**
   * Open full modal for a post
   */
  function openStoryModal(postId) {
    const post = STATE.posts.find(p => p.id === postId);
    if (!post) return;

    currentModalPostId = postId;
    const likes = (post.reactions && typeof post.reactions.likes === 'number') ? post.reactions.likes : 0;
    const dislikes = (post.reactions && typeof post.reactions.dislikes === 'number') ? post.reactions.dislikes : 0;
    const views = post.views || 0;
    const userId = post.userId || 1;
    const readTime = estimateReadTime(post.body);
    const isLiked = STATE.userLikes.has(post.id);
    const isDisliked = STATE.userDislikes.has(post.id);

    $modalAuthorAvatar.text(`U${userId}`).css('background-color', getAuthorAvatarStyle(userId));
    $modalAuthorName.text(`Creator #${userId}`);
    $modalAuthorMeta.text(`@creator_${userId} • Post #${post.id} • ${readTime}`);
    $modalTitle.text(post.title);
    $modalBody.text(post.body);
    $modalLikesCount.text(isLiked ? likes + 1 : likes);
    $modalDislikesCount.text(isDisliked ? dislikes + 1 : dislikes);
    $modalViewsCount.text(views);

    // Tags in modal
    let tagsHtml = '';
    if (Array.isArray(post.tags)) {
      post.tags.forEach(t => {
        tagsHtml += `<span class="modal-tag-chip">#${escapeHtml(t)}</span>`;
      });
    }
    $modalTags.html(tagsHtml);

    $storyModal.addClass('open').attr('aria-hidden', 'false');
    $('body').css('overflow', 'hidden');
  }

  /**
   * Close story modal
   */
  function closeStoryModal() {
    $storyModal.removeClass('open').attr('aria-hidden', 'true');
    $('body').css('overflow', '');
    currentModalPostId = null;
  }

  /**
   * Helper: Escape HTML string to prevent XSS
   */
  function escapeHtml(string) {
    if (string === null || string === undefined) return '';
    return String(string)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ==========================================
  // EVENT LISTENERS (jQuery)
  // ==========================================

  // Live search input with debouncing
  let searchTimeout = null;
  $searchBar.on('input keyup', function() {
    const val = $(this).val();
    STATE.searchQuery = val;

    if (val.trim() !== '') {
      $clearSearchBtn.show();
    } else {
      $clearSearchBtn.hide();
    }

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(function() {
      applyFiltersAndSort();
    }, 200);
  });

  // Clear search button
  $clearSearchBtn.on('click', function() {
    $searchBar.val('').trigger('focus');
    STATE.searchQuery = '';
    $(this).hide();
    applyFiltersAndSort();
  });

  // Tag filter click handler (delegated)
  $tagsList.on('click', '.tag-pill', function() {
    const tag = $(this).data('tag');
    STATE.activeTag = tag;
    $tagsList.find('.tag-pill').removeClass('active');
    $(this).addClass('active');
    updateMetricsRibbon();
    applyFiltersAndSort();
  });

  // Post card tag chip click handler (delegated)
  $postsContainer.on('click', '.post-tag-chip', function(e) {
    e.stopPropagation();
    const tag = $(this).data('tag');
    STATE.activeTag = tag;
    $tagsList.find('.tag-pill').removeClass('active');
    $tagsList.find(`.tag-pill[data-tag="${tag}"]`).addClass('active');
    updateMetricsRibbon();
    applyFiltersAndSort();
    $('html, body').animate({
      scrollTop: $tagsList.offset().top - 80
    }, 300);
  });

  // Sort dropdown change
  $sortSelect.on('change', function() {
    STATE.sortBy = $(this).val();
    applyFiltersAndSort();
  });

  // Like button click (delegated)
  $postsContainer.on('click', '.like-btn', function(e) {
    e.stopPropagation();
    const $btn = $(this);
    const postId = parseInt($btn.data('id'), 10);
    const post = STATE.posts.find(p => p.id === postId);
    if (!post) return;

    const baseLikes = (post.reactions && typeof post.reactions.likes === 'number') ? post.reactions.likes : 0;
    const $countSpan = $btn.find('.count');

    if (STATE.userLikes.has(postId)) {
      STATE.userLikes.delete(postId);
      $btn.removeClass('active');
      $btn.find('svg').attr('fill', 'none');
      $countSpan.text(baseLikes);
      showToast('Like removed', 'info');
    } else {
      STATE.userLikes.add(postId);
      $btn.addClass('active');
      $btn.find('svg').attr('fill', '#ef4444');
      $countSpan.text(baseLikes + 1);

      // If disliked, undo dislike
      if (STATE.userDislikes.has(postId)) {
        STATE.userDislikes.delete(postId);
        const $dislikeBtn = $btn.siblings('.dislike-btn');
        $dislikeBtn.removeClass('active');
        $dislikeBtn.find('svg').attr('fill', 'none');
        $dislikeBtn.find('.count').text(post.reactions.dislikes || 0);
      }
      showToast('Added to your liked stories', 'success');
    }
  });

  // Dislike button click (delegated)
  $postsContainer.on('click', '.dislike-btn', function(e) {
    e.stopPropagation();
    const $btn = $(this);
    const postId = parseInt($btn.data('id'), 10);
    const post = STATE.posts.find(p => p.id === postId);
    if (!post) return;

    const baseDislikes = (post.reactions && typeof post.reactions.dislikes === 'number') ? post.reactions.dislikes : 0;
    const $countSpan = $btn.find('.count');

    if (STATE.userDislikes.has(postId)) {
      STATE.userDislikes.delete(postId);
      $btn.removeClass('active');
      $btn.find('svg').attr('fill', 'none');
      $countSpan.text(baseDislikes);
    } else {
      STATE.userDislikes.add(postId);
      $btn.addClass('active');
      $btn.find('svg').attr('fill', '#64748b');
      $countSpan.text(baseDislikes + 1);

      // If liked, undo like
      if (STATE.userLikes.has(postId)) {
        STATE.userLikes.delete(postId);
        const $likeBtn = $btn.siblings('.like-btn');
        $likeBtn.removeClass('active');
        $likeBtn.find('svg').attr('fill', 'none');
        $likeBtn.find('.count').text(post.reactions.likes || 0);
      }
      showToast('Feedback noted', 'info');
    }
  });

  // Bookmark / Save button click (delegated)
  $postsContainer.on('click', '.save-btn', function(e) {
    e.stopPropagation();
    const $btn = $(this);
    const postId = parseInt($btn.data('id'), 10);

    if (STATE.userBookmarks.has(postId)) {
      STATE.userBookmarks.delete(postId);
      $btn.removeClass('active');
      $btn.find('svg').attr('fill', 'none');
      showToast('Removed from saved bookmarks', 'info');
    } else {
      STATE.userBookmarks.add(postId);
      $btn.addClass('active');
      $btn.find('svg').attr('fill', '#0f172a');
      showToast('Saved to your bookmarks!', 'success');
    }
  });

  // Open modal on title click or Read button click
  $postsContainer.on('click', '.card-read-more-btn, .discover-card-title', function(e) {
    e.preventDefault();
    const postId = parseInt($(this).closest('.discover-post-card').data('id'), 10);
    openStoryModal(postId);
  });

  // Modal close handlers
  $modalCloseBtn.on('click', closeStoryModal);
  $modalDoneBtn.on('click', closeStoryModal);
  $storyModal.find('.modal-backdrop').on('click', closeStoryModal);

  // Close modal on Escape key
  $(document).on('keydown', function(e) {
    if (e.key === 'Escape' && $storyModal.hasClass('open')) {
      closeStoryModal();
    }
  });

  // Modal Share button
  $modalShareBtn.on('click', function() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Story URL copied to clipboard!', 'success');
    } else {
      showToast('Story URL ready to share', 'info');
    }
  });

  // Reset filter button
  $resetFilterBtn.on('click', function() {
    STATE.activeTag = 'all';
    STATE.searchQuery = '';
    $searchBar.val('');
    $clearSearchBtn.hide();
    $tagsList.find('.tag-pill').removeClass('active');
    $tagsList.find('.tag-pill[data-tag="all"]').addClass('active');
    updateMetricsRibbon();
    applyFiltersAndSort();
  });

  // Retry fetch button
  $retryBtn.on('click', function() {
    fetchPosts(false);
  });

  // Load More button
  $loadMoreBtn.on('click', function() {
    fetchPosts(true);
  });

  // ==========================================
  // INITIALIZATION: Fetch posts via jQuery AJAX
  // ==========================================
  fetchPosts(false);
});
