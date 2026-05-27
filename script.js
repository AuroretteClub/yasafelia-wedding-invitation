// 1. Mobile Navigation Toggle
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// 2. Background Music & Autoplay Hack
const bgMusic = document.getElementById('bg-music');
const musicToggleBtn = document.getElementById('music-toggle');
bgMusic.volume = 0.25;

let audioPlayed = false;

const playAudioOnInteraction = () => {
    if (!audioPlayed) {
        bgMusic.play().then(() => {
            musicToggleBtn.textContent = 'Pause Music';
            audioPlayed = true;
        }).catch(err => {
            console.log("Autoplay waiting for user action");
        });
        
        document.removeEventListener('click', playAudioOnInteraction);
        document.removeEventListener('scroll', playAudioOnInteraction);
        document.removeEventListener('touchstart', playAudioOnInteraction);
    }
};

document.addEventListener('click', playAudioOnInteraction);
document.addEventListener('scroll', playAudioOnInteraction);
document.addEventListener('touchstart', playAudioOnInteraction);

musicToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation(); 
    if (bgMusic.paused) {
        bgMusic.play();
        musicToggleBtn.textContent = 'Pause Music';
        audioPlayed = true;
    } else {
        bgMusic.pause();
        musicToggleBtn.textContent = 'Play Music';
    }
});

// 3. Intro Pan & Zoom Animation (Smooth Fast Zoom to Groom)
window.addEventListener('scroll', () => {
    const stickyContainer = document.querySelector('.sticky-container');
    if(!stickyContainer) return;

    const rect = stickyContainer.getBoundingClientRect();
    const scrollableDistance = rect.height - window.innerHeight;
    
    let p = -rect.top / scrollableDistance;
    p = Math.max(0, Math.min(1, p));

    const mainImg = document.getElementById('intro-main-img');
    const textGroom = document.getElementById('text-groom'); 
    const textBride = document.getElementById('text-bride'); 

    let scale = 1;
    let translateX = 0;

    if (p < 0.20) {
        // QUICK ZOOM TO GROOM: Starts at scale 1, quickly scales to 1.5, shifts right (focus left)
        let localP = p / 0.20; 
        scale = 1 + (0.5 * localP); 
        translateX = 15 * localP; 
        
        textGroom.style.opacity = localP; 
        textGroom.style.transform = `translateY(${20 - (20 * localP)}px)`;
        textBride.style.opacity = 0;

        textGroom.style.pointerEvents = 'auto';
        textBride.style.pointerEvents = 'none';
    } 
    else if (p < 0.80) {
        // SMOOTH PAN: From Groom to Bride
        let localP = (p - 0.20) / 0.60; 
        scale = 1.5;
        translateX = 15 - (30 * localP); 
        
        if (localP < 0.5) {
            let fadeP = localP / 0.5;
            textGroom.style.opacity = 1 - fadeP;
            textGroom.style.transform = `translateY(${20 * fadeP}px)`;
            textBride.style.opacity = 0;
            
            textGroom.style.pointerEvents = 'none';
            textBride.style.pointerEvents = 'none';
        } else {
            let fadeP = (localP - 0.5) / 0.5;
            textGroom.style.opacity = 0;
            textBride.style.opacity = fadeP;
            textBride.style.transform = `translateY(${20 - (20 * fadeP)}px)`;
            
            textGroom.style.pointerEvents = 'none';
            textBride.style.pointerEvents = 'auto';
        }
    } 
    else {
        // HOLD ON BRIDE
        scale = 1.5;
        translateX = -15;
        textGroom.style.opacity = 0;
        textBride.style.opacity = 1;
        textBride.style.transform = 'translateY(0)';
        
        textGroom.style.pointerEvents = 'none';
        textBride.style.pointerEvents = 'auto';
    }

    mainImg.style.transform = `scale(${scale}) translate(${translateX}%, 0)`;
});


// 4. Copy to Clipboard Functionality
const copyButtons = document.querySelectorAll('.copy-btn');

copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const textToCopy = btn.getAttribute('data-copy');
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalHTML = btn.innerHTML;
            btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="#c4a977" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            
            setTimeout(() => {
                btn.innerHTML = originalHTML;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    });
});


// 5. Gallery Carousel Seamless Infinite Loop Logic (No glitching)
const track = document.getElementById('gallery-track');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');

// Duplicate the items deeply in the DOM to create a huge track, avoiding the need to move items while the user looks
const originalItems = Array.from(track.children);
for (let i = 0; i < 4; i++) {
    originalItems.forEach(item => track.appendChild(item.cloneNode(true)));
}

// Start scroll in the middle chunk silently to allow scrolling back
window.addEventListener('load', () => {
    setTimeout(() => {
        const setWidth = track.scrollWidth / 5;
        track.scrollLeft = setWidth * 2;
    }, 100);
});

// Reset silently if they somehow scroll too far (unlikely with this many items, but makes it bulletproof)
let scrollTimeout;
track.addEventListener('scroll', () => {
    window.clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        const setWidth = track.scrollWidth / 5;
        // If near extreme start or extreme end, secretly jump back to middle
        if (track.scrollLeft < setWidth || track.scrollLeft > setWidth * 4) {
            track.style.scrollSnapType = 'none';
            track.scrollLeft = setWidth * 2 + (track.scrollLeft % setWidth);
            track.style.scrollSnapType = 'x mandatory';
        }
    }, 150); // Waits until scrolling completely stops
});

btnNext.addEventListener('click', () => {
    const imgElement = track.querySelector('img');
    const scrollAmount = imgElement.clientWidth + (window.innerWidth >= 768 ? 0 : 0); 
    track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
});

btnPrev.addEventListener('click', () => {
    const imgElement = track.querySelector('img');
    const scrollAmount = imgElement.clientWidth + (window.innerWidth >= 768 ? 0 : 0);
    track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
});