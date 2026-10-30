const GF_BDAY = { month: 11, day: 17 };
const ANNIV = { month: 3, day: 28 };
const MY_BDAY = { month: 8, day: 15 };
const START_DATE = new Date(2026, 2, 28);
const PHOTO_DATABASE = 'love-story-photos';
const PHOTO_STORE = 'memories';
const photoUrls = new Map();
const photoRecords = new Map();
const photoStage = document.getElementById('photo-stage');
const galleryEmpty = document.getElementById('gallery-empty');
const galleryStatus = document.getElementById('gallery-status');
let highestPhotoLayer = 1;
let photoStoreReady = Promise.resolve();

function showBirthdayPage(step) {
    document.querySelectorAll('.birthday-page').forEach((page, index) => {
        page.hidden = index !== step;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function vibrateDevice(pattern = [45, 25, 70]) {
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
    }
}

function popBalloon(balloon) {
    if (balloon.disabled || balloon.classList.contains('is-popped')) return false;
    balloon.classList.add('is-popped');
    balloon.disabled = true;
    vibrateDevice();
    return true;
}

const welcomeBalloons = Array.from(document.querySelectorAll('#welcome-balloons .balloon-button'));
welcomeBalloons.forEach(balloon => {
    balloon.addEventListener('click', () => {
        if (!popBalloon(balloon)) return;
        const poppedCount = welcomeBalloons.filter(item => item.classList.contains('is-popped')).length;
        document.getElementById('balloon-progress').textContent =
            poppedCount === welcomeBalloons.length
                ? 'Surprise unlocked! Opening your next page...'
                : `${poppedCount} of 5 balloons popped`;
        if (poppedCount === welcomeBalloons.length) {
            window.setTimeout(() => showBirthdayPage(1), 700);
        }
    });
});

document.querySelectorAll('[data-go-to]').forEach(button => {
    button.addEventListener('click', () => showBirthdayPage(Number(button.dataset.goTo)));
});

document.getElementById('quiz-form').addEventListener('submit', event => {
    event.preventDefault();
    const boyfriendAnswer = document.getElementById('boyfriend-answer');
    const classAnswer = document.getElementById('class-answer');
    const feedback = document.getElementById('quiz-feedback');

    if (boyfriendAnswer.value.trim().toLocaleLowerCase() !== 'suraj') {
        feedback.textContent = 'Not quite! Try the name of your favourite boy.';
        boyfriendAnswer.focus();
        return;
    }

    if (classAnswer.value.trim() !== '11') {
        feedback.textContent = 'Almost! Try his class number.';
        classAnswer.focus();
        return;
    }

    feedback.textContent = 'You got them both! Your birthday surprise is ready.';
    showBirthdayPage(2);
});

function createSparkleBurst(balloon) {
    const celebrationPage = document.querySelector('.celebration-page');
    const pageBounds = celebrationPage.getBoundingClientRect();
    const balloonBounds = balloon.getBoundingClientRect();
    const centerX = balloonBounds.left + balloonBounds.width / 2 - pageBounds.left;
    const centerY = balloonBounds.top + balloonBounds.height / 2 - pageBounds.top;

    for (let index = 0; index < 18; index++) {
        const sparkle = document.createElement('span');
        const angle = Math.PI * 2 * index / 18;
        const distance = 48 + Math.random() * 48;
        sparkle.className = `sparkle${index % 3 === 0 ? ' sparkle-heart' : ''}`;
        sparkle.textContent = index % 3 === 0 ? '♥' : '✦';
        sparkle.style.left = `${centerX}px`;
        sparkle.style.top = `${centerY}px`;
        sparkle.style.setProperty('--sparkle-x', `${Math.cos(angle) * distance}px`);
        sparkle.style.setProperty('--sparkle-y', `${Math.sin(angle) * distance}px`);
        sparkle.style.setProperty('--sparkle-delay', `${Math.random() * 100}ms`);
        celebrationPage.append(sparkle);
        sparkle.addEventListener('animationend', () => sparkle.remove(), { once: true });
    }
}

const birthdayBalloons = Array.from(document.querySelectorAll('#birthday-balloons .balloon-button'));
birthdayBalloons.forEach(balloon => {
    balloon.addEventListener('click', () => {
        if (!popBalloon(balloon)) return;
        createSparkleBurst(balloon);
        document.getElementById('birthday-surprise').textContent = balloon.dataset.surprise;

        if (birthdayBalloons.every(item => item.classList.contains('is-popped'))) {
            document.getElementById('birthday-surprise').textContent =
                'Three wishes for the birthday girl: love, laughter, and all the happiness you deserve.';
            document.getElementById('open-letter').hidden = false;
            vibrateDevice([80, 35, 100, 35, 160]);
        }
    });
});

document.getElementById('open-letter').addEventListener('click', () => showBirthdayPage(3));

document.getElementById('explore-memories').addEventListener('click', () => {
    document.getElementById('our-story').hidden = false;
    document.getElementById('memories-site').hidden = false;
    document.getElementById('our-story').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

function nextOccurrence(month, day, fromDate) {
    const year = fromDate.getFullYear();
    let candidate = new Date(year, month - 1, day);
    if (candidate < new Date(year, fromDate.getMonth(), fromDate.getDate())) {
        candidate = new Date(year + 1, month - 1, day);
    }
    return candidate;
}

function formatRemaining(milliseconds) {
    if (milliseconds <= 0) return 'Today!';
    const seconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m ${seconds % 60}s`;
}

function updateTimers() {
    const now = new Date();
    const countdowns = [
        { date: GF_BDAY, countId: 'birthday-count', nextId: 'birthday-next', message: 'Happy Birthday, my love!' },
        { date: ANNIV, countId: 'anniversary-count', nextId: 'anniversary-next', message: 'Happy Anniversary!' },
        { date: MY_BDAY, countId: 'mybirthday-count', nextId: 'mybirthday-next', message: 'It is my birthday, too!' }
    ];

    countdowns.forEach(({ date, countId, nextId, message }) => {
        const nextDate = nextOccurrence(date.month, date.day, now);
        document.getElementById(nextId).textContent = nextDate.toDateString();
        document.getElementById(countId).textContent =
            now.getMonth() === date.month - 1 && now.getDate() === date.day
                ? message
                : formatRemaining(nextDate - now);
    });

    const difference = now - START_DATE;
    document.getElementById('together-days').textContent = `${Math.floor(difference / 86400000)} days`;
    document.getElementById('together-seconds').textContent = `${Math.floor(difference / 1000)} seconds`;
}

setInterval(updateTimers, 1000);
updateTimers();

function openPhotoDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(PHOTO_DATABASE, 1);
        request.onupgradeneeded = () => {
            request.result.createObjectStore(PHOTO_STORE, { keyPath: 'id' });
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getSavedPhotos() {
    const database = await openPhotoDatabase();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(PHOTO_STORE, 'readonly');
        const request = transaction.objectStore(PHOTO_STORE).getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        transaction.oncomplete = () => database.close();
        transaction.onerror = () => {
            database.close();
            reject(transaction.error);
        };
    });
}

async function savePhoto(photo) {
    const database = await openPhotoDatabase();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(PHOTO_STORE, 'readwrite');
        transaction.objectStore(PHOTO_STORE).put(photo);
        transaction.oncomplete = () => {
            database.close();
            resolve();
        };
        transaction.onerror = () => {
            database.close();
            reject(transaction.error);
        };
        transaction.onabort = () => {
            database.close();
            reject(transaction.error);
        };
    });
}

async function deletePhoto(id) {
    const database = await openPhotoDatabase();
    return new Promise((resolve, reject) => {
        const transaction = database.transaction(PHOTO_STORE, 'readwrite');
        transaction.objectStore(PHOTO_STORE).delete(id);
        transaction.oncomplete = () => {
            database.close();
            resolve();
        };
        transaction.onerror = () => {
            database.close();
            reject(transaction.error);
        };
        transaction.onabort = () => {
            database.close();
            reject(transaction.error);
        };
    });
}

function positionPhoto(frame, photo) {
    const maxX = Math.max(0, photoStage.clientWidth - frame.offsetWidth);
    const maxY = Math.max(0, photoStage.clientHeight - frame.offsetHeight);
    frame.style.left = `${maxX * photo.x / 100}px`;
    frame.style.top = `${maxY * photo.y / 100}px`;
    frame.style.zIndex = photo.z;
    frame.style.transform = `rotate(${photo.rotation}deg)`;
}

function updateGalleryEmptyState() {
    galleryEmpty.hidden = photoRecords.size > 0;
}

function createPhotoFrame(photo) {
    const frame = document.createElement('div');
    frame.className = 'photo-frame';
    frame.tabIndex = 0;
    frame.setAttribute('role', 'group');
    frame.setAttribute('aria-label', `${photo.name}. Drag to move; use arrow keys to reposition.`);
    frame.dataset.photoId = photo.id;

    const image = document.createElement('img');
    image.src = photoUrls.get(photo.id);
    image.alt = photo.name;
    image.draggable = false;

    const caption = document.createElement('span');
    caption.className = 'photo-caption';
    caption.textContent = photo.name;

    const removeButton = document.createElement('button');
    removeButton.className = 'remove-photo';
    removeButton.type = 'button';
    removeButton.textContent = '×';
    removeButton.setAttribute('aria-label', `Remove ${photo.name}`);
    removeButton.addEventListener('click', async () => {
        try {
            await deletePhoto(photo.id);
            URL.revokeObjectURL(photoUrls.get(photo.id));
            photoUrls.delete(photo.id);
            photoRecords.delete(photo.id);
            frame.remove();
            updateGalleryEmptyState();
            galleryStatus.textContent = 'Photo removed from your memory board.';
        } catch (error) {
            galleryStatus.textContent = `Could not remove photo: ${error.message}`;
        }
    });

    frame.append(image, caption, removeButton);
    photoStage.append(frame);
    positionPhoto(frame, photo);

    let dragState = null;
    frame.addEventListener('pointerdown', event => {
        if (event.target === removeButton) return;
        const bounds = frame.getBoundingClientRect();
        dragState = { offsetX: event.clientX - bounds.left, offsetY: event.clientY - bounds.top };
        photo.z = ++highestPhotoLayer;
        positionPhoto(frame, photo);
        frame.setPointerCapture(event.pointerId);
        event.preventDefault();
    });

    frame.addEventListener('pointermove', event => {
        if (!dragState) return;
        const stageBounds = photoStage.getBoundingClientRect();
        const maxX = Math.max(0, photoStage.clientWidth - frame.offsetWidth);
        const maxY = Math.max(0, photoStage.clientHeight - frame.offsetHeight);
        const left = Math.min(maxX, Math.max(0, event.clientX - stageBounds.left - dragState.offsetX));
        const top = Math.min(maxY, Math.max(0, event.clientY - stageBounds.top - dragState.offsetY));
        photo.x = maxX === 0 ? 0 : left / maxX * 100;
        photo.y = maxY === 0 ? 0 : top / maxY * 100;
        positionPhoto(frame, photo);
    });

    const finishDragging = async () => {
        if (!dragState) return;
        dragState = null;
        try {
            await savePhoto(photo);
        } catch (error) {
            galleryStatus.textContent = `Your new position could not be saved: ${error.message}`;
        }
    };

    frame.addEventListener('pointerup', finishDragging);
    frame.addEventListener('pointercancel', finishDragging);
    frame.addEventListener('keydown', async event => {
        const step = event.shiftKey ? 5 : 1;
        const movement = {
            ArrowLeft: [-step, 0],
            ArrowRight: [step, 0],
            ArrowUp: [0, -step],
            ArrowDown: [0, step]
        }[event.key];
        if (!movement) return;
        event.preventDefault();
        photo.x = Math.min(100, Math.max(0, photo.x + movement[0]));
        photo.y = Math.min(100, Math.max(0, photo.y + movement[1]));
        positionPhoto(frame, photo);
        try {
            await savePhoto(photo);
        } catch (error) {
            galleryStatus.textContent = `Your new position could not be saved: ${error.message}`;
        }
    });
}

async function addPhotos(files) {
    const selectedFiles = Array.from(files);
    await photoStoreReady;
    const images = selectedFiles.filter(file => file.type.startsWith('image/'));
    if (images.length === 0) {
        if (selectedFiles.length > 0) galleryStatus.textContent = 'Only image files can be added.';
        return;
    }

    let addedCount = 0;
    const failedFiles = [];
    for (const [index, file] of images.entries()) {
        const id = crypto.randomUUID();
        const photo = {
            id,
            blob: file,
            name: file.name.replace(/\.[^.]+$/, '') || 'A favorite moment',
            x: Math.min(78, 8 + ((photoRecords.size + index) % 4) * 18),
            y: Math.min(68, 8 + ((photoRecords.size + index) % 3) * 22),
            rotation: ((photoRecords.size + index) % 5 - 2) * 2,
            z: ++highestPhotoLayer
        };
        try {
            await savePhoto(photo);
            photoRecords.set(id, photo);
            photoUrls.set(id, URL.createObjectURL(file));
            createPhotoFrame(photo);
            addedCount++;
        } catch (error) {
            failedFiles.push(`${file.name}: ${error.message}`);
        }
    }

    updateGalleryEmptyState();
    const messages = [];
    if (addedCount > 0) messages.push(`${addedCount} photo${addedCount === 1 ? '' : 's'} added. Drag them into your favorite arrangement.`);
    if (images.length !== selectedFiles.length) messages.push(`${selectedFiles.length - images.length} non-image file(s) skipped.`);
    if (failedFiles.length > 0) messages.push(`Could not save ${failedFiles.join('; ')}`);
    galleryStatus.textContent = messages.join(' ');
}

document.getElementById('photo-picker').addEventListener('change', event => {
    addPhotos(Array.from(event.target.files));
    event.target.value = '';
});

photoStage.addEventListener('dragover', event => {
    if (Array.from(event.dataTransfer.types).includes('Files')) {
        event.preventDefault();
        photoStage.classList.add('is-dragging-files');
    }
});

photoStage.addEventListener('dragleave', event => {
    if (!photoStage.contains(event.relatedTarget)) photoStage.classList.remove('is-dragging-files');
});

photoStage.addEventListener('drop', event => {
    event.preventDefault();
    photoStage.classList.remove('is-dragging-files');
    addPhotos(Array.from(event.dataTransfer.files));
});

window.addEventListener('resize', () => {
    photoRecords.forEach(photo => {
        const frame = photoStage.querySelector(`[data-photo-id="${photo.id}"]`);
        if (frame) positionPhoto(frame, photo);
    });
});

async function loadPhotos() {
    try {
        const savedPhotos = await getSavedPhotos();
        savedPhotos.forEach(photo => {
            photoRecords.set(photo.id, photo);
            photoUrls.set(photo.id, URL.createObjectURL(photo.blob));
            highestPhotoLayer = Math.max(highestPhotoLayer, photo.z || 1);
            createPhotoFrame(photo);
        });
        updateGalleryEmptyState();
    } catch (error) {
        galleryStatus.textContent = `Your photo board could not be loaded: ${error.message}`;
    }
}

photoStoreReady = loadPhotos();
