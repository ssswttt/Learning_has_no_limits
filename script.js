let currentPage = 'recommend-groups';
let currentGroupName = '';

const groupChats = {
    '朝阳公园晨练摄影队': [
        { type: 'sent', name: '李叔叔', text: '公园里的花开得可漂亮了。', time: '下午2:32' },
        { type: 'received', name: '张阿姨', voice: true, duration: '15"', time: '下午2:35' },
        { type: 'sent', name: '李叔叔', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beautiful%20flowers%20garden%20spring&image_size=landscape_4_3', time: '下午2:38' },
        { type: 'received', name: '王叔叔', text: '@李叔叔 明天早上一起去锻炼身体吧！', time: '下午2:40' },
        { type: 'sent', name: '李叔叔', text: '好啊！明天早上六点公园门口见！', time: '下午2:42' }
    ],
    '海淀社区书法研习社': [
        { type: 'received', name: '陈老师', text: '今天练习楷书的基本笔画，大家要注意起笔和收笔。', time: '上午9:00' },
        { type: 'received', name: '刘阿姨', text: '老师，我写了几张，请帮忙看看。', time: '上午9:15' },
        { type: 'received', name: '刘阿姨', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20calligraphy%20practice%20sheet%20elegant&image_size=square', time: '上午9:16' },
        { type: 'sent', name: '王叔叔', text: '刘阿姨写得真不错，向你学习！', time: '上午9:20' },
        { type: 'received', name: '陈老师', text: '刘阿姨进步很大，继续保持！', time: '上午9:25' },
        { type: 'received', name: '赵阿姨', text: '明天的书法展览大家记得参加哦！', time: '上午9:30' }
    ],
    '西城茶艺文化沙龙': [
        { type: 'received', name: '周老师', text: '今天给大家介绍一下龙井的冲泡方法。', time: '下午3:00' },
        { type: 'sent', name: '孙阿姨', text: '好期待！听说龙井茶要"三泡"才出味。', time: '下午3:05' },
        { type: 'received', name: '周老师', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20tea%20ceremony%20longjing%20green%20tea&image_size=square', time: '下午3:10' },
        { type: 'received', name: '周老师', text: '没错！第一泡洗茶，第二泡品香，第三泡回甘。', time: '下午3:12' },
        { type: 'received', name: '吴叔叔', text: '我带了去年的明前龙井，下次活动大家一起尝尝？', time: '下午3:20' },
        { type: 'received', name: '郑阿姨', text: '太好了！期待品鉴！', time: '下午3:25' }
    ],
    '广场舞爱好者联盟': [
        { type: 'received', name: '张队长', text: '明天早上七点公园东门集合，新学的舞蹈大家别忘了练！', time: '昨天 20:30' },
        { type: 'received', name: '李阿姨', text: '收到！我在家已经练了好几遍了。', time: '昨天 20:35' },
        { type: 'sent', name: '王叔叔', text: '我腿脚不太灵活，到时候请大家多指点指点。', time: '昨天 20:40' },
        { type: 'received', name: '张队长', text: '没关系，慢慢来，大家都是从新手过来的！', time: '昨天 20:45' },
        { type: 'received', name: '刘阿姨', text: '明天天气不错，正好活动活动！', time: '昨天 20:50' }
    ],
    '太极养生班': [
        { type: 'received', name: '杨师傅', text: '周末我们去湖边练习太极吧，那里空气好。', time: '周四 18:00' },
        { type: 'received', name: '赵阿姨', text: '太好了！湖边环境好，练起来更舒服。', time: '周四 18:10' },
        { type: 'sent', name: '钱叔叔', text: '我负责带音响，大家记得穿宽松的衣服。', time: '周四 18:15' },
        { type: 'received', name: '孙阿姨', text: '收到！我们几点出发？', time: '周四 18:20' },
        { type: 'received', name: '杨师傅', text: '周六早上六点半小区门口集合。', time: '周四 18:25' }
    ],
    '诗词朗诵团': [
        { type: 'received', name: '黄老师', text: '下周的诗词分享会，大家准备好要朗诵的诗词了吗？', time: '周三 16:00' },
        { type: 'received', name: '周阿姨', text: '我准备了李清照的《声声慢》，大家觉得怎么样？', time: '周三 16:10' },
        { type: 'sent', name: '吴叔叔', text: '太好了！李清照的词很有韵味，期待你的朗诵！', time: '周三 16:15' },
        { type: 'received', name: '郑阿姨', text: '我准备了李白的《静夜思》，简单但意境深远。', time: '周三 16:20' },
        { type: 'received', name: '黄老师', text: '都很好！大家各有特色，期待分享会！', time: '周三 16:30' }
    ],
    '海淀书法研习社': [
        { type: 'received', name: '陈老师', text: '今天练习行书的连笔技巧。', time: '上午9:20' },
        { type: 'sent', name: '我', text: '行书比楷书难多了', time: '上午9:25' },
        { type: 'received', name: '王阿姨', text: '多练习就好了，熟能生巧！', time: '上午9:30' }
    ],
    '茶艺文化沙龙': [
        { type: 'received', name: '周老师', text: '今天学习普洱茶的品鉴。', time: '周四 14:00' },
        { type: 'received', name: '赵阿姨', text: '普洱茶越陈越香，我家里还有一块十年的老茶饼。', time: '周四 14:05' },
        { type: 'sent', name: '我', text: '真羡慕！有机会一定要尝尝', time: '周四 14:10' }
    ]
};

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

function renderChatMessages(messages) {
    const messagesContainer = document.querySelector('.chat-messages');
    messagesContainer.innerHTML = '';
    
    messages.forEach(msg => {
        const newMessage = document.createElement('div');
        newMessage.className = `message ${msg.type}`;
        
        let contentHTML = '';
        if (msg.text) {
            contentHTML = `<div class="message-text">${msg.text}</div>`;
        } else if (msg.voice) {
            contentHTML = `
                <div class="voice-message">
                    <div class="voice-wave"></div>
                    <span class="voice-duration">${msg.duration}</span>
                </div>
            `;
        } else if (msg.image) {
            contentHTML = `<img src="${msg.image}" alt="图片" class="message-image">`;
        }
        
        newMessage.innerHTML = msg.type === 'received' ? `
            <div class="message-avatar">${msg.name.includes('阿姨') ? '👵' : '👴'}</div>
            <div class="message-content">
                <div class="message-name">${msg.name}</div>
                ${contentHTML}
                ${msg.time ? `<div class="message-time">${msg.time}</div>` : ''}
            </div>
        ` : `
            <div class="message-content">
                <div class="message-name">${msg.name}</div>
                ${contentHTML}
                ${msg.time ? `<div class="message-time">${msg.time}</div>` : ''}
            </div>
            <div class="message-avatar">👴</div>
        `;
        
        messagesContainer.appendChild(newMessage);
    });
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function navigateToChat(groupName) {
    currentGroupName = groupName;
    document.getElementById('chat-title').textContent = groupName;
    
    const messages = groupChats[groupName] || [
        { type: 'received', name: '系统', text: `欢迎加入「${groupName}」！`, time: '刚刚' }
    ];
    renderChatMessages(messages);
    
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

let uploadedImages = [];

function triggerFileInput() {
    const currentCount = uploadedImages.length;
    if (currentCount >= 9) {
        alert('最多只能添加9张图片');
        return;
    }
    document.getElementById('image-input').click();
}

function handleImageSelect(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const uploadImagesContainer = document.getElementById('upload-images');
    const maxRemaining = 9 - uploadedImages.length;
    const filesToProcess = Array.from(files).slice(0, maxRemaining);
    
    filesToProcess.forEach((file) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageUrl = e.target.result;
            const imageIndex = uploadedImages.length;
            uploadedImages.push(imageUrl);
            
            const imageBox = document.createElement('div');
            imageBox.className = 'upload-box uploaded';
            imageBox.dataset.index = imageIndex;
            imageBox.innerHTML = `
                <img src="${imageUrl}" alt="上传的图片" class="uploaded-image">
                <span class="delete-icon">✕</span>
            `;
            imageBox.onclick = function() {
                removeUploadedImage(parseInt(this.dataset.index), this);
            };
            
            const addBox = uploadImagesContainer.querySelector('.upload-box:not(.uploaded)');
            if (addBox) {
                uploadImagesContainer.insertBefore(imageBox, addBox);
            } else {
                uploadImagesContainer.appendChild(imageBox);
            }
            
            if (uploadedImages.length >= 9) {
                addBox.style.display = 'none';
            }
        };
        reader.readAsDataURL(file);
    });
    
    event.target.value = '';
}

function removeUploadedImage(index, element) {
    element.remove();
    uploadedImages.splice(index, 1);
    
    const uploadImagesContainer = document.getElementById('upload-images');
    const remainingImages = uploadImagesContainer.querySelectorAll('.upload-box.uploaded');
    remainingImages.forEach((imgBox, i) => {
        imgBox.dataset.index = i;
    });
    
    const addBox = uploadImagesContainer.querySelector('.upload-box:not(.uploaded)');
    if (addBox && uploadedImages.length < 9) {
        addBox.style.display = 'flex';
    }
}

function publishWork() {
    const textarea = document.querySelector('.publish-textarea');
    const description = textarea.value.trim();
    
    if (!description && uploadedImages.length === 0) {
        alert('请输入描述或上传图片');
        return;
    }
    
    const worksList = document.querySelector('.works-list');
    if (!worksList) {
        alert('发布失败，请先进入作品墙');
        return;
    }
    
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    let imagesHtml = '';
    uploadedImages.forEach(imgUrl => {
        imagesHtml += `<img src="${imgUrl}" alt="作品" class="work-image">`;
    });
    
    const newWork = `
        <div class="work-card">
            <div class="work-header">
                <div class="work-avatar">👴</div>
                <div class="work-info">
                    <div class="work-author">我</div>
                    <div class="work-time">${timeStr}</div>
                </div>
            </div>
            <p class="work-desc">${description || '分享了一张作品'}</p>
            ${imagesHtml}
            <div class="work-actions">
                <button class="action-btn like-btn" data-liked="false">🤍 0</button>
                <div class="work-actions-right">
                    <button class="action-btn preset-btn good-btn" data-comment="做的真好">做的真好</button>
                    <button class="action-btn preset-btn" data-comment="继续加油">继续加油</button>
                    <button class="action-btn comment-btn">💬 评论</button>
                </div>
            </div>
            <div class="work-comments"></div>
            <div class="comment-input-wrap" style="display: none;">
                <input type="text" class="comment-input" placeholder="输入评论...">
                <button class="send-comment-btn">发送</button>
            </div>
        </div>
    `;
    
    worksList.insertAdjacentHTML('afterbegin', newWork);
    
    textarea.value = '';
    uploadedImages = [];
    
    const uploadImagesContainer = document.getElementById('upload-images');
    uploadImagesContainer.innerHTML = `
        <div class="upload-box" onclick="triggerFileInput()">
            <span class="upload-plus">+</span>
        </div>
    `;
    
    showPage('works-wall');
    
    initWorkCardEvents();
}

function initWorkCardEvents() {
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.removeEventListener('click', likeBtnHandler);
        btn.addEventListener('click', likeBtnHandler);
    });
    
    document.querySelectorAll('.comment-btn').forEach(btn => {
        btn.removeEventListener('click', commentBtnHandler);
        btn.addEventListener('click', commentBtnHandler);
    });
    
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.removeEventListener('click', presetBtnHandler);
        btn.addEventListener('click', presetBtnHandler);
    });
    
    document.querySelectorAll('.send-comment-btn').forEach(btn => {
        btn.removeEventListener('click', sendCommentBtnHandler);
        btn.addEventListener('click', sendCommentBtnHandler);
    });
}

