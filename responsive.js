/**
 * Enhanced Responsive Scaling Handler
 * Maintains consistent element sizes during browser scaling
 */
const responsiveHandler = {
    // Original design dimensions
    designWidth: 1600,
    designHeight: 900,
    
    // Reference scale based on initial load
    baseScale: 1,
    
    // Initialize on page load
    init: function() {
        const wrapper = document.querySelector('.main-wrapper');
        
        // Store initial browser zoom level
        this.baseScale = 1;
        
        // Apply initial scaling
        this.adjustScale();
        
        // Set up event listeners
        window.addEventListener('resize', this.adjustScale.bind(this));
        
        // Detect zoom changes with polling (no direct browser zoom event available)
        this.setupZoomDetection();
        
        console.log("Responsive handler initialized");
    },
    
    // Adjust scale based on current viewport and zoom level
    adjustScale: function() {
        const wrapper = document.querySelector('.main-wrapper');
        
        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Calculate scale factors (accounting for browser zoom)
        const scaleX = viewportWidth / this.designWidth;
        const scaleY = viewportHeight / this.designHeight;
        
        // Use the smaller scale to ensure everything fits
        const scale = Math.min(scaleX, scaleY) * 0.95; // 95% to add small margin
        
        // Apply the transform scale to maintain proportions
        wrapper.style.transform = `scale(${scale})`;
        
        // Adjust the wrapper size and positioning to account for scaling
        wrapper.style.transformOrigin = 'center center';
        wrapper.style.height = `${this.designHeight}px`;
        wrapper.style.width = `${this.designWidth}px`;
        wrapper.style.maxWidth = 'none';
        
        // Ensure the wrapper is in the center of the viewport
        wrapper.style.position = 'absolute';
        wrapper.style.top = '50%';
        wrapper.style.left = '50%';
        wrapper.style.marginLeft = `-${this.designWidth / 2}px`;
        wrapper.style.marginTop = `-${this.designHeight / 2}px`;
        
        // Force container position consistency (make sure gap with title is preserved)
        const container = document.querySelector('.container');
        if (container) {
            container.style.position = 'absolute';
            container.style.top = '250px'; // Changed from 200px to move container much lower
        }
        
        // Store scale in data attribute for use by modals
        wrapper.dataset.currentScale = scale;
        
        // Scale modals to match game scale
        this.adjustModalScale(scale);
        
        // Adjust body height to account for scaled content
        document.body.style.height = '100vh';
        document.body.style.overflow = 'hidden';
        
        console.log(`Viewport: ${viewportWidth}x${viewportHeight}, Applied Scale: ${scale}`);
    },
    
    // Scale modals to match the game scale
    adjustModalScale: function(scale) {
        // Handle video modal (now inside main-wrapper)
        const videoModal = document.querySelector('.video-modal');
        const videoModalContent = document.querySelector('.video-modal-content');
        
        if (videoModal && videoModalContent) {
            // Store scale for later use
            videoModal.dataset.gameScale = scale;
            
            // Only adjust if modal is visible
            if (videoModal.style.display === 'block') {
                // Determine screen size
                const isSmallScreen = window.innerWidth < 768;
                const isMobileScreen = window.innerWidth < 480;
                const isTinyScreen = window.innerWidth < 350;
                const isLandscape = window.innerWidth > window.innerHeight;
                
                // Set appropriate styles based on screen size
                if (isSmallScreen) {
                    if (isTinyScreen) {
                        // Tiny screens (small phones) - maximize available space
                        videoModalContent.style.width = '100%';
                        videoModalContent.style.maxHeight = '100vh';
                        videoModalContent.style.padding = '0'; // No padding for maximum video space
                    } else if (isMobileScreen) {
                        // Mobile phones - fully maximize width
                        videoModalContent.style.width = '100%';
                        videoModalContent.style.maxHeight = '100vh'; // Full height
                        videoModalContent.style.padding = '0'; // No padding
                    } else {
                        // Tablets - also use full width
                        videoModalContent.style.width = '100%';
                        videoModalContent.style.maxHeight = '100vh';
                        videoModalContent.style.padding = '2px'; // Minimal padding
                    }
                    
                    // Ensure content is centered
                    videoModalContent.style.top = '50%';
                    videoModalContent.style.left = '50%';
                    videoModalContent.style.transform = 'translate(-50%, -50%)';
                    
                    // Remove any margins
                    videoModalContent.style.margin = '0';
                } else {
                    // For larger screens, maximize space using full width
                    videoModalContent.style.width = '100%'; // Changed from 98% to 100%
                    videoModalContent.style.maxWidth = '1800px'; // Increased from 1600px
                    videoModalContent.style.maxHeight = '100vh'; // Use full viewport height
                    
                    // Center the modal
                    videoModalContent.style.top = '50%';
                    videoModalContent.style.left = '50%';
                    videoModalContent.style.transform = 'translate(-50%, -50%)';
                }
                
                // Always ensure scrollbars are hidden
                videoModalContent.style.overflow = 'hidden';
                videoModalContent.style.overflowY = 'hidden';
                
                // Fix video container to maintain proper aspect ratio
                const videoContainer = document.querySelector('.video-container');
                if (videoContainer) {
                    // Remove fixed aspect ratio to prevent cropping
                    videoContainer.style.paddingBottom = '0';
                    videoContainer.style.height = 'auto';
                    videoContainer.style.width = '100%';
                    // Minimal vertical space usage
                    videoContainer.style.margin = '0';
                    videoContainer.style.backgroundColor = 'black'; // Add black background for letterboxing
                    // Adjust minimum heights based on orientation
                    videoContainer.style.minHeight = isLandscape ? 
                                                   (isTinyScreen ? '200px' : '250px') : 
                                                   (isTinyScreen ? '220px' : 
                                                   (isMobileScreen ? '250px' : '350px'));
                    videoContainer.style.overflow = 'hidden'; // Prevent overflow without cropping
                }
                
                // Adjust video element to maintain proper aspect ratio
                const videoElement = document.getElementById('sectorVideo');
                if (videoElement) {
                    videoElement.style.position = 'relative';
                    videoElement.style.width = '100%';
                    videoElement.style.height = 'auto'; // Changed from 100% to auto for proper aspect ratio
                    videoElement.style.maxWidth = '100%'; 
                    videoElement.style.maxHeight = isLandscape ? '70vh' : '75vh'; // Limit height to prevent overflow
                    videoElement.style.objectFit = 'contain'; // Changed from fill to contain for proper aspect ratio
                    videoElement.style.backgroundColor = 'black'; // Fill letterbox areas with black
                    
                    // Additional styles for better fit
                    videoElement.style.display = 'block';
                    videoElement.style.margin = '0 auto'; // Center horizontally
                    videoElement.setAttribute('playsinline', ''); // Ensure inline playing on iOS
                }
                
                // Also adjust the title to take less space
                const videoTitle = document.getElementById('videoModalTitle');
                if (videoTitle) {
                    if (isTinyScreen || (isMobileScreen && isLandscape)) {
                        videoTitle.style.fontSize = '16px';
                        videoTitle.style.marginBottom = '1px'; // Further reduced
                    } else if (isMobileScreen) {
                        videoTitle.style.fontSize = '18px';
                        videoTitle.style.marginBottom = '2px'; // Further reduced
                    }
                }
            }
        }
        
        // Handle hologram videos if present
        const hologramVideos = document.querySelectorAll('.hologram-video');
        hologramVideos.forEach(video => {
            // Get position relative to button
            const buttonElement = document.querySelector('.sector-btn:hover') || 
                                 document.querySelector('.sector-btn:focus');
            if (buttonElement) {
                const buttonRect = buttonElement.getBoundingClientRect();
                const adjustedScale = Math.min(scale, 1.0); // Don't scale up beyond 100%
                
                // Adjust position based on screen size
                const isSmallScreen = window.innerWidth < 768;
                const isMobileScreen = window.innerWidth < 480;
                const isTinyScreen = window.innerWidth < 350;
                
                if (isTinyScreen) {
                    // Extra small screens need larger videos too
                    video.style.transform = 'translateX(-50%)';
                    video.style.transformOrigin = 'top center';
                    video.style.left = '50%';
                    video.style.top = (buttonRect.bottom + 8) + 'px';
                    video.style.width = '240px'; // Increased for tiny screens
                } else if (isMobileScreen) {
                    // Mobile positioning below button with larger size
                    video.style.transform = 'translateX(-50%)';
                    video.style.transformOrigin = 'top center';
                    video.style.left = '50%';
                    video.style.top = (buttonRect.bottom + 8) + 'px'; // Reduced from 10px
                    video.style.width = '280px'; // Further increased from 200px
                } else if (isSmallScreen) {
                    // Tablet positioning below button with larger size
                    video.style.transform = 'translateX(-50%)';
                    video.style.transformOrigin = 'top center';
                    video.style.left = '50%';
                    video.style.top = (buttonRect.bottom + 8) + 'px'; // Reduced from 10px
                    video.style.width = '320px'; // Further increased from 240px
                } else {
                    // Standard desktop positioning to the right of button
                    const rightPosition = buttonRect.right + 20;
                    video.style.transform = `translateY(-50%) scale(${adjustedScale})`;
                    video.style.transformOrigin = 'left center';
                    video.style.left = rightPosition + 'px';
                    video.style.top = (buttonRect.top + buttonRect.height/2) + 'px';
                    video.style.width = '320px'; // Set a consistent width for desktop
                }
            }
        });
    },
    
    // Setup detection for browser zoom changes
    setupZoomDetection: function() {
        // Store initial device pixel ratio
        let lastPixelRatio = window.devicePixelRatio || 1;
        
        // Check for changes periodically
        setInterval(() => {
            const newPixelRatio = window.devicePixelRatio || 1;
            
            if (newPixelRatio !== lastPixelRatio) {
                console.log(`Zoom changed: ${lastPixelRatio} → ${newPixelRatio}`);
                lastPixelRatio = newPixelRatio;
                this.adjustScale();
            }
        }, 500); // Check every half second
    }
};

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    responsiveHandler.init();
});

// Also handle orientation changes for mobile devices
window.addEventListener('orientationchange', function() {
    setTimeout(() => {
        responsiveHandler.adjustScale();
    }, 200); // Short delay to let orientation change complete
});
