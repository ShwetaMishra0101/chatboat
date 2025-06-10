const replies = [
    "how are you",
    "what are you doing",
    "where are you",
]


// write a function which return randomly any reply
export function getRandomReply() {
    return replies[Math.floor(Math.random() * replies.length)];
}
