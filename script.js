// Wait for DOM to load before executing scripts
document.addEventListener('DOMContentLoaded', function() {
    
    // Navbar functionality
    let navbar = document.querySelector('.navbar');
    let menuBtn = document.querySelector('#menu');
    
    if (menuBtn) {
        menuBtn.onclick = () => {
            if (navbar) {
                navbar.classList.toggle('active');
            }
        };
    }

    // Login/Profile icon functionality
    let loginBtn = document.querySelector('#login');
    if (loginBtn) {
        loginBtn.onclick = () => {
            // Check if user is logged in
            const currentUser = JSON.parse(localStorage.getItem('baguetteBitesCurrentUser') || 'null');
            
            if (currentUser && currentUser.loggedIn) {
                // If logged in, go to profile
                window.location.href = 'profile.html';
            } else {
                // If not logged in, go to login page
                window.location.href = 'login.html';
            }
        };
    }

    // Close navbar on scroll
    window.onscroll = () => {
        if (navbar) {
            navbar.classList.remove('active');
        }
    };

    // Menu preview functionality (if it exists on the page)
    let previewContainer = document.querySelector('.menu-preview-container');
    if (previewContainer) {
        let previewBox = previewContainer.querySelectorAll('.menu-preview');
        
        document.querySelectorAll('.menu .box').forEach(menu => {
            menu.onclick = () => {
                previewContainer.style.display = 'flex';
                let name = menu.getAttribute('data-name');
                previewBox.forEach(preview => {
                    let target = preview.getAttribute('data-target');
                    if(name == target){
                        preview.classList.add('active');
                    }
                });
            };
        });

        let closeBtn = previewContainer.querySelector('#close');
        if (closeBtn) {
            closeBtn.onclick = () => {
                previewContainer.style.display = 'none';
                previewBox.forEach(close => {
                    close.classList.remove('active');
                });
            };
        }
    }

    // Check if user is logged in and update UI
    const currentUser = JSON.parse(localStorage.getItem('baguetteBitesCurrentUser') || 'null');
    if (currentUser && currentUser.loggedIn && loginBtn) {
        // Optional: Change the icon or add indicator that user is logged in
        loginBtn.title = 'View Profile - ' + currentUser.name;
        loginBtn.style.color = '#ff7800'; // Orange color to show logged in
    }
});