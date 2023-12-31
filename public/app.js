
document.addEventListener('DOMContentLoaded', function () {
    // Existing code
    let intervalId; // Declare this at the top of your file

    // Function to handle the "Talk" action
    function triggerTalk() {
        clearInterval(intervalId); // Stop the random clipping

        let talkImages = ["image_animation/closed.png", "image_animation/open.jpg"];
        let count = 0;

        let talkInterval = setInterval(function () {
            if (count >= 6) {
                clearInterval(talkInterval); // Stop the swapping
                startRandomClipping(); // Restart the random clipping
                return;
            }
            // Assuming you have a dedicated img element for this in your /public/image-animation/index.html
            document.getElementById("image").src = talkImages[count % 2];
            count++;
        }, 300);
    }

    // Function to start random clipping
    function startRandomClipping() {
        let images = ["image_animation/close.png", "image_animation/left.png", "image_animation/right.png"];
        console.log("IMAGEAS ARE:" + images);
        intervalId = setInterval(function () {
            const randomIndex = Math.floor(Math.random() * images.length);
            const randomTime = Math.random() * (0.5 - 0.1) + 0.1; // Between 0.1 and 0.5 seconds
            // Assuming you have a dedicated img element for this in your /public/image-animation/index.html
            document.getElementById("image").src = images[randomIndex];
            setTimeout(() => { }, randomTime * 1000);
        }, 500);
    }

    // Start the random clipping when the script loads
    startRandomClipping();



    // END IMAGE ANIMATION

    let backendUrl = location.protocol === 'file:' ? "https://tiktok-chat-reader.zerody.one/" : undefined;
    let connection = new TikTokIOConnection(backendUrl);

    let viewerCount = 0;
    let likeCount = 0;
    let diamondsCount = 0;

    if (!window.settings) window.settings = {};

    $(document).ready(() => {
        $('#connectButton').click(connect);
        $('#uniqueIdInput').on('keyup', function (e) {
            if (e.key === 'Enter') {
                connect();
            }
        });

        if (window.settings.username) connect();
    })

    function connect() {
        let uniqueId = window.settings.username || $('#uniqueIdInput').val();
        if (uniqueId !== '') {
            $('#stateText').text('Connecting...');
            connection.connect(uniqueId, {
                enableExtendedGiftInfo: true
            }).then(state => {
                $('#stateText').text(`Connected to roomId ${state.roomId}`);
                viewerCount = 0;
                likeCount = 0;
                diamondsCount = 0;
                updateRoomStats();
            }).catch(errorMessage => {
                $('#stateText').text(errorMessage);
                if (window.settings.username) {
                    setTimeout(() => {
                        connect(window.settings.username);
                    }, 30000);
                }
            })
        } else {
            alert('no username entered');
        }
    }

    function sanitize(text) {
        return text.replace(/</g, '&lt;');
    }

    function updateRoomStats() {
        $('#roomStats').html(`Viewers: <b>${viewerCount.toLocaleString()}</b> Likes: <b>${likeCount.toLocaleString()}</b> Earned Diamonds: <b>${diamondsCount.toLocaleString()}</b>`);
    }

    function generateUsernameLink(data) {
        return `<a class="usernamelink" href="https://www.tiktok.com/@${data.uniqueId}" target="_blank">${data.uniqueId}</a>`;
    }

    function isPendingStreak(data) {
        return data.giftType === 1 && !data.repeatEnd;
    }

    function animateGiftItem(data) {
        let repeatCount = data.repeatCount ? data.repeatCount : 1
        const diamondValue = (data.diamondCount * repeatCount);
        if (diamondValue > 4) {
            const uniqueId = data.uniqueId;
            const element = $(`.${uniqueId}`);

            // Save old styles to revert back later
            const oldBackgroundColor = element.css('background-color');
            const oldBorderColor = element.css('border');

            // Set the new styles
            element.css({
                'background-color': 'orange',
                'border': '2px solid red'
            });

            // Animate the growth to 200%
            element.animate({ fontSize: "200%" }, 1500, function () {
                // Pause for 2 seconds while keeping the element at 200%
                setTimeout(() => {
                    // Shrink back to original size and restore old styles
                    element.animate({ fontSize: "100%" }, 1000, function () {
                        element.css({
                            'background-color': oldBackgroundColor,
                            'border': oldBorderColor
                        });
                    });
                }, 2000);
            });
        }
    }

    function addChatItem(color, data, text, summarize) {
        let container = location.href.includes('obs.html') ? $('.eventcontainer') : $('.chatcontainer');
        if (container.find('div').length > 500) {
            container.find('div').slice(0, 200).remove();
        }
        container.find('.temporary').remove();
        container.append(`
        <div class=${summarize ? 'temporary' : 'static'}>
            <img class="miniprofilepicture" src="${data.profilePictureUrl}">
            <span>
                <b>${generateUsernameLink(data)}:</b> 
                <span style="color:${color}">${sanitize(text)}</span>
            </span>
        </div>
    `);
        container.stop();
        container.animate({
            scrollTop: container[0].scrollHeight
        }, 400);
    }

    function addGiftItem(data) {
        let container = location.href.includes('obs.html') ? $('.eventcontainer') : $('.giftcontainer');
        if (container.find('div').length > 200) {
            container.find('div').slice(0, 100).remove();
        }
        let streakId = data.userId.toString() + '_' + data.giftId;
        let html = `
        <div data-streakid=${isPendingStreak(data) ? streakId : ''} class="${data.uniqueId}">
            <img class="miniprofilepicture" src="${data.profilePictureUrl}">
            <span>
                <b>${generateUsernameLink(data)}:</b> <span>${data.describe}</span><br>
                <div>
                    <table>
                        <tr>
                            <td><img class="gifticon" src="${data.giftPictureUrl}"></td>
                            <td>
                                <span>Name: <b>${data.giftName}</b> (ID:${data.giftId})<span><br>
                                <span>Repeat: <b style="${isPendingStreak(data) ? 'color:red' : ''}">x${data.repeatCount.toLocaleString()}</b><span><br>
                                <span>Cost: <b>${(data.diamondCount * data.repeatCount).toLocaleString()} Diamonds</b><span>
                            </td>
                        </tr>
                    </table>
                </div>
            </span>
        </div>
    `;
        let existingStreakItem = container.find(`[data-streakid='${streakId}']`);
        if (existingStreakItem.length) {
            existingStreakItem.replaceWith(html);
        } else {
            container.append(html);
        }
        container.stop();
        container.animate({
            scrollTop: container[0].scrollHeight
        }, 800);

        // Animate the gift item if the condition is met
        animateGiftItem(data);
    }

    connection.on('roomUser', (msg) => {
        if (typeof msg.viewerCount === 'number') {
            viewerCount = msg.viewerCount;
            updateRoomStats();
        }
    })

    connection.on('like', (msg) => {
        if (typeof msg.totalLikeCount === 'number') {
            likeCount = msg.totalLikeCount;
            updateRoomStats();
        }
        if (window.settings.showLikes === "0") return;
        if (typeof msg.likeCount === 'number') {
            addChatItem('#447dd4', msg, msg.label.replace('{0:user}', '').replace('likes', `${msg.likeCount} likes`))
        }
    })

    connection.on('member', (msg) => {
        if (window.settings.showJoins === "0") return;
        let addDelay = 250;

        let joinMsgDelay = 0;  // Initialize before using

        if (joinMsgDelay > 500) addDelay = 100;
        if (joinMsgDelay > 1000) addDelay = 0;
        joinMsgDelay += addDelay;
        setTimeout(() => {
            joinMsgDelay -= addDelay;
            addChatItem('#21b2c2', msg, 'joined', true);
        }, joinMsgDelay);
    })

    connection.on('chat', (msg) => {
        if (window.settings.showChats === "0") return;
        addChatItem('', msg, msg.comment);
    })

    connection.on('gift', (data) => {
        if (!isPendingStreak(data) && data.diamondCount > 0) {
            diamondsCount += (data.diamondCount * data.repeatCount);
            updateRoomStats();
        }
        if (window.settings.showGifts === "0") return;
        addGiftItem(data);

        // Trigger the "Talk" action and image animations here
        triggerTalk();
    })

    connection.on('social', (data) => {
        if (window.settings.showFollows === "0") return;
        let color = data.displayType.includes('follow') ? '#ff005e' : '#2fb816';
        addChatItem(color, data, data.label.replace('{0:user}', ''));
    })

    connection.on('streamEnd', () => {
        $('#stateText').text('Stream ended.');
        if (window.settings.username) {
            setTimeout(() => {
                connect(window.settings.username);
            }, 30000);
        }
    })

});
