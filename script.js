document.addEventListener('DOMContentLoaded', function() {
    // Get the canvas element
    const ctx = document.getElementById('budgetPieChart').getContext('2d');
    
    // Button click sound elements
    const clickSound = document.getElementById('clickSound');
    const pieClickSound = document.getElementById('pieClickSound');
    
    // Function to play button click sound
    function playClickSound() {
        clickSound.currentTime = 0; // Rewind to start
        clickSound.play().catch(error => {
            console.log("Sound play prevented:", error);
        });
    }
    
    // Function to play pie chart click sound
    function playPieClickSound() {
        pieClickSound.currentTime = 0; // Rewind to start
        pieClickSound.play().catch(error => {
            console.log("Pie click sound play prevented:", error);
        });
    }
    
    // Budget constants and variables
    const TOTAL_BUDGET = 110; // 110 billion

    // Reset budget data on page load - Set all initial values to 1B minimum
    const initialBudgetData = {
        Health: 1,
        Education: 1,
        Security: 1,
        Infrastructure: 1,
        Debt: 1
    };

    // Add a constant for what the country needs (fixed reference values - keep these unchanged)
    const COUNTRY_NEEDS = {
        Health: 50,
        Education: 40,
        Security: 40,
        Infrastructure: 40,
        Debt: 30
    };

    // Clear any stored data and reset to initial values
    localStorage.removeItem('budgetData');
    let budgetData = {...initialBudgetData};
    
    // Modal elements
    const modal = document.getElementById('budgetModal');
    const modalTitle = document.getElementById('modalSectorTitle');
    const budgetInput = document.getElementById('budgetInput');
    const saveButton = document.getElementById('saveBudget');
    const cancelButton = document.getElementById('cancelBudget');
    const closeButton = document.querySelector('.close-button');
    
    // Error modal elements
    const errorModal = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');
    const errorOkButton = document.getElementById('errorOkButton');
    const errorCloseButton = document.querySelector('.error-close-button');
    
    // Function to show error modal
    function showErrorModal(message) {
        // Play click sound for feedback
        playClickSound();
        
        // Update error message
        errorMessage.textContent = message;
        
        // Show the error modal
        errorModal.style.display = 'block';
        
        // Get current game scale
        const wrapper = document.querySelector('.main-wrapper');
        const transform = wrapper.style.transform;
        const scale = transform ? parseFloat(transform.replace('scale(', '').replace(')', '')) : 1;
        
        // Apply scaling to error modal
        setTimeout(() => {
            const errorModalContent = document.querySelector('.error-modal-content');
            if (errorModalContent) {
                errorModalContent.style.transform = `scale(${scale})`;
                errorModalContent.style.transformOrigin = 'center center';
            }
        }, 10);
    }
    
    // Function to close error modal
    function closeErrorModal() {
        errorModal.style.display = 'none';
    }
    
    // Error modal event listeners
    errorOkButton.addEventListener('click', closeErrorModal);
    errorCloseButton.addEventListener('click', closeErrorModal);
    
    window.addEventListener('click', function(event) {
        if (event.target === errorModal) {
            closeErrorModal();
        }
    });
    
    let currentSector = '';
    
    // Data for the pie chart
    const chartData = {
        labels: Object.keys(budgetData),
        datasets: [{
            data: Object.values(budgetData),
            backgroundColor: [
                '#FF6384', // Health - Red
                '#36A2EB', // Education - Blue
                '#FFCE56', // Debt - Yellow
                '#4BC0C0', // Security - Turquoise
                '#9966FF'  // Infrastructure - Purple
            ],
            borderColor: 'white',
            borderWidth: 2
        }]
    };
    
    // Calculate remaining funds (but no longer update display since element is removed)
    function updateRemainingFunds() {
        const allocated = Object.values(budgetData).reduce((sum, value) => sum + value, 0);
        const remaining = TOTAL_BUDGET - allocated;
        return remaining; // Return the value in case it's needed elsewhere
    }
    
    // Configuration options
    const config = {
        type: 'pie',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 50, // Reduced top padding to give more space for the chart
                    bottom: 10, // Minimal bottom padding 
                    left: 0,   // Remove left padding
                    right: 0   // Remove right padding
                }
            },
            plugins: {
                legend: {
                    display: true,  // Keep legend visible
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 14// Keep original font size
                        },
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            return `${label}: $${value} Billion`;
                        }
                    }
                },
                // Configure datalabels properly
                datalabels: {
                    color: '#fff',
                    font: {
                        weight: 'bold',
                        size: 14 // Keep original font size
                    },
                    formatter: function(value, context) {
                        return [
                            context.chart.data.labels[context.dataIndex],
                            `$${value}B`
                        ];
                    },
                    textAlign: 'center',
                    align: 'center'
                }
            },
            radius: '95%', // Increased from 90% to make pie chart larger
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    // Play pie chart click sound
                    playPieClickSound();
                    
                    const index = elements[0].index;
                    const sector = chartData.labels[index];
                    openModal(sector);
                }
            }
        },
        plugins: [ChartDataLabels]  // Properly register plugin here instead
    };
    
    // Create the pie chart
    const budgetChart = new Chart(ctx, config);
    
    // Function to update sector values in the "What the Country Needs" section
    function updateSectorValues() {
        // Display fixed "needs" values instead of current allocations
        document.getElementById('health-value').textContent = `$${COUNTRY_NEEDS.Health}B`;
        document.getElementById('education-value').textContent = `$${COUNTRY_NEEDS.Education}B`;
        document.getElementById('security-value').textContent = `$${COUNTRY_NEEDS.Security}B`;
        document.getElementById('infrastructure-value').textContent = `$${COUNTRY_NEEDS.Infrastructure}B`;
        document.getElementById('debt-value').textContent = `$${COUNTRY_NEEDS.Debt}B`;
    }
    
    // Update chart data
    function updateChart() {
        // Create display data that replaces zeros with minimal values for visual representation
        const displayData = Object.values(budgetData).map(value => value === 0 ? 0.1 : value);
        
        budgetChart.data.datasets[0].data = displayData;
        budgetChart.update();
        updateSectorValues(); // Update sector values when chart updates
        updateRemainingFunds(); // Also update the remaining funds display
    }
    
    // Modal functions
    function openModal(sector) {
        currentSector = sector;
        modalTitle.textContent = sector;
        budgetInput.value = budgetData[sector];
        modal.style.display = 'block';
        
        // Get current game scale
        const wrapper = document.querySelector('.main-wrapper');
        const transform = wrapper.style.transform;
        const scale = transform ? parseFloat(transform.replace('scale(', '').replace(')', '')) : 1;
        
        // Apply scaling to modal with improved positioning
        setTimeout(() => {
            const modalContent = document.querySelector('.modal-content');
            if (modalContent) {
                // Remove all scaling code
                modalContent.style.position = 'relative';
                modalContent.style.margin = '15vh auto';
            }
        }, 10);
    }
    
    function closeModal() {
        modal.style.display = 'none';
    }
    
    // Event listeners for modal
    closeButton.addEventListener('click', closeModal);
    cancelButton.addEventListener('click', closeModal);
    
    saveButton.addEventListener('click', function() {
        // Sound is handled by the general click handler above
        const newValue = parseInt(budgetInput.value);
        if (isNaN(newValue) || newValue < 1) {
            showErrorModal('Please enter a valid number of at least 1 billion');
            return;
        }
        
        // Removed check for total budget exceeding TOTAL_BUDGET
        
        budgetData[currentSector] = newValue;
        updateChart();
        updateRemainingFunds();
        closeModal();
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Reset button functionality
    document.getElementById('resetButton').addEventListener('click', function() {
        budgetData = {...initialBudgetData};
        updateChart();
        updateRemainingFunds();
        updateSectorValues(); // Ensure sector values are updated on reset
    });
    
    // Initialize remaining funds and sector values
    updateRemainingFunds();
    updateSectorValues(); // Initialize sector values when page loads

    // Force chart update on initial load to properly show zero values as minimal segments
    updateChart();

    // Video modal elements
    const videoModal = document.getElementById('videoModal');
    const videoModalTitle = document.getElementById('videoModalTitle');
    const sectorVideo = document.getElementById('sectorVideo');
    const videoCloseButton = document.querySelector('.video-close-button');
    
    // Video paths
    const VIDEO_PATHS = {
        // Path to short videos for each sector
        // For now using the same short video for all sectors as requested
        shortVideos: {
            Health: './video/short-videos/helath_short.mp4',
            Education: './video/short-videos/helath_short.mp4', // Using health video as placeholder
            Security: './video/short-videos/helath_short.mp4', // Using health video as placeholder
            Infrastructure: './video/short-videos/helath_short.mp4', // Using health video as placeholder
            Debt: './video/short-videos/helath_short.mp4' // Using health video as placeholder
        },
        // Path to economy video for submit button
        economyVideo: './video/long-videos/economy.mp4'
    };
    
    // Track currently playing hologram video
    let currentHologramVideo = null;
    
    // Function to create hologram effect for sector videos
    function playSectorHologram(buttonElement, sector) {
        // Remove any existing hologram video first
        if (currentHologramVideo && document.body.contains(currentHologramVideo)) {
            document.body.removeChild(currentHologramVideo);
            currentHologramVideo = null;
        }
        
        // Get the position of the button
        const buttonRect = buttonElement.getBoundingClientRect();
        
        // Create a new video element for the hologram
        const hologramVideo = document.createElement('video');
        hologramVideo.classList.add('hologram-video');
        
        // Check screen size and adjust video width
        const isSmallScreen = window.innerWidth < 768;
        const isMobileScreen = window.innerWidth < 480;
        const isTinyScreen = window.innerWidth < 350;
        
        // Set appropriate width based on screen size - INCREASED ALL SIZES
        hologramVideo.width = isTinyScreen ? 200 : (isMobileScreen ? 240 : (isSmallScreen ? 300 : 400));
        hologramVideo.controls = true;
        hologramVideo.autoplay = true;
        
        // Add playsinline attribute for mobile devices
        hologramVideo.setAttribute('playsinline', '');
        hologramVideo.setAttribute('preload', 'metadata');
        
        // Position differently based on screen size
        if (isTinyScreen || isMobileScreen) {
            // For very small screens, position centered below with less space
            hologramVideo.style.left = '50%';
            hologramVideo.style.top = (buttonRect.bottom + 5) + 'px';
            hologramVideo.style.transform = 'translateX(-50%)';
            // Add a class for mobile-specific styling
            hologramVideo.classList.add('mobile-hologram');
        } else if (isSmallScreen) {
            // For small screens, also position below with more space
            hologramVideo.style.left = '50%'; 
            hologramVideo.style.top = (buttonRect.bottom + 10) + 'px';
            hologramVideo.style.transform = 'translateX(-50%)';
            hologramVideo.classList.add('tablet-hologram');
        } else {
            // For larger screens, keep the right positioning
            const rightPosition = buttonRect.right + 20;
            hologramVideo.style.left = rightPosition + 'px';
            hologramVideo.style.top = (buttonRect.top + buttonRect.height/2) + 'px';
            hologramVideo.style.transform = 'translateY(-50%)';
        }
        
        // Add to the body and track the current video
        document.body.appendChild(hologramVideo);
        currentHologramVideo = hologramVideo;
        
        // Set up event listener for when the video ends
        hologramVideo.addEventListener('ended', function() {
            if (document.body.contains(hologramVideo)) {
                document.body.removeChild(hologramVideo);
                currentHologramVideo = null;
            }
        });
        
        // Allow closing by clicking on the video
        hologramVideo.addEventListener('click', function() {
            if (document.body.contains(hologramVideo)) {
                document.body.removeChild(hologramVideo);
                currentHologramVideo = null;
            }
        });
    }
    
    // Video modal handling - updated to maintain proper video aspect ratio
    function openVideoModal() {
        videoModal.style.display = 'block';
        
        // Check screen sizes
        const isSmallScreen = window.innerWidth < 768;
        const isMobileScreen = window.innerWidth < 480;
        
        // Get current game scale from the data attribute or calculate it
        const gameScale = videoModal.dataset.gameScale ? 
            parseFloat(videoModal.dataset.gameScale) : 
            (() => {
                const wrapper = document.querySelector('.main-wrapper');
                const transform = wrapper.style.transform;
                return transform ? parseFloat(transform.replace('scale(', '').replace(')', '')) : 1;
            })();
        
        // Apply scaling to video modal with improved positioning
        setTimeout(() => {
            const videoModalContent = document.querySelector('.video-modal-content');
            if (videoModalContent) {
                if (isMobileScreen) {
                    // For mobile screens, use full width with no padding
                    videoModalContent.style.transform = 'translate(-50%, -50%)';
                    videoModalContent.style.width = '100%';
                    videoModalContent.style.maxWidth = 'none';
                    videoModalContent.style.padding = '2px'; // Minimal padding for maximum video space
                } else if (isSmallScreen) {
                    // For small screens (tablets), use more width with minimal padding
                    videoModalContent.style.transform = 'translate(-50%, -50%)';
                    videoModalContent.style.width = '100%'; // Full width for tablets too
                    videoModalContent.style.maxWidth = 'none';
                    videoModalContent.style.padding = '5px'; // Minimal padding
                } else {
                    // For larger screens, apply scale but maintain centering and full width
                    const adjustedScale = Math.min(gameScale, 1.0);
                    videoModalContent.style.transform = `translate(-50%, -50%) scale(${adjustedScale})`;
                    videoModalContent.style.width = '100%'; // Full width for desktop
                    videoModalContent.style.maxWidth = '1800px'; // Very large maximum
                    videoModalContent.style.transformOrigin = 'center center';
                }
                
                // Remove scrollbars by setting overflow to hidden
                videoModalContent.style.overflow = 'hidden';
                videoModalContent.style.overflowY = 'hidden';
                videoModalContent.style.webkitOverflowScrolling = 'touch'; // Keep smooth scrolling for iOS
                
                // Adjust modal container to use flex layout for better centering
                videoModalContent.style.display = 'flex';
                videoModalContent.style.flexDirection = 'column';
            }
            
            // Make sure the video container fits properly while maintaining aspect ratio
            const videoContainer = document.querySelector('.video-container');
            if (videoContainer) {
                // Remove fixed aspect ratio to prevent cropping
                videoContainer.style.padding = '0';
                videoContainer.style.height = 'auto';
                videoContainer.style.width = '100%';
                videoContainer.style.minHeight = isMobileScreen ? '200px' : (isSmallScreen ? '250px' : '350px');
                videoContainer.style.display = 'flex';
                videoContainer.style.alignItems = 'center';
                videoContainer.style.justifyContent = 'center';
                videoContainer.style.flexGrow = '1';
                videoContainer.style.position = 'relative';
                videoContainer.style.overflow = 'hidden'; // Prevent overflow issues
            }
            
            // Ensure video element maintains proper aspect ratio
            const videoElement = document.getElementById('sectorVideo');
            if (videoElement) {
                videoElement.style.position = 'relative';
                videoElement.style.width = '100%';
                videoElement.style.height = 'auto'; // Changed back to auto for proper aspect ratio
                videoElement.style.maxWidth = '100%'; // Limit to container width
                videoElement.style.maxHeight = isMobileScreen ? '65vh' : (isSmallScreen ? '70vh' : '80vh'); 
                videoElement.style.objectFit = 'contain'; // Use contain to maintain aspect ratio
                videoElement.style.margin = '0 auto';
                videoElement.setAttribute('playsinline', '');
                videoElement.setAttribute('preload', 'metadata');
                // Add black background to fill letterbox areas
                videoElement.style.backgroundColor = '#000';
            }
        }, 10);
    }
    
    // Function to play sector video
    function playSectorVideo(sector, buttonElement = null) {
        // Use hologram effect for all sectors when a button element is provided
        if (buttonElement) {
            playSectorHologram(buttonElement, sector);
            return;
        }
        
        // Fall back to modal for pie chart clicks (no button element)
        videoModalTitle.textContent = `${sector} Information`;
        sectorVideo.src = VIDEO_PATHS.shortVideos[sector];
        openVideoModal(); // Use the new function instead of directly setting display
        sectorVideo.load();
        
        // Auto play when ready
        sectorVideo.oncanplaythrough = function() {
            sectorVideo.play().catch(error => {
                console.log("Auto-play prevented by browser:", error);
            });
        };
    }
    
    // Function to play economy video (for submit button)
    function playEconomyVideo() {
        videoModalTitle.textContent = 'Jamaica You Built!';
        sectorVideo.src = VIDEO_PATHS.economyVideo;
        openVideoModal(); // Use the new function instead of directly setting display
        sectorVideo.load();
        
        sectorVideo.oncanplaythrough = function() {
            sectorVideo.play().catch(error => {
                console.log("Auto-play prevented by browser:", error);
            });
        };
    }
    
    // Close video modal
    function closeVideoModal() {
        videoModal.style.display = 'none';
        sectorVideo.pause();
        sectorVideo.currentTime = 0; // Reset video position
        
        // Stop video by removing source
        sectorVideo.removeAttribute('src');
        sectorVideo.load();
        
        // Also stop and remove any hologram videos
        if (currentHologramVideo && document.body.contains(currentHologramVideo)) {
            currentHologramVideo.pause();
            currentHologramVideo.currentTime = 0;
            document.body.removeChild(currentHologramVideo);
            currentHologramVideo = null;
        }
    }
    
    // Event listeners for sector buttons to play videos
    document.querySelectorAll('.sector-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            // Sound is handled by the general click handler above
            const sectorTitle = this.parentElement.querySelector('.sector-title').textContent;
            e.stopPropagation(); // Prevent bubbling to avoid triggering other events
            
            // Play the sector video with hologram effect for Health
            playSectorVideo(sectorTitle, this);
        });
    });
    
    // Submit button now plays economy video
    document.querySelector('.submit-btn').addEventListener('click', function() {
        // Sound is handled by the general click handler above
        playEconomyVideo();
    });
    
    // Video modal close events
    videoCloseButton.addEventListener('click', closeVideoModal);
    
    // Close when clicking outside the video content
    window.addEventListener('click', function(event) {
        if (event.target === videoModal) {
            closeVideoModal();
        }
    });
    
    // Initialize remaining funds and sector values
    updateRemainingFunds();
    updateSectorValues();
    
    // Add click sound to buttons including error modal buttons
    document.querySelectorAll('.sector-btn, .submit-btn, #resetButton, #saveBudget, #cancelBudget, .close-button, .video-close-button, #errorOkButton, .error-close-button').forEach(button => {
        button.addEventListener('click', playClickSound);
    });
    
    // Note: Comment out the original sector button event listener to avoid conflicts
    /*
    document.querySelectorAll('.sector-btn').forEach(button => {
        button.addEventListener('click', function() {
            const sectorTitle = this.parentElement.querySelector('.sector-title').textContent;
            openModal(sectorTitle);
        });
    });
    */
});