function likeBtnHandler() {
    const isLiked = this.dataset.liked === 'true';
    const currentText = this.textContent;
    const match = currentText.match(/(\d+)/);
    const count = parseInt(match[1]);
    
    if (isLiked) {
        this.textContent = `🤍 ${count - 1}`;
        this.dataset.liked = 'false';
    } else {
        this.textContent = `❤️ ${count + 1}`;
        this.dataset.liked = 'true';
    }
}

function commentBtnHandler() {
    const workCard = this.closest('.work-card');
    const commentInputWrap = workCard.querySelector('.comment-input-wrap');
    const commentInput = workCard.querySelector('.comment-input');
    
    if (commentInputWrap.style.display === 'none' || commentInputWrap.style.display === '') {
        commentInputWrap.style.display = 'flex';
        commentInput.focus();
    } else {
        commentInputWrap.style.display = 'none';
    }
}

function presetBtnHandler() {
    const commentText = this.dataset.comment;
    const workCard = this.closest('.work-card');
    const commentsContainer = workCard.querySelector('.work-comments');
    
    const newComment = document.createElement('p');
    newComment.innerHTML = `<span class="comment-author">我：</span>${commentText}`;
    commentsContainer.appendChild(newComment);
}

function sendCommentBtnHandler() {
    const commentInput = this.previousElementSibling;
    const commentText = commentInput.value.trim();
    
    if (commentText) {
        const workCard = this.closest('.work-card');
        const commentsContainer = workCard.querySelector('.work-comments');
        
        const newComment = document.createElement('p');
        newComment.innerHTML = `<span class="comment-author">我：</span>${commentText}`;
        commentsContainer.appendChild(newComment);
        
        commentInput.value = '';
    }
}

