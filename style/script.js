const envelope = document.querySelector('.envelope-wrapper');
const heart = document.querySelector('.heart');
const textContainer = document.getElementById('text');
const photoBackground = document.getElementById('photo-background');
const giftButton = document.getElementById('gift-button');

const letterText = `<strong>Dear Thuận Thiên,</strong>
<p style="text-indent: 15px; margin-top: 10px;">
    Hali cô gái xinh đẹp của anh. Mặc dù hôm nay ở Hàn ngày 8/3 sẽ chỉ là một ngày bình thường thôi, nhưng mà ở Việt Nam thì đây sẽ là một ngày mà cô gái xinh đẹp như ththieen của béo sẽ được yêu thương nhiều hơn và đón nhận lấy những bông hoa xinh tươi nhất.
<p style="text-indent: 15px; margin-top: 10px;">
    Vì thế đây sẽ là chuẩn bị nhỏ béo muốn dành cho em. Chúc mỹ nữ đáng yêu một ngày xinh đẹp, đáng yêu và xinh tươi hơn những đóa hoa.
</p>
<p style="text-indent: 15px; margin-top: 10px;">
    Từ ngày embe sang Hàn những bức ảnh này chính là sự đồng hành và năng lượng mỗi ngày của anh. Mỗi ngày anh đều ngắm nhìn từng chút, từng chút. Ngắm nhìn từ sự xinh đẹp dịu dàng, thơ mộng đến cả sự đáng yêu thiên s2 hum ai s1,... 
</p>
<p style="text-indent: 15px; margin-top: 10px;">
    Trước đây, anh là một người siêu lười chụp hình. Nhưng rồi giờ đây, hơn ai hết anh lại yêu thích việc chụp ảnh đến vô cùng. Vì anh đã hiểu được ỹ nghĩa của nó, không chỉ để ngắm nhìn những khoảnh khắc đẹp mà còn gắn liền với cả những kỷ niệm gắn bó nhất. Thế nên là anh mong rằng mỗi ngày anh sẽ có thêm nhiều tấm ảnh đáng iuu nhất và xinh đẹp nhất của Thiên in my heart & collection.
</p>
    <p style="text-indent: 15px; margin-top: 10px;">
    Cảm ơn em vì đã đến bên anh và trở thành điều tuyệt vời nhất trong cuộc sống của anh. Sự dịu dàng, lòng tốt, sự mạnh mẽ và luôn quan tâm của em khiến anh cảm thấy may mắn và hạnh phúc hơn mỗi ngày. Cảm ơn em vì luôn ở bên anh, ủng hộ anh vô điều kiện, dù là những lúc vui vẻ hay những khi anh gặp khó khăn.
</p>
</p>
<p style="text-indent: 15px; margin-top: 10px;">
    Có Thiên trong cuộc đời, Phú học được cách yêu thương, kiên nhẫn và trân trọng từng khoảnh khắc nhỏ bé. Em không chỉ là người anh yêu, mà còn là chỗ dựa, là nguồn động viên, là lý do để anh cố gắng trở thành người tốt hơn mỗi ngày.
</p>
<p style="text-indent: 15px; margin-top: 10px;">
    Anh yêu em nhiều hơn những gì lời nói có thể diễn tả — không chỉ hôm nay, mà là mỗi ngày, và sẽ luôn như vậy mãi mãi.
</p>
<p style="text-indent: 15px; margin-top: 10px;">
    Trời lạnh lắm công chúa của anh nhớ luôn giữ ấm nha! Thương em.
</p>
<p class="love" style="text-align: center; font-weight: bold; margin-block: 15px;">Yêu thiên, pu beo</p>`;

let typingStarted = false;
let waveInterval = null;

function spawnWave() {
    const oldPhotos = document.querySelectorAll('.random-photo');
    oldPhotos.forEach(p => {
        p.classList.remove('show');
        setTimeout(() => p.remove(), 1200);
    });

    const isMobile = window.innerWidth <= 600;
    const rows = isMobile ? 4 : 3;
    const cols = isMobile ? 3 : 4;
    const totalPhotos = 12;

    let positions = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            positions.push({ row: r, col: c });
        }
    }
    positions.sort(() => Math.random() - 0.5);

    for (let i = 0; i < totalPhotos; i++) {
        const img = document.createElement('img');
        img.src = `./style/img/Anh (${(i % 12) + 1}).jpg`;
        img.classList.add('random-photo');

        const pos = positions[i];
        const cellWidth = 100 / cols;
        const cellHeight = 100 / rows;

        const jitterX = (Math.random() - 0.5) * (cellWidth * 0.6);
        const jitterY = (Math.random() - 0.5) * (cellHeight * 0.6);

        const left = (pos.col * cellWidth) + (cellWidth / 2) + jitterX;
        const top = (pos.row * cellHeight) + (cellHeight / 2) + jitterY;

        const rotation = (Math.random() - 0.5) * 30;

        img.style.left = `${left}%`;
        img.style.top = `${top}%`;
        img.style.setProperty('--rotation', `${rotation}deg`);
        img.style.transitionDelay = `${Math.random() * 1}s`;

        photoBackground.appendChild(img);

        setTimeout(() => {
            img.classList.add('show');
        }, 100);
    }
}

// Chỉ lắng nghe sự kiện click trên heart
heart.addEventListener('click', () => {
    envelope.classList.toggle('flap');
    envelope.classList.toggle('open');

    if (envelope.classList.contains('open')) {
        const music = document.getElementById('bg-music');
        if (music) {
            music.play().catch(e => console.log("Audio play failed:", e));
        }
        spawnWave();
        waveInterval = setInterval(spawnWave, 7000);

        if (!typingStarted) {
            typingStarted = true;
            setTimeout(() => {
                startTyping();
            }, 2000);
        }
    } else {
        clearInterval(waveInterval);
        const existingPhotos = document.querySelectorAll('.random-photo');
        existingPhotos.forEach(p => {
            p.classList.remove('show');
            setTimeout(() => p.remove(), 1200);
        });
    }
});

function startTyping() {
    let i = 0;
    textContainer.innerHTML = '';

    function type() {
        if (i < letterText.length) {
            if (letterText.charAt(i) === '<') {
                let tagEnd = letterText.indexOf('>', i);
                if (tagEnd !== -1) {
                    textContainer.innerHTML += letterText.substring(i, tagEnd + 1);
                    i = tagEnd + 1;
                }
            } else {
                textContainer.innerHTML += letterText.charAt(i);
                i++;
            }

            const letter = document.querySelector('.letter');
            letter.scrollTop = letter.scrollHeight;

            setTimeout(type, 50);
        } else {
            document.body.classList.add('typing-done');
            setTimeout(() => {
                giftButton.classList.add('show');
                const letter = document.querySelector('.letter');
                letter.scrollTop = letter.scrollHeight;
            }, 500);
        }
    }

    type();
}

giftButton.addEventListener('click', () => {
    if (typeof window.initUniverse === 'function') {
        window.initUniverse();
    }
});

