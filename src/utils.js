const throttle = (func, limit) => {
  let lastFunc
  let lastRan
  return function () {
    const context = this
    const args = arguments
    if (!lastRan) {
      func.apply(context, args)
      lastRan = Date.now()
    } else {
      clearTimeout(lastFunc)
      lastFunc = setTimeout(function () {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args)
          lastRan = Date.now()
        }
      }, limit - (Date.now() - lastRan))
    }
  }
}

function vaildPublic(str) {
  const SECRET = 'logixxDogAssNorelockIsAHeroVC';
  const base24Chars = '0123456789ABCDEFGHIJKLMN';

  function base24ToDecimal(base24) {
    let num = 0;
    for (let i = 0; i < base24.length; i++) {
      num = num * 24 + base24Chars.indexOf(base24[i]);
    }
    return num;
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

  function decrypt(encrypted) {
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i += 2) {
      let base24 = encrypted.substring(i, i + 2);
      let ascii = base24ToDecimal(base24);
      decrypted += String.fromCharCode(ascii);
    }
    return decrypted;
  }

  const b24 = decodeURIComponent(decrypt(str));

  try {
    let [encryptedSecret, shift] = b24.split(';shift=');
    if (shift.endsWith(';')) {
      shift = shift.replace(';', '');
      shift = Number(shift);
    }

    const decrypted = caesarShift(encryptedSecret, -shift);
    if (decrypted === SECRET)
      return true;

    return false;
  } catch (e) {
    return false;
  }
}

module.exports = {
  throttle,
  vaildPublic,
};