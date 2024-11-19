export { getAvatarUrlFromEmail };

const GRAVATAR_BASEURL = "https://gravatar.com/avatar/"

function calculateEmailHash(text) {
    // TODO: If adding sha256 impl, add check to enable polyfill
    const data = (new TextEncoder()).encode(text);
    const hash = window.crypto.subtle.digest(
        "SHA-256", data
    ).then(hashdata => {
        const hashstr = Array.from(new Uint8Array(hashdata))
                             .map(n=>n.toString(16).padStart(2, "0"))
                             .join("");
        console.log({"email_hash": hashstr});
        return hashstr;
    })

    // This is promise!
    return hash;
}

async function getAvatarUrlFromEmail(email) {
    if (window.crypto.subtle === null) {
        // This should be here on all modern browsers
        // TODO: Replace this with proper polyfill
        return "https://http.cat/images/404.jpg"
    }

    const hash = await calculateEmailHash(email);

    return GRAVATAR_BASEURL + hash + "?s=256&d=retro";
}
