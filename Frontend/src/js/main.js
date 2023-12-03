import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../firebase.js';

const provider = new GoogleAuthProvider();
const txtMessageElm = document.querySelector("#txt-message");
const btnSendElm = document.querySelector("#btn-send");
const btnSignInElm = document.querySelector("#btn-sign-in");
const outputElm = document.querySelector("#output");
const loginOverlayElm = document.querySelector("#login-overlay");
const accountElm = document.querySelector("#account");
const userNameElm = document.querySelector("#user-name");
const userEmailElm = document.querySelector("#user-email");
const btnSignOutElm = document.querySelector("#btn-sign-out");
const loaderElm = document.querySelector("#loader");
const { API_BASE_URL } = process.env;

const user = {
    email:null,
    name: null,
    picture:null
};
let ws = null;
accountElm.addEventListener('click', (e)=> {
    accountElm.querySelector("#account-details")
        .classList.remove('d-none');
    e.stopPropagation();
});

document.addEventListener('click', ()=> {
    accountElm.querySelector("#account-details")
        .classList.add('d-none');
});
btnSignOutElm.addEventListener('click', (e)=> {
    accountElm.querySelector("#account-details")
        .classList.add('d-none');
    e.stopPropagation();
    signOut(auth);
});
onAuthStateChanged(auth, (loggedUser) => {
    loaderElm.classList.add('d-none');
    if (loggedUser){
        user.email = loggedUser.email;
        user.name = loggedUser.displayName;
        user.picture = loggedUser.photoURL;
        finalizeLogin();
        loginOverlayElm.classList.add('d-none');
        if (!ws){
            ws = new WebSocket(`${API_BASE_URL}/messages`);
            ws.addEventListener('message', loadNewChatMessages);
            ws.addEventListener('error', ()=>{
                alert("Connection failure, try refreshing the application");
            });
        }
    } else{
        user.email = null;
        user.name = null;
        user.picture = null;
        loginOverlayElm.classList.remove('d-none');
        if (ws){
            ws.close();
            ws = null;
        } 
    }
});
btnSignInElm.addEventListener('click', () => {
    signInWithPopup(auth, provider)
        .then(res => {
            user.name = res.user.displayName;
            user.email = res.user.email;
            user.picture = res.user.photoURL;
            loginOverlayElm.classList.add('d-none');
            finalizeLogin();
        }).catch(err => alert("Failed to sign in"));
});
function finalizeLogin(){
    userNameElm.innerText = user.name;
    userEmailElm.innerText = user.email;
    accountElm.style.backgroundImage = `url(${user.picture})`;
}
btnSendElm.addEventListener('click', () => {
    const message = txtMessageElm.value.trim();
    if (!message) return;

    const msgObj = { 
        message,
        email: user.email,
        senderPicture: user.picture,
        senderName:user.name
    };

    ws.send(JSON.stringify(msgObj));
    addChatMessageRecord(msgObj);
    outputElm.scrollTo(0, outputElm.scrollHeight);
    txtMessageElm.value = '';
    txtMessageElm.focus();

});
// Load messages from local storage
function loadMessagesFromLocalStorage() {
    const storedMessages = localStorage.getItem('chatMessages');
    return storedMessages ? JSON.parse(storedMessages) : [];
}

// Function to initialize the chat with stored messages
function initializeChat() {
    const storedMessages = loadMessagesFromLocalStorage();

   
   outputElm.innerHTML = '';

   
   const uniqueMessages = [];

   storedMessages.forEach((msg) => {
       
       if (!isMessageInOutput(msg, uniqueMessages)) {
           uniqueMessages.push(msg);
           addChatMessageRecord(msg, msg.isSent);
       }
   });
}
function isMessageInOutput(message, messagesArray) {
    return messagesArray.some((msg) => (
        msg.message === message.message &&
        msg.email === message.email &&
        msg.senderPicture === message.senderPicture &&
        msg.senderName === message.senderName &&
        msg.isSent === message.isSent
    ));
}

// Call the initializeChat function when the page loads
window.addEventListener('load', initializeChat);

// Function to save messages to local storage
function saveMessagesToLocalStorage(messages) {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
}

function addChatMessageRecord({message, email, senderPicture, senderName}, isSent=true) {
    const messageElm = document.createElement('div');
    messageElm.classList.add('message');

    const isMe = email === user.email;

    const messageContentElm = document.createElement('div');
    messageContentElm.classList.add('message-content');
    const senderDetails = document.createElement('div');

    if(!isSent){
        const proPicElm = document.createElement('img');
        proPicElm.src = senderPicture;
        proPicElm.alt = 'profile-picture';
        proPicElm.classList.add('pro-pic');
        messageContentElm.appendChild(proPicElm);

        const senderNameElm = document.createElement('div');
        senderNameElm.classList.add('sender-name');
        const names = senderName.split(' ');
        senderNameElm.innerText = names[0];
        senderDetails.appendChild(senderNameElm);
    }
   
    const textContainerElm = document.createElement('div');
    textContainerElm.classList.add('text-container');

    textContainerElm.innerText = message;
    senderDetails.appendChild(textContainerElm);
    messageContentElm.appendChild(senderDetails);
    messageElm.appendChild(messageContentElm);

    if(isSent){
        messageElm.classList.add('me');
    }else {
        messageElm.classList.add('others');
    }
    outputElm.appendChild(messageElm);
    outputElm.scrollTo(0, outputElm.scrollHeight);

    const storedMessages = loadMessagesFromLocalStorage();
    storedMessages.push({ message, email, senderPicture, senderName, isSent });
    saveMessagesToLocalStorage(storedMessages);
    
  
}
// Function to handle a new chat message
function handleNewChatMessage(msg) {
    addChatMessageRecord(msg, false);

   
   const storedMessages = loadMessagesFromLocalStorage();
   storedMessages.push({ ...msg, isSent: false });
   saveMessagesToLocalStorage(storedMessages);

    outputElm.scrollTo(0, outputElm.scrollHeight);
}


function loadNewChatMessages(e){
    const msg = JSON.parse(e.data);
    // addChatMessageRecord({
    //     message: msg.message,
    //     email: msg.email,
    //     senderPicture: msg.senderPicture,
    //     senderName: msg.senderName
    // });
   
    handleNewChatMessage(msg);
}