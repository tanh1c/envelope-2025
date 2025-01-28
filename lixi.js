// Mảng chứa số tiền trong mỗi bao lì xì
let envelopeAmounts = [];

// Mảng chứa các mệnh giá tiền và đường dẫn ảnh tương ứng
const moneyDenominations = [
    { value: 500000, image: 'images/500k.jpg' },
    { value: 200000, image: 'images/200k.jpg' },
    { value: 100000, image: 'images/100k.jpg' },
    { value: 50000, image: 'images/50k.jpg' },
    { value: 20000, image: 'images/20k.jpg' },
    { value: 10000, image: 'images/10k.jpg' },
];

// Hàm tạo số tiền ngẫu nhiên cho các bao lì xì
function generateRandomAmounts(totalMoney, count, maxDenom, minDenom) {
    let amounts = new Array(count).fill(0);
    let remaining = totalMoney;
    
    // Lọc các mệnh giá phù hợp với giới hạn
    const denominations = [500000, 200000, 100000, 50000, 20000, 10000]
        .filter(d => d <= maxDenom && d >= minDenom)
        .sort((a, b) => b - a);
    
    if (denominations.length === 0) {
        throw new Error('Không có mệnh giá phù hợp với giới hạn đã chọn');
    }

    // Đảm bảo mỗi bao có ít nhất mệnh giá nhỏ nhất
    amounts = amounts.fill(denominations[denominations.length - 1]);
    remaining -= denominations[denominations.length - 1] * count;

    // Thử phân phối mệnh giá cao trước
    if (maxDenom >= 500000 && remaining >= 500000) {
        const bigMoneyCount = Math.min(
            Math.floor(remaining / 500000),
            Math.floor(count / 3) // Giới hạn số lượng bao có mệnh giá cao
        );
        
        if (bigMoneyCount > 0) {
            // Chọn ngẫu nhiên các vị trí để đặt mệnh giá cao
            const positions = Array.from({length: count}, (_, i) => i)
                .sort(() => Math.random() - 0.5)
                .slice(0, bigMoneyCount);
            
            positions.forEach(pos => {
                amounts[pos] = 500000;
                remaining -= (500000 - denominations[denominations.length - 1]);
            });
        }
    }

    // Phân phối số tiền còn lại
    let attempts = 0;
    while (remaining > 0 && attempts < 1000) {
        const randomIndex = Math.floor(Math.random() * count);
        let currentAmount = amounts[randomIndex];
        
        // Nếu bao này đã có mệnh giá cao, bỏ qua
        if (currentAmount >= 500000) {
            attempts++;
            continue;
        }
        
        // Tìm mệnh giá phù hợp để thêm vào
        for (const denom of denominations) {
            if (remaining >= denom && currentAmount + denom <= maxDenom) {
                // Nếu có thể, thay thế mệnh giá hiện tại bằng mệnh giá lớn hơn
                if (currentAmount < denom) {
                    remaining += currentAmount;
                    amounts[randomIndex] = denom;
                    remaining -= denom;
                    break;
                }
                // Nếu không, thêm vào mệnh giá hiện tại
                else {
                    amounts[randomIndex] += denom;
                    remaining -= denom;
                    break;
                }
            }
        }
        attempts++;
    }

    return amounts.sort(() => Math.random() - 0.5);
}

// Hàm tìm ảnh tiền phù hợp nhất
function findBestMoneyImage(amount) {
    const denom = moneyDenominations.find(d => d.value === amount);
    return denom ? denom.image : moneyDenominations[moneyDenominations.length - 1].image;
}

// Xử lý sự kiện mở bao lì xì
function openEnvelope(event) {
    const envelope = event.target;
    
    if (envelope.classList.contains('opened')) {
        return;
    }
    
    const index = parseInt(envelope.dataset.index);
    const amount = envelopeAmounts[index];
    
    if (isNaN(amount)) {
        console.error('Lỗi: Không tìm thấy số tiền cho bao lì xì này');
        return;
    }
    
    const modal = document.getElementById('moneyModal');
    const moneyContainer = document.querySelector('.money-amount');
    const moneyText = document.getElementById('moneyText');
    
    // Xóa nội dung cũ
    moneyContainer.innerHTML = '';
    
    // Thêm các ảnh tiền
    const images = findMoneyImages(amount);
    images.forEach(imageSrc => {
        const img = document.createElement('img');
        img.src = imageSrc;
        img.alt = 'Tiền';
        img.className = 'money-image';
        moneyContainer.appendChild(img);
    });
    
    // Thêm text hiển thị tổng tiền
    const p = document.createElement('p');
    p.id = 'moneyText';
    p.textContent = new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
    }).format(amount);
    moneyContainer.appendChild(p);
    
    envelope.classList.add('opening');
    setTimeout(() => {
        envelope.classList.add('opened');
        modal.style.display = 'block';
    }, 500);
}

