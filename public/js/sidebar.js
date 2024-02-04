// CHAT ROOM PAGE logic
window.addEventListener(`load`, fetchOwnedChats);
window.addEventListener(`load`, fetchOtherChats);

const yourChatsUl = document.getElementById(`your-chats-ul`);
const otherChatsUl = document.getElementById(`other-chats-ul`);
const chatUl = document.getElementById(`chat-ul`);
const chatInput = document.getElementById(`chat-input`);
const chatForm = document.getElementById(`chat-form`);
const logoutBtn = document.getElementById(`logout-btn`);
const addUserForm =  document.getElementById(`add-user-form`)
const chatMessages = document.getElementById(`chat-messages`);
const chatPageLogo = document.getElementById(`chat-page-logo`);
const newConvoForm =  document.getElementById(`new-convo-form`);
const ConvoInput = document.getElementById(`convo-input`);
const usernameInput = document.getElementById(`username-input`);
const chatContainer = document.getElementById(`chat-container`);

// set chat container to not display by default
chatMessages.style.display = `none`;
chatForm.style.display = `none`;
chatPageLogo.style.display = `flex`;

const conversationNameHeading = document.getElementById(`conversation-name-heading`);
const deleteConvBtn = document.getElementById(`delete-conv-btn`);

deleteConvBtn.style.display = `none`;

currentSess = sessionStorage.getItem(`userId`);

// gets all conversations the user owns
function fetchOwnedChats() {
fetch(`/api/conversations/owner`, {
    method: `GET`,
    headers: {
        "Content-Type": "application/json",
    },

}).then(res => res.json())
    .then(res => {
        console.log(res)
        // calls render your chats function
        renderYourChats(res);
    }).catch(err => {
        console.error(err);
    });
}

// render other chats function
// renders chats user owns 
function renderYourChats(chats) {
    if (chats) {
        chats.forEach(item => {
            if (item.ownerId == currentSess) {
                const yourChatsLi = document.createElement(`li`);
                yourChatsLi.textContent = `${item.conversation_name}`;
                yourChatsLi.classList.add(`conversation-li`, `box`, `p-3`, `m-2`);
                yourChatsLi.addEventListener('click', () => conversationClick(item.conversation_name, item.id, item.owner_id));
                yourChatsUl.appendChild(yourChatsLi);
            }
        });
    }
}

let currentConversationId;
let lastConvo;
// Event handler for clicking on the conversation
// DO NOT REMOVE UNUSED CONVERSATION ID, will break for witchcraft reasons
function conversationClick(conversationName, roomId, ownerId) {
    currentConversationId = roomId;
    lastConvo = roomId;
    // set chat container to show up when conversation is clicked
    chatPageLogo.style.display = `none`;
    chatMessages.style.display = `block`;
    chatForm.style.display = `block`;
    console.log(`roomId:` + roomId);
    conversationNameHeading.textContent = conversationName;
    // calls fetch messages function
    fetchMessages(roomId);
    // calls socket setup function
    socket = socketSetup(roomId, lastConvo);
    // creates event listener on the chat form calls submit form function
    
    if (ownerId == currentSess) {
        deleteConvBtn.style.display = `inline-block`
    } else {
        deleteConvBtn.style.display = `none`
    }
}

chatForm.addEventListener(`submit`, (e) => submitForm(e, currentConversationId, socket));
// submit form function
// calls save message function
function submitForm(e, roomId, socket) {
    e.preventDefault();
    const currentDay = dayjs();
    const currentDayFormatted = currentDay.format(`YYYY-MM-DD hh:mm:ss A`)
    saveMessage(chatInput.value, roomId, socket, currentDayFormatted)
}

// fetch messages function
// issues get request to server to get all messages in the conversation
let currentRoomId;
function fetchMessages(roomId) {
    currentRoomId = roomId;
    fetch(`/api/messages/inconvo/${roomId}`, {
        method: `GET`,
        headers: {
            "Content-Type": "application/json",
        },

    }).then(res => res.json())
        .then(res => {
            const userId = res.userId
            const dbConversation = res.dbConversation
            console.log(res)
            console.log(userId)
            // calls render messages function
            renderMessages(dbConversation, userId);
        }).catch(err => {
            console.error(err);
        });

}

// render messages function
// renders historical messages in the chat window
function renderMessages(chats, userId) {
    chatUl.innerHTML = ``;
    const sessionId = sessionStorage.getItem(`userId`);
    console.log(`session Id: ${sessionId}`);
    if (chats) {
        chats.forEach(item => {
            const yourMessagesLi = document.createElement(`li`);
            console.log(`message userId: ${item.userId}`)
            if (sessionId == item.userId) {
                yourMessagesLi.classList.add(`outgoingMsg`, `column`, `box`);
            } else {
                yourMessagesLi.classList.add(`incomingMsg`, `column`, `box`);
            }
            yourMessagesLi.innerHTML = `<strong>${item.user.username}</strong> <br>${item.content} <br><em>${item.nice_date}</em>`
            chatUl.appendChild(yourMessagesLi);
            yourMessagesLi.scrollIntoView(true);
        });
    }
}
let socket;
// socket setup function
// sets up socket initialization
function socketSetup(roomId, lastConvo) {
    if (!socket) {
        socket = io(window.location.origin);

        // Event listener for successful connection
        socket.on(`connect`, () => {
            console.log(`Connected to server`);
        });

        // Event listener for room joining
        socket.off(`join room`);
        socket.on(`join room`, (room) => {
            console.log(`joined room: `, room);
        });

        // Event listener for incoming messages
        socket.off(`chat message`);
        socket.on(`chat message`, (msg, socketSenderId, currentDayFormatted, senderUser) => {
            console.log(`Message from server:`, msg, socketSenderId);
            // Display the message on the page
            renderLive(msg, socketSenderId, currentDayFormatted, senderUser);
        });
    }
        // Emit the 'join room' event
        socket.emit(`join room`, roomId, lastConvo);
    
    return socket;
}

