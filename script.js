let currentPage = 'recommend-groups';

function getUrlParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function initPageFromUrl() {
    const page = getUrlParam('page');
    if (page) {
        if (page === 'wanhua') {
            window.location.href = 'wht/index.html';
        } else if (page === 'chuanjia') {
            window.location.href = 'chuanjialu/pages/memoir/home.html';
        }
    }
}

initPageFromUrl();

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    currentPage = pageId;
    
    const bottomNav = document.querySelector('.bottom-nav');
    const navPages = ['recommend-groups', 'my-groups'];
    if (navPages.includes(pageId)) {
        bottomNav.classList.remove('hidden');
    } else {
        bottomNav.classList.add('hidden');
    }
    
    if (pageId !== 'chat-room') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (window.XueWuyaVoiceMode) {
        XueWuyaVoiceMode.scheduleRead(200);
    }
}

function goBack() {
    if (currentPage === 'chat-room') {
        showPage('my-groups');
    } else if (currentPage === 'works-wall') {
        showPage('chat-room');
    } else if (currentPage === 'create-group') {
        showPage('my-groups');
    } else if (currentPage === 'publish-work') {
        showPage('works-wall');
    } else if (currentPage === 'group-settings') {
        showPage('chat-room');
    } else {
        showPage('recommend-groups');
    }
}

function navigateToChat(groupName) {
    document.getElementById('chat-title').textContent = groupName;
    showPage('chat-room');
}

function navigateToCreate() {
    showPage('create-group');
}

function navigateToWorks() {
    showPage('works-wall');
}

function navigateToPublish() {
    showPage('publish-work');
}

function navigateToSettings() {
    showPage('group-settings');
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const messageText = input.value.trim();
    
    if (!messageText) return;
    
    const messagesContainer = document.querySelector('.chat-messages');
    
    const newMessage = document.createElement('div');
    newMessage.className = 'message sent';
    newMessage.innerHTML = `
        <div class="message-content">
            <div class="message-name">我</div>
            <div class="message-text">${messageText}</div>
        </div>
        <div class="message-avatar">👴</div>
    `;
    
    messagesContainer.appendChild(newMessage);
    input.value = '';
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function createGroup() {
    const groupName = document.querySelector('.form-input[name="group-name"]')?.value || '新群组';
    const groupDesc = document.querySelector('.form-textarea')?.value || '暂无简介';
    
    const categoryTags = document.querySelectorAll('.category-tag.active');
    const category = categoryTags.length > 0 ? categoryTags[0].textContent : '其他';
    
    const peopleSlider = document.querySelector('.people-slider');
    const maxPeople = peopleSlider ? peopleSlider.value : '50';
    
    const newGroup = `
        <div class="my-group-item" onclick="navigateToChat('${groupName}')">
            <div class="my-group-icon">
                <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(category + ' group icon')}&image_size=square" alt="${category}">
            </div>
            <div class="my-group-info">
                <h4 class="my-group-name">${groupName}</h4>
                <p class="my-group-last">${groupDesc.length > 20 ? groupDesc.substring(0, 20) + '...' : groupDesc}</p>
            </div>
            <div class="my-group-time">刚刚</div>
        </div>
    `;
    
    const myGroupsList = document.querySelector('.my-groups-list');
    if (myGroupsList) {
        myGroupsList.insertAdjacentHTML('afterbegin', newGroup);
    }
    
    showPage('my-groups');
    setNavActive('gongxuetang');
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('my-groups-tab').addEventListener('click', () => {
        showPage('my-groups');
    });

    document.getElementById('recommend-tab').addEventListener('click', () => {
        showPage('recommend-groups');
    });

    document.getElementById('my-groups-tab2').addEventListener('click', () => {
        showPage('my-groups');
    });

    document.getElementById('recommend-tab2').addEventListener('click', () => {
        showPage('recommend-groups');
    });

    

    document.querySelectorAll('.role-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    document.querySelectorAll('.category-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            tag.classList.toggle('active');
        });
    });

    document.querySelectorAll('.join-method').forEach(method => {
        method.addEventListener('click', () => {
            document.querySelectorAll('.join-method').forEach(m => m.classList.remove('active'));
            method.classList.add('active');
        });
    });

    const peopleSlider = document.querySelector('.people-slider');
    const sliderValue = document.querySelector('.slider-value');
    if (peopleSlider && sliderValue) {
        peopleSlider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            sliderValue.textContent = value + '人';
            const percentage = ((value - 30) / (200 - 30)) * 100;
            peopleSlider.style.background = `linear-gradient(to right, #2d9d5a 0%, #2d9d5a ${percentage}%, #ddd ${percentage}%, #ddd 100%)`;
        });
    }

    document.querySelectorAll('.progress-fill').forEach(fill => {
        const current = parseInt(fill.dataset.current);
        const total = parseInt(fill.dataset.total);
        const ratio = current / total;
        const percentage = ratio * 100;
        
        let color = '#2d9d5a';
        if (ratio > 0.9) {
            color = '#ef4444';
        } else if (ratio >= 0.7) {
            color = '#f97316';
        }
        
        fill.style.width = percentage + '%';
        fill.setAttribute('style', `width: ${percentage}%; background-color: ${color} !important;`);
    });

    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const keyword = e.target.value.toLowerCase().trim();
            const groupItems = document.querySelectorAll('.my-group-item');
            
            groupItems.forEach(item => {
                const groupName = item.querySelector('.my-group-name').textContent.toLowerCase();
                const groupLast = item.querySelector('.my-group-last').textContent.toLowerCase();
                
                if (groupName.includes(keyword) || groupLast.includes(keyword)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const isLiked = btn.dataset.liked === 'true';
            const currentText = btn.textContent;
            const match = currentText.match(/(\d+)/);
            const count = parseInt(match[1]);
            
            if (isLiked) {
                btn.textContent = `🤍 ${count - 1}`;
                btn.dataset.liked = 'false';
            } else {
                btn.textContent = `❤️ ${count + 1}`;
                btn.dataset.liked = 'true';
            }
        });
    });

    document.querySelectorAll('.comment-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const workCard = btn.closest('.work-card');
            const commentInputWrap = workCard.querySelector('.comment-input-wrap');
            const commentInput = workCard.querySelector('.comment-input');
            
            if (commentInputWrap.style.display === 'none' || commentInputWrap.style.display === '') {
                commentInputWrap.style.display = 'flex';
                commentInput.focus();
            } else {
                commentInputWrap.style.display = 'none';
            }
        });
    });

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const commentText = btn.dataset.comment;
            const workCard = btn.closest('.work-card');
            const commentsContainer = workCard.querySelector('.work-comments');
            
            const newComment = document.createElement('p');
            newComment.innerHTML = `<span class="comment-author">我：</span>${commentText}`;
            commentsContainer.appendChild(newComment);
        });
    });

    document.querySelectorAll('.send-comment-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const commentInput = btn.previousElementSibling;
            const commentText = commentInput.value.trim();
            
            if (commentText) {
                const workCard = btn.closest('.work-card');
                const commentsContainer = workCard.querySelector('.work-comments');
                
                const newComment = document.createElement('p');
                newComment.innerHTML = `<span class="comment-author">我：</span>${commentText}`;
                commentsContainer.appendChild(newComment);
                
                commentInput.value = '';
            }
        });
    });
});

function setNavActive(module) {
    if (window.XueWuyaNav) {
        XueWuyaNav.initBottomNav(module || 'gongxuetang');
        return;
    }
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const target = document.getElementById(module);
    if (target) {
        target.classList.add('active');
    }
}