// Thêm CSS mới vào file style.css
const style = document.createElement('style');
style.textContent = `
    .envelope {
        transition: all 0.5s ease;
        position: relative;
    }
    
    .envelope.opening {
        transform: scale(1.1) rotate(10deg);
        opacity: 0.7;
    }
    
    .envelope.opened {
        transform: scale(0.9);
        opacity: 0.3;
        pointer-events: none;
    }
    
    .envelope.opened::after {
        content: '✓';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 40px;
        color: #ff0000;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
    
    .money-amount {
        animation: moneyAppear 0.5s ease;
    }
    
    @keyframes moneyAppear {
        from {
            transform: scale(0.5);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Thêm hàm kiểm tra mệnh giá hợp lệ
function isValidDenomination(amount) {
    // Kiểm tra xem số tiền có thể tạo được từ tổ hợp các mệnh giá không
    let remainingAmount = amount;
    const denominations = [500000, 200000, 100000, 50000, 20000, 10000];
    
    while (remainingAmount > 0) {
        let found = false;
        for (const denom of denominations) {
            if (remainingAmount >= denom) {
                remainingAmount -= denom;
                found = true;
                break;
            }
        }
        if (!found) return false;
    }
    return true;
}

// Thêm hàm kiểm tra tổng tiền
function isValidTotalMoney(totalMoney, count, maxDenom, minDenom) {
    if (totalMoney % minDenom !== 0) return false;
    if (totalMoney < count * minDenom) return false;
    if (totalMoney / count > maxDenom) return false;
    return true;
}

// Thêm hàm kiểm tra phân phối tiền
function checkDistribution(amounts) {
    console.log("Phân phối tiền trong các bao:");
    amounts.forEach((amount, index) => {
        console.log(`Bao ${index + 1}: ${new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
        }).format(amount)}`);
    });
    
    const total = amounts.reduce((sum, amount) => sum + amount, 0);
    console.log(`Tổng tiền: ${new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
    }).format(total)}`);
}

// Thêm hàm tạo nút quay lại
function createBackButton() {
    const backButton = document.createElement('button');
    backButton.className = 'back-to-settings-btn';
    backButton.textContent = 'Quay Lại Cài Đặt';
    backButton.onclick = resetToForm;
    return backButton;
}

// Cập nhật hàm tạo bao lì xì
document.getElementById('generateEnvelopes').addEventListener('click', () => {
    const totalMoney = parseInt(document.getElementById('totalMoney').value);
    const envelopeCount = parseInt(document.getElementById('envelopeCount').value);
    const maxDenom = parseInt(document.getElementById('maxDenom').value);
    const minDenom = parseInt(document.getElementById('minDenom').value);
    
    // Kiểm tra mệnh giá hợp lệ
    if (maxDenom < minDenom) {
        alert('Mệnh giá cao nhất phải lớn hơn mệnh giá thấp nhất');
        return;
    }
    
    if (!isValidTotalMoney(totalMoney, envelopeCount, maxDenom, minDenom)) {
        alert(`Vui lòng nhập số tiền hợp lệ:
