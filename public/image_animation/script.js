
document.addEventListener("DOMContentLoaded", function () {
    // Image element
    const imageElement = document.getElementById("image");

    // Image array
    const images = ["closed.png", "left.png", "right.png"];

    // Start the random clipping
    let intervalId = setInterval(function () {
        const randomIndex = Math.floor(Math.random() * images.length);
        const randomTime = Math.random() * (0.5 - 0.1) + 0.1; // Between 0.1 and 0.5 seconds
        imageElement.src = images[randomIndex];
        setTimeout(() => { }, randomTime * 1000);
    }, 500);

    // Event listener for the "talk" button
    document.getElementById("talk").addEventListener("click", function () {
        clearInterval(intervalId); // Stop the random clipping

        let talkImages = ["close.png", "open.jpg"];
        let count = 0;

        let talkInterval = setInterval(function () {
            if (count >= 6) {
                clearInterval(talkInterval); // Stop the swapping
                intervalId = setInterval(function () { // Restart the random clipping
                    const randomIndex = Math.floor(Math.random() * images.length);
                    const randomTime = Math.random() * (0.5 - 0.1) + 0.1; // Between 0.1 and 0.5 seconds
                    imageElement.src = images[randomIndex];
                    setTimeout(() => { }, randomTime * 1000);
                }, 500);
                return;
            }
            imageElement.src = talkImages[count % 2];
            count++;
        }, 300);
    });
});