// renderlive function
// renders messages recieved by socket live onto the page
function renderLive(msg, socketSenderId, currentDayFormatted, senderUser) {
    const currentSessionId = sessionStorage.getItem(`userId`);
    const currentUsername = sessionStorage.getItem(`username`);
    const chatLi = document.createElement(`li`);
    if (socketSenderId === currentSessionId) {
        chatLi.classList.add(`outgoingMsg`, `column`, `box`);
    } else {
        chatLi.classList.add(`incomingMsg`, `column`, `box`);
    }
    chatLi.innerHTML = `<strong>${senderUser}</strong> <br>${msg} <br><em>${currentDayFormatted}</em>`
    chatUl.appendChild(chatLi);
    chatInput.value = ``;
    chatLi.scrollIntoView(true);
}

// send message function
// sends a message to the server
function sendMessage(socket, message, conversationId, socketSessionId, currentDayFormatted, senderUser) {
    if (socket.connected) {
        socket.emit(`chat message`, message, conversationId, socketSessionId, currentDayFormatted, senderUser);
        console.log(`message sent to server`, message);
    } else {
        console.log(`socket not connected`);
    }

}

// save messsage function
// issues a post request to the server to save messages in the database
function saveMessage(msg, conversationId, socket, currentDayFormatted) {
    console.log(`roomId save message: ${conversationId}`);
    const socketSessionId = sessionStorage.getItem(`userId`);
    const senderUser = sessionStorage.getItem(`username`);
    
    const message = {
        content: msg,
        conversation_id: conversationId,
        nice_date: currentDayFormatted
    }

    fetch(`/api/messages`, {
        method: `POST`,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
    }).then(res => res.json())
        .then(res => {
            // calls send message function
            sendMessage(socket, msg, conversationId, socketSessionId, currentDayFormatted, senderUser);
        }).catch(err => {
            console.error(err);
        });
}

// event listener for the logout button
logoutBtn.addEventListener(`click`, () => logout());

// logout function
// issues delete request to the server to log user out (destroy session data)
function logout() {
    fetch(`/api/users/logout`, {
        method: `DELETE`,
        headers: {
            "Content-Type": "application/json",
        },

    }).then(res => res.json())
        .then(res => {
            window.location.reload();
        }).catch(err => {
            console.error(err);
        });
}

// fetches the conversations the user is in but does not own
function fetchOtherChats() {
    fetch(`/api/conversations/isin`, {
        method: `GET`,
        headers: {
            "Content-Type": "application/json",
        },
    
    }).then(res => res.json())
        .then(res => {
            console.log(res)
            // calls render other chats function
            renderOtherChats(res);
        }).catch(err => {
            console.error(err);
        });
}

// render other chats function
// renders chats user is in but does not own
function renderOtherChats(chats) {
    console.log(chats)
    if (chats) {
        chats.forEach(item => {
            if (item.owner_id != currentSess) {
                const otherChatsLi = document.createElement(`li`);
                otherChatsLi.textContent = `${item.conversation_name}`
                otherChatsLi.classList.add(`conversation-li`, `box`, `p-3`, `m-2`);
                otherChatsLi.addEventListener('click', () => conversationClick(item.conversation_name, item.id, item.owner_id));
                otherChatsUl.appendChild(otherChatsLi);
            }
        });
    }
}

// Event listener for the delete conversation button
deleteConvBtn.addEventListener(`click`, () => deleteConversation(currentRoomId));

// delete conversation function
// issues a delete request to  the current room open
function deleteConversation(convId) {
    console.log(convId)
    fetch(`/api/conversations/${convId}`, {
        method: `DELETE`,
        headers: {
            "Content-Type": "application/json",
        },

    }).then(res => res.json())
        .then(res => {
            location.reload();
        }).catch(err => {
            console.error(err);
        });
}


newConvoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const conversationName = ConvoInput.value.trim(); // Trim to remove any leading/trailing white spaces
    if (conversationName === '') {
        alert('Conversation name cannot be empty!'); //alert if the name is empty
    } else {
        createConversation(conversationName); // Proceed with creation if name is not empty
    }
});
function createConversation(conversation_name) {
    console.log(conversation_name);
    const requestBody = {
        conversation_name:conversation_name
    }
    fetch(`/api/conversations`, {
        method: `POST`,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
    }).then(res => res.json())
        .then(res => {
            location.reload();
        }).catch(err => {
            console.error(err);
        });
    }
    
// event listener for add user form
addUserForm.addEventListener(`submit`, (e) => {
    e.preventDefault();
    addUser(usernameInput.value);
});

function addUser(username) {
    const requestBody = {
        username: username,
        conversationId: currentConversationId
    }
    fetch(`/api/conversations/addUser`, {
        method: `POST`,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
    }).then(res => res.json())
        .then(res => {
            location.reload();
        }).catch(err => {
            console.error(err);
        });

}

