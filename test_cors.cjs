const fetch = require('node-fetch');

async function test() {
  try {
    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: "ExponentPushToken[rDbAGLI2K8h-JNpR3cspuI]",
        title: "Test",
        body: "Test body"
      })
    });
    console.log(res.status);
    console.log(await res.text());
  } catch (e) {
    console.error(e);
  }
}

test();
