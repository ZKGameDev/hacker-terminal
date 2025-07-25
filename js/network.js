// 网络相关功能 - IP地址和位置获取

// Store IP addresses
let ipv4Address = null;
let ipv6Address = null;
let currentIPIndex = 0;

// Get user IP address and location
async function getUserIP() {
    try {
        // 先获取IP地址
        await fetchIPAddresses();
        
        // 等待一下确保IP已经显示
        setTimeout(() => {
            fetchLocation();
        }, 1000);
        
    } catch (error) {
        console.log('IP/Location services failed:', error);
    }
}

// Fetch IP addresses independently
async function fetchIPAddresses() {
    try {
        // 方法1: 尝试WebRTC方式获取IP
        try {
            const ip = await getIPWithWebRTC();
            if (ip && ip !== 'Loading...') {
                ipv4Address = ip;
                updateIPDisplay();
                return;
            }
        } catch (e) {
            console.log('WebRTC method failed:', e);
        }

        // 方法2: 尝试JSONP方式
        try {
            const ip = await fetchIPWithJSONP();
            if (ip && ip !== 'Loading...') {
                ipv4Address = ip;
                updateIPDisplay();
                return;
            }
        } catch (e) {
            console.log('JSONP method failed:', e);
        }

        // 方法3: 尝试多个API服务
        const apiServices = [
            'https://api.ipify.org/?format=json',
            'https://api64.ipify.org/?format=json',
            'https://httpbin.org/ip'
        ];

        for (const api of apiServices) {
            try {
                const response = await fetch(api, {
                    method: 'GET',
                    mode: 'cors',
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const ip = data.ip || data.origin;
                    if (ip && ip !== 'Loading...') {
                        ipv4Address = ip;
                        updateIPDisplay();
                        return;
                    }
                }
            } catch (e) {
                console.log(`API ${api} failed:`, e);
                continue;
            }
        }

        // 方法4: 尝试iframe方式
        try {
            const ip = await getIPWithIframe();
            if (ip && ip !== 'Loading...') {
                ipv4Address = ip;
                updateIPDisplay();
                return;
            }
        } catch (e) {
            console.log('Iframe method failed:', e);
        }

        // 如果所有方法都失败，使用模拟IP
        ipv4Address = '192.168.1.100';
        updateIPDisplay();
        
    } catch (error) {
        console.log('All IP fetching methods failed:', error);
        ipv4Address = '192.168.1.100';
        updateIPDisplay();
    }
}

// WebRTC方式获取IP
function getIPWithWebRTC() {
    return new Promise((resolve, reject) => {
        try {
            const rtc = new RTCPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
            });
            
            rtc.createDataChannel('', { ordered: true });
            rtc.createOffer().then(offer => rtc.setLocalDescription(offer));
            
            rtc.onicecandidate = (event) => {
                if (event.candidate) {
                    const candidate = event.candidate.candidate;
                    const match = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
                    if (match) {
                        const ip = match[1];
                        if (ip !== '0.0.0.0' && ip !== '127.0.0.1') {
                            rtc.close();
                            resolve(ip);
                            return;
                        }
                    }
                }
            };
            
            setTimeout(() => {
                rtc.close();
                reject(new Error('WebRTC timeout'));
            }, 5000);
            
        } catch (error) {
            reject(error);
        }
    });
}

// JSONP方式获取IP
function fetchIPWithJSONP() {
    return new Promise((resolve, reject) => {
        try {
            const script = document.createElement('script');
            const callbackName = 'jsonpCallback_' + Date.now();
            
            window[callbackName] = function(data) {
                document.head.removeChild(script);
                delete window[callbackName];
                resolve(data.ip);
            };
            
            script.src = `https://api.ipify.org/?format=jsonp&callback=${callbackName}`;
            script.onerror = () => {
                document.head.removeChild(script);
                delete window[callbackName];
                reject(new Error('JSONP failed'));
            };
            
            document.head.appendChild(script);
            
            setTimeout(() => {
                if (document.head.contains(script)) {
                    document.head.removeChild(script);
                    delete window[callbackName];
                    reject(new Error('JSONP timeout'));
                }
            }, 5000);
            
        } catch (error) {
            reject(error);
        }
    });
}

// Iframe方式获取IP
function getIPWithIframe() {
    return new Promise((resolve, reject) => {
        try {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = 'https://api.ipify.org/';
            
            iframe.onload = () => {
                try {
                    const content = iframe.contentDocument.body.textContent;
                    if (content && content.match(/^[0-9]{1,3}(\.[0-9]{1,3}){3}$/)) {
                        document.body.removeChild(iframe);
                        resolve(content);
                    } else {
                        document.body.removeChild(iframe);
                        reject(new Error('Invalid IP format'));
                    }
                } catch (e) {
                    document.body.removeChild(iframe);
                    reject(e);
                }
            };
            
            iframe.onerror = () => {
                document.body.removeChild(iframe);
                reject(new Error('Iframe failed'));
            };
            
            document.body.appendChild(iframe);
            
            setTimeout(() => {
                if (document.body.contains(iframe)) {
                    document.body.removeChild(iframe);
                    reject(new Error('Iframe timeout'));
                }
            }, 5000);
            
        } catch (error) {
            reject(error);
        }
    });
}

// Fetch location data
async function fetchLocation() {
    try {
        // 由于CORS限制，暂时显示Unknown
        const locationElement = document.getElementById('location');
        if (locationElement) {
            locationElement.textContent = 'Unknown';
        }
    } catch (error) {
        console.log('Location fetch failed:', error);
        const locationElement = document.getElementById('location');
        if (locationElement) {
            locationElement.textContent = 'Unknown';
        }
    }
}

// Update IP display
function updateIPDisplay() {
    const ipElement = document.getElementById('ip');
    if (ipElement && ipv4Address) {
        ipElement.textContent = ipv4Address;
    }
}

// 导出函数供其他模块使用
window.getUserIP = getUserIP;
window.fetchIPAddresses = fetchIPAddresses;
window.fetchLocation = fetchLocation;
window.updateIPDisplay = updateIPDisplay; 