document.getElementById('userInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();  // Prevent default form submission which reloads the page
        sendMessage();
    }
});
async function sendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value.trim();
    if (message === '') return;

    const dryRun = document.getElementById('dryRun').checked;

    // Display user message immediately
    const chatBox = document.getElementById('chatBox');
    createBubble(message, 'user');
    scrollChatToBottom();

    input.value = ''; // Clear input field immediately after sending
    input.focus(); // Focus the input field for the next message

    // Show typing indicator
    let typingIndicator = createBubble("", 'typing');
    scrollChatToBottom();

    if (dryRun) {
        setTimeout(() => {
            chatBox.removeChild(typingIndicator);
            createBubble("I'm a chat bot!", 'bot');
            scrollChatToBottom();
        }, 2000);
    } else {
        try {
            // Simulate a short delay before making the API call
            setTimeout(async () => {
                const response = await fetch('/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId: 'your-session-id', message: message, dryRun: false })
                });
                const data = await response.json();

                // Remove typing indicator and show bot response
                chatBox.removeChild(typingIndicator);
                createBubble(data.reply, 'bot');
                scrollChatToBottom();
            }, 2000); // This delay simulates typing and processing time
        } catch (error) {
            console.error('Error with OpenAI API:', error);
            chatBox.removeChild(typingIndicator);
            createBubble('Failed to fetch response from OpenAI.', 'bot');
            scrollChatToBottom();
        }
    }
}

function createBubble(text, className) {
    let bubble = document.createElement('div');
    bubble.className = `chat-bubble ${className}`;
    bubble.textContent = text;
    chatBox.appendChild(bubble);
    return bubble;
}

function scrollChatToBottom() {
    const chatBox = document.getElementById('chatBox');
    chatBox.scrollTop = chatBox.scrollHeight;
}
