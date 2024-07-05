(function AMETHYST_PROTOTYPE() {
  // get the current user's audio stream
  function getAudioStream() {
    return navigator.mediaDevices.getUserMedia({ audio: true });
  }

  // get public key
  function getPublicKey() {
    const base24Chars = '0123456789ABCDEFGHIJKLMN';

    function decimalToBase24(num) {
      let base24 = '';
      while (num > 0) {
        let remainder = num % 24;
        base24 = base24Chars[remainder] + base24;
        num = Math.floor(num / 24);
      }
      return base24 || '0';
    }

    function encrypt(text) {
      let encrypted = '';
      for (let i = 0; i < text.length; i++) {
        let ascii = text.charCodeAt(i);
        let base24 = decimalToBase24(ascii);
        base24 = base24.padStart(2, '0');
        encrypted += base24;
      }
      return encrypted;
    }

    const SECRET = 'logixxDogAssNorelockIsAHeroVC';
    const SECRET_SHIFT = ((getRandomInt(1, 99) << 16) >> 2) % 8096;

    function getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);

      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function caesarShift(str, amount) {
      if (amount < 0)
        return caesarShift(str, amount + 26);

      let output = "";
      for (let i = 0; i < str.length; i++) {
        let c = str[i];
        if (c.match(/[a-z]/i)) {
          const code = str.charCodeAt(i);
          if (code >= 65 && code <= 90) {
            c = String.fromCharCode(((code - 65 + amount) % 26) + 65);
          } else if (code >= 97 && code <= 122) {
            c = String.fromCharCode(((code - 97 + amount) % 26) + 97);
          }
        }
        output += c;
      }
      return output;
    }

    let str;
    function entrypoint() {
      str = caesarShift(SECRET, SECRET_SHIFT);
      str += ';shift=' + SECRET_SHIFT + ';';
      str = encodeURIComponent(str);
      str = encrypt(str);

      return str + '';
    }

    return entrypoint();
  }

  let key;
  function connected() {
    key = getPublicKey();

    socket.emit('handshake', key);
  }

  let _uuid;
  let _available;
  function handshaked([ uuid, servers = [] ]) {
    if (typeof uuid !== 'string')
      throw TypeError('UUID is not a string');
    
    _uuid = uuid;
    _available = servers;
    
    console.log(_uuid, JSON.stringify(_available));
  }
  
  const host = 'localhost:3000';
  const socket = io(host, { transports: ['websocket'] });
  socket.on('connect', connected);
  socket.on('handshaked', handshaked);
})();