- Phải là bội số của ${minDenom.toLocaleString('vi-VN')} VNĐ
- Mỗi bao ít nhất ${minDenom.toLocaleString('vi-VN')} VNĐ
- Mỗi bao không quá ${maxDenom.toLocaleString('vi-VN')} VNĐ`);
        return;
    }

    try {
        let attempts = 0;
        let validDistribution = false;
        
        while (!validDistribution && attempts < 100) {
            const tempAmounts = generateRandomAmounts(totalMoney, envelopeCount, maxDenom, minDenom);
            validDistribution = tempAmounts.every(amount => isValidDenomination(amount));
            if (validDistribution) {
                envelopeAmounts = tempAmounts;
            }
            attempts++;
        }

        if (!validDistribution) {
            throw new Error('Không thể phân phối số tiền này thành các mệnh giá hợp lệ');
        }

        checkDistribution(envelopeAmounts);
        
        // Ẩn form và hiển thị bao lì xì
        document.querySelector('.lucky-money-form').classList.add('hidden');
        const container = document.getElementById('envelopesContainer');
        container.innerHTML = '';
        
        // Thêm nút quay lại vào đầu container
        const backButton = createBackButton();
        container.appendChild(backButton);
        
        // Tạo các bao lì xì
        envelopeAmounts.forEach((amount, index) => {
            const envelope = document.createElement('div');
            envelope.className = 'envelope';
            envelope.dataset.index = index;
            envelope.style.animationDelay = `${index * 0.1}s`;
            envelope.addEventListener('click', openEnvelope);
            container.appendChild(envelope);
        });

        setTimeout(() => {
            container.classList.add('visible');
        }, 100);
        
    } catch (error) {
        alert(error.message + '. Vui lòng thử lại với số tiền khác hoặc điều chỉnh mệnh giá.');
    }
});

// Thêm event listener để tự động điều chỉnh mệnh giá
document.getElementById('maxDenom').addEventListener('change', function() {
    const minSelect = document.getElementById('minDenom');
    const maxValue = parseInt(this.value);
    
    // Cập nhật các option cho mệnh giá thấp nhất
    Array.from(minSelect.options).forEach(option => {
        const value = parseInt(option.value);
        option.disabled = value > maxValue;
    });
    
    // Nếu giá trị hiện tại của minDenom lớn hơn maxDenom, điều chỉnh xuống
    if (parseInt(minSelect.value) > maxValue) {
        minSelect.value = maxValue;
    }
});

// Thêm nút Reset để quay lại form
function resetToForm() {
    const container = document.getElementById('envelopesContainer');
    const form = document.querySelector('.lucky-money-form');
    
    container.classList.remove('visible');
    setTimeout(() => {
        container.innerHTML = '';
        form.classList.remove('hidden');
    }, 500);
}

// Cập nhật hàm đóng modal
document.querySelector('.close').addEventListener('click', () => {
    const modal = document.getElementById('moneyModal');
    modal.style.display = 'none';
    
    // Kiểm tra xem tất cả bao lì xì đã được mở chưa
    const allEnvelopes = document.querySelectorAll('.envelope');
    const openedEnvelopes = document.querySelectorAll('.envelope.opened');
    
    if (allEnvelopes.length === openedEnvelopes.length) {
        // Nếu đã mở hết, tự động reset về form sau 1 giây
        setTimeout(resetToForm, 1000);
    }
});

// Thêm nút Reset vào form
const resetButton = document.createElement('a');
resetButton.href = '#';
resetButton.className = 'back-button';
resetButton.textContent = 'Quay Lại Form';
resetButton.style.display = 'none';
resetButton.onclick = (e) => {
    e.preventDefault();
    resetToForm();
};
document.body.appendChild(resetButton);

// Hiển thị nút Reset khi hiện bao lì xì
document.getElementById('generateEnvelopes').addEventListener('click', () => {
    const totalMoney = parseInt(document.getElementById('totalMoney').value);
    const envelopeCount = parseInt(document.getElementById('envelopeCount').value);
    const maxDenom = parseInt(document.getElementById('maxDenom').value);
    const minDenom = parseInt(document.getElementById('minDenom').value);
    if (!isNaN(totalMoney) && !isNaN(envelopeCount) && totalMoney >= envelopeCount * minDenom && totalMoney <= envelopeCount * maxDenom) {
        resetButton.style.display = 'block';
    }
});

// Sửa lại hàm tìm ảnh tiền và tạo HTML cho nhiều mệnh giá
function findMoneyImages(amount) {
    const denominations = [500000, 200000, 100000, 50000, 20000, 10000];
    let remainingAmount = amount;
    let result = [];
    
    // Tìm tổ hợp các mệnh giá
    while (remainingAmount > 0) {
        for (const denom of denominations) {
            if (remainingAmount >= denom) {
                result.push(denom);
                remainingAmount -= denom;
                break;
            }
        }
    }
    
    return result.map(denom => {
        const moneyInfo = moneyDenominations.find(d => d.value === denom);
        return moneyInfo.image;
    });
} 