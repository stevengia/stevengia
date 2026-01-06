// chat.js - AI Chat Assistant

let chatOpen = false;

// Initialize chat widget when page loads
function initChatWidget() {
    const chatHTML = `
        <div id="chat-widget" style="position: fixed; bottom: 30px; right: 30px; z-index: 10000; font-family: inherit;">
            <!-- Chat Toggle Button -->
            <button id="chat-toggle" style="
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #7877c6 0%, #ec4899 100%);
                border: none;
                color: white;
                font-size: 28px;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(120, 119, 198, 0.4);
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                💬
            </button>
            
            <!-- Chat Container -->
            <div id="chat-container" style="
                display: none;
                width: 380px;
                height: 550px;
                background: rgba(10, 10, 10, 0.98);
                backdrop-filter: blur(20px);
                border-radius: 24px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                position: absolute;
                bottom: 80px;
                right: 0;
                flex-direction: column;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                overflow: hidden;
            ">
                <!-- Chat Header -->
                <div style="
                    padding: 20px;
                    background: linear-gradient(135deg, rgba(120, 119, 198, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                ">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="
                            width: 40px;
                            height: 40px;
                            border-radius: 50%;
                            background: linear-gradient(135deg, #7877c6 0%, #ec4899 100%);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 20px;
                        ">🤖</div>
                        <div>
                            <h3 style="margin: 0; font-size: 1.1em; color: white;">Ask me anything!</h3>
                            <p style="margin: 3px 0 0 0; font-size: 0.85em; color: rgba(255,255,255,0.6);">Powered by Claude AI</p>
                        </div>
                    </div>
                </div>
                
                <!-- Chat Messages -->
                <div id="chat-messages" style="
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                ">
                    <div style="
                        padding: 12px 16px;
                        border-radius: 12px;
                        background: rgba(255, 255, 255, 0.05);
                        border-left: 3px solid #7877c6;
                        font-size: 0.9em;
                        color: rgba(255,255,255,0.8);
                        line-height: 1.5;
                    ">
                        👋 Hi! I'm an AI assistant trained on Steven's background. Ask me about his experience, skills, or athletic achievements!
                    </div>
                </div>
                
                <!-- Chat Input -->
                <div style="
                    padding: 15px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    gap: 10px;
                    background: rgba(0, 0, 0, 0.3);
                ">
                    <input 
                        id="chat-input" 
                        type="text" 
                        placeholder="Ask about experience, skills..." 
                        style="
                            flex: 1;
                            padding: 12px 16px;
                            border-radius: 20px;
                            border: 1px solid rgba(255, 255, 255, 0.2);
                            background: rgba(255, 255, 255, 0.05);
                            color: white;
                            font-size: 0.9em;
                            outline: none;
                        "
                    >
                    <button id="chat-send" style="
                        padding: 12px 24px;
                        border-radius: 20px;
                        border: none;
                        background: linear-gradient(135deg, #7877c6 0%, #ec4899 100%);
                        color: white;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    ">Send</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', chatHTML);
    
    // Add event listeners
    document.getElementById('chat-toggle').addEventListener('click', toggleChat);
    document.getElementById('chat-send').addEventListener('click', sendMessage);
    document.getElementById('chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    
    // Add hover effect to toggle button
    const toggleBtn = document.getElementById('chat-toggle');
    toggleBtn.addEventListener('mouseenter', () => {
        toggleBtn.style.transform = 'scale(1.1)';
        toggleBtn.style.boxShadow = '0 6px 30px rgba(120, 119, 198, 0.6)';
    });
    toggleBtn.addEventListener('mouseleave', () => {
        toggleBtn.style.transform = 'scale(1)';
        toggleBtn.style.boxShadow = '0 4px 20px rgba(120, 119, 198, 0.4)';
    });
}

function toggleChat() {
    const container = document.getElementById('chat-container');
    chatOpen = !chatOpen;
    container.style.display = chatOpen ? 'flex' : 'none';
    
    // Change button icon
    document.getElementById('chat-toggle').textContent = chatOpen ? '✕' : '💬';
    
    // Focus input when opened
    if (chatOpen) {
        document.getElementById('chat-input').focus();
    }
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const question = input.value.trim();
    
    if (!question) return;
    
    // Add user message
    addMessage(question, 'user');
    input.value = '';
    
    // Show typing indicator
    const typingId = addTypingIndicator();
    
    try {
        // Call your backend API
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ question })
        });
        
        const data = await response.json();
        
        // Remove typing indicator
        removeTypingIndicator(typingId);
        
        if (data.success) {
            addMessage(data.answer, 'assistant');
        } else {
            addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
        }
        
    } catch (error) {
        removeTypingIndicator(typingId);
        addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
        console.error('Chat error:', error);
    }
}

function addMessage(text, sender) {
    const messagesDiv = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    
    const isUser = sender === 'user';
    
    messageDiv.style.cssText = `
        padding: 12px 16px;
        border-radius: 12px;
        max-width: 85%;
        font-size: 0.9em;
        line-height: 1.5;
        word-wrap: break-word;
        ${isUser 
            ? `
                background: linear-gradient(135deg, #7877c6 0%, #ec4899 100%);
                color: white;
                margin-left: auto;
                text-align: right;
                border-bottom-right-radius: 4px;
            ` 
            : `
                background: rgba(255, 255, 255, 0.05);
                color: rgba(255, 255, 255, 0.9);
                margin-right: auto;
                border-bottom-left-radius: 4px;
                border-left: 3px solid #7877c6;
            `
        }
    `;
    
    messageDiv.textContent = text;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function addTypingIndicator() {
    const messagesDiv = document.getElementById('chat-messages');
    const typingDiv = document.createElement('div');
    const typingId = 'typing-' + Date.now();
    typingDiv.id = typingId;
    
    typingDiv.style.cssText = `
        padding: 12px 16px;
        border-radius: 12px;
        max-width: 85%;
        font-size: 0.9em;
        background: rgba(255, 255, 255, 0.05);
        margin-right: auto;
        border-left: 3px solid #7877c6;
        display: flex;
        gap: 4px;
        align-items: center;
    `;
    
    typingDiv.innerHTML = `
        <span style="color: rgba(255,255,255,0.6);">Thinking</span>
        <span class="dot" style="animation: blink 1.4s infinite;">.</span>
        <span class="dot" style="animation: blink 1.4s infinite 0.2s;">.</span>
        <span class="dot" style="animation: blink 1.4s infinite 0.4s;">.</span>
    `;
    
    // Add blink animation
    if (!document.getElementById('chat-animations')) {
        const style = document.createElement('style');
        style.id = 'chat-animations';
        style.textContent = `
            @keyframes blink {
                0%, 60%, 100% { opacity: 0; }
                30% { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    messagesDiv.appendChild(typingDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    return typingId;
}

function removeTypingIndicator(typingId) {
    const typingDiv = document.getElementById(typingId);
    if (typingDiv) {
        typingDiv.remove();
    }
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', initChatWidget);