function toggleSwitch(element) {
    const toggle = element.querySelector('.toggle-switch');
    if (toggle.classList.contains('on')) {
        toggle.classList.remove('on');
        toggle.classList.add('off');
    } else {
        toggle.classList.remove('off');
        toggle.classList.add('on');
    }
}

function editGroupInfo(type) {
    const labels = {
        'group-name': '群聊名称',
        'group-notice': '群聊公告',
        'group-note': '备注',
        'group-nickname': '我在群里的昵称'
    };
    
    const valueElements = {
        'group-name': document.getElementById('group-name-value'),
        'group-notice': document.getElementById('group-notice-value'),
        'group-note': document.getElementById('group-note-value'),
        'group-nickname': document.getElementById('group-nickname-value')
    };
    
    const currentValue = valueElements[type]?.textContent || '';
    const newValue = prompt(`请输入${labels[type]}：`, currentValue);
    
    if (newValue !== null) {
        const trimmedValue = newValue.trim();
        if (valueElements[type]) {
            valueElements[type].textContent = trimmedValue;
            
            if (type === 'group-name' && trimmedValue) {
                const oldGroupName = currentGroupName;
                currentGroupName = trimmedValue;
                document.getElementById('chat-title').textContent = trimmedValue;
                
                const myGroupItems = document.querySelectorAll('.my-group-item');
                myGroupItems.forEach(item => {
                    const groupNameElement = item.querySelector('.my-group-name');
                    if (groupNameElement.textContent === oldGroupName) {
                        groupNameElement.textContent = trimmedValue;
                    }
                });
            }
        }
    }
}

function exitGroup() {
    const groupName = document.getElementById('group-name-value').textContent;
    if (confirm(`确定要退出「${groupName}」吗？退出后将不再接收该群消息。`)) {
        const myGroupItems = document.querySelectorAll('.my-group-item');
        myGroupItems.forEach(item => {
            const groupNameElement = item.querySelector('.my-group-name');
            if (groupNameElement.textContent === groupName || groupNameElement.textContent === currentGroupName) {
                item.remove();
            }
        });
        
        showPage('my-groups');
        alert('已成功退出群聊');
    }
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

function filterGroups() {
    const tagFilter = document.getElementById('tag-filter').value;
    const locationFilter = document.getElementById('location-filter').value;
    
    document.querySelectorAll('.group-card').forEach(card => {
        const cardTag = card.dataset.tag;
        const cardLocation = card.dataset.location;
        
        const tagMatch = tagFilter === 'all' || cardTag === tagFilter;
        const locationMatch = locationFilter === 'all' || cardLocation === locationFilter;
        
        if (tagMatch && locationMatch) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
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

    document.getElementById('tag-filter').addEventListener('change', filterGroups);
    document.getElementById('location-filter').addEventListener('change', filterGroups);

    

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
                
                if (groupName.includes(keyword)) {
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



