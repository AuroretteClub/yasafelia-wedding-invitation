// 1. Mobile & Desktop Navigation Toggle (Includes 'X' animation state)
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active'); 
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active'); 
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

// 3. Intro Pan & Zoom Animation (Clean Fade-out of Greeting)
window.addEventListener('scroll', () => {
    const stickyContainer = document.querySelector('.sticky-container');
    if(!stickyContainer) return;

    const rect = stickyContainer.getBoundingClientRect();
    const scrollableDistance = rect.height - window.innerHeight;
    
    let p = -rect.top / scrollableDistance;
    p = Math.max(0, Math.min(1, p));

    const mainImg = document.getElementById('intro-main-img');
    const greeting = document.getElementById('intro-greeting');
    const textGroom = document.getElementById('text-groom'); 
    const textBride = document.getElementById('text-bride'); 

    let scale = 1;
    let translateX = 0;

    if (p < 0.15) {
        // PHASE 0: Static Greeting
        scale = 1;
        translateX = 0;
        greeting.style.opacity = 1;
        
        textGroom.style.opacity = 0;
        textBride.style.opacity = 0;
        textGroom.style.pointerEvents = 'none';
        textBride.style.pointerEvents = 'none';
    } 
    else if (p < 0.35) {
        // PHASE 1: Greeting cleanly fades out. Image Zooms fast to Groom.
        let localP = (p - 0.15) / 0.20; 
        scale = 1 + (0.5 * localP); 
        translateX = 15 * localP; 
        
        // Greeting fades out smoothly, no zoom or spacing distortion
        greeting.style.opacity = 1 - localP;

        textGroom.style.opacity = localP > 0.5 ? (localP - 0.5) * 2 : 0; 
        textGroom.style.transform = `translateY(${20 - (20 * localP)}px)`;
        textBride.style.opacity = 0;

        textGroom.style.pointerEvents = localP > 0.5 ? 'auto' : 'none';
        textBride.style.pointerEvents = 'none';
    } 
    else if (p < 0.75) {
        // PHASE 2: Smooth Pan from Groom to Bride
        let localP = (p - 0.35) / 0.40; 
        scale = 1.5;
        translateX = 15 - (30 * localP); 
        
        greeting.style.opacity = 0; 

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
        // PHASE 3: HOLD ON BRIDE
        scale = 1.5;
        translateX = -15;
        greeting.style.opacity = 0;
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

// 5. Randomize Images & Natural Infinite Gallery Carousel Logic
const track = document.getElementById('gallery-track');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');

// Convert NodeList to Array, shuffle using Fisher-Yates
let originalItems = Array.from(track.children);
for (let i = originalItems.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [originalItems[i], originalItems[j]] = [originalItems[j], originalItems[i]];
}

// Clear track and append shuffled items
track.innerHTML = '';
originalItems.forEach(item => track.appendChild(item));

// Duplicate the entire shuffled set exactly once to create infinite scroll buffer
originalItems.forEach(item => {
    track.appendChild(item.cloneNode(true));
});

window.addEventListener('load', () => {
    setTimeout(() => {
        const midPoint = track.scrollWidth / 2;
        track.scrollLeft = midPoint;
    }, 50);
});

track.addEventListener('scroll', () => {
    const maxScroll = track.scrollWidth - track.clientWidth;
    const midPoint = track.scrollWidth / 2;
    
    if (track.scrollLeft >= maxScroll - 5) {
        track.style.scrollBehavior = 'auto';
        track.scrollLeft = midPoint - track.clientWidth;
        track.style.scrollBehavior = 'smooth';
    } else if (track.scrollLeft <= 5) {
        track.style.scrollBehavior = 'auto';
        track.scrollLeft = midPoint;
        track.style.scrollBehavior = 'smooth';
    }
});

btnNext.addEventListener('click', () => {
    const scrollAmount = track.firstElementChild.clientWidth; 
    track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
});

btnPrev.addEventListener('click', () => {
    const scrollAmount = track.firstElementChild.clientWidth;
    track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
});