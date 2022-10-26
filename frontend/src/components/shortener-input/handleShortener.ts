import confetti from 'canvas-confetti';

function confettiAnimate() {
  confetti({
    particleCount: 120,
    spread: 100,
    origin: {
      x: 0,
      y: 0.8,
    },
  });
  confetti({
    particleCount: 120,
    spread: 100,
    origin: {
      x: 1,
      y: 0.8,
    },
  });
}

export function copyUrl() {
  const result = document.querySelector('#result #text');
  navigator.clipboard.writeText(result!.textContent!);
}

/**
 * Returns the shorter link from the server.
 * @param {String} originalUrl - The original url we want to shorten.
 */
const getShortenUrl = async (originalUrl: string) => {
  let result;
  try {
    result = await fetch(`${process.env.API_DOMAIN}/api/v1/shortener`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originalUrl }),
    });
  } catch (err) {
    return null;
  }
  return result.json();
};

export function openLink() {
  const text = document.querySelector('#result #text')!.textContent;
  window.open(text!, '_blank');
}

export async function handleShortener({ state }: any) {
  const result = document.getElementById('result');
  const loader = document.getElementById('loading');
  const urlInput = normalizeUrl(state.inputValue);
  loader!.classList.replace('hidden', 'block');
  result!.classList.replace('block', 'hidden');

  let validUrl = urlInput;

  if (!RegExp('^https://|^http://').test(urlInput) && urlInput) {
    validUrl = `https://${urlInput}`;
  }

  const { newUrl } = await getShortenUrl(validUrl);

  // Remove the loader from the screen
  loader!.classList.replace('block', 'hidden');
  result!.classList.replace('hidden', 'block');

  state.inputValue = '';
  if (!newUrl) {
    result!.querySelector('#error')!.textContent = 'This url is invalid..';
    result!.querySelector('#text')!.textContent = '';
    result!.querySelector('#action')!.classList.replace('block', 'hidden');
    return;
  }

  result!.querySelector('#error')!.textContent = '';
  result!.querySelector('#text')!.textContent = window.location.href.split('#')[0] + newUrl;
  result!.querySelector('#action')!.classList.replace('hidden', 'block');

  copyUrl();
  confettiAnimate();
}

/**
 * Normalize input url
 *  - add protocol 'http' if missing.
 *  - correct protocol http/https if mistyped one character.
 * @param {String} url
 * @returns {String} Normalized url
 */
const normalizeUrl = (url: string): string => {
  const regexBadPrefix = new RegExp(/^(:\/*|\/+|https:\/*)/); // Check if starts with  ':', '/' and 'https:example.com' etc.
  const regexBadPrefixHttp = new RegExp(/^http:\/*/); // Check if 'http:example.com', 'http:/example.com' etc.
  const regexProtocolExists = new RegExp(/^(.+:\/\/|[^a-zA-Z])/); // Check if starts with '*://' or special chars.
  const regexMistypedHttp = new RegExp(
    /^([^hH][tT][tT][pP]|[hH][^tT][tT][pP]|[hH][tT][^tT][pP]|[hH][tT][tT][^pP])/
  );

  url = url
    .replace(regexMistypedHttp, 'http')
    .replace(regexBadPrefix, 'https://')
    .replace(regexBadPrefixHttp, 'http://');

  return (regexProtocolExists.test(url) ? '' : 'https://') + url;
};
