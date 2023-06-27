<script lang="ts" setup>
import { io } from 'socket.io-client';
import { onBeforeMount, ref } from 'vue';

const socket = io('http://localhost:8080');

const messages = ref([]); // tìm tin nhắn, hiển thị, cập nhật tin nhắn trên giao diện
const messageText = ref(''); // client gửi tin nhắn
const joined = ref(false); // client tham gia room
const name = ref(''); //
const typingDisplay = ref('');

onBeforeMount(() => {
    // Tìm tất cả tin nhắn
    socket.emit('findAllMessages', {}, (response) => {
        messages.value = response;
    });

    // Cập nhật tin nhắn trên giao diện bất cứ khi nào có tin nhắn mới
    socket.on('message', (message) => {
        messages.value.push(message);
    });

    // trạng thái typing
    socket.on('typing', ({ name, isTyping }) => {
        if (isTyping) {
            typingDisplay.value = `${name} is typing...`;
        } else {
            typingDisplay.value = '';
        }
    });
});

const join = () => {
    socket.emit('join', { name: name.value }, () => {
        // () ở trên có thể là (names) của mọi người đã tham gia phòng chat
        joined.value = true;
    });
};

// client có thể tự gửi tin nhắn
const sendMessage = () => {
    socket.emit('createMessage', { text: messageText.value }, (response) => {
        messageText.value = '';
    });
};

// 1 client gửi thông tin đang gõ cho mọi người biết
let timeout;
const emitTyping = () => {
    socket.emit('typing', { isTyping: true });
    // Sau một thời gian không nhập nữa thì sẽ thông báo hết trạng thái typing
    // ==> cần xác định một số loại hành vi thoát để client đang nhập sẽ phát ra 'typing'
    // còn khi ngừng nhập một vài giây nó sẽ phát ra isTyping: false
    timeout = setTimeout(() => {
        socket.emit('typing', { isTyping: false });
    }, 2000);
};
</script>

<template>
    <div class="chat">
        <div v-if="!joined">
            <form @submit.prevent="join">
                <!-- kích hoạt phương thức join khi nhấn submit -->
                <label>What's your name?</label>
                <input v-model="name" />
                <!-- name từ: const name = ref('');  -->
                <button type="submit">Send</button>
            </form>
        </div>

        <div class="chat-container" v-else>
            <div class="messages-container">
                <!-- Lặp lại các tin nhắn mà ta có ở trạng thái của mình. Nếu mọi thứ hoạt động bình thường
                    khi chúng ta kết nối với máy chủ thì  'findAllMessages' sẽ phát ra tin nhắn cuối cùng
                -->
                <div v-for="message in messages">
                    [{{ message.name }}]: {{ message.text }}
                </div>
            </div>
        </div>

        <!-- Hiển thị 'typing' -->
        <div v-if="typingDisplay">
            {{ typingDisplay }}
        </div>

        <hr />

        <div class="message-input">
            <form @submit.prevent="sendMessage">
                <label for="">Message: </label>
                <input v-model="messageText" @input="emitTyping" />
                <!-- @input="emitTyping" khi nhập input thì sẽ phát typing-->
                <button type="submit">Send</button>
            </form>
        </div>
    </div>
</template>

<style scoped>
@import './assets/base.css';
.chat {
    padding: 20px;
    height: 100vh;
}

.chat-container {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.message-container {
    flex: 1;
}
</style>
